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
    const bgType = (formData.get('bgType') as string) || 'white';
    const gradientColor1 = (formData.get('gradientColor1') as string) || 'blue';
    const gradientColor2 = (formData.get('gradientColor2') as string) || 'purple';
    const outputSize = parseInt((formData.get('outputSize') as string) || '1024');

    // Validate inputs
    if (!imageFile) {
      return NextResponse.json(
        { error: 'Missing image file' },
        { status: 400 }
      );
    }

    const validBgTypes = ['white', 'blue', 'gray', 'gradient', 'blur'];
    if (!validBgTypes.includes(bgType)) {
      return NextResponse.json(
        { error: `Invalid background type. Use: ${validBgTypes.join(', ')}` },
        { status: 400 }
      );
    }

    if (outputSize < 256 || outputSize > 2048) {
      return NextResponse.json(
        { error: 'Output size must be between 256 and 2048' },
        { status: 400 }
      );
    }

    // Save uploaded file
    const timestamp = Date.now();
    const inputImagePath = path.join(tmpDir, `input_${timestamp}.jpg`);
    const outputImagePath = path.join(tmpDir, `output_${timestamp}.png`);

    const imageBuffer = await imageFile.arrayBuffer();
    fs.writeFileSync(inputImagePath, Buffer.from(imageBuffer));

    // Build command
    const pythonScript = path.join(process.cwd(), 'profile_photo_maker.py');
    let command = `python "${pythonScript}" --input "${inputImagePath}" --output "${outputImagePath}" --bg ${bgType} --size ${outputSize}`;
    
    if (bgType === 'gradient') {
      command += ` --gradient ${gradientColor1} ${gradientColor2}`;
    }

    try {
      const { stdout, stderr } = await execAsync(command, { timeout: 120000, maxBuffer: 10 * 1024 * 1024 });
      
      console.log('Python stdout:', stdout);
      if (stderr) console.error('Python stderr:', stderr);

      // Check if output file exists
      if (!fs.existsSync(outputImagePath)) {
        console.error('Output file not created');
        console.error('stdout:', stdout);
        console.error('stderr:', stderr);
        return NextResponse.json(
          { error: `Failed to create profile photo: ${stderr || stdout}` },
          { status: 500 }
        );
      }

      // Read result
      const resultBuffer = fs.readFileSync(outputImagePath);

      // Cleanup
      try {
        fs.unlinkSync(inputImagePath);
        fs.unlinkSync(outputImagePath);
      } catch (err) {
        console.error('Cleanup error:', err);
      }

      // Return result
      return new NextResponse(resultBuffer, {
        headers: {
          'Content-Type': 'image/png',
          'Content-Length': resultBuffer.length.toString(),
        },
      });
    } catch (execError) {
      // Cleanup on error
      try {
        if (fs.existsSync(inputImagePath)) fs.unlinkSync(inputImagePath);
        if (fs.existsSync(outputImagePath)) fs.unlinkSync(outputImagePath);
      } catch {
        // Ignore
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
