/**
 * Modern Scene Preset Components
 * Reusable scene layouts inspired by Canva AI videos, Apple keynotes, and modern SaaS marketing
 */

import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, spring, Easing, AbsoluteFill } from 'remotion';
import { Scene } from '@/app/utils/types/video-generation';
import { ThemeConfig } from './types';
import { BackgroundRenderer } from './BackgroundRenderer';
import { getLucideIcon } from './icon-helper';

/**
 * ProductHeroScene
 * Large visual with overlaid text and glassmorphism card
 * Perfect for: product demos, hero shots, spotlight features
 */
export const ProductHeroScene: React.FC<{
  scene: Scene;
  progress: number;
  theme: ThemeConfig;
  width: number;
  height: number;
  startFrame: number;
  durationFrames: number;
}> = ({ scene, progress, theme, width, height, startFrame, durationFrames }) => {
  const frame = useCurrentFrame() - startFrame;
  const { fps } = useVideoConfig();

  // Icon animation - floats and scales in
  const iconScale = spring({
    fps,
    frame: frame - 5,
    config: { damping: 10, mass: 1, stiffness: 100 },
    from: 0,
    to: 1,
  });

  const iconY = interpolate(frame, [0, fps * 0.3], [100, 0], { extrapolateRight: 'clamp' });

  const iconComponent = scene.iconName
    ? getLucideIcon(scene.iconName, Math.round(120 * iconScale), theme.colors.accent)
    : null;

  // Headline animation - slides up with fade
  const headlineOpacity = interpolate(frame, [0, fps * 0.2], [0, 1], { extrapolateRight: 'clamp' });
  const headlineY = interpolate(frame, [0, fps * 0.3], [60, 0], { extrapolateRight: 'clamp' });

  // Subtext - staggered fade in
  const subtextOpacity = interpolate(frame, [fps * 0.2, fps * 0.4], [0, 1], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ backgroundColor: theme.colors.background, overflow: 'hidden' }}>
      {/* Animated gradient background */}
      <BackgroundRenderer
        type="gradient"
        theme={theme}
        gradientStart={theme.colors.primary}
        gradientEnd={theme.colors.accent}
      />

      {/* Floating particles */}
      <ParticleLayer theme={theme} frameOffset={startFrame} />

      {/* Main content container */}
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: `${theme.spacing.padding}px`,
          position: 'relative',
          zIndex: 2,
        }}
      >
        {/* Icon or fallback colored card */}
        <div
          style={{
            marginBottom: theme.spacing.gap * 2,
            opacity: Math.max(0, iconScale),
            transform: `translateY(${iconY}px) scale(${Math.max(0, iconScale)})`,
            filter: 'drop-shadow(0 20px 25px rgba(0,0,0,0.15))',
          }}
        >
          {iconComponent ? (
            iconComponent
          ) : (
            // Fallback: Animated colored card
            <div
              style={{
                width: 120,
                height: 120,
                borderRadius: 20,
                background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: `0 10px 40px ${theme.colors.accent}44`,
                border: `2px solid rgba(255, 255, 255, 0.2)`,
                animation: 'pulse 3s ease-in-out infinite',
              }}
            >
              <div
                style={{
                  fontSize: '48px',
                  fontWeight: 'bold',
                  color: 'white',
                }}
              >
                ✨
              </div>
            </div>
          )}
        </div>

        {/* Headline with glassmorphism card background */}
        <div
          style={{
            backdropFilter: 'blur(10px)',
            background: 'rgba(255, 255, 255, 0.1)',
            border: `1px solid rgba(255, 255, 255, 0.2)`,
            borderRadius: theme.spacing.gap,
            padding: `${theme.spacing.padding}px`,
            marginBottom: theme.spacing.gap * 1.5,
            opacity: headlineOpacity,
            transform: `translateY(${headlineY}px)`,
            maxWidth: width - theme.spacing.padding * 4,
          }}
        >
          <h1
            style={{
              fontSize: theme.typography.headlineSize * 1.2,
              fontWeight: 700,
              color: 'white',
              margin: 0,
              lineHeight: 1.3,
              fontFamily: theme.typography.family,
              textAlign: 'center',
            }}
          >
            {scene.headline}
          </h1>
        </div>

        {/* Subtext */}
        {scene.subtext && (
          <p
            style={{
              fontSize: theme.typography.subtextSize,
              color: 'rgba(255, 255, 255, 0.8)',
              maxWidth: width - theme.spacing.padding * 4,
              textAlign: 'center',
              opacity: subtextOpacity,
              fontFamily: theme.typography.family,
              fontWeight: 400,
              lineHeight: 1.6,
            }}
          >
            {scene.subtext}
          </p>
        )}
      </div>

      {/* Animated accent line at bottom */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '100%',
          height: 3,
          background: `linear-gradient(90deg, transparent, ${theme.colors.accent}, transparent)`,
          opacity: interpolate(frame, [fps * 0.4, fps * 0.6], [0, 1], { extrapolateRight: 'clamp' }),
        }}
      />
    </AbsoluteFill>
  );
};

