/**
 * CTA (Call-to-Action) Section Component - ENHANCED
 * Cinematic final screen with animated gradient, glowing button, particles, and zoom
 */

import React, { useMemo } from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, Easing, AbsoluteFill, spring } from 'remotion';
import { ThemeConfig, AnimationType } from './types';
import { BackgroundRenderer } from './BackgroundRenderer';

interface CTASectionProps {
  text: string;
  subtext?: string;
  ctaButtonText?: string;
  theme: ThemeConfig;
  backgroundColor?: string;
  durationFrames: number;
  startFrame: number;
}

/**
 * Glowing CTA button with pulse ring and glow effect
 */
const GlowingButton: React.FC<{
  text: string;
  color: string;
  glow: number;
  scale: number;
  opacity: number;
}> = ({ text, color, glow, scale, opacity }) => {
  return (
    <div
      style={{
        position: 'relative',
        display: 'inline-block',
      }}
    >
      {/* Outer glow ring */}
      <div
        style={{
          position: 'absolute',
          inset: -30,
          borderRadius: '50px',
          background: `radial-gradient(circle, ${color}${Math.round(glow * 100).toString(16).padStart(2, '0')}, transparent)`,
          filter: 'blur(15px)',
          opacity: glow,
        }}
      />

      {/* Button itself */}
      <button
        style={{
          position: 'relative',
          padding: '18px 56px',
          backgroundColor: color,
          color: '#ffffff',
          borderRadius: '50px',
          fontSize: '20px',
          fontWeight: 700,
          border: 'none',
          cursor: 'pointer',
          boxShadow: `0 0 40px ${color}${Math.round(glow * 150).toString(16).padStart(2, '0')}, 0 8px 20px rgba(0, 0, 0, 0.3)`,
          transform: `scale(${scale})`,
          transition: 'all 0.1s ease',
          opacity,
          fontFamily: 'inherit',
        }}
      >
        {text}
      </button>

      {/* Inner glow pulse */}
      <div
        style={{
          position: 'absolute',
          inset: -8,
          borderRadius: '50px',
          border: `2px solid ${color}`,
          opacity: glow * 0.5,
          boxShadow: `inset 0 0 20px ${color}${Math.round(glow * 80).toString(16).padStart(2, '0')}`,
        }}
      />
    </div>
  );
};

/**
 * Floating particle system for the CTA background
 */
const FloatingParticles: React.FC<{ theme: ThemeConfig; startFrame: number }> = ({
  theme,
  startFrame,
}) => {
  const frame = useCurrentFrame() - startFrame;
  const { width, height, fps } = useVideoConfig();

  // Generate particles with stable positioning
  const particles = useMemo(
    () =>
      Array.from({ length: 20 }, (_, i) => ({
        id: i,
        x: Math.random() * width,
        y: Math.random() * height,
        size: 2 + Math.random() * 6,
        duration: 2000 + Math.random() * 1000, // ms
        delay: Math.random() * 500,
      })),
    [width, height]
  );

  return (
    <svg
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        opacity: 0.3,
      }}
    >
      <defs>
        <radialGradient id="particleGrad">
          <stop offset="0%" stopColor={theme.colors.accent} stopOpacity="0.8" />
          <stop offset="100%" stopColor={theme.colors.primary} stopOpacity="0" />
        </radialGradient>
      </defs>
      {particles.map((p) => {
        const elapsed = Math.max(0, frame - p.delay);
        const progress = (elapsed % p.duration) / p.duration;
        const y = p.y - progress * (p.y + 100); // Float upward
        const opacity = Math.max(0, Math.sin(progress * Math.PI));

        return (
          <circle
            key={p.id}
            cx={p.x + Math.sin(progress * Math.PI * 4) * 30}
            cy={y}
            r={p.size}
            fill="url(#particleGrad)"
            opacity={opacity}
          />
        );
      })}
    </svg>
  );
};

/**
 * Animated gradient circles in background
 */
const AnimatedBackgroundShapes: React.FC<{ theme: ThemeConfig; startFrame: number }> = ({
  theme,
  startFrame,
}) => {
  const frame = useCurrentFrame() - startFrame;
  const { fps } = useVideoConfig();

  const rotate1 = (frame / fps) * 30; // Slow rotation
  const rotate2 = (frame / fps) * -20;
  const scale1 = 1 + Math.sin((frame / fps) * 2) * 0.1;
  const scale2 = 1 + Math.cos((frame / fps) * 1.5) * 0.08;

  return (
    <svg
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
      }}
    >
      <defs>
        <radialGradient id="bgGrad1" cx="30%" cy="30%" r="70%">
          <stop offset="0%" stopColor={theme.colors.accent} stopOpacity="0.3" />
          <stop offset="100%" stopColor={theme.colors.primary} stopOpacity="0" />
        </radialGradient>
        <radialGradient id="bgGrad2" cx="70%" cy="70%" r="60%">
          <stop offset="0%" stopColor={theme.colors.primary} stopOpacity="0.25" />
          <stop offset="100%" stopColor={theme.colors.secondary} stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Large circle 1 */}
      <circle
        cx="20%"
        cy="20%"
        r="300"
        fill="url(#bgGrad1)"
        style={{
          transform: `rotate(${rotate1}deg) scale(${scale1})`,
          transformOrigin: '20% 20%',
          filter: 'blur(40px)',
        }}
      />

      {/* Large circle 2 */}
      <circle
        cx="80%"
        cy="80%"
        r="350"
        fill="url(#bgGrad2)"
        style={{
          transform: `rotate(${rotate2}deg) scale(${scale2})`,
          transformOrigin: '80% 80%',
          filter: 'blur(50px)',
        }}
      />
    </svg>
  );
};

