// lib/services/artifact.ts
// Store and retrieve test artifacts (screenshots, videos, traces)

import { prisma } from '@/lib/prisma';
import logger from '@/lib/logging/logger';
import * as fs from 'fs/promises';
import * as path from 'path';

const ARTIFACTS_DIR = path.join(process.cwd(), 'public', 'artifacts');
const ARTIFACT_RETENTION_DAYS = 30;

/**
 * Initialize artifacts directory
 */
async function ensureArtifactsDirExists(): Promise<void> {
  try {
    await fs.mkdir(ARTIFACTS_DIR, { recursive: true });
  } catch (error) {
    logger.error({ error }, 'Failed to create artifacts directory');
  }
}

/**
 * Store artifact from file
 */
export async function storeArtifact(
  auditRunId: string,
  toolName: string,
  category: string,
  type: 'screenshot' | 'video' | 'trace' | 'log' | 'network',
  filePath: string,
  testName?: string
): Promise<string | null> {
  try {
    await ensureArtifactsDirExists();

    // Read file
    const fileData = await fs.readFile(filePath);
    const fileSize = fileData.length;

    // Generate destination path
    const timestamp = Date.now();
    const fileName = `${toolName}-${type}-${timestamp}${path.extname(filePath)}`;
    const destinationPath = path.join(ARTIFACTS_DIR, fileName);

    // Copy file
    await fs.writeFile(destinationPath, fileData);

    // Determine MIME type
    const mimeTypeMap: Record<string, string> = {
      screenshot: 'image/png',
      video: 'video/webm',
      trace: 'application/json',
      log: 'text/plain',
      network: 'application/json',
    };

    // Store metadata in database
    const artifact = await prisma.playwrightArtifact.create({
      data: {
        auditRunId,
        toolName,
        category,
        testName,
        type,
        filePath: destinationPath,
        fileSize,
        mimeType: mimeTypeMap[type] || 'application/octet-stream',
        downloadUrl: `/artifacts/${fileName}`,
      },
    });

    logger.info(
      { artifactId: artifact.id, toolName, type },
      'Artifact stored'
    );

    return artifact.id;
  } catch (error) {
    logger.error({ error, toolName, type }, 'Failed to store artifact');
    return null;
  }
}

/**
 * Get artifacts for a test run
 */
export async function getArtifacts(auditRunId: string): Promise<any[]> {
  try {
    const artifacts = await prisma.playwrightArtifact.findMany({
      where: { auditRunId },
      orderBy: { createdAt: 'desc' },
    });

    return artifacts;
  } catch (error) {
    logger.error({ error, auditRunId }, 'Failed to get artifacts');
    return [];
  }
}

/**
 * Get artifacts by tool
 */
export async function getToolArtifacts(
  auditRunId: string,
  toolName: string
): Promise<any[]> {
  try {
    const artifacts = await prisma.playwrightArtifact.findMany({
      where: {
        auditRunId,
        toolName,
      },
      orderBy: { createdAt: 'desc' },
    });

    return artifacts;
  } catch (error) {
    logger.error({ error, auditRunId, toolName }, 'Failed to get tool artifacts');
    return [];
  }
}

/**
 * Get artifacts by type
 */
export async function getArtifactsByType(
  auditRunId: string,
  type: string
): Promise<any[]> {
  try {
    const artifacts = await prisma.playwrightArtifact.findMany({
      where: {
        auditRunId,
        type,
      },
      orderBy: { createdAt: 'desc' },
    });

    return artifacts;
  } catch (error) {
    logger.error({ error, auditRunId, type }, 'Failed to get artifacts by type');
    return [];
  }
}

/**
 * Get artifact by ID
 */
export async function getArtifactById(id: string): Promise<any> {
  try {
    const artifact = await prisma.playwrightArtifact.findUnique({
      where: { id },
    });

    return artifact;
  } catch (error) {
    logger.error({ error, id }, 'Failed to get artifact by ID');
    return null;
  }
}

/**
 * Generate download URL
 */
export function generateDownloadUrl(artifactId: string): string {
  return `/api/admin/audit/artifacts/${artifactId}/download`;
}

/**
 * Download artifact file
 */
export async function downloadArtifact(
  artifactId: string
): Promise<Buffer | null> {
  try {
    const artifact = await getArtifactById(artifactId);

    if (!artifact) {
      return null;
    }

    const fileData = await fs.readFile(artifact.filePath);
    return fileData;
  } catch (error) {
    logger.error({ error, artifactId }, 'Failed to download artifact');
    return null;
  }
}

/**
 * Delete artifact
 */
export async function deleteArtifact(artifactId: string): Promise<boolean> {
  try {
    const artifact = await prisma.playwrightArtifact.findUnique({
      where: { id: artifactId },
    });

    if (!artifact) {
      return false;
    }

    // Delete file
    try {
      await fs.unlink(artifact.filePath);
    } catch (error) {
      logger.warn({ error }, 'Failed to delete artifact file');
    }

    // Delete database record
    await prisma.playwrightArtifact.delete({
      where: { id: artifactId },
    });

    logger.info({ artifactId }, 'Artifact deleted');
    return true;
  } catch (error) {
    logger.error({ error, artifactId }, 'Failed to delete artifact');
    return false;
  }
}

/**
 * Clean up old artifacts (run periodically)
 */
export async function cleanupOldArtifacts(
  retentionDays: number = ARTIFACT_RETENTION_DAYS
): Promise<number> {
  try {
    const cutoffDate = new Date(
      Date.now() - retentionDays * 24 * 60 * 60 * 1000
    );

    const oldArtifacts = await prisma.playwrightArtifact.findMany({
      where: {
        createdAt: { lte: cutoffDate },
      },
    });

    let deleted = 0;

    for (const artifact of oldArtifacts) {
      try {
        await fs.unlink(artifact.filePath);
      } catch (error) {
        logger.warn({ error }, 'Failed to delete artifact file');
      }

      await prisma.playwrightArtifact.delete({
        where: { id: artifact.id },
      });

      deleted++;
    }

    logger.info(
      { count: deleted, retentionDays },
      'Old artifacts cleaned up'
    );

    return deleted;
  } catch (error) {
    logger.error({ error }, 'Failed to cleanup old artifacts');
    return 0;
  }
}

/**
 * Get artifact statistics
 */
export async function getArtifactStats(): Promise<{
  total: number;
  byType: Record<string, number>;
  totalSize: number;
  oldestArtifact: Date | null;
  newestArtifact: Date | null;
}> {
  try {
    const artifacts = await prisma.playwrightArtifact.findMany();

    const byType: Record<string, number> = {};
    let totalSize = 0;

    for (const artifact of artifacts) {
      byType[artifact.type] = (byType[artifact.type] || 0) + 1;
      totalSize += artifact.fileSize;
    }

    const oldestArtifact = artifacts.length > 0
      ? artifacts.reduce((min, curr) =>
          curr.createdAt < min.createdAt ? curr : min
        ).createdAt
      : null;

    const newestArtifact = artifacts.length > 0
      ? artifacts.reduce((max, curr) =>
          curr.createdAt > max.createdAt ? curr : max
        ).createdAt
      : null;

    return {
      total: artifacts.length,
      byType,
      totalSize,
      oldestArtifact,
      newestArtifact,
    };
  } catch (error) {
    logger.error({ error }, 'Failed to get artifact stats');
    return {
      total: 0,
      byType: {},
      totalSize: 0,
      oldestArtifact: null,
      newestArtifact: null,
    };
  }
}
