import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import os from 'os';
import crypto from 'crypto';

export const runtime = 'nodejs';
export const maxDuration = 300; // 5 minutes

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

type DownloadResult =
  | {
      ok: true;
      filePath: string;
      filename: string;
      contentType: string;
      provider: 'local_yt_dlp';
    }
  | {
      ok: true;
      buffer: Buffer;
      filename: string;
      contentType: string;
      provider: 'external_api';
    }
  | {
      ok: false;
      error: string;
      details?: string;
      shouldFallback?: boolean;
    };

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function getPythonPath(): string {
  return (
    process.env.PYTHON_PATH ||
    (process.platform === 'win32'
      ? 'python'
      : '/var/www/simplifyconvertapp/venv/bin/python')
  );
}

function isValidUrl(input: string): boolean {
  try {
    const url = new URL(input);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

function isYouTubeUrl(input: string): boolean {
  try {
    const host = new URL(input).hostname.toLowerCase();
    return (
      host.includes('youtube.com') ||
      host.includes('youtu.be') ||
      host.includes('music.youtube.com')
    );
  } catch {
    return false;
  }
}

function shouldFallbackToExternal(stderr: string): boolean {
  const text = stderr.toLowerCase();

  return (
    text.includes('sign in to confirm') ||
    text.includes('not a bot') ||
    text.includes('requested format is not available') ||
    text.includes('n challenge') ||
    text.includes('signature') ||
    text.includes('unable to extract') ||
    text.includes('confirm your age') ||
    text.includes('login') ||
    text.includes('cookies') ||
    text.includes('403') ||
    text.includes('429') ||
    text.includes('blocked')
  );
}

function safeFilename(name: string): string {
  return name
    .replace(/[^\w.\-() ]+/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 160);
}

function runCommand(
  command: string,
  args: string[],
  options: {
    cwd?: string;
    timeout?: number;
    env?: NodeJS.ProcessEnv;
  } = {}
): Promise<{ stdout: string; stderr: string }> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: options.cwd || process.cwd(),
      env: options.env || process.env,
      shell: false,
    });

    let stdout = '';
    let stderr = '';

    const timer = setTimeout(() => {
      child.kill('SIGKILL');
      reject(new Error(`Process timeout after ${options.timeout}ms`));
    }, options.timeout || 180000);

    child.stdout?.on('data', (data) => {
      stdout += data.toString();
    });

    child.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    child.on('error', (error) => {
      clearTimeout(timer);
      reject(error);
    });

    child.on('close', (code) => {
      clearTimeout(timer);

      if (code === 0) {
        resolve({ stdout, stderr });
      } else {
        const err = new Error(`Process exited with code ${code}`);
        (err as any).stdout = stdout;
        (err as any).stderr = stderr;
        reject(err);
      }
    });
  });
}

// ============================================================================
// LOCAL YT-DLP DOWNLOADER
// ============================================================================

async function tryLocalYtDlp(url: string): Promise<DownloadResult> {
  const pythonExe = getPythonPath();

  const tmpDir = path.join(os.tmpdir(), 'simplifyconvert-downloads');
  try {
    fs.mkdirSync(tmpDir, { recursive: true });
  } catch {
    // Directory might already exist
  }

  const id = crypto.randomUUID();
  const outputTemplate = path.join(tmpDir, `${id}.%(ext)s`);

  const args = [
    '-m',
    'yt_dlp',
    '--no-playlist',
    '--js-runtimes',
    'node',
    '--force-ipv4',
    '--retries',
    '3',
    '--fragment-retries',
    '3',
    '--socket-timeout',
    '30',
    '--user-agent',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36',
    '-f',
    'bv*[ext=mp4]+ba[ext=m4a]/b[ext=mp4]/bv*+ba/best',
    '--merge-output-format',
    'mp4',
    '-o',
    outputTemplate,
  ];

  // Add cookies if available
  if (
    process.env.YTDLP_COOKIES_PATH &&
    fs.existsSync(process.env.YTDLP_COOKIES_PATH)
  ) {
    args.push('--cookies', process.env.YTDLP_COOKIES_PATH);
  }

  args.push(url);

  // Clean environment - remove conflicting Python variables
  const cleanEnv = { ...process.env };
  delete cleanEnv.PYTHONHOME;

  try {
    console.log('[download] Attempting local yt-dlp download');
    await runCommand(pythonExe, args, {
      cwd: process.cwd(),
      timeout: 300000, // 5 minutes
      env: cleanEnv,
    });

    // Find the downloaded file
    const files = fs
      .readdirSync(tmpDir)
      .filter((file) => file.startsWith(id + '.'))
      .map((file) => path.join(tmpDir, file));

    if (!files.length) {
      return {
        ok: false,
        error: 'Download completed but no output file was created.',
      };
    }

    const filePath = files[0];
    const ext = path.extname(filePath).toLowerCase();

    console.log('[download] Local yt-dlp succeeded, file:', filePath);

    return {
      ok: true,
      filePath,
      filename: safeFilename(`download${ext || '.mp4'}`),
      contentType: ext === '.mp3' ? 'audio/mpeg' : 'video/mp4',
      provider: 'local_yt_dlp',
    };
  } catch (error: any) {
    const stderr = error?.stderr || error?.message || '';

    console.error('[download] local yt-dlp failed:', stderr.substring(0, 500));

    return {
      ok: false,
      error: 'Local downloader failed.',
      details: stderr,
      shouldFallback: shouldFallbackToExternal(stderr),
    };
  }
}

