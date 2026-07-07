import { Prisma } from '@prisma/client';

interface OpenRouterModelPricing {
  promptUsdPerToken: string;
  completionUsdPerToken: string;
}

interface EstimateOpenRouterCostInput {
  model?: string | null;
  inputTokens?: number | null;
  outputTokens?: number | null;
}

const OPENROUTER_PRICING_SOURCE = 'https://openrouter.ai/api/v1/models';

const OPENROUTER_MODEL_PRICING: Record<string, OpenRouterModelPricing> = {
  'anthropic/claude-sonnet-4': {
    promptUsdPerToken: '0.000003',
    completionUsdPerToken: '0.000015',
  },
  'anthropic/claude-4-sonnet-20250522': {
    promptUsdPerToken: '0.000003',
    completionUsdPerToken: '0.000015',
  },
  'qwen/qwen3-30b-a3b': {
    promptUsdPerToken: '0.00000012',
    completionUsdPerToken: '0.0000005',
  },
  'qwen/qwen3-30b-a3b-04-28': {
    promptUsdPerToken: '0.00000012',
    completionUsdPerToken: '0.0000005',
  },
};

function normalizeModelId(model?: string | null) {
  return model?.trim().toLowerCase() || null;
}

export function getOpenRouterPricingSource() {
  return OPENROUTER_PRICING_SOURCE;
}

export function getOpenRouterModelPricing(model?: string | null) {
  const modelId = normalizeModelId(model);

  if (!modelId) {
    return null;
  }

  return OPENROUTER_MODEL_PRICING[modelId] ?? null;
}

export function estimateOpenRouterCostUsd({
  model,
  inputTokens,
  outputTokens,
}: EstimateOpenRouterCostInput) {
  const pricing = getOpenRouterModelPricing(model);

  if (!pricing || inputTokens == null || outputTokens == null) {
    return null;
  }

  const inputCost = new Prisma.Decimal(inputTokens).mul(
    pricing.promptUsdPerToken,
  );
  const outputCost = new Prisma.Decimal(outputTokens).mul(
    pricing.completionUsdPerToken,
  );

  return inputCost.add(outputCost);
}
