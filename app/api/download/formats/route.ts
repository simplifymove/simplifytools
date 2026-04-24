import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import fs from 'fs';

export const runtime = 'nodejs';
export const maxDuration = 120; // 2 minutes

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface YtDlpFormat {
  format_id: string;
  format: string;
  ext: string;
  height?: number;
  width?: number;
  vcodec: string;
  acodec: string;
  filesize?: number;
  filesize_approx?: number;
  abr?: number;
  tbr?: number;
  fps?: number;
}

interface YtDlpInfo {
  id: string;
  title: string;
  thumbnail?: string;
  duration?: number;
  formats?: YtDlpFormat[];
}

interface FormatOption {
  label: string;
  formatId: string;
  height?: number;
  ext: string;
  filesize: number | null;
}

interface FormatsResponse {
  title: string;
  thumbnail?: string;
  duration?: number;
  videoOptions: FormatOption[];
  audioOptions: FormatOption[];
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
    }, options.timeout || 120000);

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
// FORMAT DISCOVERY
// ============================================================================

async function discoverFormats(url: string): Promise<FormatsResponse> {
  const pythonExe = getPythonPath();

  const args = [
    '-m',
    'yt_dlp',
    '--dump-single-json',
    '--no-download',
    '--js-runtimes',
    'node',
    '--force-ipv4',
    '--socket-timeout',
    '30',
    '--user-agent',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36',
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
  delete cleanEnv.PYTHONPATH;

  try {
    console.log('[formats] Fetching formats for:', new URL(url).hostname);

    const { stdout } = await runCommand(pythonExe, args, {
      cwd: process.cwd(),
      timeout: 120000, // 2 minutes
      env: cleanEnv,
    });

    const info: YtDlpInfo = JSON.parse(stdout);

    if (!info.formats || !Array.isArray(info.formats)) {
      throw new Error('No formats found in response');
    }

    console.log(`[formats] Found ${info.formats.length} total formats`);

    // Parse video and audio formats
    const audioFormats = info.formats
      .filter(
        (f: YtDlpFormat) =>
          f.acodec !== 'none' && (f.vcodec === 'none' || !f.vcodec)
      )
      .sort((a: YtDlpFormat, b: YtDlpFormat) => (b.abr || 0) - (a.abr || 0));

    const bestAudio = audioFormats[0];

    const videoFormats = info.formats
      .filter(
        (f: YtDlpFormat) =>
          f.vcodec !== 'none' && f.vcodec && f.height && f.height > 0
      )
      .sort((a: YtDlpFormat, b: YtDlpFormat) => (b.height || 0) - (a.height || 0));

    // Build video options
    const seen = new Set<string>();
    const videoOptions: FormatOption[] = [];

    // Add "Best" option first
    if (videoFormats.length > 0) {
      const best = videoFormats[0];
      const hasAudio = best.acodec && best.acodec !== 'none';
      const formatId = hasAudio
        ? String(best.format_id)
        : bestAudio
          ? `${best.format_id}+${bestAudio.format_id}`
          : String(best.format_id);

      videoOptions.push({
        label: 'Best MP4',
        formatId,
        height: best.height,
        ext: best.ext || 'mp4',
        filesize: best.filesize || best.filesize_approx || null,
      });

      seen.add(`best`);
    }

    // Add resolution options
    for (const f of videoFormats) {
      const height = f.height;
      const ext = f.ext || 'mp4';

      const key = `${height}-${ext}`;
      if (seen.has(key)) continue;
      seen.add(key);

      const hasAudio = f.acodec && f.acodec !== 'none';
      const formatId = hasAudio
        ? String(f.format_id)
        : bestAudio
          ? `${f.format_id}+${bestAudio.format_id}`
          : String(f.format_id);

      videoOptions.push({
        label: `${height}p ${ext.toUpperCase()}`,
        formatId,
        height,
        ext,
        filesize: f.filesize || f.filesize_approx || null,
      });
    }

    // Build audio options
    const audioOptions: FormatOption[] = [];
    const audioSeen = new Set<string>();

    for (const f of audioFormats) {
      const ext = f.ext || 'mp3';
      const bitrate = f.abr ? Math.round(f.abr) : f.tbr ? Math.round(f.tbr) : 0;

      const key = `${ext}-${bitrate}`;
      if (audioSeen.has(key)) continue;
      audioSeen.add(key);

      const label =
        bitrate > 0
          ? `${ext.toUpperCase()} - ${bitrate}k`
          : `${ext.toUpperCase()}`;

      audioOptions.push({
        label,
        formatId: String(f.format_id),
        ext,
        filesize: f.filesize || f.filesize_approx || null,
      });
    }

    console.log(
      `[formats] Generated ${videoOptions.length} video and ${audioOptions.length} audio options`
    );

    return {
      title: info.title || 'Download',
      thumbnail: info.thumbnail,
      duration: info.duration,
      videoOptions,
      audioOptions,
    };
  } catch (error: any) {
    console.error('[formats] Error:', error?.message || String(error));

    throw new Error(
      `Failed to fetch formats: ${error?.message || 'Unknown error'}`
    );
  }
}

// ============================================================================
// MAIN ENDPOINT
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    let url = '';

    // Parse request body
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

    // Discover formats
    const result = await discoverFormats(url);

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.error('[formats] Endpoint error:', error?.message);

    return NextResponse.json(
      {
        error: error?.message || 'Failed to fetch formats',
      },
      { status: 500 }
    );
  }
}
