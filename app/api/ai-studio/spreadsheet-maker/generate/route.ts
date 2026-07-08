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
const agentTimeoutMs = Number(process.env.AI_STUDIO_AGENT_TIMEOUT_MS || 45000);
const fallbackTimeoutMs = Number(process.env.AI_STUDIO_FALLBACK_TIMEOUT_MS || 70000);

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

interface WorkbookRequirements {
  spreadsheetType: string;
  businessDomain: string;
  workbookPurpose: string;
  requiredCalculations: string[];
  requiredMetrics: string[];
  requiredSheets: string[];
}

interface WorkbookPlanSheet {
  name: string;
  description: string;
  columns: string[];
  formulas: string[];
  summaryMetrics: string[];
  chartSuggestions: string[];
}

interface WorkbookPlan {
  workbookTitle: string;
  sheets: WorkbookPlanSheet[];
}

interface BuiltWorkbookSheet {
  sheetName: string;
  description: string;
  columns: string[];
  rows: Array<Array<string | number>>;
  formulas: Array<{
    cell: string;
    formula: string;
    label: string;
  }>;
  summaryMetrics: Array<{
    label: string;
    value: string | number;
    format: string;
  }>;
  chartSuggestions: string[];
}

function buildRequirementsAnalyzerPrompt(input: {
  topic: string;
  spreadsheetType: string;
  complexity: string;
}) {
  return [
    'You are the Requirements Analyzer for an AI spreadsheet maker.',
    'Return only valid JSON. Do not include markdown fences, commentary, or trailing text.',
    'Determine the workbook requirements for a professional business spreadsheet.',
    'Use this exact JSON shape:',
    JSON.stringify({
      spreadsheetType: 'string',
      businessDomain: 'string',
      workbookPurpose: 'string',
      requiredCalculations: ['string'],
      requiredMetrics: ['string'],
      requiredSheets: ['string'],
    }),
    'Rules:',
    '- Infer a realistic business domain and workbook purpose from the brief.',
    '- Include calculations and metrics that a business analyst would build into the workbook.',
    '- Keep requiredSheets focused; do not invent unnecessary feature areas.',
    `Requested spreadsheet type: ${input.spreadsheetType}`,
    `Complexity: ${input.complexity}`,
    `User brief: ${input.topic}`,
  ].join('\n');
}

function buildWorkbookPlannerPrompt(input: {
  topic: string;
  spreadsheetType: string;
  complexity: string;
  requirements: WorkbookRequirements;
}) {
  return [
    'You are the Workbook Planner for a premium AI workspace product.',
    'Return only valid JSON. Do not include markdown fences, commentary, or trailing text.',
    'Create the workbook structure before data is generated.',
    'Use this exact JSON shape:',
    JSON.stringify({
      workbookTitle: 'string',
      sheets: [
        {
          name: 'string',
          description: 'string',
          columns: ['string'],
          formulas: ['string'],
          summaryMetrics: ['string'],
          chartSuggestions: ['string'],
        },
      ],
    }),
    'Rules:',
    '- Use 2-5 sheets for most workbooks.',
    '- Make columns realistic, analyst-friendly, and consistent with the required calculations.',
    '- Formulas should describe intended calculations, not final cell references yet.',
    '- Include dashboard or summary sheets only when appropriate for the brief.',
    `UI inputs: ${JSON.stringify({ spreadsheetType: input.spreadsheetType, complexity: input.complexity })}`,
    `Requirements: ${JSON.stringify(input.requirements)}`,
    `User brief: ${input.topic}`,
  ].join('\n');
}

function buildDataBuilderPrompt(input: {
  topic: string;
  requirements: WorkbookRequirements;
  plan: WorkbookPlan;
  sheet: WorkbookPlanSheet;
  sheetIndex: number;
}) {
  return [
    'You are the Data Builder for one sheet in a professional workbook.',
    'Return only valid JSON. Do not include markdown fences, commentary, or trailing text.',
    'Generate only the assigned sheet, including realistic rows, formulas, summaries, and notes where useful.',
    'Use this exact JSON shape:',
    JSON.stringify({
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
      notes: ['string'],
    }),
    'Rules:',
    '- Build the sheet like a business analyst prepared it for review.',
    '- Use realistic headers and rows for the domain. Use numbers for numeric cells.',
    '- Keep formulas consistent with columns and row counts. Do not include a leading equals sign.',
    '- Include totals or summary rows when useful, but keep the data readable.',
    '- Avoid generic placeholder rows.',
    `Sheet number: ${input.sheetIndex + 1}`,
    `Assigned sheet plan: ${JSON.stringify(input.sheet)}`,
    `Full workbook plan: ${JSON.stringify(input.plan)}`,
    `Requirements: ${JSON.stringify(input.requirements)}`,
    `User brief: ${input.topic}`,
  ].join('\n');
}

