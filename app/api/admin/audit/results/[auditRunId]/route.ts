import { NextRequest, NextResponse } from 'next/server';
import { requireAdminApi } from '@/lib/auth/admin';
import { prisma } from '@/lib/prisma';
import { apiLogger as logger } from '@/lib/logging/logger';

interface RouteParams {
  auditRunId: string;
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
            outputPath: true,
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

    // Group test results by category
    const resultsByCategory = auditRun.testResults.reduce(
      (acc, result) => {
        if (!acc[result.category]) {
          acc[result.category] = [];
        }
        acc[result.category].push(result);
        return acc;
      },
      {} as Record<string, typeof auditRun.testResults>
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
            toolSlug: true,
            status: true,
          },
        },
      },
    });

    const currentFailed = new Set(
      auditRun.testResults
        .filter((result) => result.status === 'FAIL' || result.status === 'ERROR')
        .map((result) => result.toolSlug)
    );
    const previousFailed = new Set(
      previousRun?.testResults
        .filter((result) => result.status === 'FAIL' || result.status === 'ERROR')
        .map((result) => result.toolSlug) || []
    );

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
    };

    return NextResponse.json({
      auditRun: {
        id: auditRun.id,
        categories: JSON.parse(auditRun.categories),
        status: auditRun.status,
        startedAt: auditRun.startedAt,
        completedAt: auditRun.completedAt,
      },
      stats,
      testResults: auditRun.testResults,
      resultsByCategory,
      failures,
      comparison,
    });
  } catch (error) {
    logger.error(error, 'Get audit results error');
    return NextResponse.json(
      { error: 'Failed to get audit results' },
      { status: 500 }
    );
  }
}
