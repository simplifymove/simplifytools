/**
 * Server-side Remotion rendering utility
 * Handles real MP4 rendering with progress tracking
 */

import { spawn, execSync } from 'child_process';
import { writeFileSync, readFileSync, existsSync, unlinkSync, mkdirSync } from 'fs';
import { join, resolve } from 'path';
import { VideoScript } from '@/app/utils/types/video-generation';

// Import static FFmpeg and ffprobe binaries (may not be accurate in bundled context)
let ffmpegStaticImport: string | undefined;
let ffprobeStaticImport: { path: string } | undefined;

try {
  ffmpegStaticImport = require('ffmpeg-static');
} catch (e) {
  // Silently fail - we'll resolve at runtime
}

try {
  ffprobeStaticImport = require('ffprobe-static');
} catch (e) {
  // Silently fail - we'll resolve at runtime
}

const TEMP_DIR = process.env.TEMP || '/tmp';
const VIDEO_TEMP_DIR = join(TEMP_DIR, 'simplifyconvert-videos');

// Cache resolved paths to avoid repeated lookups
let cachedFFmpegPath: string | null = null;
let cachedFFprobePath: string | null = null;

// Ensure temp directory exists
const ensureTempDir = () => {
  if (!existsSync(VIDEO_TEMP_DIR)) {
    mkdirSync(VIDEO_TEMP_DIR, { recursive: true });
  }
};

/**
 * Resolve FFmpeg binary path at runtime
 * Tries multiple candidates to work around Next.js bundling issues
 */
function resolveFFmpegPath(): string {
  if (cachedFFmpegPath) {
    return cachedFFmpegPath;
  }

  const isWindows = process.platform === 'win32';
  const ffmpegFilename = isWindows ? 'ffmpeg.exe' : 'ffmpeg';

  // Build list of candidates in order of preference
  const candidates: (string | undefined)[] = [
    // 1. Environment variable override
    process.env.FFMPEG_PATH,
    // 2. Runtime resolution from project root node_modules
    join(process.cwd(), 'node_modules', 'ffmpeg-static', ffmpegFilename),
    // 3. Imported path (may be wrong in Next.js, but try anyway)
    ffmpegStaticImport,
    // 4. System PATH fallback
    'ffmpeg',
  ];

  // Find first candidate that exists or is 'ffmpeg'
  for (const candidate of candidates) {
    if (!candidate) continue;

    // 'ffmpeg' is a special case - assume it's in PATH
    if (candidate === 'ffmpeg') {
      cachedFFmpegPath = 'ffmpeg';
      if (process.env.NODE_ENV !== 'production') {
        console.log('[Render] Resolved FFmpeg path (from PATH):', candidate);
      }
      return candidate;
    }

    // Check if file exists
    if (existsSync(candidate)) {
      cachedFFmpegPath = candidate;
      if (process.env.NODE_ENV !== 'production') {
        console.log('[Render] Resolved FFmpeg path:', candidate);
      }
      return candidate;
    }
  }

  // None found - show detailed error
  const checkedPaths = candidates.filter(Boolean);
  console.error('[Render] ❌ FFmpeg binary not found at any of these locations:');
  checkedPaths.forEach((p, i) => console.error(`  ${i + 1}. ${p}`));
  console.error('[Render] Solution: Install ffmpeg-static with: npm install ffmpeg-static');

  // Still return 'ffmpeg' as last resort fallback
  cachedFFmpegPath = 'ffmpeg';
  return 'ffmpeg';
}

/**
 * Escape path for FFmpeg filter_complex syntax
 * Replaces backslashes with forward slashes and escapes drive letter colon
 * Example: C:\path\to\file.ttf → C\:/path/to/file.ttf
 */
function escapeFilterPath(filePath: string): string {
  // Convert backslashes to forward slashes
  let escaped = filePath.replace(/\\/g, '/');
  
  // Escape colon in Windows drive letter (C: → C\:)
  escaped = escaped.replace(/^([A-Za-z]):/, '$1\\:');
  
  return escaped;
}

/**
 * Resolve ffprobe binary path at runtime
 */
