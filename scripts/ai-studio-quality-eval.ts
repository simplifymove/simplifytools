import AdmZip from 'adm-zip';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import path from 'path';
import {
  aiStudioBenchmarkCategories,
  aiStudioQualityBenchmarks,
  type AiStudioQualityBenchmark,
} from '../lib/ai-studio/quality-benchmarks';
import { createProfessionalDocxBuffer } from '../lib/ai-studio/docx';
import { createProfessionalXlsxBuffer } from '../lib/ai-studio/xlsx';

type EvalStatus = 'pass' | 'fail' | 'error' | 'skipped';

interface EvalResult {
  id: string;
  category: string;
  tool: string;
  prompt: string;
  status: EvalStatus;
  missingSections: string[];
  missingSheets: string[];
  exportSuccess: boolean;
  generationDurationMs: number | null;
  inputTokens: number | null;
  outputTokens: number | null;
  totalTokens: number | null;
  estimatedCostUsd: string | null;
  outputPath: string | null;
  exportPath: string | null;
  notes: string[];
}

const args = new Set(process.argv.slice(2).filter((arg) => !arg.includes('=')));
const argValues = new Map(
  process.argv
    .slice(2)
    .filter((arg) => arg.includes('='))
    .map((arg) => {
      const [key, ...rest] = arg.split('=');

      return [key, rest.join('=')];
    }),
);

const shouldRun = args.has('--run');
const baseUrl = argValues.get('--base-url') || process.env.AI_STUDIO_EVAL_BASE_URL || 'http://localhost:3000';
const cookie = argValues.get('--cookie') || process.env.AI_STUDIO_EVAL_COOKIE || '';
const outputRoot = argValues.get('--out') || process.env.AI_STUDIO_EVAL_OUT || path.join('tmp-ai-studio-quality-eval', new Date().toISOString().replace(/[:.]/g, '-'));
const categoryFilter = argValues.get('--category');
const idFilter = argValues.get('--id');
const limit = Number(argValues.get('--limit') || aiStudioQualityBenchmarks.length);
const skipExport = args.has('--skip-export');
let didUsePrisma = false;

function normalize(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function fuzzyIncludes(haystack: string, needle: string) {
  const normalizedHaystack = normalize(haystack);
  const normalizedNeedle = normalize(needle);

  if (!normalizedNeedle) return true;
  if (normalizedHaystack.includes(normalizedNeedle)) return true;

  const importantWords = normalizedNeedle.split(' ').filter((word) => word.length > 3);

  return importantWords.length > 0 && importantWords.every((word) => normalizedHaystack.includes(word));
}

function selectedBenchmarks() {
  return aiStudioQualityBenchmarks
    .filter((benchmark) => !categoryFilter || benchmark.category === categoryFilter)
    .filter((benchmark) => !idFilter || benchmark.id === idFilter)
    .slice(0, Number.isFinite(limit) && limit > 0 ? limit : aiStudioQualityBenchmarks.length);
}

function validateBenchmarkDefinitions(benchmarks: AiStudioQualityBenchmark[]) {
  const notes: string[] = [];
  const ids = new Set<string>();
  const duplicates = new Set<string>();

  benchmarks.forEach((benchmark) => {
    if (ids.has(benchmark.id)) duplicates.add(benchmark.id);
    ids.add(benchmark.id);

    if (!benchmark.prompt.trim()) notes.push(`${benchmark.id}: missing prompt`);
    if (!benchmark.expectedType.trim()) notes.push(`${benchmark.id}: missing expected type`);
    if (!benchmark.expectedStructure.trim()) notes.push(`${benchmark.id}: missing expected structure`);
    if (benchmark.tool === 'document' && (!benchmark.expectedSections || benchmark.expectedSections.length === 0)) {
      notes.push(`${benchmark.id}: document benchmark missing expected sections`);
    }
    if (benchmark.tool === 'spreadsheet' && (!benchmark.expectedSheets || benchmark.expectedSheets.length === 0)) {
      notes.push(`${benchmark.id}: spreadsheet benchmark missing expected sheets`);
    }
  });

  duplicates.forEach((id) => notes.push(`duplicate benchmark id: ${id}`));

  const missingCategories = aiStudioBenchmarkCategories.filter(
    (category) => !benchmarks.some((benchmark) => benchmark.category === category),
  );
  missingCategories.forEach((category) => notes.push(`missing selected category: ${category}`));

  return notes;
}

function requestBodyFor(benchmark: AiStudioQualityBenchmark) {
  if (benchmark.tool === 'document') {
    return {
      topic: benchmark.prompt,
      documentType: benchmark.requestOptions.documentType || 'report',
      tone: benchmark.requestOptions.tone || 'professional',
      length: benchmark.requestOptions.length || 'detailed',
    };
  }

  return {
    topic: benchmark.prompt,
    spreadsheetType: benchmark.requestOptions.spreadsheetType || 'budget',
    complexity: benchmark.requestOptions.complexity || 'detailed',
  };
}

function endpointFor(benchmark: AiStudioQualityBenchmark) {
  return benchmark.tool === 'document'
    ? '/api/ai-studio/document-maker/generate'
    : '/api/ai-studio/spreadsheet-maker/generate';
}

async function runGeneration(benchmark: AiStudioQualityBenchmark) {
  const startedAt = new Date();
  const start = Date.now();
  const response = await fetch(`${baseUrl}${endpointFor(benchmark)}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: cookie,
    },
    body: JSON.stringify(requestBodyFor(benchmark)),
  });
  const durationMs = Date.now() - start;
  const text = await response.text();

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${text.slice(0, 500)}`);
  }

  const parsed = JSON.parse(text) as { document?: unknown; spreadsheet?: unknown };

  return {
    output: benchmark.tool === 'document' ? parsed.document : parsed.spreadsheet,
    durationMs,
    startedAt,
  };
}

