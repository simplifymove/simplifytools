import { NextRequest, NextResponse } from 'next/server';
import { fulfillAiStudioRazorpayPurchase } from '@/lib/ai-studio/payments';
import { verifyRazorpayWebhookSignature } from '@/lib/billing/razorpay';
import { prisma } from '@/lib/prisma';

interface RazorpayWebhookEntity<T> {
  entity?: T;
}

interface RazorpayWebhookPayment {
  id?: string;
  order_id?: string;
  status?: string;
  amount?: number;
  currency?: string;
  notes?: Record<string, string>;
}

interface RazorpayWebhookOrder {
  id?: string;
  amount?: number;
  currency?: string;
  notes?: Record<string, string>;
}

interface RazorpayWebhookPayload {
  event?: string;
  payload?: {
    payment?: RazorpayWebhookEntity<RazorpayWebhookPayment> | RazorpayWebhookPayment;
    order?: RazorpayWebhookEntity<RazorpayWebhookOrder> | RazorpayWebhookOrder;
  };
}

function unwrapEntity<T>(value: RazorpayWebhookEntity<T> | T | undefined): T | undefined {
  if (!value) {
    return undefined;
  }

  if (typeof value === 'object' && 'entity' in value) {
    return value.entity;
  }

  return value as T;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-razorpay-signature');

    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error('[ai-studio-razorpay-webhook] RAZORPAY_WEBHOOK_SECRET not configured');
      return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
    }

    const isValid = verifyRazorpayWebhookSignature(webhookSecret, body, signature);

    if (!isValid) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const payload = JSON.parse(body) as RazorpayWebhookPayload;
    const payment = unwrapEntity(payload.payload?.payment);
    const order = unwrapEntity(payload.payload?.order);
    const orderId = order?.id || payment?.order_id || '';
    const paymentId = payment?.id;
    const product = order?.notes?.product || payment?.notes?.product;

    if (!orderId || product !== 'ai-studio') {
      return NextResponse.json({ status: 'ignored' });
    }

    if (payload.event === 'payment.captured' || payload.event === 'payment.authorized') {
      await fulfillAiStudioRazorpayPurchase({
        providerOrderId: orderId,
        providerPaymentId: paymentId,
        rawPayload: {
          source: 'razorpay_webhook',
          body: payload,
        },
      });
    }

    if (payload.event === 'payment.failed') {
      await prisma.aiStudioPlanPurchase.updateMany({
        where: {
          provider: 'razorpay',
          providerOrderId: orderId,
          status: 'created',
        },
        data: {
          status: 'failed',
          providerPaymentId: paymentId,
          rawPayloadJson: JSON.stringify({
            source: 'razorpay_webhook',
            body: payload,
          }),
        },
      });
    }

    return NextResponse.json({ status: 'success' });
  } catch (error) {
    console.error('[ai-studio-razorpay-webhook] Failed to process webhook:', error);
    return NextResponse.json({ error: 'Failed to process AI Studio payment webhook' }, { status: 500 });
  }
}
