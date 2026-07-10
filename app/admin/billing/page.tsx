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

function formatPlanName(planId: string) {
  return planId
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(' ');
}

export default async function AdminBillingPage() {
  const purchases = await prisma.aiStudioPlanPurchase.findMany({
    orderBy: { createdAt: 'desc' },
    take: 100,
    include: { user: { select: { name: true, email: true } } },
  });

  return (
    <main className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Billing</h1>
          <p className="text-gray-600 mt-2">Recent AI Studio purchases and receipt status.</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {['User', 'Plan', 'Provider', 'Amount', 'Credits', 'Status', 'Receipt', 'Date'].map((header) => (
                    <th key={header} className="px-4 py-3 text-left font-medium text-gray-700">{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {purchases.length === 0 ? (
                  <tr><td className="px-4 py-8 text-gray-500" colSpan={8}>No purchases found.</td></tr>
                ) : purchases.map((purchase) => (
                  <tr key={purchase.id}>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{purchase.user.email || purchase.user.name || 'Unknown user'}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-700">{formatPlanName(purchase.planId)}</td>
                    <td className="px-4 py-3 text-gray-700">{formatPlanName(purchase.provider)}</td>
                    <td className="px-4 py-3 text-gray-700">{formatMoneyMinor(purchase.grossAmountMinor, purchase.currency)}</td>
                    <td className="px-4 py-3 text-gray-700">{toNumber(purchase.creditsGranted).toLocaleString()}</td>
                    <td className="px-4 py-3 text-gray-700">{purchase.status}</td>
                    <td className="px-4 py-3 text-gray-700">{purchase.receiptEmailSentAt ? 'Sent' : 'Not sent'}</td>
                    <td className="px-4 py-3 text-gray-700">{(purchase.paidAt ?? purchase.createdAt).toLocaleString()}</td>
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
