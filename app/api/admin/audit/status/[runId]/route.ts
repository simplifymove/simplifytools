import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAdminUser } from '@/lib/auth/admin';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ runId: string }> }
) {
  try {
    // Verify admin access
    const isAdmin = await isAdminUser();
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized: Admin access required' },
        { status: 403 }
      );
    }

    const { runId } = await params;

    // Get current status
    const auditRun = await prisma.auditRun.findUnique({
      where: { id: runId },
      select: {
        id: true,
        status: true,
        totalTests: true,
        passedTests: true,
        failedTests: true,
        errorTests: true,
        skippedTests: true,
        successPercentage: true,
        startedAt: true,
        completedAt: true,
        errorMessage: true,
      },
    });

    if (!auditRun) {
      return NextResponse.json(
        { error: 'Audit run not found' },
        { status: 404 }
      );
    }

    // Get count of results processed so far
    const resultsCount = await prisma.auditTestResult.count({
      where: { auditRunId: runId },
    });

    return NextResponse.json({
      ...auditRun,
      resultsProcessed: resultsCount,
    });
  } catch (error) {
    console.error('[Audit] Failed to fetch status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch status' },
      { status: 500 }
    );
  }
}
