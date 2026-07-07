import type { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { getOpenRouterPricingSource } from '@/lib/ai-studio/openrouter-pricing';
import { AiStudioAdminClient } from './AiStudioAdminClient';

export const metadata: Metadata = {
  title: 'AI Studio Admin | SimplifyConvert',
  description:
    'Admin management for AI Studio wallets, credits, transactions and usage.',
};

export const dynamic = 'force-dynamic';

interface AiStudioAdminPageProps {
  searchParams?: Promise<{
    q?: string;
  }>;
}

function toNumber(
  value: { toNumber: () => number } | number | null | undefined,
) {
  if (typeof value === 'number') return value;
  return value?.toNumber() ?? 0;
}

function formatCredits(value: number) {
  return value.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

function formatMoneyByCurrency(
  rows: Array<{
    currency: string;
    _sum: { platformRevenueMinor: number | null };
  }>,
) {
  const inr =
    rows.find((row) => row.currency === 'INR')?._sum.platformRevenueMinor ?? 0;
  const usd =
    rows.find((row) => row.currency === 'USD')?._sum.platformRevenueMinor ?? 0;

  if (inr === 0 && usd === 0) {
    return '₹0 / $0';
  }

  return `₹${(inr / 100).toLocaleString('en-IN', { maximumFractionDigits: 0 })} / $${(usd / 100).toFixed(2)}`;
}

function formatUsd(value: number | null | undefined) {
  if (value == null) {
    return 'Unknown';
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 4,
    maximumFractionDigits: 6,
  }).format(value);
}

function formatMoneyMinor(amountMinor: number, currency: string) {
  return new Intl.NumberFormat(currency === 'INR' ? 'en-IN' : 'en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: currency === 'INR' ? 0 : 2,
  }).format(amountMinor / 100);
}

function formatCurrencyTotals(totals: Map<string, number>) {
  if (totals.size === 0) {
    return '$0';
  }

  return Array.from(totals.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([currency, amountMinor]) => formatMoneyMinor(amountMinor, currency))
    .join(' / ');
}

function formatCurrencyTotalsFromRows(
  rows: Array<{ currency: string; _sum: { grossAmountMinor: number | null } }>,
) {
  const totals = new Map<string, number>();

  rows.forEach((row) => {
    totals.set(row.currency, row._sum.grossAmountMinor ?? 0);
  });

  return formatCurrencyTotals(totals);
}

function formatPercent(value: number | null | undefined) {
  if (value == null || !Number.isFinite(value)) {
    return 'Unknown';
  }

  return `${value.toFixed(2)}%`;
}

function addMinorAmount(
  target: Map<string, number>,
  currency: string,
  amountMinor: number,
) {
  target.set(currency, (target.get(currency) ?? 0) + amountMinor);
}

function formatPlanName(planId: string) {
  return planId
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(' ');
}

