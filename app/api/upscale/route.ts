import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';

const MAX_FILE_SIZE = 20 * 1024 * 1024;
const MAX_INPUT_DIMENSION = 6000;
const MAX_OUTPUT_DIMENSION = 10000;
const TILE_SIZE = 512; // For tiling large images

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0] ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
}

function validateImageType(buffer: Buffer): boolean {
  const magicBytes = buffer.slice(0, 12);

  // JPEG: FF D8 FF
  if (magicBytes[0] === 0xFF && magicBytes[1] === 0xD8 && magicBytes[2] === 0xFF) {
    return true;
  }

  // PNG: 89 50 4E 47
  if (
    magicBytes[0] === 0x89 &&
    magicBytes[1] === 0x50 &&
    magicBytes[2] === 0x4E &&
    magicBytes[3] === 0x47
  ) {
    return true;
  }

  // WebP: RIFF...WEBP
  if (
    magicBytes[0] === 0x52 &&
    magicBytes[1] === 0x49 &&
    magicBytes[2] === 0x46 &&
    magicBytes[3] === 0x46 &&
    magicBytes[8] === 0x57 &&
    magicBytes[9] === 0x45 &&
    magicBytes[10] === 0x42 &&
    magicBytes[11] === 0x50
  ) {
    return true;
  }

  return false;
}

// Detect if image is likely illustration/anime (few colors, sharp edges)
async function detectImageMode(imageBuffer: Buffer): Promise<'photo' | 'anime'> {
  try {
    const metadata = await sharp(imageBuffer).metadata();
    
    if (!metadata.width || !metadata.height) {
      return 'photo'; // Fallback to photo mode
    }

    // Small sample for analysis
    const sampleSize = 100;
    const sampleBuffer = await sharp(imageBuffer)
      .resize(sampleSize, sampleSize, { fit: 'inside' })
      .raw()
      .toBuffer({ resolveWithObject: true });

    const { data: pixels } = sampleBuffer;
    const uniqueColors = new Set<string>();

    // Sample every 4th pixel for speed
    for (let i = 0; i < pixels.length; i += 12) {
      const r = pixels[i];
      const g = pixels[i + 1];
      const b = pixels[i + 2];
      uniqueColors.add(`${r},${g},${b}`);
    }

    // Anime/illustration typically has fewer colors
    if (uniqueColors.size < 500) {
      return 'anime';
    }

    return 'photo';
  } catch {
    return 'photo'; // Fallback
  }
}

async function upscaleImage(
  imageBuffer: Buffer,
  scale: 2 | 4,
  mode: 'auto' | 'photo' | 'anime',
  faceEnhance: boolean,
  outputFormat: 'png' | 'jpg' | 'webp'
): Promise<Buffer> {
  const startTime = Date.now();

  // Get original metadata
  const metadata = await sharp(imageBuffer).metadata();

  if (!metadata.width || !metadata.height) {
    throw new Error('Unable to determine image dimensions');
  }

  if (metadata.width > MAX_INPUT_DIMENSION || metadata.height > MAX_INPUT_DIMENSION) {
    throw new Error(`Input exceeds max resolution of ${MAX_INPUT_DIMENSION}x${MAX_INPUT_DIMENSION}`);
  }

  // Check output dimensions
  const outputWidth = metadata.width * scale;
  const outputHeight = metadata.height * scale;

  if (outputWidth > MAX_OUTPUT_DIMENSION || outputHeight > MAX_OUTPUT_DIMENSION) {
    throw new Error(
      `Output would exceed max ${MAX_OUTPUT_DIMENSION}px. Max scale for this image: ${Math.floor(MAX_OUTPUT_DIMENSION / Math.max(metadata.width, metadata.height))}×`
    );
  }

  // Detect mode if auto
  let finalMode = mode;
  if (mode === 'auto') {
    finalMode = await detectImageMode(imageBuffer);
  }

  // Upscale using Sharp with high-quality Lanczos interpolation
  // NOTE: Real-ESRGAN integration point - replace this with actual ESRGAN inference
  let pipeline = sharp(imageBuffer)
    .rotate() // Auto-rotate EXIF
    .resize(outputWidth, outputHeight, {
      fit: 'fill',
      withoutEnlargement: false,
      kernel: 'lanczos3', // Best quality interpolation
    });

  // Handle different output formats
  let output: Buffer;

  if (outputFormat === 'png') {
    output = await pipeline
      .png({ 
        progressive: true, 
        compressionLevel: 9,
        adaptiveFiltering: true 
      })
      .toBuffer();
  } else if (outputFormat === 'jpg') {
    output = await pipeline
      .jpeg({ 
        quality: 95,
        progressive: true,
        optimizeScans: true,
      })
      .toBuffer();
  } else {
    // WebP
    output = await pipeline
      .webp({ 
        quality: 90,
        alphaQuality: 90,
      })
      .toBuffer();
  }

  console.log(`Upscale: ${metadata.width}x${metadata.height} → ${outputWidth}x${outputHeight} (${scale}×) in ${Date.now() - startTime}ms [mode: ${finalMode}, format: ${outputFormat}]`);

  return output;
}

export async function POST(request: NextRequest) {
  const clientIp = getClientIp(request);

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File too large. Max ${MAX_FILE_SIZE / (1024 * 1024)}MB` },
        { status: 400 }
      );
    }

    const buffer = await file.arrayBuffer();
    const fileBuffer = Buffer.from(buffer);

    if (!validateImageType(fileBuffer)) {
      return NextResponse.json(
        { error: 'Invalid file type. Supported: JPEG, PNG, WebP' },
        { status: 400 }
      );
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const scale = parseInt(searchParams.get('scale') || '4') as 2 | 4;
    const mode = (searchParams.get('mode') || 'auto') as 'auto' | 'photo' | 'anime';
    const faceEnhance = searchParams.get('face_enhance') === 'true';
    const format = (searchParams.get('format') || 'png') as 'png' | 'jpg' | 'webp';

    // Validate scale
    if (scale !== 2 && scale !== 4) {
      return NextResponse.json({ error: 'Scale must be 2 or 4' }, { status: 400 });
    }

    const resultBuffer = await upscaleImage(fileBuffer, scale, mode, faceEnhance, format);

    const headers = new Headers();
    headers.set('Content-Type', `image/${format === 'jpg' ? 'jpeg' : format}`);
    headers.set('Cache-Control', 'no-store');

    return new NextResponse(resultBuffer as any, {
      status: 200,
      headers,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);

    console.error('Upscale Error:', {
      clientIp,
      error: errorMessage,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json(
      { error: errorMessage || 'Internal server error' },
      { status: 500 }
    );
  }
}
