/**
 * Asset Providers Base Interface
 * Defines contract for asset providers (Pexels, Pixabay, Unsplash, etc.)
 */

import { IAssetProvider, AssetSelectionCriteria, DownloadedAsset, AssetProvider, AssetType } from '../types/cinematic-assets';

export abstract class BaseAssetProvider implements IAssetProvider {
  abstract name: AssetProvider;
  protected apiKey: string = '';

  constructor(apiKey?: string) {
    this.apiKey = apiKey || '';
  }

  abstract search(keywords: string[], criteria: AssetSelectionCriteria): Promise<DownloadedAsset[]>;
  abstract getAssetUrl(asset: DownloadedAsset): string;
  abstract isAvailable(): Promise<boolean>;

  /**
   * Download asset from URL
   */
  async downloadAsset(url: string): Promise<Buffer> {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to download asset: ${response.statusText}`);
      }
      return await response.arrayBuffer().then((ab) => Buffer.from(ab));
    } catch (error) {
      console.error(`[${this.name}] Download failed:`, error);
      throw error;
    }
  }

  /**
   * Generate cache key
   */
  protected generateCacheKey(keywords: string[]): string {
    return keywords.join('-').toLowerCase().replace(/\s+/g, '-').substring(0, 50);
  }
}

/**
 * Pexels Provider
 * Free API: https://www.pexels.com/api
 */
export class PexelsProvider extends BaseAssetProvider {
  name: AssetProvider = 'pexels';
  private baseUrl = 'https://api.pexels.com/v1';

  constructor(apiKey?: string) {
    super(apiKey || process.env.PEXELS_API_KEY);
  }

  async isAvailable(): Promise<boolean> {
    if (!this.apiKey) {
      console.warn('[Pexels] No API key provided');
      return false;
    }
    try {
      const response = await fetch(`${this.baseUrl}/search?query=test&per_page=1`, {
        headers: { Authorization: this.apiKey },
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  async search(keywords: string[], criteria: AssetSelectionCriteria): Promise<DownloadedAsset[]> {
    if (!this.apiKey) {
      console.warn('[Pexels] No API key, skipping search');
      return [];
    }

    try {
      const query = keywords.join(' ');
      const assetType = criteria.assetType || 'image';

      // Pexels API endpoint: /search for images, /videos for videos
      const endpoint = assetType === 'video' ? '/videos/search' : '/search';
      const params = new URLSearchParams({
        query,
        per_page: '5',
        orientation: criteria.aspectRatio === '9:16' ? 'portrait' : 'landscape',
      });

      const response = await fetch(`${this.baseUrl}${endpoint}?${params}`, {
        headers: { Authorization: this.apiKey },
      });

      if (!response.ok) {
        throw new Error(`Pexels API error: ${response.statusText}`);
      }

      const data = await response.json() as any;
      const items = assetType === 'video' ? data.videos || [] : data.photos || [];

      return items.slice(0, 5).map((item: any) => ({
        id: item.id.toString(),
        url: assetType === 'video' ? item.video_files[0].link : item.src.original,
        provider: 'pexels',
        type: assetType as AssetType,
        keywords,
        metadata: {
          width: item.width,
          height: item.height,
          duration: item.duration,
          photographer: item.photographer || 'Unknown',
        },
      }));
    } catch (error) {
      console.error('[Pexels] Search failed:', error);
      return [];
    }
  }

  getAssetUrl(asset: DownloadedAsset): string {
    return asset.url;
  }
}

/**
 * Pixabay Provider
 * Free API: https://pixabay.com/api/
 */
export class PixabayProvider extends BaseAssetProvider {
  name: AssetProvider = 'pixabay';
  private baseUrl = 'https://pixabay.com/api';

  constructor(apiKey?: string) {
    super(apiKey || process.env.PIXABAY_API_KEY);
  }

  async isAvailable(): Promise<boolean> {
    if (!this.apiKey) {
      console.warn('[Pixabay] No API key provided');
      return false;
    }
    try {
      const response = await fetch(`${this.baseUrl}/?key=${this.apiKey}&q=test`, {});
      return response.ok;
    } catch {
      return false;
    }
  }

  async search(keywords: string[], criteria: AssetSelectionCriteria): Promise<DownloadedAsset[]> {
    if (!this.apiKey) {
      console.warn('[Pixabay] No API key, skipping search');
      return [];
    }

    try {
      const query = keywords.join(' ');
      const assetType = criteria.assetType || 'image';

      const params = new URLSearchParams({
        key: this.apiKey,
        q: query,
        per_page: '5',
        image_type: assetType === 'video' ? 'video' : 'photo',
        order: 'popular',
      });

      const response = await fetch(`${this.baseUrl}/?${params}`);
      if (!response.ok) {
        throw new Error(`Pixabay API error: ${response.statusText}`);
      }

      const data = await response.json() as any;
      const items = data.hits || [];

      return items.slice(0, 5).map((item: any) => ({
        id: item.id.toString(),
        url: assetType === 'video' ? item.videos.medium.url : item.largeImageURL,
        provider: 'pixabay',
        type: assetType as AssetType,
        keywords,
        metadata: {
          width: item.imageWidth || item.width,
          height: item.imageHeight || item.height,
          photographer: item.user || 'Unknown',
        },
      }));
    } catch (error) {
      console.error('[Pixabay] Search failed:', error);
      return [];
    }
  }

  getAssetUrl(asset: DownloadedAsset): string {
    return asset.url;
  }
}

/**
 * Unsplash Provider
 * Free API: https://unsplash.com/napi
 */
export class UnsplashProvider extends BaseAssetProvider {
  name: AssetProvider = 'unsplash';
  private baseUrl = 'https://api.unsplash.com';

  constructor(apiKey?: string) {
    super(apiKey || process.env.UNSPLASH_API_KEY);
  }

  async isAvailable(): Promise<boolean> {
    if (!this.apiKey) {
      console.warn('[Unsplash] No API key provided');
      return false;
    }
    try {
      const response = await fetch(`${this.baseUrl}/search/photos?query=test&per_page=1`, {
        headers: { Authorization: `Client-ID ${this.apiKey}` },
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  async search(keywords: string[], criteria: AssetSelectionCriteria): Promise<DownloadedAsset[]> {
    if (!this.apiKey) {
      console.warn('[Unsplash] No API key, skipping search');
      return [];
    }

    try {
      const query = keywords.join(' ');

      // Unsplash only supports images
      const params = new URLSearchParams({
        query,
        per_page: '5',
        order_by: 'relevant',
        orientation: criteria.aspectRatio === '9:16' ? 'portrait' : 'landscape',
      });

      const response = await fetch(`${this.baseUrl}/search/photos?${params}`, {
        headers: { Authorization: `Client-ID ${this.apiKey}` },
      });

      if (!response.ok) {
        throw new Error(`Unsplash API error: ${response.statusText}`);
      }

      const data = await response.json() as any;
      const items = data.results || [];

      return items.slice(0, 5).map((item: any) => ({
        id: item.id,
        url: item.urls.full,
        provider: 'unsplash',
        type: 'image' as AssetType,
        keywords,
        metadata: {
          width: item.width,
          height: item.height,
          photographer: item.user?.name || 'Unknown',
        },
      }));
    } catch (error) {
      console.error('[Unsplash] Search failed:', error);
      return [];
    }
  }

  getAssetUrl(asset: DownloadedAsset): string {
    return asset.url;
  }
}

/**
 * unDraw Provider (Illustrations)
 * Free API: https://undraw.co/api
 */
export class UnDrawProvider extends BaseAssetProvider {
  name: AssetProvider = 'undraw';
  private baseUrl = 'https://undraw.co/api/illustrations';

  constructor() {
    super();
  }

  async isAvailable(): Promise<boolean> {
    try {
      const response = await fetch(this.baseUrl);
      return response.ok;
    } catch {
      return false;
    }
  }

  async search(keywords: string[], criteria: AssetSelectionCriteria): Promise<DownloadedAsset[]> {
    try {
      const response = await fetch(this.baseUrl);
      if (!response.ok) {
        throw new Error(`unDraw API error: ${response.statusText}`);
      }

      const data = await response.json() as any;
      const allIllustrations = data.illustrations || [];

      // Simple keyword matching
      const filtered = allIllustrations.filter((ill: any) => {
        const title = (ill.title || '').toLowerCase();
        return keywords.some((kw) => title.includes(kw.toLowerCase()));
      });

      return filtered.slice(0, 5).map((item: any) => ({
        id: item.id,
        url: item.image,
        provider: 'undraw',
        type: 'illustration' as AssetType,
        keywords,
        metadata: {
          width: 1920,
          height: 1080,
        },
      }));
    } catch (error) {
      console.error('[unDraw] Search failed:', error);
      return [];
    }
  }

  getAssetUrl(asset: DownloadedAsset): string {
    return asset.url;
  }
}

/**
 * Asset Provider Manager
 * Manages multiple providers and intelligent asset selection
 */
export class AssetProviderManager {
  private providers: Map<AssetProvider, BaseAssetProvider> = new Map();
  private availableProviders: Set<AssetProvider> = new Set();

  constructor() {
    // Initialize all providers
    this.providers.set('pexels', new PexelsProvider());
    this.providers.set('pixabay', new PixabayProvider());
    this.providers.set('unsplash', new UnsplashProvider());
    this.providers.set('undraw', new UnDrawProvider());
  }

  /**
   * Initialize and check provider availability
   */
  async initialize(): Promise<void> {
    for (const [name, provider] of this.providers.entries()) {
      try {
        const available = await provider.isAvailable();
        if (available) {
          this.availableProviders.add(name);
          console.log(`[AssetProviders] ${name} is available`);
        } else {
          console.warn(`[AssetProviders] ${name} is not available (missing API key?)`);
        }
      } catch (error) {
        console.warn(`[AssetProviders] Failed to check ${name}:`, error);
      }
    }
  }

  /**
   * Search for assets across multiple providers
   */
  async searchAssets(
    keywords: string[],
    criteria: AssetSelectionCriteria,
    preferredProvider?: AssetProvider,
  ): Promise<DownloadedAsset[]> {
    const providers = preferredProvider
      ? [this.providers.get(preferredProvider)].filter(Boolean)
      : Array.from(this.providers.values());

    const allResults: DownloadedAsset[] = [];

    for (const provider of providers) {
      if (!provider || !this.availableProviders.has(provider.name)) {
        continue;
      }

      try {
        const results = await provider.search(keywords, criteria);
        allResults.push(...results);
        if (allResults.length >= 5) break; // Got enough results
      } catch (error) {
        console.error(`[AssetProviders] Search failed for ${provider.name}:`, error);
      }
    }

    return allResults.slice(0, 5);
  }

  /**
   * Get asset by provider
   */
  getProvider(name: AssetProvider): BaseAssetProvider | undefined {
    return this.providers.get(name);
  }

  /**
   * Get list of available providers
   */
  getAvailableProviders(): AssetProvider[] {
    return Array.from(this.availableProviders);
  }
}

// Export singleton instance
export const assetProviders = new AssetProviderManager();
