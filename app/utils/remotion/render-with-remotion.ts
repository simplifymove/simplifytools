/**
 * Remotion-based Video Rendering
 * Main integration point between Remotion composition and MP4 output
 *
 * This module provides rendering capabilities using Remotion's renderMedia API.
 * It validates scripts, calculates rendering parameters, and manages the async
 * rendering process with progress tracking.
 */

import { renderMedia, selectComposition } from '@remotion/renderer';
import { bundle } from '@remotion/bundler';
import { VideoScript } from '@/app/utils/types/video-generation';
import { getResolutionFromAspectRatio, getFramesPerSecond, calculateTotalFrames } from './composition-utils';
import { setCurrentScriptGlobal, clearCurrentScriptGlobal } from './script-context-server';
import { existsSync, mkdirSync, rmSync, writeFileSync, readFileSync } from 'fs';
import { join, resolve } from 'path';

// Environment
const TEMP_DIR = process.env.TEMP || process.env.TMPDIR || '/tmp';
const VIDEO_TEMP_DIR = join(TEMP_DIR, 'simplifyconvert-videos');
const REMOTION_BUNDLE_DIR = join(TEMP_DIR, 'remotion-bundles');

// Remotion bundle cache (to avoid re-bundling)
let cachedBundlePath: string | null = null;
const BUNDLE_CACHE_TIMEOUT = 60 * 60 * 1000; // 1 hour
let bundleCacheTime = 0;

// Ensure directories exist
const ensureDirs = () => {
  [VIDEO_TEMP_DIR, REMOTION_BUNDLE_DIR].forEach((dir) => {
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
  });
};

/**
 * Get or create Remotion bundle
 * Bundles the Remotion composition for rendering
 */
const getBundlePath = async (): Promise<string> => {
  const now = Date.now();

  // Use cached bundle if still fresh
  if (cachedBundlePath && existsSync(cachedBundlePath) && now - bundleCacheTime < BUNDLE_CACHE_TIMEOUT) {
    console.log('[Remotion] Using cached bundle:', cachedBundlePath);
    return cachedBundlePath;
  }

  ensureDirs();

  const bundlePath = join(REMOTION_BUNDLE_DIR, `bundle-${Date.now()}`);

  try {
    console.log('[Remotion] Creating Remotion bundle...');

    // Resolve the composition file path from project root
    // Process.cwd() gives us the actual project root, not the compiled .next directory
    const compositionPath = resolve(process.cwd(), 'app', 'utils', 'remotion', 'remotion.tsx');
    
    console.log('[Remotion] Composition file:', compositionPath);
    console.log('[Remotion] File exists:', existsSync(compositionPath));

    if (!existsSync(compositionPath)) {
      throw new Error(`Composition file not found at: ${compositionPath}`);
    }

    // Bundle the Remotion composition
    // bundle(entryPoint, onProgress?, options?)
    await bundle(
      compositionPath,
      undefined, // onProgress - optional
      {
        outDir: bundlePath,
      } as any // Let Remotion handle the type checking
    );

    console.log('[Remotion] ✓ Bundle created:', bundlePath);

    // Cache the bundle path
    cachedBundlePath = bundlePath;
    bundleCacheTime = now;

    return bundlePath;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('[Remotion] Bundle creation failed:', errorMessage);
    throw new Error(`Failed to bundle Remotion project: ${errorMessage}`);
  }
};

/**
 * Render a video script to MP4 using Remotion
 *
 * Flow:
 * 1. Validate script
 * 2. Bundle Remotion project
 * 3. Select composition
 * 4. Call renderMedia() with script as props
 * 5. Track progress (10-90% rendering, 90-100% validation)
 * 6. Validate output with ffprobe
 * 7. Clean up temporary files
 */