export default async function AiStudioAdminPage({
  searchParams,
}: AiStudioAdminPageProps) {
  const resolvedSearchParams = await searchParams;
  const query =
    typeof resolvedSearchParams?.q === 'string'
      ? resolvedSearchParams.q.trim()
      : '';
  const now = new Date();
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const startOfLast30Days = new Date(startOfToday);
  startOfLast30Days.setDate(startOfLast30Days.getDate() - 29);
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
    totalOpenRouterCost,
    todayOpenRouterCost,
    monthOpenRouterCost,
    successfulOpenRouterCost,
    successfulKnownCostGenerations,
    failedGenerationsCount,
    costByModel,
    revenueTotals,
    revenueTodayTotals,
    revenueMonthTotals,
    revenueYearTotals,
    successfulPurchasesCount,
    failedPurchasesCount,
    refundCount,
    paidPurchasesForAnalytics,
    recentPurchases,
    payingUserGroups,
    newPayingUsersThisMonth,
    repeatCustomerGroups,
    topCustomerGroups,
    creditsPurchasedTotal,
    outstandingWalletCredits,
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
    prisma.aiStudioUsageLog.aggregate({
      _sum: {
        providerCostUsd: true,
      },
      where: {
        provider: 'openrouter',
        providerCostUsd: { not: null },
      },
    }),
    prisma.aiStudioUsageLog.aggregate({
      _sum: {
        providerCostUsd: true,
      },
      where: {
        provider: 'openrouter',
        providerCostUsd: { not: null },
        createdAt: { gte: startOfToday },
      },
    }),
    prisma.aiStudioUsageLog.aggregate({
      _sum: {
        providerCostUsd: true,
      },
      where: {
        provider: 'openrouter',
        providerCostUsd: { not: null },
        createdAt: { gte: startOfMonth },
      },
    }),
    prisma.aiStudioUsageLog.aggregate({
      _sum: {
        providerCostUsd: true,
      },
      where: {
        provider: 'openrouter',
        status: 'success',
        providerCostUsd: { not: null },
      },
    }),
    prisma.aiStudioUsageLog.count({
      where: {
        provider: 'openrouter',
        status: 'success',
        providerCostUsd: { not: null },
      },
    }),
    prisma.aiStudioUsageLog.count({
      where: {
        status: 'failed',
      },
    }),
    prisma.aiStudioUsageLog.groupBy({
      by: ['model'],
      where: {
        provider: 'openrouter',
      },
      _count: {
        id: true,
      },
      _sum: {
        providerCostUsd: true,
        inputTokens: true,
        outputTokens: true,
        totalTokens: true,
      },
      orderBy: {
        _sum: {
          providerCostUsd: 'desc',
        },
      },
      take: 20,
    }),
    prisma.aiStudioPlanPurchase.groupBy({
      by: ['currency'],
      where: { status: 'paid' },
      _sum: { grossAmountMinor: true },
    }),
    prisma.aiStudioPlanPurchase.groupBy({
      by: ['currency'],
      where: {
        status: 'paid',
        paidAt: { gte: startOfToday },
      },
      _sum: { grossAmountMinor: true },
    }),
    prisma.aiStudioPlanPurchase.groupBy({
      by: ['currency'],
      where: {
        status: 'paid',
        paidAt: { gte: startOfMonth },
      },
      _sum: { grossAmountMinor: true },
    }),
    prisma.aiStudioPlanPurchase.groupBy({
      by: ['currency'],
      where: {
        status: 'paid',
        paidAt: { gte: startOfYear },
      },
      _sum: { grossAmountMinor: true },
    }),
    prisma.aiStudioPlanPurchase.count({
      where: { status: 'paid' },
    }),
    prisma.aiStudioPlanPurchase.count({
      where: { status: 'failed' },
    }),
    prisma.aiStudioPlanPurchase.count({
      where: { status: 'refunded' },
    }),
    prisma.aiStudioPlanPurchase.findMany({
      where: { status: 'paid' },
      select: {
        id: true,
        userId: true,
        planId: true,
        provider: true,
        currency: true,
        grossAmountMinor: true,
        creditsGranted: true,
        paidAt: true,
        createdAt: true,
      },
      orderBy: { paidAt: 'desc' },
    }),
    prisma.aiStudioPlanPurchase.findMany({
      orderBy: { createdAt: 'desc' },
      take: 25,
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    }),
    prisma.aiStudioPlanPurchase.groupBy({
      by: ['userId'],
      where: { status: 'paid' },
      _count: { id: true },
    }),
    prisma.aiStudioPlanPurchase.groupBy({
      by: ['userId'],
      where: {
        status: 'paid',
        paidAt: { gte: startOfMonth },
      },
      _min: { paidAt: true },
    }),
    prisma.aiStudioPlanPurchase.groupBy({
      by: ['userId'],
      where: { status: 'paid' },
      _count: { id: true },
      having: {
        id: {
          _count: {
            gt: 1,
          },
        },
      },
    }),
    prisma.aiStudioPlanPurchase.groupBy({
      by: ['userId', 'currency'],
      where: { status: 'paid' },
      _sum: {
        grossAmountMinor: true,
        creditsGranted: true,
      },
      _count: {
        id: true,
      },
    }),
    prisma.aiStudioPlanPurchase.aggregate({
      _sum: {
        creditsGranted: true,
      },
      where: { status: 'paid' },
    }),
    prisma.aiStudioWallet.aggregate({
      _sum: {
        balanceCredits: true,
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
    latestUsageByUser.map((item) => [item.userId, item.createdAt] as const),
  );

  const metrics = [
    {
      label: 'Total AI Wallets',
      value: totalWallets.toLocaleString(),
      detail: 'Wallet rows in AiStudioWallet',
    },
    {
      label: 'Total AI Credits Issued',
      value: formatCredits(
        toNumber(walletCreditTotals._sum.lifetimeCreditsAdded),
      ),
      detail: 'Lifetime credits added',
    },
    {
      label: 'Total AI Credits Used',
      value: formatCredits(
        toNumber(walletCreditTotals._sum.lifetimeCreditsUsed),
      ),
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

  const totalCost = toNumber(totalOpenRouterCost._sum.providerCostUsd);
  const successfulKnownCost = toNumber(
    successfulOpenRouterCost._sum.providerCostUsd,
  );
  const successfulKnownCostCount = successfulKnownCostGenerations || 0;
  const averageSuccessfulCost =
    successfulKnownCostCount > 0
      ? successfulKnownCost / successfulKnownCostCount
      : null;

  const costSummary = {
    totalEstimatedCostUsd: formatUsd(totalCost),
    costTodayUsd: formatUsd(toNumber(todayOpenRouterCost._sum.providerCostUsd)),
    costThisMonthUsd: formatUsd(
      toNumber(monthOpenRouterCost._sum.providerCostUsd),
    ),
    failedGenerationsCount: failedGenerationsCount.toLocaleString(),
    averageCostPerSuccessfulGenerationUsd: formatUsd(averageSuccessfulCost),
    pricingSource: getOpenRouterPricingSource(),
  };

  const modelCostRows = costByModel.map((row) => ({
    model: row.model,
    estimatedCostUsd: row._sum.providerCostUsd
      ? formatUsd(toNumber(row._sum.providerCostUsd))
      : 'Unknown',
    inputTokens: row._sum.inputTokens ?? 0,
    outputTokens: row._sum.outputTokens ?? 0,
    totalTokens:
      row._sum.totalTokens ??
      (row._sum.inputTokens ?? 0) + (row._sum.outputTokens ?? 0),
    generations: row._count.id,
  }));

  const paidUserIds = new Set(payingUserGroups.map((row) => row.userId));
  const firstPurchaseByUser = new Map<string, Date>();
  paidPurchasesForAnalytics.forEach((purchase) => {
    const purchaseDate = purchase.paidAt ?? purchase.createdAt;
    const current = firstPurchaseByUser.get(purchase.userId);

    if (!current || purchaseDate < current) {
      firstPurchaseByUser.set(purchase.userId, purchaseDate);
    }
  });

  const actualNewPayingUsersThisMonth = newPayingUsersThisMonth.filter(
    (row) => {
      const firstPurchaseDate =
        firstPurchaseByUser.get(row.userId) ?? row._min.paidAt;
      return Boolean(firstPurchaseDate && firstPurchaseDate >= startOfMonth);
    },
  ).length;

  const aovTotals = new Map<string, number>();
  revenueTotals.forEach((row) => {
    aovTotals.set(
      row.currency,
      successfulPurchasesCount > 0
        ? Math.round(
            (row._sum.grossAmountMinor ?? 0) / successfulPurchasesCount,
          )
        : 0,
    );
  });

  const revenueByDay = new Map<string, Map<string, number>>();
  const revenueByMonth = new Map<string, Map<string, number>>();
  const purchasesByPlan = new Map<
    string,
    {
      planId: string;
      purchases: number;
      revenue: Map<string, number>;
      creditsSold: number;
    }
  >();
  const purchasesByProvider = new Map<
    string,
    { provider: string; purchases: number; revenue: Map<string, number> }
  >();

  paidPurchasesForAnalytics.forEach((purchase) => {
    const purchaseDate = purchase.paidAt ?? purchase.createdAt;
    const dayKey = purchaseDate.toISOString().slice(0, 10);
    const monthKey = purchaseDate.toISOString().slice(0, 7);

    if (purchaseDate >= startOfLast30Days) {
      const dayTotals = revenueByDay.get(dayKey) ?? new Map<string, number>();
      addMinorAmount(dayTotals, purchase.currency, purchase.grossAmountMinor);
      revenueByDay.set(dayKey, dayTotals);
    }

    const monthTotals =
      revenueByMonth.get(monthKey) ?? new Map<string, number>();
    addMinorAmount(monthTotals, purchase.currency, purchase.grossAmountMinor);
    revenueByMonth.set(monthKey, monthTotals);

    const planRow = purchasesByPlan.get(purchase.planId) ?? {
      planId: purchase.planId,
      purchases: 0,
      revenue: new Map<string, number>(),
      creditsSold: 0,
    };
    planRow.purchases += 1;
    planRow.creditsSold += toNumber(purchase.creditsGranted);
    addMinorAmount(
      planRow.revenue,
      purchase.currency,
      purchase.grossAmountMinor,
    );
    purchasesByPlan.set(purchase.planId, planRow);

    const providerRow = purchasesByProvider.get(purchase.provider) ?? {
      provider: purchase.provider,
      purchases: 0,
      revenue: new Map<string, number>(),
    };
    providerRow.purchases += 1;
    addMinorAmount(
      providerRow.revenue,
      purchase.currency,
      purchase.grossAmountMinor,
    );
    purchasesByProvider.set(purchase.provider, providerRow);
  });

  const topCustomersByUser = new Map<
    string,
    {
      userId: string;
      purchases: number;
      totalSpent: Map<string, number>;
      creditsPurchased: number;
      sortTotalMinor: number;
    }
  >();
  topCustomerGroups.forEach((row) => {
    const customer = topCustomersByUser.get(row.userId) ?? {
      userId: row.userId,
      purchases: 0,
      totalSpent: new Map<string, number>(),
      creditsPurchased: 0,
      sortTotalMinor: 0,
    };

    customer.purchases += row._count.id;
    customer.creditsPurchased += toNumber(row._sum.creditsGranted);
    customer.sortTotalMinor += row._sum.grossAmountMinor ?? 0;
    addMinorAmount(
      customer.totalSpent,
      row.currency,
      row._sum.grossAmountMinor ?? 0,
    );
    topCustomersByUser.set(row.userId, customer);
  });

  const topCustomerRecords = Array.from(topCustomersByUser.values())
    .sort((a, b) => b.sortTotalMinor - a.sortTotalMinor)
    .slice(0, 10);
  const topCustomerUsers = topCustomerRecords.length
    ? await prisma.user.findMany({
        where: { id: { in: topCustomerRecords.map((row) => row.userId) } },
        select: {
          id: true,
          name: true,
          email: true,
        },
      })
    : [];
  const topCustomerUserById = new Map(
    topCustomerUsers.map((user) => [user.id, user] as const),
  );

  const usdRevenueMinor =
    revenueTotals.find((row) => row.currency === 'USD')?._sum
      .grossAmountMinor ?? 0;
  const usdRevenue = usdRevenueMinor / 100;
  const estimatedGrossProfit = usdRevenue > 0 ? usdRevenue - totalCost : null;
  const aiCostPercent = usdRevenue > 0 ? (totalCost / usdRevenue) * 100 : null;
  const successfulGenerationCount = totalPresentationsGenerated || 0;
  const averageRevenuePerGeneration =
    usdRevenue > 0 && successfulGenerationCount > 0
      ? usdRevenue / successfulGenerationCount
      : null;
  const averageAiCostPerGeneration =
    successfulGenerationCount > 0
      ? totalCost / successfulGenerationCount
      : null;

  const revenueAnalytics = {
    summary: [
      {
        label: 'Total Revenue',
        value: formatCurrencyTotalsFromRows(revenueTotals),
        detail: 'Successful paid purchases',
      },
      {
        label: 'Revenue Today',
        value: formatCurrencyTotalsFromRows(revenueTodayTotals),
        detail: 'Paid purchases since local midnight',
      },
      {
        label: 'Revenue This Month',
        value: formatCurrencyTotalsFromRows(revenueMonthTotals),
        detail: 'Paid purchases this calendar month',
      },
      {
        label: 'Revenue This Year',
        value: formatCurrencyTotalsFromRows(revenueYearTotals),
        detail: 'Paid purchases this calendar year',
      },
      {
        label: 'Average Order Value',
        value: formatCurrencyTotals(aovTotals),
        detail: 'Successful purchases only',
      },
      {
        label: 'Successful Purchases',
        value: successfulPurchasesCount.toLocaleString(),
        detail: 'Paid purchase rows',
      },
      {
        label: 'Failed Purchases',
        value: failedPurchasesCount.toLocaleString(),
        detail: 'Failed checkout rows',
      },
      {
        label: 'Refund Count',
        value: refundCount.toLocaleString(),
        detail: 'Future-ready refunded rows',
      },
    ],
    sales: {
      revenueByDay: Array.from(revenueByDay.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([period, totals]) => ({
          period,
          revenue: formatCurrencyTotals(totals),
        })),
      revenueByMonth: Array.from(revenueByMonth.entries())
        .sort(([a], [b]) => b.localeCompare(a))
        .slice(0, 12)
        .map(([period, totals]) => ({
          period,
          revenue: formatCurrencyTotals(totals),
        })),
      purchasesByPlan: Array.from(purchasesByPlan.values())
        .sort((a, b) => b.purchases - a.purchases)
        .map((row) => ({
          plan: formatPlanName(row.planId),
          purchases: row.purchases,
          revenue: formatCurrencyTotals(row.revenue),
          creditsSold: formatCredits(row.creditsSold),
        })),
      purchasesByProvider: Array.from(purchasesByProvider.values())
        .sort((a, b) => b.purchases - a.purchases)
        .map((row) => ({
          provider: formatPlanName(row.provider),
          purchases: row.purchases,
          revenue: formatCurrencyTotals(row.revenue),
        })),
    },
    userSummary: [
      {
        label: 'Total Paying Users',
        value: paidUserIds.size.toLocaleString(),
        detail: 'Users with at least one paid purchase',
      },
      {
        label: 'New Paying Users This Month',
        value: actualNewPayingUsersThisMonth.toLocaleString(),
        detail: 'First paid purchase this month',
      },
      {
        label: 'Repeat Customers',
        value: repeatCustomerGroups.length.toLocaleString(),
        detail: 'Users with 2+ paid purchases',
      },
      {
        label: 'Total Credits Purchased',
        value: formatCredits(
          toNumber(creditsPurchasedTotal._sum.creditsGranted),
        ),
        detail: 'Credits from paid purchases',
      },
      {
        label: 'Total Credits Consumed',
        value: formatCredits(
          toNumber(walletCreditTotals._sum.lifetimeCreditsUsed),
        ),
        detail: 'Lifetime captured usage',
      },
      {
        label: 'Outstanding Wallet Credits',
        value: formatCredits(
          toNumber(outstandingWalletCredits._sum.balanceCredits),
        ),
        detail: 'Current spendable wallet balance',
      },
    ],
    profit: [
      {
        label: 'Total Revenue',
        value: formatMoneyMinor(usdRevenueMinor, 'USD'),
        detail: 'USD revenue only for profit comparison',
      },
      {
        label: 'Estimated AI Cost',
        value: formatUsd(totalCost),
        detail: 'Known OpenRouter usage',
      },
      {
        label: 'Estimated Gross Profit',
        value: formatUsd(estimatedGrossProfit),
        detail: 'USD revenue minus estimated AI cost',
      },
      {
        label: 'AI Cost %',
        value: formatPercent(aiCostPercent),
        detail: 'Estimated AI cost / USD revenue',
      },
      {
        label: 'Avg Revenue / Generation',
        value: formatUsd(averageRevenuePerGeneration),
        detail: 'USD revenue over successful generations',
      },
      {
        label: 'Avg AI Cost / Generation',
        value: formatUsd(averageAiCostPerGeneration),
        detail: 'Known AI cost over successful generations',
      },
    ],
    recentPurchases: recentPurchases.map((purchase) => ({
      id: purchase.id,
      userName: purchase.user.name || 'Unnamed user',
      userEmail: purchase.user.email || 'No email',
      plan: formatPlanName(purchase.planId),
      provider: formatPlanName(purchase.provider),
      amount: formatMoneyMinor(purchase.grossAmountMinor, purchase.currency),
      credits: formatCredits(toNumber(purchase.creditsGranted)),
      status: purchase.status,
      purchaseDate: (purchase.paidAt ?? purchase.createdAt).toISOString(),
    })),
    topCustomers: topCustomerRecords.map((customer) => {
      const user = topCustomerUserById.get(customer.userId);

      return {
        userId: customer.userId,
        userName: user?.name || 'Unnamed user',
        userEmail: user?.email || 'No email',
        purchases: customer.purchases,
        totalSpent: formatCurrencyTotals(customer.totalSpent),
        creditsPurchased: formatCredits(customer.creditsPurchased),
      };
    }),
  };

  const walletRows = wallets.map((wallet) => {
    const latestTransactionDate = wallet.transactions[0]?.createdAt;
    const latestUsageDate = latestUsageDateByUserId.get(wallet.userId);
    const lastActivity = [
      wallet.updatedAt,
      latestTransactionDate,
      latestUsageDate,
    ]
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
    reason:
      transaction.description ||
      transaction.referenceType ||
      'No reason recorded',
    date: transaction.createdAt.toISOString(),
  }));

  const usageRows = usage.map((item) => ({
    id: item.id,
    userName: item.user.name || 'Unnamed user',
    userEmail: item.user.email || 'No email',
    toolType: item.toolType,
    topic: item.topic || 'Untitled presentation',
    slideCount: item.slideCount,
    creditsCharged: toNumber(item.actualCredits ?? item.estimatedCredits),
    model: item.model,
    inputTokens: item.inputTokens,
    outputTokens: item.outputTokens,
    totalTokens: item.totalTokens,
    provider: item.provider || 'Unknown',
    providerCostUsd: item.providerCostUsd
      ? formatUsd(toNumber(item.providerCostUsd))
      : 'Unknown',
    status: item.status,
    date: item.createdAt.toISOString(),
  }));

  return (
    <AiStudioAdminClient
      metrics={metrics}
      wallets={walletRows}
      transactions={transactionRows}
      usage={usageRows}
      costSummary={costSummary}
      modelCosts={modelCostRows}
      revenueAnalytics={revenueAnalytics}
      initialSearch={query}
    />
  );
}
