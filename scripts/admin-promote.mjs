#!/usr/bin/env node

/**
 * Promote an existing user to ADMIN.
 *
 * Usage:
 *   npm run admin:promote -- --email=owner@example.com
 */

import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { PrismaClient } from '@prisma/client';

function loadEnvFile(fileName) {
  const filePath = resolve(process.cwd(), fileName);
  if (!existsSync(filePath)) return;

  const lines = readFileSync(filePath, 'utf8').split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const equalsIndex = trimmed.indexOf('=');
    if (equalsIndex === -1) continue;

    const key = trimmed.slice(0, equalsIndex).trim();
    let value = trimmed.slice(equalsIndex + 1).trim();

    if (!key || process.env[key] !== undefined) continue;

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    process.env[key] = value;
  }
}

loadEnvFile('.env.local');
loadEnvFile('.env');

const prisma = new PrismaClient();

function parseEmailArg(argv) {
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
    const message = error instanceof Error ? error.message : '';
    if (error?.code === 'P1001' || message.includes("Can't reach database server")) {
      console.error('[AdminPromote] Cannot reach the database. Check DATABASE_URL and make sure the database is running.');
    } else {
      console.error(`[AdminPromote] ${message || 'Failed to promote user.'}`);
    }
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
