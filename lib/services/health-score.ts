// lib/services/health-score.ts
// Calculate platform and category health scores

import { prisma } from '@/lib/prisma';
import logger from '@/lib/logging/logger';

const CATEGORIES = ['pdf', 'image', 'video', 'ai', 'document', 'converter'];

/**
 * Calculate health score for a category (0-100)
 */
export async function calculateCategoryHealth(
  category: string
): Promise<number> {
  try {
    const tools = await prisma.toolReliability.findMany({
      where: { category },
    });

    if (tools.length === 0) return 100; // No data = healthy

    const avgReliability =
      tools.reduce((sum, t) => sum + t.reliability30d, 0) / tools.length;

    return Math.round(avgReliability * 100) / 100;
  } catch (error) {
    logger.error({ error, category }, 'Failed to calculate category health');
    return 0;
  }
}

/**
 * Calculate overall platform health score
 */
export async function calculateOverallHealth(): Promise<number> {
  try {
    const categoryScores: Record<string, number> = {};

    for (const category of CATEGORIES) {
      categoryScores[category] = await calculateCategoryHealth(category);
    }

    const scores = Object.values(categoryScores);
    const overallScore =
      scores.reduce((sum, score) => sum + score, 0) / scores.length;

    return Math.round(overallScore * 100) / 100;
  } catch (error) {
    logger.error({ error }, 'Failed to calculate overall health');
    return 0;
  }
}

/**
 * Generate comprehensive health report
 */
export async function generateHealthReport(): Promise<{
  overallScore: number;
  categoryScores: Record<string, number>;
  metrics: any;
  timestamp: Date;
}> {
  try {
    const categoryScores: Record<string, number> = {};

    for (const category of CATEGORIES) {
      categoryScores[category] = await calculateCategoryHealth(category);
    }

    const overallScore =
      Object.values(categoryScores).reduce((sum, score) => sum + score, 0) /
      CATEGORIES.length;

    // Get aggregate metrics
    const allResults = await prisma.auditTestResult.findMany();
    const allJobs = await prisma.auditJob.findMany({
      where: { status: 'COMPLETED' },
    });

    const totalRuns = allResults.length;
    const successfulRuns = allResults.filter(
      (r) => r.status === 'PASS'
    ).length;
    const failedRuns = allResults.filter((r) => r.status === 'FAIL').length;

    const avgExecutionTime =
      allJobs.length > 0
        ? allJobs.reduce((sum, j) => sum + (j.durationMs || 0), 0) /
          allJobs.length
        : 0;

    const metrics = {
      totalRuns,
      successfulRuns,
      failedRuns,
      successRate: totalRuns > 0 ? (successfulRuns / totalRuns) * 100 : 0,
      avgExecutionTimeMs: Math.round(avgExecutionTime),
      lastUpdated: new Date(),
    };

    // Save health score to database
    await prisma.platformHealthScore.create({
      data: {
        overallScore: Math.round(overallScore * 100) / 100,
        pdfHealth: categoryScores['pdf'] || 0,
        imageHealth: categoryScores['image'] || 0,
        videoHealth: categoryScores['video'] || 0,
        aiHealth: categoryScores['ai'] || 0,
        documentHealth: categoryScores['document'] || 0,
        converterHealth: categoryScores['converter'] || 0,
        totalRuns,
        successfulRuns,
        failedRuns,
        avgExecutionTimeMs: Math.round(avgExecutionTime),
        avgQueueWaitTimeMs: 0, // TODO: Calculate from queue metrics
        redisConnected: true,
      },
    });

    return {
      overallScore: Math.round(overallScore * 100) / 100,
      categoryScores,
      metrics,
      timestamp: new Date(),
    };
  } catch (error) {
    logger.error({ error }, 'Failed to generate health report');
    return {
      overallScore: 0,
      categoryScores: {},
      metrics: {},
      timestamp: new Date(),
    };
  }
}

/**
 * Get latest health score
 */
export async function getLatestHealthScore(): Promise<any> {
  try {
    const latest = await prisma.platformHealthScore.findFirst({
      orderBy: { timestamp: 'desc' },
    });

    return latest || (await generateHealthReport());
  } catch (error) {
    logger.error({ error }, 'Failed to get latest health score');
    return null;
  }
}

/**
 * Get health score history
 */
export async function getHealthScoreHistory(days: number = 7): Promise<any[]> {
  try {
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const history = await prisma.platformHealthScore.findMany({
      where: {
        timestamp: { gte: startDate },
      },
      orderBy: { timestamp: 'asc' },
      take: 100,
    });

    return history;
  } catch (error) {
    logger.error({ error, days }, 'Failed to get health score history');
    return [];
  }
}

/**
 * Determine if a score indicates an alert condition
 */
export function shouldTriggerAlert(score: number, threshold: number = 90): boolean {
  return score < threshold;
}

/**
 * Get health status label
 */
export function getHealthStatus(score: number): string {
  if (score >= 95) return 'Excellent';
  if (score >= 90) return 'Good';
  if (score >= 80) return 'Fair';
  if (score >= 70) return 'Poor';
  return 'Critical';
}
