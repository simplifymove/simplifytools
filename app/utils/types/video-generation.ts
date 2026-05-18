/**
 * Video Generation Types and Schemas
 * Defines structures for Groq-generated video scripts and Remotion rendering
 */

// Video generation request options
export type VideoStyle = 'modern' | 'minimal' | 'corporate' | 'social-reel' | 'explainer' | 'product-promo';
export type AspectRatio = '9:16' | '16:9' | '1:1';
export type Duration = 15 | 30 | 45;
export type Tone = 'professional' | 'friendly' | 'energetic' | 'educational';

export interface VideoGenerationRequest {
  prompt: string;
  style: VideoStyle;
  aspectRatio: AspectRatio;
  duration: Duration;
  tone: Tone;
  ctaText?: string;
  brand?: {
    name?: string;
    colors?: {
      primary?: string;
      secondary?: string;
    };
    logoUrl?: string;
  };
}

// Groq-generated scene structure
export interface Scene {
    layout?: string;
  id: number;
  duration: number; // in seconds
  headline: string;
  subtext: string;
  visual: string; // Description of what should be shown
  animation: 'fade' | 'slide-up' | 'slide-down' | 'slide-left' | 'slide-right' | 'zoom-in' | 'zoom-out' | 'bounce' | 'none';
  background: 'solid' | 'gradient' | 'pattern' | 'image';
  backgroundColor?: string;
  gradientStart?: string;
  gradientEnd?: string;
  backgroundImage?: string; // URL or local path to background image
  backgroundVideo?: string; // Optional: URL or local path to background video (future use)
  overlayOpacity?: number; // 0-1, dark overlay opacity on image (default 0.3)
  iconName?: string; // Lucide icon name
  caption: string;
  voiceoverText?: string;
  
  // Cinematic enrichment properties (added during asset enrichment)
  visualKeywords?: string[];
  visualDirection?: string;
  assetCategory?: string;
  assetType?: string;
  mood?: string;
  cameraMotion?: string;
  cinematicConfig?: any; // CinematicConfig interface
  selectedAsset?: any; // DownloadedAsset interface
  fallbackToGradient?: boolean;
}

// Groq JSON response schema
export interface VideoScript {
  title: string;
  aspectRatio: AspectRatio;
  duration: Duration;
  style: VideoStyle;
  tone: Tone;
  voiceover: string; // Full voiceover script
  scenes: Scene[];
  captions: string[];
  cta: string;
  music?: {
    genre?: string;
    intensity?: 'low' | 'medium' | 'high';
  };
}

// API request/response types
export interface GenerateScriptRequest {
  prompt: string;
  style: VideoStyle;
  aspectRatio: AspectRatio;
  duration: Duration;
  tone: Tone;
  ctaText?: string;
}

export interface GenerateScriptResponse {
  ok: boolean;
  script?: VideoScript;
  error?: string;
  generationId?: string;
}

export interface RenderVideoRequest {
  script: VideoScript;
  voiceoverUrl?: string; // Optional pre-generated voiceover audio
}

export interface RenderVideoResponse {
  ok: boolean;
  videoUrl?: string;
  videoBase64?: string;
  duration?: number;
  fileSize?: number;
  error?: string;
  generationId?: string;
  renderer?: 'remotion' | 'ffmpeg';
}

// Client-side state
export interface VideoGenerationState {
  step: 'input' | 'generating-script' | 'preview-script' | 'rendering-video' | 'complete' | 'error';
  request?: VideoGenerationRequest;
  script?: VideoScript;
  videoUrl?: string;
  error?: string;
  progress: number; // 0-100
  elapsedTime: number; // in seconds
}

// Template types for Remotion
export type RemotionTemplate = 'ProductPromoTemplate' | 'ExplainerTemplate' | 'SocialReelTemplate' | 'TutorialTemplate';

export interface RemotionRenderProps {
  script: VideoScript;
  template: RemotionTemplate;
  fps: number;
  durationMs: number;
}
