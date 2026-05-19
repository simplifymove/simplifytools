/**
 * yt-dlp provider - improved with better controls
 * Handles YouTube, Vimeo, Facebook, SoundCloud, and as fallback
 */

import { BaseProvider, DownloadOptions, DownloadResult, DownloadError } from './types';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import os from 'os';

// Global rate limiting for yt-dlp
let ytdlpInProgress = 0;
const ytdlpQueue: Array<() => void> = [];
const MAX_CONCURRENT = 1; // Only 1 yt-dlp process at a time

interface YtDlpQueueItem {
  resolve: () => void;
}

async function acquireYtDlpSlot(): Promise<void> {
  while (ytdlpInProgress >= MAX_CONCURRENT) {
    await new Promise<void>((resolve) => {
      ytdlpQueue.push(() => resolve());
    });
  }
  ytdlpInProgress++;
}

function releaseYtDlpSlot(): void {
  ytdlpInProgress--;
  const waiter = ytdlpQueue.shift();
  if (waiter) {
    waiter();
  }
}

export class YtDlpProvider extends BaseProvider {
  name = 'ytdlp' as const;

  isSupported(url: string): boolean {
    // yt-dlp supports many platforms
    const supportedDomains = [
      'youtube.com', 'youtu.be',
      'vimeo.com',
      'facebook.com',
      'soundcloud.com',
      'instagram.com', // as fallback
      'tiktok.com', // as fallback
      'twitter.com', 'x.com', // as fallback
    ];

    try {
      const urlObj = new URL(url);
      return supportedDomains.some(domain => urlObj.hostname?.includes(domain));
    } catch {
      return false;
    }
  }

  async download(options: DownloadOptions): Promise<DownloadResult | DownloadError> {
    const startTime = Date.now();
    const { url, maxFileSizeMB = 500, timeoutSeconds = 120 } = options;

    // Acquire slot in queue
    await acquireYtDlpSlot();

    try {
      const tempDir = path.join(os.tmpdir(), `ytdlp-${Date.now()}-${Math.random().toString(36).slice(2)}`);
      
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }

      const pythonPath = this.getPythonPath();
      const outputTemplate = path.join(tempDir, 'output.%(ext)s');

      const args = [
        '-m', 'yt_dlp',
        '--no-playlist',
        '--force-ipv4',
        '--socket-timeout', '30',
        '-f', 'bv*[ext=mp4]+ba[ext=m4a]/b[ext=mp4]/bv*+ba/best',
        '--merge-output-format', 'mp4',
        '-o', outputTemplate,
        '--no-warnings',
        url,
      ];

      const result = await this.runCommand(pythonPath, args, {
        timeout: timeoutSeconds * 1000,
        cwd: process.cwd(),
      });

      if (!result.success) {
        return {
          ok: false,
          provider: 'ytdlp',
          error: 'Download failed',
          message: result.stderr.substring(0, 300),
          shouldRetry: !result.stderr.includes('ERROR'),
        };
      }

      // Find downloaded file
      const files = fs.readdirSync(tempDir);
      const videoFile = files.find(f => f.startsWith('output.'));

      if (!videoFile) {
        this.cleanupTemp(tempDir);
        return {
          ok: false,
          provider: 'ytdlp',
          error: 'No file created',
          message: 'yt-dlp completed but no output file found',
          shouldRetry: false,
        };
      }

      const filePath = path.join(tempDir, videoFile);
      const stats = fs.statSync(filePath);
      const fileSizeMB = stats.size / (1024 * 1024);

      if (fileSizeMB > maxFileSizeMB) {
        this.cleanupTemp(tempDir);
        return {
          ok: false,
          provider: 'ytdlp',
          error: 'File too large',
          message: `File ${fileSizeMB.toFixed(2)}MB exceeds limit of ${maxFileSizeMB}MB`,
          shouldRetry: false,
        };
      }

      return {
        ok: true,
        filePath,
        filename: `video_${Date.now()}.mp4`,
        contentType: 'video/mp4',
        provider: 'ytdlp',
        fileSize: stats.size,
      };
    } catch (error: any) {
      const message = error?.message || String(error);

      return {
        ok: false,
        provider: 'ytdlp',
        error: 'Error',
        message: message.substring(0, 200),
        shouldRetry: !message.includes('Not available'),
      };
    } finally {
      releaseYtDlpSlot();
    }
  }

  private getPythonPath(): string {
    // Try environment variable first
    if (process.env.PYTHON_PATH) {
      return process.env.PYTHON_PATH;
    }

    // Platform-specific paths
    if (process.platform === 'win32') {
      return path.join(process.cwd(), '.venv', 'Scripts', 'python.exe');
    }

    // Linux: Try production path first, then fallback
    const linuxProdPath = '/var/www/simplifyconvertapp/venv/bin/python';
    if (fs.existsSync(linuxProdPath)) {
      return linuxProdPath;
    }

    // Fallback to system python3
    console.log('[ytdlp] Production path not found, falling back to python3');
    return 'python3';
  }

  private runCommand(
    command: string,
    args: string[],
    options: { timeout?: number; cwd?: string } = {}
  ): Promise<{ success: boolean; stdout: string; stderr: string }> {
    return new Promise((resolve) => {
      const child = spawn(command, args, {
        cwd: options.cwd || process.cwd(),
        shell: false,
      });

      let stdout = '';
      let stderr = '';
      let timedOut = false;

      const timer = setTimeout(() => {
        timedOut = true;
        child.kill('SIGKILL');
      }, options.timeout || 180000);

      child.stdout?.on('data', (data) => {
        stdout += data.toString();
      });

      child.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      child.on('close', (code) => {
        clearTimeout(timer);

        if (timedOut) {
          resolve({
            success: false,
            stdout,
            stderr: 'Command timeout',
          });
        } else {
          resolve({
            success: code === 0,
            stdout,
            stderr,
          });
        }
      });

      child.on('error', (error) => {
        clearTimeout(timer);
        resolve({
          success: false,
          stdout,
          stderr: error.message,
        });
      });
    });
  }

  private cleanupTemp(tempDir: string): void {
    try {
      if (fs.existsSync(tempDir)) {
        fs.rmSync(tempDir, { recursive: true, force: true });
      }
    } catch (error) {
      console.error('[ytdlp] Cleanup error:', error);
    }
  }
}
