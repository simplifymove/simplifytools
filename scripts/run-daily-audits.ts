import prisma from '@/lib/prisma';
import { logger } from '@/lib/logging/logger';
import { MetricsCollector } from './phase8-monitoring';
import Redis from 'ioredis';

/**
 * Phase 8 Daily Audit Orchestrator
 * Runs audits across all tool categories and collects metrics
 */

interface AuditCategory {
  name: string;
  testCount: number;
  categories: string[];
}

const AUDIT_CATEGORIES: AuditCategory[] = [
  {
    name: 'PDF Tools',
    testCount: 15,
    categories: ['pdf'],
  },
  {
    name: 'Image Tools',
    testCount: 12,
    categories: ['image'],
  },
  {
    name: 'Video Tools',
    testCount: 8,
    categories: ['video'],
  },
  {
    name: 'Save From Online',
    testCount: 5,
    categories: ['save-from'],
  },
  {
    name: 'AI Writing Tools',
    testCount: 10,
    categories: ['ai-writing'],
  },
];

interface AuditResult {
  category: string;
  jobId: string;
  startTime: Date;
  endTime: Date;
  duration: number;
  status: 'completed' | 'failed';
  testCount: number;
  passedTests: number;
  failedTests: number;
  successRate: number;
  memoryPeak: number;
  queueWaitTime: number;
}

class DailyAuditOrchestrator {
  private metricsCollector: MetricsCollector;
  private redis: Redis;
  private results: AuditResult[] = [];

  constructor() {
    this.redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
    this.metricsCollector = new MetricsCollector(this.redis);
  }

  /**
   * Run daily audit suite for all categories
   */
  async runDailySuite(options: { sequential?: boolean; concurrency?: number } = {}): Promise<void> {
    const { sequential = true, concurrency = 3 } = options;

    logger.info('Starting Phase 8 Daily Audit Suite', {
      mode: sequential ? 'sequential' : 'concurrent',
      categories: AUDIT_CATEGORIES.length,
      totalTests: AUDIT_CATEGORIES.reduce((sum, c) => sum + c.testCount, 0),
    });

    // Start metrics collection
    await this.metricsCollector.start(5); // Collect every 5 seconds

    try {
      if (sequential) {
        await this.runSequential();
      } else {
        await this.runConcurrent(concurrency);
      }

      // Generate report
      const report = await this.metricsCollector.stop();
      await this.generateAuditReport(report);
    } catch (error) {
      logger.error('Error in daily audit suite', { error });
      await this.metricsCollector.stop();
      throw error;
    }
  }

  /**
   * Run audits sequentially
   */
  private async runSequential(): Promise<void> {
    for (const category of AUDIT_CATEGORIES) {
      logger.info(`Starting audit: ${category.name}`, { testCount: category.testCount });

      try {
        const result = await this.runAudit(category);
        this.results.push(result);

        logger.info(`Completed audit: ${category.name}`, {
          duration: result.duration,
          successRate: result.successRate,
          status: result.status,
        });

        // Wait 30 seconds between audits for cleanup
        await new Promise(resolve => setTimeout(resolve, 30000));
      } catch (error) {
        logger.error(`Error in audit: ${category.name}`, { error });
        this.results.push({
          category: category.name,
          jobId: 'unknown',
          startTime: new Date(),
          endTime: new Date(),
          duration: 0,
          status: 'failed',
          testCount: category.testCount,
          passedTests: 0,
          failedTests: category.testCount,
          successRate: 0,
          memoryPeak: 0,
          queueWaitTime: 0,
        });
      }
    }
  }

  /**
   * Run audits concurrently with max concurrency
   */
  private async runConcurrent(maxConcurrency: number): Promise<void> {
    const queue: AuditCategory[] = [...AUDIT_CATEGORIES];
    const running: Promise<void>[] = [];

    while (queue.length > 0 || running.length > 0) {
      // Start new audits up to max concurrency
      while (running.length < maxConcurrency && queue.length > 0) {
        const category = queue.shift()!;
        const promise = this.runAudit(category)
          .then(result => {
            this.results.push(result);
            logger.info(`Completed audit: ${category.name}`, {
              duration: result.duration,
              successRate: result.successRate,
            });
          })
          .catch(error => {
            logger.error(`Error in audit: ${category.name}`, { error });
            this.results.push({
              category: category.name,
              jobId: 'unknown',
              startTime: new Date(),
              endTime: new Date(),
              duration: 0,
              status: 'failed',
              testCount: category.testCount,
              passedTests: 0,
              failedTests: category.testCount,
              successRate: 0,
              memoryPeak: 0,
              queueWaitTime: 0,
            });
          });

        running.push(promise);
      }

      // Wait for first to complete
      if (running.length > 0) {
        await Promise.race(running);
        running.splice(
          running.findIndex(p => (p as any).finished),
          1,
        );
      }
    }

    // Wait for all remaining
    await Promise.all(running);
  }

