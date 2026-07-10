import { getServerSession } from 'next-auth/next';
import type { Session } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth/config';
import { prisma } from '@/lib/prisma';

export type AdminAuthStatus = 'unauthenticated' | 'forbidden' | 'admin';

export interface AdminAuthState {
  status: AdminAuthStatus;
  session: Session | null;
  user: {
    id: string;
    email: string | null;
    role: string | null;
  } | null;
}

export function isAdminRole(role?: string | null) {
  return role?.toLowerCase() === 'admin';
}

export async function getSession(): Promise<Session | null> {
  return getServerSession(authOptions);
}

export async function getAdminAuthState(): Promise<AdminAuthState> {
  const session = await getSession();

  if (!session?.user?.email && !session?.user?.id) {
    return {
      status: 'unauthenticated',
      session: null,
      user: null,
    };
  }

  const user = await prisma.user.findFirst({
    where: session.user.id
      ? { id: session.user.id }
      : { email: session.user.email || undefined },
    select: {
      id: true,
      email: true,
      role: true,
    },
  });

  if (!user) {
    return {
      status: 'forbidden',
      session,
      user: null,
    };
  }

  return {
    status: isAdminRole(user.role) ? 'admin' : 'forbidden',
    session,
    user,
  };
}

export function adminAuthResponse(state: AdminAuthState) {
  if (state.status === 'unauthenticated') {
    return NextResponse.json(
      { error: 'Unauthorized: Authentication required' },
      { status: 401 },
    );
  }

  if (state.status === 'forbidden') {
    return NextResponse.json(
      { error: 'Forbidden: Admin access required' },
      { status: 403 },
    );
  }

  return null;
}

export async function requireAdminApi() {
  const auth = await getAdminAuthState();
  const response = adminAuthResponse(auth);

  return { auth, response };
}

export async function getAdminSession() {
  const auth = await getAdminAuthState();
  return auth.status === 'admin' ? auth.session : null;
}

export async function isAdminUser(): Promise<boolean> {
  const auth = await getAdminAuthState();
  return auth.status === 'admin';
}

export async function requireAdmin(): Promise<void> {
  const auth = await getAdminAuthState();

  if (auth.status !== 'admin') {
    throw new Error('Unauthorized: Admin access required');
  }
}

export function checkAdminSync(email?: string | null): boolean {
  return false;
}
