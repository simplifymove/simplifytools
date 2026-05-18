/**
 * Remotion Configuration
 * Registers video compositions and configures rendering defaults
 */

import { registerRoot } from 'remotion';
import { VideoCompositionRoot } from './VideoCompositionRoot';

// Register the root composition component
registerRoot(VideoCompositionRoot);

// Configure Remotion behavior
export const remotionConfig = {
  // Default rendering settings
  defaultProps: {
    fps: 30,
    width: 1920,
    height: 1080,
    durationInFrames: 900, // 30 seconds at 30fps
  },
};
