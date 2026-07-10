import { ReactNode } from 'react';
import { headers } from 'next/headers';
import { getAdminAuthState } from '@/lib/auth/admin';
import { redirect } from 'next/navigation';
import { AdminShell } from './components/AdminShell';

function getEnvironmentLabel() {
  if (process.env.VERCEL_ENV === 'production') return 'Production';
  if (process.env.VERCEL_ENV === 'preview') return 'Staging';
  if (process.env.NODE_ENV === 'production') return 'Production';
  return 'Development';
}

function getAppVersion() {
  return process.env.npm_package_version || '0.1.0';
}

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = (await headers()).get('x-pathname') || '';
  const isPublicAdminPage =
    pathname === '/admin/login' || pathname === '/admin/access-denied';

  if (isPublicAdminPage) {
    return <>{children}</>;
  }

  const auth = await getAdminAuthState();

  if (auth.status === 'unauthenticated') {
    redirect('/admin/login');
  }

  if (auth.status === 'forbidden') {
    redirect('/admin/access-denied');
  }

  return (
    <AdminShell
      adminName={auth.session?.user?.name}
      adminEmail={auth.user?.email || auth.session?.user?.email}
      environmentLabel={getEnvironmentLabel()}
      appVersion={getAppVersion()}
    >
      {children}
    </AdminShell>
  );
}
