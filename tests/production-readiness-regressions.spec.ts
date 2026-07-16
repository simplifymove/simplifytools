import { expect, test } from '@playwright/test';
import { NextRequest } from 'next/server';
import { createConvertedFilename, generateOutputFilename, normalizeFileExtension } from '../app/lib/data-validation';
import { getAuditCategoryTargets } from '../app/lib/audit-category-tools';
import { handleImageToolErrorReport } from '../app/utils/error-reporting/handle-image-error-report';
import { classifyErrorReport } from '../app/utils/error-reporting/classify-error';
import { ErrorReportSource } from '../app/utils/types/errors';
import {
  sanitizeAuditValue,
  serializeAuditArtifact,
  serializeAuditRun,
  serializeAuditTestResult,
} from '../lib/services/audit-response';
import { persistAuditToolResult, type AuditTestResultStore } from '../lib/services/audit-result-persistence';
import { markerToIndividualTestResult } from '../lib/services/test-execution';
import { AUDIT_REQUEST_HEADER, createAuditRequestToken } from '../lib/security/audit-request';

const PRIVATE_PATHS = ['C:\\simplifytools\\test-results\\output.pdf', '/var/www/simplifyconvertapp/output.pdf', '/tmp/audit/output.pdf'];

function expectNoPrivatePaths(payload: unknown) {
  const json = JSON.stringify(payload);
  for (const privatePath of PRIVATE_PATHS) expect(json).not.toContain(privatePath);
  expect(json).not.toContain('outputPath');
  expect(json).not.toContain('filePath');
  expect(json).not.toContain('reportJsonPath');
}

test('audit result and manual-trigger serializers never expose filesystem paths', () => {
  const result = serializeAuditTestResult({
    id: 'result-1', auditRunId: 'run-1', category: 'pdf-tools', toolName: 'Compress PDF', toolSlug: 'compress-pdf',
    url: '/all-tools/pdf/compress-pdf', testCase: 'functional', status: 'PASS', errorMessage: PRIVATE_PATHS[1],
    outputGenerated: true, outputType: 'application/pdf', outputPath: PRIVATE_PATHS[1], screenshotPath: PRIVATE_PATHS[2],
    durationMs: 1200, timestamp: new Date(), logs: JSON.stringify({ outputPath: PRIVATE_PATHS[0], evidence: { filePath: PRIVATE_PATHS[2], message: PRIVATE_PATHS[1] } }),
  });
  expectNoPrivatePaths(result);
  expect(result.screenshotPath).toBeNull();
});

test('report details and artifact responses contain safe metadata only', () => {
  const report = serializeAuditRun({
    id: 'run-1', categories: '["pdf-tools"]', status: 'COMPLETED', totalTests: 1, passedTests: 1,
    failedTests: 0, errorTests: 0, skippedTests: 0, successPercentage: 100, errorMessage: PRIVATE_PATHS[1],
    reportJsonPath: PRIVATE_PATHS[1], reportHtmlPath: PRIVATE_PATHS[2], reportCsvPath: PRIVATE_PATHS[0],
  });
  const artifact = serializeAuditArtifact({
    id: 'artifact-1', auditRunId: 'run-1', toolName: 'Tool', category: 'pdf-tools', testName: 'test', type: 'output',
    mimeType: 'application/pdf', fileSize: 123, filePath: PRIVATE_PATHS[1], s3Path: PRIVATE_PATHS[2],
    downloadUrl: '/api/admin/audit/artifacts/artifact-1?download=true', createdAt: new Date(), expiresAt: new Date(),
  });
  expectNoPrivatePaths({ report, artifact });
  expect(artifact.downloadUrl).toContain('/api/');
});

test('generated JSON evidence recursively removes raw server paths', () => {
  const exported = sanitizeAuditValue({
    functionalEvidence: { outputPath: PRIVATE_PATHS[1], command: `convert ${PRIVATE_PATHS[2]}`, nested: [{ filePath: PRIVATE_PATHS[0] }] },
  });
  expectNoPrivatePaths(exported);
  expect(JSON.stringify(exported)).toContain('[REDACTED_PATH]');
});

