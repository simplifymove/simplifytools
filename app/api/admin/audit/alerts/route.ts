// app/api/admin/audit/alerts/route.ts
// Get alerts and alert logs

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { isAdminUser } from '@/lib/auth/admin';
import { prisma } from '@/lib/prisma';
import { getAlertHistory } from '@/lib/services/alerting';
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
    const type = searchParams.get('type') || 'logs';
    const limit = parseInt(searchParams.get('limit') || '50');

    if (type === 'rules') {
      // Get alerting rules
      const rules = await prisma.alertingRule.findMany({
        orderBy: { lastTriggeredAt: 'desc' },
        take: limit,
      });
      return NextResponse.json({ rules });
    }

    // Get alert logs
    const logs = await getAlertHistory(limit);
    return NextResponse.json({ logs });
  } catch (error) {
    apiLogger.error({ error }, 'GET /api/admin/audit/alerts');
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const runtime = 'nodejs';
