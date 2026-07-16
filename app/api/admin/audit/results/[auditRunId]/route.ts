import { NextRequest, NextResponse } from 'next/server';
import { requireAdminApi } from '@/lib/auth/admin';
import { prisma } from '@/lib/prisma';
import { apiLogger as logger } from '@/lib/logging/logger';
import { redactAuditText, sanitizeAuditValue, serializeAuditTestResult } from '@/lib/services/audit-response';

interface RouteParams {
  auditRunId: string;
}

function parseAuditRunMessage(errorMessage: string | null) {
  if (!errorMessage) return null;

  try {
    const parsed = JSON.parse(errorMessage);
    if (parsed?.type === 'audit-command-error') {
      return parsed;
    }
  } catch {
    return null;
  }

  return null;
}

function parseResultLogs(logs: string | null) {
  try { return logs ? JSON.parse(logs) : {}; } catch { return {}; }
}

function isCountedFailure(result: { status: string; logs: string | null }) {
  const outcome = parseResultLogs(result.logs).auditOutcome;
  return (result.status === 'FAIL' || result.status === 'ERROR')
    && !['SKIPPED_EXTERNAL', 'NOT_CONFIGURED', 'RATE_LIMITED', 'PROVIDER_UNAVAILABLE', 'PAID_PROVIDER_DISABLED'].includes(outcome);
}

