import fs from 'fs';
import path from 'path';
import prisma from '@/lib/prisma';
import { logger } from '@/lib/logging/logger';
import Redis from 'ioredis';

/**
 * Phase 8 Performance Baseline Measurement
 * Measures system resources, database performance, and service latencies
 */

interface PerformanceBaseline {
  timestamp: Date;
  environment: string;
  
  // System Resources
  system: {
    cpuModel: string;
    cpuCores: number;
    totalMemory: number;
    freeMemory: number;
    nodeVersion: string;
  };
  
  // Database Performance
  database: {
    connectionPoolSize: number;
    queryCount24h: number;
    avgQueryTime: number;
    maxQueryTime: number;
    slowQueries: {
      query: string;
      avgTime: number;
      count: number;
    }[];
  };
  
  // Redis Performance
  redis: {
    memory: number;
    keyCount: number;
    opsPerSec: number;
    evictionPolicy: string;
  };
  
  // API Endpoint Performance
  api: {
    queueMonitoring: {
      avgLatency: number;
      p95Latency: number;
      p99Latency: number;
      errorRate: number;
    };
    healthMonitoring: {
      avgLatency: number;
      p95Latency: number;
      p99Latency: number;
      errorRate: number;
    };
    reliabilityMonitoring: {
      avgLatency: number;
      p95Latency: number;
      p99Latency: number;
      errorRate: number;
    };
    failureMonitoring: {
      avgLatency: number;
      p95Latency: number;
      p99Latency: number;
      errorRate: number;
    };
  };
  
  // Worker Performance
  worker: {
    avgCPU: number;
    avgMemory: number;
    maxMemory: number;
    avgJobDuration: number;
    jobsPerHour: number;
    errorRate: number;
  };
  
  // Playwright Performance
  playwright: {
    avgProcessMemory: number;
    maxProcessMemory: number;
    avgStartupTime: number;
    avgNavigationTime: number;
  };
  
  // Dashboard Performance
  dashboard: {
    pageLoadTime: number;
    firstPaint: number;
    timeToInteractive: number;
    apiResponseTime: number;
  };
}

class PerformanceBaselineCollector {
  private redis: Redis;
  private measurements: Map<string, number[]> = new Map();

  constructor() {
    this.redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
  }

  /**
   * Collect comprehensive performance baseline
   */
  async collectBaseline(): Promise<PerformanceBaseline> {
    logger.info('Starting performance baseline collection...');

    const baseline: PerformanceBaseline = {
      timestamp: new Date(),
      environment: process.env.NODE_ENV || 'development',

      system: this.getSystemInfo(),
      database: await this.getDatabasePerformance(),
      redis: await this.getRedisPerformance(),
      api: await this.getAPIPerformance(),
      worker: await this.getWorkerPerformance(),
      playwright: await this.getPlaywrightPerformance(),
      dashboard: await this.getDashboardPerformance(),
    };

    logger.info('Performance baseline collection complete');
    return baseline;
  }

  /**
   * Get system information
   */
  private getSystemInfo(): PerformanceBaseline['system'] {
    const os = require('os');
    return {
      cpuModel: os.cpus()[0]?.model || 'unknown',
      cpuCores: os.cpus().length,
      totalMemory: os.totalmem(),
      freeMemory: os.freemem(),
      nodeVersion: process.version,
    };
  }

  /**
   * Measure database performance
   */
  private async getDatabasePerformance(): Promise<PerformanceBaseline['database'] {
    try {
      const start = Date.now();

      // Run test queries
      const queries = [
        () => prisma.auditRun.findMany({ take: 100 }),
        () => prisma.toolReliability.findMany({ take: 100 }),
        () => prisma.auditTestResult.findMany({ take: 100 }),
        () => prisma.failureRecord.findMany({ take: 100 }),
        () => prisma.platformHealthScore.findMany({ take: 10 }),
      ];

      const queryTimes: number[] = [];
      for (const query of queries) {
        const queryStart = Date.now();
        await query();
        queryTimes.push(Date.now() - queryStart);
      }

      const totalTime = Date.now() - start;

      // Get slow query info from database
      const slowQueries = await prisma.$queryRaw`
        SELECT query, mean_time, calls
        FROM pg_stat_statements
        WHERE mean_time > 100
        ORDER BY mean_time DESC
        LIMIT 10
      ` as any[];

      return {
        connectionPoolSize: 10, // Default Prisma pool size
        queryCount24h: await prisma.auditTestResult.count(),
        avgQueryTime: Math.round(queryTimes.reduce((a, b) => a + b) / queryTimes.length),
        maxQueryTime: Math.max(...queryTimes),
        slowQueries: slowQueries.map(q => ({
          query: q.query,
          avgTime: q.mean_time,
          count: q.calls,
        })),
      };
    } catch (error) {
      logger.error('Error collecting database performance', { error });
      return {
        connectionPoolSize: 0,
        queryCount24h: 0,
        avgQueryTime: 0,
        maxQueryTime: 0,
        slowQueries: [],
      };
    }
  }

