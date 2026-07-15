// lib/queue/worker.ts
// BullMQ Worker - Processes audit test jobs with Phase 7 observability

import { Worker, Job } from 'bullmq';
import Redis from 'ioredis';
import { prisma } from '@/lib/prisma';
import { mapAuditFailureToFailureType, runTestCommand } from '@/lib/services/test-execution';
import { getAuditCategoryDefinition } from '@/app/lib/audit-category-tools';
import { createNotification } from '@/lib/services/notification';
import { getCategoryReliability } from '@/lib/services/reliability';
import { generateHealthReport } from '@/lib/services/health-score';
import { evaluateAllAlertingRules } from '@/lib/services/alerting';
import { generateDownloadUrl, storeArtifact } from '@/lib/services/artifact';
import { workerLogger } from '@/lib/logging/logger';
import { AuditJobData, AuditJobResult } from './client';

const auditDebugEnabled = process.env.AUDIT_DEBUG === 'true';
const auditDebugLog = (...args: unknown[]) => {
  if (auditDebugEnabled) {
    console.log(...args);
  }
};
const auditDebugError = (...args: unknown[]) => {
  if (auditDebugEnabled) {
    console.error(...args);
  }
};

// Worker processor function
async function processAuditJob(job: Job<AuditJobData>): Promise<AuditJobResult> {
  const { auditJobId, userId, categories, auditRunId, workerCount } = job.data;
  
  auditDebugLog('[WORKER] ▶ Processing audit job:', {
    jobId: job.id,
    auditRunId,
    auditJobId,
    userId,
    categories,
  });

  // Declare variables outside try block so they're accessible in catch
  let totalTests = 0;
  let passedTests = 0;
  let failedTests = 0;
  let errorTests = 0;
  let skippedTests = 0;
  const allLogs: any[] = [];
  const allTestResults: any[] = [];
  const totalToolsForRun = categories.reduce((total, category) => {
    return total + (getAuditCategoryDefinition(category)?.tools.length || 0);
  }, 0);

  try {
    auditDebugLog('[WORKER] Updating AuditRun status to RUNNING...');
    workerLogger.info({ jobId: job.id }, `Starting job for categories: ${job.data.categories.join(', ')}`);

    // Update AuditRun status to RUNNING
    await prisma.auditRun.update({
      where: { id: auditRunId },
      data: {
        status: 'RUNNING',
        startedAt: new Date(),
        totalTests: totalToolsForRun,
        passedTests: 0,
        failedTests: 0,
        errorTests: 0,
        skippedTests: 0,
        successPercentage: 0,
        errorMessage: JSON.stringify({
          type: 'audit-progress',
          currentTool: '',
          currentToolSlug: '',
          currentToolTitle: '',
          currentUrl: '',
          currentCategory: categories[0] || '',
          completedTools: 0,
          totalTools: totalToolsForRun,
          passedTools: 0,
          failedTools: 0,
          skippedTools: 0,
          errorTools: 0,
          elapsedMs: 0,
          elapsedTime: 0,
          estimatedRemainingMs: null,
          estimatedRemainingTime: null,
          workerCount: workerCount || '1',
        }).substring(0, 2000),
      },
    });
    auditDebugLog('[WORKER] ✅ AuditRun status updated to RUNNING');

    // Update job status to PROCESSING
    auditDebugLog('[WORKER] Updating AuditJob status to PROCESSING...');
    await prisma.auditJob.update({
      where: { id: auditJobId },
      data: { status: 'PROCESSING', startedAt: new Date() },
    });
    auditDebugLog('[WORKER] ✅ AuditJob status updated to PROCESSING');

    // Run tests for selected categories
    auditDebugLog('[WORKER] Starting category loop with', categories.length, 'categories');

    for (const category of categories) {
      auditDebugLog('[WORKER] Processing category:', category);
      
      // Update progress
      await job.updateProgress((categories.indexOf(category) / categories.length) * 100);

      workerLogger.info({ category }, 'Processing category');

      try {
        // Pass auditRunId so worker can track process PID and check cancellation
        auditDebugLog('[WORKER] Running test command for:', category);
        const completedToolsOffset = categories
          .slice(0, categories.indexOf(category))
          .reduce((total, previousCategory) => {
            return total + (getAuditCategoryDefinition(previousCategory)?.tools.length || 0);
          }, 0);

        const result = await runTestCommand(category, auditRunId, workerCount || '1', {
          completedToolsOffset,
          totalTools: totalToolsForRun,
          passedToolsOffset: passedTests,
          failedToolsOffset: failedTests,
          skippedToolsOffset: skippedTests,
          errorToolsOffset: errorTests,
        });
        auditDebugLog('[WORKER] Test command completed with result:', {
          totalTests: result.totalTests,
          passedTests: result.passedTests,
          failedTests: result.failedTests,
          errorTests: result.errorTests,
          error: result.error,
        });
        
        // Check if cancelled (result will indicate cancellation)
        if (result.error === 'Audit cancelled by admin') {
          auditDebugLog('[WORKER] ⛔ Audit cancelled by admin, stopping');
          workerLogger.warn({ category, auditRunId }, '⛔ Audit cancelled - stopping all processing');
          break; // Stop processing further categories
        }

        totalTests += result.totalTests;
        passedTests += result.passedTests;
        failedTests += result.failedTests;
        errorTests += result.errorTests;
        skippedTests += result.skippedTests;
        allLogs.push(...(result.logs || []));
        allTestResults.push(...(result.results || []));

        auditDebugLog('[WORKER] Aggregated totals:', {
          totalTests,
          passedTests,
          failedTests,
          errorTests,
          skippedTests,
        });

        workerLogger.info(
          { category, totalTests: result.totalTests, passedTests: result.passedTests, failedTests: result.failedTests },
          `[Parsed] Category batch: ${result.totalTests} total tests, ${result.passedTests} passed, ${result.failedTests} failed`
        );

        if ((!result.results || result.results.length === 0) && result.error) {
          const failureMessage = result.error.substring(0, 1000);

          try {
            await prisma.auditTestResult.create({
              data: {
                auditRunId,
                category,
                toolName: category,
                toolSlug: category,
                url: `http://localhost:3000/${category}`,
                testCase: 'Audit command execution',
                status: 'ERROR' as any,
                errorMessage: failureMessage,
                outputGenerated: false,
                logs: JSON.stringify({
                  command: result.command || result.logs?.[0]?.command || '',
                  stdout: result.stdout?.substring(0, 2000) || '',
                  stderr: result.stderr?.substring(0, 2000) || '',
                }),
                durationMs: 0,
                timestamp: new Date(),
              },
            });

            await prisma.failureRecord.create({
              data: {
                auditJobId,
                auditRunId,
                toolName: category,
                category,
                testName: 'Audit command execution',
                failureType: 'UNKNOWN',
                failureReason: failureMessage,
                errorOutput: result.stderr?.substring(0, 2000) || result.stdout?.substring(0, 2000) || '',
                isFlaky: false,
                firstSeenAt: new Date(),
              },
            });
          } catch (failurePersistError) {
            workerLogger.warn(
              { error: failurePersistError, category },
              'Failed to persist audit command failure details'
            );
          }
        }

        // Process each test result and persist to database
        auditDebugLog('[WORKER] Persisting', result.results?.length || 0, 'test results to database');
        let batchTestCount = 0;
        for (const testResult of result.results || []) {
          const testStatus = testResult.passed ? 'PASS' : (testResult.skipped ? 'SKIPPED' : 'FAIL');
          const durationMs = testResult.duration ? Math.round(testResult.duration * 1000) : 0;

          try {
            const storeFailureArtifact = async (type: 'screenshot' | 'video' | 'trace' | 'log' | 'network' | 'output', filePath?: string) => {
              if (testResult.passed || !filePath) return undefined;
              const artifactId = await storeArtifact(auditRunId, testResult.toolName || category, category, type, filePath, testResult.testName);
              return artifactId ? generateDownloadUrl(artifactId) : undefined;
            };
            const screenshotUrl = await storeFailureArtifact('screenshot', testResult.screenshotPath);
            await storeFailureArtifact('trace', testResult.tracePath);
            await storeFailureArtifact('video', testResult.videoPath);
            await storeFailureArtifact('log', testResult.consoleLogPath);
            await storeFailureArtifact('network', testResult.networkLogPath);
            await storeFailureArtifact('output', testResult.failedOutputPath);

            // Create AuditTestResult for each test
            await prisma.auditTestResult.create({
              data: {
                auditRunId,
                category,
                toolName: testResult.toolName || category,
                toolSlug: testResult.toolSlug || (testResult.toolName || category).toLowerCase().replace(/\s+/g, '-'),
                url: testResult.url || `http://localhost:3000/${category}`,
                testCase: testResult.testName || testResult.testCase || 'Smoke test',
                status: testStatus as any,
                errorMessage: testResult.error?.message || (testResult.passed ? undefined : 'Test failed'),
                outputGenerated: testResult.outputGenerated || false,
                outputType: testResult.outputType,
                outputPath: testResult.outputPath,
                screenshotPath: screenshotUrl,
                logs: JSON.stringify({
                  stdout: testResult.output || '',
                  stderr: testResult.error?.message || '',
                  duration: durationMs,
                  failureClass: testResult.failureClass,
                  consoleErrors: testResult.consoleErrors || [],
                  functionalEvidence: testResult.functionalEvidence,
                  auditOutcome: testResult.auditOutcome,
                  failureStage: testResult.failureStage,
                  pageHealth: testResult.pageHealth,
                  functionalProcessing: testResult.functionalProcessing,
                  outputValidation: testResult.outputValidation,
                  cleanup: testResult.cleanup,
                }),
                durationMs,
                timestamp: new Date(),
              },
            });

            batchTestCount++;

            workerLogger.debug(
              { toolName: testResult.toolName, status: testStatus, batchProgress: batchTestCount },
              'Test result persisted'
            );

            // Record failures
            if (!testResult.passed && testStatus !== 'SKIPPED') {
              try {
                await prisma.failureRecord.create({
                  data: {
                    auditJobId,
                    auditRunId,
                    toolName: testResult.toolName || category,
                    category,
                    testName: testResult.testName || testResult.testCase,
                    failureType: mapAuditFailureToFailureType(testResult.failureClass) as any,
                    failureReason: testResult.error?.message || 'Test failed',
                    stackTrace: testResult.error?.stack,
                    errorOutput: testResult.output || '',
                    isFlaky: false,
                    firstSeenAt: new Date(),
                  },
                });

                workerLogger.debug(
                  { toolName: testResult.toolName },
                  'Failure record created'
                );
              } catch (failureRecordError) {
                workerLogger.warn(
                  { error: failureRecordError, toolName: testResult.toolName },
                  'Failed to create failure record'
                );
              }
            }

          } catch (testPersistError) {
            auditDebugError('[WORKER] ❌ Error persisting test:', testPersistError);
            workerLogger.error(
              { error: testPersistError, toolName: testResult.toolName },
              'Failed to persist test result'
            );
          }
        }

        auditDebugLog('[WORKER] ✅ Persisted', batchTestCount, 'test results');

        // Update tool reliability scores
        try {
          await getCategoryReliability(category);
          workerLogger.debug({ category }, 'Reliability score updated');
        } catch (reliabilityError) {
          workerLogger.warn(
            { error: reliabilityError, category },
            'Failed to update reliability'
          );
        }

        // Determine severity based on results
        if (result.failedTests > 0 || result.errorTests > 0) {
          const failureRate = ((result.failedTests + result.errorTests) / Math.max(result.totalTests, 1)) * 100;
          if (failureRate >= 50) {
            await prisma.auditJob.update({
              where: { id: auditJobId },
              data: { severity: 'CRITICAL' },
            });
          } else if (failureRate >= 25) {
            await prisma.auditJob.update({
              where: { id: auditJobId },
              data: { severity: 'HIGH' },
            });
          }
        }

        // ✅ LIVE PROGRESS UPDATE: Update AuditRun with current counts after each category
        const currentSuccessPercentage = totalTests > 0 
          ? parseFloat(((passedTests / totalTests) * 100).toFixed(2))
          : 0;

        await prisma.auditRun.update({
          where: { id: auditRunId },
          data: {
            totalTests,
            passedTests,
            failedTests,
            errorTests,
            skippedTests,
            successPercentage: currentSuccessPercentage,
            updatedAt: new Date(), // Touch updatedAt to show progress
          },
        });

        workerLogger.info(
          {
            category,
            totalTests,
            passedTests,
            failedTests,
            errorTests,
            successPercentage: currentSuccessPercentage,
          },
          `[DB Update] Category ${category} persisted - Total: ${totalTests}, Passed: ${passedTests}, Failed: ${failedTests}`
        );
      } catch (error) {
        workerLogger.error({ error, category }, 'Error processing category');
        errorTests += 1;
        
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        allLogs.push({
          category,
          error: errorMsg,
          timestamp: new Date(),
        });
      }
    }

    const successPercentage = totalTests > 0 
      ? parseFloat(((passedTests / totalTests) * 100).toFixed(2))
      : 0;

    // Validate that test results were actually produced
    if (totalTests === 0) {
      const categoryReasons = allLogs
        .map((log) => {
          const command = log.command ? ` (${log.command})` : '';
          return `${log.category}${command}: ${log.error || log.stderr || 'No test output was parsed'}`;
        })
        .filter(Boolean)
        .join('\n');
      const commandError = `Audit command failed before completing tool checks. ${categoryReasons || 'Check test command or report parser.'}`;
      const errorMsg = commandError.substring(0, 2000);
      
      workerLogger.error({ categories, errorMsg }, 'Job failed: No test results produced');

      // Update AuditRun as FAILED
      await prisma.auditRun.update({
        where: { id: auditRunId },
        data: {
          status: 'FAILED',
          totalTests,
          passedTests,
          failedTests,
          errorTests,
          skippedTests,
          successPercentage: 0,
          errorMessage: JSON.stringify({
            type: 'audit-command-error',
            message: errorMsg,
            expectedTools: totalToolsForRun,
            completedTools: totalTests,
            passedTools: passedTests,
            failedTools: failedTests,
            skippedTools: skippedTests,
            errorTools: errorTests,
          }).substring(0, 2000),
          completedAt: new Date(),
        },
      });

      // Update AuditJob as FAILED
      await prisma.auditJob.update({
        where: { id: auditJobId },
        data: {
          status: 'FAILED',
          lastError: errorMsg,
          completedAt: new Date(),
          durationMs: Date.now() - new Date(job.timestamp).getTime(),
        },
      });

      try {
        await createNotification(auditJobId, userId, {
          type: 'email',
          success: false,
          commandError: errorMsg,
          results: {
            total: totalTests,
            passed: passedTests,
            failed: failedTests,
            errors: errorTests,
            success: 0,
            expectedTools: totalToolsForRun,
            completedTools: totalTests,
          },
        });
      } catch (notificationError) {
        workerLogger.warn({ error: notificationError }, 'Command failure notification failed');
      }

      throw new Error(errorMsg);
    }

    // Update existing AuditRun with final statistics
    auditDebugLog('[WORKER] Updating AuditRun with final statistics:', {
      totalTests,
      passedTests,
      failedTests,
      errorTests,
      skippedTests,
    });
    
    const auditRun = await prisma.auditRun.update({
      where: { id: auditRunId },
      data: {
        status: 'COMPLETED',
        totalTests,
        passedTests,
        failedTests,
        errorTests,
        skippedTests,
        successPercentage,
        completedAt: new Date(),
        errorMessage: null,
      },
    });
    auditDebugLog('[WORKER] ✅ AuditRun updated:', auditRun.id);

    // Generate health report
    try {
      const healthReport = await generateHealthReport();
      auditDebugLog('[WORKER] Health report generated:', healthReport?.overallScore);
      workerLogger.info(
        { score: healthReport?.overallScore },
        'Health report generated'
      );
    } catch (healthError) {
      workerLogger.warn({ error: healthError }, 'Failed to generate health report');
    }

    // Evaluate alerting rules
    try {
      await evaluateAllAlertingRules();
      workerLogger.debug('Alert rules evaluated');
    } catch (alertError) {
      workerLogger.warn({ error: alertError }, 'Failed to evaluate alerts');
    }

    // Link job to audit run (if not already linked)
    auditDebugLog('[WORKER] Updating AuditJob status to COMPLETED');
    await prisma.auditJob.update({
      where: { id: auditJobId },
      data: {
        status: 'COMPLETED',
        auditRunId,
        completedAt: new Date(),
        durationMs: Date.now() - new Date(job.timestamp).getTime(),
      },
    });
    auditDebugLog('[WORKER] ✅ AuditJob status updated to COMPLETED');

    // Send notification
    try {
      await createNotification(auditJobId, userId, {
        type: 'email',
        success: failedTests === 0 && errorTests === 0,
        results: {
          total: totalTests,
          passed: passedTests,
          failed: failedTests,
          errors: errorTests,
          success: successPercentage,
          expectedTools: totalToolsForRun,
          completedTools: totalTests,
        },
      });
    } catch (notificationError) {
      workerLogger.warn({ error: notificationError }, 'Notification failed');
      // Don't fail the job if notification fails
    }

    auditDebugLog('[WORKER] ✅ Job completed successfully');
    workerLogger.info(
      { jobId: job.id, passed: passedTests, total: totalTests },
      'Job completed'
    );

    return {
      auditRunId: auditRun.id,
      success: true,
    };
  } catch (error) {
    auditDebugError('[WORKER] ❌ Job failed with error:', error);
    
    const { auditJobId, auditRunId } = job.data;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // Prepare error log summary
    const errorLogSummary = allLogs.slice(-5).map((log: any) => 
      `${log.category}: ${log.error || 'Unknown error'}`
    ).join('\n');
    
    const fullErrorMessage = `${errorMessage}\n\nRecent logs:\n${errorLogSummary}`;

    auditDebugError('[WORKER] Updating AuditRun and AuditJob with error status');
    workerLogger.error({ error, jobId: job.id, auditRunId }, 'Job failed');

    // Update AuditRun with error status
    try {
      await prisma.auditRun.update({
        where: { id: auditRunId },
        data: {
          status: 'FAILED',
          errorMessage: fullErrorMessage.substring(0, 2000),
          completedAt: new Date(),
        },
      });
      auditDebugLog('[WORKER] ✅ AuditRun updated with FAILED status');
    } catch (updateError) {
      auditDebugError('[WORKER] Failed to update AuditRun:', updateError);
      workerLogger.warn({ error: updateError }, 'Failed to update AuditRun with error status');
    }

    // Update job with error status
    await prisma.auditJob.update({
      where: { id: auditJobId },
      data: {
        status: 'FAILED',
        lastError: fullErrorMessage.substring(0, 1000),
        completedAt: new Date(),
        durationMs: Date.now() - new Date(job.timestamp).getTime(),
      },
    });
    auditDebugLog('[WORKER] ✅ AuditJob updated with FAILED status');

    throw error;
  }
}

