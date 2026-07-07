import { randomUUID } from 'crypto';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { Prisma } from '@prisma/client';
import { authOptions } from '@/lib/auth/config';
import { prisma } from '@/lib/prisma';
import { AI_STUDIO_SPREADSHEET_CREDITS } from '@/lib/ai-studio/estimate';
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

interface SpreadsheetMakerRequest {
  topic?: string;
  spreadsheetType?: string;
  complexity?: string;
}

const spreadsheetTypes = new Set([
  'budget',
  'sales report',
  'project tracker',
  'invoice',
  'comparison table',
  'plan',
]);
const complexities = new Set(['simple', 'medium', 'detailed']);

function normalizeOption(value: unknown, allowed: Set<string>, fallback: string) {
  const normalized = typeof value === 'string' ? value.trim().toLowerCase() : '';

  return allowed.has(normalized) ? normalized : fallback;
}

function buildSpreadsheetPrompt(input: {
  topic: string;
  spreadsheetType: string;
  complexity: string;
}) {
  const typeGuidance: Record<string, string> = {
    budget:
      'Create income, expense, budget, actual, variance, and variance percentage structure with totals and formulas.',
    'sales report':
      'Create leads, opportunities, deal stage, owner, expected revenue, probability, weighted revenue, conversion, and totals.',
    'project tracker':
      'Create tasks, owners, priority, status, due dates, progress, dependencies, risk, and next action.',
    invoice:
      'Create invoice line items, quantity, rate, subtotal, tax, discount, total, due date, and payment notes.',
    'comparison table':
      'Create options, criteria, scores, weighted total, pros, cons, and recommendation.',
    plan:
      'Create milestones, timeline, owner, dependencies, status, progress, risks, and success metric.',
  };

  return [
    'Create a polished, professional SaaS-quality Excel workbook for SimplifyConvert AI Studio.',
    'Return only valid JSON. Do not include markdown fences, commentary, or trailing text.',
    'Use this exact JSON shape:',
    JSON.stringify({
      workbookTitle: 'string',
      sheets: [
        {
          sheetName: 'string',
          description: 'string',
          columns: ['string'],
          rows: [['string or number']],
          formulas: [
            {
              cell: 'string like E12',
              formula: 'string without leading =',
              label: 'string',
            },
          ],
          summaryMetrics: [
            {
              label: 'string',
              value: 'string or number',
              format: 'text | number | currency | percent | date',
            },
          ],
          chartSuggestions: ['string'],
        },
      ],
      summaryMetrics: [
        {
          label: 'string',
          value: 'string or number',
          format: 'text | number | currency | percent | date',
        },
      ],
      chartSuggestions: ['string'],
      notes: ['string'],
    }),
    'Rules:',
    '- Include at least one detailed main data sheet.',
    '- Include formulas that make sense for totals, variance, weighted revenue, invoice totals, scores, or progress where applicable.',
    '- Use numbers for numeric cells and ISO-like dates for date cells.',
    '- Provide summaryMetrics for dashboard-style summary output.',
    '- Provide chartSuggestions that explain useful charts, even if charts are not embedded.',
    `Spreadsheet type guidance: ${typeGuidance[input.spreadsheetType] || typeGuidance.budget}`,
    `Spreadsheet type: ${input.spreadsheetType}`,
    `Complexity: ${input.complexity}`,
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

function parseSpreadsheetContent(content: string) {
  const parsed = JSON.parse(extractJsonObject(content)) as {
    workbookTitle?: unknown;
    title?: unknown;
    sheets?: unknown;
    columns?: unknown;
    rows?: unknown;
    formulas?: unknown;
    summaryMetrics?: unknown;
    chartSuggestions?: unknown;
    notes?: unknown;
  };

  const normalizeMetric = (metric: unknown) => {
    const input = metric as { label?: unknown; value?: unknown; format?: unknown };

    return {
      label: String(input.label || 'Metric'),
      value: typeof input.value === 'number' ? input.value : String(input.value ?? ''),
      format: String(input.format || 'text'),
    };
  };
  const normalizeSheet = (sheet: unknown) => {
    const input = sheet as {
      sheetName?: unknown;
      description?: unknown;
      columns?: unknown;
      rows?: unknown;
      formulas?: unknown;
      summaryMetrics?: unknown;
      chartSuggestions?: unknown;
    };
    const columns = Array.isArray(input.columns)
      ? input.columns.map((item) => String(item || '')).filter(Boolean)
      : [];
    const rows = Array.isArray(input.rows)
      ? input.rows
          .filter((row): row is unknown[] => Array.isArray(row))
          .map((row) => row.map((cell) => (typeof cell === 'number' ? cell : String(cell ?? ''))))
      : [];

    return {
      sheetName: String(input.sheetName || 'Main Data'),
      description: String(input.description || ''),
      columns: columns.length > 0 ? columns : ['Item', 'Value'],
      rows,
      formulas: Array.isArray(input.formulas)
        ? input.formulas.map((formula) => {
            const formulaInput = formula as { cell?: unknown; formula?: unknown; label?: unknown };

            return {
              cell: String(formulaInput.cell || ''),
              formula: String(formulaInput.formula || '').replace(/^=/, ''),
              label: String(formulaInput.label || ''),
            };
          }).filter((formula) => formula.cell && formula.formula)
        : [],
      summaryMetrics: Array.isArray(input.summaryMetrics)
        ? input.summaryMetrics.map(normalizeMetric)
        : [],
      chartSuggestions: Array.isArray(input.chartSuggestions)
        ? input.chartSuggestions.map((item) => String(item)).filter(Boolean)
        : [],
    };
  };

  const sheets = Array.isArray(parsed.sheets)
    ? parsed.sheets.map(normalizeSheet)
    : [];
  const columns = Array.isArray(parsed.columns)
    ? parsed.columns.map((item) => String(item || '')).filter(Boolean)
    : [];
  const rows = Array.isArray(parsed.rows)
    ? parsed.rows
        .filter((row): row is unknown[] => Array.isArray(row))
        .map((row) => row.map((cell) => (typeof cell === 'number' ? cell : String(cell ?? ''))))
    : [];
  const safeColumns = columns.length > 0 ? columns : ['Item', 'Value'];
  const fallbackSheet = {
    sheetName: 'Main Data',
    description: '',
    columns: safeColumns,
    rows: rows.length > 0 ? rows : [['Generated content', content]],
    formulas: [],
    summaryMetrics: [],
    chartSuggestions: [],
  };

  return {
    workbookTitle: String(parsed.workbookTitle || parsed.title || 'AI Studio Spreadsheet'),
    sheets: sheets.length > 0 ? sheets : [fallbackSheet],
    summaryMetrics: Array.isArray(parsed.summaryMetrics)
      ? parsed.summaryMetrics.map(normalizeMetric)
      : [],
    chartSuggestions: Array.isArray(parsed.chartSuggestions)
      ? parsed.chartSuggestions.map((item) => String(item)).filter(Boolean)
      : [],
    notes: Array.isArray(parsed.notes)
      ? parsed.notes.map((item) => String(item)).filter(Boolean)
      : [],
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
      toolType: 'spreadsheet',
      topic: input.topic,
      slideCount: 1,
      model: input.model ?? primaryAiStudioModel,
      provider: 'openrouter',
      status: input.status,
      estimatedCredits: AI_STUDIO_SPREADSHEET_CREDITS,
      reservedCredits: input.status === 'success' ? AI_STUDIO_SPREADSHEET_CREDITS : 0,
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
    const body = (await request.json()) as SpreadsheetMakerRequest;
    topic = body.topic?.trim() || '';
    const spreadsheetType = normalizeOption(body.spreadsheetType, spreadsheetTypes, 'budget');
    const complexity = normalizeOption(body.complexity, complexities, 'medium');

    if (!topic) {
      return NextResponse.json({ error: 'Describe the spreadsheet you want to create.' }, { status: 400 });
    }

    const wallet = await getOrCreateWallet(userId);

    if (wallet.balanceCredits.toNumber() < AI_STUDIO_SPREADSHEET_CREDITS) {
      await logUsage({
        userId,
        requestId,
        topic,
        status: 'failed',
        errorCode: 'INSUFFICIENT_CREDITS',
      });

      return NextResponse.json(
        {
          error: 'Not enough AI Studio credits for this spreadsheet.',
          estimatedCredits: AI_STUDIO_SPREADSHEET_CREDITS,
          wallet: serializeAiStudioWallet(wallet),
        },
        { status: 402 },
      );
    }

    await reserveCredits(userId, AI_STUDIO_SPREADSHEET_CREDITS, {
      referenceType: 'ai_studio_spreadsheet',
      referenceId: requestId,
      description: 'Reserved credits for AI Studio spreadsheet generation',
      metadata: { topic, spreadsheetType, complexity },
    });
    reserved = true;

    const result = await runAiStudioOpenRouterPrompt(
      buildSpreadsheetPrompt({ topic, spreadsheetType, complexity }),
    );
    addProviderUsage(providerUsage, result.usage);
    const spreadsheet = parseSpreadsheetContent(result.content);

    const updatedWallet = await captureCredits(userId, AI_STUDIO_SPREADSHEET_CREDITS, {
      referenceType: 'ai_studio_spreadsheet',
      referenceId: requestId,
      description: 'Captured credits for AI Studio spreadsheet generation',
      metadata: { topic, spreadsheetType, complexity },
    });
    reserved = false;

    await logUsage({
      userId,
      requestId,
      topic,
      status: 'success',
      actualCredits: AI_STUDIO_SPREADSHEET_CREDITS,
      inputTokens: providerUsage.inputTokens || undefined,
      outputTokens: providerUsage.outputTokens || undefined,
      totalTokens: providerUsage.totalTokens || undefined,
      providerCostUsd: providerUsage.hasUnknownCost ? null : providerUsage.estimatedCostUsd,
      providerResponseId: serializeProviderResponseIds(providerUsage.responseIds),
      model: getAggregatedModel(providerUsage),
    });

    return NextResponse.json({
      spreadsheet,
      creditsUsed: AI_STUDIO_SPREADSHEET_CREDITS,
      wallet: serializeAiStudioWallet(updatedWallet),
    });
  } catch (error) {
    console.error('[ai-studio-spreadsheet-maker] Generation failed:', error);

    let wallet = null;

    if (reserved && userId) {
      try {
        wallet = await releaseCredits(userId, AI_STUDIO_SPREADSHEET_CREDITS, {
          referenceType: 'ai_studio_spreadsheet',
          referenceId: requestId,
          description: 'Released reserved credits after failed spreadsheet generation',
          metadata: { topic },
        });
      } catch (releaseError) {
        console.error('[ai-studio-spreadsheet-maker] Failed to release reserved credits:', releaseError);
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
        console.error('[ai-studio-spreadsheet-maker] Failed to write usage log:', logError);
      });
    }

    return NextResponse.json(
      {
        error: 'AI Studio could not generate this spreadsheet right now. Please try again later.',
        wallet: wallet ? serializeAiStudioWallet(wallet) : undefined,
      },
      { status: 503 },
    );
  }
}