// ============================================================================
// EXTERNAL DOWNLOADER API FALLBACK
// ============================================================================

async function tryExternalApi(url: string): Promise<DownloadResult> {
  if (process.env.DOWNLOADER_API_ENABLED !== 'true') {
    return {
      ok: false,
      error: 'External downloader API is disabled.',
    };
  }

  if (!process.env.DOWNLOADER_API_URL || !process.env.DOWNLOADER_API_KEY) {
    return {
      ok: false,
      error: 'External downloader API is not configured.',
    };
  }

  try {
    console.log('[download] Attempting external downloader API');

    const apiResponse = await fetch(process.env.DOWNLOADER_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.DOWNLOADER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url,
        format: 'mp4',
        quality: 'best',
      }),
    });

    if (!apiResponse.ok) {
      const text = await apiResponse.text();
      console.error('[download] external API HTTP error:', apiResponse.status, text);
      return {
        ok: false,
        error: 'External downloader API returned error.',
        details: text.substring(0, 500),
      };
    }

    const data = await apiResponse.json();

    /**
     * Expected external API response formats:
     *
     * Format A - Direct URL:
     * {
     *   "downloadUrl": "https://...",
     *   "filename": "video.mp4",
     *   "contentType": "video/mp4"
     * }
     *
     * Format B - Base64 data:
     * {
     *   "base64": "...",
     *   "filename": "video.mp4",
     *   "contentType": "video/mp4"
     * }
     */

    if (data.downloadUrl) {
      console.log('[download] External API returned downloadUrl');

      const fileResponse = await fetch(data.downloadUrl);

      if (!fileResponse.ok) {
        return {
          ok: false,
          error: 'External API returned a download URL but file fetch failed.',
          details: `HTTP ${fileResponse.status}`,
        };
      }

      const arrayBuffer = await fileResponse.arrayBuffer();

      return {
        ok: true,
        buffer: Buffer.from(arrayBuffer),
        filename: safeFilename(data.filename || 'download.mp4'),
        contentType: data.contentType || 'video/mp4',
        provider: 'external_api',
      };
    }

    if (data.base64) {
      console.log('[download] External API returned base64 data');

      return {
        ok: true,
        buffer: Buffer.from(data.base64, 'base64'),
        filename: safeFilename(data.filename || 'download.mp4'),
        contentType: data.contentType || 'video/mp4',
        provider: 'external_api',
      };
    }

    return {
      ok: false,
      error: 'External API response did not contain downloadable content.',
      details: JSON.stringify(data).substring(0, 500),
    };
  } catch (error: any) {
    console.error('[download] external API exception:', error?.message);

    return {
      ok: false,
      error: 'External downloader API request failed.',
      details: error?.message || String(error),
    };
  }
}

// ============================================================================
// RESPONSE HANDLER
// ============================================================================

function fileResponse(result: Extract<DownloadResult, { ok: true }>) {
  if ('filePath' in result) {
    // Local file - read and cleanup
    const buffer = fs.readFileSync(result.filePath);

    try {
      fs.unlinkSync(result.filePath);
    } catch (e) {
      console.warn('[download] Failed to cleanup temp file:', result.filePath);
    }

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        'Content-Type': result.contentType,
        'Content-Disposition': `attachment; filename="${result.filename}"`,
        'X-Download-Provider': result.provider,
        'Cache-Control': 'no-store',
      },
    });
  }

  // Buffer from external API
  return new NextResponse(new Uint8Array(result.buffer), {
    status: 200,
    headers: {
      'Content-Type': result.contentType,
      'Content-Disposition': `attachment; filename="${result.filename}"`,
      'X-Download-Provider': result.provider,
      'Cache-Control': 'no-store',
    },
  });
}

// ============================================================================
// MAIN ENDPOINT
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    let url = '';

    // Parse request body or form data
    const contentType = request.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      const body = await request.json();
      url = body.url || '';
    } else {
      const formData = await request.formData();
      url = String(formData.get('url') || '');
    }

    // Validate URL
    if (!url || !isValidUrl(url)) {
      return NextResponse.json(
        { error: 'Please provide a valid URL.' },
        { status: 400 }
      );
    }

    console.log('[download] Request for URL:', new URL(url).hostname);

    // Try local yt-dlp first
    const localResult = await tryLocalYtDlp(url);

    if (localResult.ok) {
      return fileResponse(localResult);
    }

    // Decide whether to fallback to external API
    const shouldUseExternal =
      localResult.shouldFallback === true ||
      isYouTubeUrl(url) ||
      process.env.DOWNLOADER_API_ENABLED === 'true';

    if (shouldUseExternal) {
      console.log('[download] Local download failed, attempting fallback to external API');

      const externalResult = await tryExternalApi(url);

      if (externalResult.ok) {
        return fileResponse(externalResult);
      }

      // Both methods failed
      return NextResponse.json(
        {
          error: 'Download failed from both local downloader and external provider.',
          localError: localResult.details || localResult.error,
          externalError: externalResult.details || externalResult.error,
        },
        { status: 502 }
      );
    }

    // No fallback enabled, return local error
    return NextResponse.json(
      {
        error: localResult.error,
        details: localResult.details,
      },
      { status: 500 }
    );
  } catch (error: any) {
    console.error('[download] Unexpected error:', error);

    return NextResponse.json(
      {
        error: 'Unexpected download server error.',
        details: error?.message || String(error),
      },
      { status: 500 }
    );
  }
}
