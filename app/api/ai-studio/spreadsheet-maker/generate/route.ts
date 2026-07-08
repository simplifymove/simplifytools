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
  'inventory',
]);
const complexities = new Set(['simple', 'medium', 'detailed']);
const agentTimeoutMs = Number(process.env.AI_STUDIO_AGENT_TIMEOUT_MS || 45000);
const fallbackTimeoutMs = Number(process.env.AI_STUDIO_FALLBACK_TIMEOUT_MS || 70000);

const spreadsheetBlueprints: Record<string, {
  label: string;
  sheets: string[];
  metrics: string[];
  formulas: string[];
  dataGuidance: string;
}> = {
  budget: {
    label: 'Budget Workbook',
    sheets: ['Summary', 'Income', 'Expenses', 'Monthly Overview', 'Dashboard Notes'],
    metrics: ['Total income', 'Total expenses', 'Net cash flow', 'Budget variance', 'Expense ratio'],
    formulas: ['SUM', 'AVERAGE', 'Variance', 'Variance percentage', 'SUBTOTAL'],
    dataGuidance: 'Use realistic monthly income and expense categories with budget, actual, variance, and variance percent.',
  },
  'sales report': {
    label: 'Sales Dashboard',
    sheets: ['Summary', 'Sales Data', 'KPIs', 'Monthly Trends', 'Forecast'],
    metrics: ['MRR', 'ARR', 'Pipeline value', 'Win rate', 'Average deal size', 'Forecast revenue'],
    formulas: ['SUM', 'AVERAGE', 'COUNTIF', 'IF', 'Percentage calculations', 'Growth calculations', 'Forecast'],
    dataGuidance: 'Use realistic SaaS segments, pipeline stages, monthly periods, deal values, probabilities, MRR, win rates, and forecast assumptions.',
  },
  'project tracker': {
    label: 'Project Tracker',
    sheets: ['Dashboard', 'Tasks', 'Milestones', 'Resources', 'Risks'],
    metrics: ['Open tasks', 'Overdue tasks', 'Completion rate', 'At-risk milestones', 'Resource load'],
    formulas: ['COUNTIF', 'AVERAGE', 'IF', 'Percentage complete', 'Days remaining'],
    dataGuidance: 'Use realistic task owners, due dates, statuses, priorities, dependencies, progress percentages, and risk ratings.',
  },
  invoice: {
    label: 'Invoice Workbook',
    sheets: ['Invoice', 'Items', 'Tax Summary', 'Payment Notes'],
    metrics: ['Subtotal', 'Tax', 'Discount', 'Total due', 'Payment status'],
    formulas: ['SUM', 'Quantity x rate', 'Tax calculation', 'Discount calculation', 'Total due'],
    dataGuidance: 'Use realistic invoice line items, quantities, rates, tax assumptions, payment terms, and due dates.',
  },
  inventory: {
    label: 'Inventory Workbook',
    sheets: ['Inventory', 'Suppliers', 'Stock Alerts', 'Summary'],
    metrics: ['Units on hand', 'Reorder value', 'Low-stock SKUs', 'Inventory value', 'Supplier lead time'],
    formulas: ['SUM', 'COUNTIF', 'IF', 'VLOOKUP/XLOOKUP when useful', 'Reorder calculations'],
    dataGuidance: 'Use realistic SKUs, product categories, suppliers, reorder points, unit costs, lead times, and low-stock flags.',
  },
  'comparison table': {
    label: 'Comparison Workbook',
    sheets: ['Summary', 'Options', 'Scoring', 'Recommendation'],
    metrics: ['Weighted score', 'Cost score', 'Risk score', 'Recommended option'],
    formulas: ['SUMPRODUCT-style weighted totals', 'AVERAGE', 'Rank', 'IF'],
    dataGuidance: 'Use realistic options, criteria, weights, scores, pros, cons, and recommendation logic.',
  },
  plan: {
    label: 'Planning Workbook',
    sheets: ['Dashboard', 'Milestones', 'Owners', 'Risks', 'Notes'],
    metrics: ['Milestones complete', 'Open risks', 'Owner workload', 'Progress rate'],
    formulas: ['COUNTIF', 'AVERAGE', 'IF', 'Percentage complete'],
    dataGuidance: 'Use realistic milestones, owners, dependencies, due dates, progress, status, and risks.',
  },
};