/**
 * FeatureScene
 * Icon + text layout with animated background elements
 * Perfect for: feature highlights, benefits, step-by-step flows
 */
export const FeatureScene: React.FC<{
  scene: Scene;
  progress: number;
  theme: ThemeConfig;
  width: number;
  height: number;
  startFrame: number;
  durationFrames: number;
}> = ({ scene, progress, theme, width, height, startFrame, durationFrames }) => {
  const frame = useCurrentFrame() - startFrame;
  const { fps } = useVideoConfig();

  // Left side icon animation - slides in from left
  const iconX = interpolate(frame, [0, fps * 0.3], [-100, 0], { extrapolateRight: 'clamp' });
  const iconScale = spring({
    fps,
    frame: frame - 10,
    config: { damping: 10, mass: 1, stiffness: 100 },
    from: 0.8,
    to: 1,
  });

  // Right side text animation
  const textX = interpolate(frame, [0, fps * 0.3], [100, 0], { extrapolateRight: 'clamp' });
  const textOpacity = interpolate(frame, [0, fps * 0.2], [0, 1], { extrapolateRight: 'clamp' });

  const iconComponent = scene.iconName ? getLucideIcon(scene.iconName, 100, theme.colors.accent) : null;

  return (
    <AbsoluteFill style={{ backgroundColor: theme.colors.background, overflow: 'hidden' }}>
      <BackgroundRenderer type="blob" theme={theme} />

      {/* Left side - Icon with glow */}
      <div
        style={{
          position: 'absolute',
          left: `${theme.spacing.padding}px`,
          top: '50%',
          transform: `translateY(-50%) translateX(${iconX}px) scale(${iconScale})`,
          filter: `drop-shadow(0 0 30px ${theme.colors.accent}33)`,
          zIndex: 2,
        }}
      >
        {iconComponent && (
          <div
            style={{
              width: 140,
              height: 140,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%',
              background: `radial-gradient(circle, ${theme.colors.accent}22, transparent)`,
              border: `2px solid ${theme.colors.accent}44`,
            }}
          >
            {iconComponent}
          </div>
        )}
      </div>

      {/* Right side - Text content */}
      <div
        style={{
          position: 'absolute',
          right: `${theme.spacing.padding}px`,
          top: '50%',
          maxWidth: width * 0.45,
          opacity: textOpacity,
          transform: `translateY(-50%) translateX(${textX}px)`,
          zIndex: 2,
        }}
      >
        <h2
          style={{
            fontSize: theme.typography.headlineSize,
            fontWeight: 700,
            color: theme.colors.text,
            margin: '0 0 16px 0',
            fontFamily: theme.typography.family,
            lineHeight: 1.3,
          }}
        >
          {scene.headline}
        </h2>

        {scene.subtext && (
          <p
            style={{
              fontSize: theme.typography.subtextSize,
              color: theme.colors.text,
              opacity: 0.7,
              margin: 0,
              fontFamily: theme.typography.family,
              lineHeight: 1.6,
            }}
          >
            {scene.subtext}
          </p>
        )}
      </div>

      {/* Accent shapes */}
      <FloatingAccents theme={theme} />
    </AbsoluteFill>
  );
};

