import OpenAI from 'openai';
import { randomUUID } from 'crypto';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { prisma } from '@/lib/prisma';
import { estimateAiStudioCredits, normalizeAiStudioSlideCount } from '@/lib/ai-studio/estimate';
import {
  AiStudioInsufficientCreditsError,
  captureCredits,
  getOrCreateWallet,
  releaseCredits,
  reserveCredits,
  serializeAiStudioWallet,
} from '@/lib/ai-studio/wallet';
import {
  buildResearchAgentPrompt,
  parseResearchAgentOutput,
  serializeResearchForPlanner,
} from '@/app/ai-studio/presentation-maker/lib/researchAgent';
import {
  buildStorytellingAgentPrompt,
  parseStorytellingAgentOutput,
  serializeStorytellingForPlanner,
} from '@/app/ai-studio/presentation-maker/lib/storytellingAgent';
import {
  buildVisualDesignAgentPrompt,
  parseVisualDesignAgentOutput,
  serializeVisualDesignForPlanner,
} from '@/app/ai-studio/presentation-maker/lib/visualDesignAgent';
import { buildPresentationPrompt } from '@/app/ai-studio/presentation-maker/lib/presentationPlan';

interface AiStudioGenerateRequest {
  topic?: string;
  audience?: string;
  tone?: string;
  slideCount?: string;
}

const client = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: 'https://openrouter.ai/api/v1',
});

const presentationModel = process.env.AI_PRESENTATION_MODEL || 'qwen/qwen3-32b';
const maxTokens = Number(process.env.AI_MAX_TOKENS || 6000);

function getErrorStatus(error: unknown) {
  if (typeof error === 'object' && error !== null && 'status' in error) {
    const status = (error as { status?: unknown }).status;
    return typeof status === 'number' ? status : null;
  }

  return null;
}

