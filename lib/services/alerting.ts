// lib/services/alerting.ts
// Evaluate and trigger alerting rules

import { prisma } from '@/lib/prisma';
import { sendEmailNotification } from '@/lib/services/notification';
import logger, { alertLogger } from '@/lib/logging/logger';
import { calculateToolReliability, getTopFailingTools } from '@/lib/services/reliability';
import { checkQueueHealth } from '@/lib/queue/client';

/**
 * Evaluate all alerting rules
 */
export async function evaluateAllAlertingRules(): Promise<void> {
  try {
    alertLogger.info('Starting alert evaluation cycle');

    const rules = await prisma.alertingRule.findMany({
      where: { enabled: true },
    });

    for (const rule of rules) {
      await evaluateRule(rule);
    }

    alertLogger.info(`Evaluated ${rules.length} alerting rules`);
  } catch (error) {
    alertLogger.error({ error }, 'Failed to evaluate alerting rules');
  }
}

/**
 * Evaluate a single alerting rule
 */
async function evaluateRule(rule: any): Promise<void> {
  try {
    let triggered = false;
    let message = '';

    switch (rule.ruleType) {
      case 'reliability':
        ({ triggered, message } = await checkReliabilityThreshold(rule));
        break;

      case 'critical':
        ({ triggered, message } = await checkCriticalFailures(rule));
        break;

      case 'backlog':
        ({ triggered, message } = await checkQueueBacklog(rule));
        break;

      case 'connection':
        ({ triggered, message } = await checkRedisConnection());
        break;

      case 'offline':
        ({ triggered, message } = await checkWorkerStatus());
        break;

      case 'performance':
        ({ triggered, message } = await checkPerformanceDegradation(rule));
        break;

      default:
        alertLogger.warn({ ruleType: rule.ruleType }, 'Unknown rule type');
        return;
    }

    // Log the alert evaluation
    await prisma.alertLog.create({
      data: {
        ruleId: rule.id,
        triggered,
        message,
        severity: triggered ? 'WARNING' : 'INFO',
        notificationsSent: [],
      },
    });

    // Send notifications if triggered
    if (triggered) {
      await sendAlertNotifications(rule, message);
      await prisma.alertingRule.update({
        where: { id: rule.id },
        data: { lastTriggeredAt: new Date() },
      });
    }
  } catch (error) {
    alertLogger.error({ error, ruleId: rule.id }, 'Failed to evaluate rule');
  }
}

/**
 * Check reliability threshold
 */
async function checkReliabilityThreshold(
  rule: any
): Promise<{ triggered: boolean; message: string }> {
  try {
    const failingTools = await getTopFailingTools(10);

    for (const tool of failingTools) {
      if (tool.reliability30d < rule.threshold) {
        return {
          triggered: true,
          message: `Tool "${tool.toolName}" reliability is ${tool.reliability30d}%, below threshold of ${rule.threshold}%`,
        };
      }
    }

    return { triggered: false, message: 'All tools above reliability threshold' };
  } catch (error) {
    alertLogger.error({ error }, 'Failed to check reliability threshold');
    return { triggered: false, message: 'Error checking reliability' };
  }
}

/**
 * Check for critical failures
 */
async function checkCriticalFailures(
  rule: any
): Promise<{ triggered: boolean; message: string }> {
  try {
    const timeWindowMs = (rule.timeWindowMinutes || 30) * 60 * 1000;
    const startTime = new Date(Date.now() - timeWindowMs);

    // Find tools with consecutive failures
    const tools = await prisma.toolReliability.findMany({
      where: {
        consecutiveFailures: { gte: rule.threshold },
        lastRunAt: { gte: startTime },
      },
    });

    if (tools.length > 0) {
      const tool = tools[0];
      return {
        triggered: true,
        message: `CRITICAL: Tool "${tool.toolName}" has ${tool.consecutiveFailures} consecutive failures`,
      };
    }

    return { triggered: false, message: 'No critical failures detected' };
  } catch (error) {
    alertLogger.error({ error }, 'Failed to check critical failures');
    return { triggered: false, message: 'Error checking critical failures' };
  }
}

/**
 * Check queue backlog
 */
async function checkQueueBacklog(
  rule: any
): Promise<{ triggered: boolean; message: string }> {
  try {
    const pendingJobs = await prisma.auditJob.count({
      where: { status: 'PENDING' },
    });

    if (pendingJobs > rule.threshold) {
      return {
        triggered: true,
        message: `Queue backlog alert: ${pendingJobs} pending jobs (threshold: ${rule.threshold})`,
      };
    }

    return { triggered: false, message: 'Queue backlog below threshold' };
  } catch (error) {
    alertLogger.error({ error }, 'Failed to check queue backlog');
    return { triggered: false, message: 'Error checking queue backlog' };
  }
}

