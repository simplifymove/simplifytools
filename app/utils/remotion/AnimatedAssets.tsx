/**
 * Animated Asset Components for Remotion Scenes
 * Reusable visual components for modern SaaS video compositions
 */

import React from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Easing,
} from 'remotion';
import { getLucideIcon } from './icon-helper';

// ============================================================================
// FLOATING FILE CARD
// ============================================================================

interface FloatingFileCardProps {
  icon: string;
  title: string;
  filename?: string;
  color: string;
  x: number;
  y: number;
  delay?: number;
  scale?: number;
}

export const FloatingFileCard: React.FC<FloatingFileCardProps> = ({
  icon,
  title,
  filename,
  color,
  x,
  y,
  delay = 0,
  scale = 1,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Float animation
  const floatY = spring({
    frame: frame - delay,
    fps,
    config: { damping: 10, mass: 0.8, stiffness: 100 },
    durationInFrames: 200,
  });

  const floatOffset = interpolate(floatY, [0, 1], [0, -20]);

  // Rotation animation
  const rotation = (frame - delay) * 0.5;

  // Scale in animation
  const scaleIn = spring({
    frame: frame - delay,
    fps,
    config: { damping: 12, mass: 1, stiffness: 120 },
    durationInFrames: 30,
  });

  const iconElement = getLucideIcon(icon, 32, color);

  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y + floatOffset,
        transform: `scale(${scaleIn * scale}) rotateZ(${rotation}deg)`,
        transformOrigin: 'center center',
      }}
    >
      {/* Card background with glow */}
      <div
        style={{
          background: `linear-gradient(135deg, ${color}20 0%, ${color}10 100%)`,
          backdropFilter: 'blur(20px)',
          border: `2px solid ${color}60`,
          borderRadius: '16px',
          padding: '20px',
          boxShadow: `0 8px 32px ${color}40, 0 0 20px ${color}30`,
          minWidth: '140px',
          textAlign: 'center',
        }}
      >
        {/* Icon */}
        {iconElement && (
          <div style={{ marginBottom: '8px', color }}>
            {iconElement}
          </div>
        )}

        {/* Title */}
        <div
          style={{
            fontSize: '14px',
            fontWeight: 'bold',
            color: '#fff',
            marginBottom: '4px',
          }}
        >
          {title}
        </div>

        {/* Filename */}
        {filename && (
          <div
            style={{
              fontSize: '11px',
              color: `${color}cc`,
              fontFamily: 'monospace',
            }}
          >
            {filename}
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// CONVERSION FLOW
// ============================================================================

interface ConversionFlowProps {
  fromIcon: string;
  toIcon: string;
  fromColor: string;
  toColor: string;
  fromLabel: string;
  toLabel: string;
  x: number;
  y: number;
  delay?: number;
}

export const ConversionFlow: React.FC<ConversionFlowProps> = ({
  fromIcon,
  toIcon,
  fromColor,
  toColor,
  fromLabel,
  toLabel,
  x,
  y,
  delay = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Arrow animation - arrows move left to right
  const arrowProgress = spring({
    frame: frame - delay,
    fps,
    config: { damping: 8, mass: 1, stiffness: 80 },
    durationInFrames: 120,
  });

  const arrowX = interpolate(arrowProgress, [0, 1], [-40, 0]);
  const arrowOpacity = interpolate(arrowProgress, [0, 0.5, 1], [0, 1, 1]);

  const fromIconElement = getLucideIcon(fromIcon, 28, fromColor);
  const toIconElement = getLucideIcon(toIcon, 28, toColor);

  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        display: 'flex',
        alignItems: 'center',
        gap: '20px',
      }}
    >
      {/* From Card */}
      <div
        style={{
          background: `linear-gradient(135deg, ${fromColor}20 0%, ${fromColor}10 100%)`,
          backdropFilter: 'blur(20px)',
          border: `2px solid ${fromColor}60`,
          borderRadius: '12px',
          padding: '16px',
          minWidth: '100px',
          textAlign: 'center',
        }}
      >
        {fromIconElement && <div style={{ marginBottom: '8px' }}>{fromIconElement}</div>}
        <div style={{ fontSize: '12px', color: '#fff' }}>{fromLabel}</div>
      </div>

      {/* Arrow */}
      <div
        style={{
          position: 'relative',
          width: '60px',
          height: '4px',
          background: `linear-gradient(90deg, ${fromColor}, ${toColor})`,
          borderRadius: '2px',
          opacity: arrowOpacity,
          transform: `translateX(${arrowX}px)`,
        }}
      >
        {/* Arrow head */}
        <div
          style={{
            position: 'absolute',
            right: '-8px',
            top: '-4px',
            width: '0',
            height: '0',
            borderLeft: `8px solid ${toColor}`,
            borderTop: '4px solid transparent',
            borderBottom: '4px solid transparent',
          }}
        />
      </div>

      {/* To Card */}
      <div
        style={{
          background: `linear-gradient(135deg, ${toColor}20 0%, ${toColor}10 100%)`,
          backdropFilter: 'blur(20px)',
          border: `2px solid ${toColor}60`,
          borderRadius: '12px',
          padding: '16px',
          minWidth: '100px',
          textAlign: 'center',
        }}
      >
        {toIconElement && <div style={{ marginBottom: '8px' }}>{toIconElement}</div>}
        <div style={{ fontSize: '12px', color: '#fff' }}>{toLabel}</div>
      </div>
    </div>
  );
};