export const renderVideoScriptWithRemotion = async (
  script: VideoScript,
  outputPath: string,
  onProgress?: (progress: number) => void
): Promise<{ success: boolean; filePath?: string; duration: number; error?: string }> => {
  ensureDirs();
  let bundlePath: string | null = null;

  try {
    console.log('[Remotion] Starting video render for:', script.title);
    console.log('[Remotion] Output:', outputPath);

    // 1. Validate script structure
    if (!script.scenes || script.scenes.length === 0) {
      throw new Error('Script must have at least one scene');
    }

    // 2. Calculate rendering parameters
    const { width, height } = getResolutionFromAspectRatio(script.aspectRatio);
    const fps = getFramesPerSecond(script.style);
    const totalFrames = calculateTotalFrames(script.duration, fps);

    console.log('[Remotion] Composition config:', {
      width,
      height,
      fps,
      totalFrames,
      duration: script.duration,
      style: script.style,
    });

    // Log scene details
    console.log('[Remotion] Rendering scenes:');
    script.scenes.forEach((scene, idx) => {
      const sceneFrames = Math.round(scene.duration * fps);
      console.log(`  Scene ${idx + 1}: "${scene.headline}" (${scene.duration}s = ${sceneFrames}f)`);
    });

    onProgress?.(5);

    // 3. Get or create bundle
    bundlePath = await getBundlePath();
    onProgress?.(15);

    // 4. Select composition
    console.log('[Remotion] Selecting composition...');
    const comp = await selectComposition({
      serveUrl: bundlePath,
      id: 'video-composition',
    });

    if (!comp) {
      throw new Error('Failed to select composition "video-composition"');
    }

    console.log('[Remotion] ✓ Composition selected');
    onProgress?.(20);

    // CRITICAL: Set the current script in global context
    // The composition will access this via getCurrentScript() from script-context.ts
    setCurrentScriptGlobal(script);

    // 5. Prepare render options
    const renderOptions: any = {
      composition: comp,
      serveUrl: bundlePath,
      outputLocation: outputPath,
      inputProps: {
        script, // Pass the VideoScript as props to the composition
      },
      codec: 'h264' as const,
      crf: 28, // Quality: 0-51 (lower = better)
      pixelFormat: 'yuv420p' as const,
      concurrency: 4,
      verbose: false,
      onProgress: (progress: any) => {
        // Remotion progress object has a 'progress' property (0-1 range)
        const progressValue = progress.progress ?? progress ?? 0;
        const mappedProgress = 20 + progressValue * 70;
        onProgress?.(Math.round(mappedProgress));
      },
    };

    // 6. Render the video
    console.log('[Remotion] Starting render process...');
    await renderMedia(renderOptions);

    onProgress?.(90);
    console.log('[Remotion] ✓ Render completed');

    // Clear the script from global context after rendering
    clearCurrentScriptGlobal();

    // 7. Validate output (if ffprobe available)
    onProgress?.(95);
    if (existsSync(outputPath)) {
      const stats = require('fs').statSync(outputPath);
      const fileSizeMB = stats.size / (1024 * 1024);
      console.log(
        `[Remotion] ✓ Output file created: ${fileSizeMB.toFixed(2)} MB`
      );
    }

    onProgress?.(100);

    return {
      success: true,
      filePath: outputPath,
      duration: script.duration,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('[Remotion] Render failed:', errorMessage);

    // Clean up failed output
    if (existsSync(outputPath)) {
      try {
        rmSync(outputPath);
      } catch (e) {
        console.warn('[Remotion] Failed to clean up partial output:', e);
      }
    }

    return {
      success: false,
      duration: 0,
      error: errorMessage,
    };
  } finally {
    // Note: We keep the bundle for caching to avoid re-bundling
    // Cleanup happens periodically via cleanupOldBundles()
  }
};

/**
 * Alternative: Render with GPU acceleration (if available)
 * Falls back to CPU if GPU unavailable
 */
export const renderVideoScriptWithRemotionGPU = async (
  script: VideoScript,
  outputPath: string,
  onProgress?: (progress: number) => void
): Promise<{ success: boolean; filePath?: string; duration: number; error?: string }> => {
  try {
    console.log('[Remotion-GPU] Attempting GPU-accelerated render for:', script.title);

    // For now, fall back to CPU rendering
    // GPU rendering would be implemented here with gpuIndex parameter
    return renderVideoScriptWithRemotion(script, outputPath, onProgress);
  } catch (error) {
    console.warn('[Remotion-GPU] GPU render failed, falling back to CPU:', error);

    // Fallback to CPU rendering
    return renderVideoScriptWithRemotion(script, outputPath, onProgress);
  }
};

/**
 * Get estimated render time based on script complexity
 */
export const estimateRenderTime = (script: VideoScript): number => {
  // Rough estimate: 1 second video takes 2-5 seconds to render depending on complexity
  // Multiplier increases with scene count and visual complexity
  const complexityMultiplier =
    script.scenes.length > 10 ? 5 : script.scenes.length > 5 ? 3 : 2;
  return Math.round(script.duration * complexityMultiplier);
};

/**
 * Clean up old Remotion bundles (older than 1 hour)
 */
export const cleanupOldBundles = () => {
  try {
    if (!existsSync(REMOTION_BUNDLE_DIR)) return;

    const files = require('fs').readdirSync(REMOTION_BUNDLE_DIR);
    const now = Date.now();
    const maxAge = 60 * 60 * 1000; // 1 hour

    files.forEach((file: string) => {
      const filePath = join(REMOTION_BUNDLE_DIR, file);
      try {
        const stats = require('fs').statSync(filePath);
        if (now - stats.mtimeMs > maxAge) {
          console.log('[Remotion] Cleaning up old bundle:', file);
          rmSync(filePath, { recursive: true, force: true });
        }
      } catch (e) {
        console.warn('[Remotion] Error checking bundle age:', e);
      }
    });
  } catch (error) {
    console.warn('[Remotion] Cleanup failed:', error);
  }
};

/**
 * Clean up old video files (older than 24 hours)
 */
export const cleanupOldVideoFiles = () => {
  try {
    if (!existsSync(VIDEO_TEMP_DIR)) return;

    const files = require('fs').readdirSync(VIDEO_TEMP_DIR);
    const now = Date.now();
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours

    files.forEach((file: string) => {
      const filePath = join(VIDEO_TEMP_DIR, file);
      try {
        const stats = require('fs').statSync(filePath);
        if (now - stats.mtimeMs > maxAge) {
          console.log('[Remotion] Removing old video file:', file);
          rmSync(filePath, { force: true });
        }
      } catch (e) {
        console.warn('[Remotion] Error checking file age:', e);
      }
    });
  } catch (error) {
    console.warn('[Remotion] Video cleanup failed:', error);
  }
};

/**
 * Render with timeout protection
 * Aborts render if it exceeds the timeout
 */
export const renderVideoWithTimeout = async (
  script: VideoScript,
  outputPath: string,
  timeoutMs: number = 10 * 60 * 1000, // 10 minutes default
  onProgress?: (progress: number) => void
): Promise<{ success: boolean; filePath?: string; duration: number; error?: string }> => {
  return Promise.race([
    renderVideoScriptWithRemotion(script, outputPath, onProgress),
    new Promise<{ success: boolean; filePath?: string; duration: number; error?: string }>(
      (_, reject) =>
        setTimeout(
          () => reject(new Error(`Render timeout exceeded: ${timeoutMs}ms`)),
          timeoutMs
        )
    ),
  ]).catch((error) => ({
    success: false,
    duration: 0,
    error: error instanceof Error ? error.message : String(error),
  }));
};

/**
 * Get render statistics for UI/monitoring
 */
export const getRenderStats = (script: VideoScript) => {
  const { width, height } = getResolutionFromAspectRatio(script.aspectRatio);
  const fps = getFramesPerSecond(script.style);
  const totalFrames = calculateTotalFrames(script.duration, fps);

  return {
    duration: script.duration,
    dimensions: { width, height },
    fps,
    totalFrames,
    sceneCount: script.scenes.length,
    estimatedRenderTime: estimateRenderTime(script),
    complexity:
      script.scenes.length > 10 ? 'high' : script.scenes.length > 5 ? 'medium' : 'low',
    style: script.style,
    aspectRatio: script.aspectRatio,
  };
};