  /**
   * Run single audit category
   */
  private async runAudit(category: AuditCategory): Promise<AuditResult> {
    const startTime = new Date();

    try {
      // Create audit job
      const job = await this.createAuditJob(category);

      const queueWaitStart = Date.now();
      // Wait for job completion
      const auditRun = await this.waitForJobCompletion(job.id);
      const queueWaitTime = Date.now() - queueWaitStart;

      const endTime = new Date();
      const duration = (endTime.getTime() - startTime.getTime()) / 1000;

      const result: AuditResult = {
        category: category.name,
        jobId: job.id,
        startTime,
        endTime,
        duration,
        status: auditRun?.status === 'COMPLETED' ? 'completed' : 'failed',
        testCount: auditRun?.totalTests || category.testCount,
        passedTests: auditRun?.passedTests || 0,
        failedTests: auditRun?.failedTests || 0,
        successRate: auditRun ? (auditRun.passedTests / auditRun.totalTests) * 100 : 0,
        memoryPeak: 0, // Collect from metrics
        queueWaitTime,
      };

      return result;
    } catch (error) {
      logger.error(`Audit failed for ${category.name}`, { error });
      return {
        category: category.name,
        jobId: 'unknown',
        startTime,
        endTime: new Date(),
        duration: 0,
        status: 'failed',
        testCount: category.testCount,
        passedTests: 0,
        failedTests: category.testCount,
        successRate: 0,
        memoryPeak: 0,
        queueWaitTime: 0,
      };
    }
  }

  /**
   * Create audit job via API
   */
  private async createAuditJob(category: AuditCategory): Promise<{ id: string }> {
    // In real usage, this would call the audit API
    // For now, return mock data
    const job = await prisma.auditJob.create({
      data: {
        toolCategories: category.categories,
        priority: 'NORMAL',
        status: 'QUEUED',
        metadata: {
          phase: 'phase8',
          dailySuite: true,
          category: category.name,
        },
      },
    });

    return { id: job.id };
  }

  /**
   * Wait for job completion
   */
  private async waitForJobCompletion(jobId: string, timeoutSeconds = 600): Promise<any> {
    const startTime = Date.now();
    const timeoutMs = timeoutSeconds * 1000;

    while (Date.now() - startTime < timeoutMs) {
      const auditRun = await prisma.auditRun.findFirst({
        where: {
          auditJobId: jobId,
        },
      });

      if (auditRun && (auditRun.status === 'COMPLETED' || auditRun.status === 'FAILED')) {
        return auditRun;
      }

      // Wait 5 seconds before checking again
      await new Promise(resolve => setTimeout(resolve, 5000));
    }

    throw new Error(`Audit job ${jobId} did not complete within ${timeoutSeconds} seconds`);
  }

  /**
   * Generate audit report
   */
  private async generateAuditReport(metricsReport: any): Promise<void> {
    const reportPath = './reports/phase8-daily-audit.json';

    const report = {
      timestamp: new Date().toISOString(),
      duration: metricsReport.duration,
      auditResults: this.results,
      metrics: metricsReport.stats,
      issues: metricsReport.issues,
      summary: {
        totalAudits: this.results.length,
        successfulAudits: this.results.filter(r => r.status === 'completed').length,
        failedAudits: this.results.filter(r => r.status === 'failed').length,
        totalTests: this.results.reduce((sum, r) => sum + r.testCount, 0),
        totalPassed: this.results.reduce((sum, r) => sum + r.passedTests, 0),
        totalFailed: this.results.reduce((sum, r) => sum + r.failedTests, 0),
        overallSuccessRate: this.calculateOverallSuccessRate(),
      },
    };

    logger.info('Daily Audit Suite Complete', {
      report: report.summary,
      avgDuration: this.results.reduce((sum, r) => sum + r.duration, 0) / this.results.length,
    });

    console.log('\n=== Phase 8 Daily Audit Results ===\n');
    console.log(JSON.stringify(report, null, 2));

    // Save to file
    const fs = require('fs');
    const dir = './reports';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    logger.info(`Audit report saved to ${reportPath}`);
  }

  /**
   * Calculate overall success rate
   */
  private calculateOverallSuccessRate(): number {
    const totalTests = this.results.reduce((sum, r) => sum + r.testCount, 0);
    if (totalTests === 0) return 0;
    const passedTests = this.results.reduce((sum, r) => sum + r.passedTests, 0);
    return (passedTests / totalTests) * 100;
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
  const orchestrator = new DailyAuditOrchestrator();

  try {
    // Parse command line arguments
    const mode = process.argv.includes('--concurrent') ? 'concurrent' : 'sequential';
    const concurrency = parseInt(process.argv.find(arg => arg.startsWith('--concurrency='))?.split('=')[1] || '3');

    logger.info('Phase 8 Daily Audit Orchestrator Starting', {
      mode,
      concurrency,
    });

    await orchestrator.runDailySuite({
      sequential: mode === 'sequential',
      concurrency,
    });

    logger.info('Phase 8 Daily Audit Suite Completed Successfully');
  } catch (error) {
    logger.error('Phase 8 Daily Audit Suite Failed', { error });
    process.exit(1);
  } finally {
    await orchestrator.close();
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

export { DailyAuditOrchestrator, AuditCategory, AuditResult };
