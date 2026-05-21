// app/api/admin/audit/jobs/[id]/route.ts
// Get audit job status and details

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { isAdminUser } from '@/lib/auth/admin';
import { getJobStatus } from '@/lib/queue/client';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized: Authentication required' },
        { status: 401 }
      );
    }

    // Check admin authorization
    const isAdmin = await isAdminUser();
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized: Admin access required' },
        { status: 403 }
      );
    }

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
      lastError: auditJob.lastError,
      startedAt: auditJob.startedAt,
      completedAt: auditJob.completedAt,
      durationMs: auditJob.durationMs,
      createdAt: auditJob.createdAt,
      updatedAt: auditJob.updatedAt,
      queueStatus,
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
