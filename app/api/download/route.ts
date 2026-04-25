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
// RATE LIMITING & GLOBAL QUEUE
// ============================================================================

let lastYouTubeDownloadTime = 0;
const COOLDOWN_MS = 15000; // 15 seconds between YouTube downloads

// Global queue for sequential YouTube downloads (only 1 yt-dlp process at a time)
let youtubeDownloadInProgress = false;
const youtubeWaiters: Array<() => void> = [];

async function acquireYoutubeSlot(): Promise<void> {
  while (youtubeDownloadInProgress) {
    // Wait until the current download completes
    await new Promise<void>((resolve) => {
      youtubeWaiters.push(() => resolve());
    });
  }
  youtubeDownloadInProgress = true;
}

function releaseYoutubeSlot(): void {
  youtubeDownloadInProgress = false;
  const waiter = youtubeWaiters.shift();
  if (waiter) {
    waiter();
  }
}

async function enforceYouTubeCooldown(): Promise<void> {
  const now = Date.now();
  const timeSinceLastDownload = now - lastYouTubeDownloadTime;

  if (timeSinceLastDownload < COOLDOWN_MS) {
    const waitTime = COOLDOWN_MS - timeSinceLastDownload;
    console.log(`[rate-limit] Waiting ${waitTime}ms before next YouTube download`);
    await new Promise<void>((resolve) => setTimeout(resolve, waitTime));
  }

  lastYouTubeDownloadTime = Date.now();
}

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

function normalizeYoutubeUrl(input: string): string {
  try {
    const url = new URL(input);
    const host = url.hostname.toLowerCase();

    if (host.includes('youtube.com')) {
      const videoId = url.searchParams.get('v');
      if (videoId) return `https://www.youtube.com/watch?v=${videoId}`;
    }

    if (host.includes('youtu.be')) {
      const videoId = url.pathname.replace('/', '').split('?')[0];
      if (videoId) return `https://www.youtube.com/watch?v=${videoId}`;
    }

    return input;
  } catch {
    return input;
  }
}

