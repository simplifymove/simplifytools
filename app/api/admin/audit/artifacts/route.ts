// app/api/admin/audit/artifacts/route.ts
// Get all artifacts with filtering

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { isAdminUser } from '@/lib/auth/admin';
import { prisma } from '@/lib/prisma';
import { apiLogger } from '@/lib/logging/logger';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!await isAdminUser()) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const searchParams = request.nextUrl.searchParams;
    const toolName = searchParams.get('tool');
    const type = searchParams.get('type');
    const auditRunId = searchParams.get('auditRunId');
    const limit = parseInt(searchParams.get('limit') || '50');

    const artifacts = await prisma.playwrightArtifact.findMany({
      where: {
        ...(toolName && { toolName }),
        ...(type && { type }),
        ...(auditRunId && { auditRunId }),
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return NextResponse.json(artifacts);
  } catch (error) {
    apiLogger.error({ error }, 'GET /api/admin/audit/artifacts');
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const runtime = 'nodejs';
