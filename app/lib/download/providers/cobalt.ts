/**
 * Cobalt provider - handles YouTube, Instagram, TikTok, Twitter/X, etc.
 * Uses self-hosted Cobalt v11 API with tunnel response support
 */

import { BaseProvider, DownloadOptions, DownloadResult, DownloadError } from './types';

export class CobaltProvider extends BaseProvider {
  name = 'cobalt' as const;
  private endpoint: string;

  constructor(apiUrl?: string, _apiKey?: string) {
    super();
    // Cobalt v11 uses POST to root endpoint only
    // Strip any trailing slashes and /api/json paths, then add trailing slash
    let baseUrl = apiUrl || 'http://127.0.0.1:9000';
    baseUrl = baseUrl.replace(/\/$/, '').replace(/\/api\/json$/, '');
    this.endpoint = `${baseUrl}/`;
    console.log('[cobalt] v11 endpoint:', this.endpoint);
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

  private getPlatformFromUrl(url: string): string | null {
    try {
      const urlObj = new URL(url);
      const hostname = urlObj.hostname || '';
      if (hostname.includes('youtube.com') || hostname.includes('youtu.be')) return 'youtube';
      if (hostname.includes('vimeo.com')) return 'vimeo';
      if (hostname.includes('instagram.com')) return 'instagram';
      if (hostname.includes('facebook.com')) return 'facebook';
      return null;
    } catch {
      return null;
    }
  }

  async download(options: DownloadOptions): Promise<DownloadResult | DownloadError> {
    const { url, timeoutSeconds = 120 } = options;

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), timeoutSeconds * 1000);

      console.log('[cobalt] v11 request for:', url);

      // Step 1: Get media info from Cobalt v11 root endpoint
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
        signal: controller.signal,
      });

      if (!response.ok) {
        clearTimeout(timeout);
        console.log('[cobalt] v11 HTTP error:', response.status);
        
        // For HTTP 400 on supported platforms like YouTube/Vimeo, allow retry with fallback
        if (response.status === 400) {
          const platform = this.getPlatformFromUrl(url);
          const shouldRetryOn400 = ['youtube', 'vimeo'].includes(platform || '');
          if (shouldRetryOn400) {
            console.log(`[cobalt] HTTP 400 on ${platform}, allowing fallback to next provider`);
            return {
              ok: false,
              provider: 'cobalt',
              error: `HTTP ${response.status}`,
              statusCode: response.status,
              shouldRetry: true, // Allow fallback for YouTube/Vimeo on 400
            };
          }
        }
        
        return {
          ok: false,
          provider: 'cobalt',
          error: `HTTP ${response.status}`,
          statusCode: response.status,
          shouldRetry: response.status >= 500, // Only retry on 5xx errors
        };
      }

      const data = await response.json();
      console.log('[cobalt]', data.status, '|', data.filename);

      // Handle error response
      if (data.status === 'error') {
        clearTimeout(timeout);
        const msg = data.error || data.message || 'Unknown error';
        console.log('[cobalt] error:', msg);
        return {
          ok: false,
          provider: 'cobalt',
          error: msg,
          shouldRetry: false,
        };
      }

      // Handle picker (user must select format)
      if (data.status === 'picker') {
        clearTimeout(timeout);
        console.log('[cobalt] picker - user selection required');
        return {
          ok: false,
          provider: 'cobalt',
          error: 'Format selection required',
          shouldRetry: false,
        };
      }

      // Get download URL from tunnel/redirect/stream response
      let downloadUrl = data.url;
      if (!downloadUrl) {
        clearTimeout(timeout);
        console.log('[cobalt] no url in response:', data);
        return {
          ok: false,
          provider: 'cobalt',
          error: 'No download URL',
          shouldRetry: false,
        };
      }

      // Step 2: Download the actual file from tunnel/redirect/stream URL
      console.log('[cobalt] fetching', data.status, 'url');
      const fileResponse = await fetch(downloadUrl, {
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!fileResponse.ok) {
        console.log('[cobalt] file fetch HTTP', fileResponse.status);
        return {
          ok: false,
          provider: 'cobalt',
          error: `HTTP ${fileResponse.status}`,
          statusCode: fileResponse.status,
          shouldRetry: fileResponse.status >= 500,
        };
      }

      const buffer = await fileResponse.arrayBuffer();
      const filename = data.filename || 'download.mp4';
      const contentType = fileResponse.headers.get('content-type') || 'video/mp4';

      console.log('[cobalt] success:', filename, `(${(buffer.byteLength / 1024 / 1024).toFixed(2)}MB)`);

      return {
        ok: true,
        buffer: Buffer.from(buffer),
        filename,
        contentType: contentType.split(';')[0].trim(),
        provider: 'cobalt',
        fileSize: buffer.byteLength,
      };
    } catch (error: any) {
      const msg = error?.message || String(error);

      if (error?.name === 'AbortError') {
        console.log('[cobalt] timeout after', timeoutSeconds, 's');
        return {
          ok: false,
          provider: 'cobalt',
          error: 'Timeout',
          shouldRetry: true,
        };
      }

      console.log('[cobalt] error:', msg);
      return {
        ok: false,
        provider: 'cobalt',
        error: msg.substring(0, 200),
        shouldRetry: msg.includes('ECONNREFUSED'),
      };
    }
  }
}
