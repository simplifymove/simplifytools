import type { AiStudioPlanConfig } from '@/lib/ai-studio/plans';

export type AiStudioPricingRegion = 'india' | 'global';
export type AiStudioPricingCurrency = 'INR' | 'USD';

export const AI_STUDIO_PRICING_REGION_COOKIE =
  'ai_studio_pricing_region';

const AI_STUDIO_PRICING_REGION_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export function getAiStudioRegionFromCountry(
  countryCode?: string | null,
): AiStudioPricingRegion {
  if (!countryCode) return 'india';

  return countryCode.trim().toUpperCase() === 'IN' ? 'india' : 'global';
}

export function getAiStudioPricingRegionPreference(
  value?: string | null,
): AiStudioPricingRegion | null {
  return value === 'india' || value === 'global' ? value : null;
}

export function resolveAiStudioPricingRegion(
  detectedRegion: AiStudioPricingRegion,
  persistedPreference?: string | null,
) {
  return (
    getAiStudioPricingRegionPreference(persistedPreference) ??
    detectedRegion
  );
}

export function getAiStudioPricingCurrency(
  region: AiStudioPricingRegion,
): AiStudioPricingCurrency {
  return region === 'india' ? 'INR' : 'USD';
}

export function getAiStudioPricingRegionForCurrency(
  currency: AiStudioPricingCurrency,
): AiStudioPricingRegion {
  return currency === 'INR' ? 'india' : 'global';
}

export function getAiStudioPlansForPricingRegion(
  plans: AiStudioPlanConfig[],
  region: AiStudioPricingRegion,
) {
  return plans.filter((plan) => plan.region === region);
}

export function serializeAiStudioPricingRegionCookie(
  region: AiStudioPricingRegion,
  secure: boolean,
) {
  const secureAttribute = secure ? '; Secure' : '';

  return `${AI_STUDIO_PRICING_REGION_COOKIE}=${region}; Path=/; Max-Age=${AI_STUDIO_PRICING_REGION_COOKIE_MAX_AGE}; SameSite=Lax${secureAttribute}`;
}
