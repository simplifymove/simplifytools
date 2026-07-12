// lib/services/test-execution.ts
// Test execution logic - runs Playwright tests for categories and parses JSON reports

import { spawn, ChildProcess } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import { getAuditCategoryDefinition, getValidAuditCategoryIds } from '@/app/lib/audit-category-tools';

export interface TestResult {
  totalTests: number;
  passedTests: number;
  failedTests: number;
  errorTests: number;
  skippedTests: number;
  logs: any[];
  results?: any[];
  error?: string;
  stdout?: string;
  stderr?: string;
  command?: string;
  exitCode?: number;
  markerCount?: number;
  commandError?: string;
  expectedTools?: number;
  completedTools?: number;
}

export interface IndividualTestResult {
  testName: string;
  testCase: string;
  toolName?: string;
  toolSlug?: string;
  url?: string;
  passed: boolean;
  skipped: boolean;
  duration?: number;
  failureClass?: string;
  consoleErrors?: string[];
  error?: {
    message: string;
    stack?: string;
  };
  output?: string;
  stdout?: string;
  stderr?: string;
  outputGenerated?: boolean;
  outputType?: string;
  outputPath?: string;
  screenshotPath?: string;
  tracePath?: string;
}

export interface AuditProgressContext {
  completedToolsOffset?: number;
  totalTools?: number;
  passedToolsOffset?: number;
  failedToolsOffset?: number;
  skippedToolsOffset?: number;
  errorToolsOffset?: number;
}

// Global map to track spawned processes by auditRunId
const processRegistry = new Map<string, { process: ChildProcess; pid: number; category: string; startTime: number }>();

export function getProcessPid(auditRunId: string): number | null {
  const entry = processRegistry.get(auditRunId);
  return entry?.pid ?? null;
}

export function killAuditProcess(auditRunId: string): boolean {
  const entry = processRegistry.get(auditRunId);
  if (!entry) return false;

  try {
    const { process: childProc, pid, category } = entry;
    console.log(`[Audit:${auditRunId}] Killing Playwright process PID ${pid} (category: ${category})`);

    const isWindows = process.platform === 'win32';
    
    if (isWindows) {
      // Windows: Kill process tree with taskkill
      try {
        const { execSync } = require('child_process');
        execSync(`taskkill /PID ${pid} /T /F`, { stdio: 'ignore' });
        console.log(`[Audit:${auditRunId}] Successfully killed process PID ${pid} on Windows`);
      } catch (e) {
        console.warn(`[Audit:${auditRunId}] taskkill failed, trying childProcess.kill()`, e);
        if (!childProc.killed) {
          childProc.kill('SIGKILL');
        }
      }
    } else {
      // Unix/Linux: Kill process and process group
      try {
        const { execSync } = require('child_process');
        // Try to kill the process group (negative PID)
        execSync(`kill -9 -${pid}`, { stdio: 'ignore' });
        console.log(`[Audit:${auditRunId}] Successfully killed process group PID ${pid} on Unix`);
      } catch (e) {
        console.warn(`[Audit:${auditRunId}] kill -9 failed, trying childProcess.kill()`, e);
        if (!childProc.killed) {
          childProc.kill('SIGKILL');
        }
      }
    }

    processRegistry.delete(auditRunId);
    return true;
  } catch (error) {
    console.error(`[Audit:${auditRunId}] Error killing process:`, error);
    processRegistry.delete(auditRunId);
    return false;
  }
}

const CATEGORY_TEST_COMMANDS = {
  'pdf-tools': 'test:pdf-tools',
  'image-tools': 'test:image-tools',
  'video-tools': 'test:video-tools',
  'ai-writing-tools': 'test:ai-writing-tools',
  'data-conversion-tools': 'test:converter-tools',
  'data-tools': 'test:document-tools',  // Use document-tools as data-tools substitute
  'code-tools': 'test:validation',      // Use validation as code-tools substitute
  'financial-calculators': 'test:financial-calculators',
  'resume-maker': 'test:resume-maker',
  'save-from-online': 'test:save-from-online',
  'text-to-speech': 'test:text-to-speech',
};

const ALLOWED_COMMANDS = Object.keys(CATEGORY_TEST_COMMANDS) as (keyof typeof CATEGORY_TEST_COMMANDS)[];
const CONFIGURED_CATEGORIES = getValidAuditCategoryIds();
const AUDIT_MARKERS = [
  'AUDIT_TOOL_PROGRESS:',
  'AUDIT_TOOL_RESULT:',
  'AUDIT_TOOL_PROGRESS ',
  'AUDIT_TOOL_RESULT ',
] as const;

