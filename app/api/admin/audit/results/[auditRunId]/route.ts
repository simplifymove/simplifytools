import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/config';
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
    const session = await getServerSession(authOptions);
    if (!session?.user?.email || session.user.email !== 'raghavaboyidi@gmail.com') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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
    });
  } catch (error) {
    logger.error(error, 'Get audit results error');
    return NextResponse.json(
      { error: 'Failed to get audit results' },
      { status: 500 }
    );
  }
}
