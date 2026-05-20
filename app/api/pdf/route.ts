'use server';

import { NextRequest, NextResponse } from 'next/server';
import { writeFile, unlink, mkdir } from 'fs/promises';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { getPdfToolById } from '@/app/lib/pdf-tools';
import { validatePdfInput, validatePageRange, validatePageList, validatePassword } from '@/app/lib/pdf-validation';
import {
  validatePdfSignature,
  validateImageSignature,
  validateFileCount,
  validateTotalFileSize,
  validateFileMinimumSize,
  validatePdfNotImage,
  validateImageNotPdf,
  validatePdfStructure,
} from '@/app/lib/file-security';
import { spawn } from 'child_process';

/**
 * Server-side validation for tool-specific requirements
 * This runs after basic input validation
 */
interface ValidationResult {
  valid: boolean;
  error?: string;
}

function validateToolServerSide(
  tool: any,
  files: File[],
  options: Record<string, any>
): ValidationResult {
  // Most validation is handled on frontend
  // This adds extra safety checks for API abuse or critical issues

  switch (tool.id) {
    case 'merge-pdf':
      if (files.length < 2) {
        return { valid: false, error: 'Merge PDF requires at least 2 PDF files.' };
      }
      break;

    case 'protect-pdf':
      const userPassword = options?.userPassword;
      if (!userPassword || userPassword.trim() === '') {
        return { valid: false, error: 'User password is required to protect PDF.' };
      }
      break;

    case 'unlock-pdf':
      const password = options?.password;
      if (!password || password.trim() === '') {
        return { valid: false, error: 'Password is required to unlock PDF.' };
      }
      break;

    case 'pdf-page-deleter':
      const pagesToDelete = options?.pagesToDelete;
      if (!pagesToDelete || pagesToDelete.trim() === '') {
        return { valid: false, error: 'Please specify pages to delete.' };
      }
      break;

    case 'create-pdf':
      const numPages = options?.numPages || 0;
      const hasImages = files && files.length > 0;
      if (!hasImages && numPages < 1) {
        return { valid: false, error: 'Create PDF requires at least one image or blank page count.' };
      }
      break;

    default:
      break;
  }

  return { valid: true };
}

