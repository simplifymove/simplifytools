// lib/services/test-execution.ts
// Test execution logic - runs Playwright tests for categories and parses JSON reports

import { spawn, ChildProcess } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';

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
}

export interface IndividualTestResult {
  testName: string;
  testCase: string;
  toolName?: string;
  passed: boolean;
  skipped: boolean;
  duration?: number;
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
  'pdf-tools': 'npm run test:pdf-tools',
  'image-tools': 'npm run test:image-tools',
  'video-tools': 'npm run test:video-tools',
  'ai-writing-tools': 'npm run test:ai-writing',
  'data-conversion-tools': 'npm run test:converter-tools',
  'data-tools': 'npm run test:document-tools',  // Use document-tools as data-tools substitute
  'code-tools': 'npm run test:validation',      // Use validation as code-tools substitute
  // Note: save-from-online, financial-calculators, resume-maker, text-to-speech
  // don't have test scripts yet, so they won't be available in audit
};

const ALLOWED_COMMANDS = Object.keys(CATEGORY_TEST_COMMANDS) as (keyof typeof CATEGORY_TEST_COMMANDS)[];

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
  auditRunId?: string
): Promise<TestResult> {
  // Validate category
  if (!ALLOWED_COMMANDS.includes(category as any)) {
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

  const command = CATEGORY_TEST_COMMANDS[category as keyof typeof CATEGORY_TEST_COMMANDS];
  const projectRoot = process.cwd();

  return new Promise((resolve) => {
    const startTime = Date.now();
    let stdout = '';
    let stderr = '';
    let isCancelled = false;

    console.log(`[Test] Running: ${command}`);

    const child = spawn(command, [], {
      cwd: projectRoot,
      shell: process.platform === 'win32',
      timeout: 600000, // 10 minutes
    });

    const pid = child.pid || 0;
    if (auditRunId && pid) {
      processRegistry.set(auditRunId, { process: child, pid, category, startTime });
      console.log(`[Audit:${auditRunId}] Started Playwright PID ${pid} for category: ${category}`);
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

      console.log(`[Test] ${command} completed with code ${code} (${durationMs}ms)`);

      // Parse Playwright output and JSON report
      parsePlaywrightResults(stdout, stderr, code ?? 1, category, durationMs)
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
              command,
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

      console.error(`[Test] Failed to run ${command}:`, error);
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
          const testStatus = test.status || 'unknown';
          const testPassed = testStatus === 'passed';
          const testSkipped = testStatus === 'skipped';

          const testResult: IndividualTestResult = {
            testName: test.title || spec.title || 'Unknown test',
            testCase: test.title || spec.title || 'Unknown test',
            toolName: category,
            passed: testPassed,
            skipped: testSkipped,
            duration: test.duration ? test.duration / 1000 : 0, // Convert ms to seconds
            output: test.error?.message || '',
            stdout: test.stdout?.join('\n') || '',
            stderr: test.stderr?.join('\n') || '',
            error: test.error ? {
              message: test.error.message || 'Test failed',
              stack: test.error.stack,
            } : undefined,
          };

          // Add attachment info (screenshots, traces, videos)
          if (test.attachments && Array.isArray(test.attachments)) {
            for (const attachment of test.attachments) {
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

/**
 * Parse Playwright results from stdout and JSON report file
 */
async function parsePlaywrightResults(
  stdout: string,
  stderr: string,
  exitCode: number,
  category: string,
  durationMs: number,
): Promise<TestResult> {
  const logs = [];
  let totalTests = 0;
  let passedTests = 0;
  let failedTests = 0;
  let skippedTests = 0;
  const results: IndividualTestResult[] = [];

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
    console.log(`[Test] Falling back to stdout parsing for ${category}`);
    const { passedMatch, failedMatch, skippedMatch } = parsePlaywrightSummary(stdout);
    passedTests = passedMatch;
    failedTests = failedMatch;
    skippedTests = skippedMatch;
    totalTests = passedTests + failedTests + skippedTests;
    
    console.log(`[Test] From stdout: ${passedTests} passed, ${failedTests} failed, ${skippedTests} skipped`);
  }

  // Extract error messages from stdout
  const errorLines = stdout.split('\n').filter((line) =>
    line.includes('Error') || line.includes('FAIL') || line.includes('error') || line.includes('Expected')
  );

  logs.push({
    category,
    totalTests,
    passedTests,
    failedTests,
    skippedTests,
    durationMs,
    errors: errorLines.slice(0, 5),
    exitCode,
    stdout: stdout.substring(0, 2000),
    stderr: stderr.substring(0, 1000),
    timestamp: new Date(),
  });

  const errorTests = exitCode !== 0 ? (failedTests > 0 ? 0 : 1) : 0;

  return {
    totalTests,
    passedTests,
    failedTests,
    errorTests,
    skippedTests,
    logs,
    results,
  };
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
