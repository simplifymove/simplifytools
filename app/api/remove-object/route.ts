import { NextRequest, NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const tmpDir = path.join(process.cwd(), 'tmp');

// Ensure tmp directory exists
if (!fs.existsSync(tmpDir)) {
  fs.mkdirSync(tmpDir, { recursive: true });
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const imageFile = formData.get('image') as File;
    const maskFile = formData.get('mask') as File;
    const method = (formData.get('method') as string) || 'telea';
    const radius = parseInt((formData.get('radius') as string) || '3');

    // Validate inputs
    if (!imageFile || !maskFile) {
      return NextResponse.json(
        { error: 'Missing image or mask file' },
        { status: 400 }
      );
    }

    if (!['telea', 'ns'].includes(method)) {
      return NextResponse.json(
        { error: 'Invalid method. Use "telea" or "ns"' },
        { status: 400 }
      );
    }

    if (radius < 1 || radius > 20) {
      return NextResponse.json(
        { error: 'Radius must be between 1 and 20' },
        { status: 400 }
      );
    }

    // Save uploaded files to temp directory
    const timestamp = Date.now();
    const inputImagePath = path.join(tmpDir, `input_${timestamp}.jpg`);
    const inputMaskPath = path.join(tmpDir, `mask_${timestamp}.png`);
    const outputImagePath = path.join(tmpDir, `output_${timestamp}.jpg`);

    // Write image file
    const imageBuffer = await imageFile.arrayBuffer();
    fs.writeFileSync(inputImagePath, Buffer.from(imageBuffer));

    // Write mask file
    const maskBuffer = await maskFile.arrayBuffer();
    fs.writeFileSync(inputMaskPath, Buffer.from(maskBuffer));

    // Call Python script
    const pythonScript = path.join(process.cwd(), 'remove_object.py');
    const command = `python "${pythonScript}" --input "${inputImagePath}" --mask "${inputMaskPath}" --output "${outputImagePath}" --method ${method} --radius ${radius}`;

    try {
      const { stdout, stderr } = await execAsync(command, { timeout: 30000 });
      
      // Check if output file was created
      if (!fs.existsSync(outputImagePath)) {
        console.error('Python output:', stdout, stderr);
        return NextResponse.json(
          { error: 'Failed to generate output image' },
          { status: 500 }
        );
      }

      // Read result file
      const resultBuffer = fs.readFileSync(outputImagePath);

      // Clean up temp files
      try {
        fs.unlinkSync(inputImagePath);
        fs.unlinkSync(inputMaskPath);
        fs.unlinkSync(outputImagePath);
      } catch (err) {
        console.error('Failed to clean up temp files:', err);
      }

      // Return result as response
      return new NextResponse(resultBuffer, {
        headers: {
          'Content-Type': 'image/jpeg',
          'Content-Length': resultBuffer.length.toString(),
        },
      });
    } catch (execError) {
      // Clean up on error
      try {
        if (fs.existsSync(inputImagePath)) fs.unlinkSync(inputImagePath);
        if (fs.existsSync(inputMaskPath)) fs.unlinkSync(inputMaskPath);
        if (fs.existsSync(outputImagePath)) fs.unlinkSync(outputImagePath);
      } catch {
        // Ignore cleanup errors
      }

      const errorMessage = execError instanceof Error ? execError.message : 'Unknown error';
      console.error('Python execution error:', errorMessage);
      
      return NextResponse.json(
        { error: `Processing failed: ${errorMessage}` },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `Server error: ${errorMessage}` },
      { status: 500 }
    );
  }
}
