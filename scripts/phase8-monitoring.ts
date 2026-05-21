import os from 'os';
import { spawn } from 'child_process';
import prisma from '@/lib/prisma';
import { logger } from '@/lib/logging/logger';

/**
 * Phase 8 Metrics Collection System
 * Collects performance, reliability, and resource metrics during audits
 */

interface MetricsSnapshot {
  timestamp: Date;
  auditJobId?: string;
  
  // System Resources
  cpuUsage: number;           // %
  memoryUsage: number;        // MB
  memoryUsagePercent: number; // %
  
  // Worker Status
  workerCPU: number;          // %
  workerMemory: number;       // MB
  
  // Redis Status
  redisMem: number;           // MB
  redisConnected: boolean;
  redisKeyCount: number;
  
  // Database Status
  dbConnected: boolean;
  openConnections: number;
  
  // Queue Status
  queueSize: number;
  activeJobs: number;
  pendingJobs: number;
  failedJobs: number;
  
  // Test Execution
  testDuration?: number;      // ms
  testStatus?: 'passed' | 'failed';
  
  // Dashboard Latency
  dashboardLatency?: number;  // ms
  
  // Artifacts
  artifactCount: number;
  artifactTotalSize: number;  // MB
}

interface MetricsReport {
  startTime: Date;
  endTime: Date;
  duration: number;           // seconds
  snapshots: MetricsSnapshot[];
  
  // Aggregated Statistics
  stats: {
    avgCPU: number;
    avgMemory: number;
    peakMemory: number;
    avgWorkerCPU: number;
    avgWorkerMemory: number;
    peakWorkerMemory: number;
    avgRedisMemory: number;
    peakRedisMemory: number;
    avgQueueSize: number;
    peakQueueSize: number;
    avgDashboardLatency: number;
    avgTestDuration: number;
    totalTestsRun: number;
    testSuccessRate: number;
  };
  
  // Issues Found
  issues: {
    memorySpikes: number;
    queueBacklogs: number;
    dbConnErrors: number;
    dashboardTimeouts: number;
    artifactStorageWarnings: number;
  };
}

class MetricsCollector {
  private snapshots: MetricsSnapshot[] = [];
  private startTime: Date = new Date();
  private intervalId: NodeJS.Timeout | null = null;
  private redis: any;
  private collectionInterval: number = 5000; // 5 seconds

  constructor(redis?: any) {
    this.redis = redis;
  }

  /**
   * Start collecting metrics at regular intervals
   */
  async start(intervalSeconds: number = 5): Promise<void> {
    this.startTime = new Date();
    this.collectionInterval = intervalSeconds * 1000;

    logger.info('Starting Phase 8 metrics collection', { intervalMs: this.collectionInterval });

    this.intervalId = setInterval(async () => {
      try {
        const snapshot = await this.collectSnapshot();
        this.snapshots.push(snapshot);
      } catch (error) {
        logger.error('Error collecting metrics snapshot', { error });
      }
    }, this.collectionInterval);
  }

  /**
   * Stop collecting metrics
   */
  async stop(): Promise<MetricsReport> {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }

    logger.info('Stopping Phase 8 metrics collection', { snapshotCount: this.snapshots.length });

