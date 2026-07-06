import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { findAiStudioUserByEmail } from '@/lib/ai-studio/user';
import { getOrCreateWallet, serializeAiStudioWallet } from '@/lib/ai-studio/wallet';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await findAiStudioUserByEmail(session.user.email);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const wallet = await getOrCreateWallet(user.id);

    return NextResponse.json({
      wallet: serializeAiStudioWallet(wallet),
    });
  } catch (error) {
    console.error('[ai-studio-wallet] Failed to load wallet:', error);
    return NextResponse.json({ error: 'Unable to load AI Studio wallet' }, { status: 500 });
  }
}
