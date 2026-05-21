import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { prisma } from '@/lib/prisma';
import { isAdminUser } from '@/lib/auth/admin';
import { spawn } from 'child_process';
import path from 'path';
import os from 'os';

// Map of tool categories to their test commands
const CATEGORY_TEST_COMMANDS: Record<string, string> = {
  'pdf': 'npm run test:pdf-tools',
  'image': 'npm run test:image-tools',
  'video': 'npm run test:video-tools',
  'ai-writing': 'npm run test:ai-writing',
  'document': 'npm run test:document-tools',
  'converter': 'npm run test:converter-tools',
  'compression': 'npm run test:compression',
  'extraction': 'npm run test:extraction',
  'validation': 'npm run test:validation',
  'formatting': 'npm run test:formatting',
  'optimization': 'npm run test:optimization',
};

const ALLOWED_COMMANDS = Object.values(CATEGORY_TEST_COMMANDS);

export async function POST(request: NextRequest) {
  try {
    // Verify admin access
    const isAdmin = await isAdminUser();
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized: Admin access required' },
        { status: 403 }
      );
    }

    // Get session for user ID
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id || 'unknown';

    const body = await request.json();
    const { categories } = body as { categories: string[] };

    if (!categories || !Array.isArray(categories) || categories.length === 0) {
      return NextResponse.json(
        { error: 'No categories provided' },
        { status: 400 }
      );
    }

    // Check for active runs to prevent duplicates
    const activeRun = await prisma.auditRun.findFirst({
      where: {
        status: 'RUNNING',
      },
    });

    if (activeRun) {
      return NextResponse.json(
        {
          error: 'A test run is already in progress. Please wait for it to complete.',
          activeRunId: activeRun.id,
        },
        { status: 409 }
      );
    }

    // Validate categories
    const invalidCategories = categories.filter(
      (cat) => !Object.keys(CATEGORY_TEST_COMMANDS).includes(cat)
    );

    if (invalidCategories.length > 0) {
      return NextResponse.json(
        { error: `Invalid categories: ${invalidCategories.join(', ')}` },
        { status: 400 }
      );
    }

    // Create audit run record
    const auditRun = await prisma.auditRun.create({
      data: {
        userId,
        categories: JSON.stringify(categories),
        status: 'PENDING',
      },
    });

    // Spawn test processes in background (non-blocking)

    Promise.resolve().then(() =>
      runTestsAsync(auditRun.id, categories, userId)
    ).catch((error) => {
      console.error('[Audit] Background test run failed:', error);
    });

    return NextResponse.json({
      runId: auditRun.id,
      status: 'started',
    });
  } catch (error) {
    console.error('[Audit] Failed to start test run:', error);
    return NextResponse.json(
      { error: 'Failed to start test run' },
      { status: 500 }
    );
  }
}

async function runTestsAsync(
  auditRunId: string,
  categories: string[],
  userId: string
): Promise<void> {
  try {
    // Update status to running
    await prisma.auditRun.update({
      where: { id: auditRunId },
      data: {
        status: 'RUNNING',
        startedAt: new Date(),
      },
    });

    const projectRoot = process.cwd();
    let totalTests = 0;
    let passedTests = 0;
    let failedTests = 0;
    let errorTests = 0;
    let skippedTests = 0;

    // Run tests for each category sequentially
    for (const category of categories) {
      const command = CATEGORY_TEST_COMMANDS[category];
      if (!command) continue;

      try {
        const testResults = await runTestCommand(command, projectRoot);

        // Update test results in database
        await Promise.all(
          testResults.map((result) =>
            prisma.auditTestResult.create({
              data: {
                auditRunId,
                category,
                ...result,
              },
            })
          )
        );

        // Aggregate stats
        totalTests += testResults.length;
        passedTests += testResults.filter((r) => r.status === 'pass').length;
        failedTests += testResults.filter((r) => r.status === 'fail').length;
        errorTests += testResults.filter((r) => r.status === 'error').length;
        skippedTests += testResults.filter((r) => r.status === 'skipped').length;
      } catch (categoryError) {
        console.error(
          `[Audit] Error running tests for ${category}:`,
          categoryError
        );
        errorTests += 1;
      }
    }

    // Calculate success percentage
    const successPercentage =
      totalTests > 0
        ? Math.round((passedTests / totalTests) * 100)
        : 0;

    // Update audit run with final results
    await prisma.auditRun.update({
      where: { id: auditRunId },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
        totalTests,
        passedTests,
        failedTests,
        errorTests,
        skippedTests,
        successPercentage,
      },
    });
  } catch (error) {
    console.error('[Audit] Test run failed:', error);

    await prisma.auditRun.update({
      where: { id: auditRunId },
      data: {
        status: 'FAILED',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      },
    });
  }
}

async function runTestCommand(
  command: string,
  projectRoot: string
): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const [cmd, ...args] = command.split(' ');
    let stdout = '';
    let stderr = '';

    const child = spawn(cmd, args, {
      cwd: projectRoot,
      shell: process.platform === 'win32',
      timeout: 600000, // 10 minutes
    });

    child.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    child.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    child.on('error', (error) => {
      reject(error);
    });

    child.on('close', (code) => {
      // Parse results from command output
      // This is a simplified version; actual parsing depends on your test format
      const results = parseTestOutput(stdout, stderr, code ?? 0);
      if (code === 0 || results.length > 0) {
        resolve(results);
      } else {
        reject(new Error(`Tests failed with code ${code}`));
      }
    });
  });
}

function parseTestOutput(
  stdout: string,
  stderr: string,
  code: number
): any[] {
  // Handle error cases first
  if (
    stderr.includes('command not found') ||
    stderr.includes('is not recognized')
  ) {
    return [
      {
        toolName: 'Test Setup',
        toolSlug: 'test-setup',
        url: '',
        testCase: 'Command availability check',
        status: 'ERROR',
        errorMessage:
          'Test command not available. Ensure Playwright is installed.',
        durationMs: 0,
      },
    ];
  }

  // Try to parse Playwright JSON report
  if (stdout.includes('"stats"')) {
    try {
      // Extract JSON from output
      const jsonMatch = stdout.match(/\{[\s\S]*"stats"[\s\S]*\}/);
      if (jsonMatch) {
        const json = JSON.parse(jsonMatch[0]);
        const results = [];

        // Add overall test execution result
        results.push({
          toolName: 'Batch Tests',
          toolSlug: 'batch-tests',
          url: '',
          testCase: 'All tests',
          status:
            json.stats?.expected > 0
              ? json.stats.expected > json.stats.failed
                ? 'PASS'
                : 'FAIL'
              : 'SKIPPED',
          errorMessage:
            json.stats?.failed > 0 ? `${json.stats.failed} tests failed` : null,
          outputGenerated: json.stats?.expected > 0,
          outputType: 'json',
          durationMs: json.stats?.duration || 0,
        });

        return results;
      }
    } catch (e) {
      console.error('[Audit] Failed to parse JSON:', e);
    }
  }

  // Fallback: basic status check
  if (code === 0) {
    return [
      {
        toolName: 'Tests',
        toolSlug: 'batch-test',
        url: '',
        testCase: 'Batch execution',
        status: 'PASS',
        durationMs: 0,
      },
    ];
  } else {
    return [
      {
        toolName: 'Tests',
        toolSlug: 'batch-test',
        url: '',
        testCase: 'Batch execution',
        status: 'ERROR',
        errorMessage:
          stderr.slice(0, 500) || 'Test execution failed with code ' + code,
        durationMs: 0,
      },
    ];
  }
}
