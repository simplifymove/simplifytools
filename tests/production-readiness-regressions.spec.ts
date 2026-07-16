import { expect, test } from '@playwright/test';
import { createConvertedFilename, generateOutputFilename, normalizeFileExtension } from '../app/lib/data-validation';
import { getAuditCategoryTargets } from '../app/lib/audit-category-tools';
import {
  sanitizeAuditValue,
  serializeAuditArtifact,
  serializeAuditRun,
  serializeAuditTestResult,
} from '../lib/services/audit-response';

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
