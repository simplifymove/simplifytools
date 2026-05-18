/**
 * Debug Watermark Component
 * Proves that Remotion is being used for rendering
 * Adds "REMOTION ACTIVE" text to top-right corner of every frame
 */

import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';

interface DebugWatermarkProps {
  visible?: boolean;
  text?: string;
}

/**
 * Debug watermark - visible proof that Remotion is rendering
 * Shows frame count and timestamp for debugging
 */
export const DebugWatermark: React.FC<DebugWatermarkProps> = ({ 
  visible = true, 
  text = 'REMOTION ACTIVE' 
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  if (!visible) return null;

  const elapsedSeconds = (frame / fps).toFixed(2);
  const totalSeconds = (durationInFrames / fps).toFixed(1);

  return (
    <div
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        backgroundColor: 'rgba(0, 255, 100, 0.9)',
        color: '#000',
        padding: '12px 16px',
        borderRadius: '6px',
        fontFamily: 'monospace',
        fontSize: '14px',
        fontWeight: 'bold',
        zIndex: 9999,
        border: '2px solid #00ff64',
        boxShadow: '0 0 20px rgba(0, 255, 100, 0.5)',
        lineHeight: '1.4',
      }}
    >
      <div>{text}</div>
      <div style={{ fontSize: '12px', marginTop: '4px', opacity: 0.8 }}>
        Frame: {frame} / {durationInFrames}
      </div>
      <div style={{ fontSize: '12px', opacity: 0.8 }}>
        {elapsedSeconds}s / {totalSeconds}s
      </div>
    </div>
  );
};