function shouldFallbackToExternal(stderr: string): boolean {
  const text = stderr.toLowerCase();

  // Check for conditions that warrant fallback to external API
  return (
    text.includes('http error 429') ||
    text.includes('too many requests') ||
    text.includes('sign in to confirm') ||
    text.includes('not a bot') ||
    text.includes('rate-limited') ||
    text.includes('requested format is not available') ||
    text.includes('n challenge') ||
    text.includes('unable to extract')
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

async function tryLocalYtDlp(url: string, formatId?: string): Promise<DownloadResult> {
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
    '--sleep-interval',
    '3',
    '--max-sleep-interval',
    '6',
    '--retries',
    '1',
    '--fragment-retries',
    '1',
    '--socket-timeout',
    '30',
    '--user-agent',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36',
    '-f',
    formatId || 'bv*[ext=mp4]+ba[ext=m4a]/b[ext=mp4]/bv*+ba/best',
    '--merge-output-format',
    'mp4',
    '-o',
    outputTemplate,
  ];

  // Add cookies if available (do not log path)
  if (
    process.env.YTDLP_COOKIES_PATH &&
    fs.existsSync(process.env.YTDLP_COOKIES_PATH)
  ) {
    args.push('--cookies', process.env.YTDLP_COOKIES_PATH);
    console.log('[download] Using yt-dlp cookies file');
  }

  // Add proxy if enabled and configured (do not log proxy URL)
  if (
    process.env.YTDLP_PROXY_ENABLED === 'true' &&
    process.env.YTDLP_PROXY_URL
  ) {
    args.push('--proxy', process.env.YTDLP_PROXY_URL);
    console.log('[download] Using yt-dlp proxy');
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
// QUALITY SELECTION UTILITIES
// ============================================================================

function getQualityOrder(): string[] {
  return ['1080p', '720p', '480p', '360p', '240p'];
}

function extractQuality(label: string): string | null {
  const match = label.match(/(\d+)p/);
  return match ? match[1] + 'p' : null;
}

function findBestStream(
  streams: any[],
  selectedQuality?: string
): { url: string; quality: string } | null {
  if (!Array.isArray(streams) || streams.length === 0) {
    return null;
  }

  // Filter for mp4 streams with both video and audio
  const mp4Streams = streams.filter((stream: any) => {
    const hasAudio = stream.hasAudio || stream.audio;
    const hasVideo = stream.hasVideo || stream.video;
    const isMp4 =
      (stream.mimeType && stream.mimeType.includes('mp4')) ||
      (stream.format && stream.format.toLowerCase().includes('mp4')) ||
      (stream.type && stream.type.toLowerCase().includes('mp4'));

    return isMp4 && hasAudio && hasVideo;
  });

  if (mp4Streams.length === 0) {
    return null;
  }

  // If a specific quality was selected, try to find closest match
  if (selectedQuality) {
    const qualityOrder = getQualityOrder();
    const selectedIndex = qualityOrder.indexOf(selectedQuality);

    if (selectedIndex !== -1) {
      // Look for exact match first, then fallback to closest lower quality
      for (let i = selectedIndex; i < qualityOrder.length; i++) {
        const targetQuality = qualityOrder[i];
        const match = mp4Streams.find((stream: any) => {
          const quality = extractQuality(stream.label || stream.quality || '');
          return quality === targetQuality;
        });
        if (match) {
          return {
            url: match.url,
            quality: targetQuality,
          };
        }
      }
    }
  }

  // Default: return highest quality (usually first)
  const best = mp4Streams[0];
  return {
    url: best.url,
    quality: extractQuality(best.label || best.quality || '') || 'best',
  };
}

// ============================================================================
// EXTERNAL DOWNLOADER API FALLBACK (RapidAPI)
// ============================================================================

async function tryExternalApi(url: string, selectedQuality?: string): Promise<DownloadResult> {
  if (process.env.DOWNLOADER_API_ENABLED !== 'true') {
    return {
      ok: false,
      error: 'External downloader API is disabled.',
    };
  }

  // Check for RapidAPI configuration
  const apiHost = process.env.DOWNLOADER_API_HOST;
  const apiKey = process.env.DOWNLOADER_API_KEY;
  const apiUrl = process.env.DOWNLOADER_API_URL ||
    'https://youtube-video-download-api.p.rapidapi.com/get-stream-info/';

  if (!apiHost || !apiKey) {
    return {
      ok: false,
      error: 'RapidAPI configuration is incomplete.',
    };
  }

  try {
    console.log('[download] Attempting external API (RapidAPI)');

    const apiResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-rapidapi-host': apiHost,
        'x-rapidapi-key': apiKey,
      },
      body: JSON.stringify({ url }),
    });

    if (!apiResponse.ok) {
      const text = await apiResponse.text();
      console.error('[download] external API HTTP error:', apiResponse.status);
      return {
        ok: false,
        error: 'External API request failed.',
        details: text.substring(0, 500),
      };
    }

    const data = await apiResponse.json();
    console.log('[download] External API response received');

    // ========================================
    // Parse RapidAPI response flexibly
    // ========================================

    let streamUrl: string | null = null;
    let selectedFormat = selectedQuality || '720p';

    // Format 1: Direct URL in response
    if (data.url && typeof data.url === 'string') {
      streamUrl = data.url;
      console.log('[download] Using direct URL from API response');
    } else if (data.downloadUrl && typeof data.downloadUrl === 'string') {
      streamUrl = data.downloadUrl;
      console.log('[download] Using downloadUrl from API response');
    }

    // Format 2: Streams/formats array (RapidAPI typical response)
    if (!streamUrl && (data.streams || data.formats)) {
      const streamsArray = data.streams || data.formats;
      const bestStream = findBestStream(streamsArray, selectedQuality);

      if (bestStream) {
        streamUrl = bestStream.url;
        selectedFormat = bestStream.quality;
        console.log(`[download] Selected stream quality: ${selectedFormat}`);
      }
    }

    // Format 3: Nested structure with data object
    if (!streamUrl && data.data) {
      if (data.data.url) {
        streamUrl = data.data.url;
        console.log('[download] Using URL from data object');
      } else if (data.data.streams || data.data.formats) {
        const streamsArray = data.data.streams || data.data.formats;
        const bestStream = findBestStream(streamsArray, selectedQuality);

        if (bestStream) {
          streamUrl = bestStream.url;
          selectedFormat = bestStream.quality;
          console.log(`[download] Selected stream quality: ${selectedFormat}`);
        }
      }
    }

    if (!streamUrl) {
      return {
        ok: false,
        error: 'API response does not contain a valid download stream.',
        details: 'No URL found in streams, formats, or direct response.',
      };
    }

    // ========================================
    // Fetch the stream from the URL
    // ========================================

    console.log('[download] Fetching stream from external source');

    const streamResponse = await fetch(streamUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36',
      },
    });

    if (!streamResponse.ok) {
      return {
        ok: false,
        error: 'Failed to fetch stream from external API.',
        details: `HTTP ${streamResponse.status}`,
      };
    }

    const arrayBuffer = await streamResponse.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    console.log('[download] External API download successful');

    return {
      ok: true,
      buffer,
      filename: safeFilename(`download-${selectedFormat}.mp4`),
      contentType: 'video/mp4',
      provider: 'external_api',
    };
  } catch (error: any) {
    console.error('[download] external API exception:', error?.message);

    return {
      ok: false,
      error: 'External API request failed.',
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
    let formatId: string | undefined;

    // Parse request body or form data
    const contentType = request.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      const body = await request.json();
      url = body.url || '';
      formatId = body.formatId || body.format;
    } else {
      const formData = await request.formData();
      url = String(formData.get('url') || '');
      const formFormatId = String(formData.get('formatId') || formData.get('format') || '');
      formatId = formFormatId || undefined;
    }

    // Validate URL
    if (!url || !isValidUrl(url)) {
      return NextResponse.json(
        { error: 'Please provide a valid URL.' },
        { status: 400 }
      );
    }

    // Normalize YouTube URLs (remove playlist params, etc)
    if (isYouTubeUrl(url)) {
      url = normalizeYoutubeUrl(url);
      
      // Acquire exclusive slot for YouTube download (only 1 at a time)
      console.log('[download] Acquiring YouTube download slot');
      await acquireYoutubeSlot();
      
      try {
        // Enforce cooldown before processing
        console.log('[download] Enforcing YouTube cooldown (15 seconds)');
        await enforceYouTubeCooldown();
        
        const externalEnabled = process.env.DOWNLOADER_API_ENABLED === 'true';
        const localResult = await tryLocalYtDlp(url, formatId);
        
        if (localResult.ok) {
          return fileResponse(localResult);
        }
        
        if (!externalEnabled) {
          return NextResponse.json(
            {
              error: 'Download failed.',
              details: localResult.details || localResult.error,
              provider: 'local_yt_dlp',
            },
            { status: 500 }
          );
        }
        
        const externalResult = await tryExternalApi(url, formatId);
        if (externalResult.ok) {
          return fileResponse(externalResult);
        }
        
        return NextResponse.json(
          {
            error: 'Download failed from both local downloader and external provider.',
            localError: localResult.details || localResult.error,
            externalError: externalResult.details || externalResult.error,
          },
          { status: 502 }
        );
      } finally {
        releaseYoutubeSlot();
      }
    }

    console.log('[download] Request for URL:', new URL(url).hostname);
    if (formatId) {
      console.log('[download] Using selected format:', formatId);
    }

    // Check if external API is enabled
    const externalEnabled = process.env.DOWNLOADER_API_ENABLED === 'true';
    console.log('[download] External API enabled:', externalEnabled);

    // Try local yt-dlp first
    const localResult = await tryLocalYtDlp(url, formatId);

    if (localResult.ok) {
      return fileResponse(localResult);
    }

    // Local download failed
    console.log('[download] Local download failed:', localResult.error);

    // If external API is disabled, return local error only
    if (!externalEnabled) {
      console.log('[download] External API disabled, returning local error');
      return NextResponse.json(
        {
          error: 'Download failed.',
          details: localResult.details || localResult.error,
          provider: 'local_yt_dlp',
        },
        { status: 500 }
      );
    }

    // External API is enabled, try it as fallback
    console.log('[download] Local failed, attempting fallback to external API');
    const externalResult = await tryExternalApi(url, formatId);

    if (externalResult.ok) {
      return fileResponse(externalResult);
    }

    // Both methods failed
    console.log('[download] Both local and external API failed');
    return NextResponse.json(
      {
        error: 'Download failed from both local downloader and external provider.',
        localError: localResult.details || localResult.error,
        externalError: externalResult.details || externalResult.error,
      },
      { status: 502 }
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
