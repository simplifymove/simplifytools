import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';

export class AiStudioInsufficientCreditsError extends Error {
  constructor(message = 'Insufficient AI Studio credits') {
    super(message);
    this.name = 'AiStudioInsufficientCreditsError';
  }
}

interface WalletTransactionContext {
  transactionType?: 'purchase' | 'adjustment' | 'refund';
  referenceType?: string;
  referenceId?: string;
  description?: string;
  metadata?: Record<string, unknown>;
}

function toDecimal(amountCredits: number | string | Prisma.Decimal) {
  const amount = new Prisma.Decimal(amountCredits);

  if (amount.isNegative() || amount.isZero()) {
    throw new Error('Credit amount must be greater than zero');
  }

  return amount;
}

function serializeMetadata(metadata?: Record<string, unknown>) {
  return metadata ? JSON.stringify(metadata) : undefined;
}

export async function getOrCreateWallet(userId: string) {
  return prisma.aiStudioWallet.upsert({
    where: { userId },
    update: {},
    create: { userId },
  });
}

export async function addCredits(userId: string, amountCredits: number, context: WalletTransactionContext = {}) {
  const amount = toDecimal(amountCredits);

  return prisma.$transaction(async (tx) => {
    const wallet = await tx.aiStudioWallet.upsert({
      where: { userId },
      update: {
        balanceCredits: { increment: amount },
        lifetimeCreditsAdded: { increment: amount },
      },
      create: {
        userId,
        balanceCredits: amount,
        lifetimeCreditsAdded: amount,
      },
    });

    await tx.aiStudioCreditTransaction.create({
      data: {
        userId,
        walletId: wallet.id,
        type: context.transactionType || 'purchase',
        amountCredits: amount,
        balanceAfter: wallet.balanceCredits,
        referenceType: context.referenceType,
        referenceId: context.referenceId,
        description: context.description,
        metadataJson: serializeMetadata(context.metadata),
      },
    });

    return wallet;
  });
}

export async function reserveCredits(userId: string, amountCredits: number, context: WalletTransactionContext = {}) {
  const amount = toDecimal(amountCredits);
  const wallet = await getOrCreateWallet(userId);

  return prisma.$transaction(async (tx) => {
    const updateResult = await tx.aiStudioWallet.updateMany({
      where: {
        id: wallet.id,
        balanceCredits: { gte: amount },
      },
      data: {
        balanceCredits: { decrement: amount },
        reservedCredits: { increment: amount },
      },
    });

    if (updateResult.count !== 1) {
      throw new AiStudioInsufficientCreditsError();
    }

    const updatedWallet = await tx.aiStudioWallet.findUniqueOrThrow({
      where: { id: wallet.id },
    });

    await tx.aiStudioCreditTransaction.create({
      data: {
        userId,
        walletId: wallet.id,
        type: 'reserve',
        amountCredits: amount.negated(),
        balanceAfter: updatedWallet.balanceCredits,
        referenceType: context.referenceType,
        referenceId: context.referenceId,
        description: context.description,
        metadataJson: serializeMetadata(context.metadata),
      },
    });

    return updatedWallet;
  });
}

export async function captureCredits(userId: string, amountCredits: number, context: WalletTransactionContext = {}) {
  const amount = toDecimal(amountCredits);
  const wallet = await getOrCreateWallet(userId);

  return prisma.$transaction(async (tx) => {
    const updateResult = await tx.aiStudioWallet.updateMany({
      where: {
        id: wallet.id,
        reservedCredits: { gte: amount },
      },
      data: {
        reservedCredits: { decrement: amount },
        lifetimeCreditsUsed: { increment: amount },
      },
    });

    if (updateResult.count !== 1) {
      throw new AiStudioInsufficientCreditsError('Insufficient reserved AI Studio credits');
    }

    const updatedWallet = await tx.aiStudioWallet.findUniqueOrThrow({
      where: { id: wallet.id },
    });

    await tx.aiStudioCreditTransaction.create({
      data: {
        userId,
        walletId: wallet.id,
        type: 'capture',
        amountCredits: amount.negated(),
        balanceAfter: updatedWallet.balanceCredits,
        referenceType: context.referenceType,
        referenceId: context.referenceId,
        description: context.description,
        metadataJson: serializeMetadata(context.metadata),
      },
    });

    return updatedWallet;
  });
}

export async function releaseCredits(userId: string, amountCredits: number, context: WalletTransactionContext = {}) {
  const amount = toDecimal(amountCredits);
  const wallet = await getOrCreateWallet(userId);

  return prisma.$transaction(async (tx) => {
    const updateResult = await tx.aiStudioWallet.updateMany({
      where: {
        id: wallet.id,
        reservedCredits: { gte: amount },
      },
      data: {
        balanceCredits: { increment: amount },
        reservedCredits: { decrement: amount },
      },
    });

    if (updateResult.count !== 1) {
      throw new AiStudioInsufficientCreditsError('Insufficient reserved AI Studio credits');
    }

    const updatedWallet = await tx.aiStudioWallet.findUniqueOrThrow({
      where: { id: wallet.id },
    });

    await tx.aiStudioCreditTransaction.create({
      data: {
        userId,
        walletId: wallet.id,
        type: 'release',
        amountCredits: amount,
        balanceAfter: updatedWallet.balanceCredits,
        referenceType: context.referenceType,
        referenceId: context.referenceId,
        description: context.description,
        metadataJson: serializeMetadata(context.metadata),
      },
    });

    return updatedWallet;
  });
}

export function serializeAiStudioWallet(wallet: Awaited<ReturnType<typeof getOrCreateWallet>>) {
  return {
    id: wallet.id,
    balanceCredits: wallet.balanceCredits.toNumber(),
    reservedCredits: wallet.reservedCredits.toNumber(),
    lifetimeCreditsAdded: wallet.lifetimeCreditsAdded.toNumber(),
    lifetimeCreditsUsed: wallet.lifetimeCreditsUsed.toNumber(),
    createdAt: wallet.createdAt.toISOString(),
    updatedAt: wallet.updatedAt.toISOString(),
  };
}