function resolveFFprobePath(): string {
  if (cachedFFprobePath) {
    return cachedFFprobePath;
  }

  const isWindows = process.platform === 'win32';
  
  let runtimePath: string | undefined;
  
  if (isWindows) {
    runtimePath = join(process.cwd(), 'node_modules', 'ffprobe-static', 'bin', 'win32', 'x64', 'ffprobe.exe');
  } else {
    runtimePath = join(process.cwd(), 'node_modules', 'ffprobe-static', 'bin', process.platform, 'x64', 'ffprobe');
  }

  // Build list of candidates
  const candidates: (string | undefined)[] = [
    // 1. Environment variable override
    process.env.FFPROBE_PATH,
    // 2. Runtime resolution from project root node_modules
    runtimePath,
    // 3. Imported path
    ffprobeStaticImport?.path,
    // 4. System PATH fallback
    'ffprobe',
  ];

  // Find first candidate that exists or is 'ffprobe'
  for (const candidate of candidates) {
    if (!candidate) continue;

    // 'ffprobe' is a special case - assume it's in PATH
    if (candidate === 'ffprobe') {
      cachedFFprobePath = 'ffprobe';
      if (process.env.NODE_ENV !== 'production') {
        console.log('[Render] Resolved ffprobe path (from PATH):', candidate);
      }
      return candidate;
    }

    // Check if file exists
    if (existsSync(candidate)) {
      cachedFFprobePath = candidate;
      if (process.env.NODE_ENV !== 'production') {
        console.log('[Render] Resolved ffprobe path:', candidate);
      }
      return candidate;
    }
  }

  // None found - show detailed error
  const checkedPaths = candidates.filter(Boolean);
  console.error('[Render] ⚠️  ffprobe binary not found at any of these locations:');
  checkedPaths.forEach((p, i) => console.error(`  ${i + 1}. ${p}`));
  console.error('[Render] Solution: Install ffprobe-static with: npm install ffprobe-static');

  // Still return 'ffprobe' as last resort fallback
  cachedFFprobePath = 'ffprobe';
  return 'ffprobe';
}

/**
 * Log FFmpeg binary paths (development mode)
 */
function logBinaryPaths(): void {
  if (process.env.NODE_ENV !== 'production') {
    const ffmpegPath = resolveFFmpegPath();
    const ffprobePath = resolveFFprobePath();
    console.log('[Render] Using FFmpeg:', ffmpegPath);
    console.log('[Render] Using ffprobe:', ffprobePath);
  }
}

/**
 * Download image from URL and save to temp directory
 * Returns local path if successful, null if failed
 */
async function downloadImageToTemp(imageUrl: string, filename: string): Promise<string | null> {
  try {
    ensureTempDir();
    const tempPath = join(VIDEO_TEMP_DIR, filename);
    
    // If it's a local file path, just return it
    if (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
      if (existsSync(imageUrl)) {
        return imageUrl;
      }
      console.warn(`[Render] Local image not found: ${imageUrl}`);
      return null;
    }
    
    // For remote URLs, we would need fetch/axios
    // For now, warn that remote URLs need network fetch
    console.warn(`[Render] Remote image URLs not yet supported: ${imageUrl}`);
    return null;
  } catch (error) {
    console.warn(`[Render] Failed to process image URL: ${imageUrl}`, error);
    return null;
  }
}

/**
 * Check if file is a valid image
 */
function isValidImageFile(filePath: string): boolean {
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'];
  const ext = filePath.toLowerCase().substring(filePath.lastIndexOf('.'));
  return imageExtensions.includes(ext) && existsSync(filePath);
}

/**
 * Build FFmpeg filter for image-based scene with Ken Burns zoom effect
 * Includes dark overlay for text readability and fade transitions
 */
