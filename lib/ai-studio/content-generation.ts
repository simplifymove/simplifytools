import OpenAI from 'openai';
import { Prisma } from '@prisma/client';
import { estimateOpenRouterCostUsd } from './openrouter-pricing';

export interface AiStudioPromptResult {
  content: string;
  usage: {
    inputTokens?: number;
    outputTokens?: number;
    totalTokens?: number;
    model?: string;
    responseId?: string;
  };
}

export interface AiStudioProviderUsage {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  estimatedCostUsd: Prisma.Decimal | null;
  hasUnknownCost: boolean;
  models: Set<string>;
  responseIds: string[];
}

interface AiStudioPromptOptions {
  timeoutMs?: number;
}

export class AiStudioOpenRouterError extends Error {
  status: number | null;
  safeToFallback: boolean;

  constructor(
    message: string,
    options: { status?: number | null; safeToFallback?: boolean } = {},
  ) {
    super(message);
    this.name = 'AiStudioOpenRouterError';
    this.status = options.status ?? null;
    this.safeToFallback = options.safeToFallback ?? false;
  }
}

export const primaryAiStudioModel =
  process.env.AI_PRESENTATION_MODEL_PRIMARY || 'anthropic/claude-sonnet-4';
export const fallbackAiStudioModel =
  process.env.AI_PRESENTATION_MODEL_FALLBACK || 'qwen/qwen3-32b';
const maxTokens = Number(process.env.AI_MAX_TOKENS || 6000);

export function createProviderUsageAccumulator(): AiStudioProviderUsage {
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

export function getErrorStatus(error: unknown) {
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

function numberOrUndefined(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value)
    ? value
    : undefined;
}

function isSafeFallbackError(error: unknown) {
  if (error instanceof AiStudioOpenRouterError) {
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
  options: AiStudioPromptOptions = {},
): Promise<AiStudioPromptResult> {
  const client = getOpenRouterClient();
  const controller = options.timeoutMs ? new AbortController() : null;
  const timeout = controller && options.timeoutMs
    ? setTimeout(() => controller.abort(), options.timeoutMs)
    : null;
  let response;

  try {
    response = await client.chat.completions.create(
      {
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
        temperature: 0.55,
        max_tokens: maxTokens,
      },
      controller ? { signal: controller.signal } : undefined,
    );
  } catch (error) {
    throw new AiStudioOpenRouterError('OpenRouter request failed', {
      status: getErrorStatus(error),
      safeToFallback: isSafeFallbackError(error),
    });
  } finally {
    if (timeout) {
      clearTimeout(timeout);
    }
  }

  const content = response.choices[0]?.message?.content || '';

  if (!content) {
    throw new AiStudioOpenRouterError('OpenRouter returned an empty response', {
      safeToFallback: false,
    });
  }

  return {
    content,
    usage: {
      inputTokens: numberOrUndefined(response.usage?.prompt_tokens),
      outputTokens: numberOrUndefined(response.usage?.completion_tokens),
      totalTokens: numberOrUndefined(response.usage?.total_tokens),
      model: typeof response.model === 'string' ? response.model : model,
      responseId: typeof response.id === 'string' ? response.id : undefined,
    },
  };
}

export async function runAiStudioOpenRouterPrompt(
  prompt: string,
  options: AiStudioPromptOptions = {},
): Promise<AiStudioPromptResult> {
  try {
    return await attemptOpenRouterPrompt(prompt, primaryAiStudioModel, options);
  } catch (error) {
    if (
      fallbackAiStudioModel &&
      fallbackAiStudioModel !== primaryAiStudioModel &&
      isSafeFallbackError(error)
    ) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('[ai-studio] Primary model failed; using fallback model.', {
          primaryModel: primaryAiStudioModel,
          fallbackModel: fallbackAiStudioModel,
          status: getErrorStatus(error),
        });
      }

      return attemptOpenRouterPrompt(prompt, fallbackAiStudioModel, options);
    }

    throw error;
  }
}

export function addProviderUsage(
  accumulator: AiStudioProviderUsage,
  usage: AiStudioPromptResult['usage'],
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

export function getAggregatedModel(accumulator: AiStudioProviderUsage) {
  const models = Array.from(accumulator.models);

  return models.length > 0 ? models.join(', ') : primaryAiStudioModel;
}

export function serializeProviderResponseIds(responseIds: string[]) {
  return responseIds.length > 0 ? JSON.stringify(responseIds) : undefined;
}
