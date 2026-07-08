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
const agentTimeoutMs = Number(process.env.AI_STUDIO_AGENT_TIMEOUT_MS || 45000);
const fallbackTimeoutMs = Number(process.env.AI_STUDIO_FALLBACK_TIMEOUT_MS || 70000);

const documentBlueprints: Record<string, {
  label: string;
  sections: string[];
  richElements: string[];
  writingGuidance: string;
}> = {
  proposal: {
    label: 'Business Proposal',
    sections: [
      'Executive Summary',
      'Problem',
      'Proposed Solution',
      'Scope',
      'Timeline',
      'Deliverables',
      'Pricing Assumptions',
      'Benefits',
      'Risks',
      'Conclusion',
    ],
    richElements: ['timeline table', 'scope checklist', 'deliverables table', 'risk and mitigation table', 'action items'],
    writingGuidance: 'Write like a consultant selling a practical, credible engagement. Be specific about outcomes, tradeoffs, implementation path, and decision criteria.',
  },
  'business plan': {
    label: 'Business Plan',
    sections: [
      'Executive Summary',
      'Market Analysis',
      'Competitor Analysis',
      'SWOT',
      'Business Model',
      'Marketing Strategy',
      'Financial Projections',
      'Risks',
      'Conclusion',
    ],
    richElements: ['market sizing assumptions table', 'competitor comparison', 'SWOT table', 'go-to-market checklist', 'financial assumptions'],
    writingGuidance: 'Write like a founder-ready business plan prepared for operators, advisors, and investors. Use realistic assumptions and avoid impossible claims.',
  },
  report: {
    label: 'Business Report',
    sections: ['Summary', 'Background', 'Findings', 'Analysis', 'Recommendations', 'Conclusion'],
    richElements: ['findings table', 'recommendation priority matrix', 'best practices', 'action items'],
    writingGuidance: 'Write like an analyst summarizing evidence and business implications. Distinguish facts, assumptions, and recommendations.',
  },
  resume: {
    label: 'Resume',
    sections: ['Professional Summary', 'Skills', 'Experience', 'Education', 'Certifications', 'Projects'],
    richElements: ['skills matrix', 'achievement bullets', 'project highlights'],
    writingGuidance: 'Write concise, achievement-oriented resume content with measurable impact where reasonable. Do not invent employers, degrees, or credentials not implied by the request.',
  },
  letter: {
    label: 'Professional Letter',
    sections: ['Subject', 'Greeting', 'Context', 'Message', 'Requested Action', 'Closing'],
    richElements: ['clear request', 'next steps', 'deadline or response expectation'],
    writingGuidance: 'Write in a direct, polished business-letter style. Keep the document brief, respectful, and action-oriented.',
  },
  'blog article': {
    label: 'Blog Article',
    sections: ['Hook', 'Introduction', 'Core Idea', 'Practical Examples', 'Best Practices', 'Key Takeaways', 'Conclusion'],
    richElements: ['H2/H3-style sections', 'examples', 'checklists', 'FAQs when useful', 'key takeaways'],
    writingGuidance: 'Write like a sharp editorial strategist: useful, natural, scannable, and specific. Avoid marketing fluff and generic introductions.',
  },
};

function normalizeOption(value: unknown, allowed: Set<string>, fallback: string) {
  const normalized = typeof value === 'string' ? value.trim().toLowerCase() : '';

  return allowed.has(normalized) ? normalized : fallback;
}

function selectDocumentBlueprint(input: { topic: string; documentType: string }) {
  const topic = input.topic.toLowerCase();

  if (/\b(proposal|rfp|scope of work|sow|pitch)\b/.test(topic)) return documentBlueprints.proposal;
  if (/\b(business plan|startup plan|go-to-market plan|financial projections)\b/.test(topic)) return documentBlueprints['business plan'];
  if (/\b(resume|cv|curriculum vitae)\b/.test(topic)) return documentBlueprints.resume;
  if (/\b(blog|article|post|guide)\b/.test(topic)) return documentBlueprints['blog article'];
  if (/\b(letter|email|memo)\b/.test(topic)) return documentBlueprints.letter;

  return documentBlueprints[input.documentType] || documentBlueprints.report;
}

