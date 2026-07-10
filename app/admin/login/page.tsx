import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { getAdminAuthState } from '@/lib/auth/admin';
import { AdminLoginClient } from './AdminLoginClient';

export const dynamic = 'force-dynamic';

export default async function AdminLoginPage() {
  const auth = await getAdminAuthState();

  if (auth.status === 'admin') {
    redirect('/admin/dashboard');
  }

  if (auth.status === 'forbidden') {
    redirect('/admin/access-denied');
  }

  return (
    <Suspense fallback={<main className="min-h-screen bg-gray-100" />}>
      <AdminLoginClient />
    </Suspense>
  );
}
