import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import {
  getAiStudioPlan,
  isAiStudioPayPalUsdPlan,
} from '@/lib/ai-studio/plans';
import { findAiStudioUserByEmail } from '@/lib/ai-studio/user';
import { createPayPalOrder, getPayPalConfig } from '@/lib/billing/paypal';
import { prisma } from '@/lib/prisma';
import { getAiStudioRequestRegion } from '@/lib/ai-studio/region';

interface CreateAiStudioPayPalOrderRequest {
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

    const body = (await request.json().catch(() => ({}))) as CreateAiStudioPayPalOrderRequest;
    const planId = typeof body.planId === 'string' ? body.planId : '';
    const plan = getAiStudioPlan(planId);

    if (!isAiStudioPayPalUsdPlan(plan)) {
      return NextResponse.json(
        { error: 'PayPal is available for global USD plans only' },
        { status: 400 },
      );
    }

    const requestRegion = await getAiStudioRequestRegion();


    if (requestRegion === 'india') {

      return NextResponse.json(

        {

          error:

            'USD pricing and PayPal checkout are available outside India only',

        },

        { status: 403 },

      );

    }


    getPayPalConfig();

    const purchase = await prisma.aiStudioPlanPurchase.create({
      data: {
        userId: user.id,
        planId: plan.id,
        provider: 'paypal',
        currency: plan.currency,
        grossAmountMinor: plan.grossAmountMinor,
        aiCreditAmountMinor: plan.aiUsageValueMinor,
        platformRevenueMinor: plan.platformRevenueMinor,
        creditsGranted: plan.creditsGranted,
        status: 'created',
      },
    });

    const order = await createPayPalOrder({
      purchaseId: purchase.id,
      description: `AI Studio ${plan.name.replace('Global ', '')} credits`,
      amountMinor: purchase.grossAmountMinor,
      requestId: `ai-create-${purchase.id}`,
    });

    await prisma.aiStudioPlanPurchase.update({
      where: { id: purchase.id },
      data: {
        providerOrderId: order.id,
        rawPayloadJson: JSON.stringify({
          source: 'paypal_create_order',
          order,
        }),
      },
    });

    return NextResponse.json({
      success: true,
      orderId: order.id,
    });
  } catch (error) {
    console.error(
      '[ai-studio-paypal-create-order] Failed to create order:',
      error instanceof Error ? error.message : 'Unknown error',
    );
    return NextResponse.json(
      { error: 'Unable to start PayPal checkout' },
      { status: 500 },
    );
  }
}
