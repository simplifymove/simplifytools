import { randomUUID } from 'crypto';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { Prisma } from '@prisma/client';
import { authOptions } from '@/lib/auth/config';
import { prisma } from '@/lib/prisma';
import { AI_STUDIO_DOCUMENT_CREDITS } from '@/lib/ai-studio/estimate';
import { findAiStudioUserByEmail } from '@/lib/ai-studio/user';
import {
  AiStudioInsufficientCreditsError,
  captureCredits,
  getOrCreateWallet,
  releaseCredits,
  reserveCredits,
  serializeAiStudioWallet,
} from '@/lib/ai-studio/wallet';
import {
  addProviderUsage,
  createProviderUsageAccumulator,
  getAggregatedModel,
  getErrorStatus,
  primaryAiStudioModel,
  runAiStudioOpenRouterPrompt,
  serializeProviderResponseIds,
} from '@/lib/ai-studio/content-generation';

interface DocumentMakerRequest {
  topic?: string;
  documentType?: string;
  tone?: string;
  length?: string;
}

const documentTypes = new Set([
  'report',
  'proposal',
  'business plan',
  'resume',
  'letter',
  'blog article',
]);
const tones = new Set(['professional', 'simple', 'formal', 'marketing']);
const lengths = new Set(['short', 'medium', 'detailed']);

function normalizeOption(value: unknown, allowed: Set<string>, fallback: string) {
  const normalized = typeof value === 'string' ? value.trim().toLowerCase() : '';

  return allowed.has(normalized) ? normalized : fallback;
}

function buildDocumentPrompt(input: {
  topic: string;
  documentType: string;
  tone: string;
  length: string;
}) {
  const typeGuidance: Record<string, string> = {
    report:
      'Use executive summary, findings, evidence, key insights, recommendations, and conclusion.',
    proposal:
      'Use problem, proposed solution, scope of work, timeline, deliverables, pricing or next steps, and decision criteria.',
    'business plan':
      'Use market overview, product or service, customer segments, go-to-market strategy, operations, risks, and financial assumptions.',
    resume:
      'Use profile summary, core skills, professional experience, achievements, education, and optional certifications.',
    letter:
      'Use formal letter structure with subject, greeting, concise body sections, requested action, and closing.',
    'blog article':
      'Use compelling title, introduction, scannable sections, practical examples, key takeaways, and conclusion.',
  };

  return [
    'Create a polished, professional SaaS-quality document for SimplifyConvert AI Studio.',
    'Return only valid JSON. Do not include markdown fences, commentary, or trailing text.',
    'Use this exact JSON shape:',
    JSON.stringify({
      title: 'string',
      subtitle: 'string',
      executiveSummary: 'string',
      sections: [
        {
          heading: 'string',
          paragraphs: ['string'],
          bulletPoints: ['string'],
          tables: [
            {
              title: 'string',
              columns: ['string'],
              rows: [['string or number']],
            },
          ],
        },
      ],
      keyInsights: ['string'],
      recommendations: ['string'],
      conclusion: 'string',
    }),
    'Rules:',
    '- Make the output boardroom-ready, specific, and useful without filler.',
    '- Use short paragraphs, strong headings, and concrete details.',
    '- Include tables where they improve clarity, comparison, timelines, pricing, assumptions, or metrics.',
    '- Include 3-6 keyInsights and 3-6 recommendations unless the document type makes recommendations inappropriate.',
    '- Avoid generic claims. Infer realistic structure from the user brief.',
    `Document type guidance: ${typeGuidance[input.documentType] || typeGuidance.report}`,
    `Document type: ${input.documentType}`,
    `Tone: ${input.tone}`,
    `Length: ${input.length}`,
    `Topic or brief: ${input.topic}`,
  ].join('\n');
}

function extractJsonObject(content: string) {
  const trimmed = content.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced?.[1]?.trim() || trimmed;
  const start = candidate.indexOf('{');
  const end = candidate.lastIndexOf('}');

  if (start === -1 || end === -1 || end <= start) {
    throw new Error('AI_JSON_PARSE_FAILED');
  }

  return candidate.slice(start, end + 1);
}

