// app/api/admin/audit/monitoring/flaky/route.ts
// Get flaky test analysis

import { NextRequest, NextResponse } from 'next/server';
import { requireAdminApi } from '@/lib/auth/admin';
import {
  getFlakyTests,
  getTimeoutHeavyTools,
  detectRandomFailures,
} from '@/lib/services/flaky-detection';
import { apiLogger } from '@/lib/logging/logger';

export async function GET(request: NextRequest) {
  try {
    const { response } = await requireAdminApi();
    if (response) return response;

    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type') || 'all';

    let data;

    if (type === 'timeout') {
      // Get timeout-heavy tools
      data = await getTimeoutHeavyTools();
    } else if (type === 'random') {
      // Get tools with random pass/fail patterns
      const toolName = searchParams.get('tool');
      if (!toolName) {
        return NextResponse.json(
          { error: 'Tool name required for random failure detection' },
          { status: 400 }
        );
      }
      data = await detectRandomFailures(toolName);
    } else {
      // Get all flaky tests
      const threshold = parseInt(searchParams.get('threshold') || '30');
      data = await getFlakyTests(threshold);
    }

    return NextResponse.json(data);
  } catch (error) {
    apiLogger.error({ error }, 'GET /api/admin/audit/monitoring/flaky');
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const runtime = 'nodejs';
