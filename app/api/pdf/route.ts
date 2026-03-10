'use server';

import { NextRequest, NextResponse } from 'next/server';
import { writeFile, unlink, mkdir } from 'fs/promises';
import path from 'path';
import os from 'os';
import { getPdfToolById } from '@/app/lib/pdf-tools';
import { validatePdfInput } from '@/app/lib/pdf-validation';
import { spawn } from 'child_process';

export async function POST(request: NextRequest) {
  const tempDir = path.join(os.tmpdir(), 'pdf-tools');
  const timestamp = Date.now();
  let inputFiles: string[] = [];
  let outputFile = '';

  try {
    const formData = await request.formData();

    const toolId = formData.get('tool') as string;
    const url = formData.get('url') as string | null;
    const files = formData.getAll('file') as File[];
    const optionsJson = formData.get('options') as string;

    if (!toolId) {
      return NextResponse.json(
        { error: 'Tool ID is required' },
        { status: 400 }
      );
    }

    const tool = getPdfToolById(toolId);
    if (!tool) {
      return NextResponse.json(
        { error: `Unknown tool: ${toolId}` },
        { status: 400 }
      );
    }

    // Validate input
    const validation = validatePdfInput(tool, files, url || '');
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    // Create temp directory if it doesn't exist
    try {
      await mkdir(tempDir, { recursive: true });
    } catch (err) {
      console.error('Failed to create temp directory:', err);
    }

    // Save uploaded files
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const inputPath = path.join(tempDir, `input_${timestamp}_${i}_${file.name}`);
      const buffer = await file.arrayBuffer();
      await writeFile(inputPath, Buffer.from(buffer));
      inputFiles.push(inputPath);
    }

    // Generate output path
    outputFile = path.join(
      tempDir,
      `output_${timestamp}.${tool.output.replace('.', '')}`
    );

    // Parse options
    const options = optionsJson ? JSON.parse(optionsJson) : {};
    if (url) {
      options.url = url;
    }

    // Call Python backend
    const pythonScript = path.join(process.cwd(), 'python', 'pdf_router.py');

    const result = await new Promise<{ success: boolean; output?: string; error?: string }>((resolve, reject) => {
      const pythonProcess = spawn('python', [
        pythonScript,
        toolId,
        JSON.stringify(inputFiles),
        outputFile,
        JSON.stringify(options),
      ]);

      let stdout = '';
      let stderr = '';

      pythonProcess.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      pythonProcess.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      pythonProcess.on('error', (err) => {
        console.error('Failed to start Python process:', err);
        reject(new Error(`Failed to start Python process: ${err.message}`));
      });

      pythonProcess.on('close', (code) => {
        if (code !== 0) {
          const errorMsg = stderr || stdout || 'Unknown error';
          console.error('Python process failed:', { code, stderr, stdout });
          reject(new Error(`Python process failed (code ${code}): ${errorMsg}`));
          return;
        }

        try {
          const result = JSON.parse(stdout);
          resolve(result);
        } catch (parseErr) {
          console.error('Failed to parse Python response:', { stdout, stderr });
          reject(new Error(`Failed to parse Python response: ${stdout}`));
        }
      });
    });

    if (!result.success) {
      throw new Error(result.error || 'PDF processing failed');
    }

    // Read output file
    const { readFile } = await import('fs/promises');
    const fileBuffer = await readFile(result.output || outputFile);
    const fileName = `${toolId}_output${tool.output}`;

    // Determine content type
    let contentType = 'application/octet-stream';
    if (tool.output === '.pdf') {
      contentType = 'application/pdf';
    } else if (tool.output === '.txt') {
      contentType = 'text/plain';
    } else if (tool.output === '.csv') {
      contentType = 'text/csv';
    } else if (tool.output === '.xlsx') {
      contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    } else if (tool.output === '.docx') {
      contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    } else if (tool.output === '.zip') {
      contentType = 'application/zip';
    } else if (['.jpg', '.jpeg'].includes(tool.output)) {
      contentType = 'image/jpeg';
    } else if (tool.output === '.png') {
      contentType = 'image/png';
    }

    // Clean up temp files
    setTimeout(async () => {
      try {
        for (const file of inputFiles) {
          await unlink(file);
        }
        await unlink(result.output || outputFile);
      } catch {
        // Ignore cleanup errors
      }
    }, 5000);

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${fileName}"`,
      },
    });
  } catch (error) {
    // Clean up on error
    try {
      for (const file of inputFiles) {
        await unlink(file);
      }
      if (outputFile) {
        await unlink(outputFile);
      }
    } catch {
      // Ignore cleanup errors
    }

    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('PDF API error:', { message, error });
    return NextResponse.json(
      { error: `PDF processing failed: ${message}` },
      { status: 500 }
    );
  }
}
