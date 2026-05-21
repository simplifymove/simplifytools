// lib/services/flaky-detection.ts
// Detect and track flaky tests

import { prisma } from '@/lib/prisma';
import logger from '@/lib/logging/logger';

interface FlakyTestPattern {
  toolName: string;
  consecutivePasses: number;
  consecutiveFailures: number;
  alternatingPattern: boolean;
  timeoutHeavy: boolean;
  flakiness: number; // percentage
}

/**
 * Analyze flaky patterns for a tool
 */
export async function analyzeFlakyPatterns(
  toolName: string,
  windowSize: number = 20
): Promise<FlakyTestPattern | null> {
  try {
    const results = await prisma.auditTestResult.findMany({
      where: { toolName },
      orderBy: { timestamp: 'desc' },
      take: windowSize,
    });

    if (results.length === 0) {
      return null;
    }

    // Reverse to chronological order
    results.reverse();

    // Count patterns
    let consecutivePasses = 0;
    let consecutiveFailures = 0;
    let alternations = 0;
    let timeouts = 0;
    let lastStatus: string | null = null;

    for (const result of results) {
      const isPassed = result.status === 'PASS';
      const isFailed = result.status === 'FAIL';

      if (isPassed) {
        if (lastStatus === 'FAIL') alternations++;
        consecutivePasses++;
        consecutiveFailures = 0;
      } else if (isFailed) {
        if (lastStatus === 'PASS') alternations++;
        consecutiveFailures++;
        consecutivePasses = 0;
        if (result.errorMessage?.includes('timeout')) {
          timeouts++;
        }
      }

      lastStatus = isPassed ? 'PASS' : 'FAIL';
    }

    const failureCount = results.filter((r) => r.status === 'FAIL').length;
    const flakiness = (failureCount / results.length) * 100;
    const alternatingPattern = alternations > results.length * 0.3; // More than 30% alternation
    const timeoutHeavy = (timeouts / failureCount) > 0.5; // More than 50% of failures are timeouts

    return {
      toolName,
      consecutivePasses,
      consecutiveFailures,
      alternatingPattern,
      timeoutHeavy,
      flakiness: Math.round(flakiness * 100) / 100,
    };
  } catch (error) {
    logger.error({ error, toolName }, 'Failed to analyze flaky patterns');
    return null;
  }
}

/**
 * Check if a tool is flaky
 */
export async function isFlakyTool(toolName: string): Promise<boolean> {
  try {
    const pattern = await analyzeFlakyPatterns(toolName);
    if (!pattern) return false;

    // Flaky if:
    // - 20-70% failure rate (not consistently failing)
    // - Has alternating pattern
    // - OR timeout heavy

    return (
      (pattern.flakiness > 20 && pattern.flakiness < 70) ||
      pattern.alternatingPattern ||
      pattern.timeoutHeavy
    );
  } catch (error) {
    logger.error({ error, toolName }, 'Failed to check if tool is flaky');
    return false;
  }
}

/**
 * Get flakiness percentage for a tool
 */
export async function getFlakiness(toolName: string): Promise<number> {
  try {
    const pattern = await analyzeFlakyPatterns(toolName, 50);
    return pattern?.flakiness || 0;
  } catch (error) {
    logger.error({ error, toolName }, 'Failed to get flakiness');
    return 0;
  }
}

/**
 * Get all flaky tests
 */
export async function getFlakyTests(threshold: number = 30): Promise<
  Array<{
    toolName: string;
    category: string;
    flakiness: number;
    consecutiveFailures: number;
  }>
> {
  try {
    const tools = await prisma.toolReliability.findMany({
      where: {
        status: { in: ['FLAKY'] },
      },
    });

    const flakyTests = [];

    for (const tool of tools) {
      const pattern = await analyzeFlakyPatterns(tool.toolName, 50);
      if (pattern && pattern.flakiness > threshold) {
        flakyTests.push({
          toolName: tool.toolName,
          category: tool.category,
          flakiness: pattern.flakiness,
          consecutiveFailures: pattern.consecutiveFailures,
        });
      }
    }

    return flakyTests.sort((a, b) => b.flakiness - a.flakiness);
  } catch (error) {
    logger.error({ error }, 'Failed to get flaky tests');
    return [];
  }
}

/**
 * Detect timeout-heavy tools
 */
export async function getTimeoutHeavyTools(): Promise<
  Array<{
    toolName: string;
    category: string;
    timeoutPercentage: number;
  }>
> {
  try {
    const tools = await prisma.toolReliability.findMany({
      select: { toolName: true, category: true },
    });

    const timeoutHeavy = [];

    for (const tool of tools) {
      const pattern = await analyzeFlakyPatterns(tool.toolName);
      if (pattern && pattern.timeoutHeavy) {
        const failureCount = await prisma.auditTestResult.count({
          where: {
            toolName: tool.toolName,
            status: 'FAIL',
          },
        });

        const timeoutCount = await prisma.auditTestResult.count({
          where: {
            toolName: tool.toolName,
            status: 'FAIL',
            errorMessage: { contains: 'timeout' },
          },
        });

        if (failureCount > 0) {
          const timeoutPercentage = (timeoutCount / failureCount) * 100;
          if (timeoutPercentage > 50) {
            timeoutHeavy.push({
              toolName: tool.toolName,
              category: tool.category,
              timeoutPercentage: Math.round(timeoutPercentage),
            });
          }
        }
      }
    }

    return timeoutHeavy;
  } catch (error) {
    logger.error({ error }, 'Failed to get timeout-heavy tools');
    return [];
  }
}

/**
 * Get random pass/fail pattern detection
 */
export async function detectRandomFailures(
  toolName: string,
  windowSize: number = 30
): Promise<{
  isRandom: boolean;
  confidence: number;
  description: string;
}> {
  try {
    const results = await prisma.auditTestResult.findMany({
      where: { toolName },
      orderBy: { timestamp: 'desc' },
      take: windowSize,
    });

    if (results.length < 5) {
      return {
        isRandom: false,
        confidence: 0,
        description: 'Insufficient data',
      };
    }

    results.reverse();

    // Simple randomness detection: check for high alternation
    let alternations = 0;
    for (let i = 1; i < results.length; i++) {
      const prevPass = results[i - 1].status === 'PASS';
      const currPass = results[i].status === 'PASS';
      if (prevPass !== currPass) {
        alternations++;
      }
    }

    const alternationRate = alternations / (results.length - 1);
    const isRandom = alternationRate > 0.4 && alternationRate < 0.6;
    const confidence = Math.abs(0.5 - alternationRate) * 100;

    return {
      isRandom,
      confidence: Math.round(confidence * 100) / 100,
      description: isRandom
        ? `Alternating pattern detected (${Math.round(alternationRate * 100)}% alternation)`
        : `Consistent pattern (${Math.round(alternationRate * 100)}% alternation)`,
    };
  } catch (error) {
    logger.error({ error, toolName }, 'Failed to detect random failures');
    return {
      isRandom: false,
      confidence: 0,
      description: 'Error detecting pattern',
    };
  }
}

/**
 * Mark tool as flaky in database
 */
export async function markToolAsFlaky(toolName: string): Promise<void> {
  try {
    await prisma.toolReliability.update({
      where: { toolName },
      data: {
        status: 'FLAKY',
      },
    });

    logger.info({ toolName }, 'Tool marked as flaky');
  } catch (error) {
    logger.error({ error, toolName }, 'Failed to mark tool as flaky');
  }
}
