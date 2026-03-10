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
import { generateText, generateTextMock, analyzeText } from '@/app/lib/ai-client';

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

    // Build user prompt from tool config
    const userPrompt = tool.buildPrompt(inputs);

    // Call LLM (use mock if no API key)
    const hasApiKey = !!process.env.GROQ_API_KEY;
    const generateFn = hasApiKey ? generateText : generateTextMock;

    const aiResponse = await generateFn({
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
        usingMock: !hasApiKey,
      },
    });
  } catch (error) {
    console.error('AI Write API error:', error);

    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Internal server error',
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
