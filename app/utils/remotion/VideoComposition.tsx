/**
 * Main Video Composition Component
 * Orchestrates all scenes and creates the final video structure
 */

import React, { useMemo } from 'react';
import { useVideoConfig, AbsoluteFill } from 'remotion';
import { VideoScript, VideoStyle } from '@/app/utils/types/video-generation';
import { SceneRenderer } from './SceneRenderer';
import { CTASection } from './CTASection';
import { THEMES } from './types';
import { getFramesPerSecond } from './composition-utils';
import { getCurrentScript } from './script-context';

interface VideoCompositionContentProps {
  script: VideoScript;
}

/**
 * Main video composition content component
 * This is what Remotion renders frame by frame
 */
export const VideoCompositionContent: React.FC<VideoCompositionContentProps> = ({ script: propsScript }) => {
  // CRITICAL: Try to get script from props first, then fall back to context/module variable
  const script = propsScript || getCurrentScript();

  if (!script) {
    console.error('❌ FATAL: VideoCompositionContent received undefined script!');
    console.error('This means inputProps are not being passed correctly AND context is not set');
    return (
      <AbsoluteFill style={{ backgroundColor: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'white', fontSize: '48px', fontWeight: 'bold' }}>
          ❌ NO SCRIPT PROVIDED
        </div>
      </AbsoluteFill>
    );
  }

  const { durationInFrames, width, height, fps } = useVideoConfig();

  // 🔴 CRITICAL DEBUG: Log which script is being received
  console.log('\n╔═══════════════════════════════════════════════════════════════╗');
  console.log('║ 🎬 VIDEO COMPOSITION CONTENT: Script received                ║');
  console.log('╚═══════════════════════════════════════════════════════════════╝');
  console.log(`Title: ${script?.title || 'UNDEFINED'}`);
  console.log(`Scenes: ${script?.scenes?.length || 'UNDEFINED'}`);
  console.log(`First scene headline: ${script?.scenes?.[0]?.headline || 'UNDEFINED'}`);
  console.log(`First scene has mood: ${!!(script?.scenes?.[0] as any)?.mood}`);
  console.log(`First scene has cinematicConfig: ${!!(script?.scenes?.[0] as any)?.cinematicConfig}`);
  console.log(`First scene has selectedAsset: ${!!(script?.scenes?.[0] as any)?.selectedAsset}`);
  console.log('╔═══════════════════════════════════════════════════════════════╗\n');

  // Calculate scene timing
  const sceneTimings = useMemo(() => {
    let currentFrame = 0;
    return script.scenes.map((scene) => {
      const sceneDurationFrames = Math.round(scene.duration * fps);
      const sceneStartFrame = currentFrame;
      currentFrame += sceneDurationFrames;

      return {
        scene,
        sceneStartFrame,
        sceneDurationFrames,
      };
    });
  }, [script.scenes, fps]);

  // Calculate CTA timing (remaining duration after scenes)
  const totalSceneFrames = sceneTimings.reduce((sum, timing) => sum + timing.sceneDurationFrames, 0);
  const ctaDurationFrames = Math.max(0, durationInFrames - totalSceneFrames);
  const ctaStartFrame = totalSceneFrames;

  return (
    <div
      style={{
        width,
        height,
        backgroundColor: THEMES[script.style as VideoStyle].colors.background,
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Render all scenes */}
      {sceneTimings.map(({ scene, sceneStartFrame, sceneDurationFrames }, idx) => (
        <div
          key={`scene-${idx}`}
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            top: 0,
            left: 0,
          }}
        >
          <SceneRenderer
            scene={scene}
            sceneStartFrame={sceneStartFrame}
            sceneDurationFrames={sceneDurationFrames}
            style={script.style as VideoStyle}
            width={width}
            height={height}
          />
        </div>
      ))}

      {/* Render CTA section */}
      {ctaDurationFrames > 0 && (
        <div
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            top: 0,
            left: 0,
          }}
        >
          <CTASection
            text={script.cta || 'Get Started'}
            subtext={script.captions[script.captions.length - 1]}
            ctaButtonText="Watch Now"
            theme={THEMES[script.style as VideoStyle]}
            durationFrames={ctaDurationFrames}
            startFrame={ctaStartFrame}
          />
        </div>
      )}
    </div>
  );
};
