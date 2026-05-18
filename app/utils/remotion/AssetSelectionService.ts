/**
 * Asset Selection Service
 * Intelligent asset picking based on scene content, keywords, and mood
 */

import {
  AssetSelectionCriteria,
  DownloadedAsset,
  AssetCategory,
  VisualMood,
  AssetType,
  CinematicScene,
  CinematicConfig,
} from '../types/cinematic-assets';
import { assetProviders } from './AssetProviders';
import { assetCache } from './AssetCacheManager';

interface KeywordMapping {
  keywords: string[];
  category: AssetCategory;
  mood: VisualMood;
  assetType: AssetType;
}

// Keyword mappings for smart categorization
const KEYWORD_MAPPINGS: KeywordMapping[] = [
  {
    keywords: ['forest', 'nature', 'tree', 'woodland', 'outdoor', 'landscape', 'mountain', 'river', 'waterfall'],
    category: 'nature',
    mood: 'serene',
    assetType: 'video',
  },
  {
    keywords: ['tech', 'technology', 'code', 'programmer', 'digital', 'computer', 'screen', 'interface'],
    category: 'technology',
    mood: 'futuristic',
    assetType: 'image',
  },
  {
    keywords: ['ai', 'artificial intelligence', 'machine learning', 'neural', 'data', 'algorithm'],
    category: 'technology',
    mood: 'futuristic',
    assetType: 'illustration',
  },
  {
    keywords: ['business', 'corporate', 'office', 'meeting', 'team', 'conference', 'workspace'],
    category: 'business',
    mood: 'corporate',
    assetType: 'image',
  },
  {
    keywords: ['dashboard', 'analytics', 'chart', 'graph', 'data', 'metrics', 'monitor'],
    category: 'business',
    mood: 'corporate',
    assetType: 'ui-mockup',
  },
  {
    keywords: ['security', 'protect', 'shield', 'lock', 'safe', 'encrypt', 'private'],
    category: 'technology',
    mood: 'corporate',
    assetType: 'illustration',
  },
  {
    keywords: ['people', 'person', 'user', 'customer', 'team', 'group', 'collaboration'],
    category: 'people',
    mood: 'energetic',
    assetType: 'image',
  },
  {
    keywords: ['lifestyle', 'lifestyle', 'living', 'home', 'casual', 'relaxed'],
    category: 'lifestyle',
    mood: 'playful',
    assetType: 'image',
  },
  {
    keywords: ['city', 'urban', 'street', 'building', 'architecture', 'downtown'],
    category: 'urban',
    mood: 'energetic',
    assetType: 'image',
  },
  {
    keywords: ['sunrise', 'sunset', 'sky', 'clouds', 'weather', 'light'],
    category: 'nature',
    mood: 'cinematic',
    assetType: 'video',
  },
];

/**
 * Analyze visual keywords to determine scene category and mood
 */
export function analyzeVisualKeywords(
  keywords: string[],
): { category: AssetCategory; mood: VisualMood; assetType: AssetType } {
  const lowerKeywords = keywords.map((k) => k.toLowerCase());

  for (const mapping of KEYWORD_MAPPINGS) {
    const matches = mapping.keywords.filter((kw) =>
      lowerKeywords.some((k) => k.includes(kw.toLowerCase()) || kw.toLowerCase().includes(k)),
    );

    if (matches.length > 0) {
      return {
        category: mapping.category,
        mood: mapping.mood,
        assetType: mapping.assetType,
      };
    }
  }

  // Default fallback
  return {
    category: 'abstract',
    mood: 'minimal',
    assetType: 'image',
  };
}

/**
 * Generate cinematic configuration based on mood and scene
 */
export function generateCinematicConfig(
  mood: VisualMood,
  assetType: AssetType,
): CinematicConfig {
  const configs: Record<string, Partial<CinematicConfig>> = {
    cinematic: {
      cameraMotion: 'ken-burns-in',
      zoomIntensity: 1.8,
      focusPoint: { x: 0.5, y: 0.5 },
      darkOverlay: { enabled: true, opacity: 0.25 },
      vignetteEffect: { enabled: true, intensity: 0.4 },
      particleEffect: { enabled: true, type: 'light-rays', intensity: 0.6 },
    },
    corporate: {
      cameraMotion: 'slow-pan-right',
      panAmount: 15,
      darkOverlay: { enabled: true, opacity: 0.3 },
      vignetteEffect: { enabled: true, intensity: 0.2 },
      overlayGradient: {
        enabled: true,
        colors: ['rgba(59, 130, 246, 0.1)', 'rgba(139, 92, 246, 0.1)'],
        opacity: 0.3,
      },
    },
    playful: {
      cameraMotion: 'drift',
      panAmount: 8,
      darkOverlay: { enabled: false, opacity: 0 },
      vignetteEffect: { enabled: false, intensity: 0 },
      particleEffect: { enabled: true, type: 'dust', intensity: 0.4 },
    },
    minimal: {
      cameraMotion: 'none',
      darkOverlay: { enabled: true, opacity: 0.4 },
      vignetteEffect: { enabled: false, intensity: 0 },
    },
    energetic: {
      cameraMotion: 'ken-burns-out',
      zoomIntensity: 1.6,
      darkOverlay: { enabled: true, opacity: 0.2 },
      particleEffect: { enabled: true, type: 'dust', intensity: 0.7 },
    },
    serene: {
      cameraMotion: 'slow-pan-left',
      panAmount: 10,
      darkOverlay: { enabled: false, opacity: 0 },
      particleEffect: { enabled: true, type: 'fog', intensity: 0.5 },
    },
    futuristic: {
      cameraMotion: 'drift',
      panAmount: 12,
      darkOverlay: { enabled: true, opacity: 0.3 },
      overlayGradient: {
        enabled: true,
        colors: ['rgba(34, 197, 94, 0.1)', 'rgba(59, 130, 246, 0.1)'],
        opacity: 0.2,
      },
      particleEffect: { enabled: true, type: 'stars', intensity: 0.5 },
    },
    nature: {
      cameraMotion: 'slow-pan-left',
      panAmount: 10,
      darkOverlay: { enabled: false, opacity: 0 },
      particleEffect: { enabled: true, type: 'fog', intensity: 0.5 },
    },
    urban: {
      cameraMotion: 'ken-burns-out',
      zoomIntensity: 1.4,
      darkOverlay: { enabled: true, opacity: 0.2 },
      particleEffect: { enabled: true, type: 'dust', intensity: 0.5 },
    },
  };

  const baseConfig = (configs[mood as string] || configs.minimal) as Partial<CinematicConfig>;

  return {
    cameraMotion: baseConfig.cameraMotion || 'none',
    zoomIntensity: baseConfig.zoomIntensity || 1,
    focusPoint: baseConfig.focusPoint || { x: 0.5, y: 0.5 },
    panAmount: baseConfig.panAmount || 0,
    darkOverlay: baseConfig.darkOverlay || { enabled: true, opacity: 0.2 },
    overlayGradient: baseConfig.overlayGradient,
    vignetteEffect: baseConfig.vignetteEffect,
    particleEffect: baseConfig.particleEffect,
  };
}

