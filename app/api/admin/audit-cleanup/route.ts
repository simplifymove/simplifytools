import { NextRequest, NextResponse } from 'next/server';
import { requireAdminApi } from '@/lib/auth/admin';
import { prisma } from '@/lib/prisma';
import { apiLogger as logger } from '@/lib/logging/logger';
import { deleteArtifactsForAuditRuns } from '@/lib/services/artifact';

export async function POST(req: NextRequest) {
  try {
    const { response } = await requireAdminApi();
    if (response) return response;

    const body = await req.json();
    const { daysOld } = body;

    if (!daysOld || daysOld < 1) {
      return NextResponse.json(
        { error: 'daysOld must be >= 1' },
        { status: 400 }
      );
    }

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    logger.info(
      { daysOld, cutoffDate },
      `Starting bulk cleanup of audits older than ${daysOld} days`
    );

    // Find audits to delete
    const auditsToDelete = await prisma.auditRun.findMany({
      where: {
        createdAt: { lt: cutoffDate },
      },
      select: { id: true },
    });

    logger.info(
      { count: auditsToDelete.length, daysOld },
      `Found ${auditsToDelete.length} audits to delete`
    );

    if (auditsToDelete.length === 0) {
      return NextResponse.json({
        message: 'No audits found older than specified days',
        deleted: {
          audits: 0,
          testResults: 0,
          artifacts: 0,
        },
      });
    }

    const auditIds = auditsToDelete.map(a => a.id);

    // Delete managed artifact files and their metadata records.
    logger.info({ count: auditIds.length }, 'Deleting managed audit artifacts');
    const artifactsDeleted = await deleteArtifactsForAuditRuns(auditIds);

    // Delete from database using transaction
    const deletionResult = await prisma.$transaction(
      async (tx) => {
        // Delete test results
        const testResultsDeleted = await tx.auditTestResult.deleteMany({
          where: { auditRunId: { in: auditIds } },
        });

        // Delete failure records
        const failuresDeleted = await tx.failureRecord.deleteMany({
          where: {
            auditRunId: { in: auditIds },
          },
        });

        // Delete Playwright artifacts
        await tx.playwrightArtifact.deleteMany({
          where: { auditRunId: { in: auditIds } },
        });

        // Delete audit jobs
        const jobsDeleted = await tx.auditJob.deleteMany({
          where: { auditRunId: { in: auditIds } },
        });

        // Delete audit runs
        const runsDeleted = await tx.auditRun.deleteMany({
          where: { id: { in: auditIds } },
        });

        return {
          audits: runsDeleted.count,
          testResults: testResultsDeleted.count,
          failures: failuresDeleted.count,
          artifacts: artifactsDeleted,
          jobs: jobsDeleted.count,
        };
      }
    );

    logger.info(
      { daysOld, deletionResult },
      `✅ Bulk cleanup completed - deleted ${deletionResult.audits} audits`
    );

    return NextResponse.json({
      message: `Deleted ${deletionResult.audits} audits older than ${daysOld} days`,
      deleted: deletionResult,
    });
  } catch (error) {
    logger.error(error, 'Bulk cleanup error');
    return NextResponse.json(
      { error: 'Failed to perform bulk cleanup' },
      { status: 500 }
    );
  }
}
