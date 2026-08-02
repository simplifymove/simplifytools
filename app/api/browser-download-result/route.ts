import { mkdir, unlink, writeFile } from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import {
  createDownloadResult,
  getAllowedDownloadDirectories,
} from '@/lib/services/download-result';
import { sanitizePublicFilename } from '@/lib/services/pdf-download-result';
import { aiWriteTools } from '@/app/lib/ai-tools';
import { codeTools } from '@/app/lib/code-tools';
import { allTools } from '@/app/data/tools';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_BROWSER_RESULT_BYTES = 100 * 1024 * 1024;

interface BrowserResultToolPolicy {
  extensions: string[];
  mimeTypes: string[];
}

const PNG_POLICY: BrowserResultToolPolicy = {
  extensions: ['.png'],
  mimeTypes: ['image/png'],
};

const JPEG_POLICY: BrowserResultToolPolicy = {
  extensions: ['.jpg', '.jpeg'],
  mimeTypes: ['image/jpeg'],
};

const EDITABLE_RASTER_POLICY: BrowserResultToolPolicy = {
  extensions: ['.png', '.jpg', '.jpeg', '.webp'],
  mimeTypes: ['image/png', 'image/jpeg', 'image/webp'],
};

const FONT_AWESOME_POLICY: BrowserResultToolPolicy = {
  extensions: ['.png', '.jpg', '.jpeg', '.webp', '.svg'],
  mimeTypes: ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'],
};

const TEXT_POLICY: BrowserResultToolPolicy = {
  extensions: ['.txt'],
  mimeTypes: ['text/plain', 'text/plain;charset=utf-8'],
};

const CODE_MINIFIER_POLICY: BrowserResultToolPolicy = {
  extensions: ['.html', '.css', '.js'],
  mimeTypes: ['text/plain'],
};

const CSV_POLICY: BrowserResultToolPolicy = {
  extensions: ['.csv'],
  mimeTypes: ['text/csv'],
};

const EXCEL_TO_CSV_POLICY: BrowserResultToolPolicy = {
  extensions: ['.csv', '.zip'],
  mimeTypes: ['text/csv', 'application/zip'],
};

const XML_POLICY: BrowserResultToolPolicy = {
  extensions: ['.xml'],
  mimeTypes: ['application/xml', 'text/xml'],
};

const DOCX_POLICY: BrowserResultToolPolicy = {
  extensions: ['.docx'],
  mimeTypes: [
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ],
};

const PDF_POLICY: BrowserResultToolPolicy = {
  extensions: ['.pdf'],
  mimeTypes: ['application/pdf'],
};

const TEXT_BROWSER_TOOLS = [
  'image-to-text',
  'ocr-to-text',
  ...Object.keys(aiWriteTools),
  ...Object.keys(codeTools),
  ...allTools
    .filter((tool) => tool.category === 'Financial Calculator')
    .map((tool) => tool.id),
];

const PNG_BROWSER_TOOLS = [
  'add-border',
  'add-images',
  'add-opacity',
  'add-text',
  'black-white',
  'chart-maker',
  'cleanup-picture',
  'collage-maker',
  'colorize-photo',
  'combine-images',
  'flip-image',
  'image-splitter',
  'make-background-transparent',
  'make-round-image',
  'profile-photo-maker',
  'resize-image',
  'reverse-image',
  'rotate-image',
  'translate-image',
];

const JPEG_BROWSER_TOOLS = [
  'batch-compress-images',
  'batch-resize-images',
  'blur-background',
  'blur-image',
  'blur-zoom',
  'brightness-contrast',
  'cartoon-effect',
  'chromatic-aberration',
  'color-balance',
  'color-grader',
  'compress-image',
  'dream-effect',
  'duotone-effect',
  'edge-detect',
  'emboss-effect',
  'film-noir',
  'glitch-effect',
  'glow-effect',
  'grayscale-image',
  'histogram-equalize',
  'hue-saturation',
  'image-compressor',
  'image-enhancer',
  'invert-colors',
  'kaleidoscope',
  'lens-flare',
  'mirror-image',
  'mosaic-tile',
  'motion-blur',
  'neon-glow',
  'oil-paint-effect',
  'pixelate-image',
  'posterize-image',
  'remove-object',
  'sepia-filter',
  'sharpen-image',
  'sketch-effect',
  'solarize-effect',
  'sunburst',
  'swirl-distortion',
  'thermal-vision',
  'tilt-shift',
  'unblur-image',
  'vhs-effect',
  'vignette-effect',
  'vintage-filter',
  'watermark-image',
  'white-balance',
];

const ALLOWED_BROWSER_RESULT_TOOLS: Record<
  string,
  BrowserResultToolPolicy
