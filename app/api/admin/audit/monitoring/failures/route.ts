// app/api/admin/audit/monitoring/failures/route.ts
// Get failure analysis

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { isAdminUser } from '@/lib/auth/admin';
import { getFailureStats, getMostCommonFailures } from '@/lib/services/failure-classifier';
import { apiLogger } from '@/lib/logging/logger';

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized: Authentication required' },
        { status: 401 }
      );
    }

    // Check admin authorization
    const isAdmin = await isAdminUser();
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized: Admin access required' },
        { status: 403 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type') || 'stats';

    let data;

    if (type === 'common') {
      // Get most common failures
      const limit = parseInt(searchParams.get('limit') || '10');
      data = await getMostCommonFailures(limit);
    } else {
      // Get general failure statistics
      data = await getFailureStats();
    }

    return NextResponse.json(data);
  } catch (error) {
    apiLogger.error({ error }, 'GET /api/admin/audit/monitoring/failures');
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const runtime = 'nodejs';