function buildDocumentPrompt(input: {
  topic: string;
  documentType: string;
  tone: string;
  length: string;
}) {
  const blueprint = selectDocumentBlueprint(input);

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
    '- Avoid repeated section titles, repeated opening phrases, and generic AI wording.',
    '- Use realistic examples, assumptions, ranges, and next steps only when they fit the request.',
    `Selected blueprint: ${JSON.stringify(blueprint)}`,
    `Document type: ${input.documentType}`,
    `Tone: ${input.tone}`,
    `Length: ${input.length}`,
    `Topic or brief: ${input.topic}`,
  ].join('\n');
}

function buildResearchAgentPrompt(input: {
  topic: string;
  documentType: string;
  tone: string;
  length: string;
}) {
  const blueprint = selectDocumentBlueprint(input);

  return [
    'You are the Research Agent for an AI document maker.',
    'Return only valid JSON. Do not include markdown fences, commentary, or trailing text.',
    'Understand the request, infer the business context, and create a structured content brief.',
    'Use this exact JSON shape:',
    JSON.stringify({
      documentType: 'string',
      audience: 'string',
      tone: 'string',
      objectives: ['string'],
      assumptions: ['string'],
      requiredSections: ['string'],
      estimatedLength: 'string',
    }),
    'Rules:',
    '- Identify the real document type from the user request, even when the UI option is generic.',
    '- Select the closest blueprint and use its required sections unless the user request clearly needs a variation.',
    '- Make assumptions explicit and useful, not defensive.',
    '- Choose sections that a professional consultant would expect.',
    '- Capture missing assumptions such as audience, company size, timeframe, buyer, market, geography, and source data.',
    `Available selected blueprint: ${JSON.stringify(blueprint)}`,
    `Requested document type: ${input.documentType}`,
    `Requested tone: ${input.tone}`,
    `Requested length: ${input.length}`,
    `User brief: ${input.topic}`,
  ].join('\n');
}

function buildPlannerPrompt(input: {
  topic: string;
  documentType: string;
  tone: string;
  length: string;
  researchBrief: DocumentResearchBrief;
}) {
  const blueprint = selectDocumentBlueprint(input);

  return [
    'You are the Document Planner for a premium AI workspace product.',
    'Return only valid JSON. Do not include markdown fences, commentary, or trailing text.',
    'Create a professional outline and decide where tables, bullets, and callouts belong.',
    'Use this exact JSON shape:',
    JSON.stringify({
      title: 'string',
      subtitle: 'string',
      executiveSummary: 'string',
      sections: [
        {
          heading: 'string',
          purpose: 'string',
          estimatedParagraphs: 2,
          includeTable: true,
          includeBullets: true,
          includeCallout: true,
        },
      ],
    }),
    'Rules:',
    '- Use the selected blueprint as the default structure. Keep section headings distinct and non-repetitive.',
    '- Use 6-10 sections for proposals and business plans, 5-7 for reports and blogs, and 4-6 for letters/resumes unless the request requires more.',
    '- Place tables only where they clarify scope, timelines, pricing, comparisons, assumptions, or metrics.',
    '- Place callouts only for important insight, risk, decision, or recommendation moments.',
    '- Plan rich content selectively: comparison tables, numbered steps, checklists, best practices, examples, FAQs, and action items only when useful.',
    '- Keep the outline specific enough that each section can be written independently.',
    `Selected blueprint: ${JSON.stringify(blueprint)}`,
    `UI inputs: ${JSON.stringify({ documentType: input.documentType, tone: input.tone, length: input.length })}`,
    `Research brief: ${JSON.stringify(input.researchBrief)}`,
    `User brief: ${input.topic}`,
  ].join('\n');
}

