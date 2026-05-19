/**
 * Direct file downloader - handles direct file URLs
 * e.g., https://example.com/document.pdf
 */

import { BaseProvider, DownloadOptions, DownloadResult, DownloadError } from './types';
import fs from 'fs';
import path from 'path';
import os from 'os';

const DIRECT_FILE_EXTENSIONS = [
  'pdf', 'jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'tiff',
  'zip', 'rar', '7z', 'tar', 'gz',
  'mp3', 'wav', 'aac', 'm4a', 'flac', 'ogg', 'wma',
  'mp4', 'avi', 'mkv', 'mov', 'webm', 'flv', 'wmv', 'mpeg',
  'docx', 'doc', 'xlsx', 'xls', 'pptx', 'ppt', 'txt', 'csv'
];

export class DirectDownloadProvider extends BaseProvider {
  name = 'direct' as const;

  isSupported(url: string): boolean {
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname.toLowerCase();
      const ext = pathname.split('.').pop();
      return ext ? DIRECT_FILE_EXTENSIONS.includes(ext) : false;
    } catch {
      return false;
    }
  }

  async download(options: DownloadOptions): Promise<DownloadResult | DownloadError> {
    const startTime = Date.now();
    const { url, maxFileSizeMB = 500, timeoutSeconds = 120 } = options;

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), timeoutSeconds * 1000);

      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          ...options.headers,
        },
      });

      clearTimeout(timeout);

      if (!response.ok) {
        return {
          ok: false,
          provider: 'direct',
          error: `HTTP ${response.status}`,
          message: `Direct download failed with status ${response.status}`,
          statusCode: response.status,
          shouldRetry: response.status >= 500,
        };
      }

      // Check content length before downloading
      const contentLength = response.headers.get('content-length');
      if (contentLength) {
        const fileSizeMB = parseInt(contentLength) / (1024 * 1024);
        if (fileSizeMB > maxFileSizeMB) {
          return {
            ok: false,
            provider: 'direct',
            error: 'File too large',
            message: `File size ${fileSizeMB.toFixed(2)}MB exceeds limit of ${maxFileSizeMB}MB`,
            shouldRetry: false,
          };
        }
      }

      const buffer = await response.arrayBuffer();
      const bufferSize = buffer.byteLength;

      // Verify actual file size
      const fileSizeMB = bufferSize / (1024 * 1024);
      if (fileSizeMB > maxFileSizeMB) {
        return {
          ok: false,
          provider: 'direct',
          error: 'File too large',
          message: `Downloaded file ${fileSizeMB.toFixed(2)}MB exceeds limit of ${maxFileSizeMB}MB`,
          shouldRetry: false,
        };
      }

      // Extract filename from Content-Disposition or URL
      let filename = this.extractFilename(url, response.headers.get('content-disposition'));

      return {
        ok: true,
        buffer: Buffer.from(buffer),
        filename,
        contentType: response.headers.get('content-type') || 'application/octet-stream',
        provider: 'direct',
        fileSize: bufferSize,
      };
    } catch (error: any) {
      const duration = Date.now() - startTime;
      const message = error?.message || String(error);

      if (error.name === 'AbortError') {
        return {
          ok: false,
          provider: 'direct',
          error: 'Timeout',
          message: `Direct download timeout after ${timeoutSeconds}s`,
          shouldRetry: true,
        };
      }

      return {
        ok: false,
        provider: 'direct',
        error: 'Download failed',
        message: message.substring(0, 200),
        shouldRetry: message.includes('ECONNREFUSED') || message.includes('ETIMEDOUT'),
      };
    }
  }

  private extractFilename(url: string, contentDisposition: string | null): string {
    // Try Content-Disposition first
    if (contentDisposition) {
      const match = contentDisposition.match(/filename="?([^"]+)"?/);
      if (match && match[1]) {
        return decodeURIComponent(match[1]).substring(0, 200);
      }
    }

    // Extract from URL path
    try {
      const urlObj = new URL(url);
      let filename = urlObj.pathname.split('/').pop() || 'download';
      
      // Decode if URL-encoded
      try {
        filename = decodeURIComponent(filename);
      } catch {
        // If decode fails, use as-is
      }

      // Sanitize
      filename = filename.replace(/[^\w.\-() ]/g, '').substring(0, 200);
      return filename || 'download';
    } catch {
      return 'download';
    }
  }
}
