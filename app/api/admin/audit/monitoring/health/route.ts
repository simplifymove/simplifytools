// app/api/admin/audit/monitoring/health/route.ts
// Get overall platform health score

import { NextRequest, NextResponse } from 'next/server';
import { requireAdminApi } from '@/lib/auth/admin';
import { getLatestHealthScore } from '@/lib/services/health-score';
import { apiLogger } from '@/lib/logging/logger';

export async function GET(request: NextRequest) {
  try {
    const { response } = await requireAdminApi();
    if (response) return response;

    // Get latest health score
    const health = await getLatestHealthScore();

    return NextResponse.json(health);
  } catch (error) {
    apiLogger.error({ error }, 'GET /api/admin/audit/monitoring/health');
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const runtime = 'nodejs';
