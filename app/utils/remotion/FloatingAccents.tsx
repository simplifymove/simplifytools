/**
 * Floating Accents Component
 * Animated decorative shapes for visual enhancement
 */

import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';
import { ThemeConfig } from './types';

interface FloatingAccentsProps {
  theme: ThemeConfig;
}

export const FloatingAccents: React.FC<FloatingAccentsProps> = ({ theme }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // Top-left accent circle
  const topLeftFloat = spring({
    frame: frame % 240,
    fps,
    config: { damping: 10, mass: 1, stiffness: 80 },
    durationInFrames: 120,
  });

  const topLeftY = interpolate(topLeftFloat, [0, 1], [0, -30]);
  const topLeftX = interpolate(topLeftFloat, [0, 1], [0, 20]);

  // Bottom-right accent circle
  const bottomRightFloat = spring({
    frame: (frame + 60) % 240,
    fps,
    config: { damping: 10, mass: 1, stiffness: 80 },
    durationInFrames: 120,
  });

  const bottomRightY = interpolate(bottomRightFloat, [0, 1], [0, 30]);
  const bottomRightX = interpolate(bottomRightFloat, [0, 1], [0, -20]);

  return (
    <>
      {/* Top-left floating accent */}
      <div
        style={{
          position: 'absolute',
          top: '80px',
          left: '60px',
          width: '120px',
          height: '120px',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${theme.colors.primary}30 0%, ${theme.colors.primary}10 100%)`,
          filter: 'blur(40px)',
          transform: `translate(${topLeftX}px, ${topLeftY}px)`,
          pointerEvents: 'none',
        }}
      />

      {/* Bottom-right floating accent */}
      <div
        style={{
          position: 'absolute',
          bottom: '80px',
          right: '60px',
          width: '140px',
          height: '140px',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${theme.colors.secondary}25 0%, ${theme.colors.secondary}5 100%)`,
          filter: 'blur(50px)',
          transform: `translate(${bottomRightX}px, ${bottomRightY}px)`,
          pointerEvents: 'none',
        }}
      />

      {/* Center accent - subtle glow */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: '200px',
          height: '200px',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${theme.colors.accent}20 0%, ${theme.colors.accent}5 100%)`,
          filter: 'blur(60px)',
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none',
        }}
      />
    </>
  );
};
