/**
 * Text to Video API Route
 * Generates videos from text prompts using AI
 * 
 * Currently integrated with Pika AI API for video generation
 * Supports multiple video styles and durations
 */

import { NextRequest, NextResponse } from 'next/server';

interface TextToVideoRequest {
  prompt: string;
  duration: number; // seconds (6, 8, or 10)
  style?: string; // 'cinematic', 'anime', 'realistic', 'abstract'
  aspectRatio?: string; // '16:9', '9:16', '1:1'
}

interface PikaGenerateResponse {
  id: string;
  status: string;
  video?: {
    url: string;
    duration: number;
  };
  error?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: TextToVideoRequest = await request.json();
    
    // Validate required inputs
    if (!body.prompt || body.prompt.trim().length === 0) {
      return NextResponse.json(
        { ok: false, error: 'Text prompt is required' },
        { status: 400 }
      );
    }

    if (!body.duration || ![6, 8, 10].includes(body.duration)) {
      return NextResponse.json(
        { ok: false, error: 'Duration must be 6, 8, or 10 seconds' },
        { status: 400 }
      );
    }

    const limit = body.prompt.length;
    if (limit > 500) {
      return NextResponse.json(
        { ok: false, error: 'Prompt must be 500 characters or less' },
        { status: 400 }
      );
    }

    const pikaApiKey = process.env.PIKA_API_KEY;
    if (!pikaApiKey) {
      console.error('PIKA_API_KEY environment variable not configured');
      return NextResponse.json(
        { 
          ok: false, 
          error: 'Video generation not configured. Please add PIKA_API_KEY to .env.local' 
        },
        { status: 500 }
      );
    }

    // Generate video using Pika API
    const jobId = `job-${Date.now()}`;
    console.log(`[Video Gen API] Starting video generation with Pika API`);
    console.log(`[Video Gen API] JobId: ${jobId}`);
    console.log(`[Video Gen API] Prompt: ${body.prompt}`);
    console.log(`[Video Gen API] Duration: ${body.duration}s`);

    // Step 1: Submit video generation request to Pika API
    console.log('[Video Gen API] Submitting request to Pika API...');
    console.log('[Video Gen API] API Key format:', pikaApiKey.includes(':') ? 'keyId:secretKey' : 'single token');
    console.log('[Video Gen API] API Key preview:', pikaApiKey.substring(0, 16) + '***');
    
    const requestBody = {
      prompt: body.prompt,
      aspectRatio: body.aspectRatio || '16:9',
      duration: body.duration || 6,
    };
    
    console.log('[Video Gen API] Request body:', JSON.stringify(requestBody));
    
    // Try Basic Auth (for keyId:secretKey format)
    // Base64 encode the entire API key (which is in keyId:secretKey format)
    let pikaResponse: Response;
    
    if (pikaApiKey.includes(':')) {
      console.log('[Video Gen API] Using Basic Auth with colon-separated credentials');
      const basicAuth = Buffer.from(pikaApiKey).toString('base64');
      console.log('[Video Gen API] Basic Auth header preview:', basicAuth.substring(0, 20) + '***');
      
      pikaResponse = await fetch(
        'https://api.pika.art/generate',
        {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${basicAuth}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        }
      );
    } else {
      // If no colon, try Bearer token
      console.log('[Video Gen API] Using Bearer token authentication');
      pikaResponse = await fetch(
        'https://api.pika.art/generate',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${pikaApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        }
      );
    }

    // If Basic auth failed with 401/403, try Bear token with secretKey only
    if ((pikaResponse.status === 401 || pikaResponse.status === 403) && pikaApiKey.includes(':')) {
      const secretKey = pikaApiKey.split(':')[1];
      console.log('[Video Gen API] Basic auth failed with', pikaResponse.status, ', trying Bearer with secretKey');
      pikaResponse = await fetch(
        'https://api.pika.art/generate',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${secretKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        }
      );
    }

    // If still failing, try with keyId only
    if ((pikaResponse.status === 401 || pikaResponse.status === 403) && pikaApiKey.includes(':')) {
      const keyId = pikaApiKey.split(':')[0];
      console.log('[Video Gen API] Bearer secretKey failed with', pikaResponse.status, ', trying Bearer with keyId');
      pikaResponse = await fetch(
        'https://api.pika.art/generate',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${keyId}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        }
      );
    }

    if (!pikaResponse.ok) {
      const errorText = await pikaResponse.text();
      console.error('[Video Gen API] Pika API Error: Status', pikaResponse.status);
      console.error('[Video Gen API] Pika Response:', errorText);
      
      let errorDetails = errorText;
      try {
        const errorJson = JSON.parse(errorText);
        errorDetails = errorJson.message || errorJson.error || errorText;
      } catch (e) {
        // Keep raw text
      }
      
      console.error('[Video Gen API] ========== DIAGNOSTIC INFO ===========');
      console.error('[Video Gen API] Status Code:', pikaResponse.status);
      console.error('[Video Gen API] Error Details:', errorDetails);
      console.error('[Video Gen API] Full Response:', errorText.substring(0, 500));
      console.error('[Video Gen API] =====================================');
      
      return NextResponse.json(
        {
          ok: false,
          error: `Pika API Error (${pikaResponse.status}): ${errorDetails}`,
          hint: pikaResponse.status === 401 ? 'Check if API key is valid and active' :
                pikaResponse.status === 403 ? 'Check if API key has proper permissions' :
                'Check endpoint and request format',
          status: pikaResponse.status,
        },
        { status: pikaResponse.status }
      );
    }

    const pikaData = await pikaResponse.json();
    console.log('[Video Gen API] Pika API Response:', JSON.stringify(pikaData).substring(0, 200));

    // Check if response has generationId
    const generationId = pikaData.generationId || pikaData.id;
    if (!generationId) {
      console.error('[Video Gen API] No generation ID in response');
      return NextResponse.json(
        {
          ok: false,
          error: 'Invalid response from Pika API - missing generation ID',
        },
        { status: 500 }
      );
    }

    console.log(`[Video Gen API] Pika Generation ID: ${generationId}`);

    // Step 2: Poll for completion (client will do this via status endpoint)
    // Return job details for frontend to poll
    return NextResponse.json({
      ok: true,
      status: 'processing',
      jobId: jobId,
      generationId: generationId,
      message: 'Video generation started. Polling for completion...',
      estimatedTime: `${body.duration + 5} seconds`,
    });

  } catch (error) {
    console.error('[Video Gen API] Error:', error);

    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Failed to generate video',
      },
      { status: 500 }
    );
  }
}

// Webhook endpoint for Pika to send completion status (optional)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    
    // This would be called by Pika webhook to indicate video is ready
    // Store in cache/database and your frontend polls for status
    
    console.log('Video generation webhook received:', body);

    return NextResponse.json({
      ok: true,
      message: 'Webhook received',
    });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { ok: false, error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
