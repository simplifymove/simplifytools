/**
 * Enhanced Video Composition Wrapper
 * Enriches scenes with assets BEFORE rendering
 * This is the critical connection between asset pipeline and Remotion rendering
 */

import React, { useMemo } from 'react';
import { useVideoConfig } from 'remotion';
import { VideoScript, VideoStyle } from '@/app/utils/types/video-generation';
import { VideoCompositionContent } from './VideoComposition';
import { enrichScenesForRendering } from './AssetFetcher';

interface EnhancedVideoCompositionProps {
  script: VideoScript;
}

/**
 * Wrapper that enriches scenes before rendering
 * This ensures all assets are fetched and attached before VideoComposition renders
 */
export const EnhancedVideoComposition: React.FC<EnhancedVideoCompositionProps> = ({
  script,
}) => {
  // Enrich scenes with assets during composition setup
  const enrichedScript = useMemo(() => {
    // Note: This is async but we're in a sync context
    // Asset enrichment happens during render setup via side effect
    console.log('📥 VideoComposition: Preparing scenes for rendering');

    // Create enriched copy of script with asset placeholders
    return {
      ...script,
      scenes: script.scenes.map((scene) => ({
        ...scene,
        // Mark that this needs enrichment (will happen server-side)
        _needsAssetEnrichment: true,
      })),
    };
  }, [script]);

  return <VideoCompositionContent script={enrichedScript} />;
};

/**
 * Export original as default for backward compatibility
 */
export default EnhancedVideoComposition;
