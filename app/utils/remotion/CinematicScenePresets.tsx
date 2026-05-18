/**
 * Cinematic Scene Presets
 * Advanced, professionally-styled scenes with real asset integration
 * Each preset combines visual assets, animations, overlays, and effects
 */

import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { CinematicBackground } from './CinematicBackground';
import { CinematicScene, CinematicConfig, DownloadedAsset } from '../types/cinematic-assets';

interface CinematicScenePresetProps {
  scene: CinematicScene;
  sceneStartFrame: number;
  duration: number;
  style: any; // ThemeConfig
}

/**
 * Nature/Cinematic Hero Scene
 * Real landscape videos with slow camera motion and text overlay
 */
export const CinematicNatureScene: React.FC<CinematicScenePresetProps> = ({
  scene,
  sceneStartFrame,
  duration,
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // Text entrance animation
  const textEnter = spring({
    frame: frame - sceneStartFrame,
    fps,
    config: { damping: 10, mass: 0.8, stiffness: 100 },
    durationInFrames: 40,
  });

  const textY = interpolate(textEnter, [0, 1], [60, 0]);
  const textOpacity = interpolate(textEnter, [0, 1], [0, 1]);

  const cinematicConfig = scene.cinematicConfig || {
    cameraMotion: 'slow-pan-left',
    darkOverlay: { enabled: true, opacity: 0.35 },
    vignetteEffect: { enabled: true, intensity: 0.3 },
    particleEffect: { enabled: true, type: 'light-rays', intensity: 0.5 },
  };

  return (
    <AbsoluteFill>
      <CinematicBackground
        asset={scene.selectedAsset}
        config={cinematicConfig}
        duration={duration}
        width={width}
        height={height}
      >
        {/* Centered text content */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            textAlign: 'center',
            transform: `translateY(${textY}px)`,
            opacity: textOpacity,
            zIndex: 20,
          }}
        >
          <div style={{ maxWidth: '90%', padding: '40px' }}>
            <h1
              style={{
                fontSize: width > 800 ? 72 : 48,
                fontWeight: 800,
                margin: '0 0 20px 0',
                textShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
                letterSpacing: '-0.02em',
              }}
            >
              {scene.headline}
            </h1>
            <p
              style={{
                fontSize: width > 800 ? 28 : 18,
                fontWeight: 300,
                margin: 0,
                textShadow: '0 2px 10px rgba(0, 0, 0, 0.5)',
                letterSpacing: '0.01em',
              }}
            >
              {scene.subtext}
            </p>
          </div>
        </div>
      </CinematicBackground>
    </AbsoluteFill>
  );
};

/**
 * Corporate/Business Scene
 * Professional UI mockups or office imagery with accent colors
 */
export const CinematicCorporateScene: React.FC<CinematicScenePresetProps> = ({
  scene,
  sceneStartFrame,
  duration,
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // Left-side text animation
  const textSlide = spring({
    frame: frame - sceneStartFrame,
    fps,
    config: { damping: 12, mass: 0.9, stiffness: 110 },
    durationInFrames: 35,
  });

  const textX = interpolate(textSlide, [0, 1], [-100, 0]);
  const textOpacity = interpolate(textSlide, [0, 1], [0, 1]);

  const cinematicConfig = scene.cinematicConfig || {
    cameraMotion: 'slow-pan-right',
    panAmount: 10,
    darkOverlay: { enabled: true, opacity: 0.25 },
    overlayGradient: {
      enabled: true,
      colors: [`${style.primary || '#3b82f6'}40`, `${style.secondary || '#8b5cf6'}40`],
      opacity: 0.2,
    },
  };

  return (
    <AbsoluteFill>
      <CinematicBackground
        asset={scene.selectedAsset}
        config={cinematicConfig}
        duration={duration}
        width={width}
        height={height}
      >
        {/* Left-aligned content */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: '50%',
            transform: `translate(${textX}px, -50%)`,
            opacity: textOpacity,
            maxWidth: '50%',
            paddingLeft: '60px',
            color: 'white',
            zIndex: 20,
          }}
        >
          <div
            style={{
              display: 'inline-block',
              paddingBottom: '16px',
              borderBottom: `3px solid ${style.primary || '#3b82f6'}`,
              marginBottom: '20px',
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
            }}
          >
            {scene.caption}
          </div>
          <h2
            style={{
              fontSize: width > 800 ? 56 : 36,
              fontWeight: 700,
              margin: '0 0 16px 0',
              textShadow: '0 2px 10px rgba(0, 0, 0, 0.4)',
            }}
          >
            {scene.headline}
          </h2>
          <p
            style={{
              fontSize: width > 800 ? 20 : 14,
              fontWeight: 400,
              margin: 0,
              textShadow: '0 1px 5px rgba(0, 0, 0, 0.3)',
              lineHeight: 1.6,
            }}
          >
            {scene.subtext}
          </p>
        </div>
      </CinematicBackground>
    </AbsoluteFill>
  );
};

