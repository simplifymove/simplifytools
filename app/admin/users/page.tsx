import { prisma } from '@/lib/prisma';

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

function formatCurrencyTotals(rows: Array<{ currency: string; total: number }>) {
  if (rows.length === 0) return '-';
  return rows.map((row) => formatMoneyMinor(row.total, row.currency)).join(' / ');
}

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    take: 100,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      provider: true,
      createdAt: true,
      accounts: { select: { provider: true }, take: 3 },
      aiStudioWallet: { select: { balanceCredits: true } },
      aiStudioPlanPurchases: {
        where: { status: 'paid' },
        select: {
          currency: true,
          grossAmountMinor: true,
        },
      },
    },
  });

  const rows = users.map((user) => {
    const totals = new Map<string, number>();
    user.aiStudioPlanPurchases.forEach((purchase) => {
      totals.set(purchase.currency, (totals.get(purchase.currency) ?? 0) + purchase.grossAmountMinor);
    });

    const providers = [
        ...new Set([
          ...user.accounts.map((account) => account.provider),
        user.provider,
      ].filter(Boolean)),
    ] as string[];

    return {
      id: user.id,
      name: user.name || 'Unnamed user',
      email: user.email || 'No email',
      role: user.role,
      providers: providers.length ? providers.join(', ') : 'unknown',
      createdAt: user.createdAt,
      walletBalance: toNumber(user.aiStudioWallet?.balanceCredits),
      successfulPurchases: user.aiStudioPlanPurchases.length,
      totalSpent: formatCurrencyTotals(Array.from(totals.entries()).map(([currency, total]) => ({ currency, total }))),
    };
  });

  return (
    <main className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Users</h1>
          <p className="text-gray-600 mt-2">Recent users and safe account metadata. Password hashes are never rendered.</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {['Name', 'Email', 'Provider', 'Role', 'Wallet', 'Purchases', 'Total Spent', 'Created'].map((header) => (
                    <th key={header} className="px-4 py-3 text-left font-medium text-gray-700">{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rows.length === 0 ? (
                  <tr><td className="px-4 py-8 text-gray-500" colSpan={8}>No users found.</td></tr>
                ) : rows.map((user) => (
                  <tr key={user.id}>
                    <td className="px-4 py-3 font-medium text-gray-900">{user.name}</td>
                    <td className="px-4 py-3 text-gray-700">{user.email}</td>
                    <td className="px-4 py-3 text-gray-700">{user.providers}</td>
                    <td className="px-4 py-3 text-gray-700">{user.role}</td>
                    <td className="px-4 py-3 text-gray-700">{user.walletBalance.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
                    <td className="px-4 py-3 text-gray-700">{user.successfulPurchases}</td>
                    <td className="px-4 py-3 text-gray-700">{user.totalSpent}</td>
                    <td className="px-4 py-3 text-gray-700">{user.createdAt.toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}