// Create and start the worker
// Recovery function: Mark stale RUNNING jobs as FAILED on startup
async function recoverStaleJobs() {
  try {
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);

    // Find all RUNNING AuditRuns that haven't been updated in 30 minutes
    const staleRuns = await prisma.auditRun.findMany({
      where: {
        status: 'RUNNING',
        updatedAt: { lt: thirtyMinutesAgo },
      },
    });

    if (staleRuns.length > 0) {
      // Mark them as FAILED
      await prisma.auditRun.updateMany({
        where: {
          status: 'RUNNING',
          updatedAt: { lt: thirtyMinutesAgo },
        },
        data: {
          status: 'FAILED',
          errorMessage: 'Server restarted or worker stopped before completion',
          completedAt: new Date(),
        },
      });

      workerLogger.info(
        { count: staleRuns.length },
        'Recovered stale RUNNING audit runs'
      );
    }

    // Also find stale PROCESSING AuditJobs
    const staleJobs = await prisma.auditJob.findMany({
      where: {
        status: 'PROCESSING',
        updatedAt: { lt: thirtyMinutesAgo },
      },
    });

    if (staleJobs.length > 0) {
      await prisma.auditJob.updateMany({
        where: {
          status: 'PROCESSING',
          updatedAt: { lt: thirtyMinutesAgo },
        },
        data: {
          status: 'FAILED',
          lastError: 'Server restarted or worker stopped before completion',
          completedAt: new Date(),
        },
      });

      workerLogger.info(
        { count: staleJobs.length },
        'Recovered stale PROCESSING audit jobs'
      );
    }
  } catch (error) {
    workerLogger.error({ error }, 'Failed to recover stale jobs');
  }
}

