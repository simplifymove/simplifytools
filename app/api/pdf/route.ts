'use server';

import { NextRequest, NextResponse } from 'next/server';
import { writeFile, unlink, mkdir } from 'fs/promises';
import fs from 'fs';
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
  let optionsFile = ''; // For large options that need file-based passing
  let toolId = ''; // Move to outer scope so catch block can access it

  try {
    const formData = await request.formData();

    toolId = formData.get('tool') as string;
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

    // Use system python directly on VPS for access to installed packages
    let pythonExe = process.platform === 'win32' 
      ? path.join(process.cwd(), '.venv', 'Scripts', 'python.exe')
      : '/usr/bin/python3';  // Use system python directly on Linux/VPS
    
    // On Windows dev, try venv first
    if (process.platform === 'win32' && fs.existsSync(path.join(process.cwd(), '.venv', 'Scripts', 'python.exe'))) {
      pythonExe = path.join(process.cwd(), '.venv', 'Scripts', 'python.exe');
    }
    
    console.log(`[PDF API] Using Python executable: ${pythonExe}`);
    console.log(`[PDF API] Script path: ${pythonScript}`);
    console.log(`[PDF API] Tool ID: ${toolId}`);
    console.log(`[PDF API] Input files: ${JSON.stringify(inputFiles)}`);
    console.log(`[PDF API] Working directory: ${process.cwd()}`);
    
    // Extra logging for esign-pdf
    if (toolId === 'esign-pdf') {
      console.log(`[PDF API] [ESIGN] Options keys: ${Object.keys(options).join(', ')}`);
      if (options.signatures) {
        console.log(`[PDF API] [ESIGN] Signatures JSON string length: ${options.signatures.length}`);
        console.log(`[PDF API] [ESIGN] Signatures JSON prefix: ${typeof options.signatures === 'string' ? options.signatures.substring(0, 100) : 'NOT A STRING'}`);
        try {
          const sigsArray = JSON.parse(options.signatures);
          console.log(`[PDF API] [ESIGN] Parsed ${sigsArray.length} signatures`);
          sigsArray.forEach((sig: any, idx: number) => {
            console.log(`[PDF API] [ESIGN] Signature ${idx}: type=${sig.type}, page=${sig.page}, base64Length=${sig.imageData?.length || 0}`);
          });
        } catch (e) {
          console.error(`[PDF API] [ESIGN] Failed to parse signatures JSON: ${e}`);
        }
      }
    }

    const pythonArgs = [
      toolId,
      JSON.stringify(inputFiles),
      outputFile,
    ];
    
    // For tools with large options (like esign-pdf with base64 signatures), write options to a file
    if (toolId === 'esign-pdf' || JSON.stringify(options).length > 5000) {
      optionsFile = path.join(tempDir, `options_${timestamp}.json`);
      await writeFile(optionsFile, JSON.stringify(options));
      pythonArgs.push(optionsFile);
      console.log(`[PDF API] Wrote options to file: ${optionsFile}`);
    } else {
      pythonArgs.push(JSON.stringify(options));
    }
    
    if (toolId === 'esign-pdf') {
      console.log(`[PDF API] [ESIGN] About to call Python with ${optionsFile ? 'options file: ' + optionsFile : 'options arg'}`);
    }

    const result = await new Promise<{ success: boolean; output?: string; error?: string; debug?: string }>((resolve, reject) => {
      console.log(`[PDF API] Spawning Python process with cwd: ${process.cwd()}`);
      
      // Prepare environment with Python-specific variables
      // This ensures subprocess can find system-installed packages
      const spawnEnv = {
        ...process.env,
        PYTHONDONTWRITEBYTECODE: '1',
        // For VPS: ensure system site-packages are accessible
        PYTHONHOME: '/usr',  // System Python home
      } as NodeJS.ProcessEnv;
      
      // If using venv, also set VIRTUAL_ENV for compatibility
      if (!pythonExe.includes('/usr/bin/')) {
        (spawnEnv as any).VIRTUAL_ENV = path.dirname(path.dirname(pythonExe));
      }
      
      console.log(`[PDF API] Python environment: PYTHONHOME=${spawnEnv.PYTHONHOME}, PYTHONDONTWRITEBYTECODE=${spawnEnv.PYTHONDONTWRITEBYTECODE}`);
      
      const pythonProcess = spawn(pythonExe, [
        pythonScript,
        ...pythonArgs,
      ], {
        cwd: process.cwd(), // Explicitly set working directory
        stdio: ['pipe', 'pipe', 'pipe'], // Keep pipes for stdout and stderr
        env: spawnEnv, // Pass environment with Python variables
      });

      // Set a longer timeout for OCR operations (15 minutes for model download)
      const timeout = toolId === 'pdf-ocr' ? 15 * 60 * 1000 : 5 * 60 * 1000;
      const timeoutHandle = setTimeout(() => {
        pythonProcess.kill();
        reject(new Error(`Python process timeout after ${timeout / 1000}s for tool: ${toolId}. For OCR on first run, EasyOCR needs to download language models (~200MB). Please try again.`));
      }, timeout);

      let stdout = '';
      let stderr = '';

      pythonProcess.stdout.on('data', (data) => {
        stdout += data.toString();
        // Log OCR progress
        if (toolId === 'pdf-ocr' && stdout.includes('[OCR]')) {
          console.log('[PDF API OCR Progress]:', data.toString().trim());
        }
      });

      pythonProcess.stderr.on('data', (data) => {
        stderr += data.toString();
        // Log warnings/progress from EasyOCR
        if (data.toString().includes('Downloading')) {
          console.log('[PDF API] Model Download:', data.toString().trim());
        }
      });

      pythonProcess.on('error', (err) => {
        clearTimeout(timeoutHandle);
        console.error('[PDF API] Failed to start Python process:', {
          error: err.message,
          code: (err as any).code,
          pythonExe,
          additionalInfo: 'Python may not be installed or not in PATH'
        });
        reject(new Error(`Failed to start Python process (${pythonExe}): ${err.message}. Make sure Python is installed and in your PATH.`));
      });

      pythonProcess.on('close', (code) => {
        clearTimeout(timeoutHandle);
        if (code !== 0) {
          const errorMsg = stderr || stdout || 'Unknown error';
          console.error('[PDF API] Python process failed with exit code:', code);
          console.error('[PDF API] STDERR (full):', stderr);
          console.error('[PDF API] STDOUT (full):', stdout);
          reject(new Error(`Python process failed (code ${code}): ${errorMsg}`));
          return;
        }

        try {
          // Extract JSON from stdout (may have debug logs before it)
          let result;
          const lines = stdout.split('\n');
          let jsonLine = '';
          
          // Find the last line that starts with { (likely the JSON result)
          for (let i = lines.length - 1; i >= 0; i--) {
            const line = lines[i].trim();
            if (line.startsWith('{')) {
              jsonLine = line;
              break;
            }
          }
          
          if (!jsonLine) {
            console.error('[PDF API] No JSON output found in Python response');
            console.error('[PDF API] Raw stdout (full):', stdout);
            console.error('[PDF API] Raw stderr (full):', stderr);
            throw new Error('No JSON output found from Python');
          }
          
          result = JSON.parse(jsonLine);
          
          // Check if Python returned an error
          if (!result.success && result.error) {
            console.error('[PDF API] Python returned error:', result.error);
            throw new Error(result.error);
          }
          
          console.log('[PDF API] Python process succeeded:', { success: result.success, hasOutput: !!result.output });
          
          // Include debug logs if available
          if (stdout && stdout.length > jsonLine.length) {
            const debugLogs = stdout.substring(0, stdout.lastIndexOf(jsonLine)).trim();
            if (debugLogs) {
              console.log('[DEBUG from PDF tool]:', debugLogs);
              result.debug = debugLogs;
            }
          }
          
          resolve(result);
        } catch (parseErr) {
          console.error('[PDF API] Failed to parse Python response:', { 
            stdout: stdout.substring(0, 500),
            stderr: stderr.substring(0, 500),
            parseError: parseErr 
          });
          reject(new Error(`Failed to parse Python response`));
        }
      });
    });

    if (!result.success) {
      // Include debug logs in error response if available
      const errorMsg = result.error || 'PDF processing failed';
      const response: any = { error: errorMsg };
      throw new Error(JSON.stringify(response));
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
        if (optionsFile) {
          await unlink(optionsFile);
        }
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
      if (optionsFile) {
        await unlink(optionsFile);
      }
    } catch {
      // Ignore cleanup errors
    }

    const message = error instanceof Error ? error.message : 'Unknown error';
    const fullError = error instanceof Error ? error.toString() : JSON.stringify(error);
    
    console.error('[PDF API] Error:', { 
      message, 
      toolId,
      inputFiles: inputFiles.length,
      errorType: error instanceof Error ? 'Error' : typeof error,
      fullError
    });
    return NextResponse.json(
      { error: `PDF processing failed: ${message}` },
      { status: 500 }
    );
  }
}

