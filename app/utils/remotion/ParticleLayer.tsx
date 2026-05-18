/**
 * Particle Layer Component
 * Floating animated particles for visual depth
 */

import React, { useMemo } from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

interface ParticleLayerProps {
  count: number;
  baseColor: string;
  opacity?: number;
}

export const ParticleLayer: React.FC<ParticleLayerProps> = ({
  count,
  baseColor,
  opacity = 0.5,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // Generate particles with stable positions based on index
  const particles = useMemo(() => {
    return Array.from({ length: count }, (_, i) => {
      const seed = i * 12.5;
      return {
        id: i,
        x: ((seed * 73) % width),
        y: ((seed * 97) % height),
        size: 2 + ((seed * 11) % 4),
        duration: 120 + ((seed * 7) % 120),
        delay: (seed * 13) % 60,
        speed: 0.5 + ((seed * 3) % 1.5),
      };
    });
  }, [count, width, height]);

  return (
    <>
      {particles.map((particle) => {
        // Vertical floating motion
        const floatY = ((frame - particle.delay) * particle.speed) % particle.duration;
        const yOffset = interpolate(
          (floatY % particle.duration) / particle.duration,
          [0, 0.5, 1],
          [0, -40, 0]
        );

        // Opacity pulse
        const pulseFactor = Math.sin((frame + particle.delay) / 30) * 0.5 + 0.5;

        return (
          <div
            key={particle.id}
            style={{
              position: 'absolute',
              left: particle.x,
              top: particle.y + yOffset,
              width: particle.size,
              height: particle.size,
              borderRadius: '50%',
              background: baseColor,
              opacity: opacity * (0.6 + pulseFactor * 0.4),
              filter: 'blur(0.5px)',
              pointerEvents: 'none',
            }}
          />
        );
      })}
    </>
  );
};
