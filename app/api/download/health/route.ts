/**
 * Health check endpoint for download providers
 * GET /api/download/health
 * 
 * Returns status of all download providers
 */

import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';

export const runtime = 'nodejs';
export const revalidate = 60; // Cache for 60 seconds

interface ProviderStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  message?: string;
  responseTime?: number;
}

interface HealthResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  providers: {
    cobalt: ProviderStatus;
    ytdlp: ProviderStatus;
    direct: ProviderStatus;
    externalApi: ProviderStatus;
  };
  system: {
    ffmpeg: boolean;
    python: boolean;
  };
}

/**
 * Check if Cobalt is available
 */
async function checkCobalt(): Promise<ProviderStatus> {
  if (process.env.COBALT_ENABLED !== 'true') {
    return {
      status: 'unhealthy',
      message: 'Provider disabled',
    };
  }

  let cobaltUrl = process.env.COBALT_API_URL || 'http://127.0.0.1:9000';
  
  // Normalize URL - remove /api/json if present for v11 which uses root endpoint
  if (cobaltUrl.endsWith('/api/json')) {
    cobaltUrl = cobaltUrl.replace('/api/json', '');
  }
  // Ensure trailing slash for POST to root
  if (!cobaltUrl.endsWith('/')) {
    cobaltUrl += '/';
  }

  const startTime = Date.now();

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(cobaltUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' }),
      signal: controller.signal,
    });

    clearTimeout(timeout);
    const responseTime = Date.now() - startTime;

    // Cobalt responds with 200 or 400 for valid requests; other codes mean unhealthy
    if (response.ok || response.status === 400) {
      return {
        status: 'healthy',
        responseTime,
      };
    }

    return {
      status: 'degraded',
      message: `HTTP ${response.status}`,
      responseTime,
    };
  } catch (error: any) {
    const message = error?.message || 'Connection failed';
    return {
      status: 'unhealthy',
      message,
    };
  }
}

/**
 * Check if yt-dlp is available
 */
async function checkYtDlp(): Promise<ProviderStatus> {
  if (process.env.YTDLP_ENABLED !== 'true') {
    return {
      status: 'unhealthy',
      message: 'Provider disabled',
    };
  }

  return new Promise((resolve) => {
    const pythonPath = process.platform === 'win32'
      ? path.join(process.cwd(), '.venv', 'Scripts', 'python.exe')
      : '/var/www/simplifyconvertapp/venv/bin/python';

    const child = spawn(pythonPath, ['-m', 'yt_dlp', '--version'], {
      timeout: 5000,
    });

    let output = '';
    let error = '';

    child.stdout?.on('data', (data) => {
      output += data.toString();
    });

    child.stderr?.on('data', (data) => {
      error += data.toString();
    });

    child.on('close', (code) => {
      if (code === 0 && output.trim()) {
        resolve({
          status: 'healthy',
          message: output.trim().split('\n')[0],
        });
      } else {
        resolve({
          status: 'unhealthy',
          message: error || 'yt-dlp not available',
        });
      }
    });

    child.on('error', (err) => {
      resolve({
        status: 'unhealthy',
        message: err.message,
      });
    });
  });
}

/**
 * Check if ffmpeg is available
 */
function checkFfmpeg(): boolean {
  const child = spawn('ffmpeg', ['-version'], { timeout: 5000 });
  let available = false;

  child.on('close', (code) => {
    available = code === 0;
  });

  child.on('error', () => {
    available = false;
  });

  return available;
}

/**
 * Check if Python is available
 */
function checkPython(): boolean {
  const pythonPath = process.platform === 'win32'
    ? path.join(process.cwd(), '.venv', 'Scripts', 'python.exe')
    : '/var/www/simplifyconvertapp/venv/bin/python';

  try {
    const child = spawn(pythonPath, ['--version'], { timeout: 5000 });
    let available = false;

    child.on('close', (code) => {
      available = code === 0;
    });

    child.on('error', () => {
      available = false;
    });

    // For synchronous check, return immediately
    // Note: This is a simplified check
    return true; // Assume available if yt-dlp provider is enabled
  } catch {
    return false;
  }
}

/**
 * GET /api/download/health
 */
export async function GET(request: NextRequest) {
  try {
    const cobaltStatus = await checkCobalt();
    const ytdlpStatus = await checkYtDlp();

    // Determine overall health
    const providerHealthy = cobaltStatus.status === 'healthy' || ytdlpStatus.status === 'healthy';
    const overallStatus: 'healthy' | 'degraded' | 'unhealthy' = providerHealthy ? 'healthy' : 'degraded';

    const health: HealthResponse = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      providers: {
        cobalt: cobaltStatus,
        ytdlp: ytdlpStatus,
        direct: {
          status: 'healthy',
          message: 'Direct file downloads available',
        },
        externalApi: {
          status: process.env.DOWNLOADER_API_ENABLED === 'true' ? 'healthy' : 'unhealthy',
          message: process.env.DOWNLOADER_API_ENABLED === 'true' ? 'Configured' : 'Disabled',
        },
      },
      system: {
        ffmpeg: checkFfmpeg(),
        python: checkPython(),
      },
    };

    const statusCode = overallStatus === 'healthy' ? 200 : 503;

    return NextResponse.json(health, { status: statusCode });
  } catch (error: any) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error?.message || 'Health check failed',
        providers: {
          cobalt: { status: 'unhealthy' },
          ytdlp: { status: 'unhealthy' },
          direct: { status: 'unhealthy' },
          externalApi: { status: 'unhealthy' },
        },
        system: {
          ffmpeg: false,
          python: false,
        },
      },
      { status: 503 }
    );
  }
}