function parseDocumentContent(content: string) {
  const parsed = JSON.parse(extractJsonObject(content)) as {
    title?: unknown;
    subtitle?: unknown;
    executiveSummary?: unknown;
    sections?: Array<{
      heading?: unknown;
      paragraphs?: unknown;
      bulletPoints?: unknown;
      bullets?: unknown;
      tables?: unknown;
    }>;
    keyInsights?: unknown;
    recommendations?: unknown;
    conclusion?: unknown;
  };

  const sections = Array.isArray(parsed.sections)
    ? parsed.sections.map((section) => ({
        heading: String(section.heading || 'Section'),
        paragraphs: Array.isArray(section.paragraphs)
          ? section.paragraphs.map((item) => String(item)).filter(Boolean)
          : [],
        bulletPoints: Array.isArray(section.bulletPoints)
          ? section.bulletPoints.map((item) => String(item)).filter(Boolean)
          : Array.isArray(section.bullets)
            ? section.bullets.map((item) => String(item)).filter(Boolean)
            : [],
        tables: Array.isArray(section.tables)
          ? section.tables.map((table) => {
              const tableInput = table as {
                title?: unknown;
                columns?: unknown;
                rows?: unknown;
              };
              const columns = Array.isArray(tableInput.columns)
                ? tableInput.columns.map((item) => String(item)).filter(Boolean)
                : [];
              const rows = Array.isArray(tableInput.rows)
                ? tableInput.rows
                    .filter((row): row is unknown[] => Array.isArray(row))
                    .map((row) => row.map((cell) => (typeof cell === 'number' ? cell : String(cell ?? ''))))
                : [];

              return {
                title: String(tableInput.title || 'Table'),
                columns,
                rows,
              };
            }).filter((table) => table.columns.length > 0 && table.rows.length > 0)
          : [],
      }))
    : [];

  return {
    title: String(parsed.title || 'AI Studio Document'),
    subtitle: String(parsed.subtitle || ''),
    executiveSummary: String(parsed.executiveSummary || ''),
    sections: sections.length > 0
      ? sections
      : [{ heading: 'Overview', paragraphs: [content], bulletPoints: [], tables: [] }],
    keyInsights: Array.isArray(parsed.keyInsights)
      ? parsed.keyInsights.map((item) => String(item)).filter(Boolean)
      : [],
    recommendations: Array.isArray(parsed.recommendations)
      ? parsed.recommendations.map((item) => String(item)).filter(Boolean)
      : [],
    conclusion: String(parsed.conclusion || ''),
  };
}

async function logUsage(input: {
  userId: string;
  requestId: string;
  topic: string;
  status: string;
  actualCredits?: number;
  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
  providerCostUsd?: Prisma.Decimal | null;
  providerResponseId?: string;
  model?: string;
  errorCode?: string;
}) {
  await prisma.aiStudioUsageLog.create({
    data: {
      userId: input.userId,
      requestId: input.requestId,
      toolType: 'document',
      topic: input.topic,
      slideCount: 1,
      model: input.model ?? primaryAiStudioModel,
      provider: 'openrouter',
      status: input.status,
      estimatedCredits: AI_STUDIO_DOCUMENT_CREDITS,
      reservedCredits: input.status === 'success' ? AI_STUDIO_DOCUMENT_CREDITS : 0,
      actualCredits: input.actualCredits,
      inputTokens: input.inputTokens,
      outputTokens: input.outputTokens,
      totalTokens: input.totalTokens,
      providerCostUsd: input.providerCostUsd,
      providerResponseId: input.providerResponseId,
      errorCode: input.errorCode,
      completedAt: new Date(),
    },
  });
}