async function findUsageLog(benchmark: AiStudioQualityBenchmark, startedAt: Date) {
  if (!process.env.DATABASE_URL) {
    return null;
  }

  const { prisma } = await import('../lib/prisma');
  didUsePrisma = true;

  return prisma.aiStudioUsageLog.findFirst({
    where: {
      topic: benchmark.prompt,
      toolType: benchmark.tool,
      completedAt: { gte: startedAt },
    },
    orderBy: { completedAt: 'desc' },
    select: {
      inputTokens: true,
      outputTokens: true,
      totalTokens: true,
      providerCostUsd: true,
    },
  });
}

function assessDocument(benchmark: AiStudioQualityBenchmark, output: unknown) {
  const notes: string[] = [];
  const document = output as {
    executiveSummary?: unknown;
    sections?: Array<{ heading?: unknown; paragraphs?: unknown; bulletPoints?: unknown; tables?: unknown }>;
    recommendations?: unknown;
    keyInsights?: unknown;
  };
  const sections = Array.isArray(document.sections) ? document.sections : [];
  const headings = sections.map((section) => String(section.heading || ''));
  const missingSections = (benchmark.expectedSections || []).filter(
    (expected) => !headings.some((heading) => fuzzyIncludes(heading, expected) || fuzzyIncludes(expected, heading)),
  );
  const tableCount = sections.reduce((total, section) => total + (Array.isArray(section.tables) ? section.tables.length : 0), 0);
  const text = JSON.stringify(output);
  const checks = benchmark.minimumQualityChecks;

  if (sections.length < (checks.minSections || 0)) notes.push(`Expected at least ${checks.minSections} sections; found ${sections.length}.`);
  if (tableCount < (checks.minTables || 0)) notes.push(`Expected at least ${checks.minTables} tables; found ${tableCount}.`);
  if (checks.requireExecutiveSummary && !String(document.executiveSummary || '').trim()) notes.push('Missing executive summary.');
  if (checks.requireRecommendations && (!Array.isArray(document.recommendations) || document.recommendations.length === 0)) {
    notes.push('Missing recommendations.');
  }
  (checks.requiredTerms || []).forEach((term) => {
    if (!fuzzyIncludes(text, term)) notes.push(`Missing required term: ${term}.`);
  });
  (checks.forbiddenPhrases || []).forEach((phrase) => {
    if (fuzzyIncludes(text, phrase)) notes.push(`Contains forbidden phrase: ${phrase}.`);
  });

  return { missingSections, missingSheets: [] as string[], notes };
}