  /**
   * Measure Redis performance
   */
  private async getRedisPerformance(): Promise<PerformanceBaseline['redis'] {
    try {
      const info = await this.redis.info('memory');
      const memoryMatch = info.match(/used_memory:(\d+)/);
      const memory = memoryMatch ? parseInt(memoryMatch[1]) : 0;

      const keyCount = await this.redis.dbsize();

      // Measure ops per second
      const opsStart = Date.now();
      for (let i = 0; i < 1000; i++) {
        await this.redis.set(`bench-${i}`, i);
      }
      const opsDuration = (Date.now() - opsStart) / 1000;
      const opsPerSec = 1000 / opsDuration;

      // Clean up
      for (let i = 0; i < 1000; i++) {
        await this.redis.del(`bench-${i}`);
      }

      const configMatch = info.match(/maxmemory_policy:(.+)/);
      const evictionPolicy = configMatch ? configMatch[1].trim() : 'unknown';

      return {
        memory,
        keyCount: keyCount.keys || 0,
        opsPerSec: Math.round(opsPerSec),
        evictionPolicy,
      };
    } catch (error) {
      logger.error('Error collecting Redis performance', { error });
      return {
        memory: 0,
        keyCount: 0,
        opsPerSec: 0,
        evictionPolicy: 'unknown',
      };
    }
  }

  /**
   * Measure API endpoint performance
   */
  private async getAPIPerformance(): Promise<PerformanceBaseline['api'] {
    const baseUrl = 'http://localhost:3000/api/admin/audit/monitoring';
    const endpoints = ['queue', 'health', 'reliability', 'failures'];
    const measurements: Record<string, number[]> = {};

    for (const endpoint of endpoints) {
      measurements[endpoint] = [];

      // Make 10 requests to each endpoint
      for (let i = 0; i < 10; i++) {
        try {
          const start = Date.now();
          const response = await fetch(`${baseUrl}/${endpoint}`, {
            headers: {
              'Authorization': `Bearer ${process.env.ADMIN_TOKEN || ''}`,
            },
          });
          const latency = Date.now() - start;
          measurements[endpoint].push(latency);
        } catch (error) {
          logger.debug(`Error measuring ${endpoint}`, { error });
        }
      }
    }

    const calculateStats = (times: number[]) => {
      if (times.length === 0) return { avg: 0, p95: 0, p99: 0, errorRate: 0 };
      times.sort((a, b) => a - b);
      return {
        avg: Math.round(times.reduce((a, b) => a + b) / times.length),
        p95: Math.round(times[Math.floor(times.length * 0.95)]),
        p99: Math.round(times[Math.floor(times.length * 0.99)]),
        errorRate: 0,
      };
    };

    return {
      queueMonitoring: calculateStats(measurements['queue'] || []),
      healthMonitoring: calculateStats(measurements['health'] || []),
      reliabilityMonitoring: calculateStats(measurements['reliability'] || []),
      failureMonitoring: calculateStats(measurements['failures'] || []),
    };
  }

  /**
   * Measure worker performance
   */
  private async getWorkerPerformance(): Promise<PerformanceBaseline['worker'] {
    try {
      // Get job execution data from database
      const recentJobs = await prisma.auditRun.findMany({
        where: {
          status: 'COMPLETED',
          startTime: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
          },
        },
        take: 100,
      });

      if (recentJobs.length === 0) {
        return {
          avgCPU: 0,
          avgMemory: 0,
          maxMemory: 0,
          avgJobDuration: 0,
          jobsPerHour: 0,
          errorRate: 0,
        };
      }

      const durations = recentJobs.map(job => {
        const start = job.startTime?.getTime() || 0;
        const end = job.endTime?.getTime() || 0;
        return (end - start) / 1000; // seconds
      });

      const avgDuration = durations.reduce((a, b) => a + b) / durations.length;
      const failedJobs = await prisma.auditRun.count({
        where: {
          status: 'FAILED',
          startTime: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
          },
        },
      });

