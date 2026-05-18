/**
 * Asset Debug Overlay Component
 * Renders visible proof of what asset is being used (or not)
 * Shows in the video itself - impossible to miss
 */

import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';

interface AssetDebugOverlayProps {
  asset?: {
    url: string;
    provider: string;
    type: 'image' | 'video' | 'illustration' | 'ui-mockup' | 'animated-overlay';
    cachedPath?: string;
  };
  sceneKeywords?: string[];
  sceneMood?: string;
  hasFallback: boolean;
}

export const AssetDebugOverlay: React.FC<AssetDebugOverlayProps> = ({
  asset,
  sceneKeywords,
  sceneMood,
  hasFallback,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Animate opacity for visibility
  const opacity = 0.95;

  if (hasFallback && !asset) {
    // CRITICAL: Show red error screen when asset is missing
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
            fontSize: 64,
            fontWeight: 'bold',
            textAlign: 'center',
            background: 'linear-gradient(135deg, #dc2626 0%, #7f1d1d 100%)',
          }}
        >
          <div style={{ marginBottom: 40, fontSize: 80 }}>❌</div>
          <div>NO ASSET FOUND</div>
          <div style={{ fontSize: 32, marginTop: 20, fontWeight: 'normal' }}>
            Asset pipeline failed
          </div>
          {sceneKeywords && sceneKeywords.length > 0 && (
            <div style={{ fontSize: 24, marginTop: 30, fontWeight: 'normal' }}>
              Keywords: {sceneKeywords.join(', ')}
            </div>
          )}
        </div>
      </AbsoluteFill>
    );
  }

  // NORMAL: Show asset info overlay in corner
  return (
    <AbsoluteFill
      style={{
        pointerEvents: 'none',
      }}
    >
      {/* Top-left: Asset details */}
      <div
        style={{
          position: 'absolute',
          top: 20,
          left: 20,
          background: 'rgba(0, 0, 0, 0.7)',
          color: 'white',
          padding: '12px 16px',
          borderRadius: 8,
          fontSize: 14,
          fontFamily: 'monospace',
          maxWidth: 400,
          opacity,
        }}
      >
        <div style={{ fontWeight: 'bold', marginBottom: 8, fontSize: 16 }}>
          🎬 DEBUG INFO
        </div>

        {asset ? (
          <>
            <div>
              <span style={{ color: '#10b981' }}>✓ ASSET FOUND</span>
            </div>
            <div style={{ marginTop: 8 }}>
              <div>
                <strong>Provider:</strong> {asset.provider}
              </div>
              <div>
                <strong>Type:</strong> {asset.type}
              </div>
              <div style={{ marginTop: 8, wordBreak: 'break-all', fontSize: 12 }}>
                <strong>URL:</strong>
                <br />
                {asset.url.substring(0, 60)}...
              </div>
              {asset.cachedPath && (
                <div style={{ marginTop: 8, color: '#fbbf24' }}>
                  <strong>📁 Cached:</strong> {asset.cachedPath.substring(0, 40)}...
                </div>
              )}
            </div>
          </>
        ) : (
          <div style={{ color: '#ef4444' }}>⚠️ NO ASSET</div>
        )}

        {/* Keywords */}
        {sceneKeywords && sceneKeywords.length > 0 && (
          <div
            style={{
              marginTop: 12,
              paddingTop: 12,
              borderTop: '1px solid #444',
              fontSize: 12,
            }}
          >
            <div>
              <strong>Keywords:</strong>
            </div>
            <div style={{ color: '#3b82f6', marginTop: 4 }}>
              {sceneKeywords.join(', ')}
            </div>
          </div>
        )}

        {/* Mood */}
        {sceneMood && (
          <div
            style={{
              marginTop: 8,
              fontSize: 12,
              color: '#d946ef',
            }}
          >
            <strong>Mood:</strong> {sceneMood}
          </div>
        )}
      </div>

      {/* Bottom-right: Asset badge (bright version) */}
      {asset && (
        <div
          style={{
            position: 'absolute',
            bottom: 20,
            right: 20,
            background: '#10b981',
            color: 'white',
            padding: '8px 16px',
            borderRadius: 20,
            fontSize: 16,
            fontWeight: 'bold',
            opacity,
            boxShadow: '0 4px 20px rgba(16, 185, 129, 0.4)',
          }}
        >
          ✓ Asset: {asset.provider}
        </div>
      )}

      {/* Frame counter for debugging */}
      <div
        style={{
          position: 'absolute',
          bottom: 20,
          left: 20,
          color: 'white',
          fontSize: 12,
          fontFamily: 'monospace',
          background: 'rgba(0, 0, 0, 0.5)',
          padding: '4px 8px',
          borderRadius: 4,
          opacity: 0.5,
        }}
      >
        Frame: {frame} / FPS: {fps}
      </div>
    </AbsoluteFill>
  );
};