function buildImageSceneFilter(
  inputIndex: number,
  imageInputIndex: number,
  textFilePath: string,
  duration: number,
  sceneLabel: string,
  width: number,
  height: number,
  overlayOpacity: number = 0.3
): string {
  const textFilePathForFilter = escapeFilterPath(textFilePath);
  const fadeOutStart = duration - 0.5;
  
  // Ken Burns zoom effect: scale up 10% and crop back
  // Creates a slow zoom-in effect
  const kenBurnsFilter = `scale=${Math.ceil(width * 1.1)}:${Math.ceil(height * 1.1)},` +
    `crop=${width}:${height}:(iw-${width})/2:(ih-${height})/2`;
  
  // Dark overlay opacity as integer (0-100 for FFmpeg)
  const overlayAlpha = Math.round(overlayOpacity * 100);
  
  // Build filter chain:
  // 1. Trim to the desired duration (framerate is set at input level with -framerate)
  // 2. Reset timestamps to ensure proper concatenation
  // 3. Apply Ken Burns zoom to image
  // 4. Add dark overlay for text readability
  // 5. Add text with fade-up animation
  // 6. Apply fade in/out transitions
  const filter =
    `[${imageInputIndex}:v]trim=end=${duration},setpts=PTS-STARTPTS,${kenBurnsFilter},` +
    `format=rgba[img];` +
    `[img]drawbox=x=0:y=0:w=${width}:h=${height}:color=black@${(overlayOpacity).toFixed(2)}:t=fill[overlay];` +
    `[overlay]drawtext=textfile='${textFilePathForFilter}':` +
    `fontsize=48:fontcolor=white:` +
    `x=(w-text_w)/2:y=(h-text_h)/2:line_spacing=12,` +
    `fade=t=in:st=0:d=0.5,` +
    `fade=t=out:st=${fadeOutStart}:d=0.5[${sceneLabel}]`;
  
  return filter;
}

/**
 * Build FFmpeg filter for color-based scene (fallback)
 */
function buildColorSceneFilter(
  inputIndex: number,
  textFilePath: string,
  duration: number,
  sceneLabel: string,
  width: number,
  height: number
): string {
  const textFilePathForFilter = escapeFilterPath(textFilePath);
  const fadeOutStart = duration - 0.5;
  
  return (
    `[${inputIndex}:v]scale=${width}:${height},` +
    `drawtext=textfile='${textFilePathForFilter}':` +
    `fontsize=48:fontcolor=white:` +
    `x=(w-text_w)/2:y=(h-text_h)/2:line_spacing=12,` +
    `fade=t=in:st=0:d=0.5,` +
    `fade=t=out:st=${fadeOutStart}:d=0.5[${sceneLabel}]`
  );
}

/**
 * Check if FFmpeg supports drawbox with alpha transparency
 * Most FFmpeg builds support this, but we can fallback if needed
 */
function supportsDrawboxAlpha(): boolean {
  try {
    const ffmpegPath = resolveFFmpegPath();
    const output = execSync(`"${ffmpegPath}" -filters 2>&1`, {
      encoding: 'utf-8',
      stdio: 'pipe',
    });
    // Check if drawbox filter is listed
    return output.includes('drawbox');
  } catch (error) {
    // Assume it's supported by default
    return true;
  }
}

/**
 * Check if libx264 is available in the FFmpeg binary
 */
function checkLibx264Availability(): boolean {
  try {
    const ffmpegPath = resolveFFmpegPath();
    const output = execSync(`"${ffmpegPath}" -codecs`, {
      encoding: 'utf-8',
      stdio: 'pipe',
    });
    const hasLibx264 = output.includes('libx264') || output.includes('h264');
    if (!hasLibx264) {
      console.warn('[Render] libx264 not available, will use mpeg4 fallback');
    }
    return hasLibx264;
  } catch (e) {
    console.warn('[Render] Could not check libx264 availability:', e instanceof Error ? e.message : e);
    return false;
  }
}

/**
 * Find available system font for text overlay
 */
function getFontPath(): string {
  const potentialFonts = [
    // Windows
    'C:/Windows/Fonts/arial.ttf',
    'C:\\Windows\\Fonts\\arial.ttf',
    // macOS
    '/Library/Fonts/Arial.ttf',
    '/System/Library/Fonts/Arial.ttf',
    // Linux
    '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',
    '/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf',
  ];

  for (const font of potentialFonts) {
    if (existsSync(font)) {
      return font;
    }
  }

  // Return most common default (FFmpeg can often find it without absolute path)
  return 'Arial';
}

/**
 * Normalize text for overlay - remove problematic characters and newlines
 */
