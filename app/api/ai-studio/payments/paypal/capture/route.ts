import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { fulfillAiStudioPurchase } from '@/lib/ai-studio/payments';
import {
  AiStudioPayPalCaptureValidationError,
  validateAiStudioPayPalCapture,
} from '@/lib/ai-studio/paypal-purchase';
import { findAiStudioUserByEmail } from '@/lib/ai-studio/user';
import { serializeAiStudioWallet } from '@/lib/ai-studio/wallet';
import {
  capturePayPalOrder,
  getPayPalOrder,
  PayPalApiError,
} from '@/lib/billing/paypal';
import { prisma } from '@/lib/prisma';

interface CaptureAiStudioPayPalOrderRequest {
  orderId?: unknown;
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

    const body = (await request.json().catch(() => ({}))) as CaptureAiStudioPayPalOrderRequest;
    const orderId = typeof body.orderId === 'string' ? body.orderId.trim() : '';

    if (!orderId) {
      return NextResponse.json(
        { error: 'PayPal order ID is required' },
        { status: 400 },
      );
    }

    const purchase = await prisma.aiStudioPlanPurchase.findFirst({
      where: {
        provider: 'paypal',
        providerOrderId: orderId,
        userId: user.id,
      },
    });

    if (!purchase) {
      return NextResponse.json(
        { error: 'PayPal purchase not found' },
        { status: 404 },
      );
    }

    if (purchase.status === 'paid') {
      const wallet = await prisma.aiStudioWallet.findUnique({
        where: { userId: purchase.userId },
      });

      return NextResponse.json({
        success: true,
        alreadyPaid: true,
        creditsGranted: purchase.creditsGranted.toNumber(),
        wallet: wallet ? serializeAiStudioWallet(wallet) : null,
      });
    }

    if (purchase.status !== 'created') {
      return NextResponse.json(
        { error: `PayPal purchase cannot be captured from ${purchase.status}` },
        { status: 409 },
      );
    }

    let order;

    try {
      order = await capturePayPalOrder(
        orderId,
        `ai-capture-${purchase.id}`,
      );
    } catch (captureError) {
      try {
        order = await getPayPalOrder(orderId);
      } catch {
        throw captureError;
      }
    }

    const capture = validateAiStudioPayPalCapture(purchase, order);
    const fulfilled = await fulfillAiStudioPurchase({
      provider: 'paypal',
      providerPaymentId: capture.id,
      lookup: {
        providerOrderId: orderId,
      },
      rawPayload: {
        source: 'paypal_capture',
        order,
      },
    });

    return NextResponse.json({
      success: true,
      alreadyPaid: fulfilled.alreadyPaid,
      creditsGranted: fulfilled.purchase.creditsGranted.toNumber(),
      wallet: fulfilled.wallet
        ? serializeAiStudioWallet(fulfilled.wallet)
        : null,
    });
  } catch (error) {
    if (error instanceof AiStudioPayPalCaptureValidationError) {
      return NextResponse.json(
        {
          error: error.message,
          pendingVerification: error.pendingVerification,
        },
        { status: error.pendingVerification ? 409 : 400 },
      );
    }

    const uncertain =
      error instanceof PayPalApiError &&
      (error.code === 'timeout' || error.status === null || error.status >= 500);

    console.error(
      '[ai-studio-paypal-capture] Failed to capture order:',
      error instanceof Error ? error.message : 'Unknown error',
    );
    return NextResponse.json(
      {
        error: uncertain
          ? 'PayPal capture could not be confirmed yet'
          : 'Unable to complete PayPal checkout',
        pendingVerification: uncertain,
      },
      { status: uncertain ? 502 : 500 },
    );
  }
}
