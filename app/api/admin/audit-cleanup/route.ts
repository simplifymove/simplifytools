import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth/admin';
import { prisma } from '@/lib/prisma';
import { apiLogger as logger } from '@/lib/logging/logger';
import { promises as fs } from 'fs';
import path from 'path';

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
    if (err.code !== 'ENOENT') {
      logger.warn({ error: err, dirPath }, 'Failed to delete directory');
    }
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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

    // Delete artifacts from filesystem
    logger.info({ count: auditIds.length }, 'Deleting artifact directories');
    const artifactsBaseDir = path.join(process.cwd(), 'public', 'audit-artifacts');
    
    for (const auditId of auditIds) {
      const auditDir = path.join(artifactsBaseDir, auditId);
      await deleteDirectory(auditDir);
    }

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
        const artifactsDeleted = await tx.playwrightArtifact.deleteMany({
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
          artifacts: artifactsDeleted.count,
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