function normalizeOverlayText(text: string): string {
  return text
    .replace(/\/n/g, '\n') // Fix mixed newline syntax
    .replace(/\r/g, '') // Remove carriage returns
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '') // Remove control characters
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .slice(0, 10) // Limit to 10 lines
    .join('\n');
}

/**
 * Execute FFmpeg using spawn (safer than execSync for complex commands)
 */
function executeFFmpeg(
  args: string[],
  onProgress?: (progress: number) => void
): Promise<void> {
  return new Promise((resolve, reject) => {
    const ffmpegPath = resolveFFmpegPath();
    const ffmpeg = spawn(ffmpegPath, args, {
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    let stderr = '';

    ffmpeg.stderr.on('data', (data) => {
      stderr += data.toString();
      
      // Parse FFmpeg progress output
      if (onProgress && stderr.includes('frame=')) {
        // FFmpeg outputs progress on stderr
        const match = stderr.match(/frame=\s*(\d+)/);
        if (match) {
          // Rough progress estimation (not exact but good enough)
          onProgress?.(Math.min(90, 10 + Math.random() * 50));
        }
      }
    });

    ffmpeg.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        console.error('[Render] FFmpeg stderr:', stderr.substring(stderr.length - 500));
        reject(new Error(`FFmpeg exited with code ${code}: ${stderr.slice(-200)}`));
      }
    });

    ffmpeg.on('error', (err) => {
      reject(new Error(`Failed to start FFmpeg at path "${ffmpegPath}": ${err.message}`));
    });
  });
}

/**
 * Configuration for Remotion rendering based on VideoScript
 */
export const getRemotionRenderConfig = (script: VideoScript) => {
  const fpsMap: Record<string, number> = {
    'modern': 30,
    'minimal': 24,
    'corporate': 30,
    'social-reel': 60,
    'explainer': 24,
    'product-promo': 30,
  };

  const dimensionsMap: Record<string, [number, number]> = {
    '9:16': [1080, 1920],
    '16:9': [1920, 1080],
    '1:1': [1080, 1080],
  };

  const fps = fpsMap[script.style] || 30;
  const [width, height] = dimensionsMap[script.aspectRatio] || [1920, 1080];
  const durationInFrames = Math.round(script.duration * fps);

  return {
    width,
    height,
    fps,
    durationInFrames,
    codec: 'h264',
    audioCodec: 'aac',
    pixelFormat: 'yuv420p',
  };
};

/**
 * Get background color based on video style
 */
function getBackgroundColorByStyle(style: string): string {
  const colors: Record<string, string> = {
    modern: '0x667eea', // purple-blue
    minimal: '0xffffff', // white
    corporate: '0x003366', // navy blue
    'social-reel': '0xff6b6b', // vibrant red
    explainer: '0xf0f0f0', // soft gray
    'product-promo': '0xff4444', // bold red
  };
  return colors[style] || '0x1a1a2e'; // default dark
}

/**
 * Render MP4 with per-scene video segments using FFmpeg
 * Creates a video with multiple scenes, each with background colors, text overlays, and transitions
 */