function isNonComparableExternalOutcome(logs: Record<string, any>) {
  return ['SKIPPED_EXTERNAL', 'NOT_CONFIGURED', 'RATE_LIMITED', 'PROVIDER_UNAVAILABLE', 'PAID_PROVIDER_DISABLED'].includes(logs.auditOutcome);
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<RouteParams> }
) {
  try {
    const { response } = await requireAdminApi();
    if (response) return response;

    const { auditRunId } = await params;

    // Get audit run details
    const auditRun = await prisma.auditRun.findUnique({
      where: { id: auditRunId },
      include: {
        testResults: {
          orderBy: { timestamp: 'desc' },
          select: {
            id: true,
            category: true,
            toolName: true,
            toolSlug: true,
            url: true,
            testCase: true,
            status: true,
            errorMessage: true,
            outputGenerated: true,
            outputType: true,
            screenshotPath: true,
            durationMs: true,
            timestamp: true,
            logs: true,
          },
        },
      },
    });

    if (!auditRun) {
      return NextResponse.json({ error: 'Audit run not found' }, { status: 404 });
    }

    // Get failure records
    const failures = await prisma.failureRecord.findMany({
      where: { auditRunId },
      select: {
        id: true,
        toolName: true,
        category: true,
        testName: true,
        failureType: true,
        failureReason: true,
        isFlaky: true,
        occurrenceCount: true,
        firstSeenAt: true,
        lastSeenAt: true,
      },
    });

    const safeTestResults = auditRun.testResults.map((result) => serializeAuditTestResult(result));

    // Group test results by category
    const resultsByCategory = safeTestResults.reduce(
      (acc, result) => {
        if (!acc[result.category]) {
          acc[result.category] = [];
        }
        acc[result.category].push(result);
        return acc;
      },
      {} as Record<string, typeof safeTestResults>
    );

    // Calculate stats
    const stats = {
      totalTests: auditRun.totalTests,
      passedTests: auditRun.passedTests,
      failedTests: auditRun.failedTests,
      errorTests: auditRun.errorTests,
      skippedTests: auditRun.skippedTests,
      successPercentage: auditRun.successPercentage,
      duration: auditRun.completedAt && auditRun.startedAt 
        ? Math.round((auditRun.completedAt.getTime() - auditRun.startedAt.getTime()) / 1000)
        : null,
    };
    const commandError = sanitizeAuditValue(parseAuditRunMessage(auditRun.errorMessage));

    const previousRun = await prisma.auditRun.findFirst({
      where: {
        id: { not: auditRunId },
        status: { in: ['COMPLETED', 'FAILED'] },
        categories: auditRun.categories,
        completedAt: { lt: auditRun.completedAt || new Date() },
      },
      orderBy: { completedAt: 'desc' },
      include: {
        testResults: {
          select: {
            category: true,
            toolSlug: true,
            status: true,
            durationMs: true,
            outputType: true,
            logs: true,
          },
        },
      },
    });

    const targetKey = (result: { category: string; toolSlug: string }) => `${result.category}/${result.toolSlug}`;
    const currentFailed = new Set(
      auditRun.testResults
        .filter(isCountedFailure)
        .map(targetKey)
    );
    const previousFailed = new Set(
      previousRun?.testResults
        .filter(isCountedFailure)
        .map(targetKey) || []
    );
    const previousByTarget = new Map(previousRun?.testResults.map((result) => [targetKey(result), result]) || []);
    const statusChanges: Array<{ category: string; toolSlug: string; previous: string; current: string }> = [];
    const durationRegressions: Array<{ category: string; toolSlug: string; previousMs: number; currentMs: number; percentSlower: number }> = [];
    const outputSizeRegressions: Array<{ category: string; toolSlug: string; previousBytes: number; currentBytes: number; percentChange: number }> = [];
    const mimeOrExtensionChanges: Array<{ category: string; toolSlug: string; previous: string; current: string }> = [];
    const newConsoleErrors: Array<{ category: string; toolSlug: string; errors: string[] }> = [];
    const newApiErrors: Array<{ category: string; toolSlug: string; errors: string[] }> = [];

    for (const current of auditRun.testResults) {
      const previous = previousByTarget.get(targetKey(current));
      if (!previous) continue;
      const currentLogs = parseResultLogs(current.logs);
      const previousLogs = parseResultLogs(previous.logs);
      if (isNonComparableExternalOutcome(currentLogs) || isNonComparableExternalOutcome(previousLogs)) continue;
      if (previous.status !== current.status) statusChanges.push({ category: current.category, toolSlug: current.toolSlug, previous: previous.status, current: current.status });
      if (current.durationMs > previous.durationMs * 1.5 && current.durationMs - previous.durationMs >= 2_000) {
        durationRegressions.push({ category: current.category, toolSlug: current.toolSlug, previousMs: previous.durationMs, currentMs: current.durationMs,
          percentSlower: Number((((current.durationMs - previous.durationMs) / Math.max(previous.durationMs, 1)) * 100).toFixed(1)) });
      }
      const currentOutput = currentLogs.functionalEvidence?.output;
      const previousOutput = previousLogs.functionalEvidence?.output;
      if (currentOutput?.sizeBytes && previousOutput?.sizeBytes) {
        const change = ((currentOutput.sizeBytes - previousOutput.sizeBytes) / previousOutput.sizeBytes) * 100;
        if (Math.abs(change) > 40) outputSizeRegressions.push({ category: current.category, toolSlug: current.toolSlug, previousBytes: previousOutput.sizeBytes, currentBytes: currentOutput.sizeBytes, percentChange: Number(change.toFixed(1)) });
      }
      const currentType = `${currentOutput?.mimeType || current.outputType || ''}|${currentOutput?.extension || ''}`;
      const previousType = `${previousOutput?.mimeType || previous.outputType || ''}|${previousOutput?.extension || ''}`;
      if (currentType !== previousType) mimeOrExtensionChanges.push({ category: current.category, toolSlug: current.toolSlug, previous: previousType, current: currentType });
      const addedConsole = (currentLogs.consoleErrors || []).filter((error: string) => !(previousLogs.consoleErrors || []).includes(error));
      if (addedConsole.length) newConsoleErrors.push({ category: current.category, toolSlug: current.toolSlug, errors: addedConsole });
      const apiErrors = (logs: any) => (logs.functionalEvidence?.apiResponses || []).filter((response: any) => response.status >= 400).map((response: any) => `${response.method} ${response.url} ${response.status}`);
      const previousApiErrors = apiErrors(previousLogs);
      const addedApi = apiErrors(currentLogs).filter((error: string) => !previousApiErrors.includes(error));
      if (addedApi.length) newApiErrors.push({ category: current.category, toolSlug: current.toolSlug, errors: addedApi });
    }

    const comparison = {
      previousAuditRunId: previousRun?.id || null,
      newFailures: Array.from(currentFailed).filter((slug) => !previousFailed.has(slug)),
      fixedFailures: Array.from(previousFailed).filter((slug) => !currentFailed.has(slug)),
      previousPassRate: previousRun?.successPercentage ?? null,
      currentPassRate: auditRun.successPercentage,
      healthPercent: auditRun.successPercentage,
      passRateTrend: previousRun
        ? parseFloat((auditRun.successPercentage - previousRun.successPercentage).toFixed(2))
        : null,
      statusChanges,
      durationRegressions,
      outputSizeRegressions,
      mimeOrExtensionChanges,
      newConsoleErrors,
      newApiErrors,
    };

    return NextResponse.json({
      auditRun: {
        id: auditRun.id,
        categories: JSON.parse(auditRun.categories),
        status: auditRun.status,
        startedAt: auditRun.startedAt,
        completedAt: auditRun.completedAt,
        errorMessage: auditRun.errorMessage ? redactAuditText(auditRun.errorMessage) : null,
        commandError,
      },
      stats,
      testResults: safeTestResults,
      resultsByCategory,
      failures: failures.map((failure) => ({
        ...failure,
        failureReason: redactAuditText(failure.failureReason),
      })),
      comparison: sanitizeAuditValue(comparison),
    });
  } catch (error) {
    logger.error(error, 'Get audit results error');
    return NextResponse.json(
      { error: 'Failed to get audit results' },
      { status: 500 }
    );
  }
}
