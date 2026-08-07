import { headers } from 'next/headers';
import {
  getAiStudioRegionFromCountry,
  type AiStudioPricingRegion,
} from '@/lib/ai-studio/pricing-region';

export type { AiStudioPricingRegion } from '@/lib/ai-studio/pricing-region';
export { getAiStudioRegionFromCountry } from '@/lib/ai-studio/pricing-region';

function getFirstForwardedIp(value: string | null): string | null {
  if (!value) {
    return null;
  }

  const ip = value.split(',')[0]?.trim();

  const ipv4Parts = ip.split('.').map(Number);
  const isPrivate172 =
    ipv4Parts.length === 4 &&
    ipv4Parts[0] === 172 &&
    ipv4Parts[1] >= 16 &&
    ipv4Parts[1] <= 31;

  if (
    !ip ||
    ip === '127.0.0.1' ||
    ip === '::1' ||
    ip.startsWith('10.') ||
    ip.startsWith('192.168.') ||
    isPrivate172
  ) {
    return null;
  }

  return ip;
}

async function detectCountryFromIp(ip: string): Promise<string | null> {
  const token = process.env.IPINFO_TOKEN?.trim();

  if (!token) {
    console.error('[ai-studio-region] IPINFO_TOKEN is not configured');
    return null;
  }

  try {
    const response = await fetch(
      `https://api.ipinfo.io/lite/${encodeURIComponent(ip)}?token=${encodeURIComponent(token)}`,
      {
        signal: AbortSignal.timeout(3000),
        cache: 'no-store',
      },
    );

    if (!response.ok) {
      console.error(
        `[ai-studio-region] IPinfo lookup failed with status ${response.status}`,
      );
      return null;
    }

    const data = (await response.json()) as {
      country_code?: string;
    };

    const countryCode = data.country_code?.trim().toUpperCase() || '';

    return /^[A-Z]{2}$/.test(countryCode)
      ? countryCode
      : null;
  } catch (error) {
    console.error(
      '[ai-studio-region] IPinfo lookup failed:',
      error instanceof Error ? error.message : 'Unknown error',
    );
    return null;
  }
}

export async function getAiStudioRequestRegion(): Promise<AiStudioPricingRegion> {
  const requestHeaders = await headers();

  // Nginx sets X-Real-IP from the actual remote client address.
  const clientIp = getFirstForwardedIp(
    requestHeaders.get('x-real-ip'),
  );

  // Unknown location deliberately falls back to global/USD.
  if (!clientIp) {
    return 'global';
  }

  const countryCode = await detectCountryFromIp(clientIp);

  return countryCode === 'IN' ? 'india' : 'global';
}

export async function getAiStudioPricingRegion(): Promise<AiStudioPricingRegion> {
  return getAiStudioRequestRegion();
}