export async function POST(request: NextRequest) {
  const tempDir = path.join(os.tmpdir(), 'pdf-tools');
  const timestamp = Date.now();
  const inputFiles: string[] = [];
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

    // Validate input - frontend already validates, but always validate on backend
    const validation = validatePdfInput(tool, files, url || '', optionsJson ? JSON.parse(optionsJson) : {});
    if (!validation.valid) {
      const errorMessage = validation.error || 'Invalid input';
      return NextResponse.json(
        { success: false, error: errorMessage },
        { status: 400 }
      );
    }

    // Additional server-side validation for specific tools
    const serverValidation = validateToolServerSide(tool, files, optionsJson ? JSON.parse(optionsJson) : {});
    if (!serverValidation.valid) {
      return NextResponse.json(
        { success: false, error: serverValidation.error },
        { status: 400 }
      );
    }

    // FILE SECURITY VALIDATION (CRITICAL)
    // Prevents spoofing attacks, corruption, and denial-of-service
    console.log(`[PDF API SECURITY] Starting file validation for tool: ${toolId}, files: ${files.length}`);
    
    // Validate file count
    const fileCountValidation = validateFileCount(files.length, 50);
    if (!fileCountValidation.valid) {
      console.warn(`[PDF API SECURITY] File count validation failed: ${fileCountValidation.error}`);
      return NextResponse.json(
        { success: false, error: fileCountValidation.error },
        { status: 403 }
      );
    }

    // Validate total file size
    const totalSize = files.reduce((sum, f) => sum + f.size, 0);
    const totalSizeValidation = validateTotalFileSize(totalSize, 500 * 1024 * 1024); // 500MB
    if (!totalSizeValidation.valid) {
      console.warn(`[PDF API SECURITY] Total file size validation failed: ${totalSizeValidation.error}`);
      return NextResponse.json(
        { success: false, error: totalSizeValidation.error },
        { status: 403 }
      );
    }

    // Validate each file's actual signature (magic bytes)
    // This prevents spoofing attacks (e.g., renaming exe as pdf)
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(fileBuffer);

      // Check minimum file size
      const minSizeValidation = validateFileMinimumSize(buffer, 100);
      if (!minSizeValidation.valid) {
        console.warn(`[PDF API SECURITY] File ${i} size validation failed: ${minSizeValidation.error}`);
        return NextResponse.json(
          { success: false, error: minSizeValidation.error },
          { status: 403 }
        );
      }

      const ext = '.' + file.name.split('.').pop()?.toLowerCase();

      // Validate PDF files by signature
      if (ext.toLowerCase() === '.pdf' || tool.accepts.includes('.pdf')) {
        // Check PDF signature
        const pdfSigValidation = validatePdfSignature(buffer);
        if (!pdfSigValidation.valid) {
          console.warn(`[PDF API SECURITY] PDF signature validation failed for file ${i} (${file.name}): ${pdfSigValidation.error}`);
          return NextResponse.json(
            { success: false, error: pdfSigValidation.error },
            { status: 403 }
          );
        }

        // Check PDF is not an image file renamed
        const pdfNotImageValidation = validatePdfNotImage(buffer);
        if (!pdfNotImageValidation.valid) {
          console.warn(`[PDF API SECURITY] File ${i} is image renamed as PDF: ${pdfNotImageValidation.error}`);
          return NextResponse.json(
            { success: false, error: pdfNotImageValidation.error },
            { status: 403 }
          );
        }

        // Validate PDF structure (detect corruption)
        const pdfStructureValidation = validatePdfStructure(buffer);
        if (!pdfStructureValidation.valid) {
          console.warn(`[PDF API SECURITY] PDF structure validation failed for file ${i}: ${pdfStructureValidation.error}`);
          return NextResponse.json(
            { success: false, error: pdfStructureValidation.error },
            { status: 403 }
          );
        }
      }

      // Validate image files by signature
      if (
        ['.jpg', '.jpeg', '.png', '.tiff', '.tif', '.webp', '.gif', '.heic'].includes(ext.toLowerCase())
      ) {
        // Check image signature
        const imageSigValidation = validateImageSignature(buffer, ext);
        if (!imageSigValidation.valid) {
          console.warn(`[PDF API SECURITY] Image signature validation failed for file ${i} (${file.name}): ${imageSigValidation.error}`);
          return NextResponse.json(
            { success: false, error: imageSigValidation.error },
            { status: 403 }
          );
        }

        // Check image is not a PDF file renamed
        const imageNotPdfValidation = validateImageNotPdf(buffer);
        if (!imageNotPdfValidation.valid) {
          console.warn(`[PDF API SECURITY] File ${i} is PDF renamed as image: ${imageNotPdfValidation.error}`);
          return NextResponse.json(
            { success: false, error: imageNotPdfValidation.error },
            { status: 403 }
          );
        }
      }
    }
    
    console.log(`[PDF API SECURITY] File validation passed for all ${files.length} file(s)`);

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
      : '/var/www/simplifyconvertapp/venv/bin/python';  // Use venv on Linux/VPS
    
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
      } as NodeJS.ProcessEnv;
      
      // Remove PYTHONHOME if it exists (let Python auto-detect)
      // Setting it to '/usr' on Windows breaks module resolution
      delete (spawnEnv as any).PYTHONHOME;
      
      // Explicitly set PYTHONPATH for VPS deployment (Linux uses dist-packages)
      // CRITICAL: Subprocess doesn't inherit PYTHONPATH, so we must set it explicitly
      if (process.platform !== 'win32') {
        const pythonPaths = [
          '/usr/lib/python3/dist-packages',           // Debian/Ubuntu system packages
          '/usr/lib/python3.12/dist-packages',        // Python 3.12 specific
          '/usr/lib/python3.11/dist-packages',        // Python 3.11 specific
          '/usr/lib/python3.10/dist-packages',        // Python 3.10 specific
          '/usr/local/lib/python3.12/site-packages',  // Local Python 3.12
          '/usr/local/lib/python3.11/site-packages',  // Local Python 3.11
          '/usr/local/lib/python3.10/site-packages',  // Local Python 3.10
        ];
        (spawnEnv as any).PYTHONPATH = pythonPaths.join(':');
        console.log(`[PDF API] Set PYTHONPATH for Linux: ${pythonPaths.length} directories`);
      }
      
      // If using venv, also set VIRTUAL_ENV for compatibility
      if (!pythonExe.includes('/usr/bin/')) {
        (spawnEnv as any).VIRTUAL_ENV = path.dirname(path.dirname(pythonExe));
      }
      
      console.log(`[PDF API] Python environment: PYTHONDONTWRITEBYTECODE=${spawnEnv.PYTHONDONTWRITEBYTECODE}, VIRTUAL_ENV=${(spawnEnv as any).VIRTUAL_ENV}`);
      
      const pythonProcess = spawn(pythonExe, [
        pythonScript,
        ...pythonArgs,
      ], {
        cwd: process.cwd(), // Explicitly set working directory
        stdio: ['pipe', 'pipe', 'pipe'], // Keep pipes for stdout and stderr
        env: spawnEnv, // Pass environment with Python variables
      });

      // TIMEOUT PROTECTION - Prevent runaway processes
      // Different tools have different timeout requirements
      const timeoutConfig: Record<string, number> = {
        'pdf-ocr': 15 * 60 * 1000, // 15 minutes for OCR (needs to download models)
        'pdf-translator': 10 * 60 * 1000, // 10 minutes for translation
        'pdf-enhance-scan': 5 * 60 * 1000, // 5 minutes for enhancement
        'pdf-deskew': 5 * 60 * 1000, // 5 minutes for deskewing
        // Default 5 minutes for all other tools
        'default': 5 * 60 * 1000,
      };
      
      const timeoutMs = timeoutConfig[toolId] || timeoutConfig['default'];
      const timeoutHandle = setTimeout(() => {
        pythonProcess.kill('SIGKILL'); // Force kill
        console.error(`[PDF API] Process timeout for tool ${toolId} after ${timeoutMs / 1000}s`);
        const timeoutMsg =
          toolId === 'pdf-ocr'
            ? 'OCR processing took too long. For first run, language models need to download (~200MB). Please try again.'
            : `Processing timeout after ${timeoutMs / 1000}s. Your file may be too large or complex. Please try a simpler file or contact support.`;
        reject(new Error(timeoutMsg));
      }, timeoutMs);

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
          reject(new Error(`Python process failed (code ${code}): ${errorMsg}\n\nDebug output:\n${stdout}\n\nErrors:\n${stderr}`));
          return;
        }

        try {
          // Log all output for debugging
          console.log('[PDF API] Full stdout:', stdout);
          console.log('[PDF API] Full stderr:', stderr);
          
          // Extract JSON from stdout (may have debug logs before it)
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
          
          const result = JSON.parse(jsonLine);
          
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
    
    // Parse structured error responses from validation
    let userMessage = 'PDF processing failed. Please check your file and try again.';
    let isSecurityError = false;
    
    try {
      const parsed = JSON.parse(message);
      if (parsed.error) {
        userMessage = parsed.error;
      }
    } catch {
      // If message is not JSON, use it directly
      if (message && message.length < 500) {
        userMessage = message;
      }
    }

    // Detect security-related errors for enhanced logging
    if (
      message.includes('signature') ||
      message.includes('spoofed') ||
      message.includes('renamed') ||
      message.includes('file count') ||
      message.includes('file size') ||
      message.includes('corrupted')
    ) {
      isSecurityError = true;
    }
    
    // Security Event Logging
    if (isSecurityError) {
      console.warn('[PDF API SECURITY] Rejected request:', {
        tool: toolId,
        reason: message,
        fileCount: inputFiles.length,
        timestamp: new Date().toISOString(),
      });
    } else {
      console.error('[PDF API] Error:', { 
        message, 
        toolId,
        inputFiles: inputFiles.length,
        errorType: error instanceof Error ? 'Error' : typeof error,
        userMessage,
        fullError: fullError.substring(0, 200) // Log truncated
      });
    }
    
    return NextResponse.json(
      { success: false, error: userMessage },
      { status: isSecurityError ? 403 : 500 }
    );
  }
}

