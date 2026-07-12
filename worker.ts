// worker.ts
// Entry point for background worker process
// Run with: node dist/worker.js or npx ts-node worker.ts

import { createWorker } from './lib/queue/worker';
import { getQueueEvents } from './lib/queue/client';
import { prisma } from './lib/prisma';
import { generateHealthReport } from './lib/services/health-score';
import { evaluateAllAlertingRules } from './lib/services/alerting';
import { runFullRecoveryCycle } from './lib/services/auto-recovery';
import { cleanupOldArtifacts } from './lib/services/artifact';
import { cleanupExpiredDownloadResults } from './lib/services/download-result';
import { workerLogger } from './lib/logging/logger';

// Number of concurrent jobs to process
const WORKER_CONCURRENCY = parseInt(process.env.WORKER_CONCURRENCY || '2');

// Scheduled tasks
const TASKS: Record<string, ReturnType<typeof setInterval> | null> = {
  healthReport: null,
  autoRecovery: null,
  artifactCleanup: null,
  downloadResultCleanup: null,
};

// Start the worker
async function startWorker() {
  workerLogger.info(
    {
      concurrency: WORKER_CONCURRENCY,
      redis: process.env.REDIS_HOST || 'localhost',
    },
    'Starting Audit Queue Worker'
  );

  try {
    // Create and start worker
    const worker = createWorker(WORKER_CONCURRENCY);

    // Set up event listeners
    const events = getQueueEvents();

    events.on('added', (args) => {
      workerLogger.debug({ jobId: args.jobId }, 'Job added to queue');
    });

    events.on('active', (args) => {
      workerLogger.info({ jobId: args.jobId }, 'Job started');
    });

    events.on('completed', (args) => {
      workerLogger.info({ jobId: args.jobId }, 'Job completed');
    });

    events.on('failed', (args) => {
      workerLogger.error({ jobId: args.jobId, error: args.failedReason }, 'Job failed');
    });

    // Scheduled tasks
    
    // 1. Health report every hour
    TASKS.healthReport = setInterval(async () => {
      try {
        workerLogger.info('Running health report generation...');
        const report = await generateHealthReport();
        workerLogger.info(
          { score: report?.overallScore },
          'Health report generated'
        );
      } catch (error) {
        workerLogger.error({ error }, 'Failed to generate health report');
      }
    }, 60 * 60 * 1000); // 1 hour

    // 2. Auto recovery every 5 minutes
    TASKS.autoRecovery = setInterval(async () => {
      try {
        workerLogger.info('Running auto-recovery cycle...');
        await runFullRecoveryCycle();
        workerLogger.info('Auto-recovery cycle complete');
      } catch (error) {
        workerLogger.error({ error }, 'Failed to run auto-recovery');
      }
    }, 5 * 60 * 1000); // 5 minutes

    // 3. Artifact cleanup daily
    TASKS.artifactCleanup = setInterval(async () => {
      try {
        workerLogger.info('Running artifact cleanup...');
        const count = await cleanupOldArtifacts(30); // Keep 30 days
        workerLogger.info({ deleted: count }, 'Artifact cleanup complete');
      } catch (error) {
        workerLogger.error({ error }, 'Failed to cleanup artifacts');
      }
    }, 24 * 60 * 60 * 1000); // 24 hours

    // 4. Temporary download-result cleanup every 5 minutes
    TASKS.downloadResultCleanup = setInterval(async () => {
      try {
        workerLogger.info('Running download-result cleanup...');
        const summary = await cleanupExpiredDownloadResults();
        workerLogger.info(summary, 'Download-result cleanup complete');
      } catch (error) {
        workerLogger.error({ error }, 'Failed to cleanup download results');
      }
    }, 5 * 60 * 1000); // 5 minutes

    // Evaluate alert rules every 5 minutes
    setInterval(async () => {
      try {
        await evaluateAllAlertingRules();
      } catch (error) {
        workerLogger.warn({ error }, 'Failed to evaluate alert rules');
      }
    }, 5 * 60 * 1000); // 5 minutes

    // Handle graceful shutdown
    const shutdown = async (signal: string) => {
      workerLogger.info({ signal }, 'Shutting down worker...');

      // Clear intervals
      Object.values(TASKS).forEach((task) => {
        if (task) clearInterval(task);
      });

      await worker.close();
      await events.close();
      await prisma.$disconnect();
      process.exit(0);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

    console.log('[Worker] ✅ Audit worker started and waiting for jobs...');
    workerLogger.info('Audit worker started and waiting for jobs');
  } catch (error) {
    workerLogger.error({ error }, 'Failed to start worker');
    await prisma.$disconnect();
    process.exit(1);
  }
}

// Start the worker
startWorker();
