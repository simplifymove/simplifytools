import { mkdir, unlink, writeFile } from 'fs/promises';
import os from 'os';
import path from 'path';
import { randomUUID } from 'crypto';
import { spawnSync } from 'child_process';
import { NextRequest, NextResponse } from 'next/server';
import { getPdfToolById } from '@/app/lib/pdf-tools';
import { validatePdfSignature, validatePdfStructure } from '@/app/lib/file-security';
import { retainPdfDownloadResult } from '@/lib/services/pdf-download-result';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function json(body: unknown, status = 200): NextResponse {
  return NextResponse.json(body, {
    status,
    headers: {
      'Cache-Control': 'private, no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const tempDirectory = path.join(os.tmpdir(), 'pdf-tools');
  const requestId = randomUUID();
  const inputPath = path.join(tempDirectory, `edit-input-${requestId}.pdf`);
  const outputPath = path.join(tempDirectory, `edit-output-${requestId}.pdf`);

  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const textElementsValue = formData.get('textElements');
    if (!(file instanceof File)) return json({ success: false, error: 'No PDF file provided' }, 400);
    if (typeof textElementsValue !== 'string' || !textElementsValue) return json({ success: false, error: 'No text elements provided' }, 400);
    if (file.size <= 0 || file.size > 50 * 1024 * 1024) return json({ success: false, error: 'PDF must be between 1 byte and 50 MB' }, 413);

    const buffer = Buffer.from(await file.arrayBuffer());
    const signature = validatePdfSignature(buffer);
    const structure = validatePdfStructure(buffer);
    if (!signature.valid || !structure.valid) return json({ success: false, error: signature.error || structure.error || 'Invalid PDF file' }, 403);

    let textElements: unknown;
    try {
      textElements = JSON.parse(textElementsValue);
    } catch {
      return json({ success: false, error: 'Invalid text edit data' }, 400);
    }

    await mkdir(tempDirectory, { recursive: true });
    await writeFile(inputPath, buffer, { flag: 'wx' });
    const processResult = spawnSync('python', [
      path.join(process.cwd(), 'python', 'pdf_router.py'),
      'edit-pdf',
      JSON.stringify([inputPath]),
      outputPath,
      JSON.stringify({ textElements }),
    ], {
      cwd: path.join(process.cwd(), 'python'),
      encoding: 'utf-8',
      maxBuffer: 50 * 1024 * 1024,
    });
    if (processResult.error) throw new Error(`PDF editing failed: ${processResult.error.message}`);
    if (processResult.status !== 0) throw new Error(`PDF editing failed: ${processResult.stderr || processResult.stdout}`);

    const tool = getPdfToolById('edit-pdf');
    if (!tool) throw new Error('Edit PDF tool configuration is missing');
    const fileNameValue = formData.get('fileName');
    const { result } = await retainPdfDownloadResult({
      tool,
      originalName: file.name,
      processedOutputPath: outputPath,
      requestedOutputName: typeof fileNameValue === 'string' ? fileNameValue : undefined,
    });
    return json(result);
  } catch (error) {
    console.error('Error editing PDF:', error);
    return json({ success: false, error: error instanceof Error ? error.message : 'Failed to edit PDF' }, 500);
  } finally {
    await Promise.allSettled([unlink(inputPath), unlink(outputPath)]);
  }
}
