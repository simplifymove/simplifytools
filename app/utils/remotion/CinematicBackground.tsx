/**
 * Cinematic Background Component
 * Renders background assets with professional video effects:
 * - Ken Burns zoom effect
 * - Slow pan/drift
 * - Dark overlays for text readability
 * - Particle effects (dust, light rays, fog)
 * - Vignette effect
 * - Depth blur
 * 
 * CRITICAL: This component MUST render actual Video/Image elements, not gradients
 */

import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, Video, Img, AbsoluteFill } from 'remotion';
import { CinematicConfig, DownloadedAsset } from '../types/cinematic-assets';

interface CinematicBackgroundProps {
  asset?: DownloadedAsset;
  config: CinematicConfig;
  duration: number;
  width: number;
  height: number;
  children?: React.ReactNode;
}

/**
 * Ken Burns zoom effect
 * Slowly zooms from one point to another with cinematic feel
 */
function getKenBurnsTransform(
  frame: number,
  duration: number,
  focusPoint: { x: number; y: number } = { x: 0.5, y: 0.5 },
  intensity: number = 1.5,
): string {
  const progress = frame / duration;
  
  // Create zoom and subtle pan effect
  const startZoom = 1;
  const endZoom = 1 + (intensity - 1) * 0.3; // Subtle zoom
  const zoom = interpolate(progress, [0, 1], [startZoom, endZoom]);
  
  // Pan towards focus point
  const panX = focusPoint.x * 10 * progress * intensity;
  const panY = focusPoint.y * 10 * progress * intensity;

  return `
    scale(${zoom})
    translateX(${panX}px)
    translateY(${panY}px)
  `;
}

/**
 * Slow pan effect
 */
function getPanTransform(
  frame: number,
  duration: number,
  direction: 'left' | 'right' | 'up' | 'down' = 'left',
  amount: number = 20,
): string {
  const progress = frame / duration;
  
  const distancePx = amount * progress;

  switch (direction) {
    case 'left':
      return `translateX(-${distancePx}px)`;
    case 'right':
      return `translateX(${distancePx}px)`;
    case 'up':
      return `translateY(-${distancePx}px)`;
    case 'down':
      return `translateY(${distancePx}px)`;
    default:
      return '';
  }
}

/**
 * Drift effect (slow random movement)
 */
function getDriftTransform(frame: number, amount: number = 5): string {
  // Use sine waves for smooth oscillation
  const driftX = Math.sin(frame * 0.01) * amount;
  const driftY = Math.cos(frame * 0.008) * amount;

  return `translate(${driftX}px, ${driftY}px)`;
}

/**
 * Extract direction from camera motion
 */
function extractPanDirection(motion: string): 'left' | 'right' | 'up' | 'down' {
  if (motion.includes('left')) return 'left';
  if (motion.includes('right')) return 'right';
  if (motion.includes('up')) return 'up';
  if (motion.includes('down')) return 'down';
  return 'left';
}

export const CinematicBackground: React.FC<CinematicBackgroundProps> = ({
  asset,
  config,
  duration,
  width,
  height,
  children,
}) => {
  const frame = useCurrentFrame();

  // Determine background styling
  let backgroundStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    backgroundColor: '#000',
  };

  // Calculate transforms based on camera motion
  let transform = '';

  if (config.cameraMotion === 'ken-burns-in' || config.cameraMotion === 'ken-burns-out') {
    transform = getKenBurnsTransform(
      frame,
      duration,
      config.focusPoint,
      config.zoomIntensity,
    );
  } else if (config.cameraMotion?.startsWith('slow-pan')) {
    const direction = extractPanDirection(config.cameraMotion);
    transform = getPanTransform(frame, duration, direction, config.panAmount);
  } else if (config.cameraMotion === 'drift') {
    transform = getDriftTransform(frame, config.panAmount);
  }

  return (
    <div
      style={{
        ...backgroundStyle,
        position: 'relative',
      }}
    >
      {/* Background Media - ACTUAL ASSET RENDERING */}
      {asset ? (
        <>
          {console.log('🎬 RENDERING ASSET:', {
            headline: 'Asset background',
            type: asset.type,
            url: asset.url,
            provider: asset.provider,
            cached: !!asset.cachedPath,
          })}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              overflow: 'hidden',
              transform,
            }}
          >
            {asset.type === 'video' ? (
              <Video
                src={asset.cachedPath || asset.url}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  filter: config.depthBlur?.enabled
                    ? `blur(${config.depthBlur.blurAmount || 0}px)`
                    : 'none',
                }}
                muted
              />
            ) : (
              <Img
                src={asset.cachedPath || asset.url}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  filter: config.depthBlur?.enabled
                    ? `blur(${config.depthBlur.blurAmount || 0}px)`
                    : 'none',
                }}
              />
            )}
          </div>
        </>
      ) : (
        <>
          {console.log('⚠️  NO ASSET - USING GRADIENT FALLBACK')}
          {/* GRADIENT FALLBACK - Only when no asset */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            }}
          />
        </>
      )}

      {/* Dark Overlay for Text Readability */}
      {config.darkOverlay?.enabled && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: `rgba(0, 0, 0, ${config.darkOverlay.opacity})`,
            pointerEvents: 'none',
          }}
        />
      )}

      {/* Gradient Overlay */}
      {config.overlayGradient?.enabled && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: `linear-gradient(135deg, ${config.overlayGradient.colors[0]}, ${config.overlayGradient.colors[1]})`,
            opacity: config.overlayGradient.opacity,
            pointerEvents: 'none',
          }}
        />
      )}

      {/* Vignette Effect */}
      {config.vignetteEffect?.enabled && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: `radial-gradient(ellipse at center, transparent 30%, rgba(0, 0, 0, ${config.vignetteEffect.intensity}))`,
            pointerEvents: 'none',
          }}
        />
      )}

      {/* Particle Effect Container */}
      {config.particleEffect?.enabled && (
        <ParticleEffectOverlay
          type={config.particleEffect.type}
          intensity={config.particleEffect.intensity}
          frame={frame}
          duration={duration}
        />
      )}

      {/* Content on top */}
      {children && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {children}
        </div>
      )}

      {/* DEBUG: Asset verification label in bottom right corner */}
      {asset && (
        <div
          style={{
            position: 'absolute',
            bottom: 10,
            right: 10,
            padding: '8px 12px',
            backgroundColor: 'rgba(0, 200, 100, 0.8)',
            color: 'white',
            fontSize: '12px',
            fontFamily: 'monospace',
            zIndex: 100,
            borderRadius: '4px',
            maxWidth: '300px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          <strong>✓ Asset: {asset.provider}</strong>
          <br />
          {asset.cachedPath ? '📁 Cached' : '🌐 Live'}
        </div>
      )}

      {/* DEBUG: No asset warning label */}
      {!asset && (
        <div
          style={{
            position: 'absolute',
            bottom: 10,
            right: 10,
            padding: '8px 12px',
            backgroundColor: 'rgba(200, 100, 0, 0.8)',
            color: 'white',
            fontSize: '12px',
            fontFamily: 'monospace',
            zIndex: 100,
            borderRadius: '4px',
          }}
        >
          ⚠️ No Asset - Gradient
        </div>
      )}
    </div>
  );
};

