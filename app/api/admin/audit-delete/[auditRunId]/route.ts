import { NextRequest, NextResponse } from 'next/server';
import { requireAdminApi } from '@/lib/auth/admin';
import { prisma } from '@/lib/prisma';
import { apiLogger as logger } from '@/lib/logging/logger';
import { deleteArtifactsForAuditRuns } from '@/lib/services/artifact';

interface RouteParams {
  auditRunId: string;
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<RouteParams> }
) {
  try {
    const { response } = await requireAdminApi();
    if (response) return response;

    const { auditRunId } = await params;

    logger.info({ auditRunId }, 'Starting audit deletion');

    // Get the audit run to find artifact paths
    const auditRun = await prisma.auditRun.findUnique({
      where: { id: auditRunId },
    });

    if (!auditRun) {
      return NextResponse.json({ error: 'Audit not found' }, { status: 404 });
    }

    // Delete managed artifact files and their metadata records.
    const artifactsDeleted = await deleteArtifactsForAuditRuns([auditRunId]);

    // Use transaction to delete all related DB records
    logger.info({ auditRunId }, 'Starting database transaction for deletion');
    
    const deletionResult = await prisma.$transaction(
      async (tx) => {
        // 1. Delete test results
        const testResultsDeleted = await tx.auditTestResult.deleteMany({
          where: { auditRunId },
        });

        // 2. Delete failure records
        const failuresDeleted = await tx.failureRecord.deleteMany({
          where: {
            auditRunId,
          },
        });

        // 3. Delete Playwright artifacts
        await tx.playwrightArtifact.deleteMany({
          where: { auditRunId },
        });

        // 4. Delete audit jobs
        const jobsDeleted = await tx.auditJob.deleteMany({
          where: { auditRunId },
        });

        // 5. Delete audit run
        const runDeleted = await tx.auditRun.deleteMany({
          where: { id: auditRunId },
        });

        return {
          testResults: testResultsDeleted.count,
          failures: failuresDeleted.count,
          artifacts: artifactsDeleted,
          jobs: jobsDeleted.count,
          runs: runDeleted.count,
        };
      }
    );

    logger.info(
      { auditRunId, deletionResult },
      '✅ Audit deleted successfully'
    );

    return NextResponse.json({
      message: `Audit ${auditRunId} deleted successfully`,
      deleted: deletionResult,
    });
  } catch (error) {
    logger.error(error, 'Delete audit error');
    return NextResponse.json(
      { error: 'Failed to delete audit' },
      { status: 500 }
    );
  }
}
