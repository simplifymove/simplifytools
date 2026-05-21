// lib/services/auto-recovery.ts
// Automatically recover from worker crashes and stalled jobs

import { prisma } from '@/lib/prisma';
import { getAuditQueue, checkQueueHealth } from '@/lib/queue/client';
import logger, { recoveryLogger } from '@/lib/logging/logger';

/**
 * Detect and recover stalled jobs
 */
export async function detectAndRecoverStalledJobs(): Promise<void> {
  try {
    recoveryLogger.info('Checking for stalled jobs...');

    // Find jobs that are PROCESSING but haven't been updated in 15 minutes
    const stalledThreshold = new Date(Date.now() - 15 * 60 * 1000);

    const stalledJobs = await prisma.auditJob.findMany({
      where: {
        status: 'PROCESSING',
        updatedAt: { lte: stalledThreshold },
      },
    });

    for (const job of stalledJobs) {
      recoveryLogger.warn({ jobId: job.id }, 'Detected stalled job');
      await requeueSafelyJob(job.id, job.retryCount);
    }

    recoveryLogger.info(
      `Recovered ${stalledJobs.length} stalled jobs`
    );
  } catch (error) {
    recoveryLogger.error({ error }, 'Failed to detect stalled jobs');
  }
}

/**
 * Detect orphaned processes and workers
 */
export async function detectOrphanedProcesses(): Promise<void> {
  try {
    recoveryLogger.info('Checking for orphaned processes...');

    // Check if Redis is still connected
    const health = await checkQueueHealth();

    if (!health.redis) {
      recoveryLogger.error('Redis connection lost - orphaned processes may exist');
      // Try to reconnect
      return;
    }

    // If no active workers but jobs are processing
    if ((health.active ?? 0) === 0) {
      const processingJobs = await prisma.auditJob.count({
        where: { status: 'PROCESSING' },
      });

      if (processingJobs > 0) {
        recoveryLogger.warn(
          { count: processingJobs },
          'Detected processing jobs but no active workers'
        );
        // Let stalled job detection handle recovery
      }
    }
  } catch (error) {
    recoveryLogger.error({ error }, 'Failed to detect orphaned processes');
  }
}

/**
 * Safely requeue a job
 */
export async function requeueSafelyJob(
  jobId: string,
  currentRetryCount: number = 0
): Promise<boolean> {
  try {
    const job = await prisma.auditJob.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      recoveryLogger.warn({ jobId }, 'Job not found for requeue');
      return false;
    }

    const newRetryCount = currentRetryCount + 1;

    // Check if max retries exceeded
    if (newRetryCount > job.maxRetries) {
      recoveryLogger.warn(
        { jobId, retryCount: newRetryCount, maxRetries: job.maxRetries },
        'Job exceeded max retries'
      );

      await prisma.auditJob.update({
        where: { id: jobId },
        data: {
          status: 'FAILED',
          lastError: 'Max retries exceeded after crash recovery',
        },
      });

      return false;
    }

    // Update job status and retry count
    await prisma.auditJob.update({
      where: { id: jobId },
      data: {
        status: 'RETRYING',
        retryCount: newRetryCount,
      },
    });

    // Re-enqueue to BullMQ
    try {
      const queue = await getAuditQueue();
      
      // Get the auditRunId from the job itself
      const updatedJob = await prisma.auditJob.findUnique({
        where: { id: jobId },
      });

      if (!updatedJob || !updatedJob.auditRunId) {
        throw new Error(`Cannot recover job ${jobId}: missing audit run reference`);
      }

      await queue.add(
        `audit-${jobId}`,
        {
          auditRunId: updatedJob.auditRunId,
          auditJobId: jobId,
          userId: job.userId,
          categories: job.categories,
        },
        {
          attempts: job.maxRetries - newRetryCount,
          backoff: {
            type: 'exponential',
            delay: 2000,
          },
          removeOnComplete: true,
        }
      );

      recoveryLogger.info(
        { jobId, retryCount: newRetryCount },
        'Job requeued successfully'
      );

      return true;
    } catch (error) {
      recoveryLogger.error({ error, jobId }, 'Failed to re-enqueue job');

      // If re-enqueueing fails, mark as failed
      await prisma.auditJob.update({
        where: { id: jobId },
        data: {
          status: 'FAILED',
          lastError: `Failed to re-enqueue: ${error instanceof Error ? error.message : 'unknown error'}`,
        },
      });

      return false;
    }
  } catch (error) {
    recoveryLogger.error({ error, jobId }, 'Failed to safely requeue job');
    return false;
  }
}

