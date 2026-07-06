import type { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { AiStudioAdminClient } from './AiStudioAdminClient';

export const metadata: Metadata = {
  title: 'AI Studio Admin | SimplifyConvert',
  description: 'Admin management for AI Studio wallets, credits, transactions and usage.',
};

export const dynamic = 'force-dynamic';

interface AiStudioAdminPageProps {
  searchParams?: Promise<{
    q?: string;
  }>;
}

function toNumber(value: { toNumber: () => number } | number | null | undefined) {
  if (typeof value === 'number') return value;
  return value?.toNumber() ?? 0;
}

function formatCredits(value: number) {
  return value.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

function formatMoneyByCurrency(rows: Array<{ currency: string; _sum: { platformRevenueMinor: number | null } }>) {
  const inr = rows.find((row) => row.currency === 'INR')?._sum.platformRevenueMinor ?? 0;
  const usd = rows.find((row) => row.currency === 'USD')?._sum.platformRevenueMinor ?? 0;

  if (inr === 0 && usd === 0) {
    return '₹0 / $0';
  }

  return `₹${(inr / 100).toLocaleString('en-IN', { maximumFractionDigits: 0 })} / $${(usd / 100).toFixed(2)}`;
}

export default async function AiStudioAdminPage({ searchParams }: AiStudioAdminPageProps) {
  const resolvedSearchParams = await searchParams;
  const query = typeof resolvedSearchParams?.q === 'string' ? resolvedSearchParams.q.trim() : '';
  const walletWhere = query
    ? {
        user: {
          OR: [
            { email: { contains: query, mode: 'insensitive' as const } },
            { name: { contains: query, mode: 'insensitive' as const } },
          ],
        },
      }
    : {};

  const [
    totalWallets,
    walletCreditTotals,
    totalPresentationsGenerated,
    revenueByCurrency,
    wallets,
    transactions,
    usage,
  ] = await Promise.all([
    prisma.aiStudioWallet.count(),
    prisma.aiStudioWallet.aggregate({
      _sum: {
        lifetimeCreditsAdded: true,
        lifetimeCreditsUsed: true,
      },
    }),
    prisma.aiStudioUsageLog.count({
      where: { status: 'success' },
    }),
    prisma.aiStudioPlanPurchase.groupBy({
      by: ['currency'],
      where: { status: 'paid' },
      _sum: { platformRevenueMinor: true },
    }),
    prisma.aiStudioWallet.findMany({
      where: walletWhere,
      orderBy: { updatedAt: 'desc' },
      take: 50,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: { createdAt: true },
        },
      },
    }),
    prisma.aiStudioCreditTransaction.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    }),
    prisma.aiStudioUsageLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    }),
  ]);

  const userIds = wallets.map((wallet) => wallet.userId);
  const latestUsageByUser = userIds.length
    ? await prisma.aiStudioUsageLog.findMany({
        where: { userId: { in: userIds } },
        orderBy: { createdAt: 'desc' },
        distinct: ['userId'],
        select: {
          userId: true,
          createdAt: true,
        },
      })
    : [];
  const latestUsageDateByUserId = new Map(
    latestUsageByUser.map((item) => [item.userId, item.createdAt] as const)
  );

  const metrics = [
    {
      label: 'Total AI Wallets',
      value: totalWallets.toLocaleString(),
      detail: 'Wallet rows in AiStudioWallet',
    },
    {
      label: 'Total AI Credits Issued',
      value: formatCredits(toNumber(walletCreditTotals._sum.lifetimeCreditsAdded)),
      detail: 'Lifetime credits added',
    },
    {
      label: 'Total AI Credits Used',
      value: formatCredits(toNumber(walletCreditTotals._sum.lifetimeCreditsUsed)),
      detail: 'Lifetime credits captured',
    },
    {
      label: 'Total Presentations Generated',
      value: totalPresentationsGenerated.toLocaleString(),
      detail: 'Successful AI Studio generations',
    },
    {
      label: 'Total Revenue',
      value: formatMoneyByCurrency(revenueByCurrency),
      detail: 'Future-ready paid plan revenue',
    },
  ];

  const walletRows = wallets.map((wallet) => {
    const latestTransactionDate = wallet.transactions[0]?.createdAt;
    const latestUsageDate = latestUsageDateByUserId.get(wallet.userId);
    const lastActivity = [wallet.updatedAt, latestTransactionDate, latestUsageDate]
      .filter((date): date is Date => date instanceof Date)
      .sort((a, b) => b.getTime() - a.getTime())[0];

    return {
      id: wallet.id,
      userId: wallet.userId,
      userName: wallet.user.name || 'Unnamed user',
      userEmail: wallet.user.email || 'No email',
      balanceCredits: toNumber(wallet.balanceCredits),
      lifetimeCreditsAdded: toNumber(wallet.lifetimeCreditsAdded),
      lifetimeCreditsUsed: toNumber(wallet.lifetimeCreditsUsed),
      lastActivity: (lastActivity ?? wallet.updatedAt).toISOString(),
    };
  });

  const transactionRows = transactions.map((transaction) => ({
    id: transaction.id,
    userName: transaction.user.name || 'Unnamed user',
    userEmail: transaction.user.email || 'No email',
    type: transaction.type,
    amountCredits: toNumber(transaction.amountCredits),
    reason: transaction.description || transaction.referenceType || 'No reason recorded',
    date: transaction.createdAt.toISOString(),
  }));

  const usageRows = usage.map((item) => ({
    id: item.id,
    userName: item.user.name || 'Unnamed user',
    userEmail: item.user.email || 'No email',
    topic: item.topic || 'Untitled presentation',
    slideCount: item.slideCount,
    creditsCharged: toNumber(item.actualCredits ?? item.estimatedCredits),
    model: item.model,
    inputTokens: item.inputTokens,
    outputTokens: item.outputTokens,
    status: item.status,
    date: item.createdAt.toISOString(),
  }));

  return (
    <AiStudioAdminClient
      metrics={metrics}
      wallets={walletRows}
      transactions={transactionRows}
      usage={usageRows}
      initialSearch={query}
    />
  );
}