    const report = this.generateReport();
    return report;
  }

  /**
   * Collect a single metrics snapshot
   */
  private async collectSnapshot(): Promise<MetricsSnapshot> {
    const snapshot: MetricsSnapshot = {
      timestamp: new Date(),
      cpuUsage: this.getCPUUsage(),
      memoryUsage: this.getMemoryUsageBytes() / 1024 / 1024,
      memoryUsagePercent: (this.getMemoryUsageBytes() / os.totalmem()) * 100,
      workerCPU: 0,
      workerMemory: 0,
      redisMem: 0,
      redisConnected: true,
      redisKeyCount: 0,
      dbConnected: true,
      openConnections: 0,
      queueSize: 0,
      activeJobs: 0,
      pendingJobs: 0,
      failedJobs: 0,
      artifactCount: 0,
      artifactTotalSize: 0,
    };

    // Try to get queue status
    try {
      snapshot.queueSize = await this.getQueueStatus();
    } catch (error) {
      logger.debug('Could not get queue status', { error });
    }

    // Try to get database info
    try {
      const dbStats = await this.getDatabaseStatus();
      snapshot.dbConnected = dbStats.connected;
      snapshot.openConnections = dbStats.openConnections;
    } catch (error) {
      snapshot.dbConnected = false;
      logger.debug('Could not get database status', { error });
    }

    // Try to get Redis info
    try {
      const redisStats = await this.getRedisStatus();
      snapshot.redisMem = redisStats.memory;
      snapshot.redisConnected = redisStats.connected;
      snapshot.redisKeyCount = redisStats.keyCount;
    } catch (error) {
      snapshot.redisConnected = false;
      logger.debug('Could not get Redis status', { error });
    }

    // Get artifact stats
    try {
      const artifactStats = await this.getArtifactStats();
      snapshot.artifactCount = artifactStats.count;
      snapshot.artifactTotalSize = artifactStats.totalSize;
    } catch (error) {
      logger.debug('Could not get artifact stats', { error });
    }

    return snapshot;
  }

  /**
   * Get current CPU usage percentage
   */
  private getCPUUsage(): number {
    const cpus = os.cpus();
    const totalIdle = cpus.reduce((acc, cpu) => acc + cpu.times.idle, 0);
    const totalTick = cpus.reduce((acc, cpu) => {
      return acc + Object.values(cpu.times).reduce((a, b) => a + b, 0);
    }, 0);
    return 100 - Math.round((totalIdle / totalTick) * 100);
  }

  /**
   * Get memory usage in bytes
   */
  private getMemoryUsageBytes(): number {
    return process.memoryUsage().heapUsed;
  }

  /**
   * Get queue status
   */
  private async getQueueStatus(): Promise<number> {
    try {
      const queue = require('@/lib/queue/client').getAuditQueue();
      const counts = await queue.getJobCounts();
      return counts.active + counts.waiting + counts.delayed;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Get database connection status
   */
  private async getDatabaseStatus(): Promise<{ connected: boolean; openConnections: number }> {
    try {
      await prisma.$queryRaw`SELECT 1`;
      return {
        connected: true,
        openConnections: prisma.$client?._activeClient?.connectionCount || 0,
      };
    } catch (error) {
      return {
        connected: false,
        openConnections: 0,
      };
    }
  }

  /**
   * Get Redis status
   */
  private async getRedisStatus(): Promise<{ connected: boolean; memory: number; keyCount: number }> {
    if (!this.redis) {
      return { connected: false, memory: 0, keyCount: 0 };
    }

    try {
      const info = await this.redis.info('memory');
      const keys = await this.redis.dbsize();
      const memoryMatch = info.match(/used_memory:(\d+)/);
      const memory = memoryMatch ? parseInt(memoryMatch[1]) / 1024 / 1024 : 0;

      return {
        connected: true,
        memory,
        keyCount: keys.keys || 0,
      };
    } catch (error) {
      return { connected: false, memory: 0, keyCount: 0 };
    }
  }

  /**
   * Get artifact statistics
   */
  private async getArtifactStats(): Promise<{ count: number; totalSize: number }> {
    try {
      const artifacts = await prisma.playwrightArtifact.findMany({
        select: {
          id: true,
          sizeBytes: true,
        },
      });

      const totalSize = artifacts.reduce((sum, a) => sum + (a.sizeBytes || 0), 0) / 1024 / 1024;
      return {
        count: artifacts.length,
        totalSize,
      };
    } catch (error) {
      return { count: 0, totalSize: 0 };
    }
  }

  /**
   * Generate metrics report
   */
  private generateReport(): MetricsReport {
    const endTime = new Date();
    const duration = (endTime.getTime() - this.startTime.getTime()) / 1000;

    // Calculate aggregated statistics
    const cpuValues = this.snapshots.map(s => s.cpuUsage).filter(v => v > 0);
    const memoryValues = this.snapshots.map(s => s.memoryUsage).filter(v => v > 0);
    const workerCPUValues = this.snapshots.map(s => s.workerCPU).filter(v => v > 0);
    const workerMemValues = this.snapshots.map(s => s.workerMemory).filter(v => v > 0);
    const redisMemValues = this.snapshots.map(s => s.redisMem).filter(v => v > 0);
    const queueSizes = this.snapshots.map(s => s.queueSize).filter(v => v > 0);
    const dashboardLatencies = this.snapshots.map(s => s.dashboardLatency).filter(v => v && v > 0);
    const testDurations = this.snapshots.map(s => s.testDuration).filter(v => v && v > 0);
    const testsPassed = this.snapshots.filter(s => s.testStatus === 'passed').length;
    const totalTests = this.snapshots.filter(s => s.testStatus).length;

    const avg = (arr: number[]) => arr.length ? arr.reduce((a, b) => a + b) / arr.length : 0;
    const max = (arr: number[]) => arr.length ? Math.max(...arr) : 0;

    return {
      startTime: this.startTime,
      endTime,
      duration,
      snapshots: this.snapshots,
      stats: {
        avgCPU: Math.round(avg(cpuValues) * 10) / 10,
        avgMemory: Math.round(avg(memoryValues) * 10) / 10,
        peakMemory: Math.round(max(memoryValues) * 10) / 10,
        avgWorkerCPU: Math.round(avg(workerCPUValues) * 10) / 10,
        avgWorkerMemory: Math.round(avg(workerMemValues)),
        peakWorkerMemory: Math.round(max(workerMemValues)),
        avgRedisMemory: Math.round(avg(redisMemValues) * 10) / 10,
        peakRedisMemory: Math.round(max(redisMemValues) * 10) / 10,
        avgQueueSize: Math.round(avg(queueSizes) * 10) / 10,
        peakQueueSize: Math.round(max(queueSizes)),
        avgDashboardLatency: Math.round(avg(dashboardLatencies)),
        avgTestDuration: Math.round(avg(testDurations)),
        totalTestsRun: totalTests,
        testSuccessRate: totalTests ? (testsPassed / totalTests) * 100 : 0,
      },
      issues: {
        memorySpikes: memoryValues.filter(m => m > 500).length,
        queueBacklogs: queueSizes.filter(q => q > 100).length,
        dbConnErrors: this.snapshots.filter(s => !s.dbConnected).length,
        dashboardTimeouts: dashboardLatencies.filter(l => l > 5000).length,
        artifactStorageWarnings: this.snapshots.filter(s => s.artifactTotalSize > 5000).length,
      },
    };
  }

  /**
   * Get current snapshots
   */
  getSnapshots(): MetricsSnapshot[] {
    return this.snapshots;
  }

  /**
   * Clear snapshots
   */
  clear(): void {
    this.snapshots = [];
  }
}

// Export for use in audit scripts
export { MetricsCollector, MetricsSnapshot, MetricsReport };
