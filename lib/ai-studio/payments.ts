import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';

interface FulfillAiStudioPurchaseOptions {
  providerOrderId: string;
  providerPaymentId?: string;
  rawPayload: unknown;
}

function serializeRawPayload(rawPayload: unknown) {
  return JSON.stringify(rawPayload);
}

export async function fulfillAiStudioRazorpayPurchase({
  providerOrderId,
  providerPaymentId,
  rawPayload,
}: FulfillAiStudioPurchaseOptions) {
  return prisma.$transaction(async (tx) => {
    const purchase = await tx.aiStudioPlanPurchase.findFirst({
      where: {
        provider: 'razorpay',
        providerOrderId,
      },
    });

    if (!purchase) {
      throw new Error('AI Studio purchase not found');
    }

    if (purchase.status === 'paid') {
      const wallet = await tx.aiStudioWallet.findUnique({
        where: { userId: purchase.userId },
      });

      return {
        purchase,
        wallet,
        alreadyPaid: true,
      };
    }

    if (purchase.status !== 'created') {
      throw new Error(`AI Studio purchase cannot be paid from status ${purchase.status}`);
    }

    if (providerPaymentId) {
      const existingPaidPayment = await tx.aiStudioPlanPurchase.findFirst({
        where: {
          provider: 'razorpay',
          providerPaymentId,
          status: 'paid',
        },
      });

      if (existingPaidPayment && existingPaidPayment.id !== purchase.id) {
        throw new Error('Razorpay payment is already linked to another AI Studio purchase');
      }
    }

    const paidUpdate = await tx.aiStudioPlanPurchase.updateMany({
      where: {
        id: purchase.id,
        status: 'created',
      },
      data: {
        status: 'paid',
        providerPaymentId,
        rawPayloadJson: serializeRawPayload(rawPayload),
        paidAt: new Date(),
      },
    });

    if (paidUpdate.count !== 1) {
      const latestPurchase = await tx.aiStudioPlanPurchase.findUniqueOrThrow({
        where: { id: purchase.id },
      });
      const wallet = await tx.aiStudioWallet.findUnique({
        where: { userId: latestPurchase.userId },
      });

      if (latestPurchase.status === 'paid') {
        return {
          purchase: latestPurchase,
          wallet,
          alreadyPaid: true,
        };
      }

      throw new Error(`AI Studio purchase cannot be paid from status ${latestPurchase.status}`);
    }

    const paidPurchase = await tx.aiStudioPlanPurchase.findUniqueOrThrow({
      where: { id: purchase.id },
    });

    const creditsGranted = new Prisma.Decimal(paidPurchase.creditsGranted);
    const wallet = await tx.aiStudioWallet.upsert({
      where: { userId: paidPurchase.userId },
      update: {
        balanceCredits: { increment: creditsGranted },
        lifetimeCreditsAdded: { increment: creditsGranted },
      },
      create: {
        userId: paidPurchase.userId,
        balanceCredits: creditsGranted,
        lifetimeCreditsAdded: creditsGranted,
      },
    });

    await tx.aiStudioCreditTransaction.create({
      data: {
        userId: paidPurchase.userId,
        walletId: wallet.id,
        type: 'purchase',
        amountCredits: creditsGranted,
        balanceAfter: wallet.balanceCredits,
        referenceType: 'ai_studio_plan_purchase',
        referenceId: paidPurchase.id,
        description: `${paidPurchase.planId} purchase`,
        metadataJson: JSON.stringify({
          provider: paidPurchase.provider,
          providerOrderId: paidPurchase.providerOrderId,
          providerPaymentId: paidPurchase.providerPaymentId,
          planId: paidPurchase.planId,
          currency: paidPurchase.currency,
          grossAmountMinor: paidPurchase.grossAmountMinor,
        }),
      },
    });

    return {
      purchase: paidPurchase,
      wallet,
      alreadyPaid: false,
    };
  });
}
