'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Coins,
  CreditCard,
  DollarSign,
  History,
  Loader2,
  MinusCircle,
  PlusCircle,
  Search,
  WalletCards,
} from 'lucide-react';

interface DashboardMetric {
  label: string;
  value: string;
  detail: string;
}

interface WalletRow {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  balanceCredits: number;
  lifetimeCreditsAdded: number;
  lifetimeCreditsUsed: number;
  lastActivity: string;
}

interface TransactionRow {
  id: string;
  userName: string;
  userEmail: string;
  type: string;
  amountCredits: number;
  reason: string;
  date: string;
}

interface UsageRow {
  id: string;
  userName: string;
  userEmail: string;
  toolType: string;
  topic: string;
  slideCount: number;
  creditsCharged: number;
  model: string;
  provider: string;
  inputTokens: number | null;
  outputTokens: number | null;
  totalTokens: number | null;
  providerCostUsd: string;
  status: string;
  date: string;
}

interface CostSummary {
  totalEstimatedCostUsd: string;
  costTodayUsd: string;
  costThisMonthUsd: string;
  failedGenerationsCount: string;
  averageCostPerSuccessfulGenerationUsd: string;
  pricingSource: string;
}

interface OpenRouterBalanceSummary {
  totalCredits: string;
  totalUsage: string;
  availableBalance: string;
  minBalance: string;
  isLow: boolean;
  isNegative: boolean;
  isConfigured: boolean;
  checkedAt: string;
  error: string | null;
  suggestedAction: string;
}

interface ModelCostRow {
  model: string;
  estimatedCostUsd: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  generations: number;
}

interface ToolEconomicsRow {
  tool: string;
  generations: number;
  averageProviderCostUsd: string;
  averageCreditsCharged: string;
  estimatedMarginUsd: string;
}

interface RevenueAnalytics {
  summary: DashboardMetric[];
  sales: {
    revenueByDay: Array<{ period: string; revenue: string }>;
    revenueByMonth: Array<{ period: string; revenue: string }>;
    purchasesByPlan: Array<{
      plan: string;
      purchases: number;
      revenue: string;
      creditsSold: string;
    }>;
    purchasesByProvider: Array<{
      provider: string;
      purchases: number;
      revenue: string;
    }>;
  };
  userSummary: DashboardMetric[];
  profit: DashboardMetric[];
  recentPurchases: Array<{
    id: string;
    userName: string;
    userEmail: string;
    plan: string;
    provider: string;
    amount: string;
    credits: string;
    status: string;
    purchaseDate: string;
  }>;
  topCustomers: Array<{
    userId: string;
    userName: string;
    userEmail: string;
    purchases: number;
    totalSpent: string;
    creditsPurchased: string;
  }>;
}

interface AiStudioAdminClientProps {
  metrics: DashboardMetric[];
  wallets: WalletRow[];
  transactions: TransactionRow[];
  usage: UsageRow[];
  costSummary: CostSummary;
  openRouterBalance: OpenRouterBalanceSummary;
  economicsSummary: DashboardMetric[];
  toolEconomics: ToolEconomicsRow[];
  modelCosts: ModelCostRow[];
  revenueAnalytics: RevenueAnalytics;
  initialSearch: string;
}

function formatCredits(value: number) {
  return value.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value));
}

function statusClass(status: string) {
  if (status === 'success')
    return 'bg-emerald-50 text-emerald-700 ring-emerald-200';
  if (status === 'failed') return 'bg-rose-50 text-rose-700 ring-rose-200';
  return 'bg-slate-100 text-slate-700 ring-slate-200';
}