function normalizeOption(value: unknown, allowed: Set<string>, fallback: string) {
  const normalized = typeof value === 'string' ? value.trim().toLowerCase() : '';

  return allowed.has(normalized) ? normalized : fallback;
}

function selectSpreadsheetBlueprint(input: { topic: string; spreadsheetType: string }) {
  const topic = input.topic.toLowerCase();

  if (/\b(saas|sales dashboard|sales report|pipeline|mrr|arr|revenue dashboard)\b/.test(topic)) return spreadsheetBlueprints['sales report'];
  if (/\b(project|tracker|task|milestone|resource|risk register)\b/.test(topic)) return spreadsheetBlueprints['project tracker'];
  if (/\b(invoice|billing|payment due|tax summary)\b/.test(topic)) return spreadsheetBlueprints.invoice;
  if (/\b(inventory|stock|sku|supplier|reorder)\b/.test(topic)) return spreadsheetBlueprints.inventory;
  if (/\b(budget|expense|income|cash flow|variance)\b/.test(topic)) return spreadsheetBlueprints.budget;
  if (/\b(compare|comparison|scorecard|vendor selection|options)\b/.test(topic)) return spreadsheetBlueprints['comparison table'];

  return spreadsheetBlueprints[input.spreadsheetType] || spreadsheetBlueprints.budget;
}