export async function POST(request: Request) {
  const requestId = randomUUID();
  const providerUsage = createProviderUsageAccumulator();
  let reserved = false;
  let userId = '';
  let topic = '';

  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Sign in with a premium-enabled account to use AI Studio.' }, { status: 401 });
    }

    const user = await findAiStudioUserByEmail(session.user.email);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    userId = user.id;
    const body = (await request.json()) as DocumentMakerRequest;
    topic = body.topic?.trim() || '';
    const documentType = normalizeOption(body.documentType, documentTypes, 'report');
    const tone = normalizeOption(body.tone, tones, 'professional');
    const length = normalizeOption(body.length, lengths, 'medium');

    if (!topic) {
      return NextResponse.json({ error: 'Describe the document you want to create.' }, { status: 400 });
    }

    const wallet = await getOrCreateWallet(userId);

    if (wallet.balanceCredits.toNumber() < AI_STUDIO_DOCUMENT_CREDITS) {
      await logUsage({
        userId,
        requestId,
        topic,
        status: 'failed',
        errorCode: 'INSUFFICIENT_CREDITS',
      });

      return NextResponse.json(
        {
          error: 'Not enough AI Studio credits for this document.',
          estimatedCredits: AI_STUDIO_DOCUMENT_CREDITS,
          wallet: serializeAiStudioWallet(wallet),
        },
        { status: 402 },
      );
    }

    await reserveCredits(userId, AI_STUDIO_DOCUMENT_CREDITS, {
      referenceType: 'ai_studio_document',
      referenceId: requestId,
      description: 'Reserved credits for AI Studio document generation',
      metadata: { topic, documentType, tone, length },
    });
    reserved = true;

    const result = await runAiStudioOpenRouterPrompt(
      buildDocumentPrompt({ topic, documentType, tone, length }),
    );
    addProviderUsage(providerUsage, result.usage);
    const document = parseDocumentContent(result.content);

    const updatedWallet = await captureCredits(userId, AI_STUDIO_DOCUMENT_CREDITS, {
      referenceType: 'ai_studio_document',
      referenceId: requestId,
      description: 'Captured credits for AI Studio document generation',
      metadata: { topic, documentType, tone, length },
    });
    reserved = false;

    await logUsage({
      userId,
      requestId,
      topic,
      status: 'success',
      actualCredits: AI_STUDIO_DOCUMENT_CREDITS,
      inputTokens: providerUsage.inputTokens || undefined,
      outputTokens: providerUsage.outputTokens || undefined,
      totalTokens: providerUsage.totalTokens || undefined,
      providerCostUsd: providerUsage.hasUnknownCost ? null : providerUsage.estimatedCostUsd,
      providerResponseId: serializeProviderResponseIds(providerUsage.responseIds),
      model: getAggregatedModel(providerUsage),
    });

    return NextResponse.json({
      document,
      creditsUsed: AI_STUDIO_DOCUMENT_CREDITS,
      wallet: serializeAiStudioWallet(updatedWallet),
    });
  } catch (error) {
    console.error('[ai-studio-document-maker] Generation failed:', error);

    let wallet = null;

    if (reserved && userId) {
      try {
        wallet = await releaseCredits(userId, AI_STUDIO_DOCUMENT_CREDITS, {
          referenceType: 'ai_studio_document',
          referenceId: requestId,
          description: 'Released reserved credits after failed document generation',
          metadata: { topic },
        });
      } catch (releaseError) {
        console.error('[ai-studio-document-maker] Failed to release reserved credits:', releaseError);
      }
    }

    if (userId) {
      await logUsage({
        userId,
        requestId,
        topic,
        status: 'failed',
        inputTokens: providerUsage.inputTokens || undefined,
        outputTokens: providerUsage.outputTokens || undefined,
        totalTokens: providerUsage.totalTokens || undefined,
        providerCostUsd: providerUsage.hasUnknownCost ? null : providerUsage.estimatedCostUsd,
        providerResponseId: serializeProviderResponseIds(providerUsage.responseIds),
        model: getAggregatedModel(providerUsage),
        errorCode:
          error instanceof AiStudioInsufficientCreditsError
            ? 'INSUFFICIENT_CREDITS'
            : error instanceof Error && error.message === 'OPENROUTER_API_KEY_MISSING'
              ? 'AI_SERVICE_UNAVAILABLE'
              : getErrorStatus(error) === 402
                ? 'AI_SERVICE_UNAVAILABLE'
                : 'GENERATION_FAILED',
      }).catch((logError) => {
        console.error('[ai-studio-document-maker] Failed to write usage log:', logError);
      });
    }

    return NextResponse.json(
      {
        error: 'AI Studio could not generate this document right now. Please try again later.',
        wallet: wallet ? serializeAiStudioWallet(wallet) : undefined,
      },
      { status: 503 },
    );
  }
}
