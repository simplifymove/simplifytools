import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { getAiStudioPlan } from '@/lib/ai-studio/plans';
import { findAiStudioUserByEmail } from '@/lib/ai-studio/user';
import { createRazorpayOrder } from '@/lib/billing/razorpay';
import { prisma } from '@/lib/prisma';

interface CreateAiStudioRazorpayOrderRequest {
  planId?: unknown;
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await findAiStudioUserByEmail(session.user.email);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = (await request.json().catch(() => ({}))) as CreateAiStudioRazorpayOrderRequest;
    const planId = typeof body.planId === 'string' ? body.planId : '';
    const plan = getAiStudioPlan(planId);

    if (!plan || plan.provider !== 'razorpay' || plan.currency !== 'INR') {
      return NextResponse.json({ error: 'Razorpay is available for India plans only' }, { status: 400 });
    }

    const razorpayKeyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID;

    if (!razorpayKeyId) {
      return NextResponse.json({ error: 'Razorpay is not configured' }, { status: 500 });
    }

    const razorpayOrder = await createRazorpayOrder({
      amount: plan.grossAmountMinor,
      currency: plan.currency,
      receipt: `aistudio_${Date.now()}`,
      customer_notify: 1,
      notes: {
        product: 'ai-studio',
        planId: plan.id,
        userId: user.id,
        userEmail: user.email || '',
      },
    });

    const purchase = await prisma.aiStudioPlanPurchase.create({
      data: {
        userId: user.id,
        planId: plan.id,
        provider: 'razorpay',
        providerOrderId: razorpayOrder.id,
        currency: plan.currency,
        grossAmountMinor: plan.grossAmountMinor,
        aiCreditAmountMinor: plan.aiUsageValueMinor,
        platformRevenueMinor: plan.platformRevenueMinor,
        creditsGranted: plan.creditsGranted,
        status: 'created',
        rawPayloadJson: JSON.stringify({ order: razorpayOrder }),
      },
    });

    return NextResponse.json({
      success: true,
      purchaseId: purchase.id,
      orderId: razorpayOrder.id,
      amount: plan.grossAmountMinor,
      currency: plan.currency,
      keyId: razorpayKeyId,
      plan: {
        id: plan.id,
        name: plan.name,
        creditsGranted: plan.creditsGranted,
      },
      user: {
        email: user.email,
        name: session.user.name || '',
      },
    });
  } catch (error) {
    console.error('[ai-studio-razorpay-create-order] Failed to create order:', error);
    return NextResponse.json({ error: 'Failed to create AI Studio payment order' }, { status: 500 });
  }
}
