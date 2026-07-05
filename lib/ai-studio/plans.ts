export type AiStudioPlanRegion = 'india' | 'global';
export type AiStudioPaymentProvider = 'razorpay' | 'stripe';

export interface AiStudioPlanConfig {
  id: string;
  name: string;
  region: AiStudioPlanRegion;
  provider: AiStudioPaymentProvider;
  currency: 'INR' | 'USD';
  grossAmountMinor: number;
  aiCreditAmountMinor: number;
  platformRevenueMinor: number;
  creditsGranted: number;
}

export const AI_STUDIO_PLANS: AiStudioPlanConfig[] = [
  {
    id: 'india-starter',
    name: 'India Starter',
    region: 'india',
    provider: 'razorpay',
    currency: 'INR',
    grossAmountMinor: 19900,
    aiCreditAmountMinor: 10000,
    platformRevenueMinor: 9900,
    creditsGranted: 100,
  },
  {
    id: 'india-pro',
    name: 'India Pro',
    region: 'india',
    provider: 'razorpay',
    currency: 'INR',
    grossAmountMinor: 49900,
    aiCreditAmountMinor: 30000,
    platformRevenueMinor: 19900,
    creditsGranted: 300,
  },
  {
    id: 'global-starter',
    name: 'Global Starter',
    region: 'global',
    provider: 'stripe',
    currency: 'USD',
    grossAmountMinor: 599,
    aiCreditAmountMinor: 300,
    platformRevenueMinor: 299,
    creditsGranted: 300,
  },
  {
    id: 'global-pro',
    name: 'Global Pro',
    region: 'global',
    provider: 'stripe',
    currency: 'USD',
    grossAmountMinor: 1299,
    aiCreditAmountMinor: 800,
    platformRevenueMinor: 499,
    creditsGranted: 800,
  },
];

export function getAiStudioPlan(planId: string) {
  return AI_STUDIO_PLANS.find((plan) => plan.id === planId) ?? null;
}
