import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';

const MAX_FILE_SIZE = 20 * 1024 * 1024;
const MAX_INPUT_DIMENSION = 6000;

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

// Radial search inpainting - look outward from mask edges to find good pixels
async function radial_inpaint(
  imageData: Buffer,
  maskData: Uint8Array,
  width: number,
  height: number
): Promise<Buffer> {
  const channels = 3; // RGB
  const pixels = new Uint8ClampedArray(imageData);
  const inpaintRegion = new Uint8Array(width * height);

  // Build inpaint region
  for (let i = 0; i < width * height; i++) {
    inpaintRegion[i] = maskData[i] > 128 ? 1 : 0;
  }

  // For each masked pixel, find nearest non-masked pixel using expanding search
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;

      if (inpaintRegion[idx] === 1) {
        let found = false;
        let radius = 1;

        // Expand search radius until we find a non-masked pixel
        while (!found && radius < Math.max(width, height)) {
          for (let dy = -radius; dy <= radius && !found; dy++) {
            for (let dx = -radius; dx <= radius && !found; dx++) {
              // Only check pixels on the current radius boundary for efficiency
              if (Math.abs(dx) !== radius && Math.abs(dy) !== radius) continue;

              const nx = x + dx;
              const ny = y + dy;

              if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                const nidx = ny * width + nx;

                // Found a non-masked pixel
                if (inpaintRegion[nidx] === 0) {
                  const srcIdx = nidx * channels;
                  const dstIdx = idx * channels;

                  // Copy RGB from found pixel
                  pixels[dstIdx] = pixels[srcIdx];
                  pixels[dstIdx + 1] = pixels[srcIdx + 1];
                  pixels[dstIdx + 2] = pixels[srcIdx + 2];

                  found = true;
                  break;
                }
              }
            }
          }

          if (!found) radius++;
        }
      }
    }
  }

  // Smooth the result with a bilateral filter to reduce artifacts
  const smoothed = new Uint8ClampedArray(pixels);
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = y * width + x;

      // Only smooth near mask boundaries
      let nearBoundary = false;
      if (inpaintRegion[idx] === 0) {
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const nidx = (y + dy) * width + (x + dx);
            if (nidx >= 0 && nidx < width * height && inpaintRegion[nidx] === 1) {
              nearBoundary = true;
            }
          }
        }
      }

      if (nearBoundary) {
        let sumR = 0,
          sumG = 0,
          sumB = 0;
        let count = 0;

        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const nidx = (y + dy) * width + (x + dx);
            if (nidx >= 0 && nidx < width * height) {
              const pidx = nidx * channels;
              sumR += pixels[pidx];
              sumG += pixels[pidx + 1];
              sumB += pixels[pidx + 2];
              count++;
            }
          }
        }

        const dstIdx = idx * channels;
        smoothed[dstIdx] = Math.round(sumR / count);
        smoothed[dstIdx + 1] = Math.round(sumG / count);
        smoothed[dstIdx + 2] = Math.round(sumB / count);
      }
    }
  }

  return Buffer.from(smoothed);
}