function buildSpreadsheetPrompt(input: {
  topic: string;
  spreadsheetType: string;
  complexity: string;
}) {
  const blueprint = selectSpreadsheetBlueprint(input);

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
    '- Include formulas that make sense for totals, averages, COUNTIF, IF logic, variance, weighted revenue, invoice totals, scores, growth, forecast, or progress where applicable.',
    '- Use numbers for numeric cells and ISO-like dates for date cells.',
    '- Provide summaryMetrics for dashboard-style summary output.',
    '- Provide chartSuggestions that explain useful charts, even if charts are not embedded.',
    '- Use realistic sample values. Avoid placeholders like TBD, N/A, Sample, or Example unless the workbook is explicitly a template.',
    `Selected blueprint: ${JSON.stringify(blueprint)}`,
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
  const blueprint = selectSpreadsheetBlueprint(input);

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
    '- Select the closest workbook blueprint and use its required sheets unless the user request clearly needs a variation.',
    '- Include calculations and metrics that a business analyst would build into the workbook.',
    '- Keep requiredSheets focused; do not invent unnecessary feature areas.',
    '- Required calculations should include real Excel functions where useful: SUM, AVERAGE, COUNTIF, IF, SUBTOTAL, growth %, variance %, forecast, and lookup formulas only when the sheet relationship supports them.',
    `Selected blueprint: ${JSON.stringify(blueprint)}`,
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
  const blueprint = selectSpreadsheetBlueprint(input);

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
    '- Use the selected blueprint as the default workbook structure. Preserve its core sheets unless the brief requires a smaller workbook.',
    '- Use 4-5 sheets for budgets, sales dashboards, project trackers, and inventory; 3-4 sheets for invoices or simple comparisons.',
    '- Make columns realistic, analyst-friendly, and consistent with the required calculations.',
    '- Formulas should describe intended calculations, not final cell references yet. Include SUM, AVERAGE, COUNTIF, IF, SUBTOTAL, percentage, growth, variance, forecast, or lookup logic where appropriate.',
    '- Include dashboard or summary sheets only when appropriate for the brief.',
    '- Avoid duplicate sheet names and vague columns such as Item/Value unless the workbook is intentionally simple.',
    `Selected blueprint: ${JSON.stringify(blueprint)}`,
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
  const blueprint = selectSpreadsheetBlueprint({
    topic: input.topic,
    spreadsheetType: input.requirements.spreadsheetType,
  });

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
    '- Use realistic sample values. Avoid placeholders like TBD, N/A, Sample, or Example unless explicitly requested.',
    '- Keep formulas consistent with columns and row counts. Do not include a leading equals sign.',
    '- Use real Excel formulas where appropriate: SUM, AVERAGE, COUNTIF, IF, SUBTOTAL, percentage calculations, growth calculations, totals, variance, forecast, and XLOOKUP/VLOOKUP only when useful.',
    '- Formula cell references must point to cells that exist in the generated sheet or a clearly named related sheet.',
    '- Include totals or summary rows when useful, but keep the data readable.',
    '- Use ISO-like dates for dates. Use decimal percentages such as 0.24, not "24%", when a cell is numeric.',
    '- For SaaS sales dashboards, include realistic MRR, ARR, leads, opportunities, stages, win rates, forecast, customer segment, and month values.',
    `Selected blueprint: ${JSON.stringify(blueprint)}`,
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
    '- Ensure workbook sheets match the selected business use case and do not collapse into one generic data sheet.',
    '- Preserve real formulas and realistic sample values. Remove impossible values and placeholders.',
    '- Make output feel like business analyst, financial analyst, or project manager work.',
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
      ? sheets.slice(0, 6)
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
      columns.map((column, index) => {
        const normalized = column.toLowerCase();
        if (index === 0) return sheet.name;
        if (/\b(date|month)\b/.test(normalized)) return '2026-01-01';
        if (/\b(revenue|mrr|arr|amount|cost|budget|value|price)\b/.test(normalized)) return 12500;
        if (/\b(rate|percent|margin|growth|probability)\b/.test(normalized)) return 0.24;
        if (/\b(count|leads|opportunities|units|tasks)\b/.test(normalized)) return 24;
        return `${sheet.name} detail`;
      }),
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
  const blueprint = selectSpreadsheetBlueprint(input);

  if (blueprint === spreadsheetBlueprints['sales report']) {
    return {
      workbookTitle: input.topic.replace(/[.?!]\s*$/, '') || 'SaaS Monthly Sales Dashboard',
      sheets: [
        {
          sheetName: 'Sales Data',
          description: 'Monthly SaaS sales performance by segment and channel.',
          columns: ['Month', 'Segment', 'Channel', 'Leads', 'Opportunities', 'Closed Won', 'MRR', 'Win Rate'],
          rows: [
            ['2026-01-01', 'SMB', 'Inbound', 420, 96, 28, 68500, 0.29],
            ['2026-01-01', 'Mid-Market', 'Partner', 180, 54, 14, 82000, 0.26],
            ['2026-01-01', 'Enterprise', 'Outbound', 48, 16, 4, 34000, 0.25],
          ],
          formulas: [
            { cell: 'G6', formula: 'SUM(G2:G4)', label: 'Total MRR' },
            { cell: 'H6', formula: 'AVERAGE(H2:H4)', label: 'Average win rate' },
            { cell: 'D6', formula: 'SUM(D2:D4)', label: 'Total leads' },
          ],
          summaryMetrics: [
            { label: 'Total MRR', value: 184500, format: 'currency' },
            { label: 'Average win rate', value: 0.27, format: 'percent' },
          ],
          chartSuggestions: ['Line chart for MRR by month.', 'Column chart for closed won by segment.'],
        },
        {
          sheetName: 'Forecast',
          description: 'Simple revenue forecast assumptions.',
          columns: ['Month', 'Base MRR', 'Growth Rate', 'Forecast MRR'],
          rows: [
            ['2026-02-01', 184500, 0.08, ''],
            ['2026-03-01', 199260, 0.07, ''],
          ],
          formulas: [
            { cell: 'D2', formula: 'B2*(1+C2)', label: 'Forecast MRR' },
            { cell: 'D3', formula: 'D2*(1+C3)', label: 'Next month forecast' },
          ],
          summaryMetrics: [{ label: 'Forecast horizon', value: '2 months', format: 'text' }],
          chartSuggestions: ['Line chart comparing base MRR and forecast MRR.'],
        },
      ],
      summaryMetrics: [
        { label: 'Monthly Recurring Revenue', value: 184500, format: 'currency' },
        { label: 'Average Win Rate', value: 0.27, format: 'percent' },
        { label: 'Closed Won Deals', value: 46, format: 'number' },
      ],
      chartSuggestions: ['Create a line chart for MRR trend.', 'Create a segment bar chart for closed won deals.'],
      notes: ['Generated as a schema-safe SaaS sales dashboard fallback with realistic sample values.'],
    };
  }

  return {
    workbookTitle: input.topic.replace(/[.?!]\s*$/, '') || 'AI Studio Spreadsheet',
    sheets: [
      {
        sheetName: blueprint.sheets[0] || 'Main Data',
        description: `Structured starting point for ${blueprint.label}.`,
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
    chartSuggestions: blueprint.metrics.slice(0, 2).map((metric) => `Create a chart for ${metric}.`),
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
