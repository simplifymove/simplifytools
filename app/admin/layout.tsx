import { ReactNode } from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { redirect } from 'next/navigation';

const ADMIN_EMAIL = 'raghavaboyidi@gmail.com';

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  // This is a SERVER component - using async/await
  const session = await getServerSession(authOptions);
  
  console.log('[AdminLayout] Server-side session check:', {
    hasSession: !!session,
    userEmail: session?.user?.email,
    isAdmin: session?.user?.email === ADMIN_EMAIL,
  });

  // Check if user is authenticated
  if (!session?.user?.email) {
    console.log('[AdminLayout] No user session, redirecting to signin');
    redirect('/auth/signin');
  }

  // Check if user is admin
  if (session.user.email !== ADMIN_EMAIL) {
    console.log('[AdminLayout] User not admin:', session.user.email, 'redirecting to home');
    redirect('/');
  }

  console.log('[AdminLayout] Admin access granted for:', session.user.email);
  return <>{children}</>;
}