async function inpaintImage(
  imageBuffer: Buffer,
  maskBuffer: Buffer,
  mode: 'fast' | 'quality',
  outputFormat: 'png' | 'jpg' | 'webp'
): Promise<Buffer> {
  const startTime = Date.now();

  // Get image metadata
  const imageMetadata = await sharp(imageBuffer).metadata();

  if (!imageMetadata.width || !imageMetadata.height) {
    throw new Error('Unable to determine image dimensions');
  }

  if (
    imageMetadata.width > MAX_INPUT_DIMENSION ||
    imageMetadata.height > MAX_INPUT_DIMENSION
  ) {
    throw new Error(`Image exceeds max resolution of ${MAX_INPUT_DIMENSION}x${MAX_INPUT_DIMENSION}`);
  }

  // Get mask metadata
  const maskMetadata = await sharp(maskBuffer).metadata();

  if (!maskMetadata.width || !maskMetadata.height) {
    throw new Error('Unable to determine mask dimensions');
  }

  // Validate mask matches image size
  if (
    maskMetadata.width !== imageMetadata.width ||
    maskMetadata.height !== imageMetadata.height
  ) {
    throw new Error('Mask dimensions must match image dimensions');
  }

  const width = imageMetadata.width;
  const height = imageMetadata.height;

  // Determine processing size
  const maxDim = Math.max(width, height);
  const processingSize = mode === 'fast' ? 768 : 1024;
  const scaling = maxDim > processingSize ? processingSize / maxDim : 1;

  const processWidth = Math.round(width * scaling);
  const processHeight = Math.round(height * scaling);

  // Process image
  const imageProcessed = await sharp(imageBuffer)
    .rotate() // Auto-rotate EXIF
    .resize(processWidth, processHeight, { fit: 'fill', withoutEnlargement: false })
    .raw()
    .toBuffer({ resolveWithObject: true });

  // Process mask
  const maskProcessed = await sharp(maskBuffer)
    .resize(processWidth, processHeight, { fit: 'fill', withoutEnlargement: false })
    .grayscale()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { data: imageData } = imageProcessed;
  const { data: maskData } = maskProcessed;

  // Run inpainting
  const inpaintedData = await radial_inpaint(
    imageData as Buffer,
    maskData as Uint8Array,
    processWidth,
    processHeight
  );

  // Create image from inpainted data
  let finalOutput: Buffer;

  if (scaling < 1) {
    const buffer = await sharp(inpaintedData, {
      raw: { width: processWidth, height: processHeight, channels: 3 },
    })
      .resize(width, height, {
        fit: 'fill',
        kernel: 'lanczos3',
      });

    if (outputFormat === 'png') {
      finalOutput = await buffer.png({ compressionLevel: 9 }).toBuffer();
    } else if (outputFormat === 'jpg') {
      finalOutput = await buffer.jpeg({ quality: 95 }).toBuffer();
    } else {
      finalOutput = await buffer.webp({ quality: 90 }).toBuffer();
    }
  } else {
    const buffer = sharp(inpaintedData, {
      raw: { width, height, channels: 3 },
    });

    if (outputFormat === 'png') {
      finalOutput = await buffer.png({ compressionLevel: 9 }).toBuffer();
    } else if (outputFormat === 'jpg') {
      finalOutput = await buffer.jpeg({ quality: 95 }).toBuffer();
    } else {
      finalOutput = await buffer.webp({ quality: 90 }).toBuffer();
    }
  }

  console.log(
    `Inpaint: ${width}x${height} in ${Date.now() - startTime}ms [mode: ${mode}, format: ${outputFormat}]`
  );

  return finalOutput;
}

export async function POST(request: NextRequest) {
  const clientIp = getClientIp(request);

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const mask = formData.get('mask') as File;

    if (!file) {
      return NextResponse.json({ error: 'No image file provided' }, { status: 400 });
    }

    if (!mask) {
      return NextResponse.json({ error: 'No mask provided' }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File too large. Max ${MAX_FILE_SIZE / (1024 * 1024)}MB` },
        { status: 400 }
      );
    }

    if (mask.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `Mask too large. Max ${MAX_FILE_SIZE / (1024 * 1024)}MB` },
        { status: 400 }
      );
    }

    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const maskBuffer = Buffer.from(await mask.arrayBuffer());

    if (!validateImageType(fileBuffer)) {
      return NextResponse.json(
        { error: 'Invalid image type. Supported: JPEG, PNG, WebP' },
        { status: 400 }
      );
    }

    if (!validateImageType(maskBuffer)) {
      return NextResponse.json(
        { error: 'Invalid mask type. Must be PNG' },
        { status: 400 }
      );
    }

    // Parse parameters
    const { searchParams } = new URL(request.url);
    const mode = (searchParams.get('mode') || 'quality') as 'fast' | 'quality';
    const format = (searchParams.get('format') || 'png') as 'png' | 'jpg' | 'webp';

    const resultBuffer = await inpaintImage(fileBuffer, maskBuffer, mode, format);

    const headers = new Headers();
    headers.set('Content-Type', `image/${format === 'jpg' ? 'jpeg' : format}`);
    headers.set('Cache-Control', 'no-store');

    return new NextResponse(resultBuffer as any, {
      status: 200,
      headers,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);

    console.error('Inpaint Error:', {
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