function buildWorkbookReviewerPrompt(input: {
  topic: string;
  requirements: WorkbookRequirements;
  plan: WorkbookPlan;
  sheets: BuiltWorkbookSheet[];
}) {
  return [
    'You are the Workbook Reviewer for a premium AI spreadsheet maker.',
    'Return only valid JSON. Do not include markdown fences, commentary, or trailing text.',
    'Validate and polish the completed workbook, then return the final workbook JSON.',
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
    'Responsibilities:',
    '- Validate formulas, column consistency, summary metrics, sheet relationships, readability, and professionalism.',
    '- Remove duplicate or inconsistent metrics.',
    '- Keep formulas compatible with the generated rows and columns.',
    '- Do not add pricing, billing, payment, wallet, or export-route content.',
    `Original user brief: ${input.topic}`,
    `Requirements: ${JSON.stringify(input.requirements)}`,
    `Workbook plan: ${JSON.stringify(input.plan)}`,
    `Draft sheets: ${JSON.stringify(input.sheets)}`,
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

function parseSpreadsheetContent(content: string) {
  const parsed = parseJsonObject(content) as {
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

function asStringArray(value: unknown) {
  return Array.isArray(value)
    ? value.map((item) => String(item ?? '').trim()).filter(Boolean)
    : [];
}

function parseRequirements(content: string, fallback: {
  spreadsheetType: string;
}) {
  const parsed = parseJsonObject(content) as Partial<WorkbookRequirements>;

  return {
    spreadsheetType: String(parsed.spreadsheetType || fallback.spreadsheetType),
    businessDomain: String(parsed.businessDomain || 'General business'),
    workbookPurpose: String(parsed.workbookPurpose || 'Track and analyze business performance'),
    requiredCalculations: asStringArray(parsed.requiredCalculations),
    requiredMetrics: asStringArray(parsed.requiredMetrics),
    requiredSheets: asStringArray(parsed.requiredSheets),
  };
}

function parseWorkbookPlan(content: string) {
  const parsed = parseJsonObject(content) as Partial<WorkbookPlan>;
  const sheets = Array.isArray(parsed.sheets)
    ? parsed.sheets.map((sheet) => {
        const input = sheet as Partial<WorkbookPlanSheet>;

        return {
          name: String(input.name || 'Main Data'),
          description: String(input.description || ''),
          columns: asStringArray(input.columns),
          formulas: asStringArray(input.formulas),
          summaryMetrics: asStringArray(input.summaryMetrics),
          chartSuggestions: asStringArray(input.chartSuggestions),
        };
      }).filter((sheet) => sheet.name && sheet.columns.length > 0)
    : [];

  return {
    workbookTitle: String(parsed.workbookTitle || 'AI Studio Spreadsheet'),
    sheets: sheets.length > 0
      ? sheets.slice(0, 5)
      : [{
          name: 'Main Data',
          description: 'Generated business data',
          columns: ['Item', 'Value'],
          formulas: [],
          summaryMetrics: [],
          chartSuggestions: [],
        }],
  };
}

function parseBuiltSheet(content: string, plannedSheet: WorkbookPlanSheet): BuiltWorkbookSheet & { notes: string[] } {
  const normalized = parseSpreadsheetContent(JSON.stringify({
    workbookTitle: 'Sheet',
    sheets: [parseJsonObject(content)],
  }));
  const sheet = normalized.sheets[0];
  const parsed = parseJsonObject(content) as { notes?: unknown };

  return {
    sheetName: sheet.sheetName || plannedSheet.name,
    description: sheet.description || plannedSheet.description,
    columns: sheet.columns.length > 0 ? sheet.columns : plannedSheet.columns,
    rows: sheet.rows,
    formulas: sheet.formulas,
    summaryMetrics: sheet.summaryMetrics,
    chartSuggestions: sheet.chartSuggestions,
    notes: asStringArray(parsed.notes),
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

function buildSimpleSheetFallback(sheet: WorkbookPlanSheet): BuiltWorkbookSheet & { notes: string[] } {
  const columns = sheet.columns.length > 0 ? sheet.columns : ['Item', 'Value'];

  return {
    sheetName: sheet.name,
    description: sheet.description,
    columns,
    rows: [
      columns.map((column, index) => (index === 0 ? `${column} example` : '')),
    ],
    formulas: [],
    summaryMetrics: sheet.summaryMetrics.slice(0, 3).map((metric) => ({
      label: metric,
      value: '',
      format: 'text',
    })),
    chartSuggestions: sheet.chartSuggestions,
    notes: ['This sheet was generated with a simplified fallback after one workbook agent failed.'],
  };
}

function buildDeterministicSpreadsheet(input: {
  topic: string;
  spreadsheetType: string;
}) {
  return {
    workbookTitle: input.topic.replace(/[.?!]\s*$/, '') || 'AI Studio Spreadsheet',
    sheets: [
      {
        sheetName: 'Main Data',
        description: `Structured starting point for ${input.spreadsheetType}.`,
        columns: ['Category', 'Metric', 'Current Value', 'Target', 'Notes'],
        rows: [
          ['Overview', 'Primary objective', input.topic, '', 'Add company-specific data before use'],
          ['Planning', 'Owner', '', '', 'Assign accountable owner'],
          ['Review', 'Status', 'Draft', 'Approved', 'Validate calculations and assumptions'],
        ],
        formulas: [],
        summaryMetrics: [
          { label: 'Workbook status', value: 'Draft', format: 'text' },
        ],
        chartSuggestions: ['Add charts after replacing placeholder values with business data.'],
      },
    ],
    summaryMetrics: [
      { label: 'Workbook status', value: 'Draft', format: 'text' },
    ],
    chartSuggestions: ['Add charts after replacing placeholder values with business data.'],
    notes: ['Generated as a schema-safe fallback. Review and replace placeholder values before distribution.'],
  };
}

async function generateSimpleSpreadsheetFallback(input: {
  topic: string;
  spreadsheetType: string;
  complexity: string;
  providerUsage: ReturnType<typeof createProviderUsageAccumulator>;
}) {
  try {
    return parseSpreadsheetContent(
      await runTrackedPrompt(
        buildSpreadsheetPrompt(input),
        input.providerUsage,
        fallbackTimeoutMs,
      ),
    );
  } catch (error) {
    console.error('[ai-studio-spreadsheet-maker] Simple fallback failed:', error);

    return buildDeterministicSpreadsheet(input);
  }
}

async function generateSpreadsheetPipeline(input: {
  topic: string;
  spreadsheetType: string;
  complexity: string;
  providerUsage: ReturnType<typeof createProviderUsageAccumulator>;
}) {
  let requirements: WorkbookRequirements;
  let plan: WorkbookPlan;

  try {
    requirements = parseRequirements(
      await runTrackedPrompt(buildRequirementsAnalyzerPrompt(input), input.providerUsage),
      input,
    );
    plan = parseWorkbookPlan(
      await runTrackedPrompt(buildWorkbookPlannerPrompt({ ...input, requirements }), input.providerUsage),
    );
  } catch (error) {
    console.error('[ai-studio-spreadsheet-maker] Planning pipeline failed; using simple fallback:', error);

    return generateSimpleSpreadsheetFallback(input);
  }

  const builtSheets = await Promise.all(
    plan.sheets.map(async (sheet, sheetIndex) =>
      {
        try {
          return parseBuiltSheet(
            await runTrackedPrompt(
              buildDataBuilderPrompt({
                topic: input.topic,
                requirements,
                plan,
                sheet,
                sheetIndex,
              }),
              input.providerUsage,
            ),
            sheet,
          );
        } catch (error) {
          console.error('[ai-studio-spreadsheet-maker] Sheet agent failed; using sheet fallback:', {
            sheet: sheet.name,
            error,
          });

          return buildSimpleSheetFallback(sheet);
        }
      }
    ),
  );
  const draft = {
    workbookTitle: plan.workbookTitle,
    sheets: builtSheets.map(({ notes: _notes, ...sheet }) => sheet),
    summaryMetrics: builtSheets.flatMap((sheet) => sheet.summaryMetrics).slice(0, 8),
    chartSuggestions: builtSheets.flatMap((sheet) => sheet.chartSuggestions).slice(0, 8),
    notes: builtSheets.flatMap((sheet) => sheet.notes).slice(0, 6),
  };
  try {
    const reviewed = await runTrackedPrompt(
      buildWorkbookReviewerPrompt({
        topic: input.topic,
        requirements,
        plan,
        sheets: draft.sheets,
      }),
      input.providerUsage,
    );

    return parseSpreadsheetContent(reviewed);
  } catch (error) {
    console.error('[ai-studio-spreadsheet-maker] Workbook review failed; returning draft:', error);

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

    const spreadsheet = await generateSpreadsheetPipeline({
      topic,
      spreadsheetType,
      complexity,
      providerUsage,
    });

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
