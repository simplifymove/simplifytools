// app/api/admin/audit/jobs/[id]/retry/route.ts
// Retry a failed audit job

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { isAdminUser } from '@/lib/auth/admin';
import { retryJob, enqueueAuditJob } from '@/lib/queue/client';
import { prisma } from '@/lib/prisma';

export async function POST(
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
    });

    if (!auditJob) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    // Check if job can be retried
    if (auditJob.status !== 'FAILED') {
      return NextResponse.json(
        { error: `Cannot retry job with status: ${auditJob.status}` },
        { status: 400 }
      );
    }

    // Check max retries
    if (auditJob.retryCount >= auditJob.maxRetries) {
      return NextResponse.json(
        { error: `Maximum retries (${auditJob.maxRetries}) exceeded` },
        { status: 400 }
      );
    }

    // Update job status
    const updatedJob = await prisma.auditJob.update({
      where: { id },
      data: {
        status: 'RETRYING',
        retryCount: auditJob.retryCount + 1,
        lastError: null,
      },
    });

    // Re-enqueue the job
    try {
      if (!auditJob.auditRunId) {
        return NextResponse.json(
          { error: 'Job has no associated audit run' },
          { status: 400 }
        );
      }

      const queueJobId = await enqueueAuditJob(
        auditJob.auditRunId,
        id,
        auditJob.userId,
        auditJob.categories
      );

      return NextResponse.json(
        {
          jobId: id,
          queueId: queueJobId,
          status: 'retrying',
          retryCount: updatedJob.retryCount,
          message: `Job retried (Attempt ${updatedJob.retryCount}/${updatedJob.maxRetries})`,
        },
        { status: 202 }
      );
    } catch (queueError) {
      // Restore job status if queueing fails
      await prisma.auditJob.update({
        where: { id },
        data: { status: 'FAILED' },
      });

      console.error('Failed to re-enqueue job:', queueError);
      return NextResponse.json(
        { error: 'Failed to retry job. Job queue may be unavailable.' },
        { status: 503 }
      );
    }
  } catch (error) {
    console.error('Error in POST /api/admin/audit/jobs/[id]/retry:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const runtime = 'nodejs';
