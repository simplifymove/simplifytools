import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/config';
import { prisma } from '@/lib/prisma';
import { apiLogger as logger } from '@/lib/logging/logger';
import { killAuditProcess } from '@/lib/services/test-execution';

interface RouteParams {
  jobId: string;
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

    const { jobId } = await params;

    // Try to get as AuditRun first
    let auditRun = await prisma.auditRun.findUnique({
      where: { id: jobId },
      include: {
        testResults: {
          select: {
            id: true,
            toolName: true,
            category: true,
            status: true,
            errorMessage: true,
            durationMs: true,
          },
        },
      },
    });

    if (!auditRun) {
      // Try as AuditJob
      const auditJob = await prisma.auditJob.findUnique({
        where: { id: jobId },
        include: {
          auditRun: {
            include: {
              testResults: {
                select: {
                  id: true,
                  toolName: true,
                  category: true,
                  status: true,
                  errorMessage: true,
                  durationMs: true,
                },
              },
            },
          },
        },
      });

      if (!auditJob) {
        return NextResponse.json({ error: 'Job not found' }, { status: 404 });
      }

      auditRun = auditJob.auditRun!;
    }

    if (!auditRun) {
      return NextResponse.json({ error: 'Audit run not found' }, { status: 404 });
    }

    const duration =
      auditRun.completedAt && auditRun.startedAt
        ? Math.round((auditRun.completedAt.getTime() - auditRun.startedAt.getTime()) / 1000)
        : null;

    return NextResponse.json({
      auditRunId: auditRun.id,
      status: auditRun.status,
      categories: JSON.parse(auditRun.categories),
      totalTests: auditRun.totalTests,
      passedTests: auditRun.passedTests,
      failedTests: auditRun.failedTests,
      errorTests: auditRun.errorTests,
      skippedTests: auditRun.skippedTests,
      successPercentage: auditRun.successPercentage,
      startedAt: auditRun.startedAt,
      completedAt: auditRun.completedAt,
      duration,
      errorMessage: auditRun.errorMessage,
      testResults: auditRun.testResults,
    });
  } catch (error) {
    logger.error(error, 'Get audit details error');
    return NextResponse.json(
      { error: 'Failed to get audit details' },
      { status: 500 }
    );
  }
}

// DELETE - Stop/Cancel an audit job
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<RouteParams> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email || session.user.email !== 'raghavaboyidi@gmail.com') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { jobId } = await params;

    // Try to cancel as AuditRun
    let auditRun = await prisma.auditRun.findUnique({
      where: { id: jobId },
      include: { fromJob: { select: { id: true, status: true } } },
    });

    if (!auditRun) {
      // Try as AuditJob
      const auditJob = await prisma.auditJob.findUnique({
        where: { id: jobId },
        include: { auditRun: true },
      });

      if (!auditJob) {
        return NextResponse.json({ error: 'Job not found' }, { status: 404 });
      }

      // Cancel the AuditJob
      await prisma.auditJob.update({
        where: { id: jobId },
        data: { status: 'CANCELLED', completedAt: new Date() },
      });

      logger.info(`Cancellation requested for AuditJob: ${jobId}`);

      return NextResponse.json({ message: `Job ${jobId} cancellation requested`, status: 'CANCELLED' });
    }

    // Cancel the AuditRun and associated jobs
    logger.info(`Cancellation requested for AuditRun: ${jobId}`);
    
    await prisma.auditRun.update({
      where: { id: jobId },
      data: { 
        status: 'FAILED', 
        errorMessage: 'Cancelled by admin', 
        completedAt: new Date() 
      },
    });

    // Also cancel associated jobs
    await prisma.auditJob.updateMany({
      where: { auditRunId: jobId, status: { in: ['PENDING', 'PROCESSING'] } },
      data: { status: 'CANCELLED', completedAt: new Date() },
    });

    // Try to kill the actual Playwright process
    const killed = killAuditProcess(jobId);
    if (killed) {
      logger.info(`Killed Playwright process for auditRunId: ${jobId}`);
    } else {
      logger.warn(`No running process found or already dead for auditRunId: ${jobId}`);
    }

    logger.info(`AuditRun cancellation requested: ${jobId}. Playwright should stop within 2 seconds.`);

    return NextResponse.json({ 
      message: `Cancellation signal sent to worker. Playwright process terminating...`, 
      status: 'CANCELLED',
      killed 
    });
  } catch (error) {
    logger.error(error, 'Cancel job error');
    return NextResponse.json(
      { error: 'Failed to cancel job' },
      { status: 500 }
    );
  }
}
