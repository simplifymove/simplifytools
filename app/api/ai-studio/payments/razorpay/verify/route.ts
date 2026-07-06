import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { fulfillAiStudioRazorpayPurchase } from '@/lib/ai-studio/payments';
import { findAiStudioUserByEmail } from '@/lib/ai-studio/user';
import { serializeAiStudioWallet } from '@/lib/ai-studio/wallet';
import { verifyRazorpayPaymentSignature } from '@/lib/billing/razorpay';
import { prisma } from '@/lib/prisma';

interface VerifyAiStudioRazorpayPaymentRequest {
  razorpay_order_id?: unknown;
  razorpay_payment_id?: unknown;
  razorpay_signature?: unknown;
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

    const body = (await request.json().catch(() => ({}))) as VerifyAiStudioRazorpayPaymentRequest;
    const orderId = typeof body.razorpay_order_id === 'string' ? body.razorpay_order_id : '';
    const paymentId = typeof body.razorpay_payment_id === 'string' ? body.razorpay_payment_id : '';
    const signature = typeof body.razorpay_signature === 'string' ? body.razorpay_signature : '';

    if (!orderId || !paymentId || !signature) {
      return NextResponse.json({ error: 'Missing payment verification details' }, { status: 400 });
    }

    const purchase = await prisma.aiStudioPlanPurchase.findFirst({
      where: {
        provider: 'razorpay',
        providerOrderId: orderId,
        userId: user.id,
      },
    });

    if (!purchase) {
      return NextResponse.json({ error: 'Payment order not found' }, { status: 404 });
    }

    const isValid = verifyRazorpayPaymentSignature(orderId, paymentId, signature);

    if (!isValid) {
      return NextResponse.json({ error: 'Payment verification failed' }, { status: 400 });
    }

    const fulfilled = await fulfillAiStudioRazorpayPurchase({
      providerOrderId: orderId,
      providerPaymentId: paymentId,
      rawPayload: {
        source: 'checkout_verify',
        body,
      },
    });

    return NextResponse.json({
      success: true,
      alreadyPaid: fulfilled.alreadyPaid,
      creditsGranted: fulfilled.purchase.creditsGranted.toNumber(),
      wallet: fulfilled.wallet ? serializeAiStudioWallet(fulfilled.wallet) : null,
    });
  } catch (error) {
    console.error('[ai-studio-razorpay-verify] Failed to verify payment:', error);
    return NextResponse.json({ error: 'Failed to verify AI Studio payment' }, { status: 500 });
  }
}