      const totalJobs = recentJobs.length + failedJobs;
      const jobsPerHour = (totalJobs / 24) || 0;
      const errorRate = (failedJobs / totalJobs) * 100 || 0;

      return {
        avgCPU: 0, // Would need worker process monitoring
        avgMemory: 0,
        maxMemory: 0,
        avgJobDuration: Math.round(avgDuration),
        jobsPerHour: Math.round(jobsPerHour * 100) / 100,
        errorRate: Math.round(errorRate * 100) / 100,
      };
    } catch (error) {
      logger.error('Error collecting worker performance', { error });
      return {
        avgCPU: 0,
        avgMemory: 0,
        maxMemory: 0,
        avgJobDuration: 0,
        jobsPerHour: 0,
        errorRate: 0,
      };
    }
  }

  /**
   * Measure Playwright performance (stub)
   */
  private async getPlaywrightPerformance(): Promise<PerformanceBaseline['playwright'] {
    return {
      avgProcessMemory: 0,
      maxProcessMemory: 0,
      avgStartupTime: 0,
      avgNavigationTime: 0,
    };
  }

  /**
   * Measure dashboard performance (stub)
   */
  private async getDashboardPerformance(): Promise<PerformanceBaseline['dashboard'] {
    return {
      pageLoadTime: 0,
      firstPaint: 0,
      timeToInteractive: 0,
      apiResponseTime: 0,
    };
  }

  /**
   * Save baseline to file
   */
  async saveBaseline(baseline: PerformanceBaseline, filename: string = 'baseline.json'): Promise<void> {
    const dir = './reports/performance';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const filepath = path.join(dir, filename);
    fs.writeFileSync(filepath, JSON.stringify(baseline, null, 2));
    logger.info(`Baseline saved to ${filepath}`);
  }

  /**
   * Compare two baselines
   */
  compareBaselines(
    before: PerformanceBaseline,
    after: PerformanceBaseline,
  ): Record<string, Record<string, { before: number; after: number; change: number; changePercent: number }>> {
    const compare = (key: string, beforeVal: any, afterVal: any): any => {
      if (typeof beforeVal === 'number' && typeof afterVal === 'number') {
        const change = afterVal - beforeVal;
        const changePercent = beforeVal !== 0 ? (change / beforeVal) * 100 : 0;
        return {
          before: beforeVal,
          after: afterVal,
          change,
          changePercent: Math.round(changePercent * 100) / 100,
        };
      }
      return null;
    };

    return {
      database: {
        avgQueryTime: compare('avgQueryTime', before.database.avgQueryTime, after.database.avgQueryTime),
        maxQueryTime: compare('maxQueryTime', before.database.maxQueryTime, after.database.maxQueryTime),
      },
      worker: {
        avgJobDuration: compare('avgJobDuration', before.worker.avgJobDuration, after.worker.avgJobDuration),
        errorRate: compare('errorRate', before.worker.errorRate, after.worker.errorRate),
      },
      redis: {
        memory: compare('memory', before.redis.memory, after.redis.memory),
        keyCount: compare('keyCount', before.redis.keyCount, after.redis.keyCount),
      },
      api: {
        queueLatency: compare(
          'avgLatency',
          before.api.queueMonitoring.avgLatency,
          after.api.queueMonitoring.avgLatency,
        ),
        healthLatency: compare(
          'avgLatency',
          before.api.healthMonitoring.avgLatency,
          after.api.healthMonitoring.avgLatency,
        ),
      },
    };
  }

  /**
   * Close connections
   */
  async close(): Promise<void> {
    await this.redis.disconnect();
    await prisma.$disconnect();
  }
}

/**
 * CLI Entry Point
 */
async function main() {
  const collector = new PerformanceBaselineCollector();

  try {
    const baseline = await collector.collectBaseline();
    await collector.saveBaseline(baseline, `baseline-${new Date().toISOString().split('T')[0]}.json`);

    console.log('\n=== Performance Baseline ===\n');
    console.log(JSON.stringify(baseline, null, 2));

    logger.info('Performance baseline collection complete');
  } catch (error) {
    logger.error('Performance baseline collection failed', { error });
    process.exit(1);
  } finally {
    await collector.close();
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

export { PerformanceBaselineCollector, PerformanceBaseline };
