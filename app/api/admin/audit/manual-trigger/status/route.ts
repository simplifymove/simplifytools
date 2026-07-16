import { NextRequest, NextResponse } from 'next/server';
import { requireAdminApi } from '@/lib/auth/admin';
import { prisma } from '@/lib/prisma';
import { apiLogger as logger } from '@/lib/logging/logger';
import { redactAuditText } from '@/lib/services/audit-response';

export async function GET(req: NextRequest) {
  try {
    const { response } = await requireAdminApi();
    if (response) return response;

    // Get currently running/pending jobs
    const activeJobs = await prisma.auditJob.findMany({
      where: {
        status: { in: ['PENDING', 'PROCESSING'] },
      },
      select: {
        id: true,
        categories: true,
        status: true,
        startedAt: true,
        createdAt: true,
        auditRunId: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    // Get currently running/pending audit runs
    const activeRuns = await prisma.auditRun.findMany({
      where: {
        status: { in: ['PENDING', 'RUNNING'] },
      },
      select: {
        id: true,
        categories: true,
        status: true,
        startedAt: true,
        totalTests: true,
        passedTests: true,
        failedTests: true,
      },
      orderBy: { startedAt: 'desc' },
      take: 50,
    });

    // Get recent completed runs (last 20)
    const recentCompleted = await prisma.auditRun.findMany({
      where: {
        status: { in: ['COMPLETED', 'PARTIAL', 'FAILED'] },
      },
      select: {
        id: true,
        categories: true,
        status: true,
        startedAt: true,
        completedAt: true,
        totalTests: true,
        passedTests: true,
        failedTests: true,
        successPercentage: true,
        errorMessage: true,
      },
      orderBy: { completedAt: 'desc' },
      take: 20,
    });

    // Calculate statistics
    const stats = {
      activeJobsCount: activeJobs.length,
      activeRunsCount: activeRuns.length,
      recentCompletedCount: recentCompleted.length,
      totalProcessing: activeJobs.length + activeRuns.length,
    };

    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      activeJobs: activeJobs.map((job) => ({
        jobId: job.id,
        auditRunId: job.auditRunId,
        categories: job.categories,
        status: job.status,
        startedAt: job.startedAt,
        createdAt: job.createdAt,
      })),
      activeRuns: activeRuns.map((run) => ({
        auditRunId: run.id,
        categories: JSON.parse(run.categories),
        status: run.status,
        startedAt: run.startedAt,
        totalTests: run.totalTests,
        passedTests: run.passedTests,
        failedTests: run.failedTests,
      })),
      recentCompleted: recentCompleted.map((run) => ({
        auditRunId: run.id,
        categories: JSON.parse(run.categories),
        status: run.status,
        startedAt: run.startedAt,
        completedAt: run.completedAt,
        totalTests: run.totalTests,
        passedTests: run.passedTests,
        failedTests: run.failedTests,
        successPercentage: run.successPercentage,
        errorMessage: run.errorMessage ? redactAuditText(run.errorMessage) : null,
        duration: run.completedAt && run.startedAt 
          ? Math.round((run.completedAt.getTime() - run.startedAt.getTime()) / 1000)
          : null,
      })),
      stats,
    });
  } catch (error) {
    logger.error(error, 'Get audit status error');
    return NextResponse.json(
      { error: 'Failed to get audit status' },
      { status: 500 }
    );
  }
}
