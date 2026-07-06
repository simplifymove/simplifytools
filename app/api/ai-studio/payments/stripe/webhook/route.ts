import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { fulfillAiStudioStripePurchase } from '@/lib/ai-studio/payments';
import { getStripeServerClient, getStripeWebhookSecret } from '@/lib/billing/stripe';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json({ error: 'Missing Stripe signature' }, { status: 400 });
    }

    const body = await request.text();
    const stripe = getStripeServerClient();
    const webhookSecret = getStripeWebhookSecret();
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);

    if (event.type === 'checkout.session.completed') {
      const checkoutSession = event.data.object as Stripe.Checkout.Session;

      if (checkoutSession.metadata?.product !== 'ai-studio') {
        return NextResponse.json({ status: 'ignored' });
      }

      if (checkoutSession.payment_status !== 'paid') {
        return NextResponse.json({ status: 'pending' });
      }

      await fulfillAiStudioStripePurchase({
        checkoutSessionId: checkoutSession.id,
        providerPaymentId:
          typeof checkoutSession.payment_intent === 'string'
            ? checkoutSession.payment_intent
            : checkoutSession.payment_intent?.id,
        rawPayload: {
          source: 'stripe_webhook',
          event,
        },
      });
    }

    if (event.type === 'checkout.session.expired') {
      const checkoutSession = event.data.object as Stripe.Checkout.Session;

      if (checkoutSession.metadata?.product === 'ai-studio') {
        await prisma.aiStudioPlanPurchase.updateMany({
          where: {
            provider: 'stripe',
            providerCheckoutSessionId: checkoutSession.id,
            status: 'created',
          },
          data: {
            status: 'failed',
            rawPayloadJson: JSON.stringify({
              source: 'stripe_webhook',
              event,
            }),
          },
        });
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('[ai-studio-stripe-webhook] Failed to process webhook:', error);
    return NextResponse.json({ error: 'Failed to process Stripe webhook' }, { status: 400 });
  }
}
