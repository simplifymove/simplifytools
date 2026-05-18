/**
 * Remotion composition types and interfaces
 */

export type LayoutType = 'centered-hero' | 'split-left' | 'split-right' | 'lower-third' | 'card-overlay' | 'full-screen' | 'product-hero' | 'feature' | 'split-feature' | 'dashboard' | 'cta-outro';
export type AnimationType = 'fade' | 'slide-up' | 'slide-down' | 'slide-left' | 'slide-right' | 'zoom-in' | 'zoom-out' | 'bounce' | 'none';
export type BackgroundType = 'gradient' | 'image' | 'blob' | 'particles' | 'glassmorphism';

export interface CompositionConfig {
  width: number;
  height: number;
  fps: number;
  durationInFrames: number;
  aspectRatio: '16:9' | '9:16' | '1:1';
}

export interface SceneConfig {
  id: number;
  duration: number;
  durationFrames: number;
  headline: string;
  subtext: string;
  animation: AnimationType;
  layout: LayoutType;
  background: {
    type: BackgroundType;
    color?: string;
    gradientStart?: string;
    gradientEnd?: string;
    imageUrl?: string;
    overlayOpacity?: number;
  };
  icon?: {
    name: string;
    color?: string;
    size?: number;
  };
  theme: ThemeConfig;
  delayMs?: number;
}

export interface ThemeConfig {
  name: 'modern' | 'minimal' | 'corporate' | 'social-reel' | 'explainer' | 'product-promo';
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    text: string;
    background: string;
  };
  typography: {
    headlineSize: number;
    subtextSize: number;
    family: string;
    weight: number;
  };
  spacing: {
    padding: number;
    gap: number;
  };
  gradients?: {
    start: string;
    end: string;
  };
}

export const THEMES: Record<string, ThemeConfig> = {
  modern: {
    name: 'modern',
    colors: {
      primary: '#00d9ff',
      secondary: '#ff006e',
      accent: '#ffbe0b',
      text: '#ffffff',
      background: '#0a0e27',
    },
    typography: {
      headlineSize: 72,
      subtextSize: 32,
      family: '"Inter", "Helvetica Neue", sans-serif',
      weight: 700,
    },
    spacing: {
      padding: 60,
      gap: 32,
    },
    gradients: {
      start: '#00d9ff',
      end: '#ff006e',
    },
  },
  minimal: {
    name: 'minimal',
    colors: {
      primary: '#000000',
      secondary: '#ffffff',
      accent: '#f0f0f0',
      text: '#000000',
      background: '#ffffff',
    },
    typography: {
      headlineSize: 64,
      subtextSize: 28,
      family: '"Helvetica Neue", sans-serif',
      weight: 500,
    },
    spacing: {
      padding: 80,
      gap: 40,
    },
  },
  corporate: {
    name: 'corporate',
    colors: {
      primary: '#003366',
      secondary: '#0066cc',
      accent: '#0099ff',
      text: '#ffffff',
      background: '#001a33',
    },
    typography: {
      headlineSize: 68,
      subtextSize: 30,
      family: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
      weight: 600,
    },
    spacing: {
      padding: 70,
      gap: 36,
    },
    gradients: {
      start: '#003366',
      end: '#0066cc',
    },
  },
  'social-reel': {
    name: 'social-reel',
    colors: {
      primary: '#ff1493',
      secondary: '#ff69b4',
      accent: '#ffb6c1',
      text: '#ffffff',
      background: '#1a1a1a',
    },
    typography: {
      headlineSize: 76,
      subtextSize: 34,
      family: '"Poppins", sans-serif',
      weight: 800,
    },
    spacing: {
      padding: 50,
      gap: 28,
    },
    gradients: {
      start: '#ff1493',
      end: '#ff69b4',
    },
  },
  explainer: {
    name: 'explainer',
    colors: {
      primary: '#667eea',
      secondary: '#764ba2',
      accent: '#f093fb',
      text: '#ffffff',
      background: '#1a1a2e',
    },
    typography: {
      headlineSize: 66,
      subtextSize: 30,
      family: '"Nunito", sans-serif',
      weight: 600,
    },
    spacing: {
      padding: 65,
      gap: 34,
    },
    gradients: {
      start: '#667eea',
      end: '#764ba2',
    },
  },
  'product-promo': {
    name: 'product-promo',
    colors: {
      primary: '#ff6b6b',
      secondary: '#4ecdc4',
      accent: '#ffd93d',
      text: '#ffffff',
      background: '#2d3436',
    },
    typography: {
      headlineSize: 70,
      subtextSize: 32,
      family: '"Montserrat", sans-serif',
      weight: 700,
    },
    spacing: {
      padding: 60,
      gap: 32,
    },
    gradients: {
      start: '#ff6b6b',
      end: '#4ecdc4',
    },
  },
};
