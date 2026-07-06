import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth/admin';
import { findAiStudioUserByEmail, normalizeAiStudioEmail } from '@/lib/ai-studio/user';
import {
  AiStudioInsufficientCreditsError,
  addCredits,
  deductCredits,
  serializeAiStudioWallet,
} from '@/lib/ai-studio/wallet';

interface AdjustAiStudioCreditsRequest {
  userEmail?: unknown;
  credits?: unknown;
  action?: unknown;
  reason?: unknown;
}

export async function POST(request: NextRequest) {
  try {
    const adminSession = await getAdminSession();

    if (!adminSession?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
    }

    const body = (await request.json().catch(() => ({}))) as AdjustAiStudioCreditsRequest;
    const userEmail = normalizeAiStudioEmail(typeof body.userEmail === 'string' ? body.userEmail : null);
    const action = body.action === 'deduct' ? 'deduct' : body.action === 'add' ? 'add' : '';
    const reason = typeof body.reason === 'string' ? body.reason.trim() : '';
    const credits = typeof body.credits === 'number' ? body.credits : Number(body.credits);

    if (!userEmail) {
      return NextResponse.json({ error: 'userEmail is required' }, { status: 400 });
    }

    if (action !== 'add' && action !== 'deduct') {
      return NextResponse.json({ error: 'action must be add or deduct' }, { status: 400 });
    }

    if (!Number.isFinite(credits) || credits <= 0) {
      return NextResponse.json({ error: 'credits must be greater than 0' }, { status: 400 });
    }

    if (!reason) {
      return NextResponse.json({ error: 'reason is required' }, { status: 400 });
    }

    const user = await findAiStudioUserByEmail(userEmail);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const context = {
      transactionType: 'adjustment' as const,
      referenceType: action === 'add' ? 'admin_manual_credit_add' : 'admin_manual_credit_deduct',
      referenceId: adminSession.user.id,
      description: reason,
      metadata: {
        adminEmail: adminSession.user.email,
        userEmail,
        action,
        reason,
      },
    };

    const wallet =
      action === 'add'
        ? await addCredits(user.id, credits, context)
        : await deductCredits(user.id, credits, context);

    return NextResponse.json({
      success: true,
      action,
      userEmail: user.email,
      creditsAdjusted: credits,
      wallet: serializeAiStudioWallet(wallet),
    });
  } catch (error) {
    if (error instanceof AiStudioInsufficientCreditsError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    console.error('[admin-ai-studio-credits-adjust] Failed to adjust credits:', error);
    return NextResponse.json({ error: 'Failed to adjust AI Studio credits' }, { status: 500 });
  }
}
