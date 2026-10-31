import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { execFile } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs/promises';
import * as path from 'path';

export const runtime = 'nodejs';

const execFileAsync = promisify(execFile);
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const MAX_MASK_SIZE = 10 * 1024 * 1024;
const tmpDir = path.join(process.cwd(), 'tmp');

export async function POST(request: NextRequest) {
  let workDir: string | null = null;

  try {
    const formData = await request.formData();
    const imageFile = formData.get('image');
    const maskFile = formData.get('mask');
    const method = formData.get('method') ?? 'telea';
    const radiusValue = formData.get('radius') ?? '3';

    if (!(imageFile instanceof File) || !(maskFile instanceof File)) {
      return NextResponse.json(
        { error: 'Please upload an image and a mask.' },
        { status: 400 },
      );
    }

    if (
      imageFile.size === 0 ||
      maskFile.size === 0 ||
      imageFile.size > MAX_FILE_SIZE ||
      maskFile.size > MAX_MASK_SIZE
    ) {
      return NextResponse.json(
        { error: 'Image and mask must each be between 1 byte and 10 MB.' },
        { status: 400 },
      );
    }

    const allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedImageTypes.includes(imageFile.type) || maskFile.type !== 'image/png') {
      return NextResponse.json(
        { error: 'Use a JPG, PNG, or WebP image and a PNG mask.' },
        { status: 400 },
      );
    }

    if (typeof method !== 'string' || !['telea', 'ns'].includes(method)) {
      return NextResponse.json(
        { error: 'Invalid inpainting method.' },
        { status: 400 },
      );
    }

    if (typeof radiusValue !== 'string' || !/^[0-9]+$/.test(radiusValue)) {
      return NextResponse.json(
        { error: 'Invalid inpainting radius.' },
        { status: 400 },
      );
    }

    const radius = Number(radiusValue);
    if (!Number.isInteger(radius) || radius < 1 || radius > 20) {
      return NextResponse.json(
        { error: 'Radius must be between 1 and 20.' },
        { status: 400 },
      );
    }

    await fs.mkdir(tmpDir, { recursive: true });
    workDir = await fs.mkdtemp(path.join(tmpDir, `remove-object-${randomUUID()}-`));

    // Preserve the uploaded image's format for OpenCV decoding.
    const extension =
      imageFile.type === 'image/png'
        ? '.png'
        : imageFile.type === 'image/webp'
          ? '.webp'
          : '.jpg';

    const inputImagePath = path.join(workDir, `input${extension}`);
    const inputMaskPath = path.join(workDir, 'mask.png');
    const outputImagePath = path.join(workDir, 'output.jpg');

    await fs.writeFile(inputImagePath, Buffer.from(await imageFile.arrayBuffer()));
    await fs.writeFile(inputMaskPath, Buffer.from(await maskFile.arrayBuffer()));

    const pythonScript = path.join(process.cwd(), 'remove_object.py');
    const pythonExe =
      process.platform === 'win32'
        ? 'python'
        : '/var/www/simplifyconvertapp/venv/bin/python';

    try {
      await execFileAsync(
        pythonExe,
        [
          pythonScript,
          '--input',
          inputImagePath,
          '--mask',
          inputMaskPath,
          '--output',
          outputImagePath,
          '--method',
          method,
          '--radius',
          String(radius),
        ],
        {
          timeout: 30000,
          maxBuffer: 1024 * 1024,
          windowsHide: true,
        },
      );

      const resultBuffer = await fs.readFile(outputImagePath);

      if (resultBuffer.length === 0) {
        throw new Error('Empty output image');
      }

      return new NextResponse(new Uint8Array(resultBuffer), {
        headers: {
          'Content-Type': 'image/jpeg',
          'Content-Length': String(resultBuffer.length),
          'Cache-Control': 'no-store',
        },
      });
    } catch (error) {
      console.error('Remove Object processing failed:', error);
      return NextResponse.json(
        { error: 'Unable to process the image. Check the mask and try again.' },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error('Remove Object request failed:', error);
    return NextResponse.json(
      { error: 'Unable to process the uploaded files.' },
      { status: 500 },
    );
  } finally {
    if (workDir) {
      try {
        await fs.rm(workDir, { recursive: true, force: true });
      } catch (error) {
        console.error('Remove Object temporary-file cleanup failed:', error);
      }
    }
  }
}
