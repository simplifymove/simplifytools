/**
 * External API provider - RapidAPI as final fallback
 * For when local providers fail
 */

import { BaseProvider, DownloadOptions, DownloadResult, DownloadError } from './types';

export class ExternalApiProvider extends BaseProvider {
  name = 'external-api' as const;
  private apiUrl: string;
  private apiHost: string;
  private apiKey: string;

  constructor(apiUrl?: string, apiHost?: string, apiKey?: string) {
    super();
    this.apiUrl = apiUrl || 'https://youtube-video-audio-downloader.p.rapidapi.com/api/v1/';
    this.apiHost = apiHost || 'youtube-video-audio-downloader.p.rapidapi.com';
    this.apiKey = apiKey || '';
  }

  isSupported(url: string): boolean {
    // External API supports most platforms
    return this.apiKey?.length > 0;
  }

  async download(options: DownloadOptions): Promise<DownloadResult | DownloadError> {
    const startTime = Date.now();
    const { url, timeoutSeconds = 120 } = options;

    if (!this.apiKey) {
      return {
        ok: false,
        provider: 'external-api',
        error: 'API not configured',
        message: 'External API key not set',
        shouldRetry: false,
      };
    }

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), timeoutSeconds * 1000);

      // Determine endpoint based on URL
      const endpoint = this.getEndpoint(url);
      const fullUrl = `${this.apiUrl}${endpoint}?url=${encodeURIComponent(url)}`;

      const infoResponse = await fetch(fullUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-rapidapi-host': this.apiHost,
          'x-rapidapi-key': this.apiKey,
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
        signal: controller.signal,
      });

      if (infoResponse.status === 403) {
        clearTimeout(timeout);
        return {
          ok: false,
          provider: 'external-api',
          error: 'Subscription error',
          message: 'API key not subscribed to this endpoint',
          statusCode: 403,
          shouldRetry: false,
        };
      }

      if (!infoResponse.ok) {
        clearTimeout(timeout);
        return {
          ok: false,
          provider: 'external-api',
          error: `HTTP ${infoResponse.status}`,
          statusCode: infoResponse.status,
          shouldRetry: infoResponse.status >= 500,
        };
      }

      const data = await infoResponse.json();

      // Extract download URL from response
      let downloadUrl: string | null = null;
      if (data.downloadUrl) {
        downloadUrl = data.downloadUrl;
      } else if (data.url) {
        downloadUrl = data.url;
      } else if (data.link) {
        downloadUrl = data.link;
      } else if (data.result?.downloadUrl) {
        downloadUrl = data.result.downloadUrl;
      }

      if (!downloadUrl) {
        clearTimeout(timeout);
        return {
          ok: false,
          provider: 'external-api',
          error: 'No download URL',
          message: 'API did not return a download URL',
          shouldRetry: false,
        };
      }

      // Download the file
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
          provider: 'external-api',
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
        provider: 'external-api',
        fileSize: buffer.byteLength,
      };
    } catch (error: any) {
      const message = error?.message || String(error);

      if (error?.name === 'AbortError') {
        return {
          ok: false,
          provider: 'external-api',
          error: 'Timeout',
          message: `API timeout after ${timeoutSeconds}s`,
          shouldRetry: true,
        };
      }

      return {
        ok: false,
        provider: 'external-api',
        error: 'Request failed',
        message: message.substring(0, 200),
        shouldRetry: message.includes('ECONNREFUSED'),
      };
    }
  }

  private getEndpoint(url: string): string {
    if (url.includes('instagram.com')) return 'instagram-media/info';
    if (url.includes('tiktok.com')) return 'tiktok-media/info';
    if (url.includes('soundcloud.com')) return 'soundcloud-media/info';
    if (url.includes('twitter.com') || url.includes('x.com')) return 'twitter-media/info';
    if (url.includes('facebook.com')) return 'facebook-media/info';
    return 'youtube-media/info';
  }
}
