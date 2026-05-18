/**
 * Cinematic Asset Types and Schemas
 * Defines structures for asset-based video rendering with real visuals
 */

// Asset types supported by the renderer
export type AssetType = 'video' | 'image' | 'illustration' | 'ui-mockup' | 'animated-overlay';

// Asset providers
export type AssetProvider = 'pexels' | 'pixabay' | 'unsplash' | 'undraw' | 'local' | 'generated';

// Visual mood/tone for asset selection
export type VisualMood = 'cinematic' | 'corporate' | 'playful' | 'minimal' | 'energetic' | 'serene' | 'futuristic' | 'nature' | 'urban';

// Camera motion types
export type CameraMotion = 'none' | 'slow-pan-left' | 'slow-pan-right' | 'slow-pan-up' | 'slow-pan-down' | 'ken-burns-in' | 'ken-burns-out' | 'drift';

// Asset category for smart selection
export type AssetCategory = 'nature' | 'technology' | 'business' | 'lifestyle' | 'abstract' | 'ui' | 'illustration' | 'people' | 'data-viz' | 'urban';

// Downloaded asset metadata
export interface DownloadedAsset {
  id: string;
  url: string;
  provider: AssetProvider;
  type: AssetType;
  keywords: string[];
  cachedPath?: string;
  cachedAt?: number;
  expiresAt?: number; // Cache TTL
  metadata?: {
    width?: number;
    height?: number;
    duration?: number; // For videos
    photographer?: string;
  };
}

// Asset selection criteria
export interface AssetSelectionCriteria {
  keywords: string[];
  category?: AssetCategory;
  mood?: VisualMood;
  assetType?: AssetType;
  aspectRatio?: '16:9' | '9:16' | '1:1';
  minQuality?: 'low' | 'medium' | 'high';
}

// Cinematic rendering configuration
export interface CinematicConfig {
  backgroundAsset?: DownloadedAsset;
  cameraMotion: CameraMotion;
  focusPoint?: { x: number; y: number }; // For Ken Burns zoom focus
  zoomIntensity?: number; // 1-3, default 1.5
  panAmount?: number; // pixels to pan
  overlayGradient?: {
    enabled: boolean;
    colors: [string, string]; // from, to
    opacity: number;
  };
  darkOverlay?: {
    enabled: boolean;
    opacity: number; // 0-1
  };
  vignetteEffect?: {
    enabled: boolean;
    intensity: number; // 0-1
  };
  particleEffect?: {
    enabled: boolean;
    type: 'dust' | 'light-rays' | 'fog' | 'stars' | 'rain' | 'snow';
    intensity: number; // 0-1
  };
  depthBlur?: {
    enabled: boolean;
    blurAmount: number; // pixels
  };
}

// Extended scene with visual assets
export interface CinematicScene {
  // Original scene fields
  id: number;
  duration: number;
  headline: string;
  subtext: string;
  visual: string;
  animation: string;
  background: string;
  caption: string;
  voiceoverText?: string;
  
  // New cinematic fields
  visualKeywords: string[];
  visualDirection?: string; // e.g., "show forest with waterfall"
  assetCategory?: AssetCategory;
  assetType?: AssetType;
  mood?: VisualMood;
  cameraMotion?: CameraMotion;
  
  // Rendering config
  cinematicConfig?: CinematicConfig;
  
  // Asset selection and fallback
  selectedAsset?: DownloadedAsset;
  fallbackToGradient?: boolean; // If asset fetch fails
}

// Asset provider interface
export interface IAssetProvider {
  name: AssetProvider;
  search(keywords: string[], criteria: AssetSelectionCriteria): Promise<DownloadedAsset[]>;
  getAssetUrl(asset: DownloadedAsset): string;
  isAvailable(): Promise<boolean>;
}

// Asset cache entry
export interface CacheEntry {
  asset: DownloadedAsset;
  localPath: string;
  timestamp: number;
  ttl: number; // milliseconds
}

// Asset cache store
export interface AssetCache {
  [key: string]: CacheEntry;
}

// Groq response with visual metadata
export interface CinematicVideoScript {
  title: string;
  aspectRatio: string;
  duration: number;
  style: string;
  tone: string;
  voiceover: string;
  scenes: CinematicScene[];
  captions: string[];
  cta: string;
  music?: {
    genre?: string;
    intensity?: string;
  };
  visualTheme?: {
    primaryMood: VisualMood;
    colorPalette?: string[];
    cinematicStyle?: 'documentary' | 'promotional' | 'narrative' | 'abstract';
  };
}
