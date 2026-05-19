/**
 * Cobalt provider - handles YouTube, Instagram, TikTok, Twitter/X, etc.
 * Uses public Cobalt.tools API
 */

import { BaseProvider, DownloadOptions, DownloadResult, DownloadError } from './types';

export class CobaltProvider extends BaseProvider {
  name = 'cobalt' as const;
  private apiUrl: string;
  private apiKey?: string;

  constructor(apiUrl?: string, apiKey?: string) {
    super();
    this.apiUrl = apiUrl || 'https://api.cobalt.tools/api/json';
    this.apiKey = apiKey;
  }

  isSupported(url: string): boolean {
    // Cobalt supports many platforms
    const supportedDomains = [
      'youtube.com', 'youtu.be',
      'instagram.com',
      'tiktok.com',
      'twitter.com', 'x.com',
      'facebook.com',
      'reddit.com',
      'vimeo.com',
      'soundcloud.com',
      'tumblr.com',
      'pinterest.com',
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
    const { url, timeoutSeconds = 120 } = options;

    try {
      // Create request with timeout
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), timeoutSeconds * 1000);

      // Get media info from Cobalt
      const infoResponse = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
        body: JSON.stringify({
          url: url,
          vQuality: '720', // Default quality
          aFormat: 'mp3',
          filenamePattern: 'basic',
        }),
        signal: controller.signal,
      });

      if (!infoResponse.ok) {
        clearTimeout(timeout);
        return {
          ok: false,
          provider: 'cobalt',
          error: `HTTP ${infoResponse.status}`,
          statusCode: infoResponse.status,
          shouldRetry: infoResponse.status >= 500,
        };
      }

      const data = await infoResponse.json();

      // Check for API errors
      if (data.error || data.status === 'error') {
        clearTimeout(timeout);
        return {
          ok: false,
          provider: 'cobalt',
          error: 'API error',
          message: data.errorMessage || data.message || 'Cobalt API error',
          shouldRetry: false,
        };
      }

      // Extract download URL from response
      let downloadUrl: string | null = null;
      if (data.url && typeof data.url === 'string') {
        downloadUrl = data.url;
      } else if (data.downloads?.[0]?.url) {
        downloadUrl = data.downloads[0].url;
      } else if (data.downloads?.[0]) {
        downloadUrl = data.downloads[0];
      }

      if (!downloadUrl) {
        clearTimeout(timeout);
        return {
          ok: false,
          provider: 'cobalt',
          error: 'No download URL',
          message: 'Cobalt did not return a download URL',
          shouldRetry: false,
        };
      }

      // Download the actual file
      const fileResponse = await fetch(downloadUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!fileResponse.ok) {
        return {
          ok: false,
          provider: 'cobalt',
          error: `Download failed (HTTP ${fileResponse.status})`,
          statusCode: fileResponse.status,
          shouldRetry: fileResponse.status >= 500,
        };
      }

      const buffer = await fileResponse.arrayBuffer();
      const filename = `download_${Date.now()}.mp4`;

      return {
        ok: true,
        buffer: Buffer.from(buffer),
        filename,
        contentType: 'video/mp4',
        provider: 'cobalt',
        fileSize: buffer.byteLength,
      };
    } catch (error: any) {
      const message = error?.message || String(error);

      if (error?.name === 'AbortError') {
        return {
          ok: false,
          provider: 'cobalt',
          error: 'Timeout',
          message: `Cobalt download timeout after ${timeoutSeconds}s`,
          shouldRetry: true,
        };
      }

      return {
        ok: false,
        provider: 'cobalt',
        error: 'Download failed',
        message: message.substring(0, 200),
        shouldRetry: message.includes('ECONNREFUSED'),
      };
    }
  }
}
