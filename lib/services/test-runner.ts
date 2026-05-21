import { spawn } from 'child_process';
import { testLogger } from '@/lib/logging/logger';

interface TestResult {
  category: string;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  duration: number;
  status: 'passed' | 'failed';
  error?: string;
  output?: string;
}

/**
 * Simple test runner for a specific category
 * Spawns a Playwright test process and captures results
 */
export async function runCategoryTests(category: string): Promise<TestResult> {
  testLogger.info(`Starting tests for category: ${category}`);

  const testFile = getTestFileForCategory(category);
  const startTime = Date.now();

  return new Promise((resolve) => {
    const process = spawn('npx', ['playwright', 'test', testFile, '--workers=1'], {
      stdio: 'pipe',
      timeout: 3600000, // 1 hour timeout
    });

    let output = '';
    let errorOutput = '';

    process.stdout?.on('data', (data) => {
      output += data.toString();
      testLogger.debug(`[${category}] ${data.toString().trim()}`);
    });

    process.stderr?.on('data', (data) => {
      errorOutput += data.toString();
      testLogger.debug(`[${category}] Error: ${data.toString().trim()}`);
    });

    process.on('close', (code) => {
      const duration = (Date.now() - startTime) / 1000;

      try {
        const result = parsePlaywrightOutput(output, code === 0 ? 'passed' : 'failed');
        resolve({
          category,
          totalTests: result.totalTests,
          passedTests: result.passedTests,
          failedTests: result.failedTests,
          duration,
          status: code === 0 ? 'passed' : 'failed',
          output,
          error: errorOutput || undefined,
        });
      } catch (err) {
        testLogger.error(err, `Failed to parse test output for ${category}`);
        resolve({
          category,
          totalTests: 0,
          passedTests: 0,
          failedTests: 0,
          duration,
          status: 'failed',
          error: String(err),
          output,
        });
      }
    });

    process.on('error', (err) => {
      testLogger.error(err, `Process error for ${category}`);
      const duration = (Date.now() - startTime) / 1000;
      resolve({
        category,
        totalTests: 0,
        passedTests: 0,
        failedTests: 0,
        duration,
        status: 'failed',
        error: String(err),
      });
    });
  });
}

/**
 * Get test file path for category
 */
function getTestFileForCategory(category: string): string {
  const mapping: Record<string, string> = {
    'pdf-tools': 'tests/pdf-tools.spec.ts',
    'image-tools': 'tests/image-tools.spec.ts',
    'video-tools': 'tests/video-tools.spec.ts',
    'save-from-online': 'tests/save-from-online.spec.ts',
    'ai-writing-tools': 'tests/ai-writing-tools.spec.ts',
    'data-conversion-tools': 'tests/data-conversion-tools.spec.ts',
    'data-tools': 'tests/data-tools.spec.ts',
    'code-tools': 'tests/code-tools.spec.ts',
    'financial-calculators': 'tests/financial-calculators.spec.ts',
    'resume-maker': 'tests/resume-maker.spec.ts',
    'text-to-speech': 'tests/text-to-speech.spec.ts',
  };

  return mapping[category] || `tests/${category}.spec.ts`;
}

/**
 * Parse Playwright test output
 * Extracts pass/fail counts from Playwright's standard output
 */
function parsePlaywrightOutput(
  output: string,
  status: 'passed' | 'failed'
): { totalTests: number; passedTests: number; failedTests: number } {
  // Look for Playwright's summary line: "X passed, Y failed"
  const passMatch = output.match(/(\d+)\s+passed/);
  const failMatch = output.match(/(\d+)\s+failed/);

  const passedTests = passMatch ? parseInt(passMatch[1], 10) : 0;
  const failedTests = failMatch ? parseInt(failMatch[1], 10) : 0;
  const totalTests = passedTests + failedTests;

  return {
    totalTests,
    passedTests,
    failedTests,
  };
}
