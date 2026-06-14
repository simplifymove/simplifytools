import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth/admin';
import { getAuditQueue } from '@/lib/queue/client';
import { prisma } from '@/lib/prisma';
import { apiLogger as logger } from '@/lib/logging/logger';

interface ManualAuditRequest {
  categories: string[];
  sequential?: boolean;
}

const VALID_CATEGORIES = [
  'pdf-tools',
  'image-tools',
  'video-tools',
  'ai-writing-tools',
  'data-conversion-tools',
  'data-tools',
  'code-tools',
];

function parseCategories(categoriesJson: string, auditRunId: string): string[] {
  try {
    const categories = JSON.parse(categoriesJson);
    return Array.isArray(categories) ? categories : [];
  } catch {
    logger.warn({ auditRunId }, 'Audit run has invalid categories JSON');
    return [];
  }
}

function validateManualAuditRequest(body: Partial<ManualAuditRequest>) {
  if (!Array.isArray(body.categories) || body.categories.length === 0) {
    return { error: 'categories must be a non-empty array' };
  }

  const categories = Array.from(new Set(body.categories));

  for (const category of categories) {
    if (typeof category !== 'string') {
      return { error: 'categories must contain only strings' };
    }

    if (!VALID_CATEGORIES.includes(category)) {
      return { error: `Invalid category: ${category}` };
    }
  }

  return { categories };
}

export async function POST(req: NextRequest) {
  try {
    const session = await getAdminSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let body: Partial<ManualAuditRequest>;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const validation = validateManualAuditRequest(body);
    if ('error' in validation) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const categories = validation.categories;
    const userId = session.user.id || 'admin-user';

    // Clean up stale PENDING jobs (older than 10 minutes) so they do not block new runs.
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    const staleRuns = await prisma.auditRun.findMany({
      where: {
        status: 'PENDING',
        createdAt: { lt: tenMinutesAgo },
      },
      select: { id: true },
    });

    if (staleRuns.length > 0) {
      const staleRunIds = staleRuns.map((run) => run.id);

      await prisma.auditRun.updateMany({
        where: { id: { in: staleRunIds } },
        data: {
          status: 'FAILED',
          errorMessage: 'Stale job - exceeded queue timeout (10 min)',
          completedAt: new Date(),
        },
      });

      await prisma.auditJob.updateMany({
        where: {
          auditRunId: { in: staleRunIds },
          status: 'PENDING',
        },
        data: {
          status: 'FAILED',
          lastError: 'Stale job - exceeded queue timeout (10 min)',
          completedAt: new Date(),
        },
      });

      logger.info({ count: staleRuns.length }, 'Cleaned up stale pending audit runs');
    }

    // Check for duplicate category runs.
    const existingRuns = await prisma.auditRun.findMany({
      where: {
        status: 'RUNNING',
      },
      select: { id: true, categories: true, status: true },
    });

    const conflicts: Array<{ category: string; status: string; auditRunId: string }> = [];

    for (const category of categories) {
      for (const run of existingRuns) {
        const runCategories = parseCategories(run.categories, run.id);

        if (runCategories.includes(category)) {
          conflicts.push({
            category,
            status: run.status,
            auditRunId: run.id,
          });
          break;
        }
      }
    }

    if (conflicts.length > 0) {
      const conflictDetails = conflicts
        .map((conflict) => `${conflict.category} (${conflict.status})`)
        .join(', ');

      return NextResponse.json(
        {
          error: `Some selected categories are already running: ${conflictDetails}. Wait for them to complete or stop them.`,
          conflicts,
        },
        { status: 409 }
      );
    }

    const { auditRun, auditJob } = await prisma.$transaction(async (tx) => {
      const createdAuditRun = await tx.auditRun.create({
        data: {
          userId,
          categories: JSON.stringify(categories),
          status: 'PENDING',
          startedAt: new Date(),
        },
      });

      const createdAuditJob = await tx.auditJob.create({
        data: {
          userId,
          categories,
          status: 'PENDING',
          auditRunId: createdAuditRun.id,
        },
      });

      return { auditRun: createdAuditRun, auditJob: createdAuditJob };
    });

    const queue = getAuditQueue();

    try {
      await queue.add(
        'manual-audit-batch',
        {
          auditRunId: auditRun.id,
          auditJobId: auditJob.id,
          userId,
          categories,
        },
        {
          attempts: 1,
          backoff: {
            type: 'exponential',
            delay: 2000,
          },
        }
      );
    } catch (queueError) {
      logger.error({ error: queueError, auditRunId: auditRun.id }, 'Failed to queue manual audit');

      await prisma.auditRun.update({
        where: { id: auditRun.id },
        data: {
          status: 'FAILED',
          errorMessage: 'Failed to queue audit job',
          completedAt: new Date(),
        },
      });

      await prisma.auditJob.update({
        where: { id: auditJob.id },
        data: {
          status: 'FAILED',
          lastError: 'Failed to queue audit job',
          completedAt: new Date(),
        },
      });

      throw queueError;
    }

    logger.info({ auditRunId: auditRun.id, categories }, 'Queued manual audit batch');

    return NextResponse.json({
      auditRunId: auditRun.id,
      categories,
      status: auditRun.status,
      startedAt: auditRun.startedAt,
      message: `Created audit run for ${categories.length} category(ies) - ${body.sequential ? 'Sequential' : 'Concurrent'} execution`,
    });
  } catch (error) {
    logger.error(error, 'Manual audit trigger error');
    return NextResponse.json(
      { error: 'Failed to trigger audit' },
      { status: 500 }
    );
  }
}

