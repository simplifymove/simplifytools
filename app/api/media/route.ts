import { NextRequest, NextResponse } from 'next/server';
import { writeFile, unlink } from 'fs/promises';
import path from 'path';
import { spawn, exec as execCallback } from 'child_process';
import { promisify } from 'util';
import { v4 as uuidv4 } from 'uuid';
import { getToolById } from '@/app/lib/video-tools';

const exec = promisify(execCallback);

// Temporary directory for processing
const TEMP_DIR = path.join(process.cwd(), 'tmp');
const OUTPUT_DIR = path.join(process.cwd(), 'tmp/output');

// Max request execution time (seconds)
export const maxDuration = 60;

// Note: bodyParser config is handled by Next.js automatically in App Router
// For file uploads up to 500mb, ensure proper middleware is configured

async function runPythonEngine(
  engine: string,
  toolId: string,
  inputPath: string,
  options: Record<string, any>
): Promise<{ outputPath: string; outputType: string }> {
  return new Promise((resolve, reject) => {
    const pythonScript = path.join(process.cwd(), 'python', 'media_router.py');
    const args = [
      engine,
      toolId,
      inputPath,
      JSON.stringify(options),
    ];

    const pythonExe = process.platform === 'win32' ? 'python' : '/var/www/simplifyconvertapp/venv/bin/python';
    
    // Build environment with Python-specific variables
    const spawnEnv = {
      ...process.env,
      PYTHONUNBUFFERED: '1',
      PYTHONDONTWRITEBYTECODE: '1',
      PYTHONHOME: '/usr',  // System Python home for VPS
    } as any;
    
    // Explicitly set PYTHONPATH for VPS deployment (Linux uses dist-packages)
    if (process.platform !== 'win32') {
      const pythonPaths = [
        '/usr/lib/python3/dist-packages',
        '/usr/lib/python3.12/dist-packages',
        '/usr/lib/python3.11/dist-packages',
        '/usr/lib/python3.10/dist-packages',
        '/usr/local/lib/python3.12/site-packages',
        '/usr/local/lib/python3.11/site-packages',
        '/usr/local/lib/python3.10/site-packages',
      ];
      spawnEnv.PYTHONPATH = pythonPaths.join(':');
    }
    
    const python = spawn(pythonExe, [pythonScript, ...args], {
      env: spawnEnv,
    });

    let stdout = '';
    let stderr = '';

    python.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    python.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    python.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Python process failed: ${stderr}`));
        return;
      }

      try {
        const result = JSON.parse(stdout);
        resolve(result);
      } catch (e) {
        reject(new Error(`Invalid Python output: ${stdout}`));
      }
    });
  });
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const toolId = formData.get('tool') as string;
    const tool = getToolById(toolId);

    if (!tool) {
      return NextResponse.json(
        { error: 'Tool not found' },
        { status: 404 }
      );
    }

    // Extract options
    const options: Record<string, any> = {};
    for (const [key, value] of formData.entries()) {
      if (key !== 'tool' && key !== 'file') {
        options[key] = value;
      }
    }

    let inputPath: string;

    // Handle file upload or URL
    if (tool.inputMethod === 'url' || tool.inputMethod === 'both') {
      inputPath = options.url || (formData.get('url') as string);
      if (!inputPath) {
        return NextResponse.json(
          { error: 'URL required for this tool' },
          { status: 400 }
        );
      }
    } else {
      // File upload
      const file = formData.get('file') as File;
      if (!file) {
        return NextResponse.json(
          { error: 'File required for this tool' },
          { status: 400 }
        );
      }

      const bytes = await file.arrayBuffer();
      const filename = `${uuidv4()}${path.extname(file.name)}`;
      inputPath = path.join(TEMP_DIR, filename);

      await writeFile(inputPath, Buffer.from(bytes));
    }

    // Run the Python engine
    const result = await runPythonEngine(
      tool.engine,
      toolId,
      inputPath,
      options
    );

    // Read the output file and return it
    const { outputPath, outputType } = result;

    if (outputType === 'text' || outputType.includes('text')) {
      // Return text content
      const content = await import('fs/promises').then(m => m.readFile(outputPath, 'utf-8'));
      return NextResponse.json({ content, type: 'text' });
    } else {
      // Return downloadable file
      const fs = await import('fs');
      const fileStream = fs.createReadStream(outputPath);
      const contentType = getContentType(outputPath);

      const response = new NextResponse(fileStream as any, {
        headers: {
          'Content-Type': contentType,
          'Content-Disposition': `attachment; filename="${path.basename(outputPath)}"`,
        },
      });

      // Clean up after sending
      response.headers.set('X-Cleanup-Path', outputPath);

      return response;
    }
  } catch (error) {
    console.error('Media processing error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Processing failed' },
      { status: 500 }
    );
  }
}

function getContentType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  const contentTypes: Record<string, string> = {
    '.mp4': 'video/mp4',
    '.mov': 'video/quicktime',
    '.avi': 'video/x-msvideo',
    '.mkv': 'video/x-matroska',
    '.webm': 'video/webm',
    '.mp3': 'audio/mpeg',
    '.wav': 'audio/wav',
    '.aac': 'audio/aac',
    '.flac': 'audio/flac',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.txt': 'text/plain',
    '.srt': 'application/x-subrip',
    '.vtt': 'text/vtt',
    '.json': 'application/json',
  };
  return contentTypes[ext] || 'application/octet-stream';
}