// ============================================================================
// FEATURE ICON CLUSTER
// ============================================================================

interface FeatureIconClusterProps {
  icons: Array<{ icon: string; color: string; label: string }>;
  x: number;
  y: number;
  delay?: number;
  layout?: 'grid' | 'circle';
}

export const FeatureIconCluster: React.FC<FeatureIconClusterProps> = ({
  icons,
  x,
  y,
  delay = 0,
  layout = 'grid',
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '20px',
        width: '280px',
      }}
    >
      {icons.map((item, idx) => {
        const itemDelay = delay + idx * 15;
        const scaleIn = spring({
          frame: frame - itemDelay,
          fps,
          config: { damping: 12, mass: 1, stiffness: 120 },
          durationInFrames: 40,
        });

        const iconElement = getLucideIcon(item.icon, 24, item.color);

        return (
          <div
            key={idx}
            style={{
              transform: `scale(${scaleIn})`,
              transformOrigin: 'center center',
            }}
          >
            <div
              style={{
                background: `linear-gradient(135deg, ${item.color}20 0%, ${item.color}10 100%)`,
                backdropFilter: 'blur(20px)',
                border: `2px solid ${item.color}60`,
                borderRadius: '12px',
                padding: '16px',
                textAlign: 'center',
                boxShadow: `0 4px 16px ${item.color}30`,
              }}
            >
              {iconElement && (
                <div style={{ marginBottom: '8px' }}>
                  {iconElement}
                </div>
              )}
              <div style={{ fontSize: '11px', color: '#fff', fontWeight: '500' }}>
                {item.label}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ============================================================================
// CTA BUTTON HERO
// ============================================================================

interface CTAButtonHeroProps {
  text: string;
  subtext?: string;
  color: string;
  x: number;
  y: number;
  delay?: number;
}

export const CTAButtonHero: React.FC<CTAButtonHeroProps> = ({
  text,
  subtext,
  color,
  x,
  y,
  delay = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Pulse animation
  const pulse = spring({
    frame: (frame - delay) % 120,
    fps,
    config: { damping: 8, mass: 1, stiffness: 100 },
    durationInFrames: 60,
  });

  const shadowSize = interpolate(pulse, [0, 1], [0, 20]);

  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        textAlign: 'center',
      }}
    >
      <button
        style={{
          background: `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)`,
          border: 'none',
          borderRadius: '16px',
          padding: '18px 40px',
          fontSize: '18px',
          fontWeight: 'bold',
          color: '#fff',
          cursor: 'pointer',
          boxShadow: `0 ${shadowSize}px ${shadowSize * 1.5}px ${color}60, 0 4px 12px rgba(0,0,0,0.3)`,
          transition: 'all 0.3s ease',
        }}
      >
        {text}
      </button>

      {subtext && (
        <div
          style={{
            fontSize: '12px',
            color: `${color}cc`,
            marginTop: '12px',
            fontWeight: '500',
          }}
        >
          {subtext}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// UPLOAD ANIMATION
// ============================================================================

interface UploadAnimationProps {
  x: number;
  y: number;
  color: string;
  delay?: number;
}

export const UploadAnimation: React.FC<UploadAnimationProps> = ({
  x,
  y,
  color,
  delay = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // File rising animation
  const riseProgress = spring({
    frame: (frame - delay) % 240,
    fps,
    config: { damping: 10, mass: 1, stiffness: 100 },
    durationInFrames: 120,
  });

  const fileY = interpolate(riseProgress, [0, 1], [0, -100]);
  const fileOpacity = interpolate(riseProgress, [0, 0.8, 1], [1, 1, 0]);

  // Upload arrows
  const arrowBounce = spring({
    frame: frame - delay,
    fps,
    config: { damping: 12, mass: 1, stiffness: 140 },
    durationInFrames: 60,
  });

  const arrowScale = interpolate(arrowBounce, [0, 1], [0.6, 1]);

  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
      }}
    >
      {/* Upload zone background */}
      <div
        style={{
          background: `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)`,
          border: `3px dashed ${color}60`,
          borderRadius: '16px',
          padding: '40px',
          textAlign: 'center',
          minWidth: '180px',
        }}
      >
        {/* Upload arrow icon */}
        <div
          style={{
            fontSize: '40px',
            marginBottom: '12px',
            transform: `scale(${arrowScale})`,
            transformOrigin: 'center center',
          }}
        >
          ↑
        </div>

        {/* File cards rising */}
        {[0, 1, 2].map((idx) => {
          const delayOffset = delay + idx * 80;
          const fileProgress = spring({
            frame: frame - delayOffset,
            fps,
            config: { damping: 10, mass: 1, stiffness: 100 },
            durationInFrames: 120,
          });

          const fileLiftY = interpolate(fileProgress, [0, 1], [0, -80]);
          const fileOpacityVal = interpolate(fileProgress, [0, 0.7, 1], [1, 1, 0]);

          return (
            <div
              key={idx}
              style={{
                position: 'absolute',
                bottom: '60px',
                left: '50%',
                transform: `translateX(-50%) translateY(${fileLiftY}px)`,
                opacity: fileOpacityVal,
              }}
            >
              <div
                style={{
                  background: `linear-gradient(135deg, ${color}80 0%, ${color}40 100%)`,
                  borderRadius: '8px',
                  padding: '8px 12px',
                  fontSize: '11px',
                  color: '#fff',
                  fontWeight: 'bold',
                  whiteSpace: 'nowrap',
                }}
              >
                file_{idx + 1}.pdf
              </div>
            </div>
          );
        })}

        {/* Label */}
        <div style={{ fontSize: '14px', color: `${color}cc`, fontWeight: '500' }}>
          Drop your files here
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// DASHBOARD MOCKUP
// ============================================================================

interface DashboardMockupProps {
  title: string;
  color: string;
  x: number;
  y: number;
  delay?: number;
  width?: number;
  height?: number;
}

export const DashboardMockup: React.FC<DashboardMockupProps> = ({
  title,
  color,
  x,
  y,
  delay = 0,
  width = 300,
  height = 200,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Slide in animation
  const slideIn = spring({
    frame: frame - delay,
    fps,
    config: { damping: 10, mass: 1, stiffness: 100 },
    durationInFrames: 50,
  });

  const offsetX = interpolate(slideIn, [0, 1], [100, 0]);

  // Data bar animations
  const bars = [
    { height: 60, delay: delay + 20 },
    { height: 80, delay: delay + 40 },
    { height: 50, delay: delay + 60 },
    { height: 90, delay: delay + 80 },
  ];

  return (
    <div
      style={{
        position: 'absolute',
        left: x + offsetX,
        top: y,
        opacity: slideIn,
      }}
    >
      <div
        style={{
          background: `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)`,
          backdropFilter: 'blur(20px)',
          border: `2px solid ${color}40`,
          borderRadius: '12px',
          padding: '16px',
          width: `${width}px`,
          boxShadow: `0 8px 32px ${color}20`,
        }}
      >
        {/* Header */}
        <div
          style={{
            fontSize: '12px',
            fontWeight: 'bold',
            color: '#fff',
            marginBottom: '16px',
            paddingBottom: '12px',
            borderBottom: `1px solid ${color}30`,
          }}
        >
          {title}
        </div>

        {/* Chart bars */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-around',
            height: '100px',
            gap: '8px',
          }}
        >
          {bars.map((bar, idx) => {
            const barProgress = spring({
              frame: frame - bar.delay,
              fps,
              config: { damping: 12, mass: 1, stiffness: 140 },
              durationInFrames: 40,
            });

            const barHeight = interpolate(barProgress, [0, 1], [0, bar.height]);

            return (
              <div
                key={idx}
                style={{
                  width: '20%',
                  height: `${barHeight}px`,
                  background: `linear-gradient(180deg, ${color}ff 0%, ${color}80 100%)`,
                  borderRadius: '4px 4px 0 0',
                }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// PARALLAX BACKGROUND LAYER
// ============================================================================

interface ParallaxBackgroundProps {
  depth: number; // 0-1, where 0 is furthest back
  color: string;
  opacity?: number;
}

export const ParallaxBackgroundLayer: React.FC<ParallaxBackgroundProps> = ({
  depth,
  color,
  opacity = 0.05,
}) => {
  const frame = useCurrentFrame();

  // Slow pan based on depth
  const panX = (frame * depth * 0.3) % 1000;

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: `linear-gradient(45deg, ${color}${Math.floor(
          opacity * 255
        ).toString(16)} 0%, transparent 100%)`,
        opacity: opacity,
        transform: `translateX(${panX}px) scale(1.1)`,
        overflow: 'hidden',
        pointerEvents: 'none',
      }}
    />
  );
};
