/**
 * Asset Cache Manager
 * Handles caching of downloaded assets to avoid repeated downloads
 * Uses filesystem caching with TTL
 */

import fs from 'fs';
import path from 'path';
import { DownloadedAsset, CacheEntry, AssetCache } from '../types/cinematic-assets';

const CACHE_DIR = path.join(process.cwd(), '.asset-cache');
const CACHE_INDEX_FILE = path.join(CACHE_DIR, 'index.json');
const DEFAULT_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

export class AssetCacheManager {
  private cache: AssetCache = {};
  private initialized = false;

  /**
   * Initialize cache: load from disk and clean expired entries
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // Create cache directory if it doesn't exist
      if (!fs.existsSync(CACHE_DIR)) {
        fs.mkdirSync(CACHE_DIR, { recursive: true });
      }

      // Load cache index if exists
      if (fs.existsSync(CACHE_INDEX_FILE)) {
        const indexContent = fs.readFileSync(CACHE_INDEX_FILE, 'utf-8');
        this.cache = JSON.parse(indexContent);
      }

      // Clean expired entries
      await this.cleanExpiredEntries();
      this.initialized = true;
    } catch (error) {
      console.warn('[AssetCache] Failed to initialize:', error);
      this.cache = {};
      this.initialized = true;
    }
  }

  /**
   * Get cached asset by key
   */
  async get(key: string): Promise<DownloadedAsset | null> {
    await this.initialize();

    const entry = this.cache[key];
    if (!entry) return null;

    // Check if expired
    if (Date.now() > entry.timestamp + entry.ttl) {
      await this.remove(key);
      return null;
    }

    // Verify local file still exists
    if (!fs.existsSync(entry.localPath)) {
      await this.remove(key);
      return null;
    }

    return entry.asset;
  }

  /**
   * Cache an asset
   */
  async set(asset: DownloadedAsset, localPath: string, ttl: number = DEFAULT_TTL): Promise<void> {
    await this.initialize();

    const key = this.generateKey(asset);
    this.cache[key] = {
      asset,
      localPath,
      timestamp: Date.now(),
      ttl,
    };

    await this.save();
  }

  /**
   * Download and cache an asset from URL
   */
  async downloadAndCache(asset: DownloadedAsset, downloadFn: () => Promise<Buffer>): Promise<string> {
    const key = this.generateKey(asset);
    const cached = await this.get(key);

    if (cached && cached.url === asset.url) {
      const entry = this.cache[key];
      if (entry && fs.existsSync(entry.localPath)) {
        console.log(`[AssetCache] Using cached asset: ${key}`);
        return entry.localPath;
      }
    }

    try {
      // Download asset
      const buffer = await downloadFn();

      // Save to cache directory
      const ext = this.getExtension(asset.type, asset.url);
      const filename = `${key}${ext}`;
      const localPath = path.join(CACHE_DIR, filename);

      fs.writeFileSync(localPath, buffer);

      // Update cache
      await this.set(asset, localPath);

      console.log(`[AssetCache] Cached new asset: ${key}`);
      return localPath;
    } catch (error) {
      console.error(`[AssetCache] Failed to download and cache asset:`, error);
      throw error;
    }
  }

  /**
   * Remove expired entries
   */
  private async cleanExpiredEntries(): Promise<void> {
    const now = Date.now();
    const keysToRemove: string[] = [];

    for (const [key, entry] of Object.entries(this.cache)) {
      if (now > entry.timestamp + entry.ttl) {
        keysToRemove.push(key);
        // Try to delete file
        try {
          if (fs.existsSync(entry.localPath)) {
            fs.unlinkSync(entry.localPath);
          }
        } catch (error) {
          console.warn(`[AssetCache] Failed to delete cached file: ${entry.localPath}`, error);
        }
      }
    }

    if (keysToRemove.length > 0) {
      keysToRemove.forEach((key) => {
        delete this.cache[key];
      });
      await this.save();
      console.log(`[AssetCache] Cleaned ${keysToRemove.length} expired entries`);
    }
  }

  /**
   * Remove specific entry
   */
  private async remove(key: string): Promise<void> {
    const entry = this.cache[key];
    if (!entry) return;

    try {
      if (fs.existsSync(entry.localPath)) {
        fs.unlinkSync(entry.localPath);
      }
    } catch (error) {
      console.warn(`[AssetCache] Failed to delete file: ${entry.localPath}`, error);
    }

    delete this.cache[key];
    await this.save();
  }

  /**
   * Save cache index to disk
   */
  private async save(): Promise<void> {
    try {
      fs.writeFileSync(CACHE_INDEX_FILE, JSON.stringify(this.cache, null, 2));
    } catch (error) {
      console.error(`[AssetCache] Failed to save cache index:`, error);
    }
  }

  /**
   * Generate cache key from asset
   */
  private generateKey(asset: DownloadedAsset): string {
    const contentHash = asset.url
      .split('')
      .reduce((hash, char) => ((hash << 5) - hash + char.charCodeAt(0)) | 0, 0)
      .toString(36)
      .substring(0, 8);

    return `${asset.provider}-${asset.type}-${contentHash}`;
  }

  /**
   * Get file extension based on asset type and URL
   */
  private getExtension(type: string, url: string): string {
    if (type === 'video') return '.mp4';
    if (type === 'image') {
      if (url.includes('.webp')) return '.webp';
      if (url.includes('.png')) return '.png';
      if (url.includes('.jpg') || url.includes('.jpeg')) return '.jpg';
      return '.jpg';
    }
    if (type === 'illustration') return '.png';
    if (type === 'ui-mockup') return '.png';
    return '.png';
  }

  /**
   * Clear entire cache
   */
  async clear(): Promise<void> {
    try {
      for (const entry of Object.values(this.cache)) {
        if (fs.existsSync(entry.localPath)) {
          fs.unlinkSync(entry.localPath);
        }
      }
      this.cache = {};
      await this.save();
      console.log('[AssetCache] Cache cleared');
    } catch (error) {
      console.error('[AssetCache] Failed to clear cache:', error);
    }
  }

  /**
   * Get cache stats
   */
  getCacheStats(): { totalEntries: number; totalSize: number } {
    let totalSize = 0;
    for (const entry of Object.values(this.cache)) {
      try {
        if (fs.existsSync(entry.localPath)) {
          const stats = fs.statSync(entry.localPath);
          totalSize += stats.size;
        }
      } catch (error) {
        // Ignore
      }
    }
    return {
      totalEntries: Object.keys(this.cache).length,
      totalSize,
    };
  }
}

// Export singleton instance
export const assetCache = new AssetCacheManager();
