import { NextResponse } from 'next/server';
import { estimateAiStudioCredits } from '@/lib/ai-studio/estimate';

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as { slideCount?: unknown };
    const estimate = estimateAiStudioCredits(body.slideCount);

    return NextResponse.json(estimate);
  } catch (error) {
    console.error('[ai-studio-estimate] Failed to estimate credits:', error);
    return NextResponse.json({ error: 'Unable to estimate AI Studio credits' }, { status: 500 });
  }
}
