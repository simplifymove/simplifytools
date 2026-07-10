// app/api/admin/audit/enqueue/route.ts
// Phase 6: Enqueue audit job instead of running synchronously

import { NextRequest, NextResponse } from 'next/server';
import { requireAdminApi } from '@/lib/auth/admin';
import { enqueueAuditJob } from '@/lib/queue/client';
import { prisma } from '@/lib/prisma';

const ALLOWED_CATEGORIES = [
  'pdf',
  'image',
  'video',
  'ai-writing',
  'document',
  'converter',
  'compression',
  'extraction',
  'validation',
  'formatting',
  'optimization',
];

export async function POST(request: NextRequest) {
  try {
    const { auth, response } = await requireAdminApi();
    if (response) return response;
    const adminUser = auth.user!;

    // Parse request body
    const { categories } = await request.json();

    // Validate input
    if (!categories || !Array.isArray(categories) || categories.length === 0) {
      return NextResponse.json(
        { error: 'No categories provided' },
        { status: 400 }
      );
    }

    // Validate categories
    const invalidCategories = categories.filter(
      (cat: string) => !ALLOWED_CATEGORIES.includes(cat)
    );
    if (invalidCategories.length > 0) {
      return NextResponse.json(
        { error: `Invalid categories: ${invalidCategories.join(', ')}` },
        { status: 400 }
      );
    }

    // Create AuditRun first
    const auditRun = await prisma.auditRun.create({
      data: {
        userId: adminUser.id,
        categories: JSON.stringify(categories),
        status: 'PENDING',
      },
    });

    // Create AuditJob record
    const auditJob = await prisma.auditJob.create({
      data: {
        auditRunId: auditRun.id,
        userId: adminUser.id,
        categories,
        status: 'PENDING',
      },
    });

    // Enqueue the job
    try {
      const queueJobId = await enqueueAuditJob(
        auditRun.id,
        auditJob.id,
        adminUser.id,
        categories
      );

      return NextResponse.json(
        {
          jobId: auditJob.id,
          queueId: queueJobId,
          status: 'enqueued',
          message: 'Audit test job enqueued successfully',
        },
        { status: 202 } // 202 Accepted for async operations
      );
    } catch (queueError) {
      // Clean up if queueing fails
      await prisma.auditJob.delete({
        where: { id: auditJob.id },
      });

      console.error('Failed to enqueue job:', queueError);
      return NextResponse.json(
        { error: 'Failed to enqueue job. Job queue may be unavailable.' },
        { status: 503 }
      );
    }
  } catch (error) {
    console.error('Error in POST /api/admin/audit/enqueue:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const runtime = 'nodejs';
