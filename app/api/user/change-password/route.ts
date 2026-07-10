import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import bcrypt from 'bcrypt';
import { authOptions } from '@/lib/auth/config';
import { prisma } from '@/lib/prisma';

interface ChangePasswordRequest {
  currentPassword?: unknown;
  newPassword?: unknown;
  confirmNewPassword?: unknown;
}

const passwordSaltRounds = 12;
const googleOnlyPasswordMessage = 'This account uses Google Sign-In and does not currently have a password.';

function readPassword(value: unknown) {
  return typeof value === 'string' ? value : '';
}

async function getAuthenticatedUser() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return null;
  }

  return prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      id: true,
      provider: true,
      hashedPassword: true,
      accounts: {
        select: { provider: true },
      },
    },
  });
}

function usesGoogleSignIn(user: Awaited<ReturnType<typeof getAuthenticatedUser>>) {
  if (!user) return false;

  return (
    user.provider?.toLowerCase() === 'google' ||
    user.accounts.some((account) => account.provider.toLowerCase() === 'google')
  );
}

export async function GET() {
  try {
    const user = await getAuthenticatedUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const isGoogleLinked = usesGoogleSignIn(user);

    return NextResponse.json({
      hasPassword: Boolean(user.hashedPassword),
      usesGoogleSignIn: isGoogleLinked,
      canCreatePassword: isGoogleLinked && !user.hashedPassword,
    });
  } catch (error) {
    console.error('[change-password] Unable to load password status:', error);
    return NextResponse.json({ error: 'Unable to load account security status.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = (await request.json()) as ChangePasswordRequest;
    const currentPassword = readPassword(body.currentPassword);
    const newPassword = readPassword(body.newPassword);
    const confirmNewPassword = readPassword(body.confirmNewPassword);
    const isCreatingPassword = !user.hashedPassword && usesGoogleSignIn(user);

    if (!user.hashedPassword && !isCreatingPassword) {
      return NextResponse.json({ error: googleOnlyPasswordMessage }, { status: 400 });
    }

    if ((!isCreatingPassword && !currentPassword) || !newPassword || !confirmNewPassword) {
      return NextResponse.json({ error: 'All password fields are required.' }, { status: 400 });
    }

    if (newPassword.length < 8) {
      return NextResponse.json({ error: 'New password must be at least 8 characters.' }, { status: 400 });
    }

    if (newPassword !== confirmNewPassword) {
      return NextResponse.json({ error: 'Confirm new password must match.' }, { status: 400 });
    }

    if (isCreatingPassword) {
      const hashedPassword = await bcrypt.hash(newPassword, passwordSaltRounds);

      await prisma.user.update({
        where: { id: user.id },
        data: { hashedPassword },
      });

      return NextResponse.json({ success: true, hasPassword: true });
    }

    if (!user.hashedPassword) {
      return NextResponse.json({ error: googleOnlyPasswordMessage }, { status: 400 });
    }

    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.hashedPassword);

    if (!isCurrentPasswordValid) {
      return NextResponse.json({ error: 'Current password is incorrect.' }, { status: 400 });
    }

    const isReusingCurrentPassword = await bcrypt.compare(newPassword, user.hashedPassword);

    if (isReusingCurrentPassword) {
      return NextResponse.json(
        { error: 'New password must be different from your current password.' },
        { status: 400 },
      );
    }

    const hashedPassword = await bcrypt.hash(newPassword, passwordSaltRounds);

    await prisma.user.update({
      where: { id: user.id },
      data: { hashedPassword },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[change-password] Unable to change password:', error);
    return NextResponse.json({ error: 'Unable to change password right now.' }, { status: 500 });
  }
}
