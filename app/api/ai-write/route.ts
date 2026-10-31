/**
 * AI Write API Route
 * 
 * Single endpoint for all AI writing tools
 * Handles validation, prompt building, and LLM calls
 * 
 * Usage:
 * POST /api/ai-write
 * {
 *   "tool": "paragraph-writer",
 *   "inputs": {
 *     "topic": "The future of AI",
 *     "tone": "professional",
 *     "length": "medium"
 *   }
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { 
  getToolById, 
  validateToolInputs,
  type AIWriteTool 
} from '@/app/lib/ai-tools';
import { generateText, analyzeText } from '@/app/lib/ai-client';
import { detectAI } from '@/app/lib/ai-detector';

import { enforceAiWriteRateLimit } from '@/lib/ai-write/rate-limit';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tool: toolId, inputs } = body;

    // Validate tool exists
    if (!toolId) {
      return NextResponse.json(
        { ok: false, error: 'Tool ID is required' },
        { status: 400 }
      );
    }

    const tool = getToolById(toolId);
    if (!tool) {
      return NextResponse.json(
        { ok: false, error: `Tool "${toolId}" not found` },
        { status: 404 }
      );
    }

    // Validate inputs
    const validation = validateToolInputs(toolId, inputs || {});
    if (!validation.valid) {
      return NextResponse.json(
        { ok: false, error: 'Validation failed', details: validation.errors },
        { status: 400 }
      );
    }

    // Special handling for utility tools
    if (toolId === 'word-counter') {
      const analysis = analyzeText(inputs.inputText);
      return NextResponse.json({
        ok: true,
        tool: toolId,
        result: JSON.stringify(analysis, null, 2),
        meta: analysis,
      });
    }

    // Special handling for AI Detector - uses statistical analysis
    if (toolId === 'ai-detector') {
      const detectionResult = detectAI(inputs.inputText);
      return NextResponse.json({
        ok: true,
        tool: toolId,
        result: detectionResult,
        meta: {
          timestamp: new Date().toISOString(),
          methodName: 'Statistical + Linguistic Analysis',
          version: '2.0-rule-based',
        },
      });
    }

    // Build user prompt from tool config
    const userPrompt = tool.buildPrompt(inputs);

    // Avoid consuming Redis quota when AI generation is not configured.
    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { ok: false, error: 'AI generation is temporarily unavailable.' },
        { status: 503 }
      );
    }

    let rateLimit;

    try {
      rateLimit = await enforceAiWriteRateLimit(request);
    } catch (error) {
      console.error('[AI Write] Rate limiter unavailable:', error);
      return NextResponse.json(
        { ok: false, error: 'AI generation is temporarily unavailable.' },
        { status: 503 }
      );
    }

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { ok: false, error: 'Too many requests. Please try again later.' },
        {
          status: 429,
          headers: { 'Retry-After': String(rateLimit.retryAfter) },
        }
      );
    }


    const aiResponse = await generateText({
      systemPrompt: tool.systemPrompt,
      userPrompt,
      temperature: 0.7,
      maxTokens: 2000,
    });

    // Return response
    return NextResponse.json({
      ok: true,
      tool: toolId,
      result: aiResponse.text,
      meta: {
        tokensUsed: aiResponse.tokensUsed,
        model: aiResponse.model,
        usingMock: false,
      },
    });
  } catch (error) {
    console.error('AI Write API error:', error);

    return NextResponse.json(
      {
        ok: false,
        error: 'Unable to process this request right now.',
      },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint - returns available tools
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');

    // Return tools list
    const { getToolsByCategory } = await import('@/app/lib/ai-tools');
    const { aiWriteTools } = await import('@/app/lib/ai-tools');

    let tools = Object.values(aiWriteTools);
    
    if (category) {
      tools = getToolsByCategory(category as any);
    }

    return NextResponse.json({
      ok: true,
      count: tools.length,
      tools: tools.map(tool => ({
        id: tool.id,
        title: tool.title,
        description: tool.description,
        category: tool.category,
        icon: tool.icon,
      })),
    });
  } catch (error) {
    console.error('AI Write Tools list error:', error);

    return NextResponse.json(
      {
        ok: false,
        error: 'Failed to fetch tools',
      },
      { status: 500 }
    );
  }
}

