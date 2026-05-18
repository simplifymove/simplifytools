/**
 * Video Composition Utilities
 * Helper functions for aspect ratios, frame rates, and layouts
 */

import { VideoStyle, AspectRatio } from '@/app/utils/types/video-generation';

/**
 * Convert aspect ratio string to width/height resolution
 */
export const getResolutionFromAspectRatio = (
  aspectRatio: AspectRatio
): { width: number; height: number } => {
  switch (aspectRatio) {
    case '9:16':
      return { width: 1080, height: 1920 }; // Vertical/Instagram Reels
    case '1:1':
      return { width: 1080, height: 1080 }; // Square
    case '16:9':
    default:
      return { width: 1920, height: 1080 }; // Horizontal/YouTube
  }
};

/**
 * Get frames per second based on video style
 */
export const getFramesPerSecond = (style: VideoStyle): number => {
  const fpsMap: Record<VideoStyle, number> = {
    modern: 30,
    minimal: 24,
    corporate: 30,
    'social-reel': 60, // Higher fps for smooth fast-paced content
    explainer: 30,
    'product-promo': 30,
  };
  return fpsMap[style] || 30;
};

/**
 * Calculate total frames for a video
 */
export const calculateTotalFrames = (durationSeconds: number, fps: number): number => {
  return Math.round(durationSeconds * fps);
};

/**
 * Calculate scene start frame position
 */
export const calculateSceneFrames = (
  durationSeconds: number,
  fps: number
): { frame: number; durationFrames: number } => {
  return {
    frame: 0,
    durationFrames: Math.round(durationSeconds * fps),
  };
};

/**
 * Validate aspect ratio
 */
export const isValidAspectRatio = (ratio: string): ratio is AspectRatio => {
  return ['9:16', '16:9', '1:1'].includes(ratio);
};

/**
 * Validate video style
 */
export const isValidVideoStyle = (style: string): style is VideoStyle => {
  return ['modern', 'minimal', 'corporate', 'social-reel', 'explainer', 'product-promo'].includes(
    style
  );
};