/**
 * SplitFeatureScene
 * 50/50 split with visual on one side, text on other
 * Perfect for: before/after, comparison, dual-feature showcase
 */
export const SplitFeatureScene: React.FC<{
  scene: Scene;
  progress: number;
  theme: ThemeConfig;
  width: number;
  height: number;
  startFrame: number;
  durationFrames: number;
}> = ({ scene, progress, theme, width, height, startFrame, durationFrames }) => {
  const frame = useCurrentFrame() - startFrame;
  const { fps } = useVideoConfig();

  // Left visual animation - scales and fades in
  const leftScale = interpolate(frame, [0, fps * 0.3], [0.8, 1], { extrapolateRight: 'clamp' });
  const leftOpacity = interpolate(frame, [0, fps * 0.2], [0, 1], { extrapolateRight: 'clamp' });

  // Right text animation
  const rightX = interpolate(frame, [0, fps * 0.3], [100, 0], { extrapolateRight: 'clamp' });
  const rightOpacity = interpolate(frame, [fps * 0.1, fps * 0.3], [0, 1], { extrapolateRight: 'clamp' });

  const iconComponent = scene.iconName ? getLucideIcon(scene.iconName, 150, theme.colors.accent) : null;

  return (
    <AbsoluteFill style={{ backgroundColor: theme.colors.background, overflow: 'hidden' }}>
      <BackgroundRenderer type="gradient" theme={theme} />

      {/* Left side - Visual/Icon */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: '50%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: leftOpacity,
          transform: `scale(${leftScale})`,
        }}
      >
        <div
          style={{
            position: 'relative',
            width: 300,
            height: 300,
            borderRadius: '20px',
            background: `linear-gradient(135deg, ${theme.colors.primary}44, ${theme.colors.accent}44)`,
            border: `2px solid ${theme.colors.accent}66`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(20px)',
            boxShadow: `0 8px 32px ${theme.colors.accent}22`,
          }}
        >
          {iconComponent}
        </div>
      </div>

      {/* Right side - Text */}
      <div
        style={{
          position: 'absolute',
          right: 0,
          top: 0,
          width: '50%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'center',
          padding: `${theme.spacing.padding}px`,
          opacity: rightOpacity,
          transform: `translateX(${rightX}px)`,
          zIndex: 2,
        }}
      >
        <h2
          style={{
            fontSize: theme.typography.headlineSize * 1.1,
            fontWeight: 700,
            color: theme.colors.text,
            margin: '0 0 24px 0',
            fontFamily: theme.typography.family,
            lineHeight: 1.3,
          }}
        >
          {scene.headline}
        </h2>

        {scene.subtext && (
          <p
            style={{
              fontSize: theme.typography.subtextSize,
              color: theme.colors.text,
              opacity: 0.7,
              margin: 0,
              fontFamily: theme.typography.family,
              lineHeight: 1.7,
              maxWidth: '90%',
            }}
          >
            {scene.subtext}
          </p>
        )}

        {/* Accent dots */}
        <div style={{ marginTop: '24px', display: 'flex', gap: '12px' }}>
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                background: theme.colors.accent,
                opacity: interpolate(frame, [fps * 0.2 + i * 5, fps * 0.4 + i * 5], [0, 1], {
                  extrapolateRight: 'clamp',
                }),
              }}
            />
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};

/**
 * DashboardScene
 * Shows a dashboard/product mockup with animated elements
 * Perfect for: product features, workflow demos, dashboard showcase
 */
