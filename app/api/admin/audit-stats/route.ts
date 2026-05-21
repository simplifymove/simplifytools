import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/config';
import { prisma } from '@/lib/prisma';
import { apiLogger as logger } from '@/lib/logging/logger';
import { promises as fs } from 'fs';
import path from 'path';

/**
 * Recursively get total size of directory
 */
async function getDirectorySize(dirPath: string): Promise<number> {
  let size = 0;
  
  try {
    const files = await fs.readdir(dirPath, { withFileTypes: true });
    
    for (const file of files) {
      const fullPath = path.join(dirPath, file.name);
      if (file.isDirectory()) {
        size += await getDirectorySize(fullPath);
      } else {
        const stats = await fs.stat(fullPath);
        size += stats.size;
      }
    }
  } catch (err: any) {
    if (err.code !== 'ENOENT') {
      logger.warn({ error: err, dirPath }, 'Failed to calculate directory size');
    }
  }
  
  return size;
}

/**
 * Format bytes to human-readable size
 */
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email || session.user.email !== 'raghavaboyidi@gmail.com') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get audit counts
    const totalAudits = await prisma.auditRun.count();
    const runningAudits = await prisma.auditRun.count({
      where: { status: 'RUNNING' },
    });
    const completedAudits = await prisma.auditRun.count({
      where: { status: 'COMPLETED' },
    });
    const failedAudits = await prisma.auditRun.count({
      where: { status: { in: ['FAILED', 'CANCELLED'] } },
    });

    // Get test result counts
    const totalTestResults = await prisma.auditTestResult.count();

    // Calculate disk usage
    const artifactsBaseDir = path.join(process.cwd(), 'public', 'audit-artifacts');
    const diskUsageBytes = await getDirectorySize(artifactsBaseDir);

    // Get oldest and newest audits
    const oldestAudit = await prisma.auditRun.findFirst({
      orderBy: { createdAt: 'asc' },
      select: { id: true, createdAt: true },
    });

    const newestAudit = await prisma.auditRun.findFirst({
      orderBy: { createdAt: 'desc' },
      select: { id: true, createdAt: true },
    });

    // Estimate DB size (rough calculation: ~1KB per test result + metadata)
    const estimatedDbSizeBytes = totalTestResults * 1024 + totalAudits * 512;

    return NextResponse.json({
      audits: {
        total: totalAudits,
        running: runningAudits,
        completed: completedAudits,
        failed: failedAudits,
      },
      testResults: {
        total: totalTestResults,
      },
      storage: {
        diskUsageBytes,
        diskUsageFormatted: formatBytes(diskUsageBytes),
        estimatedDbSizeBytes,
        estimatedDbSizeFormatted: formatBytes(estimatedDbSizeBytes),
        totalFormatted: formatBytes(diskUsageBytes + estimatedDbSizeBytes),
      },
      timeline: {
        oldestAudit: oldestAudit?.createdAt || null,
        newestAudit: newestAudit?.createdAt || null,
      },
    });
  } catch (error) {
    logger.error(error, 'Get storage stats error');
    return NextResponse.json(
      { error: 'Failed to get storage stats' },
      { status: 500 }
    );
  }
}