function AnalyticsCards({ metrics }: { metrics: DashboardMetric[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {metrics.map((metric) => (
        <div
          key={metric.label}
          className="rounded-lg border border-slate-200 bg-slate-50 p-4"
        >
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
            {metric.label}
          </p>
          <p className="mt-3 text-xl font-bold text-slate-950">
            {metric.value}
          </p>
          <p className="mt-1 text-xs text-slate-500">{metric.detail}</p>
        </div>
      ))}
    </div>
  );
}

function MiniTable({
  title,
  headers,
  rows,
  emptyText,
}: {
  title: string;
  headers: string[];
  rows: string[][];
  emptyText: string;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-4 py-3">
        <h3 className="text-sm font-bold">{title}</h3>
      </div>
      <div className="max-h-72 overflow-auto">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="sticky top-0 bg-slate-50 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
            <tr>
              {headers.map((header) => (
                <th key={header} className="px-4 py-3">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row, rowIndex) => (
              <tr key={`${title}-${rowIndex}`}>
                {row.map((cell, cellIndex) => (
                  <td
                    key={`${title}-${rowIndex}-${cellIndex}`}
                    className={`${cellIndex === 0 ? 'font-semibold text-slate-950' : 'text-slate-600'} px-4 py-3`}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td
                  className="px-4 py-8 text-center text-slate-500"
                  colSpan={headers.length}
                >
                  {emptyText}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function RevenueAnalyticsSection({
  analytics,
}: {
  analytics: RevenueAnalytics;
}) {
  return (
    <section className="mt-6 rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-5 py-4">
        <div className="flex items-center gap-2">
          <CreditCard size={18} className="text-cyan-700" />
          <h2 className="text-lg font-bold">Revenue Analytics</h2>
        </div>
        <p className="mt-1 text-sm text-slate-500">
          Purchase, sales, customer, and profit analytics aggregated server-side
          from AI Studio billing records.
        </p>
      </div>

      <div className="space-y-6 p-5">
        <div>
          <h3 className="mb-3 text-base font-bold">Revenue Summary</h3>
          <AnalyticsCards metrics={analytics.summary} />
        </div>

        <div>
          <h3 className="mb-3 text-base font-bold">Sales Analytics</h3>
          <div className="grid gap-4 xl:grid-cols-2">
            <MiniTable
              title="Revenue by Day (Last 30 Days)"
              headers={['Day', 'Revenue']}
              rows={analytics.sales.revenueByDay.map((row) => [
                row.period,
                row.revenue,
              ])}
              emptyText="No paid purchases in the last 30 days."
            />
            <MiniTable
              title="Revenue by Month"
              headers={['Month', 'Revenue']}
              rows={analytics.sales.revenueByMonth.map((row) => [
                row.period,
                row.revenue,
              ])}
              emptyText="No monthly revenue yet."
            />
            <MiniTable
              title="Purchases by Plan"
              headers={['Plan', 'Purchases', 'Revenue', 'Credits Sold']}
              rows={analytics.sales.purchasesByPlan.map((row) => [
                row.plan,
                row.purchases.toLocaleString(),
                row.revenue,
                row.creditsSold,
              ])}
              emptyText="No paid plans yet."
            />
            <MiniTable
              title="Purchases by Provider"
              headers={['Provider', 'Purchases', 'Revenue']}
              rows={analytics.sales.purchasesByProvider.map((row) => [
                row.provider,
                row.purchases.toLocaleString(),
                row.revenue,
              ])}
              emptyText="No paid providers yet."
            />
          </div>
        </div>

        <div>
          <h3 className="mb-3 text-base font-bold">User Analytics</h3>
          <AnalyticsCards metrics={analytics.userSummary} />
        </div>

        <div>
          <h3 className="mb-3 text-base font-bold">Profit Overview</h3>
          <AnalyticsCards metrics={analytics.profit} />
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          <MiniTable
            title="Recent Purchases"
            headers={[
              'User',
              'Plan',
              'Provider',
              'Amount',
              'Credits',
              'Status',
              'Purchase Date',
            ]}
            rows={analytics.recentPurchases.map((row) => [
              `${row.userName} (${row.userEmail})`,
              row.plan,
              row.provider,
              row.amount,
              row.credits,
              row.status,
              formatDate(row.purchaseDate),
            ])}
            emptyText="No purchases yet."
          />
          <MiniTable
            title="Top Customers"
            headers={['User', 'Purchases', 'Total Spent', 'Credits Purchased']}
            rows={analytics.topCustomers.map((row) => [
              `${row.userName} (${row.userEmail})`,
              row.purchases.toLocaleString(),
              row.totalSpent,
              row.creditsPurchased,
            ])}
            emptyText="No paying customers yet."
          />
        </div>
      </div>
    </section>
  );
}

export function AiStudioAdminClient({
  metrics,
  wallets,
  transactions,
  usage,
  costSummary,
  openRouterBalance,
  economicsSummary,
  toolEconomics,
  modelCosts,
  revenueAnalytics,
  initialSearch,
}: AiStudioAdminClientProps) {
  const router = useRouter();
  const [search, setSearch] = useState(initialSearch);
  const [selectedEmail, setSelectedEmail] = useState(
    wallets[0]?.userEmail ?? '',
  );
  const [action, setAction] = useState<'add' | 'deduct'>('add');
  const [credits, setCredits] = useState('');
  const [reason, setReason] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const selectedWallet = useMemo(
    () => wallets.find((wallet) => wallet.userEmail === selectedEmail) ?? null,
    [selectedEmail, wallets],
  );

  const submitSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = search.trim();
    router.push(
      trimmed
        ? `/admin/ai-studio?q=${encodeURIComponent(trimmed)}`
        : '/admin/ai-studio',
    );
  };

  const submitAdjustment = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setMessage('');
    setError('');

    try {
      const response = await fetch('/api/admin/ai-studio/credits/adjust', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userEmail: selectedEmail,
          action,
          credits: Number(credits),
          reason,
        }),
      });
      const data = (await response.json().catch(() => ({}))) as {
        error?: string;
      };

      if (!response.ok) {
        throw new Error(data.error || 'Unable to adjust credits');
      }

      setMessage(
        `Credits ${action === 'add' ? 'added' : 'deducted'} successfully.`,
      );
      setCredits('');
      setReason('');
      router.refresh();
    } catch (adjustmentError) {
      setError(
        adjustmentError instanceof Error
          ? adjustmentError.message
          : 'Unable to adjust credits',
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8 text-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-cyan-700">
              Admin
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-normal">
              AI Studio Management
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Manage AI credit wallets, admin adjustments, generation usage and
              transaction audit history.
            </p>
          </div>

          <form onSubmit={submitSearch} className="flex w-full max-w-xl gap-2">
            <label className="sr-only" htmlFor="ai-studio-wallet-search">
              Search wallets
            </label>
            <div className="relative flex-1">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={18}
              />
              <input
                id="ai-studio-wallet-search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by email or user name"
                className="h-11 w-full rounded-lg border border-slate-300 bg-white pl-10 pr-3 text-sm outline-none ring-cyan-600 transition focus:ring-2"
              />
            </div>
            <button
              className="h-11 rounded-lg bg-slate-950 px-4 text-sm font-semibold text-white"
              type="submit"
            >
              Search
            </button>
          </form>
        </div>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {metrics.map((metric, index) => {
            const icons = [
              WalletCards,
              PlusCircle,
              MinusCircle,
              Activity,
              CreditCard,
            ];
            const Icon = icons[index] ?? Coins;
            return (
              <div
                key={metric.label}
                className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                    {metric.label}
                  </p>
                  <Icon size={18} className="text-cyan-700" />
                </div>
                <p className="mt-4 text-2xl font-bold">{metric.value}</p>
                <p className="mt-1 text-xs text-slate-500">{metric.detail}</p>
              </div>
            );
          })}
        </section>

        <section className="mt-6 rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-4">
            <div className="flex items-center gap-2">
              <DollarSign size={18} className="text-cyan-700" />
              <h2 className="text-lg font-bold">OpenRouter Cost Dashboard</h2>
            </div>
            <p className="mt-1 text-sm text-slate-500">
              Estimated AI Studio provider cost from known OpenRouter pricing.
              Unknown model prices are not estimated.
            </p>
          </div>

          <div className="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-5">
            {[
              {
                label: 'Total Estimated Cost',
                value: costSummary.totalEstimatedCostUsd,
                detail: 'Known OpenRouter usage',
              },
              {
                label: 'Cost Today',
                value: costSummary.costTodayUsd,
                detail: 'Since local midnight',
              },
              {
                label: 'Cost This Month',
                value: costSummary.costThisMonthUsd,
                detail: 'Current calendar month',
              },
              {
                label: 'Failed Generations',
                value: costSummary.failedGenerationsCount,
                detail: 'All failed AI Studio logs',
              },
              {
                label: 'Avg Success Cost',
                value: costSummary.averageCostPerSuccessfulGenerationUsd,
                detail: 'Known-cost successful generations',
              },
            ].map((metric) => (
              <div
                key={metric.label}
                className="rounded-lg border border-slate-200 bg-slate-50 p-4"
              >
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  {metric.label}
                </p>
                <p className="mt-3 text-xl font-bold text-slate-950">
                  {metric.value}
                </p>
                <p className="mt-1 text-xs text-slate-500">{metric.detail}</p>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-200 px-5 py-4">
            <div
              className={`rounded-lg border p-4 ${
                openRouterBalance.isLow
                  ? 'border-amber-200 bg-amber-50 text-amber-950'
                  : 'border-emerald-200 bg-emerald-50 text-emerald-950'
              }`}
            >
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    {openRouterBalance.isLow && (
                      <AlertTriangle size={18} className="text-amber-700" />
                    )}
                    <h3 className="text-base font-bold">
                      OpenRouter Provider Balance
                    </h3>
                  </div>
                  <p className="mt-1 text-sm">
                    {openRouterBalance.isLow
                      ? openRouterBalance.isNegative
                        ? 'Warning: OpenRouter balance is negative. Generation is blocked before user credits are reserved.'
                        : 'Warning: OpenRouter balance is below the safe threshold. Generation is blocked before user credits are reserved.'
                      : 'OpenRouter balance is above the configured safe threshold.'}
                  </p>
                  {openRouterBalance.error && (
                    <p className="mt-2 text-sm font-semibold">
                      Balance check issue: {openRouterBalance.error}
                    </p>
                  )}
                  <p className="mt-2 text-sm">
                    Suggested action: {openRouterBalance.suggestedAction}
                  </p>
                </div>
                <p className="text-xs text-slate-600">
                  Checked {formatDate(openRouterBalance.checkedAt)}
                </p>
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-4">
                {[
                  {
                    label: 'Total Credits',
                    value: openRouterBalance.totalCredits,
                  },
                  {
                    label: 'Total Usage',
                    value: openRouterBalance.totalUsage,
                  },
                  {
                    label: 'Available Balance',
                    value: openRouterBalance.availableBalance,
                  },
                  {
                    label: 'Safe Threshold',
                    value: openRouterBalance.minBalance,
                  },
                ].map((metric) => (
                  <div
                    key={metric.label}
                    className="rounded-lg border border-white/70 bg-white/70 p-3"
                  >
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-600">
                      {metric.label}
                    </p>
                    <p className="mt-2 text-lg font-bold">{metric.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="border-t border-slate-200 px-5 py-4">
            <div className="mb-3 flex items-center gap-2">
              <Activity size={18} className="text-cyan-700" />
              <h3 className="text-base font-bold">
                Credit Economics Audit
              </h3>
            </div>
            <p className="mb-4 text-sm text-slate-500">
              Admin-only view based on paid purchases and successful usage logs. Estimated margin uses USD-plan revenue per credit where available.
            </p>

            <AnalyticsCards metrics={economicsSummary} />

            <div className="mt-5 overflow-x-auto rounded-lg border border-slate-200">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Tool</th>
                    <th className="px-4 py-3 text-right">Generations</th>
                    <th className="px-4 py-3 text-right">Avg OpenRouter Cost</th>
                    <th className="px-4 py-3 text-right">Avg Credits Charged</th>
                    <th className="px-4 py-3 text-right">Estimated Margin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {toolEconomics.map((row) => (
                    <tr key={row.tool}>
                      <td className="px-4 py-3 font-semibold text-slate-950">
                        {row.tool}
                      </td>
                      <td className="px-4 py-3 text-right text-slate-600">
                        {row.generations.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold">
                        {row.averageProviderCostUsd}
                      </td>
                      <td className="px-4 py-3 text-right text-slate-600">
                        {row.averageCreditsCharged}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold">
                        {row.estimatedMarginUsd}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="border-t border-slate-200 px-5 py-4">
            <div className="mb-3 flex items-center gap-2">
              <BarChart3 size={18} className="text-cyan-700" />
              <h3 className="text-base font-bold">
                Cost and Token Usage by Model
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Model</th>
                    <th className="px-4 py-3 text-right">Cost</th>
                    <th className="px-4 py-3 text-right">Prompt Tokens</th>
                    <th className="px-4 py-3 text-right">Completion Tokens</th>
                    <th className="px-4 py-3 text-right">Total Tokens</th>
                    <th className="px-4 py-3 text-right">Generations</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {modelCosts.map((row) => (
                    <tr key={row.model}>
                      <td className="max-w-[320px] px-4 py-3 font-semibold text-slate-950 break-all">
                        {row.model}
                      </td>
                      <td className="px-4 py-3 text-right font-bold">
                        {row.estimatedCostUsd}
                      </td>
                      <td className="px-4 py-3 text-right text-slate-600">
                        {row.inputTokens.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right text-slate-600">
                        {row.outputTokens.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right text-slate-600">
                        {row.totalTokens.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right text-slate-600">
                        {row.generations.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                  {modelCosts.length === 0 && (
                    <tr>
                      <td
                        className="px-4 py-8 text-center text-slate-500"
                        colSpan={6}
                      >
                        No OpenRouter usage records yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-xs text-slate-500">
              Pricing source: {costSummary.pricingSource}
            </p>
          </div>
        </section>

        <RevenueAnalyticsSection analytics={revenueAnalytics} />

        <section className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(340px,0.65fr)]">
          <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-5 py-4">
              <h2 className="text-lg font-bold">Wallet Management</h2>
              <p className="mt-1 text-sm text-slate-500">
                Search, inspect balances and choose a wallet for adjustment.
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-5 py-3">User</th>
                    <th className="px-5 py-3">Email</th>
                    <th className="px-5 py-3 text-right">Balance</th>
                    <th className="px-5 py-3 text-right">Added</th>
                    <th className="px-5 py-3 text-right">Used</th>
                    <th className="px-5 py-3">Last Activity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {wallets.map((wallet) => (
                    <tr
                      key={wallet.id}
                      onClick={() => setSelectedEmail(wallet.userEmail)}
                      className={`cursor-pointer transition hover:bg-cyan-50/70 ${
                        selectedEmail === wallet.userEmail ? 'bg-cyan-50' : ''
                      }`}
                    >
                      <td className="px-5 py-3 font-semibold">
                        {wallet.userName}
                      </td>
                      <td className="px-5 py-3 text-slate-600">
                        {wallet.userEmail}
                      </td>
                      <td className="px-5 py-3 text-right font-bold">
                        {formatCredits(wallet.balanceCredits)}
                      </td>
                      <td className="px-5 py-3 text-right">
                        {formatCredits(wallet.lifetimeCreditsAdded)}
                      </td>
                      <td className="px-5 py-3 text-right">
                        {formatCredits(wallet.lifetimeCreditsUsed)}
                      </td>
                      <td className="px-5 py-3 text-slate-500">
                        {formatDate(wallet.lastActivity)}
                      </td>
                    </tr>
                  ))}
                  {wallets.length === 0 && (
                    <tr>
                      <td
                        className="px-5 py-8 text-center text-slate-500"
                        colSpan={6}
                      >
                        No AI Studio wallets found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <form
            onSubmit={submitAdjustment}
            className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="mb-5">
              <h2 className="text-lg font-bold">Credit Management</h2>
              <p className="mt-1 text-sm text-slate-500">
                Add or deduct internal AI Credits with an audit reason.
              </p>
            </div>

            <label
              className="text-xs font-bold uppercase tracking-wide text-slate-500"
              htmlFor="wallet-email"
            >
              Wallet
            </label>
            <select
              id="wallet-email"
              value={selectedEmail}
              onChange={(event) => setSelectedEmail(event.target.value)}
              className="mt-2 h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none ring-cyan-600 focus:ring-2"
              required
            >
              {wallets.map((wallet) => (
                <option key={wallet.id} value={wallet.userEmail}>
                  {wallet.userName} ({wallet.userEmail})
                </option>
              ))}
            </select>

            {selectedWallet && (
              <div className="mt-3 rounded-lg bg-slate-50 p-3 text-sm text-slate-600">
                Current balance:{' '}
                <span className="font-bold text-slate-950">
                  {formatCredits(selectedWallet.balanceCredits)} AI Credits
                </span>
              </div>
            )}

            <div className="mt-5 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setAction('add')}
                className={`inline-flex h-10 items-center justify-center gap-2 rounded-lg border text-sm font-semibold ${
                  action === 'add'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
                    : 'border-slate-300 text-slate-600'
                }`}
              >
                <PlusCircle size={16} />
                Add
              </button>
              <button
                type="button"
                onClick={() => setAction('deduct')}
                className={`inline-flex h-10 items-center justify-center gap-2 rounded-lg border text-sm font-semibold ${
                  action === 'deduct'
                    ? 'border-rose-600 bg-rose-50 text-rose-700'
                    : 'border-slate-300 text-slate-600'
                }`}
              >
                <MinusCircle size={16} />
                Deduct
              </button>
            </div>

            <label
              className="mt-5 block text-xs font-bold uppercase tracking-wide text-slate-500"
              htmlFor="credit-amount"
            >
              Credits
            </label>
            <input
              id="credit-amount"
              type="number"
              min="0.01"
              step="0.01"
              value={credits}
              onChange={(event) => setCredits(event.target.value)}
              className="mt-2 h-11 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none ring-cyan-600 focus:ring-2"
              required
            />

            <label
              className="mt-5 block text-xs font-bold uppercase tracking-wide text-slate-500"
              htmlFor="adjustment-reason"
            >
              Adjustment Reason
            </label>
            <textarea
              id="adjustment-reason"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              className="mt-2 min-h-24 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-cyan-600 focus:ring-2"
              placeholder="Required audit reason"
              required
            />

            {message && (
              <p className="mt-4 rounded-lg bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700">
                {message}
              </p>
            )}
            {error && (
              <p className="mt-4 rounded-lg bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting || wallets.length === 0}
              className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {submitting && <Loader2 size={16} className="animate-spin" />}
              Save Adjustment
            </button>
          </form>
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-2">
          <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-5 py-4">
              <div className="flex items-center gap-2">
                <History size={18} className="text-cyan-700" />
                <h2 className="text-lg font-bold">Transaction History</h2>
              </div>
              <p className="mt-1 text-sm text-slate-500">
                Latest 100 wallet transactions.
              </p>
            </div>
            <div className="max-h-[520px] overflow-auto">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="sticky top-0 bg-slate-50 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-5 py-3">User</th>
                    <th className="px-5 py-3">Type</th>
                    <th className="px-5 py-3 text-right">Credits</th>
                    <th className="px-5 py-3">Reason</th>
                    <th className="px-5 py-3">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {transactions.map((transaction) => (
                    <tr key={transaction.id}>
                      <td className="px-5 py-3">
                        <p className="font-semibold">{transaction.userName}</p>
                        <p className="text-xs text-slate-500">
                          {transaction.userEmail}
                        </p>
                      </td>
                      <td className="px-5 py-3 capitalize">
                        {transaction.type}
                      </td>
                      <td className="px-5 py-3 text-right font-bold">
                        {formatCredits(transaction.amountCredits)}
                      </td>
                      <td className="px-5 py-3 text-slate-600">
                        {transaction.reason}
                      </td>
                      <td className="px-5 py-3 text-slate-500">
                        {formatDate(transaction.date)}
                      </td>
                    </tr>
                  ))}
                  {transactions.length === 0 && (
                    <tr>
                      <td
                        className="px-5 py-8 text-center text-slate-500"
                        colSpan={5}
                      >
                        No transactions yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-5 py-4">
              <div className="flex items-center gap-2">
                <Activity size={18} className="text-cyan-700" />
                <h2 className="text-lg font-bold">Usage History</h2>
              </div>
              <p className="mt-1 text-sm text-slate-500">
                Recent AI Studio premium generations.
              </p>
            </div>
            <div className="max-h-[520px] overflow-auto">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="sticky top-0 bg-slate-50 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-5 py-3">Topic</th>
                    <th className="px-5 py-3">Tool</th>
                    <th className="px-5 py-3">Slides</th>
                    <th className="px-5 py-3">Credits</th>
                    <th className="px-5 py-3">Provider</th>
                    <th className="px-5 py-3">Model</th>
                    <th className="px-5 py-3">Tokens</th>
                    <th className="px-5 py-3">Cost</th>
                    <th className="px-5 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {usage.map((item) => (
                    <tr key={item.id}>
                      <td className="px-5 py-3">
                        <p className="font-semibold">{item.topic}</p>
                        <p className="text-xs text-slate-500">
                          {item.userEmail}
                        </p>
                      </td>
                      <td className="px-5 py-3 text-slate-600">
                        {item.toolType}
                      </td>
                      <td className="px-5 py-3">
                        {item.toolType === 'presentation'
                          ? item.slideCount
                          : '-'}
                      </td>
                      <td className="px-5 py-3 font-bold">
                        {formatCredits(item.creditsCharged)}
                      </td>
                      <td className="px-5 py-3 text-slate-600">
                        {item.provider}
                      </td>
                      <td className="px-5 py-3 text-slate-600">{item.model}</td>
                      <td className="px-5 py-3 text-slate-600">
                        {item.totalTokens != null
                          ? `${item.totalTokens.toLocaleString()} total`
                          : `${item.inputTokens ?? 0} in / ${item.outputTokens ?? 0} out`}
                      </td>
                      <td className="px-5 py-3 font-semibold text-slate-700">
                        {item.providerCostUsd}
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-bold ring-1 ${statusClass(item.status)}`}
                        >
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {usage.length === 0 && (
                    <tr>
                      <td
                        className="px-5 py-8 text-center text-slate-500"
                        colSpan={9}
                      >
                        No usage records yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