function buildSectionWriterPrompt(input: {
  topic: string;
  researchBrief: DocumentResearchBrief;
  plan: DocumentPlan;
  section: DocumentPlanSection;
  sectionIndex: number;
}) {
  return [
    'You are the Content Writer for one section of a professional document.',
    'Return only valid JSON. Do not include markdown fences, commentary, or trailing text.',
    'Write only the assigned section. Do not write the full document.',
    'Use this exact JSON shape:',
    JSON.stringify({
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
      keyInsights: ['string'],
      recommendations: ['string'],
    }),
    'Rules:',
    '- Write like an experienced consultant: specific, direct, and commercially useful.',
    '- Avoid generic AI wording such as "in today\'s fast-paced world" or "leverage cutting-edge solutions".',
    '- Avoid repeated paragraph openings and repeated claims from nearby sections.',
    '- Use natural transitions and concrete nouns. Prefer concise business prose over hype.',
    '- Include bullets only if the plan asks for bullets.',
    '- Include a table only if the plan asks for a table and the table improves clarity.',
    '- Include examples, numbered steps, checklists, best practices, FAQs, or action items when useful for this exact section.',
    '- Do not fabricate impossible data. If exact facts are unknown, present realistic assumptions as assumptions.',
    '- Keep paragraphs concise and balanced with the surrounding outline.',
    `Section number: ${input.sectionIndex + 1}`,
    `Assigned section: ${JSON.stringify(input.section)}`,
    `Full document plan: ${JSON.stringify(input.plan)}`,
    `Research brief: ${JSON.stringify(input.researchBrief)}`,
    `User brief: ${input.topic}`,
  ].join('\n');
}

function buildEditorialReviewerPrompt(input: {
  topic: string;
  researchBrief: DocumentResearchBrief;
  plan: DocumentPlan;
  sections: DocumentSectionContent[];
}) {
  return [
    'You are the Editorial Reviewer for a premium AI document maker.',
    'Return only valid JSON. Do not include markdown fences, commentary, or trailing text.',
    'Review the complete document and return the final export JSON.',
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
    'Responsibilities:',
    '- Remove repetition without deleting useful substance.',
    '- Improve transitions, professional tone, terminology consistency, and readability.',
    '- Keep section balance and make the conclusion match the objectives.',
    '- Preserve useful tables, bullets, examples, recommendations, and key insights.',
    '- Remove generic AI phrases, duplicated ideas, and repeated section titles.',
    '- Ensure the final document feels like management consultant, analyst, or project-manager work.',
    '- Do not add pricing, billing, payment, wallet, or export-route content.',
    `Original user brief: ${input.topic}`,
    `Research brief: ${JSON.stringify(input.researchBrief)}`,
    `Document plan: ${JSON.stringify(input.plan)}`,
    `Draft sections: ${JSON.stringify(input.sections)}`,
  ].join('\n');
}

interface DocumentResearchBrief {
  documentType: string;
  audience: string;
  tone: string;
  objectives: string[];
  assumptions: string[];
  requiredSections: string[];
  estimatedLength: string;
}

interface DocumentPlanSection {
  heading: string;
  purpose: string;
  estimatedParagraphs: number;
  includeTable: boolean;
  includeBullets: boolean;
  includeCallout: boolean;
}

interface DocumentPlan {
  title: string;
  subtitle: string;
  executiveSummary: string;
  sections: DocumentPlanSection[];
}

interface DocumentSectionContent {
  heading: string;
  paragraphs: string[];
  bulletPoints: string[];
  tables: Array<{
    title: string;
    columns: string[];
    rows: Array<Array<string | number>>;
  }>;
  keyInsights: string[];
  recommendations: string[];
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

function parseJsonObject(content: string) {
  const json = extractJsonObject(content);

  try {
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    const repaired = json
      .replace(/^\uFEFF/, '')
      .replace(/,\s*([}\]])/g, '$1')
      .replace(/[\u0000-\u001F]+/g, ' ');

    return JSON.parse(repaired) as Record<string, unknown>;
  }
}

