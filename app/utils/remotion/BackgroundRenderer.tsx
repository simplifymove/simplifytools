/**
 * Background Renderer Component - Enhanced
 * Animated gradients, mesh effects, particles, blobs, and glassmorphism
 * Creates depth and visual interest for modern SaaS videos
 */

import React, { useMemo } from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, Easing } from 'remotion';
import { BackgroundType, ThemeConfig } from './types';

interface BackgroundRendererProps {
  type: BackgroundType;
  theme: ThemeConfig;
  color?: string;
  gradientStart?: string;
  gradientEnd?: string;
  imageUrl?: string;
  overlayOpacity?: number;
  children?: React.ReactNode;
}

/**
 * Animated SVG Blob with rotation and glow
 */
const SVGBlob: React.FC<{ theme: ThemeConfig }> = ({ theme }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const rotation = interpolate((frame % (fps * 5)) / (fps * 5), [0, 1], [0, 360]);
  const scale = 1 + Math.sin((frame % fps) / fps) * 0.1;

  return (
    <svg
      viewBox="0 0 200 200"
      style={{
        position: 'absolute',
        width: '150%',
        height: '150%',
        top: '-25%',
        right: '-25%',
        opacity: 0.25,
        transform: `rotate(${rotation}deg) scale(${scale})`,
        filter: 'blur(1px)',
      }}
    >
      <defs>
        <filter id="blobFilter">
          <feGaussianBlur in="SourceGraphic" stdDeviation="3" />
        </filter>
        <radialGradient id="blobGrad" cx="30%" cy="30%" r="70%">
          <stop offset="0%" stopColor={theme.colors.accent} stopOpacity="0.6" />
          <stop offset="100%" stopColor={theme.colors.primary} stopOpacity="0.2" />
        </radialGradient>
      </defs>
      <path
        d="M 100,20 C 140,40 160,80 140,120 C 120,160 80,180 50,160 C 20,140 0,100 20,60 C 40,20 60,0 100,20"
        fill="url(#blobGrad)"
        filter="url(#blobFilter)"
      />
    </svg>
  );
};

/**
 * Animated particle field with floating motion
 */
const ParticleField: React.FC<{ color: string; intensity?: number }> = ({ color, intensity = 0.15 }) => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();

  // Generate stable particle positions with better distribution
  const particles = useMemo(() => {
    return Array.from({ length: 40 }, (_, i) => ({
      id: i,
      x: Math.random() * width,
      y: Math.random() * height,
      size: 1 + Math.random() * 4,
      speed: 0.5 + Math.random() * 1.5,
      angle: Math.random() * Math.PI * 2,
    }));
  }, [width, height]);

  return (
    <svg
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        opacity: intensity,
        zIndex: 1,
      }}
    >
      <defs>
        <radialGradient id="particleGrad">
          <stop offset="0%" stopColor={color} stopOpacity="1" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </radialGradient>
      </defs>
      {particles.map((particle) => {
        const totalTime = frame / fps;
        const x = particle.x + Math.cos(particle.angle + totalTime) * particle.speed * 20;
        const y = particle.y + Math.sin(particle.angle + totalTime) * particle.speed * 20;
        const opacity = 0.4 + Math.sin(totalTime * 2 + particle.id) * 0.3;

        return (
          <circle
            key={particle.id}
            cx={x % width}
            cy={y % height}
            r={particle.size}
            fill={color}
            opacity={opacity}
          />
        );
      })}
    </svg>
  );
};

/**
 * Animated gradient background with flowing color shifts
 */
const AnimatedGradient: React.FC<{ startColor: string; endColor: string }> = ({ startColor, endColor }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Slow gradient rotation for cinematic feel
  const angle = (frame / (fps * 10)) * 360;

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        background: `linear-gradient(${angle}deg, ${startColor}, ${endColor})`,
        position: 'absolute',
        top: 0,
        left: 0,
      }}
    />
  );
};

/**
 * Glassmorphism card with subtle animation
 */
const GlassmorphismCard: React.FC<{ theme: ThemeConfig }> = ({ theme }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const blur = 10 + Math.sin((frame / fps) * 2) * 2;

  return (
    <div
      style={{
        position: 'absolute',
        top: '15%',
        right: '12%',
        width: '220px',
        height: '220px',
        borderRadius: '24px',
        background: `rgba(255, 255, 255, 0.08)`,
        border: `2px solid rgba(255, 255, 255, 0.25)`,
        backdropFilter: `blur(${blur}px)`,
        boxShadow: `0 8px 32px 0 rgba(31, 38, 135, 0.2)`,
      }}
    />
  );
};

export const BackgroundRenderer: React.FC<BackgroundRendererProps> = ({
  type,
  theme,
  color,
  gradientStart,
  gradientEnd,
  imageUrl,
  overlayOpacity = 0.3,
  children,
}) => {
  const { width, height } = useVideoConfig();

  const renderBackground = () => {
    switch (type) {
      case 'gradient': {
        const start = gradientStart || theme.colors.primary;
        const end = gradientEnd || theme.colors.secondary;
        return (
          <>
            <AnimatedGradient startColor={start} endColor={end} />
            {/* Subtle overlay for depth */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.1), transparent)`,
                zIndex: 1,
              }}
            />
          </>
        );
      }

      case 'image': {
        return (
          <>
            {imageUrl && (
              <img
                src={imageUrl}
                alt="background"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                }}
              />
            )}
            {/* Dark overlay with gradient for cinematic feel */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: `radial-gradient(circle at 50% 0%, rgba(0,0,0,${overlayOpacity * 0.5}), rgba(0,0,0,${overlayOpacity}))`,
                zIndex: 1,
              }}
            />
          </>
        );
      }

      case 'blob': {
        return (
          <div
            style={{
              width: '100%',
              height: '100%',
              background: `linear-gradient(135deg, ${theme.colors.primary}33 0%, ${theme.colors.secondary}33 100%)`,
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <SVGBlob theme={theme} />
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
              <SVGBlob theme={theme} />
            </div>
          </div>
        );
      }

      case 'particles': {
        return (
          <div
            style={{
              width: '100%',
              height: '100%',
              background: `linear-gradient(135deg, ${theme.colors.background}dd 0%, ${theme.colors.primary}22 100%)`,
              position: 'relative',
            }}
          >
            <ParticleField color={theme.colors.accent} intensity={0.2} />
            <ParticleField color={theme.colors.primary} intensity={0.1} />
          </div>
        );
      }

      case 'glassmorphism': {
        return (
          <div
            style={{
              width: '100%',
              height: '100%',
              background: `linear-gradient(135deg, ${theme.colors.primary}bb 0%, ${theme.colors.secondary}bb 100%)`,
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <GlassmorphismCard theme={theme} />
            <div
              style={{
                position: 'absolute',
                bottom: '-10%',
                left: '-5%',
                width: '250px',
                height: '250px',
                borderRadius: '24px',
                background: `rgba(255, 255, 255, 0.05)`,
                border: `2px solid rgba(255, 255, 255, 0.15)`,
                backdropFilter: 'blur(10px)',
              }}
            />
          </div>
        );
      }

      default:
        return (
          <div
            style={{
              width: '100%',
              height: '100%',
              backgroundColor: color || theme.colors.background,
            }}
          />
        );
    }
  };

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {renderBackground()}
      <div
        style={{
          position: 'relative',
          zIndex: 2,
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {children}
      </div>
    </div>
  );
};
