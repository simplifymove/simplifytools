// app/api/admin/audit/jobs/[id]/route.ts
// Get audit job status and details

import { NextRequest, NextResponse } from 'next/server';
import { requireAdminApi } from '@/lib/auth/admin';
import { getJobStatus } from '@/lib/queue/client';
import { prisma } from '@/lib/prisma';
import { redactAuditText, sanitizeAuditValue } from '@/lib/services/audit-response';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { response } = await requireAdminApi();
    if (response) return response;

    const { id } = await params;

    // Get job from database
    const auditJob = await prisma.auditJob.findUnique({
      where: { id },
      include: {
        auditRun: {
          select: {
            id: true,
            totalTests: true,
            passedTests: true,
            failedTests: true,
            errorTests: true,
            skippedTests: true,
            successPercentage: true,
            startedAt: true,
            completedAt: true,
          },
        },
      },
    });

    if (!auditJob) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    // Get queue job status if still processing
    let queueStatus = null;
    if (auditJob.status === 'PROCESSING' || auditJob.status === 'RETRYING') {
      try {
        queueStatus = await getJobStatus(id);
      } catch (error) {
        console.error('Failed to get queue status:', error);
      }
    }

    return NextResponse.json({
      id: auditJob.id,
      userId: auditJob.userId,
      categories: auditJob.categories,
      status: auditJob.status,
      severity: auditJob.severity,
      retryCount: auditJob.retryCount,
      maxRetries: auditJob.maxRetries,
      lastError: auditJob.lastError ? redactAuditText(auditJob.lastError) : null,
      startedAt: auditJob.startedAt,
      completedAt: auditJob.completedAt,
      durationMs: auditJob.durationMs,
      createdAt: auditJob.createdAt,
      updatedAt: auditJob.updatedAt,
      queueStatus: sanitizeAuditValue(queueStatus),
      auditRun: auditJob.auditRun,
    });
  } catch (error) {
    console.error('Error in GET /api/admin/audit/jobs/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const runtime = 'nodejs';