function parseDocumentContent(content: string) {
  const parsed = parseJsonObject(content) as {
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

function asStringArray(value: unknown) {
  return Array.isArray(value)
    ? value.map((item) => String(item ?? '').trim()).filter(Boolean)
    : [];
}

function parseResearchBrief(content: string, fallback: {
  documentType: string;
  tone: string;
  length: string;
}) {
  const parsed = parseJsonObject(content) as Partial<DocumentResearchBrief>;

  return {
    documentType: String(parsed.documentType || fallback.documentType),
    audience: String(parsed.audience || 'Business decision-makers'),
    tone: String(parsed.tone || fallback.tone),
    objectives: asStringArray(parsed.objectives),
    assumptions: asStringArray(parsed.assumptions),
    requiredSections: asStringArray(parsed.requiredSections),
    estimatedLength: String(parsed.estimatedLength || fallback.length),
  };
}

function parseDocumentPlan(content: string) {
  const parsed = parseJsonObject(content) as Partial<DocumentPlan>;
  const sections = Array.isArray(parsed.sections)
    ? parsed.sections.map((section) => {
        const input = section as Partial<DocumentPlanSection>;

        return {
          heading: String(input.heading || 'Section'),
          purpose: String(input.purpose || ''),
          estimatedParagraphs: Number.isFinite(Number(input.estimatedParagraphs))
            ? Math.max(1, Math.min(5, Number(input.estimatedParagraphs)))
            : 2,
          includeTable: Boolean(input.includeTable),
          includeBullets: Boolean(input.includeBullets),
          includeCallout: Boolean(input.includeCallout),
        };
      }).filter((section) => section.heading)
    : [];

  return {
    title: String(parsed.title || 'AI Studio Document'),
    subtitle: String(parsed.subtitle || ''),
    executiveSummary: String(parsed.executiveSummary || ''),
    sections: sections.length > 0
      ? sections.slice(0, 10)
      : [{
          heading: 'Overview',
          purpose: 'Provide a concise professional overview.',
          estimatedParagraphs: 2,
          includeTable: false,
          includeBullets: true,
          includeCallout: false,
        }],
  };
}

function parseSectionContent(content: string, plannedHeading: string): DocumentSectionContent {
  const parsed = parseJsonObject(content) as Partial<DocumentSectionContent>;
  const normalized = parseDocumentContent(JSON.stringify({
    title: 'Section',
    sections: [{
      heading: parsed.heading || plannedHeading,
      paragraphs: parsed.paragraphs,
      bulletPoints: parsed.bulletPoints,
      tables: parsed.tables,
    }],
    keyInsights: parsed.keyInsights,
    recommendations: parsed.recommendations,
  }));
  const section = normalized.sections[0];

  return {
    heading: section.heading,
    paragraphs: section.paragraphs,
    bulletPoints: section.bulletPoints,
    tables: section.tables,
    keyInsights: normalized.keyInsights,
    recommendations: normalized.recommendations,
  };
}

async function runTrackedPrompt(
  prompt: string,
  providerUsage: ReturnType<typeof createProviderUsageAccumulator>,
  timeoutMs = agentTimeoutMs,
) {
  const result = await runAiStudioOpenRouterPrompt(prompt, { timeoutMs });
  addProviderUsage(providerUsage, result.usage);

  return result.content;
}

function buildSimpleSectionFallback(section: DocumentPlanSection): DocumentSectionContent {
  const paragraph = section.purpose
    ? section.purpose
    : `This section summarizes the most important considerations for ${section.heading.toLowerCase()}.`;

  return {
    heading: section.heading,
    paragraphs: [paragraph],
    bulletPoints: section.includeBullets
      ? [
          'Clarify the decision criteria and success measures before execution.',
          'Assign accountable owners for the next stage of work.',
        ]
      : [],
    tables: [],
    keyInsights: [],
    recommendations: [],
  };
}

function buildDeterministicDocument(input: {
  topic: string;
  documentType: string;
  tone: string;
}) {
  const title = input.topic.replace(/[.?!]\s*$/, '') || 'AI Studio Document';
  const blueprint = selectDocumentBlueprint(input);
  const sections = blueprint.sections.slice(0, 6).map((heading, index) => ({
    heading,
    paragraphs: [
      `${heading} for ${title} should be refined with organization-specific details, but the core focus is ${index === 0 ? 'the business objective, audience, and decision context' : 'clear assumptions, realistic actions, and measurable outcomes'}.`,
    ],
    bulletPoints: index === 0
      ? []
      : [
          'Confirm the relevant assumptions with stakeholders.',
          'Add company-specific data, owners, and timing before final use.',
        ],
    tables: [],
  }));

  return {
    title,
    subtitle: `${input.tone} ${blueprint.label}`,
    executiveSummary: `This document provides a structured, professional response to: ${input.topic}`,
    sections,
    keyInsights: ['The document should be refined with organization-specific data before final use.'],
    recommendations: ['Validate assumptions with internal stakeholders before sharing externally.'],
    conclusion: 'The final document should align the requested objective with clear action steps and accountable follow-through.',
  };
}

async function generateSimpleDocumentFallback(input: {
  topic: string;
  documentType: string;
  tone: string;
  length: string;
  providerUsage: ReturnType<typeof createProviderUsageAccumulator>;
}) {
  try {
    return parseDocumentContent(
      await runTrackedPrompt(
        buildDocumentPrompt(input),
        input.providerUsage,
        fallbackTimeoutMs,
      ),
    );
  } catch (error) {
    console.error('[ai-studio-document-maker] Simple fallback failed:', error);

    return buildDeterministicDocument(input);
  }
}

async function generateDocumentPipeline(input: {
  topic: string;
  documentType: string;
  tone: string;
  length: string;
  providerUsage: ReturnType<typeof createProviderUsageAccumulator>;
}) {
  let researchBrief: DocumentResearchBrief;
  let plan: DocumentPlan;

  try {
    researchBrief = parseResearchBrief(
      await runTrackedPrompt(buildResearchAgentPrompt(input), input.providerUsage),
      input,
    );
    plan = parseDocumentPlan(
      await runTrackedPrompt(buildPlannerPrompt({ ...input, researchBrief }), input.providerUsage),
    );
  } catch (error) {
    console.error('[ai-studio-document-maker] Planning pipeline failed; using simple fallback:', error);

    return generateSimpleDocumentFallback(input);
  }

  const sections = await Promise.all(
    plan.sections.map(async (section, sectionIndex) =>
      {
        try {
          return parseSectionContent(
            await runTrackedPrompt(
              buildSectionWriterPrompt({
                topic: input.topic,
                researchBrief,
                plan,
                section,
                sectionIndex,
              }),
              input.providerUsage,
            ),
            section.heading,
          );
        } catch (error) {
          console.error('[ai-studio-document-maker] Section agent failed; using section fallback:', {
            section: section.heading,
            error,
          });

          return buildSimpleSectionFallback(section);
        }
      }
    ),
  );
  const draft = {
    title: plan.title,
    subtitle: plan.subtitle,
    executiveSummary: plan.executiveSummary,
    sections: sections.map((section) => ({
      heading: section.heading,
      paragraphs: section.paragraphs,
      bulletPoints: section.bulletPoints,
      tables: section.tables,
    })),
    keyInsights: sections.flatMap((section) => section.keyInsights).slice(0, 6),
    recommendations: sections.flatMap((section) => section.recommendations).slice(0, 6),
    conclusion: '',
  };

  try {
    const reviewed = await runTrackedPrompt(
      buildEditorialReviewerPrompt({
        topic: input.topic,
        researchBrief,
        plan,
        sections,
      }),
      input.providerUsage,
    );

    return parseDocumentContent(reviewed);
  } catch (error) {
    console.error('[ai-studio-document-maker] Editorial review failed; returning draft:', error);

    return draft;
  }
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

    const document = await generateDocumentPipeline({
      topic,
      documentType,
      tone,
      length,
      providerUsage,
    });

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
