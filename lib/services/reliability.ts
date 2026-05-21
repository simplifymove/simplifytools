// lib/services/reliability.ts
// Track and calculate tool reliability scores

import { prisma } from '@/lib/prisma';
import logger from '@/lib/logging/logger';
import { ReliabilityStatus } from '@prisma/client';

/**
 * Calculate reliability percentage for a tool
 */
export async function calculateToolReliability(
  toolName: string,
  days: 24 | 7 | 30 = 30
): Promise<number> {
  try {
    const timeWindowMs = days * 24 * 60 * 60 * 1000;
    const startTime = new Date(Date.now() - timeWindowMs);

    const results = await prisma.auditTestResult.findMany({
      where: {
        toolName,
        timestamp: { gte: startTime },
      },
    });

    if (results.length === 0) return 100; // No failures = healthy

    const passed = results.filter((r) => r.status === 'PASS').length;
    const reliability = (passed / results.length) * 100;

    return Math.round(reliability * 100) / 100;
  } catch (error) {
    logger.error({ error, toolName, days }, 'Failed to calculate tool reliability');
    return 0;
  }
}

/**
 * Determine reliability status based on score
 */
export function getReliabilityStatus(score: number): ReliabilityStatus {
  if (score >= 95) return ReliabilityStatus.STABLE;
  if (score >= 80) return ReliabilityStatus.FLAKY;
  return ReliabilityStatus.CRITICAL;
}

/**
 * Update reliability scores for all tools (run periodically)
 */
export async function updateAllReliabilityScores() {
  try {
    logger.info('Starting reliability score update for all tools');

    // Get all unique tools
    const tools = await prisma.auditTestResult.findMany({
      distinct: ['toolName'],
      select: { toolName: true, category: true },
    });

    for (const { toolName, category } of tools) {
      const reliability24h = await calculateToolReliability(toolName, 24);
      const reliability7d = await calculateToolReliability(toolName, 7);
      const reliability30d = await calculateToolReliability(toolName, 30);

      const status = getReliabilityStatus(reliability30d);

      // Get totals
      const allResults = await prisma.auditTestResult.findMany({
        where: { toolName },
      });

      const successfulRuns = allResults.filter((r) => r.status === 'PASS').length;
      const failedRuns = allResults.filter((r) => r.status === 'FAIL').length;

      // Upsert reliability record
      await prisma.toolReliability.upsert({
        where: { toolName },
        create: {
          toolName,
          category,
          totalRuns: allResults.length,
          successfulRuns,
          failedRuns,
          reliability24h,
          reliability7d,
          reliability30d,
          status,
          lastRunAt: allResults[allResults.length - 1]?.timestamp,
        },
        update: {
          totalRuns: allResults.length,
          successfulRuns,
          failedRuns,
          reliability24h,
          reliability7d,
          reliability30d,
          status,
          lastRunAt: allResults[allResults.length - 1]?.timestamp,
        },
      });
    }

    logger.info(`Updated reliability scores for ${tools.length} tools`);
  } catch (error) {
    logger.error({ error }, 'Failed to update reliability scores');
  }
}

/**
 * Get top failing tools
 */
export async function getTopFailingTools(limit: number = 5): Promise<any[]> {
  try {
    const failing = await prisma.toolReliability.findMany({
      where: {
        reliability30d: { lt: 90 },
      },
      orderBy: { reliability30d: 'asc' },
      take: limit,
    });

    return failing;
  } catch (error) {
    logger.error({ error }, 'Failed to get top failing tools');
    return [];
  }
}

/**
 * Get tools by status
 */
export async function getToolsByStatus(
  status: ReliabilityStatus
): Promise<any[]> {
  try {
    const tools = await prisma.toolReliability.findMany({
      where: { status },
      orderBy: { reliability30d: 'asc' },
    });

    return tools;
  } catch (error) {
    logger.error({ error, status }, 'Failed to get tools by status');
    return [];
  }
}

/**
 * Get reliability summary by category
 */
export async function getCategoryReliability(category: string): Promise<{
  category: string;
  averageReliability: number;
  toolCount: number;
  healthyTools: number;
  flakyTools: number;
  criticalTools: number;
}> {
  try {
    const tools = await prisma.toolReliability.findMany({
      where: { category },
    });

    if (tools.length === 0) {
      return {
        category,
        averageReliability: 100,
        toolCount: 0,
        healthyTools: 0,
        flakyTools: 0,
        criticalTools: 0,
      };
    }

    const avgReliability =
      tools.reduce((sum, t) => sum + t.reliability30d, 0) / tools.length;

    const healthyTools = tools.filter((t) => t.status === 'STABLE').length;
    const flakyTools = tools.filter((t) => t.status === 'FLAKY').length;
    const criticalTools = tools.filter((t) => t.status === 'CRITICAL').length;

    return {
      category,
      averageReliability: Math.round(avgReliability * 100) / 100,
      toolCount: tools.length,
      healthyTools,
      flakyTools,
      criticalTools,
    };
  } catch (error) {
    logger.error({ error, category }, 'Failed to get category reliability');
    return {
      category,
      averageReliability: 0,
      toolCount: 0,
      healthyTools: 0,
      flakyTools: 0,
      criticalTools: 0,
    };
  }
}
