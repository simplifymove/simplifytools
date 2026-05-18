/**
 * Script Context Module  
 * Provides minimal script access for the bundled composition
 * NO Node.js imports - must work in bundled/browser context!
 */

import { VideoScript } from '@/app/utils/types/video-generation';

/**
 * Global variable that the composition can access
 * This is set by the render function before calling renderMedia
 */
declare global {
  var __CURRENT_VIDEO_SCRIPT__: VideoScript | null;
}

/**
 * Get the current script from global
 * The composition calls this to get the script to render
 */
export const getCurrentScript = (): VideoScript | null => {
  // In Remotion bundle context, access via global
  if (typeof global !== 'undefined' && (global as any).__CURRENT_VIDEO_SCRIPT__) {
    return (global as any).__CURRENT_VIDEO_SCRIPT__;
  }
  // In browser context (if needed)
  if (typeof window !== 'undefined' && (window as any).__CURRENT_VIDEO_SCRIPT__) {
    return (window as any).__CURRENT_VIDEO_SCRIPT__;
  }
  return null;
};


