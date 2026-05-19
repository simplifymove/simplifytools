/**
 * Base types and interfaces for download providers
 */

export type DownloadProvider = 'direct' | 'cobalt' | 'ytdlp' | 'gallery-dl' | 'external-api';

export interface DownloadResult {
  ok: true;
  filePath?: string;
  buffer?: Buffer;
  filename: string;
  contentType: string;
  provider: DownloadProvider;
  fileSize: number;
}

export interface DownloadError {
  ok: false;
  provider: DownloadProvider;
  error: string;
  message?: string;
  statusCode?: number;
  shouldRetry?: boolean;
}

export interface ProviderAttempt {
  provider: DownloadProvider;
  status: 'success' | 'failed' | 'skipped';
  message?: string;
  duration?: number;
}

export interface DownloadOptions {
  url: string;
  formatId?: string;
  maxFileSizeMB?: number;
  timeoutSeconds?: number;
  headers?: Record<string, string>;
}

export interface DownloadConfig {
  maxFileSizeMB: number;
  timeoutSeconds: number;
  enableCobalt: boolean;
  cobaltUrl?: string;
  cobaltKey?: string;
  enableYtDlp: boolean;
  enableGalleryDl: boolean;
  enableExternalApi: boolean;
  externalApiKey?: string;
  devMode: boolean;
}

export type PlatformType = 
  | 'youtube' 
  | 'instagram' 
  | 'tiktok' 
  | 'twitter' 
  | 'facebook' 
  | 'vimeo' 
  | 'soundcloud' 
  | 'reddit' 
  | 'direct'
  | 'unknown';

/**
 * Base class for all providers
 */
export abstract class BaseProvider {
  abstract name: DownloadProvider;
  abstract isSupported(url: string): boolean;
  abstract download(options: DownloadOptions): Promise<DownloadResult | DownloadError>;
}
