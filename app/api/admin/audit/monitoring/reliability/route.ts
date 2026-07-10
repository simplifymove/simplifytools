// app/api/admin/audit/monitoring/reliability/route.ts
// Get tool reliability scores

import { NextRequest, NextResponse } from 'next/server';
import { requireAdminApi } from '@/lib/auth/admin';
import { getTopFailingTools, getCategoryReliability } from '@/lib/services/reliability';
import { apiLogger } from '@/lib/logging/logger';

export async function GET(request: NextRequest) {
  try {
    const { response } = await requireAdminApi();
    if (response) return response;

    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');

    let data;

    if (category) {
      // Get reliability for specific category
      data = await getCategoryReliability(category);
    } else {
      // Get top failing tools across all categories
      const failing = await getTopFailingTools(20);
      data = {
        topFailing: failing,
        count: failing.length,
      };
    }

    return NextResponse.json(data);
  } catch (error) {
    apiLogger.error({ error }, 'GET /api/admin/audit/monitoring/reliability');
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const runtime = 'nodejs';