/**
 * Particle Effect Overlay
 * Renders various particle effects (dust, light rays, fog, etc.)
 */
interface ParticleEffectOverlayProps {
  type: 'dust' | 'light-rays' | 'fog' | 'stars' | 'rain' | 'snow';
  intensity: number;
  frame: number;
  duration: number;
}

const ParticleEffectOverlay: React.FC<ParticleEffectOverlayProps> = ({
  type,
  intensity,
  frame,
  duration,
}) => {
  const particleCount = Math.ceil(20 * intensity);

  switch (type) {
    case 'light-rays':
      return (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: `
              repeating-linear-gradient(
                45deg,
                transparent,
                transparent 10px,
                rgba(255, 255, 255, ${0.05 * intensity}) 10px,
                rgba(255, 255, 255, ${0.05 * intensity}) 20px
              )
            `,
            animation: `drift 20s infinite`,
            pointerEvents: 'none',
          }}
        />
      );

    case 'fog':
      return (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: `radial-gradient(ellipse at center, transparent 0%, rgba(255, 255, 255, ${0.1 * intensity}))`,
            backdropFilter: `blur(${2 * intensity}px)`,
            pointerEvents: 'none',
          }}
        />
      );

    case 'stars':
      return (
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
          {Array.from({ length: particleCount }).map((_, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                width: '2px',
                height: '2px',
                backgroundColor: 'white',
                borderRadius: '50%',
                left: `${(i * 100) % 100}%`,
                top: `${(i * 50) % 100}%`,
                opacity: Math.sin((frame + i * 30) / 30) * 0.7,
              }}
            />
          ))}
        </div>
      );

    case 'rain':
    case 'snow':
      const speed = type === 'rain' ? 20 : 40;
      return (
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
          {Array.from({ length: particleCount }).map((_, i) => {
            const offset = ((frame + i * 50) % (duration * speed)) / speed;
            return (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  width: type === 'rain' ? '2px' : '4px',
                  height: type === 'rain' ? '15px' : '4px',
                  backgroundColor: 'rgba(255, 255, 255, 0.6)',
                  borderRadius: type === 'snow' ? '50%' : '0',
                  left: `${(i * 13) % 100}%`,
                  top: `${offset - 100}%`,
                  opacity: 0.6 * intensity,
                }}
              />
            );
          })}
        </div>
      );

    case 'dust':
    default:
      return (
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
          {Array.from({ length: Math.ceil(particleCount / 2) }).map((_, i) => {
            const offsetX = Math.sin(frame * 0.02 + i) * 50;
            const offsetY = Math.cos(frame * 0.015 + i) * 50;
            return (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  width: `${3 + (i % 3)}px`,
                  height: `${3 + (i % 3)}px`,
                  backgroundColor: 'rgba(255, 255, 255, 0.3)',
                  borderRadius: '50%',
                  left: `${(i * 20 + offsetX) % 100}%`,
                  top: `${(i * 30 + offsetY) % 100}%`,
                  opacity: 0.3 * intensity,
                  filter: 'blur(1px)',
                }}
              />
            );
          })}
        </div>
      );
  }
};

export default CinematicBackground;
