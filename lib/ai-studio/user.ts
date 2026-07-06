import { prisma } from '@/lib/prisma';

export function normalizeAiStudioEmail(email?: string | null) {
  return typeof email === 'string' ? email.trim().toLowerCase() : '';
}

export async function findAiStudioUserByEmail(email?: string | null) {
  const normalizedEmail = normalizeAiStudioEmail(email);

  if (!normalizedEmail) {
    return null;
  }

  return prisma.user.findFirst({
    where: {
      email: {
        equals: normalizedEmail,
        mode: 'insensitive',
      },
    },
    select: {
      id: true,
      email: true,
      role: true,
      subscription: {
        select: {
          planName: true,
          status: true,
          expiresAt: true,
        },
      },
    },
  });
}
