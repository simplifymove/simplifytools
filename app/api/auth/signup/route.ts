import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { prisma } from '@/lib/prisma';

interface SignupRequest {
  name?: unknown;
  email?: unknown;
  password?: unknown;
  confirmPassword?: unknown;
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordSaltRounds = 12;

function cleanString(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as SignupRequest;
    const name = cleanString(body.name);
    const email = cleanString(body.email).toLowerCase();
    const password = typeof body.password === 'string' ? body.password : '';
    const confirmPassword = typeof body.confirmPassword === 'string' ? body.confirmPassword : '';

    if (!name || !email || !password || !confirmPassword) {
      return NextResponse.json({ error: 'All fields are required.' }, { status: 400 });
    }

    if (!emailPattern.test(email)) {
      return NextResponse.json({ error: 'Enter a valid email address.' }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters.' }, { status: 400 });
    }

    if (password !== confirmPassword) {
      return NextResponse.json({ error: 'Confirm password must match.' }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        hashedPassword: true,
        accounts: {
          select: { provider: true },
        },
      },
    });

    if (existingUser) {
      if (existingUser.hashedPassword) {
        return NextResponse.json({ error: 'An account with this email already exists.' }, { status: 409 });
      }

      if (existingUser.accounts.some((account) => account.provider === 'google')) {
        return NextResponse.json({ error: 'This email is already registered using Google Sign-In.' }, { status: 409 });
      }

      return NextResponse.json({ error: 'An account with this email already exists.' }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, passwordSaltRounds);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        hashedPassword,
        provider: 'credentials',
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    console.error('[manual-signup] Registration failed:', error);

    return NextResponse.json({ error: 'Unable to create account right now.' }, { status: 500 });
  }
}