// GET recent audit runs and active jobs
export async function GET() {
  try {
    const session = await getAdminSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 1. Clean up old PENDING jobs (older than 10 minutes)
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    const oldPendingJobs = await prisma.auditRun.findMany({
      where: {
        status: 'PENDING',
        createdAt: { lt: tenMinutesAgo },
      },
      select: { id: true },
    });

    if (oldPendingJobs.length > 0) {
      const oldPendingJobIds = oldPendingJobs.map((job) => job.id);

      await prisma.auditRun.updateMany({
        where: {
          id: { in: oldPendingJobIds },
        },
        data: {
          status: 'FAILED',
          errorMessage: 'Job abandoned - exceeded queue timeout (10 min)',
          completedAt: new Date(),
        },
      });

      await prisma.auditJob.updateMany({
        where: {
          auditRunId: { in: oldPendingJobIds },
          status: 'PENDING',
        },
        data: {
          status: 'FAILED',
          lastError: 'Job abandoned - exceeded queue timeout (10 min)',
          completedAt: new Date(),
        },
      });

      logger.info({ count: oldPendingJobs.length }, 'Cleaned up old PENDING jobs');
    }

    // 2. Get RUNNING audit runs with live counts
    const runningRuns = await prisma.auditRun.findMany({
      where: {
        status: 'RUNNING',
      },
      orderBy: { startedAt: 'desc' },
      take: 10,
      include: {
        testResults: {
          select: { id: true, status: true },
        },
      },
    });

    // 3. Get active jobs from database (PENDING or PROCESSING status)
    const activeJobs = await prisma.auditJob.findMany({
      where: {
        status: { in: ['PENDING', 'PROCESSING'] },
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    // 4. Get recent completed runs (last 10)
    const recentRuns = await prisma.auditRun.findMany({
      where: {
        status: { in: ['COMPLETED', 'FAILED'] },
      },
      orderBy: { completedAt: 'desc' },
      take: 10,
      include: {
        testResults: {
          select: { id: true, status: true },
        },
      },
    });

    // Format running runs with live counts
    const formattedRunningRuns = runningRuns.map((run) => {
      const categories = parseCategories(run.categories, run.id);
      const testCounts = {
        total: run.testResults.length,
        passed: run.testResults.filter((result) => result.status === 'PASS').length,
        failed: run.testResults.filter((result) => result.status === 'FAIL').length,
        skipped: run.testResults.filter((result) => result.status === 'SKIPPED').length,
        error: run.testResults.filter((result) => result.status === 'ERROR').length,
      };

      return {
        auditRunId: run.id,
        categories,
        status: run.status,
        totalTests: run.totalTests || testCounts.total,
        passedTests: run.passedTests || testCounts.passed,
        failedTests: run.failedTests || testCounts.failed,
        skippedTests: run.skippedTests || testCounts.skipped,
        errorTests: run.errorTests || testCounts.error,
        successPercentage: run.successPercentage,
        startedAt: run.startedAt,
        completedAt: run.completedAt,
        livePassedTests: testCounts.passed,
        liveFailedTests: testCounts.failed,
        liveTotalTests: testCounts.total,
      };
    });

    return NextResponse.json({
      runningRuns: formattedRunningRuns,
      activeJobs: activeJobs.map((job) => ({
        jobId: job.id,
        categories: job.categories,
        status: job.status,
        startedAt: job.startedAt,
        auditRunId: job.auditRunId,
      })),
      recentRuns: recentRuns.map((run) => ({
        auditRunId: run.id,
        categories: parseCategories(run.categories, run.id),
        status: run.status,
        totalTests: run.totalTests,
        passedTests: run.passedTests,
        failedTests: run.failedTests,
        skippedTests: run.skippedTests,
        errorTests: run.errorTests,
        successPercentage: run.successPercentage,
        startedAt: run.startedAt,
        completedAt: run.completedAt,
        duration: run.completedAt && run.startedAt
          ? Math.round((run.completedAt.getTime() - run.startedAt.getTime()) / 1000)
          : null,
      })),
      stats: {
        runningCount: runningRuns.length,
        activeCount: activeJobs.length,
        recentRunsCount: recentRuns.length,
      },
    });
  } catch (error) {
    logger.error(error, 'Get audit status error');
    return NextResponse.json(
      { error: 'Failed to get status' },
      { status: 500 }
    );
  }
}
