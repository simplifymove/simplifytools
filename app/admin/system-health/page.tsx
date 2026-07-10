import { prisma } from '@/lib/prisma';
import { getOpenRouterCreditBalance } from '@/lib/ai-studio/openrouter-balance';

export const dynamic = 'force-dynamic';

function formatUsd(value: number | null | undefined) {
  if (value == null || !Number.isFinite(value)) return 'Unknown';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 4,
  }).format(value);
}

export default async function AdminSystemHealthPage() {
  const [openRouterBalance, recentFailedGenerations, activeAudits, recentAudits] = await Promise.all([
    getOpenRouterCreditBalance(),
    prisma.aiStudioUsageLog.findMany({
      where: { status: 'failed' },
      orderBy: { createdAt: 'desc' },
      take: 20,
      include: { user: { select: { name: true, email: true } } },
    }),
    prisma.auditRun.findMany({
      where: { status: { in: ['PENDING', 'RUNNING'] } },
      orderBy: { startedAt: 'desc' },
      take: 20,
      select: { id: true, status: true, categories: true, startedAt: true, errorMessage: true },
    }),
    prisma.auditRun.findMany({
      where: { status: { in: ['COMPLETED', 'FAILED', 'CANCELLED'] } },
      orderBy: { completedAt: 'desc' },
      take: 20,
      select: { id: true, status: true, categories: true, successPercentage: true, completedAt: true, errorMessage: true },
    }),
  ]);

  return (
    <main className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">System Health</h1>
          <p className="text-gray-600 mt-2">Safe operational signals without exposing secrets or raw environment values.</p>
        </div>

        <section className="grid gap-4 md:grid-cols-3 mb-8">
          <div className="bg-white border border-gray-200 rounded-lg p-5">
            <div className="text-sm text-gray-600">OpenRouter Available</div>
            <div className="text-2xl font-bold text-gray-900 mt-2">{formatUsd(openRouterBalance.availableBalance)}</div>
            <div className={openRouterBalance.isLow ? 'text-xs text-red-600 mt-2' : 'text-xs text-green-600 mt-2'}>
              Threshold {formatUsd(openRouterBalance.minBalance)} - {openRouterBalance.isLow ? 'Low' : 'Healthy'}
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-5">
            <div className="text-sm text-gray-600">Audit Worker Status</div>
            <div className="text-2xl font-bold text-gray-900 mt-2">{activeAudits.length > 0 ? 'Active' : 'Idle'}</div>
            <div className="text-xs text-gray-500 mt-2">{activeAudits.length} pending/running audit runs</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-5">
            <div className="text-sm text-gray-600">Recent Generation Failures</div>
            <div className="text-2xl font-bold text-gray-900 mt-2">{recentFailedGenerations.length}</div>
            <div className="text-xs text-gray-500 mt-2">Latest failed AI Studio usage rows</div>
          </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-2">
          <section className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Failed AI Generations</h2>
            <div className="divide-y divide-gray-100">
              {recentFailedGenerations.length === 0 ? (
                <p className="text-sm text-gray-500 py-4">No recent failed generations.</p>
              ) : recentFailedGenerations.map((item) => (
                <div key={item.id} className="py-3">
                  <div className="text-sm font-medium text-gray-900">{item.topic || item.toolType}</div>
                  <div className="text-xs text-gray-500">{item.user.email || 'Unknown user'} - {item.model} - {item.createdAt.toLocaleString()}</div>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Audit Runs</h2>
            <div className="divide-y divide-gray-100">
              {recentAudits.length === 0 ? (
                <p className="text-sm text-gray-500 py-4">No recent audit runs.</p>
              ) : recentAudits.map((run) => (
                <div key={run.id} className="py-3">
                  <div className="text-sm font-medium text-gray-900">{run.id.slice(0, 8)} - {run.status}</div>
                  <div className="text-xs text-gray-500">
                    Pass rate {run.successPercentage.toFixed(1)}% - {run.completedAt?.toLocaleString() || '-'}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
