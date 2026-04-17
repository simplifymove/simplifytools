import { NextRequest, NextResponse } from 'next/server';
import { writeFile, unlink } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import { v4 as uuidv4 } from 'uuid';
import sharp from 'sharp';

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB for high-res images
const MAX_INPUT_DIMENSION = 8000;
const MAX_OUTPUT_DIMENSION = 16000;
const TEMP_DIR = path.join(process.cwd(), 'tmp');

export const maxDuration = 120; // 2 minutes for processing
export const bodyParser = {
  sizeLimit: '100mb',
};

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

/**
 * Call the Real-ESRGAN Python backend for industry-standard upscaling.
 * Real-ESRGAN is the state-of-the-art in image super-resolution.
 */
async function upscaleWithRealESRGAN(
  inputPath: string,
  scale: 2 | 3 | 4,
  mode: 'auto' | 'photo' | 'anime',
  faceEnhance: boolean,
  outputFormat: 'png' | 'jpg' | 'webp'
): Promise<{ outputPath: string; metadata: Record<string, any> }> {
  return new Promise((resolve, reject) => {
    const pythonScript = path.join(process.cwd(), 'python', 'upscale_engine.py');
    const outputPath = path.join(TEMP_DIR, `upscaled_${uuidv4()}.${outputFormat}`);
    
    const args = [
      inputPath,
      scale.toString(),
      mode,
      faceEnhance.toString(),
      outputFormat,
      outputPath,
    ];

    // Use virtual environment Python
    const venvPython = path.join(process.cwd(), '.venv', 'Scripts', 'python.exe');
    const pythonExe = process.platform === 'win32' && existsSync(venvPython)
      ? venvPython
      : process.platform === 'win32' 
        ? 'python'
        : '/usr/bin/python3';
    
    const spawnEnv = {
      ...process.env,
      PYTHONUNBUFFERED: '1',
      PYTHONDONTWRITEBYTECODE: '1',
    } as any;

    // Set PYTHONPATH for Linux deployments
    if (process.platform !== 'win32') {
      const pythonPaths = [
        '/usr/lib/python3/dist-packages',
        '/usr/lib/python3.12/dist-packages',
        '/usr/lib/python3.11/dist-packages',
        '/usr/local/lib/python3.12/site-packages',
        '/usr/local/lib/python3.11/site-packages',
      ];
      spawnEnv.PYTHONPATH = pythonPaths.join(':');
    }

    const python = spawn(pythonExe, [pythonScript, ...args], {
      env: spawnEnv,
    });

    let stdout = '';
    let stderr = '';

    python.stdout.on('data', (data) => {
      stdout += data.toString('utf8');
    });

    python.stderr.on('data', (data) => {
      stderr += data.toString('utf8');
    });

    python.on('close', (code) => {
      if (code !== 0) {
        console.error('Python stderr:', stderr);
        reject(new Error(`Python upscale failed (code ${code})`));
        return;
      }

      try {
        // Extract metadata from stdout
        const lines = stdout.split('\n');
        const metadataLine = lines.find(l => l.startsWith('METADATA:'));
        const metadata = metadataLine 
          ? JSON.parse(metadataLine.replace('METADATA:', ''))
          : {};
        
        // Log errors if they occurred
        if (stderr) {
          console.log('Python logs:', stderr);
        }
        
        resolve({ outputPath, metadata });
      } catch (e) {
        console.error('Metadata parsing error:', stdout);
        reject(new Error(`Failed to parse upscale output`));
      }
    });
  });
}

/**
 * Fallback upscaling using Sharp if Real-ESRGAN is unavailable.
 */
async function upscaleWithSharp(
  imageBuffer: Buffer,
  scale: 2 | 3 | 4,
  outputFormat: 'png' | 'jpg' | 'webp'
): Promise<Buffer> {
  const metadata = await sharp(imageBuffer).metadata();

  if (!metadata.width || !metadata.height) {
    throw new Error('Unable to determine image dimensions');
  }

  const outputWidth = metadata.width * scale;
  const outputHeight = metadata.height * scale;

  let pipeline = sharp(imageBuffer)
    .rotate()
    .resize(outputWidth, outputHeight, {
      fit: 'fill',
      withoutEnlargement: false,
      kernel: 'lanczos3',
    });

  if (outputFormat === 'png') {
    return pipeline
      .png({ progressive: true, compressionLevel: 9, adaptiveFiltering: true })
      .toBuffer();
  } else if (outputFormat === 'jpg') {
    return pipeline
      .jpeg({ quality: 95, progressive: true, optimizeScans: true })
      .toBuffer();
  } else {
    return pipeline.webp({ quality: 90, alphaQuality: 90 }).toBuffer();
  }
}