/**
 * Check Redis connection
 */
async function checkRedisConnection(): Promise<{ triggered: boolean; message: string }> {
  try {
    const health = await checkQueueHealth();

    if (!health.connected || !health.redis) {
      return {
        triggered: true,
        message: `Redis connection lost. Queue connected: ${health.queue}`,
      };
    }

    return { triggered: false, message: 'Redis connection healthy' };
  } catch (error) {
    return {
      triggered: true,
      message: `Redis health check failed: ${error instanceof Error ? error.message : 'unknown error'}`,
    };
  }
}

/**
 * Check worker status
 */
async function checkWorkerStatus(): Promise<{ triggered: boolean; message: string }> {
  try {
    const health = await checkQueueHealth();

    if (health.active === 0) {
      return {
        triggered: true,
        message: 'Worker offline: No active jobs',
      };
    }

    return { triggered: false, message: 'Workers are active' };
  } catch (error) {
    return {
      triggered: true,
      message: 'Failed to check worker status',
    };
  }
}

/**
 * Check for performance degradation
 */
async function checkPerformanceDegradation(
  rule: any
): Promise<{ triggered: boolean; message: string }> {
  try {
    // Get average execution time from recent jobs
    const recentJobs = await prisma.auditJob.findMany({
      where: { status: 'COMPLETED' },
      orderBy: { completedAt: 'desc' },
      take: 10,
    });

    if (recentJobs.length === 0) {
      return { triggered: false, message: 'No completed jobs to analyze' };
    }

    const avgDuration =
      recentJobs.reduce((sum, j) => sum + (j.durationMs || 0), 0) /
      recentJobs.length;

    // If execution time exceeds threshold (in ms)
    if (avgDuration > rule.threshold * 1000) {
      return {
        triggered: true,
        message: `Performance degradation: avg execution time ${Math.round(avgDuration / 1000)}s (threshold: ${rule.threshold}s)`,
      };
    }

    return { triggered: false, message: 'Performance within normal parameters' };
  } catch (error) {
    alertLogger.error({ error }, 'Failed to check performance degradation');
    return { triggered: false, message: 'Error checking performance' };
  }
}

/**
 * Send alert notifications
 */
export async function sendAlertNotifications(
  rule: any,
  message: string
): Promise<void> {
  try {
    const lastNotified = rule.lastNotifiedAt;
    const now = new Date();

    // Avoid duplicate notifications within 5 minutes
    if (lastNotified && now.getTime() - lastNotified.getTime() < 5 * 60 * 1000) {
      alertLogger.debug('Skipping duplicate notification');
      return;
    }

    const notificationChannels: string[] = [];

    // Send email
    if (rule.notifyEmail) {
      try {
        await sendEmailNotification(
          rule.emailRecipients?.[0] || 'admin@simplifyconvert.com',
          {
            subject: `ALERT: ${rule.name}`,
            message,
            severity: 'CRITICAL',
            results: {
              total: 0,
              passed: 0,
              failed: 0,
              errors: 0,
              success: 0,
            },
          },
          '' // Empty auditJobId for system alerts
        );
        notificationChannels.push('email');
      } catch (error) {
        alertLogger.error({ error }, 'Failed to send email alert');
      }
    }

    // Send Slack
    if (rule.notifySlack) {
      try {
        // TODO: Implement Slack webhook call
        notificationChannels.push('slack');
      } catch (error) {
        alertLogger.error({ error }, 'Failed to send Slack alert');
      }
    }

    // Send Discord
    if (rule.notifyDiscord) {
      try {
        // TODO: Implement Discord webhook call
        notificationChannels.push('discord');
      } catch (error) {
        alertLogger.error({ error }, 'Failed to send Discord alert');
      }
    }

    // Update last notified time
    await prisma.alertingRule.update({
      where: { id: rule.id },
      data: { lastNotifiedAt: new Date() },
    });

    alertLogger.info(
      { ruleName: rule.name, channels: notificationChannels },
      'Alert notifications sent'
    );
  } catch (error) {
    alertLogger.error({ error }, 'Failed to send alert notifications');
  }
}

/**
 * Get alert history
 */
export async function getAlertHistory(limit: number = 50): Promise<any[]> {
  try {
    const logs = await prisma.alertLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: { alertingRule: true },
    });

    return logs;
  } catch (error) {
    alertLogger.error({ error }, 'Failed to get alert history');
    return [];
  }
}
