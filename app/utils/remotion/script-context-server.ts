/**
 * Server-Side Script Context Manager
 * Manages the global script variable that the bundled composition accesses
 */

import { VideoScript } from '@/app/utils/types/video-generation';

/**
 * Set the current script in global context
 * This is called from render-with-remotion.ts before calling renderMedia
 */
export const setCurrentScriptGlobal = (script: VideoScript): void => {
  if (typeof global !== 'undefined') {
    (global as any).__CURRENT_VIDEO_SCRIPT__ = script;
    console.log(`[ScriptGlobal] ✓ Script set globally: "${script.title}"`);
  }
};

/**
 * Clear the current script from global
 * Called after rendering is complete
 */
export const clearCurrentScriptGlobal = (): void => {
  if (typeof global !== 'undefined') {
    (global as any).__CURRENT_VIDEO_SCRIPT__ = null;
    console.log('[ScriptGlobal] ✓ Script cleared from global');
  }
};