function stripAnsi(value: string) {
  return value.replace(/\x1B(?:[@-Z\\-_]|\[[0-?]*[ -/]*[@-~])/g, '');
}

function safeAuditDebug(message: string, details?: Record<string, unknown>) {
  if (process.env.AUDIT_DEBUG === 'true') {
    console.log(`[AuditDebug] ${message}`, details || '');
  }
}

function summarizeEnvForAudit() {
  return {
    NODE_ENV: process.env.NODE_ENV || '',
    BASE_URL: process.env.BASE_URL || '',
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || '',
    PLAYWRIGHT_TEST_BASE_URL: process.env.PLAYWRIGHT_TEST_BASE_URL || '',
    AUDIT_WORKERS: process.env.AUDIT_WORKERS || '',
    CI: process.env.CI || '',
    PDF_AUDIT_DEEP: process.env.PDF_AUDIT_DEEP || '',
  };
}

function tryParseMarkerPayload(text: string, markerIndex: number, marker: typeof AUDIT_MARKERS[number]) {
  const jsonStart = markerIndex + marker.length;
  let depth = 0;
  let inString = false;
  let escaped = false;
  let started = false;

  for (let index = jsonStart; index < text.length; index++) {
    const char = text[index];

    if (!started) {
      if (/\s/.test(char)) continue;
      if (char !== '{') return null;
      started = true;
      depth = 1;
      continue;
    }

    if (escaped) {
      escaped = false;
      continue;
    }

    if (char === '\\') {
      escaped = true;
      continue;
    }

    if (char === '"') {
      inString = !inString;
      continue;
    }

    if (inString) continue;

    if (char === '{') {
      depth++;
    } else if (char === '}') {
      depth--;
      if (depth === 0) {
        const payloadText = text.slice(jsonStart, index + 1).trim();
        const removeUntil = index + 1;

        try {
          return {
            event: JSON.parse(payloadText),
            removeUntil,
          };
        } catch {
          return {
            event: null,
            removeUntil,
          };
        }
      }
    }
  }

  return null;
}

function extractAuditMarkers(text: string) {
  const markers: Array<{ type: 'progress' | 'result'; event: any }> = [];
  let buffer = stripAnsi(text);

  while (buffer.length > 0) {
    const positions = AUDIT_MARKERS
      .map((marker) => ({ marker, index: buffer.indexOf(marker) }))
      .filter((item) => item.index !== -1)
      .sort((a, b) => a.index - b.index);

    const next = positions[0];
    if (!next) break;

    const parsed = tryParseMarkerPayload(buffer, next.index, next.marker);
    if (!parsed) break;

    if (parsed.event) {
      markers.push({
        type: next.marker.includes('RESULT') ? 'result' : 'progress',
        event: parsed.event,
      });
    }

    buffer = buffer.slice(parsed.removeUntil);
  }

  return markers;
}

class AuditMarkerStreamParser {
  private buffer = '';

  push(text: string) {
    this.buffer += stripAnsi(text);
    const markers: Array<{ type: 'progress' | 'result'; event: any }> = [];

    while (this.buffer.length > 0) {
      const positions = AUDIT_MARKERS
        .map((marker) => ({ marker, index: this.buffer.indexOf(marker) }))
        .filter((item) => item.index !== -1)
        .sort((a, b) => a.index - b.index);

      const next = positions[0];
      if (!next) {
        this.buffer = this.buffer.slice(Math.max(0, this.buffer.length - 512));
        break;
      }

      if (next.index > 0) {
        this.buffer = this.buffer.slice(next.index);
      }

      const parsed = tryParseMarkerPayload(this.buffer, 0, next.marker);
      if (!parsed) break;

      if (parsed.event) {
        markers.push({
          type: next.marker.includes('RESULT') ? 'result' : 'progress',
          event: parsed.event,
        });
      }

      this.buffer = this.buffer.slice(parsed.removeUntil);
    }

    return markers;
  }

  flush() {
    const markers = this.push('\n');
    this.buffer = '';
    return markers;
  }
}

async function prismaSafeProgressUpdate(
  auditRunId: string,
  progress: {
    currentTool: string;
    currentToolSlug: string;
    currentToolTitle: string;
    currentUrl: string;
    currentCategory: string;
    completedTools: number;
    totalTools: number;
    passedTools: number;
    failedTools: number;
    skippedTools: number;
    errorTools: number;
    startedAt: number;
    elapsedMs: number;
    elapsedTime: number;
    estimatedRemainingMs: number | null;
    estimatedRemainingTime: number | null;
    workerCount: string;
  }
) {
  const { prisma } = await import('@/lib/prisma');

  await prisma.auditRun.update({
    where: { id: auditRunId },
    data: {
      totalTests: progress.totalTools,
      passedTests: progress.passedTools,
      failedTests: progress.failedTools,
      skippedTests: progress.skippedTools,
      errorTests: progress.errorTools,
      successPercentage: progress.completedTools > 0
        ? parseFloat(((progress.passedTools / progress.completedTools) * 100).toFixed(2))
        : 0,
      updatedAt: new Date(),
      errorMessage: JSON.stringify({
        type: 'audit-progress',
        ...progress,
      }).substring(0, 2000),
    },
  });
}

// Function to check if audit is cancelled
async function checkAuditCancellation(auditRunId: string): Promise<boolean> {
  try {
    const { prisma } = await import('@/lib/prisma');
    const run = await prisma.auditRun.findUnique({
      where: { id: auditRunId },
      select: { status: true, errorMessage: true },
    });
    return run?.status === 'FAILED' && run?.errorMessage === 'Cancelled by admin';
  } catch (err) {
    return false;
  }
}

export async function runTestCommand(
  category: string,
  auditRunId?: string,
  workerCount: '1' | '2' | '4' | 'auto' = '1',
  progressContext: AuditProgressContext = {},
): Promise<TestResult> {
  // Validate category
  if (!CONFIGURED_CATEGORIES.includes(category as any) || !ALLOWED_COMMANDS.includes(category as any)) {
    return {
      totalTests: 0,
      passedTests: 0,
      failedTests: 0,
      errorTests: 1,
      skippedTests: 0,
      logs: [],
      error: `Invalid category: ${category}`,
    };
  }

  const scriptName = CATEGORY_TEST_COMMANDS[category as keyof typeof CATEGORY_TEST_COMMANDS];
  const command = process.platform === 'win32' ? 'npm.cmd' : 'npm';
  const commandArgs = ['run', scriptName];
  const commandLabel = `${command} ${commandArgs.join(' ')}`;
  const projectRoot = process.cwd();
  const categoryDefinition = getAuditCategoryDefinition(category);

  return new Promise((resolve) => {
    const startTime = Date.now();
    let stdout = '';
    let stderr = '';
    let isCancelled = false;
    let markersParsed = 0;
    const markerParser = new AuditMarkerStreamParser();
    let progressUpdateChain = Promise.resolve();
    const progressState = {
      currentTool: '',
      currentToolSlug: '',
      currentToolTitle: '',
      currentUrl: '',
      currentCategory: categoryDefinition?.name || category,
      completedTools: progressContext.completedToolsOffset || 0,
      totalTools: progressContext.totalTools || categoryDefinition?.tools.length || 0,
      passedTools: progressContext.passedToolsOffset || 0,
      failedTools: progressContext.failedToolsOffset || 0,
      skippedTools: progressContext.skippedToolsOffset || 0,
      errorTools: progressContext.errorToolsOffset || 0,
      startedAt: startTime,
      elapsedMs: 0,
      elapsedTime: 0,
      estimatedRemainingMs: null as number | null,
      estimatedRemainingTime: null as number | null,
      workerCount,
    };

    const updateAuditProgress = async (event: any, completed: boolean) => {
      if (!auditRunId) return;

      const offset = progressContext.completedToolsOffset || 0;
      const index = Number(event.index || Math.max(progressState.completedTools - offset, 0) + (completed ? 1 : 0));
      const total = Number(progressContext.totalTools || event.total || progressState.totalTools || 0);
      const elapsedMs = Date.now() - startTime;
      const completedTools = completed ? Math.max(progressState.completedTools, offset + index) : progressState.completedTools;
      const estimatedRemainingMs = completedTools > 0 && total > completedTools
        ? Math.round((elapsedMs / completedTools) * (total - completedTools))
        : null;
      const status = String(event.status || '').toLowerCase();
      const toolTitle = String(event.toolTitle || event.title || progressState.currentToolTitle || progressState.currentTool || '');
      const toolSlug = String(event.toolSlug || event.slug || progressState.currentToolSlug || '');
      const categoryName = String(event.categoryName || event.category || progressState.currentCategory || category);

      progressState.currentTool = toolTitle;
      progressState.currentToolSlug = toolSlug;
      progressState.currentToolTitle = toolTitle;
      progressState.currentUrl = String(event.url || progressState.currentUrl || '');
      progressState.currentCategory = categoryName;
      progressState.completedTools = completedTools;
      progressState.totalTools = total;
      progressState.elapsedMs = elapsedMs;
      progressState.elapsedTime = elapsedMs;
      progressState.estimatedRemainingMs = estimatedRemainingMs;
      progressState.estimatedRemainingTime = estimatedRemainingMs;

      if (completed) {
        if (status === 'passed') {
          progressState.passedTools += 1;
        } else if (status === 'skipped') {
          progressState.skippedTools += 1;
        } else {
          progressState.failedTools += 1;
        }
      }

      try {
        await prismaSafeProgressUpdate(auditRunId, progressState);
      } catch {
        // Progress updates are best-effort and should never fail the audit run.
      }
    };

    const handleAuditMarkers = (markers: Array<{ type: 'progress' | 'result'; event: any }>) => {
      for (const marker of markers) {
        markersParsed++;
        progressUpdateChain = progressUpdateChain.then(() => updateAuditProgress(marker.event, marker.type === 'result'));
        safeAuditDebug('marker parsed', {
          auditRunId,
          category,
          type: marker.type,
          slug: marker.event?.slug,
          title: marker.event?.title,
          status: marker.event?.status,
          index: marker.event?.index,
          total: marker.event?.total,
        });
      }
    };

    console.log(`[Test] Running: ${commandLabel}`);
    safeAuditDebug('command starting', {
      auditRunId,
      scriptName,
      command,
      args: commandArgs,
      cwd: projectRoot,
      env: summarizeEnvForAudit(),
      playwrightConfig: path.join(projectRoot, 'playwright.config.ts'),
    });

    const child = spawn(command, commandArgs, {
      cwd: projectRoot,
      shell: false,
      timeout: 600000, // 10 minutes
      env: {
        ...process.env,
        AUDIT_WORKERS: workerCount,
        PDF_AUDIT_DEEP: 'false',
      },
    });

    const pid = child.pid || 0;
    if (auditRunId && pid) {
      processRegistry.set(auditRunId, { process: child, pid, category, startTime });
      console.log(`[Audit:${auditRunId}] Started Playwright PID ${pid} for category: ${category}`);
      safeAuditDebug('child process started', { auditRunId, pid, category, scriptName, cwd: projectRoot });
    }

    // Setup cancellation check interval (check every 2 seconds)
    let cancellationCheckInterval: NodeJS.Timeout | null = null;
    if (auditRunId) {
      cancellationCheckInterval = setInterval(async () => {
        if (isCancelled) return;
        
        const cancelled = await checkAuditCancellation(auditRunId);
        if (cancelled) {
          console.log(`[Audit:${auditRunId}] Cancel request detected - killing PID ${pid}`);
          isCancelled = true;
          killAuditProcess(auditRunId);
          if (!child.killed) {
            child.kill('SIGKILL');
          }
        }
      }, 2000);
    }

    child.stdout?.on('data', (data) => {
      const text = data.toString();
      stdout += text;
      handleAuditMarkers(markerParser.push(text));
      console.log(`[Test:${category}] ${text.trim()}`);
    });

    child.stderr?.on('data', (data) => {
      const text = data.toString();
      stderr += text;
      console.error(`[Test:${category}] Error: ${text.trim()}`);
    });

    child.on('close', (code) => {
      if (cancellationCheckInterval) {
        clearInterval(cancellationCheckInterval);
      }

      const durationMs = Date.now() - startTime;

      if (isCancelled) {
        console.log(`[Audit:${auditRunId}] Process was cancelled (code: ${code}, duration: ${durationMs}ms)`);
        if (auditRunId) {
          processRegistry.delete(auditRunId);
        }
        resolve({
          totalTests: 0,
          passedTests: 0,
          failedTests: 0,
          errorTests: 0,
          skippedTests: 0,
          logs: [{
            category,
            message: 'Audit cancelled by admin',
            durationMs,
            timestamp: new Date(),
          }],
          error: 'Audit cancelled by admin',
        });
        return;
      }

      console.log(`[Test] ${commandLabel} completed with code ${code} (${durationMs}ms)`);
      safeAuditDebug('child process exited', {
        auditRunId,
        pid,
        category,
        scriptName,
        exitCode: code,
        durationMs,
        markersParsed,
        stdoutHead: stdout.split(/\r?\n/).filter(Boolean).slice(0, 8),
        stderrHead: stderr.split(/\r?\n/).filter(Boolean).slice(0, 8),
      });

      // Parse Playwright output and JSON report
      handleAuditMarkers(markerParser.flush());

      progressUpdateChain
        .then(() => parsePlaywrightResults(stdout, stderr, code ?? 1, category, durationMs, commandLabel))
        .then(result => {
          if (auditRunId) {
            processRegistry.delete(auditRunId);
          }
          resolve(result);
        })
        .catch(error => {
          console.error(`[Test] Failed to parse results for ${category}:`, error);
          if (auditRunId) {
            processRegistry.delete(auditRunId);
          }
          resolve({
            totalTests: 0,
            passedTests: 0,
            failedTests: 0,
            errorTests: 1,
            skippedTests: 0,
            logs: [{
              category,
              command: commandLabel,
              exitCode: code,
              stdout: stdout.substring(0, 1000),
              stderr: stderr.substring(0, 1000),
              durationMs,
              error: error instanceof Error ? error.message : 'Unknown parsing error',
              timestamp: new Date(),
            }],
            error: `Failed to parse test results: ${error instanceof Error ? error.message : 'Unknown error'}`,
          });
        });
    });

    child.on('error', (error) => {
      if (cancellationCheckInterval) {
        clearInterval(cancellationCheckInterval);
      }

      console.error(`[Test] Failed to run ${commandLabel}:`, error);
      if (auditRunId) {
        processRegistry.delete(auditRunId);
      }

      resolve({
        totalTests: 0,
        passedTests: 0,
        failedTests: 0,
        errorTests: 1,
        skippedTests: 0,
        logs: [{
          category,
          error: error.message,
          timestamp: new Date(),
        }],
        error: `Failed to execute test: ${error.message}`,
      });
    });

    // Timeout after 10 minutes
    setTimeout(() => {
      if (!child.killed) {
        child.kill('SIGTERM');
      }
    }, 600000);
  });
}

/**
 * Recursively walk Playwright report structure to extract all tests
 */
function walkPlaywrightReport(node: any, results: IndividualTestResult[], category: string): void {
  if (!node) return;

  // Process specs (test files) - each spec has tests array
  if (node.specs && Array.isArray(node.specs)) {
    for (const spec of node.specs) {
      if (spec.tests && Array.isArray(spec.tests)) {
        for (const test of spec.tests) {
          const execution =
            Array.isArray(test.results) && test.results.length > 0
              ? test.results[test.results.length - 1]
              : undefined;
          const testStatus = execution?.status || test.status || 'unknown';
          const testPassed = testStatus === 'passed';
          const testSkipped = testStatus === 'skipped';
          const executionError = execution?.errors?.[0] || execution?.error || test.error;
          const stdoutEntries = execution?.stdout || test.stdout;
          const stderrEntries = execution?.stderr || test.stderr;
          const attachments = Array.isArray(execution?.attachments)
            ? execution.attachments
            : test.attachments;
          const formatOutput = (entries: any): string =>
            Array.isArray(entries)
              ? entries
                  .map((entry) => typeof entry === 'string' ? entry : entry?.text)
                  .filter((text): text is string => typeof text === 'string')
                  .join('\n')
              : '';

          const testTitle = test.title || spec.title || 'Unknown test';
          const toolName = typeof testTitle === 'string' && testTitle.includes(' :: ')
            ? testTitle.split(' :: ')[0]
            : category;

          const testResult: IndividualTestResult = {
            testName: testTitle,
            testCase: testTitle,
            toolName,
            passed: testPassed,
            skipped: testSkipped,
            duration: (execution?.duration ?? test.duration ?? 0) / 1000, // Convert ms to seconds
            output: executionError?.message || '',
            stdout: formatOutput(stdoutEntries),
            stderr: formatOutput(stderrEntries),
            error: executionError ? {
              message: executionError.message || 'Test failed',
              stack: executionError.stack,
            } : undefined,
          };

          // Add attachment info (screenshots, traces, videos)
          if (Array.isArray(attachments)) {
            for (const attachment of attachments) {
              if (
                attachment.contentType === 'image/png' ||
                attachment.contentType === 'image/jpeg'
              ) {
                testResult.screenshotPath = attachment.path;
              } else if (
                attachment.contentType === 'application/zip' ||
                attachment.contentType === 'video/webm'
              ) {
                testResult.tracePath = attachment.path;
              }
            }
          }

          results.push(testResult);
        }
      }
    }
  }

  // Recursively process nested suites
  if (node.suites && Array.isArray(node.suites)) {
    for (const suite of node.suites) {
      walkPlaywrightReport(suite, results, category);
    }
  }
}

function parseAuditToolMarkers(stdout: string): Map<string, any> {
  const markers = new Map<string, any>();

  for (const marker of extractAuditMarkers(stdout)) {
    if (marker.type !== 'result') continue;

    const payload = marker.event;
    const slug = payload?.toolSlug || payload?.slug;
    if (slug) {
      markers.set(String(slug), payload);
    }
  }

  return markers;
}

function markerToIndividualTestResult(marker: any, category: string): IndividualTestResult {
  const passed = String(marker.status || '').toLowerCase() === 'passed';
  const skipped = String(marker.status || '').toLowerCase() === 'skipped';
  const message = typeof marker.reason === 'string' ? marker.reason : undefined;
  const toolSlug = marker.toolSlug || marker.slug;
  const toolTitle = marker.toolTitle || marker.title || toolSlug || category;

  return {
    testName: toolTitle,
    testCase: toolTitle || 'Tool audit',
    toolName: toolTitle,
    toolSlug,
    url: marker.url,
    passed,
    skipped,
    duration: typeof marker.durationMs === 'number' ? marker.durationMs / 1000 : undefined,
    failureClass: marker.failureClass || (!passed && !skipped ? classifyAuditFailure(message) : undefined),
    consoleErrors: Array.isArray(marker.consoleErrors) ? marker.consoleErrors : [],
    error: !passed && !skipped
      ? {
          message: message || 'Tool audit failed',
        }
      : undefined,
    output: message,
    screenshotPath: marker.screenshotPath,
  };
}

function classifyAuditFailure(message?: string): string {
  const text = message || '';

  if (/404|not found|could not be found/i.test(text)) return 'Route not found (404)';
  if (/500|internal server error|server error/i.test(text)) return 'Server error (500)';
  if (/primary heading|visible h1|Missing H1/i.test(text)) return 'Missing H1';
  if (/hydration/i.test(text)) return 'Hydration error';
  if (/TypeError|ReferenceError|SyntaxError|exception|Unhandled/i.test(text)) return 'JavaScript exception';
  if (/fatal client errors|console/i.test(text)) return 'Console error';
  if (/infinite loading|Loading|Processing/i.test(text)) return 'Infinite loading';
  if (/interactive UI|main UI/i.test(text)) return 'Missing main UI';
  if (/timeout|timed out/i.test(text)) return 'Timeout';
  if (/ECONN|ENOTFOUND|net::|network/i.test(text)) return 'Network failure';
  if (/browserType\.launch|playwright|locator|expect\(/i.test(text)) return 'Playwright failure';

  return 'Unknown';
}

export function mapAuditFailureToFailureType(failureClass?: string): string {
  switch (failureClass) {
    case 'Timeout':
      return 'TIMEOUT';
    case 'Network failure':
      return 'NETWORK_FAILURE';
    case 'Server error (500)':
    case 'JavaScript exception':
    case 'Hydration error':
      return 'BACKEND_CRASH';
    case 'Missing H1':
    case 'Missing main UI':
    case 'Infinite loading':
    case 'Playwright failure':
      return 'PLAYWRIGHT_SELECTOR';
    case 'Route not found (404)':
      return 'VALIDATION_ERROR';
    default:
      return 'UNKNOWN';
  }
}

/**
 * Parse Playwright results from stdout and JSON report file
 */
async function parsePlaywrightResults(
  stdout: string,
  stderr: string,
  exitCode: number,
  category: string,
  durationMs: number,
  commandLabel: string,
): Promise<TestResult> {
  const logs = [];
  let totalTests = 0;
  let passedTests = 0;
  let failedTests = 0;
  let skippedTests = 0;
  const results: IndividualTestResult[] = [];
  const auditMarkers = parseAuditToolMarkers(stdout);
  const expectedTools = getAuditCategoryDefinition(category)?.tools.length || 0;

  // Try to read and parse the JSON report file
  const reportPath = path.join(process.cwd(), 'playwright-report', 'report.json');

  try {
    // Check if file exists
    try {
      await fs.access(reportPath);
    } catch {
      throw new Error(`JSON report file not found at ${reportPath}`);
    }

    const reportContent = await fs.readFile(reportPath, 'utf-8');
    const report = JSON.parse(reportContent);

    console.log(`[Test] JSON Report structure keys: ${Object.keys(report).join(', ')}`);
    console.log(`[Test] Report path: ${reportPath}`);

    // Recursively walk the report structure
    walkPlaywrightReport(report, results, category);

    // Count test statuses
    for (const result of results) {
      totalTests++;
      if (result.passed) {
        passedTests++;
      } else if (result.skipped) {
        skippedTests++;
      } else {
        failedTests++;
      }
    }

    console.log(
      `[Test] Parsed ${results.length} test results from JSON report for ${category}: ${passedTests} passed, ${failedTests} failed, ${skippedTests} skipped`
    );

    for (const result of results) {
      const marker = auditMarkers.get(result.toolName || '');
      const message = result.error?.message || marker?.reason || result.output || '';

      if (marker) {
        result.toolName = marker.title || result.toolName;
        result.toolSlug = marker.slug || result.toolSlug;
        result.url = marker.url || result.url;
        result.duration = typeof marker.durationMs === 'number' ? marker.durationMs / 1000 : result.duration;
        result.failureClass = marker.failureClass || (result.passed ? undefined : classifyAuditFailure(message));
        result.consoleErrors = Array.isArray(marker.consoleErrors) ? marker.consoleErrors : result.consoleErrors;
        if (marker.screenshotPath) {
          result.screenshotPath = marker.screenshotPath;
        }
      } else if (!result.passed && !result.skipped) {
        result.failureClass = classifyAuditFailure(message);
      }
    }

    // Log sample test if available
    if (results.length > 0) {
      console.log(`[Test] Sample test: ${results[0].testName} - ${results[0].passed ? 'PASSED' : results[0].skipped ? 'SKIPPED' : 'FAILED'}`);
    }
  } catch (reportError) {
    const errorMsg = reportError instanceof Error ? reportError.message : String(reportError);
    console.warn(`[Test] Could not parse JSON report for ${category}:`, errorMsg);

    // Try to log file details for debugging
    try {
      const stats = await fs.stat(reportPath);
      console.warn(`[Test] Report file exists: size=${stats.size} bytes`);
      
      // Read and log first 1000 chars of file
      const content = await fs.readFile(reportPath, 'utf-8');
      console.warn(`[Test] Report file first 1000 chars:\n${content.substring(0, 1000)}`);
    } catch (statsError) {
      console.warn(`[Test] Could not read report file at all:`, statsError instanceof Error ? statsError.message : String(statsError));
    }

    // Fall back to parsing stdout if report not found
    if (auditMarkers.size > 0) {
      console.log(`[Test] Falling back to ${auditMarkers.size} AUDIT_TOOL_RESULT markers for ${category}`);

      for (const marker of auditMarkers.values()) {
        const result = markerToIndividualTestResult(marker, category);
        results.push(result);
        totalTests++;
        if (result.passed) {
          passedTests++;
        } else if (result.skipped) {
          skippedTests++;
        } else {
          failedTests++;
        }
      }
    } else {
      console.log(`[Test] Falling back to stdout summary parsing for ${category}`);
      const { passedMatch, failedMatch, skippedMatch } = parsePlaywrightSummary(stdout);
      passedTests = passedMatch;
      failedTests = failedMatch;
      skippedTests = skippedMatch;
      totalTests = passedTests + failedTests + skippedTests;
    }
    
    console.log(`[Test] From stdout: ${passedTests} passed, ${failedTests} failed, ${skippedTests} skipped`);
  }

  // Extract error messages from stdout
  const errorLines = stdout.split('\n').filter((line) =>
    line.includes('Error') || line.includes('FAIL') || line.includes('error') || line.includes('Expected')
  );
  const failureReason =
    exitCode !== 0 && totalTests === 0
      ? summarizeCommandFailure(stdout, stderr, category)
      : undefined;

  logs.push({
    category,
    command: commandLabel,
    expectedTools,
    completedTools: totalTests,
    totalTests,
    passedTests,
    failedTests,
    skippedTests,
    durationMs,
    errors: errorLines.slice(0, 5),
    exitCode,
    stdout: stdout.substring(0, 2000),
    stderr: stderr.substring(0, 1000),
    error: failureReason,
    timestamp: new Date(),
  });

  const errorTests = exitCode !== 0 ? (failedTests > 0 ? 0 : 1) : 0;
  const commandError = totalTests === 0 && exitCode !== 0
    ? failureReason || summarizeCommandFailure(stdout, stderr, category)
    : undefined;

  safeAuditDebug('final counters', {
    category,
    expectedTools,
    completedTools: totalTests,
    passedTests,
    failedTests,
    skippedTests,
    errorTests,
    markerCount: auditMarkers.size,
    exitCode,
    commandError,
  });

  return {
    totalTests,
    passedTests,
    failedTests,
    errorTests,
    skippedTests,
    logs,
    results,
    error: failureReason,
    stdout,
    stderr,
    command: commandLabel,
    exitCode,
    markerCount: auditMarkers.size,
    commandError,
    expectedTools,
    completedTools: totalTests,
  };
}

function summarizeCommandFailure(stdout: string, stderr: string, category: string): string {
  const combinedOutput = `${stderr}\n${stdout}`
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  const meaningfulLine = combinedOutput.find((line) =>
    /no tests found|cannot find|not found|error|failed|missing|unknown/i.test(line)
  );

  if (meaningfulLine) {
    return meaningfulLine.substring(0, 500);
  }

  return `Audit command for ${category} exited without producing test results. Check the mapped npm script and Playwright report output.`;
}

/**
 * Parse Playwright summary from stdout
 */
function parsePlaywrightSummary(output: string): { passedMatch: number; failedMatch: number; skippedMatch: number } {
  let passedMatch = 0;
  let failedMatch = 0;
  let skippedMatch = 0;

  if (output.includes('passed')) {
    const match = output.match(/(\d+)\s+passed/);
    passedMatch = match ? parseInt(match[1], 10) : 0;
  }

  if (output.includes('failed')) {
    const match = output.match(/(\d+)\s+failed/);
    failedMatch = match ? parseInt(match[1], 10) : 0;
  }

  if (output.includes('skipped')) {
    const match = output.match(/(\d+)\s+skipped/);
    skippedMatch = match ? parseInt(match[1], 10) : 0;
  }

  return { passedMatch, failedMatch, skippedMatch };
}

function parsePlaywrightOutput(
  output: string,
  category: string,
  durationMs: number,
): TestResult {
  const logs = [];

  // Try to parse Playwright summary line
  // Example: "✓ 45 passed (5.2s)"
  const summaryMatch = output.match(
    /✓\s+(\d+)\s+passed|✗\s+(\d+)\s+failed|⊘\s+(\d+)\s+skipped/gm,
  );

  let totalTests = 0;
  let passedTests = 0;
  let failedTests = 0;
  let skippedTests = 0;

  if (output.includes('failed')) {
    const failedMatch = output.match(/(\d+)\s+failed/);
    failedTests = failedMatch ? parseInt(failedMatch[1]) : 0;
  }

  if (output.includes('passed')) {
    const passedMatch = output.match(/(\d+)\s+passed/);
    passedTests = passedMatch ? parseInt(passedMatch[1]) : 0;
  }

  if (output.includes('skipped')) {
    const skippedMatch = output.match(/(\d+)\s+skipped/);
    skippedTests = skippedMatch ? parseInt(skippedMatch[1]) : 0;
  }

  totalTests = passedTests + failedTests + skippedTests || 1;

  // Extract error messages if any
  const errorLines = output.split('\n').filter((line) =>
    line.includes('Error') || line.includes('FAIL') || line.includes('error')
  );

  logs.push({
    category,
    totalTests,
    passedTests,
    failedTests,
    skippedTests,
    durationMs,
    errors: errorLines.slice(0, 5), // First 5 error lines
    timestamp: new Date(),
  });

  return {
    totalTests,
    passedTests,
    failedTests,
    errorTests: failedTests > 0 ? 1 : 0,
    skippedTests,
    logs,
  };
}

// Run all tests for categories
export async function runMultipleCategoryTests(categories: string[]): Promise<TestResult> {
  let totalTests = 0;
  let passedTests = 0;
  let failedTests = 0;
  let errorTests = 0;
  let skippedTests = 0;
  const allLogs: any[] = [];

  for (const category of categories) {
    const result = await runTestCommand(category);
    totalTests += result.totalTests;
    passedTests += result.passedTests;
    failedTests += result.failedTests;
    errorTests += result.errorTests;
    skippedTests += result.skippedTests;
    allLogs.push(...result.logs);
  }

  return {
    totalTests,
    passedTests,
    failedTests,
    errorTests,
    skippedTests,
    logs: allLogs,
  };
}

// Store test artifacts
export async function storeArtifacts(
  auditRunId: string,
  category: string,
  artifacts: {
    screenshots?: string[];
    logs?: string;
    reports?: string[];
  },
): Promise<string> {
  const artifactDir = path.join(
    process.cwd(),
    'public',
    'audit-runs',
    auditRunId,
    category,
  );

  try {
    await fs.mkdir(artifactDir, { recursive: true });

    // Store screenshots
    if (artifacts.screenshots) {
      for (const screenshot of artifacts.screenshots) {
        const filename = path.basename(screenshot);
        await fs.copyFile(
          screenshot,
          path.join(artifactDir, filename),
        );
      }
    }

    // Store logs
    if (artifacts.logs) {
      await fs.writeFile(
        path.join(artifactDir, 'logs.json'),
        artifacts.logs,
      );
    }

    // Store reports
    if (artifacts.reports) {
      for (const report of artifacts.reports) {
        const filename = path.basename(report);
        await fs.copyFile(
          report,
          path.join(artifactDir, filename),
        );
      }
    }

    return artifactDir;
  } catch (error) {
    console.error('Failed to store artifacts:', error);
    throw error;
  }
}