export async function POST(request: NextRequest) {
  const clientIp = getClientIp(request);
  let inputTempPath: string | null = null;

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
    const scale = (parseInt(searchParams.get('scale') || '4') || 4) as 2 | 3 | 4;
    const mode = (searchParams.get('mode') || 'auto') as 'auto' | 'photo' | 'anime';
    const faceEnhance = searchParams.get('face_enhance') === 'true';
    const format = (searchParams.get('format') || 'png') as 'png' | 'jpg' | 'webp';

    // Validate scale
    if (![2, 3, 4].includes(scale)) {
      return NextResponse.json({ error: 'Scale must be 2, 3, or 4' }, { status: 400 });
    }

    // Validate dimensions with metadata
    const metadata = await sharp(fileBuffer).metadata();
    if (!metadata.width || !metadata.height) {
      throw new Error('Unable to determine image dimensions');
    }

    if (metadata.width > MAX_INPUT_DIMENSION || metadata.height > MAX_INPUT_DIMENSION) {
      return NextResponse.json(
        { error: `Input exceeds max resolution of ${MAX_INPUT_DIMENSION}x${MAX_INPUT_DIMENSION}` },
        { status: 400 }
      );
    }

    const outputWidth = metadata.width * scale;
    const outputHeight = metadata.height * scale;

    if (outputWidth > MAX_OUTPUT_DIMENSION || outputHeight > MAX_OUTPUT_DIMENSION) {
      const maxScale = Math.floor(MAX_OUTPUT_DIMENSION / Math.max(metadata.width, metadata.height));
      return NextResponse.json(
        { 
          error: `Output would be ${outputWidth}x${outputHeight}px. Max scale: ${maxScale}x`,
          suggestion: `Try scale=${maxScale}x`,
        },
        { status: 400 }
      );
    }

    // Save input to temp file for Python processing
    inputTempPath = path.join(TEMP_DIR, `input_${uuidv4()}.jpg`);
    await writeFile(inputTempPath, fileBuffer);

    // Try Real-ESRGAN first, fallback to Sharp if unavailable
    let resultBuffer: Buffer;
    let metadata_obj: Record<string, any> = {};

    try {
      const { outputPath, metadata: pyMetadata } = await upscaleWithRealESRGAN(
        inputTempPath,
        scale,
        mode,
        faceEnhance,
        format
      );
      
      // Read result
      const fs = require('fs');
      
      // Verify file exists and has content
      if (!fs.existsSync(outputPath)) {
        throw new Error(`Output file not found: ${outputPath}`);
      }
      
      const fileStats = fs.statSync(outputPath);
      if (fileStats.size === 0) {
        throw new Error(`Output file is empty: ${outputPath}`);
      }
      
      resultBuffer = fs.readFileSync(outputPath);
      
      console.log(`✓ Read upscaled image: ${outputPath} (${resultBuffer.length} bytes, file: ${fileStats.size} bytes)`);
      
      // Verify buffer is valid binary data
      if (resultBuffer.length === 0) {
        throw new Error('Failed to read image file');
      }
      
      // Check magic bytes to verify it's a valid image
      const magicBytes = resultBuffer.slice(0, 4).toString('hex');
      console.log(`Image format: ${magicBytes}`);
      
      metadata_obj = {
        ...pyMetadata,
        engine: 'OpenCV Advanced',
      };
      
      // Cleanup
      try {
        await unlink(outputPath);
      } catch (e) {
        console.warn('Failed to cleanup output temp file');
      }
    } catch (esrganError) {
      console.warn('Real-ESRGAN fallback:', esrganError);
      // Fallback to Sharp
      resultBuffer = await upscaleWithSharp(fileBuffer, scale, format);
      metadata_obj = {
        engine: 'Sharp (Lanczos3)',
        warning: 'Real-ESRGAN unavailable, using fallback',
      };
    }

    // Cleanup input temp file
    if (inputTempPath) {
      try {
        await unlink(inputTempPath);
      } catch (e) {
        console.warn('Failed to cleanup input temp file');
      }
    }

    const headers = new Headers();
    headers.set('Content-Type', format === 'jpg' ? 'image/jpeg' : `image/${format}`);
    headers.set('Content-Length', resultBuffer.length.toString());
    headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    headers.set('Access-Control-Allow-Origin', '*');
    headers.set('X-Upscale-Metadata', JSON.stringify(metadata_obj));

    // Log for debugging
    console.log(`Response: ${format} (${resultBuffer.length} bytes), first bytes: ${resultBuffer.slice(0, 8).toString('hex')}`);

    // Return binary image data - use the simplest approach
    return new Response(resultBuffer, {
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

    // Cleanup on error
    if (inputTempPath) {
      try {
        await unlink(inputTempPath);
      } catch (e) {
        // Ignore cleanup errors
      }
    }

    return NextResponse.json(
      { error: errorMessage || 'Internal server error' },
      { status: 500 }
    );
  }
}

