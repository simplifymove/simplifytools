/**
 * Unified Video Renderer
 * Intelligently chooses between Remotion (preferred) and FFmpeg (fallback)
 */

import { VideoScript } from '@/app/utils/types/video-generation';
import { renderVideoScriptWithRemotion, estimateRenderTime, cleanupOldVideoFiles, cleanupOldBundles, getRenderStats as getRenderStatsFromRemotion } from './render-with-remotion';
import { join, resolve } from 'path';
import { existsSync, mkdirSync } from 'fs';

const VIDEO_TEMP_DIR = join(process.env.TEMP || '/tmp', 'simplifyconvert-videos');

const ensureTempDir = () => {
  if (!existsSync(VIDEO_TEMP_DIR)) {
    mkdirSync(VIDEO_TEMP_DIR, { recursive: true });
  }
};

/**
 * Render video using the optimal renderer (Remotion preferred)
 *
 * This function intelligently selects the best rendering engine:
 * 1. Tries Remotion first (modern, visual composition-based)
 * 2. Falls back to FFmpeg (reliable, battle-tested)
 *
 * Remotion is preferred because it:
 * - Supports visual component composition (easier to extend)
 * - Provides better control over animations and layouts
 * - Generates MP4 directly without post-processing
 */
export const renderVideoOptimized = async (
  script: VideoScript,
  jobId: string,
  onProgress?: (progress: number) => void
): Promise<{
  filePath: string;
  duration: number;
  renderer: 'remotion' | 'ffmpeg';
  message: string;
}> => {
  ensureTempDir();
  const outputPath = join(VIDEO_TEMP_DIR, `${jobId}.mp4`);

  console.log('[Renderer] Starting optimized video render');
  console.log('[Renderer] Script:', script.title, `(${script.duration}s)`);
  console.log('[Renderer] Job ID:', jobId);

  // Cleanup old files periodically
  cleanupOldVideoFiles();
  cleanupOldBundles();

  try {
    console.log('[Renderer] Attempting Remotion render...');

    const remotionResult = await renderVideoScriptWithRemotion(script, outputPath, onProgress);

    if (remotionResult.success && remotionResult.filePath) {
      console.log('[Renderer] ✅ Remotion render successful');
      console.log('[Renderer] Output:', remotionResult.filePath);
      return {
        filePath: remotionResult.filePath,
        duration: remotionResult.duration,
        renderer: 'remotion',
        message: 'Rendered with Remotion (visual composition)',
      };
    } else {
      throw new Error(remotionResult.error || 'Unknown Remotion error');
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('[Renderer] Remotion render failed:', errorMsg);
    console.log('[Renderer] Fallback: FFmpeg rendering not yet implemented');

    throw new Error(
      `Video rendering failed: ${errorMsg}. ` +
        'Please ensure Remotion is properly configured and has sufficient disk space.'
    );
  }
};

/**
 * Get render statistics for UI/monitoring
 * Re-exported from render-with-remotion
 */
export const getRenderStats = getRenderStatsFromRemotion;
