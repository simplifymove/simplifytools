import type { Metadata } from 'next';
import Link from 'next/link';
import { getServerSession } from 'next-auth';
import {
  Activity,
  AlertTriangle,
  ChevronRight,
  Clock,
  CreditCard,
  History,
  Presentation,
  ReceiptText,
  Sparkles,
  WalletCards,
  type LucideIcon,
} from 'lucide-react';
import { HomeHeader } from '@/app/components/HomeHeader';
import { findAiStudioUserByEmail } from '@/lib/ai-studio/user';
import { authOptions } from '@/lib/auth/config';
import { getAiStudioAccessForCurrentUser } from '@/lib/entitlements/ai-studio-server';
import { prisma } from '@/lib/prisma';
import { PremiumAccessRequired } from '../components/PremiumAccessRequired';

export const metadata: Metadata = {
  title: 'AI Studio Billing | SimplifyConvert',
  description:
    'Review AI Studio credit balance, plan purchases, wallet history, and presentation usage.',
  alternates: {
    canonical: 'https://simplifyconvert.com/ai-studio/billing',
  },
};

export const dynamic = 'force-dynamic';

function formatCredits(value: number) {
  return value.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('en', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

function formatMoney(amountMinor: number, currency: string) {
  const majorAmount = amountMinor / 100;

  if (currency === 'INR') {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(majorAmount);
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(majorAmount);
}

function titleCase(value: string) {
  return value
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(' ');
}

function providerLabel(provider: string) {
  return provider === 'razorpay'
    ? 'Razorpay'
    : provider === 'paypal'
      ? 'PayPal'
    : provider === 'stripe'
      ? 'Stripe'
      : titleCase(provider);
}

function purchaseStatusLabel(
  status: string,
  paidAt: Date | null,
  providerPaymentId: string | null,
) {
  if (status === 'paid' || paidAt || providerPaymentId) {
    return 'Paid/Completed';
  }

  if (status === 'created') {
    return 'Created';
  }

  return titleCase(status);
}

function statusBadgeClass(status: string) {
  if (status === 'paid' || status === 'success') {
    return 'bg-emerald-50 text-emerald-800 border-emerald-200';
  }

  if (status === 'created' || status === 'reserved' || status === 'estimated') {
    return 'bg-amber-50 text-amber-800 border-amber-200';
  }

  if (status === 'failed' || status === 'refunded') {
    return 'bg-red-50 text-red-800 border-red-200';
  }

  return 'bg-slate-100 text-slate-700 border-slate-200';
}

function transactionLabel(type: string) {
  const labels: Record<string, string> = {
    adjustment: 'Credit Added',
    reserve: 'Reserved',
    capture: 'Used',
    release: 'Released',
    purchase: 'Purchased',
    refund: 'Refunded',
  };

  return labels[type] || titleCase(type);
}

function transactionTypeClass(amount: number) {
  if (amount > 0) {
    return 'bg-emerald-50 text-emerald-800 border-emerald-200';
  }

  if (amount < 0) {
    return 'bg-red-50 text-red-800 border-red-200';
  }

  return 'bg-slate-100 text-slate-700 border-slate-200';
}

function formatModelName(model: string | null) {
  if (!model) return 'Not recorded';

  return model
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const name = part.split('/').pop() || part;

      return name
        .replace(/[-_]+/g, ' ')
        .replace(/\b\w/g, (char) => char.toUpperCase());
    })
    .join(', ');
}

function formatTokenUsage(
  inputTokens: number | null,
  outputTokens: number | null,
) {
  if (inputTokens == null && outputTokens == null) {
    return null;
  }

  const input = inputTokens ?? 0;
  const output = outputTokens ?? 0;
  const total = input + output;

  return `${total.toLocaleString()} total (${input.toLocaleString()} in / ${output.toLocaleString()} out)`;
}

function formatTotalSpent(
  purchases: Array<{
    currency: string;
    grossAmountMinor: number;
    status: string;
    paidAt: Date | null;
    providerPaymentId: string | null;
  }>,
) {
  const paidTotals = new Map<string, number>();

  purchases.forEach((purchase) => {
    const isPaid =
      purchase.status === 'paid' ||
      Boolean(purchase.paidAt) ||
      Boolean(purchase.providerPaymentId);

    if (!isPaid) return;

    paidTotals.set(
      purchase.currency,
      (paidTotals.get(purchase.currency) || 0) + purchase.grossAmountMinor,
    );
  });

  if (paidTotals.size === 0) {
    return 'No paid purchases';
  }

  return Array.from(paidTotals.entries())
    .map(([currency, amountMinor]) => formatMoney(amountMinor, currency))
    .join(' + ');
}

function EmptyState({
  icon: Icon,
  title,
  detail,
}: {
  icon: LucideIcon;
  title: string;
  detail: string;
}) {
  return (
    <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-white text-slate-500 shadow-sm">
        <Icon size={22} />
      </div>
      <h3 className="text-base font-bold text-slate-950">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">{detail}</p>
    </div>
  );
}

async function getBillingData() {
  try {
    const session = await getServerSession(authOptions);
    const email = session?.user?.email ?? null;

    if (!email) {
      return null;
    }

    const user = await findAiStudioUserByEmail(email);

    if (!user) {
      return null;
    }

    const [wallet, purchases, transactions, usageLogs] = await Promise.all([
      prisma.aiStudioWallet.findUnique({
        where: { userId: user.id },
        select: {
          balanceCredits: true,
          reservedCredits: true,
          lifetimeCreditsAdded: true,
          lifetimeCreditsUsed: true,
          updatedAt: true,
        },
      }),
      prisma.aiStudioPlanPurchase.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        take: 50,
        select: {
          id: true,
          planId: true,
          provider: true,
          providerOrderId: true,
          providerPaymentId: true,
          providerCheckoutSessionId: true,
          currency: true,
          grossAmountMinor: true,
          creditsGranted: true,
          status: true,
          createdAt: true,
          paidAt: true,
        },
      }),
      prisma.aiStudioCreditTransaction.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        take: 100,
        select: {
          id: true,
          type: true,
          amountCredits: true,
          balanceAfter: true,
          description: true,
          createdAt: true,
        },
      }),
      prisma.aiStudioUsageLog.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        take: 100,
        select: {
          id: true,
          topic: true,
          toolType: true,
          slideCount: true,
          model: true,
          status: true,
          actualCredits: true,
          reservedCredits: true,
          estimatedCredits: true,
          inputTokens: true,
          outputTokens: true,
          errorCode: true,
          createdAt: true,
        },
      }),
    ]);

    return {
      wallet,
      purchases,
      transactions,
      usageLogs,
      error: null,
    };
  } catch (error) {
    console.error('[ai-studio-billing] Failed to load billing data:', error);

    return {
      wallet: null,
      purchases: [],
      transactions: [],
      usageLogs: [],
      error:
        'Unable to load billing history right now. Your payment and wallet records are unchanged.',
    };
  }
}

