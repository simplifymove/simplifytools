import { NextRequest, NextResponse } from 'next/server';
import { requireAdminApi } from '@/lib/auth/admin';
import { prisma } from '@/lib/prisma';

interface RouteParams {
  auditRunId: string;
}

function parseLogs(logs: string | null) {
  if (!logs) return {};
  try {
    return JSON.parse(logs);
  } catch {
    return {};
  }
}

function escapeCsv(value: unknown) {
  const text = String(value ?? '');
  return `"${text.replace(/"/g, '""')}"`;
}

function escapeHtml(value: unknown) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<RouteParams> }
) {
  const { response } = await requireAdminApi();
  if (response) return response;

  const { auditRunId } = await params;
  const format = new URL(req.url).searchParams.get('format') || 'json';

  const auditRun = await prisma.auditRun.findUnique({
    where: { id: auditRunId },
    include: {
      testResults: {
        orderBy: [{ category: 'asc' }, { toolName: 'asc' }],
      },
    },
  });

  if (!auditRun) {
    return NextResponse.json({ error: 'Audit run not found' }, { status: 404 });
  }

  const rows = auditRun.testResults.map((result) => {
    const logs = parseLogs(result.logs);
    return {
      category: result.category,
      toolTitle: result.toolName,
      toolSlug: result.toolSlug,
      url: result.url,
      status: result.status,
      durationMs: result.durationMs,
      failureClass: logs.failureClass || '',
      failureReason: result.errorMessage || '',
      screenshot: result.screenshotPath || '',
      consoleErrors: Array.isArray(logs.consoleErrors) ? logs.consoleErrors.join('\n') : '',
    };
  });

  const summary = {
    auditRunId: auditRun.id,
    categories: JSON.parse(auditRun.categories),
    status: auditRun.status,
    total: auditRun.totalTests,
    passed: auditRun.passedTests,
    failed: auditRun.failedTests,
    skipped: auditRun.skippedTests,
    passRate: auditRun.successPercentage,
    startedAt: auditRun.startedAt,
    completedAt: auditRun.completedAt,
  };

  if (format === 'csv') {
    const headers = ['category', 'toolTitle', 'toolSlug', 'url', 'status', 'durationMs', 'failureClass', 'failureReason', 'screenshot', 'consoleErrors'];
    const csv = [
      headers.join(','),
      ...rows.map((row) => headers.map((header) => escapeCsv(row[header as keyof typeof row])).join(',')),
    ].join('\n');

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="audit-${auditRun.id}.csv"`,
      },
    });
  }

  if (format === 'html') {
    const html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Audit ${escapeHtml(auditRun.id)}</title>
  <style>
    body{font-family:Arial,sans-serif;margin:32px;color:#111827}
    table{border-collapse:collapse;width:100%;font-size:13px}
    th,td{border:1px solid #d1d5db;padding:8px;text-align:left;vertical-align:top}
    th{background:#f3f4f6}
    .pass{color:#047857;font-weight:700}.fail{color:#b91c1c;font-weight:700}
  </style>
</head>
<body>
  <h1>Audit Report</h1>
  <p><strong>Run:</strong> ${escapeHtml(auditRun.id)} | <strong>Pass rate:</strong> ${escapeHtml(auditRun.successPercentage)}%</p>
  <table>
    <thead><tr><th>Category</th><th>Tool</th><th>Slug</th><th>URL</th><th>Status</th><th>Duration</th><th>Failure</th><th>Console Errors</th></tr></thead>
    <tbody>
      ${rows.map((row) => `<tr>
        <td>${escapeHtml(row.category)}</td>
        <td>${escapeHtml(row.toolTitle)}</td>
        <td>${escapeHtml(row.toolSlug)}</td>
        <td>${escapeHtml(row.url)}</td>
        <td class="${row.status === 'PASS' ? 'pass' : 'fail'}">${escapeHtml(row.status)}</td>
        <td>${escapeHtml(row.durationMs)}ms</td>
        <td>${escapeHtml(row.failureClass || row.failureReason)}</td>
        <td>${escapeHtml(row.consoleErrors)}</td>
      </tr>`).join('')}
    </tbody>
  </table>
</body>
</html>`;

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `attachment; filename="audit-${auditRun.id}.html"`,
      },
    });
  }

  return NextResponse.json({ summary, results: rows }, {
    headers: {
      'Content-Disposition': `attachment; filename="audit-${auditRun.id}.json"`,
    },
  });
}
