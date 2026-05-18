/**
 * Scene Renderer Component - ADVANCED VERSION
 * Routes scenes to modern SaaS-style preset layouts with rich visual assets
 * Uses animated components, parallax effects, and cinematic motion
 */

import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, Easing, AbsoluteFill } from 'remotion';
import { Scene, VideoStyle } from '@/app/utils/types/video-generation';
import { THEMES, ThemeConfig, LayoutType } from './types';
import {
  ProductHeroScene,
  FeatureScene,
  SplitFeatureScene,
  DashboardScene,
} from './ModernScenePresets';
import {
  SaaSHeroScene,
  FileConversionScene,
  DashboardFeatureScene,
  AIProductScene,
  SecurityFeatureScene,
  CTAOutroScene,
} from './AdvancedScenes';
import { CinematicBackgroundDebug } from './CinematicBackgroundDebug';
import { selectCinematicScenePreset } from './CinematicScenePresets';

interface SceneRendererProps {
  scene: Scene;
  sceneStartFrame: number;
  sceneDurationFrames: number;
  style: VideoStyle;
  width: number;
  height: number;
}

export const SceneRenderer: React.FC<SceneRendererProps> = ({
  scene,
  sceneStartFrame,
  sceneDurationFrames,
  style,
  width,
  height,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const theme = THEMES[style];

  // LOG SCENE PROPS FOR DEBUGGING
  React.useEffect(() => {
    if (frame === sceneStartFrame) {
      console.log('\n' + '='.repeat(80));
      console.log('🎬 SCENE RENDERER - RENDERING SCENE');
      console.log('='.repeat(80));
      console.log('📋 Full Scene Props:');
      console.log(JSON.stringify(scene, null, 2));
      console.log('='.repeat(80) + '\n');
    }
  }, [frame, sceneStartFrame, scene]);

  // Calculate progress through this scene (0-1)
  const sceneProgress = Math.max(0, Math.min(1, (frame - sceneStartFrame) / sceneDurationFrames));

  // Check if scene has cinematic enrichment (new system)
  const hasCinematicEnrichment = !!(
    (scene as any).selectedAsset ||
    (scene as any).cinematicConfig ||
    (scene as any).mood
  );

  // 🔴 CRITICAL DEBUG: Log scene structure
  console.log('\n╔══════════════════════════════════════════════════════════╗');
  console.log('║ 🎬 SCENERENDERER: Scene object structure                 ║');
  console.log('╚══════════════════════════════════════════════════════════╝');
  console.log(`Headline: ${(scene as any).headline}`);
  console.log(`Has selectedAsset: ${!!(scene as any).selectedAsset}`);
  console.log(`Has cinematicConfig: ${!!(scene as any).cinematicConfig}`);
  console.log(`Has mood: ${!!(scene as any).mood}`);
  console.log(`hasCinematicEnrichment: ${hasCinematicEnrichment}`);
  if ((scene as any).selectedAsset) {
    console.log(`Asset URL: ${(scene as any).selectedAsset.url?.substring(0, 80)}`);
  }
  if ((scene as any).mood) {
    console.log(`Mood: ${(scene as any).mood}`);
  }
  console.log('╔══════════════════════════════════════════════════════════╗\n');

  // If scene has cinematic enrichment, use new system
  if (hasCinematicEnrichment) {
    const enrichedScene = scene as any;
    
    console.log('✨ Using CINEMATIC PRESET system for:', enrichedScene.headline);
    console.log('📦 Asset details:', {
      hasAsset: !!enrichedScene.selectedAsset,
      assetUrl: enrichedScene.selectedAsset?.url?.substring(0, 80),
      assetProvider: enrichedScene.selectedAsset?.provider,
      assetType: enrichedScene.selectedAsset?.type,
      cachedPath: enrichedScene.selectedAsset?.cachedPath,
    });

    // Select preset based on mood
    const PresetComponent = selectCinematicScenePreset(enrichedScene.mood || 'cinematic');

    // Render with CinematicBackgroundDebug and preset
    return (
      <CinematicBackgroundDebug
        asset={enrichedScene.selectedAsset}
        config={enrichedScene.cinematicConfig || {
          cameraMotion: 'none',
          zoomIntensity: 1,
          focusPoint: { x: 0.5, y: 0.5 },
          panAmount: 0,
          darkOverlay: { enabled: true, opacity: 0.3 },
          vignetteEffect: { enabled: false, intensity: 0.3 },
        }}
        duration={sceneDurationFrames}
        width={width}
        height={height}
        sceneKeywords={(enrichedScene as any).visualKeywords}
        sceneMood={enrichedScene.mood}
        assetSelected={!!enrichedScene.selectedAsset}
      >
        <PresetComponent
          scene={enrichedScene}
          sceneStartFrame={sceneStartFrame}
          duration={sceneDurationFrames}
          style={theme}
        />
      </CinematicBackgroundDebug>
    );
  }

  // Fallback to old system for backward compatibility
  console.log('⚠️ Using LEGACY preset system (no cinematic enrichment)');
  
  // Detect scene type and use appropriate advanced composition
  const detectedType = detectSceneType(scene);

  // Route to appropriate advanced scene template based on detected type
  switch (detectedType) {
    case 'saas-hero':
      return (
        <SaaSHeroScene
          title={scene.headline || 'Welcome'}
          subtitle={scene.subtext || scene.visual || ''}
          theme={theme}
          duration={sceneDurationFrames}
        />
      );

    case 'file-conversion':
      return (
        <FileConversionScene
          fromFormat={extractFileFormat(scene.visual, 'from') || 'PDF'}
          toFormat={extractFileFormat(scene.visual, 'to') || 'Word'}
          theme={theme}
          duration={sceneDurationFrames}
        />
      );

    case 'dashboard':
      return (
        <DashboardFeatureScene
          title={scene.headline || 'Analytics'}
          description={scene.subtext || scene.visual || ''}
          theme={theme}
          duration={sceneDurationFrames}
        />
      );

    case 'ai-product':
      return (
        <AIProductScene
          headline={scene.headline || 'AI-Powered Features'}
          features={extractFeatures(scene.subtext)}
          theme={theme}
          duration={sceneDurationFrames}
        />
      );

    case 'security':
      return (
        <SecurityFeatureScene
          title={scene.headline || 'Enterprise Security'}
          description={scene.subtext || scene.visual || ''}
          theme={theme}
          duration={sceneDurationFrames}
        />
      );

    case 'cta-outro':
      return (
        <CTAOutroScene
          headline={scene.headline || 'Ready to Get Started?'}
          subheading={scene.subtext || 'Join thousands of satisfied customers'}
          ctaText={scene.voiceoverText?.substring(0, 30) || 'Get Started Today'}
          theme={theme}
          duration={sceneDurationFrames}
        />
      );

    // Fallback to classic modern presets
    case 'product-hero':
    default:
      return (
        <ProductHeroScene
          scene={scene}
          progress={sceneProgress}
          theme={theme}
          width={width}
          height={height}
          startFrame={sceneStartFrame}
          durationFrames={sceneDurationFrames}
        />
      );
  }
};

/**
 * Detect the visual story type from scene content
 */
function detectSceneType(scene: Scene): string {
  const content = `${scene.headline} ${scene.subtext} ${scene.visual}`.toLowerCase();

  // CTA/Outro detection
  if (
    content.includes('get started') ||
    content.includes('sign up') ||
    content.includes('join') ||
    content.includes('start your') ||
    content.includes('ready to')
  ) {
    return 'cta-outro';
  }

  // File conversion detection
  if (
    content.includes('convert') ||
    content.includes('transformation') ||
    content.includes('from') ||
    content.includes('to') ||
    content.includes('pdf') ||
    content.includes('word') ||
    content.includes('image') ||
    content.includes('video')
  ) {
    return 'file-conversion';
  }

  // Dashboard/analytics detection
  if (
    content.includes('dashboard') ||
    content.includes('analytics') ||
    content.includes('data') ||
    content.includes('metrics') ||
    content.includes('monitor')
  ) {
    return 'dashboard';
  }

  // Security detection
  if (
    content.includes('secure') ||
    content.includes('security') ||
    content.includes('encrypted') ||
    content.includes('protect') ||
    content.includes('safe')
  ) {
    return 'security';
  }

  // AI product detection
  if (
    content.includes('ai') ||
    content.includes('machine learning') ||
    content.includes('intelligent') ||
    content.includes('automatic')
  ) {
    return 'ai-product';
  }

  // Default to SaaS hero for professional intro
  return 'saas-hero';
}

/**
 * Extract file formats from visual description
 */
function extractFileFormat(visual: string | undefined, direction: 'from' | 'to'): string | null {
  if (!visual) return null;

  const formats = ['PDF', 'Word', 'Excel', 'PNG', 'JPG', 'MP4', 'WebM', 'GIF', 'SVG'];
  const pattern = direction === 'from' ? /from\s+(\w+)/i : /to\s+(\w+)/i;
  const match = visual.match(pattern);

  if (match) {
    const format = match[1].toUpperCase();
    if (formats.includes(format)) return format;
  }

  return null;
}

/**
 * Extract features from description
 */
function extractFeatures(description: string | undefined): string[] {
  if (!description) return ['Feature 1', 'Feature 2', 'Feature 3'];

  // Split by common delimiters
  const features = description
    .split(/[,;•\-]/)
    .map((f) => f.trim())
    .filter((f) => f.length > 0)
    .slice(0, 3);

  return features.length > 0 ? features : ['Feature 1', 'Feature 2', 'Feature 3'];
}