export default async function AiStudioBillingPage() {
  const access = await getAiStudioAccessForCurrentUser();

  if (!access.allowed) {
    return (
      <PremiumAccessRequired
        toolName="AI Studio Billing"
        returnTo="/ai-studio/billing"
      />
    );
  }

  const billing = await getBillingData();

  if (!billing) {
    return (
      <PremiumAccessRequired
        toolName="AI Studio Billing"
        returnTo="/ai-studio/billing"
      />
    );
  }

  const balanceCredits = billing.wallet?.balanceCredits.toNumber() ?? 0;
  const reservedCredits = billing.wallet?.reservedCredits.toNumber() ?? 0;
  const lifetimeCreditsAdded =
    billing.wallet?.lifetimeCreditsAdded.toNumber() ?? 0;
  const lifetimeCreditsUsed =
    billing.wallet?.lifetimeCreditsUsed.toNumber() ?? 0;
  const totalAmountSpent = formatTotalSpent(billing.purchases);

  return (
    <>
      <HomeHeader />
      <main className="min-h-screen bg-[#080a12] text-white">
        <section className="relative overflow-hidden px-4 pt-8 pb-10 sm:px-6 lg:px-8">
          <div className="absolute inset-0 bg-[linear-gradient(135deg,#080a12_0%,#111827_35%,#12343b_70%,#312e81_100%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(103,232,249,0.22),rgba(8,10,18,0)_44%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.10)_0%,rgba(255,255,255,0)_42%,rgba(255,255,255,0.06)_100%)]" />

          <div className="relative z-10 mx-auto max-w-7xl">
            <nav
              className="mb-8 flex items-center gap-2 text-sm text-white/70"
              aria-label="Breadcrumb"
            >
              <Link href="/" className="transition hover:text-white">
                Home
              </Link>
              <ChevronRight size={16} />
              <Link href="/ai-studio" className="transition hover:text-white">
                AI Studio
              </Link>
              <ChevronRight size={16} />
              <span>Billing</span>
            </nav>

            <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-cyan-50 shadow-lg shadow-cyan-950/30 backdrop-blur">
                  <Sparkles size={16} />
                  AI Studio
                  <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-950">
                    Billing
                  </span>
                </div>
                <h1 className="text-4xl font-bold tracking-normal text-white sm:text-5xl">
                  Purchase and Wallet History
                </h1>
                <p className="mt-5 max-w-2xl text-base leading-7 text-white/78 sm:text-lg">
                  Review purchases, current wallet balance, credit movements,
                  and presentation generation usage in one place.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  href="/ai-studio/pricing"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-white px-4 text-sm font-semibold text-slate-950 shadow-lg shadow-black/20 transition hover:bg-cyan-50"
                >
                  <CreditCard size={16} />
                  Buy Credits
                </Link>
                <Link
                  href="/ai-studio/presentation-maker"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-white/20 bg-white/10 px-4 text-sm font-semibold text-white transition hover:bg-white/15"
                >
                  <Presentation size={16} />
                  Create Presentation
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-[#f7f8fb] px-4 py-10 text-slate-950 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[1180px] space-y-8">
            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {[
                {
                  label: 'Current AI Credit Balance',
                  value: formatCredits(balanceCredits),
                  detail: `${formatCredits(reservedCredits)} credits reserved`,
                  icon: WalletCards,
                },
                {
                  label: 'Lifetime Credits Added',
                  value: formatCredits(lifetimeCreditsAdded),
                  detail: 'Purchases and admin adjustments',
                  icon: ReceiptText,
                },
                {
                  label: 'Lifetime Credits Used',
                  value: formatCredits(lifetimeCreditsUsed),
                  detail: 'Captured successful usage',
                  icon: Activity,
                },
                {
                  label: 'Total Amount Spent',
                  value: totalAmountSpent,
                  detail: 'Verified paid Razorpay and PayPal purchases',
                  icon: CreditCard,
                },
              ].map((stat) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={stat.label}
                    className="rounded-lg border border-slate-200 bg-white p-5 shadow-lg shadow-slate-200/70"
                  >
                    <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-slate-950 text-cyan-100">
                      <Icon size={22} />
                    </div>
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                      {stat.label}
                    </p>
                    <p className="mt-2 text-2xl font-bold text-slate-950">
                      {stat.value}
                    </p>
                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      {stat.detail}
                    </p>
                  </div>
                );
              })}
            </section>

            {billing.error ? (
              <EmptyState
                icon={AlertTriangle}
                title="Billing history could not be loaded"
                detail={billing.error}
              />
            ) : null}

            <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-lg shadow-slate-200/70">
              <div className="mb-5 flex items-center gap-2">
                <ReceiptText size={20} className="text-cyan-700" />
                <h2 className="text-xl font-bold text-slate-950">
                  Purchase History
                </h2>
              </div>
              {billing.purchases.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-[1120px] w-full text-left text-sm">
                    <thead className="border-b border-slate-200 bg-slate-50 text-xs font-bold uppercase tracking-wide text-slate-500">
                      <tr>
                        <th className="px-4 py-3">Date</th>
                        <th className="px-4 py-3">Plan</th>
                        <th className="px-4 py-3">Provider</th>
                        <th className="px-4 py-3">Amount Paid</th>
                        <th className="px-4 py-3">Currency</th>
                        <th className="px-4 py-3">Credits Granted</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Payment / Session</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {billing.purchases.map((purchase) => {
                        const paymentReference =
                          purchase.providerPaymentId ||
                          purchase.providerCheckoutSessionId ||
                          purchase.providerOrderId ||
                          'Not available';
                        const statusLabel = purchaseStatusLabel(
                          purchase.status,
                          purchase.paidAt,
                          purchase.providerPaymentId,
                        );
                        const statusClass = statusBadgeClass(
                          purchase.status === 'paid' ||
                            purchase.paidAt ||
                            purchase.providerPaymentId
                            ? 'paid'
                            : purchase.status,
                        );

                        return (
                          <tr key={purchase.id} className="align-top">
                            <td className="px-4 py-4 text-slate-700">
                              {formatDate(
                                purchase.paidAt || purchase.createdAt,
                              )}
                            </td>
                            <td className="px-4 py-4 font-semibold text-slate-950">
                              {titleCase(purchase.planId)}
                            </td>
                            <td className="px-4 py-4 text-slate-700">
                              {providerLabel(purchase.provider)}
                            </td>
                            <td className="px-4 py-4 font-semibold text-slate-950">
                              {formatMoney(
                                purchase.grossAmountMinor,
                                purchase.currency,
                              )}
                            </td>
                            <td className="px-4 py-4 text-slate-700">
                              {purchase.currency}
                            </td>
                            <td className="px-4 py-4 text-slate-700">
                              {formatCredits(
                                purchase.creditsGranted.toNumber(),
                              )}
                            </td>
                            <td className="px-4 py-4">
                              <span
                                className={`rounded-full border px-2.5 py-1 text-xs font-bold ${statusClass}`}
                              >
                                {statusLabel}
                              </span>
                            </td>
                            <td className="max-w-[240px] px-4 py-4 font-mono text-xs text-slate-600 break-all">
                              {paymentReference}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <EmptyState
                  icon={ReceiptText}
                  title="No purchases yet"
                  detail="AI Studio plan purchases will appear here after a Razorpay or PayPal checkout is created."
                />
              )}
            </section>

            <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-lg shadow-slate-200/70">
              <div className="mb-5 flex items-center gap-2">
                <History size={20} className="text-cyan-700" />
                <h2 className="text-xl font-bold text-slate-950">
                  Wallet / Credit History
                </h2>
              </div>
              {billing.transactions.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-[820px] w-full text-left text-sm">
                    <thead className="border-b border-slate-200 bg-slate-50 text-xs font-bold uppercase tracking-wide text-slate-500">
                      <tr>
                        <th className="px-4 py-3">Date</th>
                        <th className="px-4 py-3">Type</th>
                        <th className="px-4 py-3">Credits</th>
                        <th className="px-4 py-3">Reason / Description</th>
                        <th className="px-4 py-3">Balance After</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {billing.transactions.map((transaction) => {
                        const amount = transaction.amountCredits.toNumber();
                        const label = transactionLabel(transaction.type);

                        return (
                          <tr key={transaction.id}>
                            <td className="px-4 py-4 text-slate-700">
                              {formatDate(transaction.createdAt)}
                            </td>
                            <td className="px-4 py-4">
                              <span
                                className={`rounded-full border px-2.5 py-1 text-xs font-bold ${transactionTypeClass(amount)}`}
                              >
                                {label}
                              </span>
                            </td>
                            <td
                              className={`px-4 py-4 font-bold ${amount >= 0 ? 'text-emerald-700' : 'text-red-700'}`}
                            >
                              {amount >= 0 ? '+' : ''}
                              {formatCredits(amount)}
                            </td>
                            <td className="px-4 py-4 text-slate-700">
                              {transaction.description || 'No description'}
                            </td>
                            <td className="px-4 py-4 font-semibold text-slate-950">
                              {formatCredits(
                                transaction.balanceAfter.toNumber(),
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <EmptyState
                  icon={WalletCards}
                  title="No wallet activity yet"
                  detail="Purchases, adjustments, reservations, captures, and releases will appear here."
                />
              )}
            </section>

            <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-lg shadow-slate-200/70">
              <div className="mb-5 flex items-center gap-2">
                <Clock size={20} className="text-cyan-700" />
                <h2 className="text-xl font-bold text-slate-950">
                  Generation Usage History
                </h2>
              </div>
              {billing.usageLogs.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-[1120px] w-full text-left text-sm">
                    <thead className="border-b border-slate-200 bg-slate-50 text-xs font-bold uppercase tracking-wide text-slate-500">
                      <tr>
                        <th className="px-4 py-3">Topic</th>
                        <th className="px-4 py-3">Tool</th>
                        <th className="px-4 py-3">Slides</th>
                        <th className="px-4 py-3">Credits Used</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Model</th>
                        <th className="px-4 py-3">Tokens</th>
                        <th className="px-4 py-3">Failure Reason</th>
                        <th className="px-4 py-3">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {billing.usageLogs.map((usage) => {
                        const creditsUsed =
                          usage.actualCredits?.toNumber() ??
                          usage.reservedCredits.toNumber() ??
                          usage.estimatedCredits.toNumber();
                        const tokenUsage = formatTokenUsage(
                          usage.inputTokens,
                          usage.outputTokens,
                        );

                        return (
                          <tr key={usage.id} className="align-top">
                            <td className="max-w-[300px] px-4 py-4 font-semibold text-slate-950">
                              {usage.topic || 'Untitled AI Studio generation'}
                            </td>
                            <td className="px-4 py-4 text-slate-700">
                              {titleCase(usage.toolType)}
                            </td>
                            <td className="px-4 py-4 text-slate-700">
                              {usage.toolType === 'presentation'
                                ? usage.slideCount
                                : '-'}
                            </td>
                            <td className="px-4 py-4 font-semibold text-slate-950">
                              {formatCredits(creditsUsed)}
                            </td>
                            <td className="px-4 py-4">
                              <span
                                className={`rounded-full border px-2.5 py-1 text-xs font-bold ${statusBadgeClass(usage.status)}`}
                              >
                                {titleCase(usage.status)}
                              </span>
                            </td>
                            <td className="max-w-[220px] px-4 py-4 font-mono text-xs text-slate-600 break-all">
                              {formatModelName(usage.model)}
                            </td>
                            <td className="px-4 py-4 text-slate-700">
                              {tokenUsage || '-'}
                            </td>
                            <td className="max-w-[220px] px-4 py-4 text-slate-700">
                              {usage.errorCode
                                ? titleCase(usage.errorCode)
                                : '-'}
                            </td>
                            <td className="px-4 py-4 text-slate-700">
                              {formatDate(usage.createdAt)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <EmptyState
                  icon={Presentation}
                  title="No generations yet"
                  detail="AI Studio generation usage will appear here after you create a presentation, document, or spreadsheet."
                />
              )}
            </section>
          </div>
        </section>
      </main>
    </>
  );
}
