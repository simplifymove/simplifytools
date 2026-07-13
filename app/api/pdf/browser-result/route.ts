import { mkdir, writeFile, unlink } from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { getPdfToolById } from '@/app/lib/pdf-tools';
import { getAllowedDownloadDirectories } from '@/lib/services/download-result';
import {
  BROWSER_PDF_RESULT_TOOLS,
  mimeTypeForExtension,
  retainPdfDownloadResult,
  sanitizePublicFilename,
} from '@/lib/services/pdf-download-result';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_BROWSER_RESULT_BYTES = 100 * 1024 * 1024;

function json(body: unknown, status = 200): NextResponse {
  return NextResponse.json(body, {
    status,
    headers: {
      'Cache-Control': 'private, no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}

function isSameOrigin(request: NextRequest): boolean {
  const origin = request.headers.get('origin');
  const fetchSite = request.headers.get('sec-fetch-site');
  if (fetchSite && fetchSite !== 'same-origin') return false;
  if (!origin) return process.env.NODE_ENV !== 'production';
  try {
    return new URL(origin).origin === request.nextUrl.origin;
  } catch {
    return false;
  }
}

function hasValidSignature(buffer: Buffer, extension: string): boolean {
  if (extension === '.pdf') return buffer.subarray(0, 5).toString('ascii') === '%PDF-';
  if (extension === '.zip') {
    const signature = buffer.subarray(0, 4).toString('hex');
    return ['504b0304', '504b0506', '504b0708'].includes(signature);
  }
  return false;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  let stagedPath = '';
  try {
    if (!isSameOrigin(request)) return json({ success: false, error: 'Cross-origin result uploads are not allowed' }, 403);
    const formData = await request.formData();
    const file = formData.get('file');
    const toolSlug = String(formData.get('toolSlug') || '');
    if (!(file instanceof File)) return json({ success: false, error: 'A generated file is required' }, 400);
    if (!BROWSER_PDF_RESULT_TOOLS.has(toolSlug)) return json({ success: false, error: 'This tool cannot upload browser-generated results' }, 400);
    if (file.size <= 0 || file.size > MAX_BROWSER_RESULT_BYTES) return json({ success: false, error: 'Generated file must be between 1 byte and 100 MB' }, 413);

    const tool = getPdfToolById(toolSlug);
    if (!tool) return json({ success: false, error: 'Unknown PDF tool' }, 400);
    const outputName = sanitizePublicFilename(String(formData.get('outputName') || ''), 'edited.pdf');
    const extension = path.extname(outputName).toLowerCase();
    const mimeType = mimeTypeForExtension(extension);
    if (!['.pdf', '.zip'].includes(extension) || !mimeType || file.type !== mimeType) {
      return json({ success: false, error: 'Only generated PDF or ZIP files are accepted' }, 415);
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    if (!hasValidSignature(buffer, extension)) return json({ success: false, error: `Invalid ${extension.slice(1).toUpperCase()} file signature` }, 415);

    const downloadDirectory = getAllowedDownloadDirectories()[0];
    await mkdir(downloadDirectory, { recursive: true });
    stagedPath = path.join(downloadDirectory, `browser-stage-${randomUUID()}${extension}`);
    await writeFile(stagedPath, buffer, { flag: 'wx' });
    const { result } = await retainPdfDownloadResult({
      tool,
      originalName: String(formData.get('originalName') || 'document.pdf'),
      processedOutputPath: stagedPath,
      requestedOutputName: outputName,
    });
    await unlink(stagedPath);
    stagedPath = '';
    return json(result);
  } catch (error) {
    if (stagedPath) await unlink(stagedPath).catch(() => undefined);
    return json({ success: false, error: error instanceof Error ? error.message : 'Failed to retain generated file' }, 500);
  }
}
