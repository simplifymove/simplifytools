// lib/services/failure-classifier.ts
// Automatically classify test failures

import { prisma } from '@/lib/prisma';
import logger from '@/lib/logging/logger';
import { FailureType } from '@prisma/client';

/**
 * Classify a failure based on error message and output
 */
export function classifyFailure(
  error: string | null | undefined,
  output: string | null | undefined
): FailureType {
  const combinedText = `${error || ''} ${output || ''}`.toLowerCase();

  // Timeout detection
  if (
    combinedText.includes('timeout') ||
    combinedText.includes('timed out') ||
    combinedText.includes('ETIMEDOUT') ||
    combinedText.includes('ERR_OPERATION_TIMEOUT')
  ) {
    return FailureType.TIMEOUT;
  }

  // Backend crash detection
  if (
    combinedText.includes('crash') ||
    combinedText.includes('500 internal server error') ||
    combinedText.includes('segmentation fault') ||
    combinedText.includes('exit code 1') ||
    combinedText.includes('SIGSEGV') ||
    combinedText.includes('panic')
  ) {
    return FailureType.BACKEND_CRASH;
  }

  // Network failure detection
  if (
    combinedText.includes('ECONNREFUSED') ||
    combinedText.includes('ENOTFOUND') ||
    combinedText.includes('ERR_NAME_NOT_RESOLVED') ||
    combinedText.includes('network') ||
    combinedText.includes('socket hang up') ||
    combinedText.includes('ECONNRESET')
  ) {
    return FailureType.NETWORK_FAILURE;
  }

  // Playwright selector detection
  if (
    combinedText.includes('selector not found') ||
    combinedText.includes('locator') ||
    combinedText.includes('unable to find element') ||
    combinedText.includes('failed to get element')
  ) {
    return FailureType.PLAYWRIGHT_SELECTOR;
  }

  // File generation failure
  if (
    combinedText.includes('file generation') ||
    combinedText.includes('convert') ||
    combinedText.includes('generate file') ||
    combinedText.includes('no such file') ||
    combinedText.includes('permission denied') ||
    combinedText.includes('write error')
  ) {
    return FailureType.FILE_GENERATION_FAILED;
  }

  // Security error detection
  if (
    combinedText.includes('403') ||
    combinedText.includes('unauthorized') ||
    combinedText.includes('forbidden') ||
    combinedText.includes('authentication') ||
    combinedText.includes('csrf') ||
    combinedText.includes('security')
  ) {
    return FailureType.SECURITY_ERROR;
  }

  // Validation error detection
  if (
    combinedText.includes('validation') ||
    combinedText.includes('invalid') ||
    combinedText.includes('bad request') ||
    combinedText.includes('schema')
  ) {
    return FailureType.VALIDATION_ERROR;
  }

  return FailureType.UNKNOWN;
}

/**
 * Record a failure in the database
 */
export async function recordFailure(
  auditRunId: string,
  toolName: string,
  category: string,
  failureType: FailureType,
  failureReason: string,
  testName?: string,
  stackTrace?: string,
  errorOutput?: string
): Promise<void> {
  try {
    // Check if similar failure exists
    const existingFailure = await prisma.failureRecord.findFirst({
      where: {
        toolName,
        failureType,
        failureReason,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (existingFailure) {
      // Update existing failure record
      await prisma.failureRecord.update({
        where: { id: existingFailure.id },
        data: {
          occurrenceCount: existingFailure.occurrenceCount + 1,
          lastSeenAt: new Date(),
          isFlaky: true,
        },
      });
    } else {
      // Create new failure record
      await prisma.failureRecord.create({
        data: {
          auditRunId,
          toolName,
          category,
          testName,
          failureType,
          failureReason,
          stackTrace,
          errorOutput,
          isFlaky: false,
          occurrenceCount: 1,
        },
      });
    }

    logger.info(
      { toolName, failureType, category },
      'Failure recorded'
    );
  } catch (error) {
    logger.error(
      { error, toolName, failureType },
      'Failed to record failure'
    );
  }
}

/**
 * Get failure statistics
 */
export async function getFailureStats(): Promise<{
  total: number;
  byType: Record<string, number>;
  flaky: number;
  recent: any[];
}> {
  try {
    const failures = await prisma.failureRecord.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    const byType: Record<string, number> = {};
    let flakyCount = 0;

    for (const failure of failures) {
      byType[failure.failureType] = (byType[failure.failureType] || 0) + 1;
      if (failure.isFlaky) flakyCount++;
    }

    return {
      total: failures.length,
      byType,
      flaky: flakyCount,
      recent: failures.slice(0, 10),
    };
  } catch (error) {
    logger.error({ error }, 'Failed to get failure stats');
    return {
      total: 0,
      byType: {},
      flaky: 0,
      recent: [],
    };
  }
}

/**
 * Get most common failures
 */
export async function getMostCommonFailures(limit: number = 10): Promise<any[]> {
  try {
    const failures = await prisma.failureRecord.findMany({
      orderBy: { occurrenceCount: 'desc' },
      take: limit,
    });

    return failures;
  } catch (error) {
    logger.error({ error }, 'Failed to get most common failures');
    return [];
  }
}

/**
 * Get failure trend for a tool
 */
export async function getToolFailureTrend(
  toolName: string,
  days: number = 7
): Promise<any[]> {
  try {
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const failures = await prisma.failureRecord.findMany({
      where: {
        toolName,
        createdAt: { gte: startDate },
      },
      orderBy: { createdAt: 'desc' },
    });

    return failures;
  } catch (error) {
    logger.error({ error, toolName }, 'Failed to get tool failure trend');
    return [];
  }
}
