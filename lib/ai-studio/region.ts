import { cookies, headers } from 'next/headers';
import {
  AI_STUDIO_PRICING_REGION_COOKIE,
  getAiStudioRegionFromCountry,
  resolveAiStudioPricingRegion,
  type AiStudioPricingRegion,
} from '@/lib/ai-studio/pricing-region';

export type { AiStudioPricingRegion } from '@/lib/ai-studio/pricing-region';
export { getAiStudioRegionFromCountry } from '@/lib/ai-studio/pricing-region';

export async function getAiStudioRequestRegion(): Promise<AiStudioPricingRegion> {
  const requestHeaders = await headers();
  const countryCode =
    requestHeaders.get('x-vercel-ip-country') ||
    requestHeaders.get('cf-ipcountry') ||
    requestHeaders.get('x-country-code');

  return getAiStudioRegionFromCountry(countryCode);
}

export async function getAiStudioPricingRegion(): Promise<AiStudioPricingRegion> {
  const [detectedRegion, cookieStore] = await Promise.all([
    getAiStudioRequestRegion(),
    cookies(),
  ]);

  return resolveAiStudioPricingRegion(
    detectedRegion,
    cookieStore.get(AI_STUDIO_PRICING_REGION_COOKIE)?.value,
  );
}