/**
 * Select best asset for scene
 */
export async function selectAsset(
  keywords: string[],
  criteria: AssetSelectionCriteria,
  fallbackToCache: boolean = true,
): Promise<DownloadedAsset | null> {
  try {
    // Search for assets
    const assets = await assetProviders.searchAssets(keywords, criteria);

    if (assets.length > 0) {
      return assets[0]; // Return top result
    }

    if (fallbackToCache) {
      console.warn(`[AssetSelection] No assets found for keywords: ${keywords.join(', ')}`);
    }

    return null;
  } catch (error) {
    console.error('[AssetSelection] Asset selection failed:', error);
    return null;
  }
}

/**
 * Download and cache asset
 */
export async function fetchAndCacheAsset(asset: DownloadedAsset): Promise<string | null> {
  try {
    const provider = assetProviders.getProvider(asset.provider);
    if (!provider) {
      throw new Error(`Provider not found: ${asset.provider}`);
    }

    // Download and cache the asset
    const localPath = await assetCache.downloadAndCache(asset, async () => {
      return await provider.downloadAsset(asset.url);
    });

    return localPath;
  } catch (error) {
    console.error('[AssetSelection] Failed to fetch and cache asset:', error);
    return null;
  }
}

/**
 * Enrich scene with cinematic configuration and assets
 */
export async function enrichSceneWithAssets(scene: CinematicScene): Promise<CinematicScene> {
  try {
    const enriched = { ...scene };

    // Initialize visualKeywords if not set (extract from visual description)
    if (!enriched.visualKeywords || enriched.visualKeywords.length === 0) {
      // Extract keywords from visual description and headline
      const keywords = new Set<string>();
      
      // Add words from visual description
      if (enriched.visual) {
        enriched.visual.toLowerCase().split(/\s+/).forEach(word => {
          if (word.length > 3 && !['with', 'from', 'that', 'this', 'have', 'been'].includes(word)) {
            keywords.add(word);
          }
        });
      }
      
      // Add words from headline
      if (enriched.headline) {
        enriched.headline.toLowerCase().split(/\s+/).forEach(word => {
          if (word.length > 3) {
            keywords.add(word);
          }
        });
      }
      
      enriched.visualKeywords = Array.from(keywords).slice(0, 5); // Limit to 5 keywords
    }

    // Analyze visual keywords if not already set
    if (enriched.visualKeywords && enriched.visualKeywords.length > 0) {
      const analysis = analyzeVisualKeywords(enriched.visualKeywords);

      enriched.assetCategory = enriched.assetCategory || analysis.category;
      enriched.mood = enriched.mood || analysis.mood;
      enriched.assetType = enriched.assetType || analysis.assetType;
    }

    // Generate cinematic config
    const mood = enriched.mood || 'minimal';
    enriched.cinematicConfig = generateCinematicConfig(mood, enriched.assetType || 'image');

    // Try to select and fetch asset
    if (enriched.visualKeywords && enriched.visualKeywords.length > 0) {
      const criteria: AssetSelectionCriteria = {
        keywords: enriched.visualKeywords,
        category: enriched.assetCategory,
        mood: enriched.mood,
        assetType: enriched.assetType,
      };

      const asset = await selectAsset(enriched.visualKeywords, criteria);
      if (asset) {
        enriched.selectedAsset = asset;
        // Try to cache it (fire and forget)
        fetchAndCacheAsset(asset).catch((err) => {
          console.warn('[AssetSelection] Background caching failed, will fallback:', err);
        });
      }
    }

    return enriched;
  } catch (error) {
    console.error('[AssetSelection] Scene enrichment failed:', error);
    return scene; // Return original if enrichment fails
  }
}

/**
 * Batch enrich multiple scenes
 */
export async function enrichScenesWithAssets(scenes: CinematicScene[]): Promise<CinematicScene[]> {
  return Promise.all(scenes.map((scene) => enrichSceneWithAssets(scene)));
}

/**
 * Get cache stats
 */
export function getCacheStats() {
  return assetCache.getCacheStats();
}

/**
 * Clear cache
 */
export async function clearAssetCache(): Promise<void> {
  await assetCache.clear();
}

