/**
 * API Route: Render Video from Script
 * POST /api/video/render
 * 
 * Takes a VideoScript and renders it to MP4 using Remotion (preferred) with FFmpeg fallback
 * Async job-based rendering with progress tracking
 */

import { NextRequest, NextResponse } from 'next/server';
import { VideoScript, RenderVideoRequest, RenderVideoResponse } from '@/app/utils/types/video-generation';
import {
  renderVideoScriptToMP4,
  mp4FileToBase64,
  validateMP4,
  cleanupOldVideoFiles,
  getFileSizeMB,
} from '@/app/utils/video-generation/remotion-renderer';
import { renderVideoOptimized } from '@/app/utils/remotion/unified-renderer';
import { readFileSync } from 'fs';

// In-memory job tracking (replace with database in production)
interface RenderJob {
  status: 'queued' | 'preparing' | 'rendering' | 'encoding' | 'completed' | 'failed';
  progress: number;
  videoUrl?: string;
  error?: string;
  renderer?: 'remotion' | 'ffmpeg';
  startTime: number;
  lastUpdate: number;
}

const renderJobs = new Map<string, RenderJob>();

/**
 * Generates a unique job ID
 */
function generateJobId(): string {
  return `render-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Timeout for render jobs (2 minutes for MVP, increase in production)
 */
const RENDER_TIMEOUT_MS = 2 * 60 * 1000;

/**
 * Alternative: Use Pika API for video generation (fallback to existing service)
 */
async function generateViaPika(script: VideoScript): Promise<string> {
  const pikaApiKey = process.env.PIKA_API_KEY;
  if (!pikaApiKey) {
    throw new Error('PIKA_API_KEY not configured');
  }

  // Convert script to Pika prompt
  const prompt = `
Video: ${script.title}
Style: ${script.style}
Duration: ${script.duration}s
Voiceover: ${script.voiceover}
Scenes: ${script.scenes.map(s => s.visual).join(', ')}
  `.trim();

  // This would call Pika API similar to the existing text-to-video endpoint
  throw new Error('Pika API integration requires existing implementation');
}

/**
 * Main render endpoint
 */
export async function POST(request: NextRequest) {
  try {
    // 🔴 CRITICAL DEBUG: Log route hit
    console.log('\n' + '█'.repeat(120));
    console.log('🎬 /API/VIDEO/RENDER ROUTE HIT');
    console.log('█'.repeat(120));
    console.log('URL:', request.nextUrl.pathname + request.nextUrl.search);
    console.log('Method:', request.method);
    console.log('Timestamp:', new Date().toISOString());
    
    const body: RenderVideoRequest = await request.json();

    // Validate script
    if (!body.script || !body.script.scenes || body.script.scenes.length === 0) {
      return NextResponse.json<RenderVideoResponse>(
        { ok: false, error: 'Valid script with scenes is required' },
        { status: 400 }
      );
    }

    const jobId = generateJobId();
    console.log('[Render] Starting render job:', jobId);
    console.log('[Render] Script:', body.script.title);
    console.log('[Render] Style:', body.script.style);
    console.log('[Render] Duration:', body.script.duration, 's');
    console.log('[Render] Aspect Ratio:', body.script.aspectRatio);
    console.log('█'.repeat(120) + '\n');

    // Initialize job
    renderJobs.set(jobId, {
      status: 'queued',
      progress: 0,
      startTime: Date.now(),
      lastUpdate: Date.now(),
    });

    // Start async rendering (non-blocking)
    renderVideoAsync(jobId, body.script).catch(error => {
      console.error('[Render] Async render failed for', jobId, ':', error);
      const job = renderJobs.get(jobId);
      if (job) {
        job.status = 'failed';
        job.error = error instanceof Error ? error.message : 'Unknown error';
        job.progress = 0;
        renderJobs.set(jobId, job);
      }
    });

    // Return immediately with job ID for polling
    return NextResponse.json<RenderVideoResponse>(
      {
        ok: true,
        generationId: jobId,
      },
      { status: 202 } // Accepted - async processing
    );
  } catch (error) {
    console.error('[Render] Error starting render:', error);
    return NextResponse.json<RenderVideoResponse>(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Failed to start render job',
      },
      { status: 500 }
    );
  }
}

/**
 * Async rendering function (runs in background)
 * Renders VideoScript to MP4 using Remotion ONLY (no fallback)
 * If Remotion fails, the job fails - we need to diagnose the real issue
 */
async function renderVideoAsync(jobId: string, script: VideoScript): Promise<void> {
  const startTime = Date.now();

  try {
    // Check timeout at start
    if (Date.now() - startTime > RENDER_TIMEOUT_MS) {
      throw new Error('Render timeout exceeded');
    }

    // Step 1: Prepare (0-10%)
    updateJob(jobId, 'preparing', 5, undefined);
    await new Promise(resolve => setTimeout(resolve, 500));

    // CRITICAL DEBUG: Log ALL scenes and assets before rendering
    console.log(`\n${'█'.repeat(100)}`);
    console.log(`🎥 PRE-RENDER SCENE AUDIT: ${script.title}`);
    console.log(`${'█'.repeat(100)}`);
    
    script.scenes.forEach((scene, idx) => {
      const enrichedScene = scene as any;
      console.log(`\n📍 SCENE ${idx + 1}:`);
      console.log(`   Headline: ${scene.headline}`);
      console.log(`   Visual: ${scene.visual?.substring(0, 60)}`);
      console.log(`   Keywords: ${enrichedScene.visualKeywords?.join(', ') || 'NONE'}`);
      console.log(`   Mood: ${enrichedScene.mood || 'NONE'}`);
      console.log(`   Has Asset: ${!!enrichedScene.selectedAsset}`);
      
      if (enrichedScene.selectedAsset) {
        console.log(`   ✅ Asset URL: ${enrichedScene.selectedAsset.url?.substring(0, 80)}`);
        console.log(`   ✅ Provider: ${enrichedScene.selectedAsset.provider}`);
        console.log(`   ✅ Type: ${enrichedScene.selectedAsset.type}`);
        console.log(`   ✅ Cached: ${enrichedScene.selectedAsset.cachedPath || 'NO'}`);
      } else {
        console.log(`   ❌ NO ASSET - Will render with fallback/gradient`);
      }
    });
    
    const scenesWithAssets = script.scenes.filter(s => !!(s as any).selectedAsset).length;
    const totalScenes = script.scenes.length;
    console.log(`\n📊 SUMMARY: ${scenesWithAssets}/${totalScenes} scenes have assets`);
    console.log(`${'█'.repeat(100)}\n`);

    // Step 2: Render video with Remotion (10-80%)
    updateJob(jobId, 'rendering', 15, undefined);

    // HARD DEBUG MODE: Log final script structure
    if (process.env.VIDEO_ASSET_DEBUG) {
      console.log('\n' + '█'.repeat(100));
      console.log('[Render - DEBUG] FINAL_RENDER_SCRIPT STRUCTURE:');
      console.log(JSON.stringify(
        script.scenes.map((s) => ({
          headline: (s as any).headline,
          keywords: (s as any).visualKeywords,
          mood: (s as any).mood,
          assetProvider: (s as any).selectedAsset?.provider,
          assetUrl: (s as any).selectedAsset?.url?.substring(0, 80),
          hasCinematicConfig: !!(s as any).cinematicConfig,
          hasMood: !!(s as any).mood,
        })),
        null,
        2,
      ));
      console.log('█'.repeat(100) + '\n');
    }

    console.log(`[Render] ==================================================`);
    console.log(`[Render] REMOTION RENDER STARTING: ${script.title}`);
    console.log(`[Render] ==================================================`);
    console.log(`[Render] Style: ${script.style}`);
    console.log(`[Render] Duration: ${script.duration}s`);
    console.log(`[Render] Aspect Ratio: ${script.aspectRatio}`);
    console.log(`[Render] Scenes: ${script.scenes.length}`);
    console.log(`[Render] Using: REMOTION ONLY (NO FALLBACK)`);
    console.log(`[Render] ==================================================`);

    // 🔴 DEBUG: Log which render function is being called
    console.log('\n' + '█'.repeat(100));
    console.log('[Render - DEBUG] CALLING RENDER FUNCTION:');
    console.log('LIVE_RENDER_ROUTE_HIT: YES');
    console.log('USING_RENDER_FUNCTION: renderVideoOptimized');
    console.log('SOURCE: unified-renderer.ts');
    console.log('WILL_CALL: renderVideoScriptWithRemotion (from render-with-remotion.ts)');
    console.log('COMPOSITION: VideoCompositionRoot → VideoCompositionContent → SceneRenderer → CinematicBackgroundDebug');
    console.log('█'.repeat(100) + '\n');

    // Call Remotion renderer - FORCE it, no try/catch fallback
    const renderResult = await renderVideoOptimized(script, jobId, (progress: number) => {
      // Update progress from 15% to 85%
      const scaledProgress = 15 + ((progress - 10) * 0.7);
      updateJob(jobId, 'rendering', Math.round(Math.max(15, Math.min(85, scaledProgress))), 'remotion');
    });

    console.log(`[Render] ==================================================`);
    console.log(`[Render] ✅ REMOTION RENDER SUCCESSFUL`);
    console.log(`[Render] ==================================================`);
    console.log(`[Render] Output file: ${renderResult.filePath}`);
    console.log(`[Render] Renderer used: ${renderResult.renderer}`);
    console.log(`[Render] Message: ${renderResult.message}`);
    console.log(`[Render] RENDERER_USED=remotion`);
    console.log(`[Render] ==================================================`);

    if (Date.now() - startTime > RENDER_TIMEOUT_MS) {
      throw new Error('Render timeout exceeded during rendering');
    }

    // Step 2.5: Validate MP4 structure (80-85%)
    updateJob(jobId, 'rendering', 80, 'remotion');
    const validation = validateMP4(renderResult.filePath);
    
    if (!validation.valid) {
      throw new Error(`Generated MP4 validation failed: ${validation.error} (streams: ${validation.streams}, duration: ${validation.duration})`);
    }

    console.log(`[Render] ✅ MP4 validation passed: ${validation.streams} stream(s), duration: ${validation.duration.toFixed(1)}s`);

    // Step 3: Convert to base64 (85-95%)
    updateJob(jobId, 'encoding', 85, 'remotion');
    await new Promise(resolve => setTimeout(resolve, 500));

    const base64 = mp4FileToBase64(renderResult.filePath);
    const fileSizeMB = getFileSizeMB(renderResult.filePath);

    // Step 4: Complete (95-100%)
    updateJob(jobId, 'encoding', 95, 'remotion');

    const videoUrl = `data:video/mp4;base64,${base64}`;

    // Update job with result
    const job = renderJobs.get(jobId);
    if (job) {
      job.status = 'completed';
      job.progress = 100;
      job.videoUrl = videoUrl;
      job.renderer = 'remotion';
      job.lastUpdate = Date.now();
      renderJobs.set(jobId, job);
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log('[Render] ==================================================');
    console.log('[Render] ✅ RENDER COMPLETED SUCCESSFULLY');
    console.log('[Render] ==================================================');
    console.log('[Render] Job ID:', jobId);
    console.log('[Render] Renderer:', 'remotion');
    console.log('[Render] Duration:', duration, 's');
    console.log('[Render] File size:', fileSizeMB.toFixed(2), 'MB');
    console.log('[Render] Style:', script.style);
    console.log('[Render] Aspect ratio:', script.aspectRatio);
    console.log('[Render] RENDERER_USED=remotion');
    console.log('[Render] ==================================================');

    // Cleanup old files every 10 renders
    if (Math.random() < 0.1) {
      cleanupOldVideoFiles();
    }
  } catch (error) {
    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    console.error('[Render] ==================================================');
    console.error('[Render] ❌ REMOTION RENDER FAILED');
    console.error('[Render] ==================================================');
    console.error('[Render] Job ID:', jobId);
    console.error('[Render] Error:', errorMessage);
    console.error('[Render] Stack:', error instanceof Error ? error.stack : 'N/A');
    console.error('[Render] Duration:', duration, 's');
    console.error('[Render] Script:', {
      title: script.title,
      style: script.style,
      scenes: script.scenes.length,
    });
    console.error('[Render] NOTE: NO FALLBACK - Remotion must succeed');
    console.error('[Render] ==================================================');

    const job = renderJobs.get(jobId);
    if (job) {
      job.status = 'failed';
      job.progress = 0;
      job.error = `Remotion render failed: ${errorMessage}`;
      job.renderer = 'remotion';
      renderJobs.set(jobId, job);
    }
  }
}

/**
 * Update job status and progress
 */
function updateJob(jobId: string, status: RenderJob['status'], progress: number, renderer?: 'remotion' | 'ffmpeg'): void {
  const job = renderJobs.get(jobId);
  if (job) {
    job.status = status;
    job.progress = Math.round(progress);
    job.lastUpdate = Date.now();
    if (renderer) {
      job.renderer = renderer;
    }
    renderJobs.set(jobId, job);
    const rendererLabel = renderer ? ` [${renderer}]` : '';
    console.log(`[Render] Job ${jobId}: ${progress.toFixed(0)}% - ${status}${rendererLabel}`);
  }
}

/**
 * GET /api/video/render?jobId=xxx
 * Check rendering progress and retrieve completed video
 */
export async function GET(request: NextRequest) {
  try {
    const jobId = request.nextUrl.searchParams.get('jobId');

    if (!jobId) {
      return NextResponse.json<RenderVideoResponse>(
        { ok: false, error: 'jobId query parameter is required' },
        { status: 400 }
      );
    }

    const job = renderJobs.get(jobId);

    if (!job) {
      return NextResponse.json<RenderVideoResponse>(
        { ok: false, error: 'Job not found. It may have expired.' },
        { status: 404 }
      );
    }

    // Check for timeout (cleanup after 5 minutes)
    if (Date.now() - job.lastUpdate > 5 * 60 * 1000) {
      renderJobs.delete(jobId);
      return NextResponse.json<RenderVideoResponse>(
        { ok: false, error: 'Job expired' },
        { status: 404 }
      );
    }

    // Return current status
    const response: RenderVideoResponse = {
      ok: job.status !== 'failed',
      videoUrl: job.videoUrl,
      generationId: jobId,
      renderer: job.renderer,
    };

    if (job.status === 'failed') {
      response.error = job.error || 'Rendering failed';
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('[Render] Error checking status:', error);
    return NextResponse.json<RenderVideoResponse>(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Failed to check render status',
      },
      { status: 500 }
    );
  }
}
