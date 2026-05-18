/**
 * Remotion Root Entry Point
 * This file is required by Remotion and must call registerRoot()
 */

import { registerRoot } from 'remotion';
import { VideoCompositionRoot } from './VideoCompositionRoot';

// Register the root composition
registerRoot(VideoCompositionRoot);
