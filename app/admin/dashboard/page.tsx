import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { getOpenRouterCreditBalance } from '@/lib/ai-studio/openrouter-balance';

export const dynamic = 'force-dynamic';

function toNumber(value: { toNumber: () => number } | number | null | undefined) {
  if (typeof value === 'number') return value;
  return value?.toNumber() ?? 0;
}

function formatMoneyMinor(amountMinor: number, currency: string) {
  return new Intl.NumberFormat(currency === 'INR' ? 'en-IN' : 'en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: currency === 'INR' ? 0 : 2,
  }).format(amountMinor / 100);
}

function formatCurrencyTotals(rows: Array<{ currency: string; _sum: { grossAmountMinor: number | null } }>) {
  if (rows.length === 0) return '$0';

  return rows
    .map((row) => formatMoneyMinor(row._sum.grossAmountMinor ?? 0, row.currency))
    .join(' / ');
}

function formatUsd(value: number | null | undefined) {
  if (value == null || !Number.isFinite(value)) return 'Unknown';

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 4,
  }).format(value);
}

function formatDate(value: Date | null | undefined) {
  return value ? value.toLocaleString() : '-';
}

function getStartOfToday() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

function getStartOfMonth() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

type HealthStatus = 'Healthy' | 'Warning' | 'Critical' | 'No data';

function metric(
  label: string,
  value: string,
  detail: string,
  href: string,
  action: string,
  status: HealthStatus = 'No data',
) {
  return { label, value, detail, href, action, status };
}

