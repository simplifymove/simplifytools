import { createReadStream } from 'fs';
import { stat } from 'fs/promises';
import { Readable } from 'stream';
import { ToolDownloadResultStatus } from '@prisma/client';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import logger from '@/lib/logging/logger';
import { resolveAllowedDownloadPath } from '@/lib/services/download-result';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface DownloadRouteContext {
  params: Promise<{ resultId: string }>;
}

function unavailable(message: string, status: 404 | 410): NextResponse {
  return NextResponse.json(
    { error: message },
    {
      status,
      headers: {
        'Cache-Control': 'private, no-store',
        'X-Content-Type-Options': 'nosniff',
      },
    },
  );
}

function sanitizeDownloadFilename(filename: string): string {
  const sanitized = filename
    .replace(/[\r\n"\\/]/g, '_')
    .replace(/[\u0000-\u001f\u007f]/g, '')
    .replace(/[^\x20-\x7e]/g, '_')
    .trim()
    .slice(0, 180);
  return sanitized || 'download';
}

function safeMimeType(mimeType: string): string {
  return /^[\w.+-]+\/[\w.+-]+$/.test(mimeType)
    ? mimeType
    : 'application/octet-stream';
}

export async function GET(_request: Request, context: DownloadRouteContext): Promise<Response> {
  const { resultId } = await context.params;
  const result = await prisma.toolDownloadResult.findUnique({
    where: { id: resultId },
  });

  if (!result) {
    return unavailable('Download result not found', 404);
  }

  if (result.expiresAt.getTime() <= Date.now()) {
    if (result.status === ToolDownloadResultStatus.READY) {
      await prisma.toolDownloadResult.update({
        where: { id: result.id },
        data: { status: ToolDownloadResultStatus.EXPIRED },
      });
    }
    return unavailable('Download result has expired', 410);
  }

  if (result.status !== ToolDownloadResultStatus.READY) {
    return unavailable('Download result is no longer available', 410);
  }

  let canonicalPath: string;
  try {
    canonicalPath = await resolveAllowedDownloadPath(result.outputPath);
  } catch (error) {
    const missing = (error as NodeJS.ErrnoException).code === 'ENOENT';
    await prisma.toolDownloadResult.update({
      where: { id: result.id },
      data: {
        status: missing
          ? ToolDownloadResultStatus.DELETED
          : ToolDownloadResultStatus.FAILED,
      },
    });
    logger.warn({ error, resultId: result.id }, 'Download result file validation failed');
    return unavailable('Download file is no longer available', 410);
  }

  const fileStats = await stat(canonicalPath);
  const now = new Date();
  await prisma.$transaction([
    prisma.toolDownloadResult.updateMany({
      where: { id: result.id, downloadedAt: null },
      data: { downloadedAt: now },
    }),
    prisma.toolDownloadResult.update({
      where: { id: result.id },
      data: { downloadCount: { increment: 1 } },
    }),
  ]);

  const filename = sanitizeDownloadFilename(result.outputName);
  const nodeStream = createReadStream(canonicalPath);
  const webStream = Readable.toWeb(nodeStream) as ReadableStream<Uint8Array>;

  return new Response(webStream, {
    status: 200,
    headers: {
      'Content-Type': safeMimeType(result.mimeType),
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': fileStats.size.toString(),
      'Cache-Control': 'private, no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
