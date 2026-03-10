import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';

const MAX_FILE_SIZE = 20 * 1024 * 1024;
const MAX_RESOLUTION = 6000;

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

async function removeBackgroundSimple(
  imageBuffer: Buffer,
  hqMode: boolean
): Promise<Buffer> {
  const startTime = Date.now();

  // Get metadata
  const metadata = await sharp(imageBuffer).metadata();

  if (!metadata.width || !metadata.height) {
    throw new Error('Unable to determine image dimensions');
  }

  if (metadata.width > MAX_RESOLUTION || metadata.height > MAX_RESOLUTION) {
    throw new Error(`Image exceeds max resolution of ${MAX_RESOLUTION}x${MAX_RESOLUTION}`);
  }

  // Resize for processing if needed
  const maxDim = Math.max(metadata.width, metadata.height);
  const scaling = maxDim > 1024 ? 1024 / maxDim : 1;
  
  const processWidth = Math.round(metadata.width * scaling);
  const processHeight = Math.round(metadata.height * scaling);

  // Get image data
  const resized = await sharp(imageBuffer)
    .rotate() // Auto-rotate EXIF
    .resize(processWidth, processHeight, { fit: 'inside', withoutEnlargement: false })
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { data: pixels, info } = resized;
  const { width, height, channels } = info;

  // Simple background detection from edges
  const edgePixels: Array<[number, number, number]> = [];
  const sampleRate = Math.max(1, Math.floor(Math.min(width, height) / 30));

  // Sample edges
  for (let x = 0; x < width; x += sampleRate) {
    const idx = x * channels;
    edgePixels.push([pixels[idx], pixels[idx + 1], pixels[idx + 2]]);
    const idx2 = ((height - 1) * width + x) * channels;
    edgePixels.push([pixels[idx2], pixels[idx2 + 1], pixels[idx2 + 2]]);
  }

  for (let y = 0; y < height; y += sampleRate) {
    const idx = y * width * channels;
    edgePixels.push([pixels[idx], pixels[idx + 1], pixels[idx + 2]]);
    const idx2 = (y * width + (width - 1)) * channels;
    edgePixels.push([pixels[idx2], pixels[idx2 + 1], pixels[idx2 + 2]]);
  }

  // Get median background color
  const rs = edgePixels.map(p => p[0]).sort((a, b) => a - b);
  const gs = edgePixels.map(p => p[1]).sort((a, b) => a - b);
  const bs = edgePixels.map(p => p[2]).sort((a, b) => a - b);
  const mid = Math.floor(edgePixels.length / 2);

  const bgR = rs[mid];
  const bgG = gs[mid];
  const bgB = bs[mid];

  // Create alpha channel based on color distance
  const rgba = new Uint8ClampedArray(width * height * 4);
  const threshold = hqMode ? 25 : 40;
  const edgeThreshold = hqMode ? 60 : 80; // Transition zone

  for (let i = 0; i < width * height; i++) {
    const srcIdx = i * channels;
    const dstIdx = i * 4;

    const r = pixels[srcIdx];
    const g = pixels[srcIdx + 1];
    const b = pixels[srcIdx + 2];

    rgba[dstIdx] = r;
    rgba[dstIdx + 1] = g;
    rgba[dstIdx + 2] = b;

    // Calculate distance from background
    const dist = Math.sqrt((r - bgR) ** 2 + (g - bgG) ** 2 + (b - bgB) ** 2);

    // Binary alpha with soft edge transition
    if (dist < threshold) {
      // Definitely background - fully transparent
      rgba[dstIdx + 3] = 0;
    } else if (dist < edgeThreshold) {
      // Edge zone - smooth transition
      const t = (dist - threshold) / (edgeThreshold - threshold);
      const eased = t * t * (3 - 2 * t); // Smoothstep
      rgba[dstIdx + 3] = Math.round(eased * 255);
    } else {
      // Definitely foreground - fully opaque
      rgba[dstIdx + 3] = 255;
    }
  }

  // Apply slight bilateral filter to alpha for edge smoothing
  const alphaBlur = new Uint8ClampedArray(width * height);
  for (let i = 0; i < width * height; i++) {
    alphaBlur[i] = rgba[i * 4 + 3];
  }

  // Selective blur: only blur edge pixels (not fully transparent or opaque)
  const blurred = new Uint8ClampedArray(width * height);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      const centerAlpha = alphaBlur[idx];
      
      // Only blur edge pixels
      if (centerAlpha > 0 && centerAlpha < 255) {
        let sum = centerAlpha;
        let count = 1;

        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            if (dx === 0 && dy === 0) continue;
            const ny = y + dy;
            const nx = x + dx;
            if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
              sum += alphaBlur[ny * width + nx];
              count++;
            }
          }
        }
        blurred[idx] = Math.round(sum / count);
      } else {
        blurred[idx] = centerAlpha;
      }
    }
  }

  // Apply blurred alpha back to rgba
  for (let i = 0; i < width * height; i++) {
    rgba[i * 4 + 3] = blurred[i];
  }

  // Create output PNG with high quality settings
  let output = await sharp(Buffer.from(rgba), {
    raw: { width, height, channels: 4 },
  })
    .png({ 
      progressive: true, 
      compressionLevel: 9,
      adaptiveFiltering: true 
    })
    .toBuffer();

  // Upscale if needed using best interpolation
  if (scaling < 1) {
    output = await sharp(output)
      .resize(metadata.width, metadata.height, { 
        fit: 'fill',
        kernel: 'lanczos3'
      })
      .png({ 
        progressive: true, 
        compressionLevel: 9,
        adaptiveFiltering: true 
      })
      .toBuffer();
  }

  console.log(`Processing time: ${Date.now() - startTime}ms for ${metadata.width}x${metadata.height}`);

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

    const { searchParams } = new URL(request.url);
    const hqMode = searchParams.get('hq') === 'true';

    const resultBuffer = await removeBackgroundSimple(fileBuffer, hqMode);

    const headers = new Headers();
    headers.set('Content-Type', 'image/png');
    headers.set('Cache-Control', 'no-store');

    return new NextResponse(resultBuffer as any, {
      status: 200,
      headers,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);

    console.error('BG Remove Error:', {
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