async function runOpenRouterPrompt(prompt: string) {
  const response = await client.chat.completions.create({
    model: presentationModel,
    messages: [
      {
        role: 'system',
        content: 'You are SimplifyConvert AI. Create professional, structured, clean business output.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    temperature: 0.7,
    max_tokens: maxTokens,
  });

  const result = response.choices[0]?.message?.content || '';

  if (!result) {
    throw new Error('OpenRouter returned an empty response');
  }

  return result;
}

async function logUsage(input: {
  userId: string;
  requestId: string;
  topic: string;
  slideCount: number;
  status: string;
  estimatedCredits: number;
  reservedCredits: number;
  actualCredits?: number;
  errorCode?: string;
  completedAt?: Date;
}) {
  await prisma.aiStudioUsageLog.create({
    data: {
      userId: input.userId,
      requestId: input.requestId,
      topic: input.topic,
      slideCount: input.slideCount,
      model: presentationModel,
      status: input.status,
      estimatedCredits: input.estimatedCredits,
      reservedCredits: input.reservedCredits,
      actualCredits: input.actualCredits,
      errorCode: input.errorCode,
      completedAt: input.completedAt,
    },
  });
}

export async function POST(request: Request) {
  const requestId = randomUUID();
  let reserved = false;
  let userId = '';
  let topic = '';
  let normalizedSlideCount = 10;
  let estimatedCredits = 0;

  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Sign in with a premium-enabled account to use AI Studio.' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    userId = user.id;

    const body = (await request.json()) as AiStudioGenerateRequest;
    topic = body.topic?.trim() || '';
    const audience = body.audience?.trim() || '';
    const tone = body.tone?.trim() || 'Professional';
    normalizedSlideCount = normalizeAiStudioSlideCount(body.slideCount);
    const slideCount = String(normalizedSlideCount);

    if (!topic) {
      return NextResponse.json({ error: 'Describe the presentation you want to create.' }, { status: 400 });
    }

    if (!audience) {
      return NextResponse.json({ error: 'Add the intended audience so the outline has the right level and angle.' }, { status: 400 });
    }

    const estimate = estimateAiStudioCredits(normalizedSlideCount);
    estimatedCredits = estimate.estimatedCredits;

    const wallet = await getOrCreateWallet(userId);
    if (wallet.balanceCredits.toNumber() < estimatedCredits) {
      await logUsage({
        userId,
        requestId,
        topic,
        slideCount: normalizedSlideCount,
        status: 'failed',
        estimatedCredits,
        reservedCredits: 0,
        errorCode: 'INSUFFICIENT_CREDITS',
        completedAt: new Date(),
      });

      return NextResponse.json(
        {
          error: 'Insufficient AI credits. Buy or renew a plan to continue generating presentations.',
          estimatedCredits,
          wallet: serializeAiStudioWallet(wallet),
        },
        { status: 402 }
      );
    }

    await reserveCredits(userId, estimatedCredits, {
      referenceType: 'ai_studio_generation',
      referenceId: requestId,
      description: `Reserved credits for ${normalizedSlideCount}-slide presentation`,
      metadata: { topic, audience, tone, slideCount: normalizedSlideCount },
    });
    reserved = true;

    const researchRaw = await runOpenRouterPrompt(
      buildResearchAgentPrompt({
        topic,
        slideCount,
        audience,
        tone,
      })
    );
    const research = parseResearchAgentOutput(researchRaw);

    const storytellingRaw = await runOpenRouterPrompt(
      buildStorytellingAgentPrompt({
        topic,
        slideCount,
        audience,
        tone,
        research,
      })
    );
    const storytelling = parseStorytellingAgentOutput(storytellingRaw);

    const visualDesignRaw = await runOpenRouterPrompt(
      buildVisualDesignAgentPrompt({
        topic,
        slideCount,
        audience,
        tone,
        research,
        storytelling,
      })
    );
    const visualDesign = parseVisualDesignAgentOutput(visualDesignRaw, normalizedSlideCount);

    const outline = await runOpenRouterPrompt(
      buildPresentationPrompt({
        topic,
        slideCount,
        audience,
        tone,
        researchContext: serializeResearchForPlanner(research),
        storytellingContext: serializeStorytellingForPlanner(storytelling),
        visualDesignContext: serializeVisualDesignForPlanner(visualDesign),
      })
    );

    const updatedWallet = await captureCredits(userId, estimatedCredits, {
      referenceType: 'ai_studio_generation',
      referenceId: requestId,
      description: `Captured credits for ${normalizedSlideCount}-slide presentation`,
      metadata: { topic, audience, tone, slideCount: normalizedSlideCount },
    });
    reserved = false;

    await logUsage({
      userId,
      requestId,
      topic,
      slideCount: normalizedSlideCount,
      status: 'success',
      estimatedCredits,
      reservedCredits: estimatedCredits,
      actualCredits: estimatedCredits,
      completedAt: new Date(),
    });

    return NextResponse.json({
      outline,
      visualDesignPlan: visualDesign,
      creditsUsed: estimatedCredits,
      wallet: serializeAiStudioWallet(updatedWallet),
    });
  } catch (error) {
    console.error('[ai-studio-generate] Generation failed:', error);

    let wallet = null;
    if (reserved && userId) {
      try {
        wallet = await releaseCredits(userId, estimatedCredits, {
          referenceType: 'ai_studio_generation',
          referenceId: requestId,
          description: 'Released reserved credits after failed presentation generation',
          metadata: { topic, slideCount: normalizedSlideCount },
        });
      } catch (releaseError) {
        console.error('[ai-studio-generate] Failed to release reserved credits:', releaseError);
      }
    }

    if (userId && estimatedCredits > 0) {
      await logUsage({
        userId,
        requestId,
        topic,
        slideCount: normalizedSlideCount,
        status: 'failed',
        estimatedCredits,
        reservedCredits: reserved ? estimatedCredits : 0,
        errorCode:
          error instanceof AiStudioInsufficientCreditsError
            ? 'INSUFFICIENT_CREDITS'
            : getErrorStatus(error) === 402
              ? 'AI_SERVICE_UNAVAILABLE'
              : 'GENERATION_FAILED',
        completedAt: new Date(),
      }).catch((logError) => {
        console.error('[ai-studio-generate] Failed to write usage log:', logError);
      });
    }

    if (error instanceof AiStudioInsufficientCreditsError) {
      return NextResponse.json({ error: 'Insufficient AI credits. Buy or renew a plan to continue generating presentations.' }, { status: 402 });
    }

    return NextResponse.json(
      {
        error: 'AI service is currently unavailable. Please try again later.',
        wallet: wallet ? serializeAiStudioWallet(wallet) : undefined,
      },
      { status: 503 }
    );
  }
}
