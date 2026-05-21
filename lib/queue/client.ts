// lib/queue/client.ts
// BullMQ Queue Setup and Management

import { Queue, Worker, QueueEvents, Processor } from 'bullmq';
import Redis from 'ioredis';

// Job data types
export interface AuditJobData {
  auditRunId: string;
  auditJobId: string;
  userId: string;
  categories: string[];
}

export interface AuditJobResult {
  auditRunId: string;
  success: boolean;
  error?: string;
}

// Redis connection - use ioredis as expected by BullMQ
let redisConnection: Redis | null = null;
let auditQueue: Queue<AuditJobData, any, string> | null = null;

function getRedisConnection(): Redis {
  if (!redisConnection) {
    // Try to connect to Redis, fallback to local if not available
    redisConnection = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
      enableOfflineQueue: false,
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
    });

    redisConnection.on('error', (err) => {
      console.error('Redis connection error:', err);
    });

    redisConnection.on('connect', () => {
      console.log('Redis connected');
    });
  }

  return redisConnection;
}

// Create or get the audit queue
export function getAuditQueue(): Queue<AuditJobData, any, string> {
  if (!auditQueue) {
    const redis = getRedisConnection();
    
    auditQueue = new Queue<AuditJobData, any, string, any, any, any>('audit-tests', {
      connection: redis,
      defaultJobOptions: {
        removeOnComplete: false, // Keep for history
        removeOnFail: false, // Keep failed jobs for debugging
        attempts: 3, // Retry up to 3 times
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
      },
    });
  }

  return auditQueue;
}

// Create a queue events listener
export function getQueueEvents(): QueueEvents {
  const redis = getRedisConnection();
  return new QueueEvents('audit-tests', { connection: redis });
}

// Get queue statistics
export async function getQueueStats() {
  const queue = getAuditQueue();
  
  const counts = await queue.getJobCounts(
    'active',
    'completed',
    'failed',
    'delayed',
    'paused',
    'wait',
  );

  return {
    active: counts.active,
    completed: counts.completed,
    failed: counts.failed,
    delayed: counts.delayed,
    paused: counts.paused,
    waiting: counts.wait,
    total: (counts.active || 0) + (counts.completed || 0) + (counts.failed || 0) + (counts.delayed || 0) + (counts.paused || 0) + (counts.wait || 0),
  };
}

// Enqueue an audit job
export async function enqueueAuditJob(
  auditRunId: string,
  auditJobId: string,
  userId: string,
  categories: string[],
): Promise<string> {
  const queue = getAuditQueue();
  
  const job = await queue.add('run-audit', {
    auditRunId,
    auditJobId,
    userId,
    categories,
  });

  return job.id!;
}

// Get job status
export async function getJobStatus(jobId: string) {
  const queue = getAuditQueue();
  const job = await queue.getJob(jobId);

  if (!job) {
    return null;
  }

  return {
    id: job.id,
    data: job.data,
    status: await job.getState(),
    progress: job.progress,
    returnValue: job.returnvalue,
    failedReason: job.failedReason,
    stackTrace: job.stacktrace,
    timestamp: job.timestamp,
    processedOn: job.processedOn,
    finishedOn: job.finishedOn,
    attempts: job.attemptsStarted,
    maxAttempts: job.opts.attempts,
  };
}

// Retry a failed job
export async function retryJob(jobId: string) {
  const queue = getAuditQueue();
  const job = await queue.getJob(jobId);

  if (!job) {
    throw new Error(`Job ${jobId} not found`);
  }

  const state = await job.getState();
  if (state !== 'failed') {
    throw new Error(`Job ${jobId} is not in failed state (current: ${state})`);
  }

  await job.retry();
  return job.id;
}

// Cancel a job
export async function cancelJob(jobId: string) {
  const queue = getAuditQueue();
  const job = await queue.getJob(jobId);

  if (!job) {
    throw new Error(`Job ${jobId} not found`);
  }

  await job.remove();
  return true;
}

// Clean up old jobs (keep last 1000 completed, delete failed after 7 days)
export async function cleanupOldJobs() {
  const queue = getAuditQueue();

  // Remove completed jobs older than 30 days
  await queue.clean(30 * 24 * 60 * 60 * 1000, 1000, 'completed');

  // Remove failed jobs older than 7 days
  await queue.clean(7 * 24 * 60 * 60 * 1000, 100, 'failed');

  return true;
}

// Health check
export async function checkQueueHealth(): Promise<{
  connected: boolean;
  redis: boolean;
  queue: boolean;
  error?: string;
  active?: number;
  pending?: number;
  completed?: number;
  failed?: number;
  delayed?: number;
  paused?: number;
  total?: number;
}> {
  try {
    const redis = getRedisConnection();
    const queue = getAuditQueue();

    const redisHealth = await redis.ping();
    const queueStats = await getQueueStats();

    return {
      connected: true,
      redis: redisHealth === 'PONG',
      queue: !!queueStats,
      active: queueStats.active,
      pending: queueStats.waiting,
      completed: queueStats.completed,
      failed: queueStats.failed,
      delayed: queueStats.delayed,
      paused: queueStats.paused,
      total: queueStats.total,
    };
  } catch (error) {
    return {
      connected: false,
      redis: false,
      queue: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Close connections (for cleanup)
export async function closeConnections() {
  if (redisConnection) {
    await redisConnection.quit();
    redisConnection = null;
  }
}

export default {
  getAuditQueue,
  getQueueEvents,
  getQueueStats,
  enqueueAuditJob,
  getJobStatus,
  retryJob,
  cancelJob,
  cleanupOldJobs,
  checkQueueHealth,
  closeConnections,
};
