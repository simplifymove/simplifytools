import { NextRequest, NextResponse } from 'next/server';
import { writeFile, unlink } from 'fs/promises';
import path from 'path';
import { spawn, exec as execCallback } from 'child_process';
import { promisify } from 'util';
import { v4 as uuidv4 } from 'uuid';
import { getToolById } from '@/app/lib/video-tools';
import { VideoToolErrorType, EmailErrorReport } from '@/app/utils/types/errors';
import { sendErrorEmail } from '@/app/utils/error-reporting/send-error-email';
import { parsePythonError, sanitizeErrorMessage } from '@/app/utils/error-handling/error-handler';

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
      // Don't set PYTHONHOME for venv - it's self-contained and breaks module lookup
      // Only set it for system Python (which we don't use on VPS)
    } as any;
    
    // For venv, add venv lib directory to PYTHONPATH
    if (process.platform !== 'win32') {
      const venvPaths = [
        '/var/www/simplifyconvertapp/venv/lib/python3.12/site-packages',
        '/var/www/simplifyconvertapp/venv/lib/python3.11/site-packages',
        '/var/www/simplifyconvertapp/venv/lib/python3.10/site-packages',
        '/var/www/simplifyconvertapp/venv/lib',
      ];
      spawnEnv.PYTHONPATH = venvPaths.join(':');
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
  let uploadedFilePath: string | null = null;
  let toolId: string | null = null;
  let toolName: string | null = null;

  try {
    // Parse form data
    const formData = await request.formData();
    toolId = formData.get('tool') as string;

    // Validate tool exists
    if (!toolId) {
      return createErrorResponse('Tool ID is required', VideoToolErrorType.API_ERROR, null, null, 400);
    }

    const tool = getToolById(toolId);
    if (!tool) {
      return createErrorResponse('Tool not found', VideoToolErrorType.API_ERROR, toolId, null, 404);
    }

    toolName = tool.title;

    // Extract options from form data
    const options: Record<string, any> = {};
    let fileMetadata: { filename: string; size: number; mimeType: string } | undefined;

    for (const [key, value] of formData.entries()) {
      if (key !== 'tool' && key !== 'file') {
        options[key] = value;
      }
    }

    let inputPath: string | undefined;
    const file = formData.get('file') as File | null;

    // Handle file upload or URL
    if (tool.inputMethod === 'url' || tool.inputMethod === 'both') {
      const url = options.url || (formData.get('url') as string);

      if (url) {
        // Validate URL format
        try {
          new URL(url);
          inputPath = url;
        } catch {
          return createErrorResponse(
            'Invalid URL format',
            VideoToolErrorType.INVALID_URL,
            toolId,
            toolName,
            400
          );
        }
      }
    }

    // File upload validation - required if no URL provided or if tool requires file input
    if (!inputPath) {
      if (!file) {
        return createErrorResponse(
          'File is required',
          VideoToolErrorType.API_ERROR,
          toolId,
          toolName,
          400
        );
      }

      // Validate file is not empty
      if (file.size === 0) {
        return createErrorResponse(
          'Uploaded file is empty',
          VideoToolErrorType.EMPTY_FILE,
          toolId,
          toolName,
          400,
          { filename: file.name, size: 0, mimeType: file.type }
        );
      }

      // Validate file size against tool limits
      const maxSizeMB = 500; // Default max size
      const fileSizeMB = file.size / (1024 * 1024);
      if (fileSizeMB > maxSizeMB) {
        return createErrorResponse(
          `File too large: ${fileSizeMB.toFixed(2)}MB exceeds ${maxSizeMB}MB limit`,
          VideoToolErrorType.FILE_TOO_LARGE,
          toolId,
          toolName,
          400,
          { filename: file.name, size: file.size, mimeType: file.type }
        );
      }

      // Validate file extension
      const ext = '.' + file.name.split('.').pop()?.toLowerCase();
      if (!tool.accepts.includes(ext)) {
        return createErrorResponse(
          `File type ${ext} not supported. Accepted: ${tool.accepts.join(', ')}`,
          VideoToolErrorType.UNSUPPORTED_FORMAT,
          toolId,
          toolName,
          400,
          { filename: file.name, size: file.size, mimeType: file.type }
        );
      }

      fileMetadata = {
        filename: file.name,
        size: file.size,
        mimeType: file.type,
      };

      // Save uploaded file
      const bytes = await file.arrayBuffer();
      const filename = `${uuidv4()}${path.extname(file.name)}`;
      uploadedFilePath = path.join(TEMP_DIR, filename);

      try {
        await writeFile(uploadedFilePath, Buffer.from(bytes));
        inputPath = uploadedFilePath;
      } catch (error) {
        console.error('Failed to save uploaded file:', error);
        return createErrorResponse(
          'Failed to save uploaded file',
          VideoToolErrorType.API_ERROR,
          toolId,
          toolName,
          500,
          fileMetadata
        );
      }
    }

    // Run processing with timeout
    let result;
    try {
      result = await Promise.race([
        runPythonEngine(tool.engine, toolId, inputPath, options),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Processing timeout')), 55000) // 55 second timeout
        ),
      ]);
    } catch (processingError) {
      const errorMsg = processingError instanceof Error ? processingError.message : 'Unknown processing error';

      // Determine error type
      let errorType = VideoToolErrorType.FFMPEG_FAILED;
      if (errorMsg.includes('timeout')) {
        errorType = VideoToolErrorType.PROCESSING_TIMEOUT;
      } else if (errorMsg.includes('memory')) {
        errorType = VideoToolErrorType.MEMORY_ERROR;
      }

      // Parse Python errors if available
      if (errorMsg.includes('Python process failed')) {
        const parsed = parsePythonError(errorMsg);
        errorType = parsed.type;
      }

      // Send error email
      await sendErrorEmail({
        toolId,
        toolName: toolName || 'Unknown',
        errorType,
        errorMessage: errorMsg,
        userMessage: 'Video processing failed. Please try with a different file or contact support.',
        url: request.headers.get('referer') || 'unknown',
        timestamp: new Date().toISOString(),
        fileMeta: fileMetadata
          ? {
              filename: fileMetadata.filename,
              size: `${(fileMetadata.size / 1024 / 1024).toFixed(2)}MB`,
              mimeType: fileMetadata.mimeType,
            }
          : undefined,
        systemInfo: {
          userAgent: request.headers.get('user-agent') || 'unknown',
          platform: 'server',
        },
        stackTrace: errorMsg,
      });

      return createErrorResponse(
        'Video processing failed',
        errorType,
        toolId,
        toolName,
        500,
        fileMetadata
      );
    }

    // Validate output
    const { outputPath, outputType } = result;
    if (!outputPath || !outputType) {
      return createErrorResponse(
        'Invalid processing output',
        VideoToolErrorType.API_ERROR,
        toolId,
        toolName,
        500,
        fileMetadata
      );
    }

    // Handle text output
    if (outputType === 'text' || outputType.includes('text')) {
      try {
        const content = await import('fs/promises').then((m) => m.readFile(outputPath, 'utf-8'));
        return NextResponse.json({ content, type: 'text' }, { status: 200 });
      } catch (error) {
        console.error('Failed to read text output:', error);
        return createErrorResponse(
          'Failed to read processing result',
          VideoToolErrorType.API_ERROR,
          toolId,
          toolName,
          500,
          fileMetadata
        );
      }
    }

    // Handle file output
    try {
      const fs = await import('fs');
      const fileStream = fs.createReadStream(outputPath);
      const contentType = getContentType(outputPath);

      // Create response with proper headers
      const response = new NextResponse(fileStream as any, {
        status: 200,
        headers: {
          'Content-Type': contentType,
          'Content-Disposition': `attachment; filename="${path.basename(outputPath)}"`,
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
      });

      // Schedule cleanup after response is sent
      // In production, use a job queue or cleanup service
      scheduleCleanup(uploadedFilePath, outputPath);

      return response;
    } catch (error) {
      console.error('Failed to send file:', error);
      return createErrorResponse(
        'Failed to prepare download',
        VideoToolErrorType.API_ERROR,
        toolId,
        toolName,
        500,
        fileMetadata
      );
    }
  } catch (error) {
    // Unexpected errors
    console.error('Unexpected API error:', error);

    const errorMsg = error instanceof Error ? error.message : 'Unknown error';

    // Send error email for unexpected errors
    await sendErrorEmail({
      toolId: toolId || 'unknown',
      toolName: toolName || 'Unknown Tool',
      errorType: VideoToolErrorType.UNKNOWN_ERROR,
      errorMessage: errorMsg,
      userMessage: 'An unexpected error occurred. Our team has been notified.',
      url: request.headers.get('referer') || 'unknown',
      timestamp: new Date().toISOString(),
      systemInfo: {
        userAgent: request.headers.get('user-agent') || 'unknown',
        platform: 'server',
      },
      stackTrace: error instanceof Error ? error.stack : undefined,
    }).catch((emailError) => {
      console.error('Failed to send error email:', emailError);
    });

    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}

/**
 * Create standardized error response
 */
function createErrorResponse(
  message: string,
  errorType: VideoToolErrorType,
  toolId: string | null,
  toolName: string | null,
  statusCode: number,
  fileMeta?: { filename: string; size: number; mimeType: string }
): NextResponse {
  const sanitized = sanitizeErrorMessage(message);

  // Log error details to server console for debugging
  console.error('[API Error Response]', {
    toolId,
    toolName,
    errorType,
    message: sanitized,
    statusCode,
    timestamp: new Date().toISOString(),
  });

  return NextResponse.json(
    {
      error: sanitized,
      type: errorType,
      toolId: toolId || 'unknown',
      toolName: toolName || 'Unknown',
      message: sanitized,
      details: {
        timestamp: new Date().toISOString(),
        statusCode,
      },
    },
    { status: statusCode }
  );
}

/**
 * Schedule cleanup of temporary files
 * In production, use a proper job queue or cleanup service
 */
async function scheduleCleanup(uploadedPath?: string | null, outputPath?: string) {
  // Schedule cleanup after 1 hour
  setTimeout(() => {
    cleanup(uploadedPath, outputPath).catch((error) => {
      console.error('Cleanup error:', error);
    });
  }, 3600000); // 1 hour
}

/**
 * Clean up temporary files
 */
async function cleanup(uploadedPath?: string | null, outputPath?: string) {
  const paths = [uploadedPath, outputPath].filter(Boolean) as string[];

  for (const filePath of paths) {
    try {
      await unlink(filePath);
      console.log(`[Cleanup] Removed temporary file: ${filePath}`);
    } catch (error) {
      if ((error as any).code !== 'ENOENT') {
        console.error(`[Cleanup] Failed to remove ${filePath}:`, error);
      }
    }
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


