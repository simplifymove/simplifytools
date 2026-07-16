// app/api/admin/audit/artifacts/route.ts
// Get all artifacts with filtering

import { NextRequest, NextResponse } from 'next/server';
import { requireAdminApi } from '@/lib/auth/admin';
import { prisma } from '@/lib/prisma';
import { apiLogger } from '@/lib/logging/logger';
import { serializeAuditArtifact } from '@/lib/services/audit-response';

export async function GET(request: NextRequest) {
  try {
    const { response } = await requireAdminApi();
    if (response) return response;

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

    return NextResponse.json(artifacts.map(serializeAuditArtifact));
  } catch (error) {
    apiLogger.error({ error }, 'GET /api/admin/audit/artifacts');
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const runtime = 'nodejs';
