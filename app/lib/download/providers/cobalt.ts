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

      console.log('[cobalt] Requesting download for:', url);

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
        console.log('[cobalt] API error HTTP', infoResponse.status);
        return {
          ok: false,
          provider: 'cobalt',
          error: `HTTP ${infoResponse.status}`,
          statusCode: infoResponse.status,
          shouldRetry: infoResponse.status >= 500,
        };
      }

      const data = await infoResponse.json();

      // Check for API errors (Cobalt returns error status or error field)
      if (data.error || data.status === 'error') {
        clearTimeout(timeout);
        console.log('[cobalt] API returned error:', data.error || data.errorMessage);
        return {
          ok: false,
          provider: 'cobalt',
          error: 'API error',
          message: data.errorMessage || data.message || 'Cobalt API error',
          shouldRetry: false,
        };
      }

      // Extract download URL from response - Cobalt returns different formats
      let downloadUrl: string | null = null;
      
      // Try different response formats
      if (data.url && typeof data.url === 'string') {
        downloadUrl = data.url;
        console.log('[cobalt] Got URL from data.url');
      } else if (data.downloads && Array.isArray(data.downloads)) {
        // Array of downloads
        if (data.downloads[0]?.url) {
          downloadUrl = data.downloads[0].url;
          console.log('[cobalt] Got URL from downloads array (with .url)');
        } else if (typeof data.downloads[0] === 'string') {
          downloadUrl = data.downloads[0];
          console.log('[cobalt] Got URL from downloads array (string)');
        }
      } else if (data.download?.url) {
        // Alternative format
        downloadUrl = data.download.url;
        console.log('[cobalt] Got URL from data.download.url');
      } else if (typeof data === 'string') {
        // Sometimes response is just URL string
        downloadUrl = data;
        console.log('[cobalt] Response is direct URL string');
      }

      if (!downloadUrl) {
        clearTimeout(timeout);
        console.log('[cobalt] No download URL found in response:', JSON.stringify(data).substring(0, 200));
        return {
          ok: false,
          provider: 'cobalt',
          error: 'No download URL',
          message: 'Cobalt did not return a download URL',
          shouldRetry: false,
        };
      }

      // Validate URL
      if (!downloadUrl.startsWith('http')) {
        clearTimeout(timeout);
        console.log('[cobalt] Invalid download URL (not HTTP):', downloadUrl.substring(0, 100));
        return {
          ok: false,
          provider: 'cobalt',
          error: 'Invalid download URL',
          shouldRetry: false,
        };
      }

      console.log('[cobalt] Downloading from:', downloadUrl.substring(0, 100));

      // Download the actual file
      const fileResponse = await fetch(downloadUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!fileResponse.ok) {
        console.log('[cobalt] File download failed HTTP', fileResponse.status);
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

      console.log('[cobalt] Download successful:', filename, `(${(buffer.byteLength / 1024 / 1024).toFixed(2)}MB)`);

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
        console.log('[cobalt] Request timeout after', timeoutSeconds, 's');
        return {
          ok: false,
          provider: 'cobalt',
          error: 'Timeout',
          message: `Cobalt download timeout after ${timeoutSeconds}s`,
          shouldRetry: true,
        };
      }

      console.log('[cobalt] Error:', message);
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
