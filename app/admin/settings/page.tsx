export const dynamic = 'force-dynamic';

function getEnvironmentLabel() {
  if (process.env.VERCEL_ENV === 'production') return 'Production';
  if (process.env.VERCEL_ENV === 'preview') return 'Staging';
  if (process.env.NODE_ENV === 'production') return 'Production';
  return 'Development';
}

export default function AdminSettingsPage() {
  const environment = getEnvironmentLabel();
  const appVersion = process.env.npm_package_version || '0.1.0';

  const features = [
    { name: 'Role-based admin access', status: 'Enabled' },
    { name: 'AI Studio admin management', status: 'Enabled' },
    { name: 'Audit testing', status: 'Enabled' },
    { name: 'Unified dashboard', status: 'Phase 2 enabled' },
    { name: 'Admin action audit log', status: 'Planned for Phase 3' },
  ];

  return (
    <main className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-2">
            Safe informational settings. Secrets and environment variable values are not displayed.
          </p>
        </div>

        <section className="grid gap-4 md:grid-cols-2 mb-8">
          <div className="bg-white border border-gray-200 rounded-lg p-5">
            <div className="text-sm text-gray-600">Environment</div>
            <div className="text-2xl font-bold text-gray-900 mt-2">{environment}</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-5">
            <div className="text-sm text-gray-600">App Version</div>
            <div className="text-2xl font-bold text-gray-900 mt-2">{appVersion}</div>
          </div>
        </section>

        <section className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Feature Status</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {features.map((feature) => (
              <div key={feature.name} className="px-5 py-4 flex items-center justify-between gap-4">
                <div className="text-sm font-medium text-gray-900">{feature.name}</div>
                <div className="text-sm text-gray-600">{feature.status}</div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
