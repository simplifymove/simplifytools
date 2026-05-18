import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST() {
  return NextResponse.json(
    {
      success: false,
      error: 'Video rendering is temporarily disabled.',
    },
    { status: 503 }
  );
}
