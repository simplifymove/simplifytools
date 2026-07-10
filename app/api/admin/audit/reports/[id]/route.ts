import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminApi } from '@/lib/auth/admin';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { response } = await requireAdminApi();
    if (response) return response;

    const { id } = await params;

    // Get audit run with all test results
    const auditRun = await prisma.auditRun.findUnique({
      where: { id },
      include: {
        testResults: {
          orderBy: {
            timestamp: 'desc',
          },
        },
        user: {
          select: {
            email: true,
            name: true,
          },
        },
      },
    });

    if (!auditRun) {
      return NextResponse.json(
        { error: 'Audit run not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ...auditRun,
      categories: JSON.parse(auditRun.categories),
      testResults: auditRun.testResults.map((result) => ({
        ...result,
        logs: result.logs ? JSON.parse(result.logs) : null,
      })),
    });
  } catch (error) {
    console.error('[Audit] Failed to fetch report:', error);
    return NextResponse.json(
      { error: 'Failed to fetch report' },
      { status: 500 }
    );
  }
}