export const DashboardScene: React.FC<{
  scene: Scene;
  progress: number;
  theme: ThemeConfig;
  width: number;
  height: number;
  startFrame: number;
  durationFrames: number;
}> = ({ scene, progress, theme, width, height, startFrame, durationFrames }) => {
  const frame = useCurrentFrame() - startFrame;
  const { fps } = useVideoConfig();

  // Dashboard card animation - slides in from bottom with stagger
  const cards = [0, 1, 2];
  const cardAnimations = cards.map((i) => ({
    y: interpolate(frame, [fps * 0.2 + i * 10, fps * 0.4 + i * 10], [150, 0], { extrapolateRight: 'clamp' }),
    opacity: interpolate(frame, [fps * 0.15 + i * 10, fps * 0.35 + i * 10], [0, 1], { extrapolateRight: 'clamp' }),
  }));

  return (
    <AbsoluteFill style={{ backgroundColor: theme.colors.background, overflow: 'hidden' }}>
      <BackgroundRenderer type="particles" theme={theme} />

      {/* Title */}
      <div
        style={{
          position: 'absolute',
          top: `${theme.spacing.padding * 2}px`,
          left: `${theme.spacing.padding * 2}px`,
          zIndex: 10,
        }}
      >
        <h2
          style={{
            fontSize: theme.typography.headlineSize,
            fontWeight: 700,
            color: theme.colors.text,
            margin: 0,
            fontFamily: theme.typography.family,
          }}
        >
          {scene.headline}
        </h2>
        {scene.subtext && (
          <p
            style={{
              fontSize: theme.typography.subtextSize,
              color: theme.colors.text,
              opacity: 0.6,
              margin: '8px 0 0 0',
              fontFamily: theme.typography.family,
            }}
          >
            {scene.subtext}
          </p>
        )}
      </div>

      {/* Dashboard cards grid */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: `${theme.spacing.gap * 2}px`,
          maxWidth: width - theme.spacing.padding * 4,
        }}
      >
        {cardAnimations.map((anim, i) => (
          <div
            key={i}
            style={{
              background: `linear-gradient(135deg, ${theme.colors.primary}22, ${theme.colors.accent}22)`,
              border: `2px solid ${theme.colors.accent}44`,
              borderRadius: `${theme.spacing.gap}px`,
              padding: `${theme.spacing.padding}px`,
              backdropFilter: 'blur(10px)',
              minHeight: '150px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: anim.opacity,
              transform: `translateY(${anim.y}px)`,
              boxShadow: `0 8px 32px ${theme.colors.accent}11`,
            }}
          >
            <div
              style={{
                textAlign: 'center',
                color: theme.colors.text,
                fontFamily: theme.typography.family,
              }}
            >
              <div
                style={{
                  fontSize: '24px',
                  fontWeight: 700,
                  marginBottom: '8px',
                }}
              >
                Feature {i + 1}
              </div>
              <div
                style={{
                  fontSize: '14px',
                  opacity: 0.6,
                }}
              >
                Animated
              </div>
            </div>
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

/**
 * Helper Components
 */

const ParticleLayer: React.FC<{ theme: ThemeConfig; frameOffset: number }> = ({ theme, frameOffset }) => {
  const frame = useCurrentFrame() - frameOffset;
  const { width, height, fps } = useVideoConfig();

  const particles = Array.from({ length: 8 }, (_, i) => ({
    id: i,
    x: (i * 12.5) * (width / 100),
    baseY: (i * 12.5) * (height / 100),
    size: 3 + (i % 3) * 2,
  }));

  return (
    <svg
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        opacity: 0.2,
        zIndex: 1,
      }}
    >
      {particles.map((particle) => {
        const y = particle.baseY + Math.sin((frame + particle.id * 20) / fps) * 50;
        return (
          <circle
            key={particle.id}
            cx={particle.x}
            cy={y}
            r={particle.size}
            fill={theme.colors.accent}
          />
        );
      })}
    </svg>
  );
};

const FloatingAccents: React.FC<{ theme: ThemeConfig }> = ({ theme }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <svg
      style={{
        position: 'absolute',
        top: 0,
        right: '10%',
        width: '200px',
        height: '200px',
        opacity: 0.15,
        zIndex: 1,
      }}
    >
      <defs>
        <linearGradient id="accentGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={theme.colors.accent} />
          <stop offset="100%" stopColor={theme.colors.primary} />
        </linearGradient>
      </defs>
      <circle
        cx={100 + Math.cos((frame / fps) * 2) * 30}
        cy={100 + Math.sin((frame / fps) * 2) * 30}
        r={50}
        fill="url(#accentGrad)"
      />
    </svg>
  );
};
