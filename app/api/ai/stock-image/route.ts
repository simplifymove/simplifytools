import { NextResponse } from 'next/server';
import { getAiStudioAccessForCurrentUser } from '@/lib/entitlements/ai-studio-server';

interface PexelsPhoto {
  photographer?: string;
  src?: {
    large2x?: string;
    large?: string;
    medium?: string;
    landscape?: string;
  };
}

interface PexelsSearchResponse {
  photos?: PexelsPhoto[];
}

export async function POST(req: Request) {
  try {
    // Premium-only preparation: unchanged unless AI_STUDIO_ENFORCE_PREMIUM_ACCESS=true in production.
    const access = await getAiStudioAccessForCurrentUser();
    if (!access.allowed) {
      return NextResponse.json({ error: 'Premium access is required to use AI Studio.' }, { status: 403 });
    }

    const { query } = await req.json();

    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    console.log('[stock-image] image query:', query);

    const apiKey = process.env.PEXELS_API_KEY;
    console.log('[stock-image] PEXELS_API_KEY configured:', Boolean(apiKey));

    if (!apiKey) {
      console.warn('[stock-image] fallback reason: missing PEXELS_API_KEY');
      return NextResponse.json({ error: 'Stock image API is not configured' }, { status: 503 });
    }

    const searchParams = new URLSearchParams({
      query,
      per_page: '1',
      orientation: 'landscape',
    });

    const response = await fetch(`https://api.pexels.com/v1/search?${searchParams.toString()}`, {
      headers: {
        Authorization: apiKey,
      },
      next: {
        revalidate: 60 * 60 * 24,
      },
    });

    console.log('[stock-image] Pexels response status:', response.status);

    if (!response.ok) {
      console.warn('[stock-image] fallback reason: Pexels search failed', { query, status: response.status });
      return NextResponse.json({ error: 'Stock image search failed' }, { status: response.status });
    }

    const data = (await response.json()) as PexelsSearchResponse;
    const photo = data.photos?.[0];
    const imageUrl = photo?.src?.landscape || photo?.src?.large2x || photo?.src?.large || photo?.src?.medium;
    console.log('[stock-image] returned imageUrl exists:', Boolean(imageUrl));

    if (!imageUrl) {
      console.warn('[stock-image] fallback reason: no image found', { query });
      return NextResponse.json({ error: 'No image found' }, { status: 404 });
    }

    return NextResponse.json({
      imageUrl,
      photographer: photo?.photographer,
    });
  } catch (error) {
    console.error('[stock-image] fallback reason: stock image search error', error);
    return NextResponse.json({ error: 'Stock image search failed' }, { status: 500 });
  }
}
