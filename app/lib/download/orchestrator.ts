/**
 * Provider orchestrator - manages fallback logic
 * Routes URLs to appropriate provider chain based on platform
 */

import { DirectDownloadProvider } from './providers/direct';
import { CobaltProvider } from './providers/cobalt';
import { YtDlpProvider } from './providers/ytdlp';
import { ExternalApiProvider } from './providers/external-api';
import {
  DownloadProvider,
  DownloadResult,
  DownloadError,
  DownloadOptions,
  DownloadConfig,
  ProviderAttempt,
  PlatformType,
  BaseProvider,
} from './providers/types';

export class ProviderOrchestrator {
  private providers: Map<DownloadProvider, BaseProvider> = new Map();
  private config: DownloadConfig;
  private attempts: ProviderAttempt[] = [];

  constructor(config: DownloadConfig) {
    this.config = config;
    this.initializeProviders();
  }

  private initializeProviders(): void {
    // Always available
    this.providers.set('direct', new DirectDownloadProvider());

    if (this.config.enableCobalt) {
      this.providers.set('cobalt', new CobaltProvider(this.config.cobaltUrl, this.config.cobaltKey));
    }

    if (this.config.enableYtDlp) {
      this.providers.set('ytdlp', new YtDlpProvider());
    }

    if (this.config.enableExternalApi) {
      this.providers.set(
        'external-api',
        new ExternalApiProvider(undefined, undefined, this.config.externalApiKey)
      );
    }
  }

  /**
   * Determine platform type from URL
   */
  private getPlatform(url: string): PlatformType {
    try {
      const urlObj = new URL(url);
      const hostname = urlObj.hostname || '';

      if (hostname.includes('youtube.com') || hostname.includes('youtu.be')) return 'youtube';
      if (hostname.includes('instagram.com')) return 'instagram';
      if (hostname.includes('tiktok.com')) return 'tiktok';
      if (hostname.includes('twitter.com') || hostname.includes('x.com')) return 'twitter';
      if (hostname.includes('facebook.com')) return 'facebook';
      if (hostname.includes('vimeo.com')) return 'vimeo';
      if (hostname.includes('soundcloud.com')) return 'soundcloud';
      if (hostname.includes('reddit.com')) return 'reddit';

      // Check if it's a direct file
      const pathname = urlObj.pathname.toLowerCase();
      const ext = pathname.split('.').pop();
      const fileExtensions = [
        'pdf', 'jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'tiff',
        'zip', 'rar', '7z', 'tar', 'gz',
        'mp3', 'wav', 'aac', 'm4a', 'flac', 'ogg', 'wma',
        'mp4', 'avi', 'mkv', 'mov', 'webm', 'flv', 'wmv', 'mpeg',
        'docx', 'doc', 'xlsx', 'xls', 'pptx', 'ppt', 'txt', 'csv',
      ];
      if (ext && fileExtensions.includes(ext)) return 'direct';

      return 'unknown';
    } catch {
      return 'unknown';
    }
  }

  /**
   * Get provider chain for platform
   */
  private getProviderChain(platform: PlatformType): DownloadProvider[] {
    switch (platform) {
      case 'youtube':
        return ['cobalt', 'ytdlp', 'external-api'];
      case 'instagram':
        return ['cobalt', 'ytdlp', 'external-api'];
      case 'tiktok':
        return ['cobalt', 'ytdlp', 'external-api'];
      case 'twitter':
        return ['cobalt', 'ytdlp', 'external-api'];
      case 'facebook':
        return ['ytdlp', 'cobalt', 'external-api'];
      case 'vimeo':
        return ['ytdlp', 'cobalt', 'external-api'];
      case 'soundcloud':
        return ['ytdlp', 'cobalt', 'external-api'];
      case 'reddit':
        return ['cobalt', 'ytdlp', 'external-api'];
      case 'direct':
        return ['direct'];
      case 'unknown':
        return ['direct', 'cobalt', 'ytdlp', 'external-api'];
      default:
        return ['direct', 'cobalt', 'ytdlp', 'external-api'];
    }
  }

  /**
   * Main download method with fallback chain
   */
  async download(options: DownloadOptions): Promise<DownloadResult | DownloadError> {
    this.attempts = [];

    // Validate URL
    const urlValidation = this.validateUrl(options.url);
    if (!urlValidation.valid) {
      return {
        ok: false,
        provider: 'direct',
        error: 'Invalid URL',
        message: urlValidation.message,
        shouldRetry: false,
      };
    }

    const platform = this.getPlatform(options.url);
    const providerChain = this.getProviderChain(platform);

    // Try each provider in chain
    for (const providerName of providerChain) {
      const provider = this.providers.get(providerName);

      if (!provider) {
        this.attempts.push({
          provider: providerName,
          status: 'skipped',
          message: 'Provider not available',
        });
        continue;
      }

      if (!provider.isSupported(options.url)) {
        this.attempts.push({
          provider: providerName,
          status: 'skipped',
          message: 'URL not supported by provider',
        });
        continue;
      }

      try {
        const startTime = Date.now();
        const result = await provider.download(options);
        const duration = Date.now() - startTime;

        if (result.ok) {
          this.attempts.push({
            provider: result.provider,
            status: 'success',
            duration,
          });

          // Store attempts in result for logging
          (result as any).attempts = this.attempts;
          return result;
        }

        // Provider failed, record attempt and continue
        this.attempts.push({
          provider: providerName,
          status: 'failed',
          message: result.message || result.error,
          duration,
        });

        // If provider says don't retry, try next
        if (!result.shouldRetry) {
          continue;
        }
      } catch (error: any) {
        this.attempts.push({
          provider: providerName,
          status: 'failed',
          message: error?.message || 'Unknown error',
        });
      }
    }

    // All providers failed
    return {
      ok: false,
      provider: 'direct',
      error: 'All providers failed',
      message: 'Download failed from all available providers',
      shouldRetry: false,
    };
  }

  /**
   * Get provider attempts for logging/debugging
   */
  getAttempts(): ProviderAttempt[] {
    return this.attempts;
  }

  /**
   * Validate URL for security
   */
  private validateUrl(url: string): { valid: boolean; message?: string } {
    try {
      const urlObj = new URL(url);

      // Only allow http/https
      if (urlObj.protocol !== 'http:' && urlObj.protocol !== 'https:') {
        return { valid: false, message: 'Only HTTP/HTTPS URLs are supported' };
      }

      // Prevent SSRF - block private/internal IPs
      const hostname = urlObj.hostname || '';
      const internalPatterns = [
        /^localhost$/i,
        /^127\./, // 127.0.0.0/8
        /^192\.168\./, // 192.168.0.0/16
        /^10\./, // 10.0.0.0/8
        /^172\.(1[6-9]|2[0-9]|3[01])\./, // 172.16.0.0/12
        /^0\./, // 0.0.0.0/8
        /^169\.254\./, // 169.254.0.0/16
        /^::1$/, // IPv6 loopback
        /^fc00:/i, // IPv6 private
      ];

      for (const pattern of internalPatterns) {
        if (pattern.test(hostname)) {
          return { valid: false, message: 'Internal/private IP addresses are not allowed' };
        }
      }

      return { valid: true };
    } catch (error) {
      return { valid: false, message: 'Invalid URL format' };
    }
  }
}
