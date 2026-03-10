import { NextRequest, NextResponse } from 'next/server';
import { writeFile, unlink } from 'fs/promises';
import path from 'path';
import { spawn } from 'child_process';
import { promisify } from 'util';
import { v4 as uuidv4 } from 'uuid';
import { getToolById } from '@/app/lib/video-tools';

const exec = promisify(require('child_process').exec);

// Temporary directory for processing
const TEMP_DIR = path.join(process.cwd(), 'tmp');
const OUTPUT_DIR = path.join(process.cwd(), 'tmp/output');

// Max request execution time (seconds)
export const maxDuration = 60;

// Max request body size
export const bodyParser = {
  sizeLimit: '500mb',
};

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

    const python = spawn('python', [pythonScript, ...args], {
      env: { ...process.env, PYTHONUNBUFFERED: '1' },
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
      const fs = require('fs').promises;
      const content = await fs.readFile(outputPath, 'utf-8');
      return NextResponse.json({ content, type: 'text' });
    } else {
      // Return downloadable file
      const fs = require('fs');
      const fileStream = fs.createReadStream(outputPath);
      const contentType = getContentType(outputPath);

      const response = new NextResponse(fileStream, {
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
