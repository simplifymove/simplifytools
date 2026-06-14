import { ReactNode } from 'react';
import { getAdminSession, getSession } from '@/lib/auth/admin';
import { redirect } from 'next/navigation';

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getSession();

  if (!session?.user?.email) {
    redirect('/auth/signin');
  }

  const adminSession = await getAdminSession();

  if (!adminSession) {
    redirect('/');
  }

  return <>{children}</>;
}
