import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import * as os from 'os';
import * as path from 'path';
import { execFile } from 'child_process';
import { promisify } from 'util';

export const runtime = 'nodejs';

const execFileAsync = promisify(execFile);
const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
const MAX_IMAGE_PIXELS = 25_000_000;
const ALLOWED_BACKGROUNDS = new Set([
  'white', 'blue', 'gray', 'gradient', 'blur',
]);
const ALLOWED_GRADIENT_COLORS = new Set([
  'blue', 'purple', 'pink', 'teal', 'white', 'black',
]);
const ALLOWED_OUTPUT_SIZES = new Set([512, 1024, 1536]);

const PNG_SIGNATURE = Buffer.from([
  137, 80, 78, 71, 13, 10, 26, 10,
]);

function detectImageType(buffer: Buffer): string | null {
  if (
    buffer.length >= 8 &&
    buffer.subarray(0, 8).equals(PNG_SIGNATURE)
  ) {
    return 'image/png';
  }

  if (
    buffer.length >= 3 &&
    buffer[0] === 0xff &&
    buffer[1] === 0xd8 &&
    buffer[2] === 0xff
  ) {
    return 'image/jpeg';
  }

  if (
    buffer.length >= 12 &&
    buffer.toString('ascii', 0, 4) === 'RIFF' &&
    buffer.toString('ascii', 8, 12) === 'WEBP'
  ) {
    return 'image/webp';
  }

  return null;
}

function isAllowedExtension(name: string, mime: string): boolean {
  const ext = path.extname(name).toLowerCase();

  const extensions: Record<string, string[]> = {
    'image/jpeg': ['.jpg', '.jpeg'],
    'image/png': ['.png'],
    'image/webp': ['.webp'],
  };

  return extensions[mime]?.includes(ext) ?? false;
}

function validateImageDimensions(
  buffer: Buffer,
  mime: string,
): boolean {
  // Signature checks alone do not prove that an image is decodable.
  // The Python processor remains responsible for full decoding.
  if (mime === 'image/png' && buffer.length >= 24) {
    const width = buffer.readUInt32BE(16);
    const height = buffer.readUInt32BE(20);

    return (
      width > 0 &&
      height > 0 &&
      width * height <= MAX_IMAGE_PIXELS
    );
  }

  return true;
}

function badRequest(message: string) {
  return NextResponse.json(
    { error: message },
    { status: 400 },
  );
}

export async function POST(request: NextRequest) {
  let workDir: string | null = null;

  try {
    const formData = await request.formData();

    const image = formData.get('image');
    const bgValue = formData.get('bgType');
    const color1Value = formData.get('gradientColor1');
    const color2Value = formData.get('gradientColor2');
    const sizeValue = formData.get('outputSize');

    if (!(image instanceof File)) {
      return badRequest('Please upload an image.');
    }

    if (
      image.size === 0 ||
      image.size > MAX_UPLOAD_BYTES
    ) {
      return badRequest(
        'Please upload an image between 1 byte and 10 MB.',
      );
    }

    const bgType =
      typeof bgValue === 'string' ? bgValue : 'white';

    const gradientColor1 =
      typeof color1Value === 'string' ? color1Value : 'blue';

    const gradientColor2 =
      typeof color2Value === 'string' ? color2Value : 'purple';

    const outputSize =
      typeof sizeValue === 'string'
        ? Number(sizeValue)
        : 1024;

    if (!ALLOWED_BACKGROUNDS.has(bgType)) {
      return badRequest('Invalid background selection.');
    }

    if (
      !ALLOWED_GRADIENT_COLORS.has(gradientColor1) ||
      !ALLOWED_GRADIENT_COLORS.has(gradientColor2)
    ) {
      return badRequest('Invalid gradient color selection.');
    }

    if (
      !Number.isInteger(outputSize) ||
      !ALLOWED_OUTPUT_SIZES.has(outputSize)
    ) {
      return badRequest('Invalid output size.');
    }

    const buffer = Buffer.from(await image.arrayBuffer());
    const detectedMime = detectImageType(buffer);

    if (
      !detectedMime ||
      image.type !== detectedMime ||
      !isAllowedExtension(image.name, detectedMime) ||
      !validateImageDimensions(buffer, detectedMime)
    ) {
      return badRequest(
        'Please upload a valid JPG, PNG, or WebP image.',
      );
    }

    workDir = await fs.mkdtemp(
      path.join(os.tmpdir(), 'simplifyconvert-profile-'),
    );

    const inputPath = path.join(workDir, 'input-image');
    const outputPath = path.join(workDir, 'output.png');

    await fs.writeFile(inputPath, buffer);

    const pythonScript = path.join(
      process.cwd(),
      'profile_photo_maker.py',
    );

    const pythonExe =
      process.env.PROFILE_PHOTO_PYTHON ||
      (process.platform === 'win32'
        ? 'python'
        : path.join(process.cwd(), 'venv', 'bin', 'python'));

    const args = [
      pythonScript,
      '--input', inputPath,
      '--output', outputPath,
      '--bg', bgType,
      '--size', String(outputSize),
    ];

    if (bgType === 'gradient') {
      args.push(
        '--gradient',
        gradientColor1,
        gradientColor2,
      );
    }

    try {
      await execFileAsync(pythonExe, args, {
        timeout: 120000,
        maxBuffer: 10 * 1024 * 1024,
        windowsHide: true,
      });
    } catch (error) {
      console.error('Profile photo processor failed:', error);
      return NextResponse.json(
        { error: 'Unable to process this image. Please try another photo.' },
        { status: 500 },
      );
    }

    let output: Buffer;

    try {
      output = await fs.readFile(outputPath);
    } catch {
      return NextResponse.json(
        { error: 'The image processor did not produce an output.' },
        { status: 500 },
      );
    }

    if (
      output.length <= PNG_SIGNATURE.length ||
      !output.subarray(0, 8).equals(PNG_SIGNATURE)
    ) {
      return NextResponse.json(
        { error: 'The image processor returned an invalid result.' },
        { status: 500 },
      );
    }

    return new NextResponse(new Uint8Array(output), {
      headers: {
        'Content-Type': 'image/png',
        'Content-Length': String(output.length),
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('Profile photo API error:', error);

    return NextResponse.json(
      { error: 'Unable to process this image. Please try again.' },
      { status: 500 },
    );
  } finally {
    if (workDir) {
      try {
        await fs.rm(workDir, {
          recursive: true,
          force: true,
        });
      } catch (error) {
        console.error('Profile photo cleanup failed:', error);
      }
    }
  }
}
