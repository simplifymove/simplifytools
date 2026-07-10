import { redirect } from 'next/navigation';
import { getAdminAuthState } from '@/lib/auth/admin';

export const dynamic = 'force-dynamic';

export default async function AdminEntryPage() {
  const auth = await getAdminAuthState();

  if (auth.status === 'unauthenticated') {
    redirect('/admin/login');
  }

  if (auth.status === 'forbidden') {
    redirect('/admin/access-denied');
  }

  redirect('/admin/dashboard');
}
