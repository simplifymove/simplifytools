import { NextRequest, NextResponse } from 'next/server';
import { requireAdminApi } from '@/lib/auth/admin';
import { prisma } from '@/lib/prisma';
import { apiLogger as logger } from '@/lib/logging/logger';
import { redactAuditText, serializeAuditTestResult } from '@/lib/services/audit-response';

export async function GET(req: NextRequest) {
  try {
    const { response } = await requireAdminApi();
    if (response) return response;

    const { searchParams } = new URL(req.url);
    const auditRunId = searchParams.get('auditRunId');
    const category = searchParams.get('category');

    if (!auditRunId) {
      return NextResponse.json(
        { error: 'auditRunId required' },
        { status: 400 }
      );
    }

    // Fetch test results for this audit run
    const query: any = {
      where: { auditRunId },
      orderBy: { timestamp: 'desc' },
    };

    if (category) {
      query.where.category = category;
    }

    const testResults = await prisma.auditTestResult.findMany(query);

    // Get summary by category
    const summary = await prisma.auditTestResult.groupBy({
      by: ['category', 'status'],
      where: { auditRunId },
      _count: true,
    });

    // Get failure records
    const failures = await prisma.failureRecord.findMany({
      where: { auditRunId },
      orderBy: { lastSeenAt: 'desc' },
    });

    return NextResponse.json({
      auditRunId,
      testResults: testResults.map((tr) => {
        const serialized = serializeAuditTestResult(tr);
        return { ...serialized, logs: serialized.logs ? JSON.parse(serialized.logs) : null };
      }),
      summary: summary.map((s) => ({
        category: s.category,
        status: s.status,
        count: s._count,
      })),
      failureRecords: failures.map((f) => ({
        id: f.id,
        toolName: f.toolName,
        category: f.category,
        testName: f.testName,
        failureType: f.failureType,
        failureReason: redactAuditText(f.failureReason),
        isFlaky: f.isFlaky,
        occurrenceCount: f.occurrenceCount,
        firstSeenAt: f.firstSeenAt,
        lastSeenAt: f.lastSeenAt,
      })),
      stats: {
        total: testResults.length,
        passed: testResults.filter((t) => t.status === 'PASS').length,
        failed: testResults.filter((t) => t.status === 'FAIL').length,
        skipped: testResults.filter((t) => t.status === 'SKIPPED').length,
        error: testResults.filter((t) => t.status === 'ERROR').length,
        avgDuration: testResults.length 
          ? Math.round(testResults.reduce((sum, t) => sum + t.durationMs, 0) / testResults.length)
          : 0,
      },
    });
  } catch (error) {
    logger.error(error, 'Failed to fetch test results');
    return NextResponse.json(
      { error: 'Failed to fetch results' },
      { status: 500 }
    );
  }
}
