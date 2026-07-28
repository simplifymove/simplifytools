export type AiStudioPlanRegion = 'india' | 'global';
export type AiStudioPaymentProvider = 'razorpay' | 'stripe' | 'paypal';

export interface AiStudioPlanConfig {
  id: string;
  name: string;
  region: AiStudioPlanRegion;
  provider: AiStudioPaymentProvider;
  currency: 'INR' | 'USD';
  grossAmountMinor: number;
  aiUsageValueMinor: number;
  platformRevenueMinor: number;
  creditsGranted: number;
}

function getConfiguredCredits(envName: string, temporaryFallback: number) {
  const configured = Number(process.env[envName]);

  if (Number.isFinite(configured) && configured > 0) {
    return configured;
  }

  return temporaryFallback;
}

// Customer wallets must display and spend only internal AI Credits, never rupee/dollar balances.
// TEMP: creditsGranted values must be finalized after measuring OpenRouter average cost per generation.
export const AI_STUDIO_PLANS: AiStudioPlanConfig[] = [
  {
    id: 'india-starter',
    name: 'India Starter',
    region: 'india',
    provider: 'razorpay',
    currency: 'INR',
    grossAmountMinor: 19900,
    aiUsageValueMinor: 10000,
    platformRevenueMinor: 9900,
    creditsGranted: getConfiguredCredits('AI_STUDIO_CREDITS_INDIA_STARTER', 1000),
  },
  {
    id: 'india-pro',
    name: 'India Pro',
    region: 'india',
    provider: 'razorpay',
    currency: 'INR',
    grossAmountMinor: 49900,
    aiUsageValueMinor: 30000,
    platformRevenueMinor: 19900,
    creditsGranted: getConfiguredCredits('AI_STUDIO_CREDITS_INDIA_PRO', 3000),
  },
  {
    id: 'global-starter',
    name: 'Global Starter',
    region: 'global',
    provider: 'paypal',
    currency: 'USD',
    grossAmountMinor: 599,
    aiUsageValueMinor: 300,
    platformRevenueMinor: 299,
    creditsGranted: getConfiguredCredits('AI_STUDIO_CREDITS_GLOBAL_STARTER', 3000),
  },
  {
    id: 'global-pro',
    name: 'Global Pro',
    region: 'global',
    provider: 'paypal',
    currency: 'USD',
    grossAmountMinor: 1299,
    aiUsageValueMinor: 800,
    platformRevenueMinor: 499,
    creditsGranted: getConfiguredCredits('AI_STUDIO_CREDITS_GLOBAL_PRO', 8000),
  },
];

export function getAiStudioPlan(planId: string) {
  return AI_STUDIO_PLANS.find((plan) => plan.id === planId) ?? null;
}

export function isAiStudioPayPalUsdPlan(
  plan: AiStudioPlanConfig | null,
): plan is AiStudioPlanConfig {
  return Boolean(
    plan &&
      plan.region === 'global' &&
      plan.provider === 'paypal' &&
      plan.currency === 'USD',
  );
}
