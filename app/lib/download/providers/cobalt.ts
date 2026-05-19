/**
 * Cobalt provider - handles YouTube, Instagram, TikTok, Twitter/X, etc.
 * Uses self-hosted Cobalt v11 API with tunnel response support
 */

import { BaseProvider, DownloadOptions, DownloadResult, DownloadError } from './types';

export class CobaltProvider extends BaseProvider {
  name = 'cobalt' as const;
  private apiUrl: string;
  private baseUrl: string;
  private apiKey?: string;

  constructor(apiUrl?: string, apiKey?: string) {
    super();
    // Normalize API URL: if just base, add trailing slash; if /api/json format, use as-is
    this.baseUrl = apiUrl ? apiUrl.replace(/\/$/, '') : 'http://127.0.0.1:9000';
    // For v11, we POST to root endpoint
    this.apiUrl = this.baseUrl.endsWith('/api/json') ? this.baseUrl : `${this.baseUrl}/`;
    this.apiKey = apiKey;
    console.log('[cobalt] Initialized with base URL:', this.baseUrl);
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

      // Get media info from Cobalt v11
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
      console.log('[cobalt] Response status:', data.status, '| Response keys:', Object.keys(data).join(', '));

      // Handle error status from Cobalt
      if (data.status === 'error') {
        clearTimeout(timeout);
        const errorCode = data.code || 'UNKNOWN';
        const errorMessage = data.error || data.message || 'Cobalt returned error';
        console.log('[cobalt] API error status:', errorCode, '-', errorMessage);
        return {
          ok: false,
          provider: 'cobalt',
          error: `Cobalt error: ${errorCode}`,
          message: errorMessage,
          shouldRetry: false,
        };
      }

      // Handle picker status (requires user format selection)
      if (data.status === 'picker') {
        clearTimeout(timeout);
        console.log('[cobalt] Picker response - user needs to select format');
        return {
          ok: false,
          provider: 'cobalt',
          error: 'Format selection required',
          message: 'Please select a format from the available options',
          shouldRetry: false,
        };
      }

      // Extract filename - prefer from Cobalt response, fallback to generic
      let filename = data.filename || 'download.mp4';
      console.log('[cobalt] Using filename:', filename);

      // Handle different response types: tunnel, redirect, stream, or direct URL
      let downloadUrl: string | null = null;

      if (data.status === 'tunnel') {
        // Cobalt v11 tunnel response - URL is tunnel endpoint
        if (data.url) {
          // Tunnel URL might be relative to base
          downloadUrl = data.url.startsWith('http') 
            ? data.url 
            : `${this.baseUrl}${data.url}`;
          console.log('[cobalt] Tunnel response - URL:', downloadUrl?.substring(0, 100));
        }
      } else if (data.status === 'redirect') {
        // Cobalt v11 redirect response
        if (data.url) {
          downloadUrl = data.url;
          console.log('[cobalt] Redirect response - URL:', downloadUrl?.substring(0, 100));
        }
      } else if (data.status === 'stream') {
        // Cobalt v11 stream response
        if (data.url) {
          downloadUrl = data.url;
          console.log('[cobalt] Stream response - URL:', downloadUrl?.substring(0, 100));
        }
      } else if (data.url && typeof data.url === 'string') {
        // Fallback to direct URL in response
        downloadUrl = data.url;
        console.log('[cobalt] Direct URL in response');
      } else if (data.downloads && Array.isArray(data.downloads)) {
        // Array of downloads (legacy format)
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
        console.log('[cobalt] No download URL found in response, keys:', Object.keys(data).join(','));
        return {
          ok: false,
          provider: 'cobalt',
          error: 'No download URL',
          message: 'Cobalt did not return a download URL',
          shouldRetry: false,
        };
      }

      // Validate URL - TypeScript knows downloadUrl is string here
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

      console.log('[cobalt] Fetching from URL (status:', data.status, ')');

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
      
      // Determine content type from response or default to video/mp4
      let contentType = fileResponse.headers.get('content-type') || 'video/mp4';
      if (contentType.includes(';')) {
        contentType = contentType.split(';')[0].trim();
      }
      console.log('[cobalt] Content-Type:', contentType);

      console.log('[cobalt] Download successful:', filename, `(${(buffer.byteLength / 1024 / 1024).toFixed(2)}MB)`);

      return {
        ok: true,
        buffer: Buffer.from(buffer),
        filename,
        contentType,
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
