// app/api/admin/audit/monitoring/queue/route.ts
// Get real-time queue status

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { isAdminUser } from '@/lib/auth/admin';
import { checkQueueHealth } from '@/lib/queue/client';
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

    // Get queue health
    const health = await checkQueueHealth();

    return NextResponse.json({
      connected: health.connected,
      redis: health.redis,
      queue: health.queue,
      active: health.active,
      pending: health.pending,
      completed: health.completed,
      failed: health.failed,
      delayed: health.delayed,
      total: health.total,
      timestamp: new Date(),
    });
  } catch (error) {
    apiLogger.error({ error }, 'GET /api/admin/audit/monitoring/queue');
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const runtime = 'nodejs';