function StatusBadge({ status }: { status: HealthStatus }) {
  const classes =
    status === 'Healthy'
      ? 'border-green-200 bg-green-50 text-green-700'
      : status === 'Warning'
        ? 'border-yellow-200 bg-yellow-50 text-yellow-800'
        : status === 'Critical'
          ? 'border-red-200 bg-red-50 text-red-700'
          : 'border-gray-200 bg-gray-50 text-gray-600';

  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${classes}`}>
      {status}
    </span>
  );
}

function successRateStatus(total: number, successRate: number | null): HealthStatus {
  if (total === 0 || successRate === null) return 'No data';
  if (successRate < 80) return 'Critical';
  if (successRate < 95) return 'Warning';
  return 'Healthy';
}

function openRouterStatus(balance: Awaited<ReturnType<typeof getOpenRouterCreditBalance>>): HealthStatus {
  if (!balance.isConfigured || balance.error || balance.availableBalance < 0) return 'Critical';
  if (balance.isLow) return 'Warning';
  return 'Healthy';
}

function failureCountStatus(count: number): HealthStatus {
  if (count === 0) return 'Healthy';
  if (count <= 3) return 'Warning';
  return 'Critical';
}

export default async function AdminDashboardPage() {
  const startOfToday = getStartOfToday();
  const startOfMonth = getStartOfMonth();

  const [
    totalUsers,
    payingUsers,
    successfulPurchases,
    revenueToday,
    revenueMonth,
    revenueTotal,
    generationCounts,
    providerCost,
    recentPurchases,
    recentGenerations,
    activeAuditRuns,
    latestAudit,
    newUsersThisMonth,
    credentialUsers,
    googleUsers,
    adminUsers,
    recentGenerationFailures,
    recentAuditFailures,
    openRouterBalance,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.aiStudioPlanPurchase.groupBy({
      by: ['userId'],
      where: { status: 'paid' },
      _count: { id: true },
    }),
    prisma.aiStudioPlanPurchase.count({ where: { status: 'paid' } }),
    prisma.aiStudioPlanPurchase.groupBy({
      by: ['currency'],
      where: { status: 'paid', paidAt: { gte: startOfToday } },
      _sum: { grossAmountMinor: true },
    }),
    prisma.aiStudioPlanPurchase.groupBy({
      by: ['currency'],
      where: { status: 'paid', paidAt: { gte: startOfMonth } },
      _sum: { grossAmountMinor: true },
    }),
    prisma.aiStudioPlanPurchase.groupBy({
      by: ['currency'],
      where: { status: 'paid' },
      _sum: { grossAmountMinor: true },
    }),
    prisma.aiStudioUsageLog.groupBy({
      by: ['status'],
      _count: { id: true },
    }),
    prisma.aiStudioUsageLog.aggregate({
      where: { providerCostUsd: { not: null } },
      _sum: { providerCostUsd: true },
    }),
    prisma.aiStudioPlanPurchase.findMany({
      orderBy: { createdAt: 'desc' },
      take: 8,
      include: { user: { select: { name: true, email: true } } },
    }),
    prisma.aiStudioUsageLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 8,
      include: { user: { select: { name: true, email: true } } },
    }),
    prisma.auditRun.count({ where: { status: 'RUNNING' } }),
    prisma.auditRun.findFirst({
      where: { status: { in: ['COMPLETED', 'FAILED'] } },
      orderBy: { completedAt: 'desc' },
      select: {
        id: true,
        status: true,
        totalTests: true,
        passedTests: true,
        failedTests: true,
        errorTests: true,
        skippedTests: true,
        successPercentage: true,
        completedAt: true,
        testResults: {
          where: { status: { in: ['FAIL', 'ERROR'] } },
          orderBy: { timestamp: 'desc' },
          take: 8,
          select: {
            toolName: true,
            toolSlug: true,
            category: true,
            status: true,
            errorMessage: true,
            timestamp: true,
          },
        },
      },
    }),
    prisma.user.count({ where: { createdAt: { gte: startOfMonth } } }),
    prisma.user.count({ where: { hashedPassword: { not: null } } }),
    prisma.account.groupBy({ by: ['userId'], where: { provider: 'google' }, _count: { id: true } }),
    prisma.user.count({ where: { role: { in: ['admin', 'ADMIN'] } } }),
    prisma.aiStudioUsageLog.findMany({
      where: { status: 'failed' },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: { user: { select: { name: true, email: true } } },
    }),
    prisma.auditRun.findMany({
      where: { status: { in: ['FAILED', 'CANCELLED'] } },
      orderBy: { completedAt: 'desc' },
      take: 5,
      select: { id: true, status: true, categories: true, completedAt: true, errorMessage: true },
    }),
    getOpenRouterCreditBalance(),
  ]);

  const totalGenerations = generationCounts.reduce((sum, row) => sum + row._count.id, 0);
  const successfulGenerations = generationCounts
    .filter((row) => row.status === 'success')
    .reduce((sum, row) => sum + row._count.id, 0);
  const generationSuccessRate = totalGenerations > 0
    ? `${((successfulGenerations / totalGenerations) * 100).toFixed(1)}%`
    : '0%';
  const generationSuccessRateValue = totalGenerations > 0
    ? (successfulGenerations / totalGenerations) * 100
    : null;
  const providerCostUsd = toNumber(providerCost._sum.providerCostUsd);
  const usdRevenueMinor = revenueTotal.find((row) => row.currency === 'USD')?._sum.grossAmountMinor ?? 0;
  const estimatedGrossProfit = usdRevenueMinor > 0 ? (usdRevenueMinor / 100) - providerCostUsd : null;
  const latestAuditPassRate = latestAudit?.successPercentage ?? null;
  const latestAuditHref = latestAudit
    ? `/api/admin/audit/results/${latestAudit.id}/export?format=html`
    : '/admin/audit-testing';
  const openRouterHealth = openRouterStatus(openRouterBalance);
  const aiHealth = successRateStatus(totalGenerations, generationSuccessRateValue);
  const latestAuditHealth = successRateStatus(latestAudit ? latestAudit.totalTests : 0, latestAuditPassRate);
  const auditWorkerHealth: HealthStatus = activeAuditRuns > 0 ? 'Healthy' : 'No data';
  const recentGenerationFailureHealth = failureCountStatus(recentGenerationFailures.length);

  const cards = [
    metric('Total Users', totalUsers.toLocaleString(), `${newUsersThisMonth.toLocaleString()} new this month`, '/admin/users', 'Manage Users', totalUsers > 0 ? 'Healthy' : 'No data'),
    metric('Paying Users', payingUsers.length.toLocaleString(), 'Users with paid purchases', '/admin/users', 'View Customers', payingUsers.length > 0 ? 'Healthy' : 'No data'),
    metric('Successful Purchases', successfulPurchases.toLocaleString(), 'Paid purchase rows', '/admin/billing', 'View Purchases', successfulPurchases > 0 ? 'Healthy' : 'No data'),
    metric('Revenue Today', formatCurrencyTotals(revenueToday), 'Paid purchases today', '/admin/billing', 'View Purchases', revenueToday.length > 0 ? 'Healthy' : 'No data'),
    metric('Revenue This Month', formatCurrencyTotals(revenueMonth), 'Paid purchases this month', '/admin/billing', 'View Purchases', revenueMonth.length > 0 ? 'Healthy' : 'No data'),
    metric('Total Revenue', formatCurrencyTotals(revenueTotal), 'All paid purchases', '/admin/billing', 'View Purchases', revenueTotal.length > 0 ? 'Healthy' : 'No data'),
    metric('AI Generations', totalGenerations.toLocaleString(), `${generationSuccessRate} success rate`, '/admin/ai-studio', 'View AI Studio', aiHealth),
    metric('Provider Cost', formatUsd(providerCostUsd), 'Known AI provider cost', '/admin/ai-studio', 'View AI Studio', providerCostUsd > 0 ? 'Healthy' : 'No data'),
    metric('Gross Profit', formatUsd(estimatedGrossProfit), 'USD revenue minus provider cost', '/admin/billing', 'View Purchases', estimatedGrossProfit === null ? 'No data' : estimatedGrossProfit >= 0 ? 'Healthy' : 'Warning'),
    metric('OpenRouter Balance', formatUsd(openRouterBalance.availableBalance), openRouterBalance.isLow ? 'Below threshold' : 'Above threshold', '/admin/system-health', 'View System Health', openRouterHealth),
    metric('Active Audits', activeAuditRuns.toLocaleString(), 'Currently running audit runs', '/admin/audit-testing', 'Run Audit', auditWorkerHealth),
    metric('Latest Audit Pass Rate', `${latestAudit?.successPercentage?.toFixed(1) ?? '0.0'}%`, latestAudit ? `${latestAudit.passedTests}/${latestAudit.totalTests} passed` : 'No completed audit', latestAuditHref, latestAudit ? 'View Audit Report' : 'Run Audit', latestAuditHealth),
  ];
  const latestAuditFailures = latestAudit?.testResults || [];
  const quickActions = [
    { label: 'Run Full Audit', href: '/admin/audit-testing' },
    { label: 'Open AI Studio Admin', href: '/admin/ai-studio' },
    { label: 'Manage Users', href: '/admin/users' },
    { label: 'View Billing', href: '/admin/billing' },
    { label: 'View System Health', href: '/admin/system-health' },
  ];

  return (
    <main className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Unified overview of users, revenue, AI Studio activity, audit status, and system health.
          </p>
        </div>

        <section className="bg-white border border-gray-200 rounded-lg p-4 mb-8">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-sm font-semibold text-gray-900">Quick Actions</h2>
              <p className="text-xs text-gray-500 mt-1">Open safe admin workflows. Destructive actions stay on their dedicated pages.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {quickActions.map((action) => (
                <Link
                  key={action.href}
                  href={action.href}
                  className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  {action.label}
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {cards.map((card) => (
            <Link
              key={card.label}
              href={card.href}
              className="bg-white border border-gray-200 rounded-lg p-5 hover:border-blue-300 hover:shadow-sm transition"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="text-sm text-gray-600">{card.label}</div>
                <StatusBadge status={card.status} />
              </div>
              <div className="text-2xl font-bold text-gray-900 mt-2">{card.value}</div>
              <div className="text-xs text-gray-500 mt-2">{card.detail}</div>
              <div className="text-xs font-medium text-blue-600 mt-4">{card.action}</div>
            </Link>
          ))}
        </section>

        <div className="grid gap-6 xl:grid-cols-2 mt-8">
          <section className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between gap-4 mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Revenue and AI Studio</h2>
              <Link href="/admin/ai-studio" className="text-sm font-medium text-blue-600 hover:text-blue-700">
                Open AI Studio
              </Link>
            </div>
            <div className="grid gap-3 sm:grid-cols-3 mb-5">
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-xs text-gray-500">Provider Cost</div>
                <div className="font-semibold text-gray-900 mt-1">{formatUsd(providerCostUsd)}</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-xs text-gray-500">Gross Profit</div>
                <div className="font-semibold text-gray-900 mt-1">{formatUsd(estimatedGrossProfit)}</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-xs text-gray-500">OpenRouter</div>
                <div className="mt-1">
                  <StatusBadge status={openRouterHealth} />
                </div>
              </div>
            </div>
            <h3 className="text-sm font-semibold text-gray-900 mb-2">Recent Purchases</h3>
            <div className="divide-y divide-gray-100">
              {recentPurchases.length === 0 ? (
                <p className="text-sm text-gray-500 py-4">No purchases yet.</p>
              ) : recentPurchases.slice(0, 5).map((purchase) => (
                <div key={purchase.id} className="py-3 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">{purchase.user.email || purchase.user.name || 'Unknown user'}</div>
                    <div className="text-xs text-gray-500">{purchase.provider} - {purchase.status}</div>
                  </div>
                  <div className="text-sm font-semibold text-gray-900">{formatMoneyMinor(purchase.grossAmountMinor, purchase.currency)}</div>
                </div>
              ))}
            </div>
            <h3 className="text-sm font-semibold text-gray-900 mt-5 mb-2">Recent AI Generations</h3>
            <div className="divide-y divide-gray-100">
              {recentGenerations.length === 0 ? (
                <p className="text-sm text-gray-500 py-4">No generations yet.</p>
              ) : recentGenerations.slice(0, 5).map((item) => (
                <div key={item.id} className="py-3 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">{item.topic || item.toolType}</div>
                    <div className="text-xs text-gray-500">{item.user.email || 'Unknown user'} - {item.model}</div>
                  </div>
                  <div className="text-sm text-gray-700">{item.status}</div>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between gap-4 mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Audit Testing</h2>
              <Link href="/admin/audit-testing" className="text-sm font-medium text-blue-600 hover:text-blue-700">
                Open Audit Testing
              </Link>
            </div>
            <div className="grid gap-3 sm:grid-cols-3 mb-5">
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-xs text-gray-500">Active Runs</div>
                <div className="font-semibold text-gray-900 mt-1">{activeAuditRuns}</div>
                <div className="mt-2"><StatusBadge status={auditWorkerHealth} /></div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-xs text-gray-500">Latest Status</div>
                <div className="font-semibold text-gray-900 mt-1">{latestAudit?.status || '-'}</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-xs text-gray-500">Failed Tools</div>
                <div className="font-semibold text-gray-900 mt-1">{latestAuditFailures.length}</div>
                <div className="mt-2"><StatusBadge status={failureCountStatus(latestAuditFailures.length)} /></div>
              </div>
            </div>
            <h3 className="text-sm font-semibold text-gray-900 mb-2">Latest Failed Tools</h3>
            <div className="divide-y divide-gray-100">
              {latestAuditFailures.length === 0 ? (
                <p className="text-sm text-gray-500 py-4">No recent failed tools.</p>
              ) : latestAuditFailures.map((failure) => (
                <Link
                  key={`${failure.toolSlug}-${failure.timestamp.toISOString()}`}
                  href={latestAuditHref}
                  className="block py-3 hover:bg-gray-50"
                >
                  <div className="text-sm font-medium text-gray-900">{failure.toolName}</div>
                  <div className="text-xs text-gray-500">{failure.category} - {failure.status}</div>
                  <div className="text-xs font-medium text-blue-600 mt-1">View Audit Report</div>
                </Link>
              ))}
            </div>
          </section>

          <section className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between gap-4 mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Users</h2>
              <Link href="/admin/users" className="text-sm font-medium text-blue-600 hover:text-blue-700">
                Open Users
              </Link>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                ['New This Month', newUsersThisMonth],
                ['Manual Credential Users', credentialUsers],
                ['Google Users', googleUsers.length],
                ['Admin Users', adminUsers],
              ].map(([label, value]) => (
                <div key={label} className="bg-gray-50 rounded-lg p-3">
                  <div className="text-xs text-gray-500">{label}</div>
                  <div className="font-semibold text-gray-900 mt-1">{Number(value).toLocaleString()}</div>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between gap-4 mb-4">
              <h2 className="text-lg font-semibold text-gray-900">System Health</h2>
              <Link href="/admin/system-health" className="text-sm font-medium text-blue-600 hover:text-blue-700">
                Open Health
              </Link>
            </div>
            <div className="space-y-3">
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-xs text-gray-500">OpenRouter Balance</div>
                <div className="font-semibold text-gray-900 mt-1">
                  {formatUsd(openRouterBalance.availableBalance)} / threshold {formatUsd(openRouterBalance.minBalance)}
                </div>
                <div className="mt-2"><StatusBadge status={openRouterHealth} /></div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-xs text-gray-500">Recent Generation Failures</div>
                <div className="font-semibold text-gray-900 mt-1">{recentGenerationFailures.length}</div>
                <div className="mt-2"><StatusBadge status={recentGenerationFailureHealth} /></div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-xs text-gray-500">Recent Audit Failures</div>
                <div className="font-semibold text-gray-900 mt-1">{recentAuditFailures.length}</div>
                <div className="mt-2"><StatusBadge status={failureCountStatus(recentAuditFailures.length)} /></div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
