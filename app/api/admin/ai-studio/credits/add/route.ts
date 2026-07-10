import { NextRequest, NextResponse } from 'next/server';
import { requireAdminApi } from '@/lib/auth/admin';
import { findAiStudioUserByEmail, normalizeAiStudioEmail } from '@/lib/ai-studio/user';
import { addCredits, serializeAiStudioWallet } from '@/lib/ai-studio/wallet';

interface AddAiStudioCreditsRequest {
  userEmail?: unknown;
  credits?: unknown;
  reason?: unknown;
}

export async function POST(request: NextRequest) {
  try {
    const { auth, response } = await requireAdminApi();
    if (response) return response;
    const adminUser = auth.user!;

    const body = (await request.json().catch(() => ({}))) as AddAiStudioCreditsRequest;
    const userEmail = normalizeAiStudioEmail(typeof body.userEmail === 'string' ? body.userEmail : null);
    const reason = typeof body.reason === 'string' ? body.reason.trim() : '';
    const credits = typeof body.credits === 'number' ? body.credits : Number(body.credits);

    if (!userEmail) {
      return NextResponse.json({ error: 'userEmail is required' }, { status: 400 });
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

    const wallet = await addCredits(user.id, credits, {
      transactionType: 'adjustment',
      referenceType: 'admin_manual_top_up',
      referenceId: adminUser.id,
      description: reason,
      metadata: {
        adminEmail: adminUser.email,
        userEmail,
        reason,
      },
    });

    return NextResponse.json({
      success: true,
      userEmail: user.email,
      creditsAdded: credits,
      wallet: serializeAiStudioWallet(wallet),
    });
  } catch (error) {
    console.error('[admin-ai-studio-credits-add] Failed to add credits:', error);
    return NextResponse.json({ error: 'Failed to add AI Studio credits' }, { status: 500 });
  }
}
