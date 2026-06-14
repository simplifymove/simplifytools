import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth/admin';
import { prisma } from '@/lib/prisma';
import { apiLogger as logger } from '@/lib/logging/logger';
import { promises as fs } from 'fs';
import path from 'path';

interface RouteParams {
  auditRunId: string;
}

/**
 * Recursively delete directory and all contents
 */
async function deleteDirectory(dirPath: string): Promise<void> {
  try {
    const files = await fs.readdir(dirPath, { withFileTypes: true });
    
    for (const file of files) {
      const fullPath = path.join(dirPath, file.name);
      if (file.isDirectory()) {
        await deleteDirectory(fullPath);
      } else {
        await fs.unlink(fullPath);
      }
    }
    
    await fs.rmdir(dirPath);
  } catch (err: any) {
    // Directory might not exist, which is fine
    if (err.code !== 'ENOENT') {
      logger.warn({ error: err, dirPath }, 'Failed to delete directory');
    }
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<RouteParams> }
) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { auditRunId } = await params;

    logger.info({ auditRunId }, 'Starting audit deletion');

    // Get the audit run to find artifact paths
    const auditRun = await prisma.auditRun.findUnique({
      where: { id: auditRunId },
    });

    if (!auditRun) {
      return NextResponse.json({ error: 'Audit not found' }, { status: 404 });
    }

    // Delete artifacts from filesystem
    const artifactsDir = path.join(process.cwd(), 'public', 'audit-artifacts', auditRunId);
    logger.info({ auditRunId, artifactsDir }, 'Deleting artifact directory');
    await deleteDirectory(artifactsDir);

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
        const artifactsDeleted = await tx.playwrightArtifact.deleteMany({
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
          artifacts: artifactsDeleted.count,
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
