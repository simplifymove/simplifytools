import { copyFile, mkdir, stat, unlink } from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';
import type { PdfToolConfig } from '@/app/lib/pdf-tools';
import {
  createDownloadResult,
  getAllowedDownloadDirectories,
  type PublicDownloadResult,
} from '@/lib/services/download-result';

const MIME_TYPES: Record<string, string> = {
  '.pdf': 'application/pdf',
  '.zip': 'application/zip',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.tif': 'image/tiff',
  '.tiff': 'image/tiff',
  '.csv': 'text/csv',
  '.txt': 'text/plain',
  '.html': 'text/html',
  '.rtf': 'application/rtf',
  '.epub': 'application/epub+zip',
  '.mobi': 'application/x-mobipocket-ebook',
  '.azw3': 'application/vnd.amazon.ebook',
};

const EXTRA_OUTPUT_EXTENSIONS: Record<string, string[]> = {
  'split-pdf': ['.pdf'],
  'pdf-to-jpg': ['.jpg', '.jpeg'],
  'pdf-to-png': ['.png'],
  'pdf-to-tiff': ['.tif', '.tiff'],
  'extract-images-pdf': ['.jpg', '.jpeg', '.png'],
  'extract-tables-from-pdf': ['.xlsx'],
  'pdf-translator': ['.pdf'],
  'pdf-ocr': ['.pdf', '.txt'],
};

const OUTPUT_SUFFIXES: Record<string, string> = {
  'merge-pdf': 'merged',
  'split-pdf': 'split',
  'rotate-pdf': 'rotated',
  'rearrange-pdf': 'rearranged',
  'crop-pdf': 'cropped',
  'pdf-page-deleter': 'pages_removed',
  'create-pdf': 'created',
  'protect-pdf': 'protected',
  'unlock-pdf': 'unlocked',
  'pdf-watermark-remover': 'watermark_removed',
  'pdf-to-jpg': 'images',
  'pdf-to-png': 'images',
  'pdf-to-tiff': 'images',
  'edit-pdf': 'edited',
  'add-watermark': 'watermarked',
  'add-numbers-to-pdf': 'numbered',
  'annotate-pdf': 'annotated',
  'esign-pdf': 'signed',
  'extract-text-from-pdf': 'text',
  'extract-images-pdf': 'images',
  'extract-tables-from-pdf': 'tables',
  'compress-pdf': 'compressed',
  'pdf-translator': 'translated',
  'pdf-ocr': 'ocr',
  'pdf-deskew': 'deskewed',
  'pdf-enhance-scan': 'enhanced',
};

export const BROWSER_PDF_RESULT_TOOLS = new Set(['edit-pdf']);

export interface SafePdfDownloadResult extends PublicDownloadResult {
  success: true;
  resultId: string;
}

export function sanitizePublicFilename(value: string, fallback: string): string {
  const basename = path.basename(value || fallback)
    .replace(/[\r\n"\\/]/g, '_')
    .replace(/[\u0000-\u001f\u007f]/g, '')
    .trim()
    .slice(0, 180);
  return basename && basename !== '.' && basename !== '..' ? basename : fallback;
}

export function mimeTypeForExtension(extension: string): string | undefined {
  return MIME_TYPES[extension.toLowerCase()];
}

export function getRequestedPdfOutputExtension(
  tool: PdfToolConfig,
  options: Record<string, unknown>,
): string {
  if (tool.id === 'extract-tables-from-pdf' && options.format === 'xlsx') return '.xlsx';
  if (tool.id === 'pdf-translator' && options.outputMode === 'pdf') return '.pdf';
  if (tool.id === 'pdf-ocr' && typeof options.outputFormat === 'string') {
    const extension = `.${options.outputFormat.toLowerCase()}`;
    if (['.docx', '.pdf', '.txt'].includes(extension)) return extension;
  }
  return tool.output.toLowerCase();
}

export function validatePdfToolOutputExtension(
  tool: PdfToolConfig,
  outputPath: string,
): { extension: string; mimeType: string } {
  const extension = path.extname(outputPath).toLowerCase();
  const allowed = new Set([
    tool.output.toLowerCase(),
    ...(EXTRA_OUTPUT_EXTENSIONS[tool.id] ?? []),
  ]);
  const mimeType = mimeTypeForExtension(extension);
  if (!extension || !allowed.has(extension) || !mimeType) {
    throw new Error(
      `Unexpected processed output type for ${tool.id}: ${extension || 'missing extension'}`,
    );
  }
  return { extension, mimeType };
}

export function buildPdfOutputName(
  toolSlug: string,
  originalName: string,
  extension: string,
  requestedName?: string,
): string {
  if (requestedName) {
    const safeRequestedName = sanitizePublicFilename(requestedName, `document${extension}`);
    return path.extname(safeRequestedName).toLowerCase() === extension
      ? safeRequestedName
      : `${path.parse(safeRequestedName).name}${extension}`;
  }
  const safeOriginal = sanitizePublicFilename(originalName, 'document.pdf');
  const baseName = path.parse(safeOriginal).name
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .slice(0, 120) || 'document';
  const suffix = OUTPUT_SUFFIXES[toolSlug] ?? (toolSlug.includes('-to-') ? 'converted' : 'processed');
  return `${baseName}_${suffix}${extension}`;
}

export async function retainPdfDownloadResult({
  tool,
  originalName,
  processedOutputPath,
  requestedOutputName,
}: {
  tool: PdfToolConfig;
  originalName: string;
  processedOutputPath: string;
  requestedOutputName?: string;
}): Promise<{ result: SafePdfDownloadResult; retainedPath: string }> {
  const { extension, mimeType } = validatePdfToolOutputExtension(tool, processedOutputPath);
  const outputStats = await stat(processedOutputPath);
  if (!outputStats.isFile() || outputStats.size === 0) {
    throw new Error('Processing completed without a valid output file');
  }

  const downloadDirectory = getAllowedDownloadDirectories()[0];
  await mkdir(downloadDirectory, { recursive: true });
  const retainedPath = path.join(downloadDirectory, `${tool.id}-${randomUUID()}${extension}`);
  try {
    await copyFile(processedOutputPath, retainedPath);
    const downloadResult = await createDownloadResult({
      toolSlug: tool.id,
      originalName: sanitizePublicFilename(originalName, 'document.pdf'),
      outputName: buildPdfOutputName(tool.id, originalName, extension, requestedOutputName),
      outputPath: retainedPath,
      mimeType,
    });
    return {
      result: {
        success: true,
        resultId: downloadResult.id,
        ...downloadResult,
      },
      retainedPath,
    };
  } catch (error) {
    await unlink(retainedPath).catch(() => undefined);
    throw error;
  }
}
