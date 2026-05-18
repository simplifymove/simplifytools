/**
 * Video Rendering Templates using Remotion
 * Export components that can be rendered as videos
 * 
 * Note: Requires Remotion to be installed
 * npm install remotion @remotion/cli
 */

import React from 'react';
import { VideoScript, AspectRatio, RemotionTemplate } from '@/app/utils/types/video-generation';

// These would be Remotion composition components
// For MVP, we'll define the interface and create simple Canvas-based alternatives

export interface TemplateProps {
  script: VideoScript;
  backgroundColor?: string;
  accentColor?: string;
  fontFamily?: string;
}

/**
 * Product Promo Template
 * Designed for quick product showcases and promotions
 * Features: Bold headlines, smooth transitions, CTA emphasis
 */
export const ProductPromoTemplate: React.FC<TemplateProps> = ({ script, backgroundColor = '#ffffff' }) => {
  return (
    <div className="w-full h-full bg-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold">{script.title}</h1>
        <p className="text-lg mt-4">Product Promo - {script.duration}s</p>
      </div>
    </div>
  );
};

/**
 * Explainer Template
 * Designed for educational and explanatory videos
 * Features: Step-by-step progression, visual hierarchy, smooth pacing
 */
export const ExplainerTemplate: React.FC<TemplateProps> = ({ script }) => {
  return (
    <div className="w-full h-full bg-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold">{script.title}</h1>
        <p className="text-lg mt-4">Explainer - {script.duration}s</p>
      </div>
    </div>
  );
};

/**
 * Social Reel Template
 * Designed for short-form social media content (TikTok, Instagram Reels)
 * Features: Fast cuts, trending animations, attention-grabbing transitions
 */
export const SocialReelTemplate: React.FC<TemplateProps> = ({ script }) => {
  return (
    <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
      <div className="text-center text-white">
        <h1 className="text-3xl font-bold">{script.title}</h1>
        <p className="text-sm mt-4">Social Reel - {script.duration}s</p>
      </div>
    </div>
  );
};

/**
 * Tutorial Template
 * Designed for step-by-step how-to videos
 * Features: Clear sections, numbered progression, practical focus
 */
export const TutorialTemplate: React.FC<TemplateProps> = ({ script }) => {
  return (
    <div className="w-full h-full bg-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold">{script.title}</h1>
        <p className="text-lg mt-4">Tutorial - {script.duration}s</p>
      </div>
    </div>
  );
};

/**
 * Get template component by name
 */
export function getTemplate(templateName: RemotionTemplate): React.ComponentType<TemplateProps> {
  switch (templateName) {
    case 'ProductPromoTemplate':
      return ProductPromoTemplate;
    case 'ExplainerTemplate':
      return ExplainerTemplate;
    case 'SocialReelTemplate':
      return SocialReelTemplate;
    case 'TutorialTemplate':
      return TutorialTemplate;
    default:
      return ProductPromoTemplate;
  }
}

/**
 * Helper to determine best template for a given script style
 */
export function getTemplateForStyle(style: VideoScript['style']): RemotionTemplate {
  const styleToTemplate: Record<typeof style, RemotionTemplate> = {
    'modern': 'ProductPromoTemplate',
    'minimal': 'ExplainerTemplate',
    'corporate': 'ProductPromoTemplate',
    'social-reel': 'SocialReelTemplate',
    'explainer': 'ExplainerTemplate',
    'product-promo': 'ProductPromoTemplate',
  };

  return styleToTemplate[style] || 'ProductPromoTemplate';
}

/**
 * Aspect ratio to pixel dimensions
 */
export function getAspectRatioDimensions(aspectRatio: AspectRatio, baseWidth: number = 1080): [number, number] {
  switch (aspectRatio) {
    case '9:16':
      return [Math.round(baseWidth * 9 / 16), baseWidth];
    case '16:9':
      return [baseWidth, Math.round(baseWidth * 9 / 16)];
    case '1:1':
      return [baseWidth, baseWidth];
  }
}

/**
 * Get FPS based on template style (for smooth motion graphics)
 */
export function getOptimalFPS(style: VideoScript['style']): number {
  switch (style) {
    case 'social-reel':
      return 60; // Higher FPS for fast cuts
    case 'minimal':
      return 24; // Lower FPS for minimalist aesthetic
    default:
      return 30; // Standard FPS
  }
}