export const CTASection: React.FC<CTASectionProps> = ({
  text,
  subtext,
  ctaButtonText = 'Get Started',
  theme,
  backgroundColor,
  durationFrames,
  startFrame,
}) => {
  const frame = useCurrentFrame() - startFrame;
  const { fps } = useVideoConfig();

  // Check if CTA section is active
  const isCTAActive = frame >= 0 && frame < durationFrames;

  if (!isCTAActive) {
    return null;
  }

  const progress = frame / durationFrames;

  // Staggered animations
  const bgFadeIn = interpolate(progress, [0, 0.15], [0, 1], { extrapolateRight: 'clamp' });
  const textFadeIn = interpolate(progress, [0.05, 0.25], [0, 1], { extrapolateRight: 'clamp' });
  const subtextFadeIn = interpolate(progress, [0.15, 0.35], [0, 1], { extrapolateRight: 'clamp' });
  const buttonFadeIn = interpolate(progress, [0.25, 0.45], [0, 1], { extrapolateRight: 'clamp' });

  // Zoom effect (camera zoom in)
  const zoom = spring({
    fps,
    frame: frame - 10,
    config: { damping: 10, mass: 1, stiffness: 50 },
    from: 0.95,
    to: 1,
  });

  // Slide up animation
  const contentY = interpolate(progress, [0, 0.3], [100, 0], { extrapolateRight: 'clamp' });

  // Button glow pulsing
  const glowPulse = 0.3 + Math.sin((frame / fps) * 3) * 0.3;

  // Button scale pulse
  const buttonScale = 1 + Math.sin((frame / fps) * 2.5) * 0.05;

  return (
    <AbsoluteFill style={{ backgroundColor: backgroundColor || theme.colors.background, overflow: 'hidden' }}>
      {/* Animated background */}
      <BackgroundRenderer type="particles" theme={theme} />

      {/* Background animated shapes */}
      <AnimatedBackgroundShapes theme={theme} startFrame={startFrame} />

      {/* Floating particles */}
      <FloatingParticles theme={theme} startFrame={startFrame} />

      {/* Main content with zoom and slide effect */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: `${theme.spacing.padding}px`,
          textAlign: 'center',
          transform: `scale(${zoom}) translateY(${contentY}px)`,
          opacity: bgFadeIn,
          zIndex: 10,
        }}
      >
        {/* Main heading */}
        <h1
          style={{
            fontSize: theme.typography.headlineSize * 1.4,
            fontWeight: 700,
            color: 'white',
            margin: '0 0 24px 0',
            opacity: textFadeIn,
            fontFamily: theme.typography.family,
            lineHeight: 1.2,
            textShadow: `0 4px 20px rgba(0, 0, 0, 0.3)`,
          }}
        >
          {text}
        </h1>

        {/* Subtext */}
        {subtext && (
          <p
            style={{
              fontSize: theme.typography.subtextSize * 1.1,
              color: 'rgba(255, 255, 255, 0.85)',
              margin: '0 0 48px 0',
              opacity: subtextFadeIn,
              fontFamily: theme.typography.family,
              fontWeight: 400,
              lineHeight: 1.6,
              maxWidth: '80%',
            }}
          >
            {subtext}
          </p>
        )}

        {/* Glowing CTA Button */}
        <div style={{ opacity: buttonFadeIn }}>
          <GlowingButton
            text={ctaButtonText}
            color={theme.colors.accent}
            glow={glowPulse}
            scale={buttonScale}
            opacity={buttonFadeIn}
          />
        </div>

        {/* Bottom accent line */}
        <div
          style={{
            position: 'absolute',
            bottom: '20px',
            width: '100px',
            height: '4px',
            background: `linear-gradient(90deg, transparent, ${theme.colors.accent}, transparent)`,
            opacity: interpolate(progress, [0.5, 0.7], [0, 1], { extrapolateRight: 'clamp' }),
          }}
        />
      </div>
    </AbsoluteFill>
  );
};
