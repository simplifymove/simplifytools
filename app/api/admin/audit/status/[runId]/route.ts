import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminApi } from '@/lib/auth/admin';
import { redactAuditText } from '@/lib/services/audit-response';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ runId: string }> }
) {
  try {
    const { response } = await requireAdminApi();
    if (response) return response;

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
      errorMessage: auditRun.errorMessage ? redactAuditText(auditRun.errorMessage) : null,
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
