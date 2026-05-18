/**
 * CRITICAL DEBUG VERSION: Cinematic Background Component
 * ============================================================
 * SIMPLIFIED for debugging - REMOVED all gradient fallbacks
 * 
 * Purpose:
 * 1. Render ACTUAL assets (videos/images) ONLY
 * 2. Show BRIGHT RED ERROR if asset is missing
 * 3. Make it IMPOSSIBLE to miss whether assets work
 * 4. Add aggressive debugging overlays
 */

import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, Video, Img, AbsoluteFill } from 'remotion';
import { CinematicConfig, DownloadedAsset } from '../types/cinematic-assets';
import { AssetDebugOverlay } from './AssetDebugOverlay';

interface CinematicBackgroundDebugProps {
  asset?: DownloadedAsset;
  config: CinematicConfig;
  duration: number;
  width: number;
  height: number;
  children?: React.ReactNode;
  // Debug props
  sceneKeywords?: string[];
  sceneMood?: string;
  assetSelected?: boolean;
}

/**
 * Ken Burns zoom effect
 */
function getKenBurnsTransform(
  frame: number,
  duration: number,
  focusPoint: { x: number; y: number } = { x: 0.5, y: 0.5 },
  intensity: number = 1.5,
): string {
  const progress = frame / duration;
  const startZoom = 1;
  const endZoom = 1 + (intensity - 1) * 0.3;
  const zoom = interpolate(progress, [0, 1], [startZoom, endZoom]);
  const panX = focusPoint.x * 10 * progress * intensity;
  const panY = focusPoint.y * 10 * progress * intensity;
  return `scale(${zoom}) translateX(${panX}px) translateY(${panY}px)`;
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
 * Drift effect
 */
function getDriftTransform(frame: number, amount: number = 5): string {
  const driftX = Math.sin(frame * 0.01) * amount;
  const driftY = Math.cos(frame * 0.008) * amount;
  return `translate(${driftX}px, ${driftY}px)`;
}

function extractPanDirection(motion: string): 'left' | 'right' | 'up' | 'down' {
  if (motion.includes('left')) return 'left';
  if (motion.includes('right')) return 'right';
  if (motion.includes('up')) return 'up';
  if (motion.includes('down')) return 'down';
  return 'left';
}

export const CinematicBackgroundDebug: React.FC<CinematicBackgroundDebugProps> = ({
  asset,
  config,
  duration,
  width,
  height,
  children,
  sceneKeywords,
  sceneMood,
  assetSelected,
}) => {
  const frame = useCurrentFrame();

  // HARD DEBUG: Try hardcoded test assets based on keywords
  let finalAsset = asset;
  if (!finalAsset && sceneKeywords && sceneKeywords.length > 0) {
    const keywordStr = sceneKeywords.join(' ').toLowerCase();
    
    if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_VIDEO_ASSET_DEBUG) {
      if (keywordStr.includes('forest') || keywordStr.includes('tree') || keywordStr.includes('nature')) {
        console.log('[CinematicBackgroundDebug] Using TEST ASSET: forest.svg');
        finalAsset = {
          id: 'test-forest-svg',
          url: '/test-assets/forest.svg',
          provider: 'local' as const,
          type: 'image' as const,
          keywords: ['forest', 'nature', 'test'],
          cachedPath: '/test-assets/forest.svg',
        };
      } else if (keywordStr.includes('elephant') || keywordStr.includes('wildlife') || keywordStr.includes('animal')) {
        console.log('[CinematicBackgroundDebug] Using TEST ASSET: elephant.svg');
        finalAsset = {
          id: 'test-elephant-svg',
          url: '/test-assets/elephant.svg',
          provider: 'local' as const,
          type: 'image' as const,
          keywords: ['elephant', 'wildlife', 'test'],
          cachedPath: '/test-assets/elephant.svg',
        };
      }
    }
  }

  // Calculate transforms
  let transform = '';
  if (config.cameraMotion === 'ken-burns-in' || config.cameraMotion === 'ken-burns-out') {
    transform = getKenBurnsTransform(frame, duration, config.focusPoint, config.zoomIntensity);
  } else if (config.cameraMotion?.startsWith('slow-pan')) {
    const direction = extractPanDirection(config.cameraMotion);
    transform = getPanTransform(frame, duration, direction, config.panAmount);
  } else if (config.cameraMotion === 'drift') {
    transform = getDriftTransform(frame, config.panAmount);
  }

  // CRITICAL: Log every render for debugging
  console.log('📹 CinematicBackgroundDebug RENDER:', {
    frame,
    hasAsset: !!finalAsset,
    assetUrl: finalAsset?.url?.substring(0, 60),
    assetProvider: finalAsset?.provider,
    keywords: sceneKeywords,
    mood: sceneMood,
    cameraMotion: config.cameraMotion,
  });

  // NO ASSET = BRIGHT RED ERROR SCREEN (HARD FAIL)
  if (!finalAsset) {
    console.error(
      '%c❌ CRITICAL: NO ASSET PROVIDED TO CinematicBackgroundDebug',
      'background: #dc2626; color: white; font-size: 16px; padding: 10px;',
    );
    console.error('Scene keywords:', sceneKeywords);
    console.error('Asset selected flag:', assetSelected);
    console.error('Config:', config);

    return (
      <AbsoluteFill style={{ background: '#dc2626' }}>
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            color: 'white',
            fontSize: 80,
            fontWeight: 'bold',
            textAlign: 'center',
            background: 'linear-gradient(135deg, #dc2626 0%, #7f1d1d 100%)',
            zIndex: 1000,
          }}
        >
          <div>❌</div>
          <div style={{ fontSize: 48, marginTop: 20 }}>NO ASSET FOUND</div>
          <div style={{ fontSize: 24, marginTop: 40, fontWeight: 'normal' }}>
            Asset pipeline failed
          </div>
          {sceneKeywords && sceneKeywords.length > 0 && (
            <div style={{ fontSize: 20, marginTop: 30 }}>
              Keywords: {sceneKeywords.join(', ')}
            </div>
          )}
          <div style={{ fontSize: 16, marginTop: 40, fontWeight: 'normal', color: '#fbbf24' }}>
            Check server logs for details
          </div>
        </div>
      </AbsoluteFill>
    );
  }

  // ASSET EXISTS = RENDER IT FULL SCREEN
  console.log(
    '%c✅ RENDERING ASSET',
    'background: #10b981; color: white; font-size: 16px; padding: 10px;',
    {
      url: finalAsset.url,
      provider: finalAsset.provider,
      type: finalAsset.type,
      cached: !!finalAsset.cachedPath,
    },
  );

  return (
    <AbsoluteFill style={{ background: '#000' }}>
      {/* MAIN ASSET - FULL SCREEN WITH EFFECTS */}
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
        {finalAsset.type === 'video' ? (
          <Video
            src={finalAsset.cachedPath || finalAsset.url}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block',
            }}
            muted
          />
        ) : (
          <Img
            src={finalAsset.cachedPath || finalAsset.url}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block',
            }}
          />
        )}
      </div>

      {/* Dark Overlay for readability */}
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

      {/* Content overlay on top */}
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

      {/* HARD DEBUG OVERLAY - Shows all asset details */}
      <AssetDebugOverlay
        asset={finalAsset}
        sceneKeywords={sceneKeywords}
        sceneMood={sceneMood}
        hasFallback={!finalAsset}
      />
    </AbsoluteFill>
  );
};

// EXPORT both debug and original for gradual switchover
export const CinematicBackground = CinematicBackgroundDebug;
