#!/usr/bin/env node

/**
 * Promote an existing user to ADMIN.
 *
 * Usage:
 *   npm run admin:promote -- --email=owner@example.com
 */

import { prisma } from '@/lib/prisma';

function parseEmailArg(argv: string[]) {
  const emailArg = argv.find((arg) => arg.startsWith('--email='));
  const email = emailArg?.slice('--email='.length).trim().toLowerCase();

  if (!email) {
    throw new Error('Missing required --email argument. Example: npm run admin:promote -- --email=owner@example.com');
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error('Invalid email address.');
  }

  return email;
}

async function main() {
  const email = parseEmailArg(process.argv.slice(2));

  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      role: true,
    },
  });

  if (!user) {
    throw new Error(`No user exists for email ${email}. Create the user through normal sign-up/sign-in first.`);
  }

  if (user.role?.toLowerCase() === 'admin') {
    console.log(`[AdminPromote] User ${user.email} is already ADMIN.`);
    return;
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { role: 'ADMIN' },
    select: {
      id: true,
      email: true,
      role: true,
    },
  });

  console.log(`[AdminPromote] Promoted ${updated.email} to ${updated.role}.`);
}

main()
  .catch((error) => {
    console.error(`[AdminPromote] ${error instanceof Error ? error.message : 'Failed to promote user.'}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
