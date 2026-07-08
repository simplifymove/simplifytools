import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { getAiStudioPlan } from '@/lib/ai-studio/plans';
import { findAiStudioUserByEmail } from '@/lib/ai-studio/user';
import { getStripeServerClient } from '@/lib/billing/stripe';
import { prisma } from '@/lib/prisma';

interface CreateAiStudioStripeCheckoutRequest {
  planId?: unknown;
}

function getRequestOrigin(request: NextRequest) {
  return (
    request.headers.get('origin') ||
    process.env.NEXTAUTH_URL ||
    `${request.nextUrl.protocol}//${request.nextUrl.host}`
  );
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

    const body = (await request.json().catch(() => ({}))) as CreateAiStudioStripeCheckoutRequest;
    const planId = typeof body.planId === 'string' ? body.planId : '';
    const plan = getAiStudioPlan(planId);

    if (!plan || plan.provider !== 'stripe' || plan.currency !== 'USD') {
      return NextResponse.json({ error: 'Stripe is available for global USD plans only' }, { status: 400 });
    }

    const purchase = await prisma.aiStudioPlanPurchase.create({
      data: {
        userId: user.id,
        planId: plan.id,
        provider: 'stripe',
        currency: plan.currency,
        grossAmountMinor: plan.grossAmountMinor,
        aiCreditAmountMinor: plan.aiUsageValueMinor,
        platformRevenueMinor: plan.platformRevenueMinor,
        creditsGranted: plan.creditsGranted,
        status: 'created',
      },
    });

    const origin = getRequestOrigin(request);
    const stripe = getStripeServerClient();
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer_email: user.email || undefined,
      client_reference_id: purchase.id,
      success_url: `${origin}/ai-studio/pricing?stripe=success&purchase=${purchase.id}`,
      cancel_url: `${origin}/ai-studio/pricing?stripe=cancelled&purchase=${purchase.id}`,
      metadata: {
        product: 'ai-studio',
        purchaseId: purchase.id,
        planId: plan.id,
        userId: user.id,
      },
      payment_intent_data: {
        metadata: {
          product: 'ai-studio',
          purchaseId: purchase.id,
          planId: plan.id,
          userId: user.id,
        },
      },
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: 'usd',
            unit_amount: plan.grossAmountMinor,
            product_data: {
              name: `AI Studio ${plan.name.replace('Global ', '')}`,
              description: `${plan.creditsGranted.toLocaleString()} AI Credits for AI Studio premium tools.`,
              metadata: {
                product: 'ai-studio',
                planId: plan.id,
              },
            },
          },
        },
      ],
    });

    await prisma.aiStudioPlanPurchase.update({
      where: { id: purchase.id },
      data: {
        providerCheckoutSessionId: checkoutSession.id,
        rawPayloadJson: JSON.stringify({ checkoutSession }),
      },
    });

    return NextResponse.json({
      success: true,
      checkoutSessionId: checkoutSession.id,
      url: checkoutSession.url,
    });
  } catch (error) {
    console.error('[ai-studio-stripe-create-checkout-session] Failed to create checkout session:', error);
    return NextResponse.json({ error: 'Failed to create Stripe Checkout session' }, { status: 500 });
  }
}
