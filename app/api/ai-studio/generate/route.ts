import OpenAI from 'openai';
import { randomUUID } from 'crypto';
import { Prisma } from '@prisma/client';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { prisma } from '@/lib/prisma';
import {
  estimateAiStudioCredits,
  normalizeAiStudioSlideCount,
} from '@/lib/ai-studio/estimate';
import { estimateOpenRouterCostUsd } from '@/lib/ai-studio/openrouter-pricing';
import { findAiStudioUserByEmail } from '@/lib/ai-studio/user';
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

interface OpenRouterPromptResult {
  content: string;
  usage: {
    inputTokens?: number;
    outputTokens?: number;
    totalTokens?: number;
    model?: string;
    responseId?: string;
  };
}

interface AggregatedProviderUsage {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  estimatedCostUsd: Prisma.Decimal | null;
  hasUnknownCost: boolean;
  models: Set<string>;
  responseIds: string[];
}

class OpenRouterPromptError extends Error {
  status: number | null;
  safeToFallback: boolean;

  constructor(
    message: string,
    options: { status?: number | null; safeToFallback?: boolean } = {},
  ) {
    super(message);
    this.name = 'OpenRouterPromptError';
    this.status = options.status ?? null;
    this.safeToFallback = options.safeToFallback ?? false;
  }
}

const primaryPresentationModel =
  process.env.AI_PRESENTATION_MODEL_PRIMARY || 'anthropic/claude-sonnet-4';
const fallbackPresentationModel =
  process.env.AI_PRESENTATION_MODEL_FALLBACK || 'qwen/qwen3-32b';
const maxTokens = Number(process.env.AI_MAX_TOKENS || 6000);

function getErrorStatus(error: unknown) {
  if (typeof error === 'object' && error !== null && 'status' in error) {
    const status = (error as { status?: unknown }).status;
    return typeof status === 'number' ? status : null;
  }

  return null;
}

function getOpenRouterClient() {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY_MISSING');
  }

  return new OpenAI({
    apiKey,
    baseURL: 'https://openrouter.ai/api/v1',
  });
}

function createProviderUsageAccumulator(): AggregatedProviderUsage {
  return {
    inputTokens: 0,
    outputTokens: 0,
    totalTokens: 0,
    estimatedCostUsd: new Prisma.Decimal(0),
    hasUnknownCost: false,
    models: new Set<string>(),
    responseIds: [],
  };
}

function numberOrUndefined(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value)
    ? value
    : undefined;
}

function addProviderUsage(
  accumulator: AggregatedProviderUsage,
  usage: OpenRouterPromptResult['usage'],
) {
  if (typeof usage.inputTokens === 'number') {
    accumulator.inputTokens += usage.inputTokens;
  }

  if (typeof usage.outputTokens === 'number') {
    accumulator.outputTokens += usage.outputTokens;
  }

  if (typeof usage.totalTokens === 'number') {
    accumulator.totalTokens += usage.totalTokens;
  }

  if (usage.model) {
    accumulator.models.add(usage.model);
  }

  const cost = estimateOpenRouterCostUsd({
    model: usage.model,
    inputTokens: usage.inputTokens,
    outputTokens: usage.outputTokens,
  });

  if (cost) {
    accumulator.estimatedCostUsd = (
      accumulator.estimatedCostUsd ?? new Prisma.Decimal(0)
    ).add(cost);
  } else {
    accumulator.hasUnknownCost = true;
    accumulator.estimatedCostUsd = null;
  }

  if (usage.responseId) {
    accumulator.responseIds.push(usage.responseId);
  }
}

function serializeProviderResponseIds(responseIds: string[]) {
  if (responseIds.length === 0) return undefined;

  return JSON.stringify(responseIds);
}

function getAggregatedModel(accumulator: AggregatedProviderUsage) {
  const models = Array.from(accumulator.models);

  if (models.length === 0) {
    return primaryPresentationModel;
  }

  return models.join(', ');
}

function isSafeFallbackError(error: unknown) {
  if (error instanceof OpenRouterPromptError) {
    return error.safeToFallback;
  }

  const status = getErrorStatus(error);

  if (status === null) {
    return true;
  }

  return [408, 409, 425, 429, 500, 502, 503, 504].includes(status);
}

