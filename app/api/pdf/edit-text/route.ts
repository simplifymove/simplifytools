import { NextRequest, NextResponse } from 'next/server';
import { writeFile, unlink, readFile } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';
import { randomBytes } from 'crypto';
import { spawnSync } from 'child_process';

export async function POST(request: NextRequest) {
  let inputPath = '';
  let outputPath = '';

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const textElementsStr = formData.get('textElements') as string;
    const fileName = (formData.get('fileName') as string) || 'edited.pdf';

    if (!file) {
      return NextResponse.json(
        { error: 'No PDF file provided' },
        { status: 400 }
      );
    }

    if (!textElementsStr) {
      return NextResponse.json(
        { error: 'No text elements provided' },
        { status: 400 }
      );
    }

    // Create temp file name
    const tempDir = tmpdir();
    const randomId = randomBytes(8).toString('hex');
    inputPath = join(tempDir, `input-${randomId}.pdf`);
    outputPath = join(tempDir, `output-${randomId}.pdf`);

    // Write input file
    const buffer = await file.arrayBuffer();
    await writeFile(inputPath, Buffer.from(buffer));

    // Parse text elements
    const textElements = JSON.parse(textElementsStr);

    // Call Python backend to edit PDF
    const pythonScriptPath = join(process.cwd(), 'python', 'pdf_router.py');
    
    const options = {
      textElements: textElements,
    };

    const result = spawnSync('python', [
      pythonScriptPath,
      'edit-pdf',
      JSON.stringify([inputPath]), // Pass input file path as JSON array
      outputPath,
      JSON.stringify(options),
    ], {
      cwd: join(process.cwd(), 'python'),
      encoding: 'utf-8',
      maxBuffer: 50 * 1024 * 1024, // 50MB buffer
    });

    if (result.error) {
      throw new Error(`PDF editing failed: ${result.error.message}`);
    }

    if (result.status !== 0) {
      throw new Error(`PDF editing failed: ${result.stderr || result.stdout}`);
    }

    // Read the output file
    const editedBuffer = await readFile(outputPath);

    // Return the edited PDF
    return new NextResponse(editedBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${fileName}"`,
      },
    });
  } catch (error) {
    console.error('Error editing PDF:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to edit PDF' },
      { status: 500 }
    );
  } finally {
    // Cleanup temp files
    try {
      if (inputPath) await unlink(inputPath);
      if (outputPath) await unlink(outputPath);
    } catch {
      // Ignore cleanup errors
    }
  }
}
