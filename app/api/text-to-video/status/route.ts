/**
 * Text to Video Status API Route
 * Polls the status of video generation job with progress tracking
 * Works with Pika API for real-time video generation
 */

import { NextRequest, NextResponse } from 'next/server';

interface StatusCache {
  [generationId: string]: {
    status: 'processing' | 'completed' | 'failed';
    videoUrl?: string;
    videoBase64?: string;
    error?: string;
    progress: number; // 0-100
    createdAt: number;
    pollCount: number;
  };
}

// In-memory cache with Pika generation IDs (in production, use Redis or database)
const statusCache: StatusCache = {};

// Pika API progress estimation based on poll count
function estimateProgress(pollCount: number): number {
  const estimatedProgress = Math.min(95, 10 + Math.floor(pollCount * 8));
  return estimatedProgress;
}

export async function GET(request: NextRequest) {
  try {
    const generationId = request.nextUrl.searchParams.get('generationId');
    const jobId = request.nextUrl.searchParams.get('jobId');

    if (!generationId) {
      return NextResponse.json(
        { ok: false, error: 'generationId parameter is required' },
        { status: 400 }
      );
    }

    console.log(`[Status API] Checking status for generationId: ${generationId}`);

    const pikaApiKey = process.env.PIKA_API_KEY;
    if (!pikaApiKey) {
      return NextResponse.json(
        { ok: false, error: 'PIKA_API_KEY not configured' },
        { status: 500 }
      );
    }

    // Check cache first
    if (statusCache[generationId]) {
      const cached = statusCache[generationId];
      cached.pollCount++;
      // Estimate progress if still processing
      if (cached.status === 'processing') {
        cached.progress = estimateProgress(cached.pollCount);
      }
      
      console.log(`[Status API] Found in cache - status: ${cached.status}, progress: ${cached.progress}%`);
      
      return NextResponse.json({
        ok: true,
        generationId,
        jobId,
        status: cached.status,
        progress: cached.progress,
        videoUrl: cached.videoUrl,
        videoBase64: cached.videoBase64,
        error: cached.error,
        message: cached.status === 'completed' ? 'Video is ready!' : `Generating... ${cached.progress}%`,
      }, {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      });
    }

    // Poll Pika API for status
    console.log('[Status API] Polling Pika API...');
    
    const pikaStatusResponse = await fetch(
      `https://api.pika.art/video/${generationId}/status`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${pikaApiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!pikaStatusResponse.ok) {
      const errorText = await pikaStatusResponse.text();
      console.error('[Status API] Pika API Error:', pikaStatusResponse.status, errorText);
      
      return NextResponse.json({
        ok: true,
        generationId,
        status: 'processing',
        progress: 20,
        message: 'Generating video... Please wait.',
      }, {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        },
      });
    }

    const pikaData = await pikaStatusResponse.json();
    console.log('[Status API] Pika API Response:', JSON.stringify(pikaData).substring(0, 200));

    // Parse Pika response status
    const pikaStatus = pikaData.status?.toLowerCase() || pikaData.state?.toLowerCase() || '';
    let status: 'processing' | 'completed' | 'failed' = 'processing';
    let progress = 50;
    let videoUrl: string | undefined;

    if (pikaStatus.includes('success') || pikaStatus.includes('completed')) {
      status = 'completed';
      progress = 100;
      videoUrl = pikaData.video?.url || pikaData.videoUrl;
      console.log('[Status API] Video generation completed!');
    } else if (pikaStatus.includes('fail') || pikaStatus.includes('error')) {
      status = 'failed';
      progress = 0;
      console.error('[Status API] Video generation failed');
    } else {
      // Still processing
      status = 'processing';
      progress = 60; // Intermediate progress
    }

    // Update cache
    statusCache[generationId] = {
      status,
      videoUrl,
      error: pikaData.error,
      progress,
      createdAt: Date.now(),
      pollCount: 1,
    };

    if (status === 'completed' && videoUrl) {
      console.log('[Status API] Storing video URL in cache');
      // Try to fetch and convert to base64 if needed
      try {
        const videoResponse = await fetch(videoUrl);
        if (videoResponse.ok) {
          const videoBuffer = await videoResponse.arrayBuffer();
          statusCache[generationId].videoBase64 = Buffer.from(videoBuffer).toString('base64');
          console.log('[Status API] Video converted to base64');
        }
      } catch (e) {
        console.error('[Status API] Error downloading video:', e);
        // Keep the URL even if we can't download it
      }
    }

    return NextResponse.json({
      ok: true,
      generationId,
      jobId,
      status,
      progress,
      videoUrl,
      videoBase64: statusCache[generationId]?.videoBase64,
      error: pikaData.error,
      message: status === 'completed' ? 'Video is ready!' : 
               status === 'failed' ? 'Video generation failed' :
               `Generating... ${progress}%`,
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });

  } catch (error) {
    console.error('[Status API] Error:', error);
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}