async function attemptOpenRouterPrompt(
  prompt: string,
  model: string,
): Promise<OpenRouterPromptResult> {
  const client = getOpenRouterClient();
  let response;

  try {
    response = await client.chat.completions.create({
      model,
      messages: [
        {
          role: 'system',
          content:
            'You are SimplifyConvert AI. Create professional, structured, clean business output.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: maxTokens,
    });
  } catch (error) {
    throw new OpenRouterPromptError('OpenRouter request failed', {
      status: getErrorStatus(error),
      safeToFallback: isSafeFallbackError(error),
    });
  }

  const result = response.choices[0]?.message?.content || '';

  if (!result) {
    throw new OpenRouterPromptError('OpenRouter returned an empty response', {
      safeToFallback: false,
    });
  }

  return {
    content: result,
    usage: {
      inputTokens: numberOrUndefined(response.usage?.prompt_tokens),
      outputTokens: numberOrUndefined(response.usage?.completion_tokens),
      totalTokens: numberOrUndefined(response.usage?.total_tokens),
      model: typeof response.model === 'string' ? response.model : model,
      responseId: typeof response.id === 'string' ? response.id : undefined,
    },
  };
}

async function runOpenRouterPrompt(
  prompt: string,
): Promise<OpenRouterPromptResult> {
  try {
    return await attemptOpenRouterPrompt(prompt, primaryPresentationModel);
  } catch (error) {
    if (
      fallbackPresentationModel &&
      fallbackPresentationModel !== primaryPresentationModel &&
      isSafeFallbackError(error)
    ) {
      if (process.env.NODE_ENV === 'development') {
        console.warn(
          '[ai-studio-generate] Primary model failed; using fallback model for this prompt.',
          {
            primaryModel: primaryPresentationModel,
            fallbackModel: fallbackPresentationModel,
            status: getErrorStatus(error),
          },
        );
      }

      return attemptOpenRouterPrompt(prompt, fallbackPresentationModel);
    }

    throw error;
  }
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
  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
  provider?: string;
  providerCostUsd?: Prisma.Decimal | null;
  providerResponseId?: string;
  model?: string;
  errorCode?: string;
  completedAt?: Date;
}) {
  await prisma.aiStudioUsageLog.create({
    data: {
      userId: input.userId,
      requestId: input.requestId,
      toolType: 'presentation',
      topic: input.topic,
      slideCount: input.slideCount,
      model: input.model ?? primaryPresentationModel,
      status: input.status,
      estimatedCredits: input.estimatedCredits,
      reservedCredits: input.reservedCredits,
      actualCredits: input.actualCredits,
      inputTokens: input.inputTokens,
      outputTokens: input.outputTokens,
      totalTokens: input.totalTokens,
      provider: input.provider,
      providerCostUsd: input.providerCostUsd,
      providerResponseId: input.providerResponseId,
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
  const providerUsage = createProviderUsageAccumulator();

  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Sign in with a premium-enabled account to use AI Studio.' },
        { status: 401 },
      );
    }

    const user = await findAiStudioUserByEmail(session.user.email);

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
      return NextResponse.json(
        { error: 'Describe the presentation you want to create.' },
        { status: 400 },
      );
    }

    if (!audience) {
      return NextResponse.json(
        {
          error:
            'Add the intended audience so the outline has the right level and angle.',
        },
        { status: 400 },
      );
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
          error: 'Insufficient AI credits. Buy an AI Studio plan to continue.',
          estimatedCredits,
          wallet: serializeAiStudioWallet(wallet),
        },
        { status: 402 },
      );
    }

    await reserveCredits(userId, estimatedCredits, {
      referenceType: 'ai_studio_generation',
      referenceId: requestId,
      description: `Reserved credits for ${normalizedSlideCount}-slide presentation`,
      metadata: { topic, audience, tone, slideCount: normalizedSlideCount },
    });
    reserved = true;

    const researchResult = await runOpenRouterPrompt(
      buildResearchAgentPrompt({
        topic,
        slideCount,
        audience,
        tone,
      }),
    );
    addProviderUsage(providerUsage, researchResult.usage);
    const research = parseResearchAgentOutput(researchResult.content);

    const storytellingResult = await runOpenRouterPrompt(
      buildStorytellingAgentPrompt({
        topic,
        slideCount,
        audience,
        tone,
        research,
      }),
    );
    addProviderUsage(providerUsage, storytellingResult.usage);
    const storytelling = parseStorytellingAgentOutput(
      storytellingResult.content,
    );

    const visualDesignResult = await runOpenRouterPrompt(
      buildVisualDesignAgentPrompt({
        topic,
        slideCount,
        audience,
        tone,
        research,
        storytelling,
      }),
    );
    addProviderUsage(providerUsage, visualDesignResult.usage);
    const visualDesign = parseVisualDesignAgentOutput(
      visualDesignResult.content,
      normalizedSlideCount,
    );

    const outlineResult = await runOpenRouterPrompt(
      buildPresentationPrompt({
        topic,
        slideCount,
        audience,
        tone,
        researchContext: serializeResearchForPlanner(research),
        storytellingContext: serializeStorytellingForPlanner(storytelling),
        visualDesignContext: serializeVisualDesignForPlanner(visualDesign),
      }),
    );
    addProviderUsage(providerUsage, outlineResult.usage);
    const outline = outlineResult.content;

    const updatedWallet = await captureCredits(userId, estimatedCredits, {
      referenceType: 'ai_studio_generation',
      referenceId: requestId,
      description: `Captured credits for ${normalizedSlideCount}-slide presentation`,
      metadata: { topic, audience, tone, slideCount: normalizedSlideCount },
    });
    reserved = false;

    const loggedModel = getAggregatedModel(providerUsage);
    const providerResponseId = serializeProviderResponseIds(
      providerUsage.responseIds,
    );

    if (process.env.NODE_ENV === 'development') {
      console.log('[ai-studio-generate] Provider usage', {
        slideCount: normalizedSlideCount,
        model: loggedModel,
        inputTokens: providerUsage.inputTokens,
        outputTokens: providerUsage.outputTokens,
        totalTokens: providerUsage.totalTokens,
        estimatedCostUsd: providerUsage.estimatedCostUsd?.toString() ?? null,
        creditsCharged: estimatedCredits,
      });
    }

    await logUsage({
      userId,
      requestId,
      topic,
      slideCount: normalizedSlideCount,
      status: 'success',
      estimatedCredits,
      reservedCredits: estimatedCredits,
      actualCredits: estimatedCredits,
      inputTokens: providerUsage.inputTokens || undefined,
      outputTokens: providerUsage.outputTokens || undefined,
      totalTokens: providerUsage.totalTokens || undefined,
      provider: 'openrouter',
      providerCostUsd: providerUsage.hasUnknownCost
        ? null
        : providerUsage.estimatedCostUsd,
      providerResponseId,
      model: loggedModel,
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
          description:
            'Released reserved credits after failed presentation generation',
          metadata: { topic, slideCount: normalizedSlideCount },
        });
      } catch (releaseError) {
        console.error(
          '[ai-studio-generate] Failed to release reserved credits:',
          releaseError,
        );
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
        inputTokens: providerUsage.inputTokens || undefined,
        outputTokens: providerUsage.outputTokens || undefined,
        totalTokens: providerUsage.totalTokens || undefined,
        provider: 'openrouter',
        providerCostUsd: providerUsage.hasUnknownCost
          ? null
          : providerUsage.estimatedCostUsd,
        providerResponseId: serializeProviderResponseIds(
          providerUsage.responseIds,
        ),
        model: getAggregatedModel(providerUsage),
        errorCode:
          error instanceof AiStudioInsufficientCreditsError
            ? 'INSUFFICIENT_CREDITS'
            : error instanceof Error &&
                error.message === 'OPENROUTER_API_KEY_MISSING'
              ? 'AI_SERVICE_UNAVAILABLE'
              : getErrorStatus(error) === 402
                ? 'AI_SERVICE_UNAVAILABLE'
                : 'GENERATION_FAILED',
        completedAt: new Date(),
      }).catch((logError) => {
        console.error(
          '[ai-studio-generate] Failed to write usage log:',
          logError,
        );
      });
    }

    if (error instanceof AiStudioInsufficientCreditsError) {
      return NextResponse.json(
        {
          error: 'Insufficient AI credits. Buy an AI Studio plan to continue.',
        },
        { status: 402 },
      );
    }

    return NextResponse.json(
      {
        error: 'AI service is currently unavailable. Please try again later.',
        wallet: wallet ? serializeAiStudioWallet(wallet) : undefined,
      },
      { status: 503 },
    );
  }
}