function assessSpreadsheet(benchmark: AiStudioQualityBenchmark, output: unknown) {
  const notes: string[] = [];
  const workbook = output as {
    sheets?: Array<{ sheetName?: unknown; columns?: unknown; rows?: unknown; formulas?: unknown }>;
    summaryMetrics?: unknown;
    chartSuggestions?: unknown;
  };
  const sheets = Array.isArray(workbook.sheets) ? workbook.sheets : [];
  const sheetNames = sheets.map((sheet) => String(sheet.sheetName || ''));
  const missingSheets = (benchmark.expectedSheets || []).filter(
    (expected) => !sheetNames.some((sheetName) => fuzzyIncludes(sheetName, expected) || fuzzyIncludes(expected, sheetName)),
  );
  const formulaCount = sheets.reduce((total, sheet) => total + (Array.isArray(sheet.formulas) ? sheet.formulas.length : 0), 0);
  const rowCount = sheets.reduce((total, sheet) => total + (Array.isArray(sheet.rows) ? sheet.rows.length : 0), 0);
  const text = JSON.stringify(output);
  const checks = benchmark.minimumQualityChecks;

  if (sheets.length < (checks.minSheets || 0)) notes.push(`Expected at least ${checks.minSheets} sheets; found ${sheets.length}.`);
  if (rowCount < (checks.minRows || 0)) notes.push(`Expected at least ${checks.minRows} rows; found ${rowCount}.`);
  if (formulaCount < (checks.minFormulas || 0)) notes.push(`Expected at least ${checks.minFormulas} formulas; found ${formulaCount}.`);
  if (checks.requireSummaryMetrics && (!Array.isArray(workbook.summaryMetrics) || workbook.summaryMetrics.length === 0)) {
    notes.push('Missing summary metrics.');
  }
  if (checks.requireChartSuggestions && (!Array.isArray(workbook.chartSuggestions) || workbook.chartSuggestions.length === 0)) {
    notes.push('Missing chart suggestions.');
  }
  (checks.requiredTerms || []).forEach((term) => {
    if (!fuzzyIncludes(text, term)) notes.push(`Missing required term: ${term}.`);
  });
  (checks.forbiddenPhrases || []).forEach((phrase) => {
    if (fuzzyIncludes(text, phrase)) notes.push(`Contains forbidden phrase: ${phrase}.`);
  });

  return { missingSections: [] as string[], missingSheets, notes };
}

async function exportOutput(benchmark: AiStudioQualityBenchmark, output: unknown, outputDir: string) {
  if (skipExport || !benchmark.minimumQualityChecks.exportRequired) {
    return { success: false, path: null, notes: ['Export skipped.'] };
  }

  try {
    if (benchmark.tool === 'document') {
      const buffer = await createProfessionalDocxBuffer(output as Parameters<typeof createProfessionalDocxBuffer>[0]);
      const exportPath = path.join(outputDir, `${benchmark.id}.docx`);
      writeFileSync(exportPath, buffer);
      const zip = new AdmZip(exportPath);
      const entries = new Set(zip.getEntries().map((entry) => entry.entryName));
      const requiredEntries = ['[Content_Types].xml', 'word/document.xml', 'word/styles.xml'];
      const missing = requiredEntries.filter((entry) => !entries.has(entry));

      return {
        success: missing.length === 0,
        path: exportPath,
        notes: missing.length > 0 ? [`DOCX missing package entries: ${missing.join(', ')}`] : [],
      };
    }

    const buffer = createProfessionalXlsxBuffer(output as Parameters<typeof createProfessionalXlsxBuffer>[0]);
    const exportPath = path.join(outputDir, `${benchmark.id}.xlsx`);
    writeFileSync(exportPath, buffer);
    const zip = new AdmZip(exportPath);
    const entries = new Set(zip.getEntries().map((entry) => entry.entryName));
    const requiredEntries = ['[Content_Types].xml', 'xl/workbook.xml', 'xl/styles.xml', 'xl/worksheets/sheet1.xml'];
    const missing = requiredEntries.filter((entry) => !entries.has(entry));
    const worksheetXml = zip.getEntries()
      .filter((entry) => entry.entryName.startsWith('xl/worksheets/'))
      .map((entry) => entry.getData().toString('utf8'))
      .join('\n');
    const formulaCount = (worksheetXml.match(/<f>/g) || []).length;
    const notes = [...(missing.length > 0 ? [`XLSX missing package entries: ${missing.join(', ')}`] : [])];

    if ((benchmark.minimumQualityChecks.minFormulas || 0) > 0 && formulaCount === 0) {
      notes.push('XLSX export has no real formula cells.');
    }

    return {
      success: missing.length === 0 && notes.length === 0,
      path: exportPath,
      notes,
    };
  } catch (error) {
    return {
      success: false,
      path: null,
      notes: [`Export failed: ${error instanceof Error ? error.message : String(error)}`],
    };
  }
}

function markdownReport(results: EvalResult[]) {
  const passed = results.filter((result) => result.status === 'pass').length;
  const failed = results.filter((result) => result.status === 'fail').length;
  const errored = results.filter((result) => result.status === 'error').length;
  const skipped = results.filter((result) => result.status === 'skipped').length;
  const lines = [
    '# AI Studio Quality Evaluation Report',
    '',
    `Generated: ${new Date().toISOString()}`,
    `Benchmarks: ${results.length}`,
    `Pass: ${passed}`,
    `Fail: ${failed}`,
    `Error: ${errored}`,
    `Skipped: ${skipped}`,
    '',
    '| ID | Category | Tool | Status | Missing sections | Missing sheets | Export | Duration | Tokens | Est. cost | Notes |',
    '| --- | --- | --- | --- | --- | --- | --- | ---: | ---: | ---: | --- |',
    ...results.map((result) => [
      result.id,
      result.category,
      result.tool,
      result.status.toUpperCase(),
      result.missingSections.join(', ') || '-',
      result.missingSheets.join(', ') || '-',
      result.exportSuccess ? 'pass' : 'fail',
      result.generationDurationMs === null ? '-' : `${result.generationDurationMs}ms`,
      result.totalTokens === null ? '-' : String(result.totalTokens),
      result.estimatedCostUsd || '-',
      result.notes.join(' ').replace(/\|/g, '/') || '-',
    ].join(' | ').replace(/^/, '| ').replace(/$/, ' |')),
  ];

  return `${lines.join('\n')}\n`;
}