> = {
  ...Object.fromEntries(PNG_BROWSER_TOOLS.map((toolSlug) => [toolSlug, PNG_POLICY])),
  ...Object.fromEntries(JPEG_BROWSER_TOOLS.map((toolSlug) => [toolSlug, JPEG_POLICY])),
  ...Object.fromEntries(TEXT_BROWSER_TOOLS.map((toolSlug) => [toolSlug, TEXT_POLICY])),
  'jpg-to-avif': {
    extensions: ['.avif'],
    mimeTypes: ['image/avif'],
  },
  'png-to-avif': {
    extensions: ['.avif'],
    mimeTypes: ['image/avif'],
  },
  'webp-to-avif': {
    extensions: ['.avif'],
    mimeTypes: ['image/avif'],
  },
  'jpg-to-gif': {
    extensions: ['.gif'],
    mimeTypes: ['image/gif'],
  },
  'webp-to-gif': {
    extensions: ['.gif'],
    mimeTypes: ['image/gif'],
  },
  'png-to-eps': {
    extensions: ['.eps'],
    mimeTypes: ['application/postscript'],
  },
  'tiff-to-svg': {
    extensions: ['.svg'],
    mimeTypes: ['image/svg+xml'],
  },
  'jpg-to-png': {
    extensions: ['.png'],
    mimeTypes: ['image/png'],
  },
  'png-to-jpg': {
    extensions: ['.jpg', '.jpeg'],
    mimeTypes: ['image/jpeg'],
  },
  'webp-to-png': {
    extensions: ['.png'],
    mimeTypes: ['image/png'],
  },
  'webp-to-jpg': {
    extensions: ['.jpg', '.jpeg'],
    mimeTypes: ['image/jpeg'],
  },
  'jpg-to-webp': {
    extensions: ['.webp'],
    mimeTypes: ['image/webp'],
  },
  'png-to-webp': {
    extensions: ['.webp'],
    mimeTypes: ['image/webp'],
  },
  'bmp-to-jpg': {
    extensions: ['.jpg', '.jpeg'],
    mimeTypes: ['image/jpeg'],
  },
  'bmp-to-png': {
    extensions: ['.png'],
    mimeTypes: ['image/png'],
  },
  'heic-to-jpg': {
    extensions: ['.jpg', '.jpeg'],
    mimeTypes: ['image/jpeg'],
  },
  'heic-to-png': {
    extensions: ['.png'],
    mimeTypes: ['image/png'],
  },
  'tiff-to-jpg': {
    extensions: ['.jpg', '.jpeg'],
    mimeTypes: ['image/jpeg'],
  },
  'tiff-to-png': {
    extensions: ['.png'],
    mimeTypes: ['image/png'],
  },
  'gif-to-jpg': {
    extensions: ['.jpg', '.jpeg'],
    mimeTypes: ['image/jpeg'],
  },
  'gif-to-png': {
    extensions: ['.png'],
    mimeTypes: ['image/png'],
  },
  'edit-to-png': {
    extensions: ['.png'],
    mimeTypes: ['image/png'],
  },
  'eps-to-jpg': {
    extensions: ['.jpg', '.jpeg'],
    mimeTypes: ['image/jpeg'],
  },
  'eps-to-png': {
    extensions: ['.png'],
    mimeTypes: ['image/png'],
  },
  'vsdx-to-jpg': {
    extensions: ['.jpg', '.jpeg'],
    mimeTypes: ['image/jpeg'],
  },
  'vsdx-to-pdf': PDF_POLICY,
  'vsd-to-pdf': PDF_POLICY,
  'crop-image': EDITABLE_RASTER_POLICY,
  'excel-to-csv': EXCEL_TO_CSV_POLICY,
  'json-to-xml': XML_POLICY,
  'code-minifier': CODE_MINIFIER_POLICY,
  'font-awesome-to-png': FONT_AWESOME_POLICY,
  'remove-background': EDITABLE_RASTER_POLICY,
  'remove-object': {
    extensions: ['.png', '.jpg', '.jpeg'],
    mimeTypes: ['image/png', 'image/jpeg'],
  },
  'remove-watermark': EDITABLE_RASTER_POLICY,
  'resume-job-match': DOCX_POLICY,
  'text-diff': CSV_POLICY,
  'upscale-image': EDITABLE_RASTER_POLICY,
};

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

  if (fetchSite && fetchSite !== 'same-origin') {
    return false;
  }

  if (!origin) {
    return process.env.NODE_ENV !== 'production';
  }

  try {
    const forwardedProto =
      request.headers.get('x-forwarded-proto') ||
      request.nextUrl.protocol.replace(':', '');

    const forwardedHost =
      request.headers.get('x-forwarded-host') ||
      request.headers.get('host');

    if (!forwardedHost) {
      return false;
    }

    const publicOrigin = `${forwardedProto}://${forwardedHost}`;

    return new URL(origin).origin === new URL(publicOrigin).origin;
  } catch {
    return false;
  }
}

