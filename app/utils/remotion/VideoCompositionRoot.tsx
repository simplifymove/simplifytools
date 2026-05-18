/**
 * Remotion Root Composition
 * Entry point for all video compositions - registers available compositions
 */

import React from 'react';
import { Composition } from 'remotion';
import { VideoScript } from '@/app/utils/types/video-generation';
import { VideoCompositionContent } from './VideoComposition';
import { getResolutionFromAspectRatio, getFramesPerSecond } from './composition-utils';

/**
 * Props that will be passed to compositions during rendering
 */
export interface CompositionProps {
  script: VideoScript;
}

/**
 * Default script for composition registration
 */
const DEFAULT_SCRIPT: VideoScript = {
  title: 'Default Video',
  aspectRatio: '16:9',
  duration: 30,
  style: 'modern',
  tone: 'professional',
  voiceover: '',
  scenes: [
    {
      id: 0,
      duration: 10,
      headline: 'Welcome',
      subtext: 'Sample scene',
      visual: 'gradient',
      animation: 'fade',
      background: 'gradient',
      caption: 'Welcome to your video',
    },
  ],
  captions: ['Welcome to your video'],
  cta: 'Get Started',
};

/**
 * Root composition component
 * Remotion will scan this for all registered Composition elements
 * 
 * CRITICAL: This component registers the composition template.
 * The actual script/props will be passed via renderMedia's inputProps parameter.
 * We register with a flexible duration to accommodate different video lengths.
 */
export const VideoCompositionRoot: React.FC = () => {
  // Register with a 120-second (2-minute) duration as a safe maximum
  // The actual duration will come from the script props passed via renderMedia
  const { width, height } = getResolutionFromAspectRatio('16:9');
  const fps = getFramesPerSecond('modern');
  const maxDurationInFrames = 120 * fps; // 120 seconds at 30fps = 3600 frames

  return (
    <Composition
      id="video-composition"
      component={VideoCompositionContent as React.FC<any>}
      durationInFrames={maxDurationInFrames}
      fps={fps}
      width={width}
      height={height}
      // CRITICAL: Don't set defaultProps - rely entirely on inputProps at render time
      // This prevents the bundled DEFAULT_SCRIPT from overriding the actual script
      defaultProps={{}}
    />
  );
};

/**
 * Dynamic composition factory
 * Creates a composition configuration from a VideoScript
 */
export const createCompositionConfig = (script: VideoScript) => {
  const { width, height } = getResolutionFromAspectRatio(script.aspectRatio);
  const fps = getFramesPerSecond(script.style);
  const durationInFrames = Math.round(script.duration * fps);

  return {
    id: `video-${Date.now()}`,
    component: VideoCompositionContent as React.FC<any>,
    durationInFrames,
    fps,
    width,
    height,
    defaultProps: {
      script,
    },
  };
};