async function main() {
  const benchmarks = selectedBenchmarks();
  const definitionNotes = validateBenchmarkDefinitions(aiStudioQualityBenchmarks);

  if (definitionNotes.length > 0) {
    console.error('Benchmark definition issues:');
    definitionNotes.forEach((note) => console.error(`- ${note}`));
    process.exitCode = 1;
    return;
  }

  if (!shouldRun) {
    console.log(`AI Studio quality benchmarks ready: ${aiStudioQualityBenchmarks.length} prompts across ${aiStudioBenchmarkCategories.length} categories.`);
    console.log('Dry run only. Use --run with AI_STUDIO_EVAL_COOKIE to execute generation.');
    return;
  }

  if (!cookie) {
    console.error('Missing AI_STUDIO_EVAL_COOKIE. Sign in locally, copy the session cookie, and rerun with --run.');
    process.exitCode = 1;
    return;
  }

  const outputDir = path.resolve(outputRoot);
  const jsonDir = path.join(outputDir, 'outputs');
  const exportDir = path.join(outputDir, 'exports');
  mkdirSync(jsonDir, { recursive: true });
  mkdirSync(exportDir, { recursive: true });

  const results: EvalResult[] = [];

  for (const benchmark of benchmarks) {
    console.log(`[ai-studio-quality] Running ${benchmark.id}`);

    try {
      const generation = await runGeneration(benchmark);
      const outputPath = path.join(jsonDir, `${benchmark.id}.json`);
      writeFileSync(outputPath, JSON.stringify(generation.output, null, 2));

      const assessment = benchmark.tool === 'document'
        ? assessDocument(benchmark, generation.output)
        : assessSpreadsheet(benchmark, generation.output);
      const exportResult = await exportOutput(benchmark, generation.output, exportDir);
      const usage = await findUsageLog(benchmark, generation.startedAt);
      const notes = [...assessment.notes, ...exportResult.notes];
      const status: EvalStatus =
        assessment.missingSections.length === 0 &&
        assessment.missingSheets.length === 0 &&
        notes.length === 0 &&
        exportResult.success
          ? 'pass'
          : 'fail';

      results.push({
        id: benchmark.id,
        category: benchmark.category,
        tool: benchmark.tool,
        prompt: benchmark.prompt,
        status,
        missingSections: assessment.missingSections,
        missingSheets: assessment.missingSheets,
        exportSuccess: exportResult.success,
        generationDurationMs: generation.durationMs,
        inputTokens: usage?.inputTokens ?? null,
        outputTokens: usage?.outputTokens ?? null,
        totalTokens: usage?.totalTokens ?? null,
        estimatedCostUsd: usage?.providerCostUsd?.toString() ?? null,
        outputPath,
        exportPath: exportResult.path,
        notes,
      });
    } catch (error) {
      results.push({
        id: benchmark.id,
        category: benchmark.category,
        tool: benchmark.tool,
        prompt: benchmark.prompt,
        status: 'error',
        missingSections: [],
        missingSheets: [],
        exportSuccess: false,
        generationDurationMs: null,
        inputTokens: null,
        outputTokens: null,
        totalTokens: null,
        estimatedCostUsd: null,
        outputPath: null,
        exportPath: null,
        notes: [error instanceof Error ? error.message : String(error)],
      });
    }
  }

  const reportJsonPath = path.join(outputDir, 'quality-report.json');
  const reportMdPath = path.join(outputDir, 'quality-report.md');
  writeFileSync(reportJsonPath, JSON.stringify({ generatedAt: new Date().toISOString(), results }, null, 2));
  writeFileSync(reportMdPath, markdownReport(results));

  console.log(`Quality report written to ${reportMdPath}`);
  console.log(`Raw results written to ${reportJsonPath}`);

  if (existsSync(reportMdPath) && results.some((result) => result.status === 'fail' || result.status === 'error')) {
    process.exitCode = 1;
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (didUsePrisma) {
      const { prisma } = await import('../lib/prisma');
      await prisma.$disconnect();
    }
  });