test('data-conversion filenames have exactly one extension separator', () => {
  expect(normalizeFileExtension('.xlsx')).toBe('.xlsx');
  expect(createConvertedFilename('.xlsx')).toBe('converted.xlsx');
  expect(createConvertedFilename('.xml')).toBe('converted.xml');
  expect(createConvertedFilename('json')).toBe('converted.json');
  expect(generateOutputFilename('csv-to-excel', 'source.csv')).toBe('source.xlsx');
  expect(generateOutputFilename('json-to-xml', 'source.json')).toBe('source.xml');
  expect(generateOutputFilename('xml-to-json', 'source.xml')).toBe('source.json');
});

test('Text-to-Speech is classified as a Bing external dependency', () => {
  const target = getAuditCategoryTargets('text-to-speech')[0];
  expect(target.functionalAudit.executionClass).toBe('EXTERNAL_CONFIGURED');
  expect(target.functionalAudit.externalProvider).toBe('Bing Speech');
  expect(target.functionalAudit.rateSensitive).toBe(true);
});

test('audit image errors are recorded without sending user email while genuine browser errors still send', async () => {
  process.env.AUDIT_REQUEST_SECRET = 'functional-audit-regression-secret';
  const payload = JSON.stringify({
    toolId: 'gif-to-mp4', toolName: 'GIF to MP4', errorType: 'SHARP_FAILED', errorMessage: 'Conversion failed',
  });
  let emailCalls = 0;
  const sendEmail = async () => { emailCalls++; return true; };
  const auditResponse = await handleImageToolErrorReport(new NextRequest('http://localhost/api/image-tools/report-error', {
    method: 'POST',
    headers: { 'content-type': 'application/json', [AUDIT_REQUEST_HEADER]: createAuditRequestToken() },
    body: payload,
  }), sendEmail);
  expect(auditResponse.status).toBe(202);
  expect(emailCalls).toBe(0);

  const browserResponse = await handleImageToolErrorReport(new NextRequest('http://localhost/api/image-tools/report-error', {
    method: 'POST', headers: { 'content-type': 'application/json' }, body: payload,
  }), sendEmail);
  expect(browserResponse.status).toBe(200);
  expect(emailCalls).toBe(1);
});

test('image error classification rejects unsupported SHARP_FAILED claims', () => {
  expect(classifyErrorReport({ toolId: 'gif-to-mp4', reportedType: 'SHARP_FAILED', errorMessage: 'Conversion failed' }).source)
    .toBe(ErrorReportSource.FFMPEG_FAILED);
  expect(classifyErrorReport({ toolId: 'image-to-text', reportedType: 'SHARP_FAILED', errorMessage: 'Image processing failed' }).source)
    .toBe(ErrorReportSource.API_ROUTE_ERROR);
  expect(classifyErrorReport({ toolId: 'blur-background', reportedType: 'SHARP_FAILED', errorMessage: 'Processing failed' }).source)
    .toBe(ErrorReportSource.CONVERSION_FAILED);
  expect(classifyErrorReport({ toolId: 'resize-image', reportedType: 'SHARP_FAILED', errorMessage: 'sharp: invalid image' }).source)
    .toBe(ErrorReportSource.SHARP_FAILED);
});

test('emitted audit tool results survive interruption and cannot collapse to zero', async () => {
  const rows: Array<Record<string, any> & { id: string }> = [];
  const store: AuditTestResultStore = {
    findFirst: async ({ where }) => rows.find((row) => row.auditRunId === where.auditRunId && row.category === where.category && row.toolSlug === where.toolSlug) || null,
    create: async ({ data }) => { rows.push({ id: `row-${rows.length + 1}`, ...data }); },
    update: async ({ where, data }) => { Object.assign(rows.find((row) => row.id === where.id)!, data); },
  };
  const markers = [
    { toolSlug: 'completed-tool', toolTitle: 'Completed Tool', status: 'passed', durationMs: 120, index: 1, total: 3 },
    { toolSlug: 'failed-tool', toolTitle: 'Failed Tool', status: 'failed', reason: 'Backend failed', durationMs: 200, index: 2, total: 3 },
  ];
  for (const marker of markers) {
    await persistAuditToolResult(store, 'run-partial', 'image-tools', markerToIndividualTestResult(marker, 'image-tools'));
  }
  expect(rows).toHaveLength(2);
  expect(rows.map((row) => row.status)).toEqual(['PASS', 'FAIL']);
  expect(rows.length).toBeGreaterThan(0);
});