export function createWorker(concurrency: number = 2) {
  auditDebugLog('[WORKER] Creating worker with concurrency:', concurrency);
  
  const redis = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    maxRetriesPerRequest: null,
  });

  auditDebugLog('[WORKER] Redis client created for worker');

  const worker = new Worker('audit-tests', processAuditJob, {
    connection: redis,
    concurrency,
  });

  auditDebugLog('[WORKER] BullMQ Worker created for queue "audit-tests"');

  // Run recovery on worker startup
  auditDebugLog('[WORKER] Running recovery for stale jobs...');
  recoverStaleJobs();

  worker.on('completed', (job: Job<AuditJobData>) => {
    auditDebugLog(`[WORKER] ✅ Job ${job.id} completed successfully`);
    workerLogger.info({ jobId: job.id }, 'Job completed');
  });

  worker.on('failed', (job: Job<AuditJobData> | undefined, error: Error) => {
    auditDebugError(`[WORKER] ❌ Job ${job?.id} failed:`, error.message);
    workerLogger.error({ jobId: job?.id, error: error.message }, 'Job failed');
  });

  worker.on('error', (error: Error) => {
    auditDebugError('[WORKER] ❌ Worker error:', error);
    workerLogger.error({ error }, 'Worker error');
  });

  worker.on('active', (job: Job<AuditJobData>) => {
    auditDebugLog(`[WORKER] 🔄 Job ${job.id} is now processing`);
  });

  auditDebugLog(`[WORKER] ✅ Worker started with concurrency: ${concurrency}`);

  return worker;
}

const workerClient = { createWorker, processAuditJob };

export default workerClient;

