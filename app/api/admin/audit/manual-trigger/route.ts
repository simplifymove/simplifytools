import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/config';
import { getAuditQueue } from '@/lib/queue/client';
import { prisma } from '@/lib/prisma';
import { v4 as uuidv4 } from 'uuid';
import { apiLogger as logger } from '@/lib/logging/logger';

interface ManualAuditRequest {
  categories: string[];
  sequential: boolean;
}

const VALID_CATEGORIES = [
  'pdf-tools',
  'image-tools',
  'video-tools',
  'save-from-online',
  'ai-writing-tools',
  'data-conversion-tools',
  'data-tools',
  'code-tools',
  'financial-calculators',
  'resume-maker',
  'text-to-speech',
];

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email || session.user.email !== 'raghavaboyidi@gmail.com') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: ManualAuditRequest = await req.json();
    const { categories, sequential } = body;
    const userId = session.user.id || 'admin-user';

    if (!categories || categories.length === 0) {
      return NextResponse.json(
        { error: 'At least one category required' },
        { status: 400 }
      );
    }

    // Validate categories
    for (const cat of categories) {
      if (!VALID_CATEGORIES.includes(cat)) {
        return NextResponse.json(
          { error: `Invalid category: ${cat}` },
          { status: 400 }
        );
      }
    }

    // Clean up stale PENDING jobs (older than 10 minutes) - they should not block new runs
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    await prisma.auditRun.updateMany({
      where: {
        status: 'PENDING',
        createdAt: { lt: tenMinutesAgo },
      },
      data: {
        status: 'FAILED',
        errorMessage: 'Stale job - exceeded queue timeout (10 min)',
        completedAt: new Date(),
      },
    });

    // Check for duplicate category runs (only RUNNING, not stale PENDING)
    const existingRuns = await prisma.auditRun.findMany({
      where: {
        status: { in: ['RUNNING'] }, // Only check RUNNING, not PENDING (stale ones are cleaned)
      },
      select: { id: true, categories: true, status: true },
    });

    const conflicts: Array<{ category: string; status: string; auditRunId: string }> = [];
    
    for (const cat of categories) {
      for (const run of existingRuns) {
        const runCategories = JSON.parse(run.categories);
        if (Array.isArray(runCategories) && runCategories.includes(cat)) {
          conflicts.push({
            category: cat,
            status: run.status,
            auditRunId: run.id,
          });
          break; // Only report first conflict per category
        }
      }
    }

    if (conflicts.length > 0) {
      const conflictDetails = conflicts
        .map((c) => `${c.category} (${c.status})`)
        .join(', ');
      return NextResponse.json(
        { 
          error: `Some selected categories are already running: ${conflictDetails}. Wait for them to complete or stop them.`,
          conflicts,
        },
        { status: 409 }
      );
    }

    // Create AuditRun in database immediately
    const auditRun = await prisma.auditRun.create({
      data: {
        userId,
        categories: JSON.stringify(categories),
        status: 'PENDING',
        startedAt: new Date(),
      },
    });

    logger.info(`Created AuditRun: ${auditRun.id} for categories: ${categories.join(', ')}`);

    // Create AuditJob records for tracking
    const jobPromises = categories.map((category) =>
      prisma.auditJob.create({
        data: {
          userId,
          categories: [category],
          status: 'PENDING',
          auditRunId: auditRun.id,
        },
      })
    );

    const auditJobs = await Promise.all(jobPromises);
    const jobIds = auditJobs.map((j) => j.id);

    // Queue background processing
    const queue = getAuditQueue();

    // Queue single job for entire audit run (not per-category)
    await queue.add(
      'manual-audit-batch',
      {
        auditRunId: auditRun.id,
        auditJobId: jobIds[0], // Primary job ID for tracking
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

    logger.info(`Queued audit batch: ${auditRun.id} for ${categories.length} categories`);

    // Return AuditRun details
    return NextResponse.json({
      auditRunId: auditRun.id,
      categories,
      status: auditRun.status,
      startedAt: auditRun.startedAt,
      message: `Created audit run for ${categories.length} category(ies) - ${sequential ? 'Sequential' : 'Concurrent'} execution`,
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
    const session = await getServerSession(authOptions);
    if (!session?.user?.email || session.user.email !== 'raghavaboyidi@gmail.com') {
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
      await prisma.auditRun.updateMany({
        where: {
          id: { in: oldPendingJobs.map((j) => j.id) },
        },
        data: {
          status: 'FAILED',
          errorMessage: 'Job abandoned - exceeded queue timeout (10 min)',
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
      const testCounts = {
        total: run.testResults.length,
        passed: run.testResults.filter((r) => r.status === 'PASS').length,
        failed: run.testResults.filter((r) => r.status === 'FAIL').length,
        skipped: run.testResults.filter((r) => r.status === 'SKIPPED').length,
        error: run.testResults.filter((r) => r.status === 'ERROR').length,
      };
      
      return {
        auditRunId: run.id,
        categories: JSON.parse(run.categories),
        status: run.status,
        totalTests: run.totalTests || testCounts.total,
        passedTests: run.passedTests || testCounts.passed,
        failedTests: run.failedTests || testCounts.failed,
        skippedTests: run.skippedTests || testCounts.skipped,
        errorTests: run.errorTests || testCounts.error,
        successPercentage: run.successPercentage,
        startedAt: run.startedAt,
        completedAt: run.completedAt,
        // Live counts from actual test results
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
        categories: JSON.parse(run.categories),
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
