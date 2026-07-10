// app/api/admin/audit/recovery/route.ts
// Get recovery status and manage recovery operations

import { NextRequest, NextResponse } from 'next/server';
import { requireAdminApi } from '@/lib/auth/admin';
import {
  getRecoveryStats,
  runFullRecoveryCycle,
  detectAndRecoverStalledJobs,
} from '@/lib/services/auto-recovery';
import { apiLogger } from '@/lib/logging/logger';

export async function GET(request: NextRequest) {
  try {
    const { response } = await requireAdminApi();
    if (response) return response;

    const stats = await getRecoveryStats();
    return NextResponse.json(stats);
  } catch (error) {
    apiLogger.error({ error }, 'GET /api/admin/audit/recovery');
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { response } = await requireAdminApi();
    if (response) return response;

    const body = await request.json();
    const action = body.action || 'full';

    if (action === 'stalled') {
      await detectAndRecoverStalledJobs();
      return NextResponse.json({ success: true, action: 'stalled' });
    }

    if (action === 'full' || action === 'recovery') {
      await runFullRecoveryCycle();
      return NextResponse.json({ success: true, action: 'full' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    apiLogger.error({ error }, 'POST /api/admin/audit/recovery');
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const runtime = 'nodejs';