function hasValidSignature(buffer: Buffer, extension: string): boolean {
  if (extension === '.png') {
    return buffer.subarray(0, 8).toString('hex') === '89504e470d0a1a0a';
  }

  if (extension === '.jpg' || extension === '.jpeg') {
    return (
      buffer.length >= 3 &&
      buffer[0] === 0xff &&
      buffer[1] === 0xd8 &&
      buffer[2] === 0xff
    );
  }

  if (extension === '.webp') {
    return (
      buffer.subarray(0, 4).toString('ascii') === 'RIFF' &&
      buffer.subarray(8, 12).toString('ascii') === 'WEBP'
    );
  }

  if (extension === '.eps') {
    const prefix = buffer
      .subarray(0, Math.min(buffer.length, 256))
      .toString('ascii');

    return (
      prefix.startsWith('%!PS-Adobe-') &&
      prefix.includes('EPSF-')
    );
  }

  if (extension === '.pdf') {
    return (
      buffer.length >= 5 &&
      buffer.subarray(0, 5).toString('ascii') === '%PDF-'
    );
  }

  if (extension === '.svg') {
    const svgPrefix = buffer
      .subarray(0, Math.min(buffer.length, 4096))
      .toString('utf8')
      .replace(/^\uFEFF/, '')
      .trimStart();

    return /^(?:<\?xml[^>]*>\s*)?<svg(?:\s|>)/i.test(svgPrefix);
  }

  if (
    extension === '.txt' ||
    extension === '.csv' ||
    extension === '.html' ||
    extension === '.css' ||
    extension === '.js'
  ) {
    return buffer.length > 0;
  }

  if (extension === '.docx') {
    const signature = buffer.subarray(0, 4).toString('hex');
    return ['504b0304', '504b0506', '504b0708'].includes(signature);
  }

  if (extension === '.zip') {
    const signature = buffer.subarray(0, 4).toString('hex');
    return ['504b0304', '504b0506', '504b0708'].includes(signature);
  }

  if (extension === '.xml') {
    const prefix = buffer
      .subarray(0, Math.min(buffer.length, 4096))
      .toString('utf8')
      .replace(/^\uFEFF/, '')
      .trimStart();
    return /^(?:<\?xml[^>]*>\s*)?<[A-Za-z_][A-Za-z0-9._-]*(?:\s|>|\/)/.test(prefix);
  }

  return false;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  let outputPath = '';

  try {
    if (!isSameOrigin(request)) {
      return json(
        {
          success: false,
          error: 'Cross-origin result uploads are not allowed',
        },
        403,
      );
    }

    const formData = await request.formData();
    const file = formData.get('file');
    const toolSlug = String(formData.get('toolSlug') || '').trim();
    const originalName = String(formData.get('originalName') || 'image');
    const requestedOutputName = String(
      formData.get('outputName') || 'converted-file',
    );

    if (!(file instanceof File)) {
      return json(
        {
          success: false,
          error: 'A generated file is required',
        },
        400,
      );
    }

    const toolPolicy = ALLOWED_BROWSER_RESULT_TOOLS[toolSlug];

    if (!toolPolicy) {
      return json(
        {
          success: false,
          error: 'This tool cannot upload browser-generated results',
        },
        400,
      );
    }

    if (file.size <= 0 || file.size > MAX_BROWSER_RESULT_BYTES) {
      return json(
        {
          success: false,
          error: 'Generated file must be between 1 byte and 100 MB',
        },
        413,
      );
    }

    const outputName = sanitizePublicFilename(
      requestedOutputName,
      'converted-file',
    );
    const extension = path.extname(outputName).toLowerCase();

    if (!toolPolicy.extensions.includes(extension)) {
      return json(
        {
          success: false,
          error: 'The generated file extension is not allowed for this tool',
        },
        415,
      );
    }

    console.log('[browser-download-result] MIME validation', {
      toolSlug,
      outputName,
      receivedMimeType: file.type,
      allowedMimeTypes: toolPolicy.mimeTypes,
      extension,
      fileSize: file.size,
    });

    if (!toolPolicy.mimeTypes.includes(file.type)) {
      return json(
        {
          success: false,
          error: 'The generated file MIME type is not allowed for this tool',
        },
        415,
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    if (!hasValidSignature(buffer, extension)) {
      return json(
        {
          success: false,
          error: 'The generated file signature is invalid',
        },
        415,
      );
    }

    const downloadDirectory = getAllowedDownloadDirectories()[0];
    await mkdir(downloadDirectory, { recursive: true });

    outputPath = path.join(
      downloadDirectory,
      `${toolSlug}-${randomUUID()}${extension}`,
    );

    await writeFile(outputPath, buffer, { flag: 'wx' });

    const result = await createDownloadResult({
      toolSlug,
      originalName: sanitizePublicFilename(originalName, 'image'),
      outputName,
      outputPath,
      mimeType: file.type,
    });

    outputPath = '';

    return json({
      success: true,
      resultId: result.id,
      downloadPageUrl: result.downloadPageUrl,
      outputName: result.outputName,
      mimeType: result.mimeType,
      fileSize: result.fileSize,
      expiresAt: result.expiresAt,
    });
  } catch (error) {
    if (outputPath) {
      await unlink(outputPath).catch(() => undefined);
    }

    return json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to retain generated file',
      },
      500,
    );
  }
}