export const encodeMP4WithProgress = async (
  script: VideoScript,
  outputPath: string,
  config: any,
  onProgress?: (progress: number) => void
): Promise<void> => {
  const { width, height, fps } = config;
  
  onProgress?.(5);
  
  const tempFilePathList: string[] = [];

  try {
    // Log binary paths
    logBinaryPaths();
    
    console.log(`[Render] Processing ${script.scenes.length} scenes with visual assets...`);
    
    // Step 1: Create text files for each scene
    const sceneTextFiles: string[] = [];
    
    for (let i = 0; i < script.scenes.length; i++) {
      const scene = script.scenes[i];
      
      // Normalize and combine headline + subtext
      const headlineText = normalizeOverlayText(scene.headline);
      const subtextText = scene.subtext ? normalizeOverlayText(scene.subtext) : '';
      const sceneText = subtextText ? `${headlineText}\n\n${subtextText}` : headlineText;
      
      const textFilePath = join(VIDEO_TEMP_DIR, `scene-${Date.now()}-${i}.txt`);
      writeFileSync(textFilePath, sceneText, 'utf-8');
      sceneTextFiles.push(textFilePath);
      tempFilePathList.push(textFilePath);
    }
    
    onProgress?.(8);
    
    // Step 2: Process scene images - download/validate if present
    const sceneImagePaths: (string | null)[] = [];
    let imageSceneCount = 0;
    
    for (let i = 0; i < script.scenes.length; i++) {
      const scene = script.scenes[i];
      let imagePath: string | null = null;
      
      if (scene.backgroundImage) {
        imagePath = await downloadImageToTemp(scene.backgroundImage, `scene-img-${i}.jpg`);
        if (imagePath && isValidImageFile(imagePath)) {
          sceneImagePaths.push(imagePath);
          imageSceneCount++;
          console.log(`[Render] Scene ${i} using image: ${imagePath.substring(imagePath.lastIndexOf('/') + 1)}`);
        } else {
          sceneImagePaths.push(null);
          console.warn(`[Render] Scene ${i} image unavailable, falling back to color`);
        }
      } else {
        sceneImagePaths.push(null);
      }
    }
    
    onProgress?.(10);
    
    // Step 3: Create CTA screen text file
    const ctaText = normalizeOverlayText(script.cta || `${script.title}\nLearn More`);
    const ctaTextFilePath = join(VIDEO_TEMP_DIR, `cta-${Date.now()}.txt`);
    writeFileSync(ctaTextFilePath, ctaText, 'utf-8');
    tempFilePathList.push(ctaTextFilePath);
    
    // Step 4: Get background color based on style
    const bgColor = getBackgroundColorByStyle(script.style);
    console.log(`[Render] Background color: ${bgColor} (style: ${script.style})`);
    console.log(`[Render] Image scenes: ${imageSceneCount}/${script.scenes.length}`);
    
    // Step 5: Check for libx264 availability
    const hasLibx264 = checkLibx264Availability();
    console.log(`[Render] Using codec: ${hasLibx264 ? 'libx264' : 'mpeg4 (fallback)'}`);
    
    onProgress?.(15);
    
    // Step 6: Build FFmpeg command with mixed inputs
    // Color inputs for non-image scenes, image inputs for scenes with images
    const ffmpegInputs: string[] = [];
    const inputIndexMap: number[] = [];
    let inputIndex = 0;
    
    for (let i = 0; i < script.scenes.length; i++) {
      const scene = script.scenes[i];
      const imagePath = sceneImagePaths[i];
      
      if (imagePath && isValidImageFile(imagePath)) {
        // Image-based scene: use -framerate BEFORE -loop to control frame generation
        // This ensures the looped image generates at the correct frame rate
        ffmpegInputs.push('-framerate', fps.toString());
        ffmpegInputs.push('-loop', '1', '-i', imagePath);
        inputIndexMap.push(inputIndex);
        inputIndex++;
      } else {
        // Color-based fallback
        ffmpegInputs.push('-f', 'lavfi', '-i', `color=c=${bgColor}:s=${width}x${height}:d=${scene.duration}`);
        inputIndexMap.push(inputIndex);
        inputIndex++;
      }
    }
    
    // Add color input for CTA screen (3 seconds)
    ffmpegInputs.push('-f', 'lavfi', '-i', `color=c=${bgColor}:s=${width}x${height}:d=3`);
    const ctaInputIndex = inputIndex;
    
    onProgress?.(20);
    
    // Step 7: Build filter_complex with scene processing and concatenation
    const filterParts: string[] = [];
    const sceneLabels: string[] = [];
    
    // Process each scene with appropriate filters (image or color)
    for (let i = 0; i < script.scenes.length; i++) {
      const scene = script.scenes[i];
      const sceneInputIndex = inputIndexMap[i];
      const sceneLabel = `scene${i}`;
      const imagePath = sceneImagePaths[i];
      const overlayOpacity = scene.overlayOpacity || 0.3;
      
      if (imagePath && isValidImageFile(imagePath)) {
        // Image-based scene with Ken Burns zoom and overlay
        const imageFilter = buildImageSceneFilter(
          sceneInputIndex,
          sceneInputIndex,
          sceneTextFiles[i],
          scene.duration,
          sceneLabel,
          width,
          height,
          overlayOpacity
        );
        filterParts.push(imageFilter);
      } else {
        // Color-based fallback
        const colorFilter = buildColorSceneFilter(
          sceneInputIndex,
          sceneTextFiles[i],
          scene.duration,
          sceneLabel,
          width,
          height
        );
        filterParts.push(colorFilter);
      }
      
      sceneLabels.push(`[${sceneLabel}]`);
    }
    
    // Process CTA screen (color-based)
    const ctaTextFilePathForFilter = escapeFilterPath(ctaTextFilePath);
    const ctaLabel = 'ctascreen';
    const fadeOutStartCta = 2.5;
    filterParts.push(
      `[${ctaInputIndex}:v]scale=${width}:${height},` +
      `drawtext=textfile='${ctaTextFilePathForFilter}':` +
      `fontsize=56:fontcolor=white:` +
      `x=(w-text_w)/2:y=(h-text_h)/2:line_spacing=12,` +
      `fade=t=in:st=0:d=0.5,` +
      `fade=t=out:st=${fadeOutStartCta}:d=0.5[${ctaLabel}]`
    );
    sceneLabels.push(`[${ctaLabel}]`);
    
    // Concatenate all scenes
    const concatFilter = `${sceneLabels.join('')}concat=n=${sceneLabels.length}:v=1:a=0[v]`;
    filterParts.push(concatFilter);
    
    const filterComplex = filterParts.join(';');
    
    // Log filter_complex in development mode
    if (process.env.NODE_ENV !== 'production') {
      console.log('[Render] 🎬 Filter Complex (with visual assets):');
      console.log(`  Image scenes: ${imageSceneCount}, Color scenes: ${script.scenes.length - imageSceneCount}`);
      console.log(`  Total segments: ${sceneLabels.length} (${script.scenes.length} scenes + CTA)`);
    }
    
    onProgress?.(25);
    
    // Step 8: Build codec args
    const codecArgs = hasLibx264
      ? ['-c:v', 'libx264', '-preset', 'fast', '-crf', '28', '-pix_fmt', 'yuv420p', '-movflags', '+faststart']
      : ['-c:v', 'mpeg4', '-q:v', '5', '-pix_fmt', 'yuv420p', '-movflags', '+faststart'];
    
    // Build FFmpeg command (no audio - silent video by default)
    const ffmpegArgs = [
      ...ffmpegInputs,
      '-filter_complex', filterComplex,
      '-map', '[v]',
      ...codecArgs,
      '-r', fps.toString(),
      '-an', // no audio
      '-y',
      outputPath,
    ];
    
    onProgress?.(30);
    console.log(`[Render] Executing FFmpeg with ${imageSceneCount} image scenes...`);
    
    // Step 9: Execute FFmpeg
    await executeFFmpeg(ffmpegArgs, onProgress);
    
    onProgress?.(95);
    console.log(`[Render] ✅ FFmpeg encoding completed with visual assets (${imageSceneCount} images + ${script.scenes.length - imageSceneCount} color fallbacks)`);
    
  } catch (error) {
    console.error('[Render] ❌ FFmpeg error:', error instanceof Error ? error.message : error);
    throw new Error(`FFmpeg encoding failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  } finally {
    // Step 10: Cleanup temporary text files and downloaded images
    for (const filePath of tempFilePathList) {
      if (filePath && existsSync(filePath)) {
        try {
          unlinkSync(filePath);
        } catch (cleanupError) {
          console.warn('[Render] Could not cleanup file:', filePath);
        }
      }
    }
  }
  
  onProgress?.(100);
};

/**
 * Validate MP4 file using ffprobe
 * Returns validation result with stream info
 */
export const validateMP4 = (filePath: string): { valid: boolean; streams: number; duration: number; error?: string } => {
  try {
    const stats = require('fs').statSync(filePath);
    const fileSizeKB = stats.size / 1024;
    
    // File must be at least 100 KB to have real content
    if (fileSizeKB < 100) {
      return { 
        valid: false, 
        streams: 0, 
        duration: 0,
        error: `File too small: ${fileSizeKB.toFixed(1)} KB (minimum 100 KB)` 
      };
    }

    // Check for ffprobe availability
    try {
      const ffprobePath = resolveFFprobePath();
      const output = execSync(`"${ffprobePath}" -v error -select_streams v:0 -show_entries stream=codec_type,duration,width,height -of default=noprint_wrappers=1 "${filePath}" 2>&1`, {
        encoding: 'utf-8',
        stdio: 'pipe',
      });

      if (!output || output.includes('No such file')) {
        return { valid: false, streams: 0, duration: 0, error: 'ffprobe failed to read file' };
      }

      // Parse ffprobe output
      const hasVideoStream = output.includes('codec_type=video');
      const durationMatch = output.match(/duration=([\d.]+)/);
      const duration = durationMatch ? parseFloat(durationMatch[1]) : 0;

      if (!hasVideoStream) {
        return { valid: false, streams: 0, duration, error: 'No video stream found' };
      }

      if (duration === 0) {
        return { valid: false, streams: 1, duration: 0, error: 'Invalid duration' };
      }

      return { valid: true, streams: 1, duration };
    } catch (ffprobeError) {
      // If ffprobe fails, do basic validation on file structure
      const fileBuffer = readFileSync(filePath, { encoding: 'binary' });
      const hasH264 = fileBuffer.includes('avc1') || fileBuffer.includes('hvc1');
      
      if (!hasH264 || fileSizeKB < 100) {
        return { 
          valid: false, 
          streams: 0, 
          duration: 0,
          error: `Invalid MP4: size=${fileSizeKB.toFixed(1)}KB, hasCodec=${hasH264}` 
        };
      }

      return { valid: true, streams: 1, duration: (fileSizeKB / 100) * 5 }; // Rough estimate
    }
  } catch (error) {
    return { 
      valid: false, 
      streams: 0, 
      duration: 0,
      error: error instanceof Error ? error.message : 'Validation failed' 
    };
  }
};

/**
 * Render VideoScript to MP4 file
 * Returns path to temporary MP4 file
 * Validates output to ensure it contains real video content
 */
export const renderVideoScriptToMP4 = async (
  script: VideoScript,
  jobId: string,
  onProgress?: (progress: number) => void
): Promise<string> => {
  ensureTempDir();

  const outputPath = join(VIDEO_TEMP_DIR, `${jobId}.mp4`);
  const config = getRemotionRenderConfig(script);

  try {
    // Encode video with FFmpeg
    await encodeMP4WithProgress(script, outputPath, config, onProgress);

    // Validate the output
    const validation = validateMP4(outputPath);
    if (!validation.valid) {
      throw new Error(`MP4 validation failed: ${validation.error}`);
    }

    console.log(`[Render] ✅ MP4 validated: ${validation.streams} video stream(s), duration: ${validation.duration.toFixed(1)}s`);
    return outputPath;
  } catch (error) {
    // Clean up failed output
    try {
      if (existsSync(outputPath)) {
        unlinkSync(outputPath);
      }
    } catch (cleanupError) {
      console.error('[Render] Cleanup error:', cleanupError);
    }

    throw error;
  }
};

/**
 * Convert MP4 file to base64 for transmission
 */
export const mp4FileToBase64 = (filePath: string): string => {
  const fileBuffer = readFileSync(filePath);
  return fileBuffer.toString('base64');
};

/**
 * Clean up old temporary video files (older than 24 hours)
 */
export const cleanupOldVideoFiles = () => {
  ensureTempDir();
  const fs = require('fs');

  try {
    const files = fs.readdirSync(VIDEO_TEMP_DIR);
    const now = Date.now();
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours

    files.forEach((file: string) => {
      const filePath = join(VIDEO_TEMP_DIR, file);
      const stats = fs.statSync(filePath);
      if (now - stats.mtime.getTime() > maxAge) {
        unlinkSync(filePath);
      }
    });
  } catch (error) {
    console.error('Error cleaning up video files:', error);
  }
};

/**
 * Get file size in MB for logging
 */
export const getFileSizeMB = (filePath: string): number => {
  try {
    const stats = require('fs').statSync(filePath);
    return stats.size / (1024 * 1024);
  } catch {
    return 0;
  }
};
