import { constants as fsConstants } from 'fs';
import { access, mkdir, realpath, stat, unlink } from 'fs/promises';
import os from 'os';
import path from 'path';
import { ToolDownloadResultStatus } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import logger from '@/lib/logging/logger';

const DEFAULT_EXPIRY_MINUTES = 30;

const DEFAULT_DOWNLOAD_DIRECTORIES = [
  path.join(process.cwd(), 'tmp', 'download-results'),
  path.join(os.tmpdir(), 'simplifyconvert-download-results'),
];

export interface CreateDownloadResultInput {
  toolSlug: string;
  originalName?: string;
  outputName: string;
  outputPath: string;
  mimeType: string;
  fileSize?: number | bigint;
  expiresInMinutes?: number;
}

export interface PublicDownloadResult {
  id: string;
  downloadPageUrl: string;
  outputName: string;
  mimeType: string;
  fileSize: string | null;
  expiresAt: Date;
}

export interface DownloadCleanupSummary {
  examined: number;
  deleted: number;
  missing: number;
  failed: number;
}

export function getAllowedDownloadDirectories(): string[] {
  const configuredDirectories = process.env.DOWNLOAD_RESULT_ALLOWED_DIRS
    ?.split(path.delimiter)
    .map((directory) => directory.trim())
    .filter(Boolean);

  return (configuredDirectories?.length ? configuredDirectories : DEFAULT_DOWNLOAD_DIRECTORIES)
    .map((directory) => path.resolve(directory));
}

function isPathWithinDirectory(filePath: string, directoryPath: string): boolean {
  const relativePath = path.relative(directoryPath, filePath);
  return relativePath !== '' && !relativePath.startsWith(`..${path.sep}`) && relativePath !== '..' && !path.isAbsolute(relativePath);
}

async function getRealAllowedDirectories(): Promise<string[]> {
  const directories = getAllowedDownloadDirectories();
  await Promise.all(directories.map((directory) => mkdir(directory, { recursive: true })));
  return Promise.all(directories.map((directory) => realpath(directory)));
}

export async function resolveAllowedDownloadPath(outputPath: string): Promise<string> {
  if (!outputPath || typeof outputPath !== 'string') {
    throw new Error('A valid output path is required');
  }

  const resolvedPath = path.resolve(outputPath);
  const [canonicalPath, allowedDirectories] = await Promise.all([
    realpath(resolvedPath),
    getRealAllowedDirectories(),
  ]);

  if (!allowedDirectories.some((directory) => isPathWithinDirectory(canonicalPath, directory))) {
    throw new Error('Output path is outside the approved download directories');
  }

  const fileStats = await stat(canonicalPath);
  if (!fileStats.isFile()) {
    throw new Error('Output path must point to a file');
  }

  await access(canonicalPath, fsConstants.R_OK);
  return canonicalPath;
}

function safeStoredName(value: string, fieldName: string): string {
  const name = path.basename(value).trim().slice(0, 255);
  if (!name || name === '.' || name === '..') {
    throw new Error(`${fieldName} is required`);
  }
  return name;
}

export async function createDownloadResult(
  input: CreateDownloadResultInput,
): Promise<PublicDownloadResult> {
  const expiresInMinutes = input.expiresInMinutes ?? DEFAULT_EXPIRY_MINUTES;
  if (!Number.isFinite(expiresInMinutes) || expiresInMinutes <= 0) {
    throw new Error('Expiry must be a positive number of minutes');
  }
  if (!input.toolSlug.trim()) {
    throw new Error('Tool slug is required');
  }
  if (!input.mimeType.trim() || /[\r\n]/.test(input.mimeType)) {
    throw new Error('A valid MIME type is required');
  }

  const canonicalPath = await resolveAllowedDownloadPath(input.outputPath);
  const fileStats = await stat(canonicalPath);
  const result = await prisma.toolDownloadResult.create({
    data: {
      toolSlug: input.toolSlug.trim(),
      originalName: input.originalName ? safeStoredName(input.originalName, 'Original name') : null,
      outputName: safeStoredName(input.outputName, 'Output name'),
      outputPath: canonicalPath,
      mimeType: input.mimeType.trim(),
      fileSize: BigInt(fileStats.size),
      expiresAt: new Date(Date.now() + expiresInMinutes * 60_000),
    },
  });

  return {
    id: result.id,
    downloadPageUrl: `/download/${result.id}`,
    outputName: result.outputName,
    mimeType: result.mimeType,
    fileSize: result.fileSize?.toString() ?? null,
    expiresAt: result.expiresAt,
  };
}

export async function cleanupExpiredDownloadResults(): Promise<DownloadCleanupSummary> {
  const expiredResults = await prisma.toolDownloadResult.findMany({
    where: {
      expiresAt: { lte: new Date() },
      status: { in: [ToolDownloadResultStatus.READY, ToolDownloadResultStatus.EXPIRED] },
    },
    select: { id: true, outputPath: true },
  });
  const summary: DownloadCleanupSummary = {
    examined: expiredResults.length,
    deleted: 0,
    missing: 0,
    failed: 0,
  };

  for (const result of expiredResults) {
    try {
      let canonicalPath: string;
      try {
        canonicalPath = await resolveAllowedDownloadPath(result.outputPath);
      } catch (error) {
        const errorCode = (error as NodeJS.ErrnoException).code;
        if (errorCode === 'ENOENT') {
          summary.missing += 1;
          await prisma.toolDownloadResult.update({
            where: { id: result.id },
            data: { status: ToolDownloadResultStatus.DELETED },
          });
          continue;
        }
        throw error;
      }

      await unlink(canonicalPath);
      await prisma.toolDownloadResult.update({
        where: { id: result.id },
        data: { status: ToolDownloadResultStatus.DELETED },
      });
      summary.deleted += 1;
    } catch (error) {
      summary.failed += 1;
      await prisma.toolDownloadResult.update({
        where: { id: result.id },
        data: { status: ToolDownloadResultStatus.EXPIRED },
      }).catch((updateError) => {
        logger.error({ error: updateError, resultId: result.id }, 'Failed to mark download result expired');
      });
      logger.warn({ error, resultId: result.id }, 'Failed to clean up expired download result');
    }
  }

  logger.info(summary, 'Expired download results cleanup complete');
  return summary;
}