/**
 * Clean up after worker crash
 */
export async function cleanupAfterCrash(): Promise<{
  recovered: number;
  failed: number;
}> {
  try {
    recoveryLogger.warn('Cleaning up after worker crash...');

    // Find all PROCESSING jobs
    const processingJobs = await prisma.auditJob.findMany({
      where: { status: 'PROCESSING' },
    });

    let recovered = 0;
    let failed = 0;

    for (const job of processingJobs) {
      const success = await requeueSafelyJob(job.id, job.retryCount);
      if (success) {
        recovered++;
      } else {
        failed++;
      }
    }

    recoveryLogger.info(
      { recovered, failed },
      'Worker crash cleanup complete'
    );

    return { recovered, failed };
  } catch (error) {
    recoveryLogger.error({ error }, 'Failed to cleanup after crash');
    return { recovered: 0, failed: 0 };
  }
}

/**
 * Monitor worker health and auto-recover if needed
 */
export async function monitorWorkerHealth(): Promise<void> {
  try {
    recoveryLogger.debug('Running worker health check...');

    const health = await checkQueueHealth();

    // Check if queue is backing up
    if ((health.active ?? 0) === 0 && (health.pending ?? 0) > 0) {
      recoveryLogger.warn(
        { pending: health.pending ?? 0, active: health.active ?? 0 },
        'Worker backlog detected with no active workers'
      );

      // Try to recover
      await detectAndRecoverStalledJobs();
    }

    // Check Redis connection
    if (!health.redis) {
      recoveryLogger.error('Redis connection lost - attempting recovery');
      // Connection will be retried by the queue client
    }

    // Check for too many failed jobs
    if ((health.failed ?? 0) > (health.completed ?? 0) * 0.5) {
      recoveryLogger.warn(
        { failed: health.failed ?? 0, completed: health.completed ?? 0 },
        'High failure rate detected'
      );
    }
  } catch (error) {
    recoveryLogger.error({ error }, 'Failed to monitor worker health');
  }
}

/**
 * Run full recovery cycle
 */
export async function runFullRecoveryCycle(): Promise<void> {
  try {
    recoveryLogger.info('Starting full recovery cycle');

    // 1. Check queue health
    const health = await checkQueueHealth();
    if (!health.connected) {
      recoveryLogger.error('Queue not connected - skipping recovery');
      return;
    }

    // 2. Detect and recover orphaned processes
    await detectOrphanedProcesses();

    // 3. Recover stalled jobs
    await detectAndRecoverStalledJobs();

    // 4. Monitor overall health
    await monitorWorkerHealth();

    recoveryLogger.info('Full recovery cycle complete');
  } catch (error) {
    recoveryLogger.error({ error }, 'Failed to run full recovery cycle');
  }
}

/**
 * Get recovery statistics
 */
export async function getRecoveryStats(): Promise<{
  stalledJobsRecovered: number;
  failedJobsRequeued: number;
  lastRecoveryAt: Date | null;
}> {
  try {
    // Count RETRYING jobs (recently recovered)
    const requeued = await prisma.auditJob.count({
      where: { status: 'RETRYING' },
    });

    return {
      stalledJobsRecovered: requeued,
      failedJobsRequeued: requeued,
      lastRecoveryAt: new Date(), // TODO: Track this properly
    };
  } catch (error) {
    logger.error({ error }, 'Failed to get recovery stats');
    return {
      stalledJobsRecovered: 0,
      failedJobsRequeued: 0,
      lastRecoveryAt: null,
    };
  }
}
