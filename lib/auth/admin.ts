import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/config';

const ADMIN_EMAIL = 'raghavaboyidi@gmail.com';

export async function getSession() {
  return getServerSession(authOptions);
}

export async function isAdminUser(): Promise<boolean> {
  const session = await getSession();

  if (!session?.user) {
    return false;
  }

  // Check by email (primary method) or role (backup method)
  return (
    session.user.email === ADMIN_EMAIL ||
    (session.user as any).role === 'admin'
  );
}

export async function requireAdmin(): Promise<void> {
  const isAdmin = await isAdminUser();

  if (!isAdmin) {
    throw new Error('Unauthorized: Admin access required');
  }
}

export function checkAdminSync(email?: string | null): boolean {
  return email === ADMIN_EMAIL;
}