/**
 * Technology/Futuristic Scene
 * Illustration-based with glowing particles and tech vibe
 */
export const CinematicTechScene: React.FC<CinematicScenePresetProps> = ({
  scene,
  sceneStartFrame,
  duration,
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // Center zoom entrance
  const scaleEnter = spring({
    frame: frame - sceneStartFrame,
    fps,
    config: { damping: 10, mass: 0.7, stiffness: 120 },
    durationInFrames: 50,
  });

  const scale = interpolate(scaleEnter, [0, 1], [0.7, 1]);
  const opacity = interpolate(scaleEnter, [0, 1], [0, 1]);

  const cinematicConfig = scene.cinematicConfig || {
    cameraMotion: 'drift',
    panAmount: 8,
    darkOverlay: { enabled: true, opacity: 0.4 },
    overlayGradient: {
      enabled: true,
      colors: [`${style.primary || '#22c55e'}30`, `${style.secondary || '#3b82f6'}30`],
      opacity: 0.25,
    },
    particleEffect: { enabled: true, type: 'stars', intensity: 0.6 },
  };

  return (
    <AbsoluteFill>
      <CinematicBackground
        asset={scene.selectedAsset}
        config={cinematicConfig}
        duration={duration}
        width={width}
        height={height}
      >
        {/* Centered content with scale animation */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transform: `scale(${scale})`,
            opacity: opacity,
            zIndex: 20,
          }}
        >
          <div style={{ textAlign: 'center', color: 'white', maxWidth: '85%' }}>
            <div
              style={{
                fontSize: 64,
                fontWeight: 700,
                marginBottom: '20px',
                background: `linear-gradient(135deg, ${style.primary || '#22c55e'}, ${style.secondary || '#3b82f6'})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              {scene.headline}
            </div>
            <p
              style={{
                fontSize: width > 800 ? 24 : 16,
                fontWeight: 300,
                margin: 0,
                textShadow: '0 2px 10px rgba(0, 0, 0, 0.5)',
              }}
            >
              {scene.subtext}
            </p>
          </div>
        </div>
      </CinematicBackground>
    </AbsoluteFill>
  );
};

/**
 * Dashboard/Data Scene
 * UI mockup with animated data visualization
 */
export const CinematicDashboardScene: React.FC<CinematicScenePresetProps> = ({
  scene,
  sceneStartFrame,
  duration,
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const contentEnter = spring({
    frame: frame - sceneStartFrame,
    fps,
    config: { damping: 11, mass: 0.85, stiffness: 100 },
    durationInFrames: 40,
  });

  const contentOpacity = interpolate(contentEnter, [0, 1], [0, 1]);

  const cinematicConfig = scene.cinematicConfig || {
    cameraMotion: 'slow-pan-up',
    panAmount: 15,
    darkOverlay: { enabled: true, opacity: 0.3 },
  };

  return (
    <AbsoluteFill>
      <CinematicBackground
        asset={scene.selectedAsset}
        config={cinematicConfig}
        duration={duration}
        width={width}
        height={height}
      >
        {/* Full-screen dashboard overlay */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            right: 0,
            bottom: 0,
            padding: '60px',
            opacity: contentOpacity,
            zIndex: 20,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          <h2
            style={{
              fontSize: 56,
              fontWeight: 700,
              color: 'white',
              margin: '0 0 40px 0',
              textShadow: '0 2px 10px rgba(0, 0, 0, 0.5)',
            }}
          >
            {scene.headline}
          </h2>

          {/* Metrics Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '20px',
              marginBottom: '40px',
            }}
          >
            {[1, 2, 3, 4].map((_, idx) => {
              const barHeight = spring({
                frame: frame - sceneStartFrame - 50 - idx * 10,
                fps,
                config: { damping: 10, mass: 0.8, stiffness: 100 },
                durationInFrames: 40,
              });
              const barHeightPx = interpolate(barHeight, [0, 1], [0, 60 + idx * 20]);
              return (
                <div
                  key={idx}
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '8px',
                    padding: '20px',
                    backdropFilter: 'blur(10px)',
                  }}
                >
                  <div
                    style={{
                      width: '100%',
                      height: '80px',
                      backgroundColor: 'rgba(59, 130, 246, 0.3)',
                      borderRadius: '4px',
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        width: '100%',
                        height: `${barHeightPx}px`,
                        backgroundColor: style.primary || '#3b82f6',
                        borderRadius: '4px',
                        position: 'absolute',
                        bottom: 0,
                      }}
                    />
                  </div>
                  <div
                    style={{
                      marginTop: '12px',
                      fontSize: 12,
                      color: 'rgba(255, 255, 255, 0.7)',
                      fontWeight: 500,
                    }}
                  >
                    Metric {idx + 1}
                  </div>
                </div>
              );
            })}
          </div>

          <p
            style={{
              fontSize: 18,
              color: 'rgba(255, 255, 255, 0.8)',
              margin: 0,
              maxWidth: '600px',
            }}
          >
            {scene.subtext}
          </p>
        </div>
      </CinematicBackground>
    </AbsoluteFill>
  );
};

/**
 * Social Reel/Energetic Scene
 * Fast-paced, vibrant, perfect for TikTok/Instagram
 */
export const CinematicReelScene: React.FC<CinematicScenePresetProps> = ({
  scene,
  sceneStartFrame,
  duration,
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const progress = (frame - sceneStartFrame) / duration;
  const rotation = progress * 10; // Subtle rotation over scene
  const scale = 1 + Math.sin(progress * Math.PI * 2) * 0.05; // Breathing scale effect

  const cinematicConfig = scene.cinematicConfig || {
    cameraMotion: 'drift',
    panAmount: 12,
    darkOverlay: { enabled: false, opacity: 0 },
    particleEffect: { enabled: true, type: 'dust', intensity: 0.7 },
  };

  return (
    <AbsoluteFill>
      <CinematicBackground
        asset={scene.selectedAsset}
        config={cinematicConfig}
        duration={duration}
        width={width}
        height={height}
      >
        {/* Bold centered text with emoji/accent */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: '50%',
            transform: `translateY(-50%) rotate(${rotation}deg) scale(${scale})`,
            zIndex: 20,
            textAlign: 'center',
            color: 'white',
          }}
        >
          <div
            style={{
              fontSize: width > 800 ? 80 : 60,
              fontWeight: 900,
              textTransform: 'uppercase',
              textShadow: `0 8px 20px ${style.primary || '#3b82f6'}80, 0 2px 10px rgba(0, 0, 0, 0.5)`,
              letterSpacing: '-0.03em',
              marginBottom: '20px',
            }}
          >
            {scene.headline}
          </div>
          <div
            style={{
              fontSize: 24,
              fontWeight: 600,
              textShadow: '0 2px 10px rgba(0, 0, 0, 0.5)',
            }}
          >
            {scene.subtext}
          </div>
        </div>
      </CinematicBackground>
    </AbsoluteFill>
  );
};

/**
 * CTA/Outro Scene
 * Strong call-to-action with animated button
 */
export const CinematicCTAScene: React.FC<CinematicScenePresetProps> = ({
  scene,
  sceneStartFrame,
  duration,
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const contentEnter = spring({
    frame: frame - sceneStartFrame,
    fps,
    config: { damping: 8, mass: 0.7, stiffness: 130 },
    durationInFrames: 50,
  });

  const contentScale = interpolate(contentEnter, [0, 1], [0.6, 1]);
  const contentOpacity = interpolate(contentEnter, [0, 1], [0, 1]);

  // Button pulse
  const buttonPulse = Math.sin((frame - sceneStartFrame) * 0.05) * 8;

  const cinematicConfig = scene.cinematicConfig || {
    cameraMotion: 'ken-burns-out',
    zoomIntensity: 1.4,
    darkOverlay: { enabled: true, opacity: 0.4 },
  };

  return (
    <AbsoluteFill>
      <CinematicBackground
        asset={scene.selectedAsset}
        config={cinematicConfig}
        duration={duration}
        width={width}
        height={height}
      >
        {/* CTA Content */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transform: `scale(${contentScale})`,
            opacity: contentOpacity,
            zIndex: 20,
          }}
        >
          <div style={{ textAlign: 'center', color: 'white' }}>
            <h1
              style={{
                fontSize: width > 800 ? 64 : 40,
                fontWeight: 800,
                margin: '0 0 24px 0',
                textShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
              }}
            >
              {scene.headline}
            </h1>
            <p
              style={{
                fontSize: width > 800 ? 24 : 16,
                fontWeight: 400,
                margin: '0 0 40px 0',
                textShadow: '0 2px 10px rgba(0, 0, 0, 0.4)',
                maxWidth: '80%',
                marginLeft: 'auto',
                marginRight: 'auto',
              }}
            >
              {scene.subtext}
            </p>

            {/* CTA Button */}
            <button
              style={{
                padding: '16px 48px',
                fontSize: 20,
                fontWeight: 700,
                color: 'white',
                backgroundColor: style.primary || '#3b82f6',
                border: 'none',
                borderRadius: '50px',
                cursor: 'pointer',
                boxShadow: `0 ${8 + buttonPulse}px 24px ${(style.primary || '#3b82f6')}60`,
                transition: 'all 0.2s ease',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              {scene.caption || 'Get Started'}
            </button>
          </div>
        </div>
      </CinematicBackground>
    </AbsoluteFill>
  );
};

/**
 * Scene preset selector based on mood
 */
export function selectCinematicScenePreset(
  mood?: string,
): React.FC<CinematicScenePresetProps> {
  switch (mood) {
    case 'cinematic':
    case 'serene':
      return CinematicNatureScene;
    case 'corporate':
      return CinematicCorporateScene;
    case 'futuristic':
    case 'energetic':
      return CinematicTechScene;
    case 'playful':
      return CinematicReelScene;
    default:
      return CinematicDashboardScene;
  }
}
