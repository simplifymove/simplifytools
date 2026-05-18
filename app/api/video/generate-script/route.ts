/**
 * API Route: Generate Video Script using Groq
 * POST /api/video/generate-script
 * 
 * Takes a user prompt and returns a structured video script JSON
 * Script includes scenes, voiceover, captions, and CTA
 * 
 * ENHANCED: Now includes cinematic asset enrichment
 */

import { NextRequest, NextResponse } from 'next/server';
import { GenerateScriptRequest, GenerateScriptResponse, VideoScript } from '@/app/utils/types/video-generation';
import { buildGroqPrompt, validateVideoScript, repairGroqResponse } from '@/app/utils/video-generation/groq-prompt-builder';
import { enrichGeneratedScript } from '@/app/utils/video-generation/script-enrichment';

// Simple in-memory cache for demo (replace with Redis in production)
const scriptCache = new Map<string, { script: VideoScript; timestamp: number }>();

// Groq model configuration
const GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

export async function POST(request: NextRequest) {
  try {
    const body: GenerateScriptRequest = await request.json();

    // Validate required fields
    if (!body.prompt || body.prompt.trim().length === 0) {
      return NextResponse.json<GenerateScriptResponse>(
        { ok: false, error: 'Prompt is required' },
        { status: 400 }
      );
    }

    if (body.prompt.length > 1000) {
      return NextResponse.json<GenerateScriptResponse>(
        { ok: false, error: 'Prompt must be 1000 characters or less' },
        { status: 400 }
      );
    }

    // Check for Groq API key
    const groqApiKey = process.env.GROQ_API_KEY;
    if (!groqApiKey) {
      console.error('GROQ_API_KEY environment variable not configured');
      return NextResponse.json<GenerateScriptResponse>(
        { ok: false, error: 'Video generation service not configured' },
        { status: 500 }
      );
    }

    // Generate cache key
    const cacheKey = `${body.prompt}_${body.style}_${body.duration}_${body.tone}`;

    // Check cache (valid for 1 hour)
    const cached = scriptCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < 3600000) {
      console.log('[Script Gen] Returning cached script');

      // ENRICH CACHED SCRIPT WITH FRESH ASSETS
      console.log('[Script Gen] Enriching cached script with cinematic assets...');
      let enrichedScript: VideoScript;
      try {
        enrichedScript = await enrichGeneratedScript(cached.script);
      } catch (enrichError) {
        console.warn('[Script Gen] Asset enrichment failed, returning cached script without fresh assets:', enrichError);
        enrichedScript = cached.script;
      }

      return NextResponse.json<GenerateScriptResponse>({
        ok: true,
        script: enrichedScript,
      });
    }

    // Build Groq prompt
    const groqPrompt = buildGroqPrompt({
      prompt: body.prompt,
      style: body.style,
      aspectRatio: body.aspectRatio,
      duration: body.duration,
      tone: body.tone,
      ctaText: body.ctaText,
    });

    console.log('[Script Gen] Calling Groq API...');

    // Call Groq API
    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [
          {
            role: 'system',
            content: 'You are a professional video script writer. Respond with ONLY valid JSON, no markdown or extra text.',
          },
          {
            role: 'user',
            content: groqPrompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!groqResponse.ok) {
      const errorData = await groqResponse.json();
      console.error('[Script Gen] Groq API Error:', errorData);
      return NextResponse.json<GenerateScriptResponse>(
        {
          ok: false,
          error: `Groq API Error: ${errorData.error?.message || 'Unknown error'}`,
        },
        { status: groqResponse.status }
      );
    }

    const groqData = await groqResponse.json();
    const rawScript = groqData.choices?.[0]?.message?.content;

    if (!rawScript) {
      console.error('[Script Gen] No content in Groq response');
      return NextResponse.json<GenerateScriptResponse>(
        { ok: false, error: 'Invalid response from Groq API' },
        { status: 500 }
      );
    }

    console.log('[Script Gen] Raw Groq response:', rawScript.substring(0, 200) + '...');

    // Repair response (remove markdown, extra text, etc)
    const repairedScript = repairGroqResponse(rawScript);

    // Validate script
    const validation = validateVideoScript(repairedScript);
    if (!validation.valid) {
      console.error('[Script Gen] Validation failed:', validation.error);

      // Retry with repair prompt
      console.log('[Script Gen] Attempting repair...');

      const repairPrompt = `Fix this invalid JSON response. Return ONLY the corrected JSON:

Invalid JSON: ${repairedScript}

Error: ${validation.error}

Requirements:
- Must be valid parseable JSON
- Must have exactly the same structure as provided
- Fix any syntax errors, missing commas, etc.
- Return ONLY the JSON, no markdown or extra text`;

      const repairResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${groqApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: GROQ_MODEL,
          messages: [
            {
              role: 'user',
              content: repairPrompt,
            },
          ],
          temperature: 0.1, // Lower temperature for deterministic repair
          max_tokens: 2000,
        }),
      });

      if (!repairResponse.ok) {
        return NextResponse.json<GenerateScriptResponse>(
          {
            ok: false,
            error: `Failed to generate valid script. Initial error: ${validation.error}`,
          },
          { status: 500 }
        );
      }

      const repairData = await repairResponse.json();
      const repairedContent = repairData.choices?.[0]?.message?.content;

      if (!repairedContent) {
        return NextResponse.json<GenerateScriptResponse>(
          {
            ok: false,
            error: `Repair failed. Original error: ${validation.error}`,
          },
          { status: 500 }
        );
      }

      const repairValidation = validateVideoScript(repairedContent);
      if (!repairValidation.valid || !repairValidation.script) {
        return NextResponse.json<GenerateScriptResponse>(
          {
            ok: false,
            error: `Script validation failed after repair: ${repairValidation.error}`,
          },
          { status: 500 }
        );
      }

      // Cache and return repaired script
      scriptCache.set(cacheKey, { script: repairValidation.script, timestamp: Date.now() });

      console.log('[Script Gen] Script repaired and validated successfully');

      // ENRICH WITH ASSETS
      console.log('[Script Gen] Enriching script with cinematic assets...');
      let enrichedScript: VideoScript;
      try {
        enrichedScript = await enrichGeneratedScript(repairValidation.script);
      } catch (enrichError) {
        console.warn('[Script Gen] Asset enrichment failed, returning script without assets:', enrichError);
        enrichedScript = repairValidation.script;
      }

      return NextResponse.json<GenerateScriptResponse>({
        ok: true,
        script: enrichedScript,
      });
    }

    if (!validation.script) {
      return NextResponse.json<GenerateScriptResponse>(
        { ok: false, error: 'Script validation returned no script' },
        { status: 500 }
      );
    }

    // Cache the script
    scriptCache.set(cacheKey, { script: validation.script, timestamp: Date.now() });

    console.log('[Script Gen] Script generated successfully');

    // ENRICH WITH ASSETS
    console.log('[Script Gen] Enriching script with cinematic assets...');
    let enrichedScript: VideoScript;
    try {
      enrichedScript = await enrichGeneratedScript(validation.script);
    } catch (enrichError) {
      console.warn('[Script Gen] Asset enrichment failed, returning script without assets:', enrichError);
      enrichedScript = validation.script;
    }

    // HARD DEBUG MODE: Log all scene details
    if (process.env.VIDEO_ASSET_DEBUG) {
      console.log('\n' + '█'.repeat(100));
      console.log('[Script Gen - DEBUG] ENRICHED SCRIPT SCENES:');
      console.log('█'.repeat(100));
      enrichedScript.scenes.forEach((scene, idx) => {
        const enrichedScene = scene as any;
        console.log(`\n📍 SCENE ${idx + 1}: ${scene.headline}`);
        console.log(`   Visual: ${scene.visual?.substring(0, 80)}`);
        console.log(`   Keywords: ${enrichedScene.visualKeywords?.join(', ') || 'NONE'}`);
        console.log(`   Mood: ${enrichedScene.mood || 'NONE'}`);
        console.log(`   Has selectedAsset: ${!!enrichedScene.selectedAsset}`);
        if (enrichedScene.selectedAsset) {
          console.log(`   ✅ Asset URL: ${enrichedScene.selectedAsset.url}`);
          console.log(`   ✅ Provider: ${enrichedScene.selectedAsset.provider}`);
          console.log(`   ✅ Type: ${enrichedScene.selectedAsset.type}`);
        } else {
          console.log(`   ❌ NO ASSET`);
        }
      });
      console.log('\n' + '█'.repeat(100) + '\n');
    }

    return NextResponse.json<GenerateScriptResponse>({
      ok: true,
      script: enrichedScript,
    });
  } catch (error) {
    console.error('[Script Gen] Error:', error);
    return NextResponse.json<GenerateScriptResponse>(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Failed to generate script',
      },
      { status: 500 }
    );
  }
}
