/**
 * Canvas-based MP4 Video Generator
 * Generates motion graphics videos using HTML5 Canvas + FFmpeg
 * 
 * For production, consider upgrading to Remotion + puppeteer
 */

import { VideoScript, Scene, AspectRatio } from '@/app/utils/types/video-generation';

export interface CanvasVideoOptions {
  width: number;
  height: number;
  fps: number;
  durationSeconds: number;
}

/**
 * Get canvas dimensions for aspect ratio
 */
export function getCanvasDimensions(aspectRatio: AspectRatio): { width: number; height: number } {
  const baseWidth = 1080;
  
  switch (aspectRatio) {
    case '9:16': // Vertical (Instagram Reels, TikTok)
      return { width: Math.round(baseWidth * 9 / 16), height: baseWidth };
    case '1:1': // Square (Instagram Feed, YouTube Shorts)
      return { width: baseWidth, height: baseWidth };
    case '16:9': // Widescreen (YouTube, Vimeo)
    default:
      return { width: baseWidth, height: Math.round(baseWidth * 9 / 16) };
  }
}

/**
 * Color utilities for gradients and backgrounds
 */
export const ColorPalettes = {
  modern: {
    primary: '#7c3aed',
    secondary: '#3b82f6',
    accent: '#06b6d4',
    dark: '#1f2937',
    light: '#f9fafb',
  },
  minimal: {
    primary: '#1f2937',
    secondary: '#6b7280',
    accent: '#9ca3af',
    dark: '#000000',
    light: '#ffffff',
  },
  corporate: {
    primary: '#0f172a',
    secondary: '#1e40af',
    accent: '#3b82f6',
    dark: '#0f172a',
    light: '#f8fafc',
  },
  social: {
    primary: '#ec4899',
    secondary: '#f43f5e',
    accent: '#fbbf24',
    dark: '#1f2937',
    light: '#fef3c7',
  },
  explainer: {
    primary: '#10b981',
    secondary: '#14b8a6',
    accent: '#3b82f6',
    dark: '#059669',
    light: '#ecfdf5',
  },
};

export type PaletteKey = keyof typeof ColorPalettes;

/**
 * Animated scene renderer for canvas
 * Generates canvas drawing commands for each frame
 */
export function createSceneRenderer(scene: Scene, palette: any) {
  return {
    /**
     * Render a specific frame of the scene
     * @param ctx Canvas context
     * @param width Canvas width
     * @param height Canvas height
     * @param frameNumber Current frame number
     * @param fps Frames per second
     * @param sceneStartFrame When this scene started in the overall video
     */
    renderFrame: (ctx: CanvasRenderingContext2D, width: number, height: number, frameNumber: number, fps: number, sceneStartFrame: number) => {
      // Calculate scene progress (0 to 1)
      const sceneFrames = scene.duration * fps;
      const frameInScene = frameNumber - sceneStartFrame;
      const progress = Math.min(1, Math.max(0, frameInScene / sceneFrames));

      // Clear canvas
      ctx.clearRect(0, 0, width, height);

      // Draw background
      if (scene.background === 'gradient' && scene.gradientStart && scene.gradientEnd) {
        const gradient = ctx.createLinearGradient(0, 0, width, height);
        gradient.addColorStop(0, scene.gradientStart);
        gradient.addColorStop(1, scene.gradientEnd);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
      } else if (scene.background === 'solid') {
        ctx.fillStyle = scene.backgroundColor || palette.light;
        ctx.fillRect(0, 0, width, height);
      }

      // Apply animation effects
      const animationProgress = easeInOutCubic(progress);
      const animationTransform = getAnimationTransform(scene.animation, animationProgress, width, height);

      ctx.save();
      ctx.translate(animationTransform.x, animationTransform.y);
      ctx.globalAlpha = animationTransform.opacity;

      // Draw headline
      ctx.font = `bold ${height * 0.12}px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`;
      ctx.fillStyle = palette.dark;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Wrap text if needed
      wrapText(ctx, scene.headline, width / 2, height * 0.35, width * 0.8, height * 0.12);

      // Draw subtext
      ctx.font = `${height * 0.06}px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`;
      ctx.fillStyle = palette.secondary;
      wrapText(ctx, scene.subtext, width / 2, height * 0.55, width * 0.8, height * 0.06);

      ctx.restore();

      // Draw caption at bottom
      ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
      ctx.fillRect(0, height * 0.85, width, height * 0.15);

      ctx.font = `${height * 0.05}px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`;
      ctx.fillStyle = palette.dark;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      wrapText(ctx, scene.caption, width / 2, height * 0.925, width * 0.9, height * 0.1);
    },
  };
}

/**
 * Get animation transform values based on animation type
 */
function getAnimationTransform(
  animation: string,
  progress: number,
  width: number,
  height: number
): { x: number; y: number; opacity: number } {
  switch (animation) {
    case 'fade':
      return { x: 0, y: 0, opacity: progress };
    case 'slide-up':
      return { x: 0, y: height * (1 - progress), opacity: 1 };
    case 'slide-down':
      return { x: 0, y: -height * (1 - progress), opacity: 1 };
    case 'slide-left':
      return { x: width * (1 - progress), y: 0, opacity: 1 };
    case 'slide-right':
      return { x: -width * (1 - progress), y: 0, opacity: 1 };
    case 'zoom-in':
      return { x: 0, y: 0, opacity: 1 }; // Note: Scale would need ctx.scale()
    case 'zoom-out':
      return { x: 0, y: 0, opacity: 1 };
    case 'bounce':
      return { x: 0, y: easeOutBounce(progress) * height * 0.1, opacity: 1 };
    default:
      return { x: 0, y: 0, opacity: 1 };
  }
}

/**
 * Easing functions
 */
function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function easeOutBounce(t: number): number {
  const n1 = 7.5625;
  const d1 = 2.75;

  if (t < 1 / d1) {
    return n1 * t * t;
  } else if (t < 2 / d1) {
    return n1 * (t -= 1.5 / d1) * t + 0.75;
  } else if (t < 2.5 / d1) {
    return n1 * (t -= 2.25 / d1) * t + 0.9375;
  } else {
    return n1 * (t -= 2.625 / d1) * t + 0.984375;
  }
}

/**
 * Text wrapping utility for canvas
 */
function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
): void {
  const words = text.split(' ');
  let line = '';
  let currentY = y;

  for (let word of words) {
    const testLine = line + word + ' ';
    const testWidth = ctx.measureText(testLine).width;

    if (testWidth > maxWidth && line.length > 0) {
      ctx.fillText(line, x, currentY);
      line = word + ' ';
      currentY += lineHeight;
    } else {
      line = testLine;
    }
  }

  if (line) {
    ctx.fillText(line, x, currentY);
  }
}

/**
 * Determine color palette from script style
 */
export function getPaletteForStyle(style: VideoScript['style']): any {
  const styleToKey: Record<typeof style, PaletteKey> = {
    'modern': 'modern',
    'minimal': 'minimal',
    'corporate': 'corporate',
    'social-reel': 'social',
    'explainer': 'explainer',
    'product-promo': 'modern',
  };

  return ColorPalettes[styleToKey[style]];
}

/**
 * Create MP4 blob from script (placeholder)
 * In production, this would use FFmpeg to encode canvas frames
 */
export async function scriptToMP4(script: VideoScript): Promise<Blob> {
  // This is a placeholder implementation
  // In production, you would:
  // 1. Render all frames using canvas
  // 2. Use FFmpeg or similar to encode to MP4
  // 3. Return the video blob

  throw new Error('MP4 rendering requires FFmpeg backend. Use Remotion for full implementation.');
}
