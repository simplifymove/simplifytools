import { headers } from 'next/headers';

export type AiStudioPricingRegion = 'india' | 'global';

export function getAiStudioRegionFromCountry(countryCode?: string | null): AiStudioPricingRegion {
  // Default to INR when region detection is unavailable.
  if (!countryCode) return 'india';

  return countryCode.trim().toUpperCase() === 'IN' ? 'india' : 'global';
}

export async function getAiStudioRequestRegion(): Promise<AiStudioPricingRegion> {
  const requestHeaders = await headers();
  const countryCode =
    requestHeaders.get('x-vercel-ip-country') ||
    requestHeaders.get('cf-ipcountry') ||
    requestHeaders.get('x-country-code');

  return getAiStudioRegionFromCountry(countryCode);
}
