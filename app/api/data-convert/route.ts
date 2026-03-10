/**
 * Unified Data Conversion API Route
 * 
 * Single endpoint that routes all 12 tools to 3 shared engines
 * Handles file upload, validation, processing, and download
 */

import { NextRequest, NextResponse } from 'next/server';
import { writeFile, readFile, unlink } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import { getDataToolById } from '@/app/lib/data-tools';
import { 
  validateToolAndFile, 
  validateFileSize,
  validateToolOptions,
  sanitizeFilename,
  generateOutputFilename,
  validateExcelFile
} from '@/app/lib/data-validation';

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  const tempFiles: string[] = [];
  
  try {
    const formData = await request.formData();
    
    const tool = formData.get('tool') as string;
    const file = formData.get('file') as File;
    const optionsJson = formData.get('options') as string;
    
    // Validate inputs
    if (!tool || !file) {
      return NextResponse.json(
        { ok: false, error: 'Tool and file are required' },
        { status: 400 }
      );
    }
    
    // Parse options
    let options: Record<string, any> = {};
    try {
      if (optionsJson) {
        options = JSON.parse(optionsJson);
      }
    } catch (e) {
      return NextResponse.json(
        { ok: false, error: 'Invalid options JSON' },
        { status: 400 }
      );
    }
    
    // Validate tool exists and file type
    const toolValidation = validateToolAndFile(tool, file.name);
    if (!toolValidation.valid) {
      return NextResponse.json(
        { ok: false, errors: toolValidation.errors },
        { status: 400 }
      );
    }
    
    // Validate file size
    const sizeValidation = validateFileSize(file.size);
    if (!sizeValidation.valid) {
      return NextResponse.json(
        { ok: false, errors: sizeValidation.errors },
        { status: 400 }
      );
    }
    
    // Validate tool options
    const optionsValidation = validateToolOptions(tool, options);
    if (!optionsValidation.valid) {
      return NextResponse.json(
        { ok: false, errors: optionsValidation.errors },
        { status: 400 }
      );
    }
    
    // Get tool config
    const toolConfig = getDataToolById(tool);
    if (!toolConfig) {
      return NextResponse.json(
        { ok: false, error: 'Tool not found' },
        { status: 404 }
      );
    }
    
    // Validate Excel file format if needed
    const fileExt = ('.' + file.name.split('.').pop()?.toLowerCase());
    let inputFile: string;
    
    // Read file buffer once (can only be called once on File object)
    const buffer = await file.arrayBuffer();
    
    if (['.xlsx', '.xls', '.xlsm', '.xlsb'].includes(fileExt)) {
      const isValidExcelFile = await validateExcelFile(Buffer.from(buffer), file.name);
      if (!isValidExcelFile) {
        return NextResponse.json(
          { ok: false, error: `Invalid or corrupted Excel file. The file header doesn't match ${fileExt} format.` },
          { status: 400 }
        );
      }
    }
    
    // Save buffer to temp file
    const inputExt = file.name.split('.').pop();
    inputFile = join(tmpdir(), `input_${Date.now()}.${inputExt}`);
    await writeFile(inputFile, Buffer.from(buffer));
    tempFiles.push(inputFile);
    
    // Generate output filename
    const outputFilename = generateOutputFilename(tool, file.name);
    if (!outputFilename) {
      return NextResponse.json(
        { ok: false, error: 'Could not generate output filename' },
        { status: 500 }
      );
    }
    
    const outputFile = join(tmpdir(), `output_${Date.now()}_${sanitizeFilename(outputFilename)}`);
    tempFiles.push(outputFile);
    
    // Call Python converter via spawn
    const { spawn } = await import('child_process');
    
    const pythonScript = join(process.cwd(), 'python', 'data_convert.py');
    
    // Build arguments safely (no string concatenation to prevent injection)
    const args = [
      tool,           // tool ID
      inputFile,      // input file path
      outputFile,     // output file path
      JSON.stringify(options), // options as JSON string
    ];
    
    // Spawn Python process with timeout
    const result = await new Promise<{
      success: boolean;
      error?: string;
      output?: string;
    }>((resolve) => {
      let timeoutId: NodeJS.Timeout;
      let resolved = false;
      
      console.log(`[DEBUG] Spawning Python: ${pythonScript}`);
      console.log(`[DEBUG] Args: tool=${tool}, inputFile=${inputFile}, outputFile=${outputFile}`);
      
      const process = spawn('python', [pythonScript, ...args]);
      
      let stdout = '';
      let stderr = '';
      
      // Set timeout to 55 seconds (before Next.js 60s limit)
      timeoutId = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          console.error('[ERROR] Conversion timeout - killing process');
          process.kill('SIGKILL');
          resolve({
            success: false,
            error: 'Conversion timeout: Process took longer than 55 seconds. The file might be too large or the conversion is stuck.',
          });
        }
      }, 55000);
      
      process.stdout?.on('data', (data) => {
        stdout += data.toString();
        console.log(`[STDOUT] ${data.toString()}`);
      });
      
      process.stderr?.on('data', (data) => {
        stderr += data.toString();
        console.error(`[STDERR] ${data.toString()}`);
      });
      
      process.on('close', (code) => {
        if (!resolved) {
          resolved = true;
          clearTimeout(timeoutId);
          console.log(`[DEBUG] Process closed with code ${code}`);
          
          if (code === 0) {
            resolve({ success: true });
          } else {
            const errorMsg = stderr.trim() || `Process exited with code ${code}`;
            console.error(`[ERROR] Conversion failed: ${errorMsg}`);
            resolve({
              success: false,
              error: errorMsg,
            });
          }
        }
      });
      
      process.on('error', (err) => {
        if (!resolved) {
          resolved = true;
          clearTimeout(timeoutId);
          console.error(`[ERROR] Process error: ${err.message}`);
          resolve({ success: false, error: `Process error: ${err.message}` });
        }
      });
    });
    
    if (!result.success) {
      return NextResponse.json(
        { ok: false, error: result.error || 'Conversion failed' },
        { status: 500 }
      );
    }
    
    // Read output file
    const outputBuffer = await readFile(outputFile);
    
    // Determine MIME type based on output extension
    const mimeTypes: Record<string, string> = {
      '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      '.xls': 'application/vnd.ms-excel',
      '.csv': 'text/csv',
      '.json': 'application/json',
      '.xml': 'application/xml',
      '.pdf': 'application/pdf',
      '.zip': 'application/zip',
    };
    
    const outputExt = '.' + outputFilename.split('.').pop();
    const mimeType = mimeTypes[outputExt] || 'application/octet-stream';
    
    // Return file as response
    return new NextResponse(outputBuffer, {
      status: 200,
      headers: {
        'Content-Type': mimeType,
        'Content-Disposition': `attachment; filename="${outputFilename}"`,
        'Cache-Control': 'no-store',
      },
    });
    
  } catch (error) {
    console.error('Data conversion error:', error);
    
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
    
  } finally {
    // Cleanup temp files
    for (const file of tempFiles) {
      try {
        await unlink(file);
      } catch (e) {
        // Ignore cleanup errors
      }
    }
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const engine = searchParams.get('engine');
    
    const { dataTools, getToolsByEngine, getToolsByCategory } = await import(
      '@/app/lib/data-tools'
    );
    
    if (engine) {
      const tools = getToolsByEngine(engine as any);
      return NextResponse.json({
        ok: true,
        tools: tools.map(t => ({
          id: t.id,
          title: t.title,
          description: t.description,
        })),
      });
    }
    
    return NextResponse.json({
      ok: true,
      tools: Object.entries(dataTools).map(([id, tool]) => ({
        id,
        title: tool.title,
        description: tool.description,
        engine: tool.engine,
        category: tool.category,
      })),
    });
    
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: 'Failed to fetch tools' },
      { status: 500 }
    );
  }
}
