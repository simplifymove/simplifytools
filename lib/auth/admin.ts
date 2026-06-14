import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/config';
import { prisma } from '@/lib/prisma';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'raghavaboyi@gmail.com';

export async function getSession() {
  return getServerSession(authOptions);
}

export async function getAdminSession() {
  const session = await getSession();

  if (!session?.user?.email) {
    return null;
  }

  if (session.user.email === ADMIN_EMAIL) {
    return session;
  }

  const adminUser = await prisma.user.findFirst({
    where: {
      email: session.user.email,
      role: 'admin',
    },
    select: { id: true },
  });

  return adminUser ? session : null;
}

export async function isAdminUser(): Promise<boolean> {
  return (await getAdminSession()) !== null;
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
