'use client';

import { Download, X } from 'lucide-react';

interface AuditResult {
  id: string;
  category: string;
  toolName: string;
  toolSlug: string;
  url: string;
  testCase: string;
  status: string;
  errorMessage?: string | null;
  screenshotPath?: string | null;
  durationMs: number;
  logs?: string | null;
}

interface AuditDetails {
  auditRun: {
    id: string;
    categories: string[];
    status: string;
    errorMessage?: string | null;
    commandError?: {
      type?: 'audit-command-error' | 'audit-partial';
      message?: string;
      expectedTools?: number;
      completedTools?: number;
      passedTools?: number;
      failedTools?: number;
      errorTools?: number;
    } | null;
  };
  stats: {
    totalTests: number;
    passedTests: number;
    failedTests: number;
    skippedTests: number;
    successPercentage: number;
  };
  testResults: AuditResult[];
  comparison?: {
    previousAuditRunId?: string | null;
    newFailures: string[];
    fixedFailures: string[];
    previousPassRate?: number | null;
    currentPassRate: number;
    healthPercent: number;
    passRateTrend?: number | null;
    statusChanges?: Array<{ category: string; toolSlug: string; previous: string; current: string }>;
    durationRegressions?: Array<{ category: string; toolSlug: string; previousMs: number; currentMs: number; percentSlower: number }>;
    outputSizeRegressions?: Array<{ category: string; toolSlug: string; previousBytes: number; currentBytes: number; percentChange: number }>;
    mimeOrExtensionChanges?: Array<{ category: string; toolSlug: string; previous: string; current: string }>;
    newConsoleErrors?: Array<{ category: string; toolSlug: string; errors: string[] }>;
    newApiErrors?: Array<{ category: string; toolSlug: string; errors: string[] }>;
  };
}

interface Props {
  details: AuditDetails | null;
  loading: boolean;
  onClose: () => void;
}

function parseLogs(logs?: string | null) {
  if (!logs) return {};
  try {
    return JSON.parse(logs);
  } catch {
    return {};
  }
}

function formatDuration(ms?: number) {
  if (!ms) return '-';
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

export function AuditDetailsPanel({ details, loading, onClose }: Props) {
  if (!loading && !details) return null;

  const categorySummaries = details?.testResults.reduce((acc, result) => {
    const current = acc[result.category] || { total: 0, passed: 0, failed: 0, skipped: 0 };
    current.total += 1;
    if (result.status === 'PASS') current.passed += 1;
    else if (result.status === 'SKIPPED') current.skipped += 1;
    else current.failed += 1;
    acc[result.category] = current;
    return acc;
  }, {} as Record<string, { total: number; passed: number; failed: number; skipped: number }> ) || {};
  const verificationSummary = details?.testResults.reduce((summary, result) => {
    const logs = parseLogs(result.logs) as Record<string, any>;
    if (logs.pageHealth === 'PASS') summary.pageHealthPassed += 1;
    if (logs.functionalProcessing === 'PASS') summary.functionalProcessingPassed += 1;
    if (logs.outputValidation === 'PASS') summary.outputValidationPassed += 1;
    const outcome = logs.auditOutcome;
    if (outcome === 'FULLY_VERIFIED') summary.fullyVerified += 1;
    else if (outcome === 'SKIPPED_EXTERNAL') summary.skippedExternal += 1;
    else if (outcome === 'NOT_CONFIGURED') summary.notConfigured += 1;
    else if (outcome === 'RATE_LIMITED') summary.rateLimited += 1;
    else if (outcome === 'PROVIDER_UNAVAILABLE') summary.providerUnavailable += 1;
    else if (outcome === 'PAID_PROVIDER_DISABLED') summary.paidProviderDisabled += 1;
    else if (outcome === 'FAILED' || result.status === 'FAIL' || result.status === 'ERROR') summary.failed += 1;
    return summary;
  }, { pageHealthPassed: 0, functionalProcessingPassed: 0, outputValidationPassed: 0, fullyVerified: 0, skippedExternal: 0, notConfigured: 0, rateLimited: 0, providerUnavailable: 0, paidProviderDisabled: 0, failed: 0 }) ||
    { pageHealthPassed: 0, functionalProcessingPassed: 0, outputValidationPassed: 0, fullyVerified: 0, skippedExternal: 0, notConfigured: 0, rateLimited: 0, providerUnavailable: 0, paidProviderDisabled: 0, failed: 0 };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-8">
      <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">Audit Details</h3>
          <p className="text-xs text-gray-500 mt-1">
            {details ? `Run ${details.auditRun.id}` : 'Loading audit details...'}
          </p>
        </div>
        <button onClick={onClose} className="p-2 text-gray-500 hover:bg-gray-100 rounded">
          <X size={16} />
        </button>
      </div>

      {loading && <div className="p-6 text-sm text-gray-600">Loading results...</div>}

      {details && !loading && (
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              ['Page Health Passed', verificationSummary.pageHealthPassed, 'text-blue-700'],
              ['Functional Processing Passed', verificationSummary.functionalProcessingPassed, 'text-blue-700'],
              ['Output Validation Passed', verificationSummary.outputValidationPassed, 'text-blue-700'],
              ['Fully Verified', verificationSummary.fullyVerified, 'text-green-700'],
              ['Skipped External', verificationSummary.skippedExternal, 'text-gray-700'],
              ['Not Configured', verificationSummary.notConfigured, 'text-amber-700'],
              ['Rate Limited', verificationSummary.rateLimited, 'text-amber-700'],
              ['Provider Unavailable', verificationSummary.providerUnavailable, 'text-amber-700'],
              ['Paid Provider Disabled', verificationSummary.paidProviderDisabled, 'text-amber-700'],
              ['Failed', verificationSummary.failed, 'text-red-700'],
            ].map(([label, value, color]) => (
              <div key={String(label)} className="rounded-lg border border-gray-200 p-4">
                <div className="text-xs text-gray-500">{label}</div>
                <div className={`text-2xl font-bold ${color}`}>{value}</div>
              </div>
            ))}
          </div>

          <div className="rounded-lg border border-gray-200 p-4 text-sm text-gray-700">
            <div className="font-semibold text-gray-900">Regression comparison</div>
            <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
              <div>New failures: {details.comparison?.newFailures.length || 0}</div>
              <div>Fixed tools: {details.comparison?.fixedFailures.length || 0}</div>
              <div>Status changes: {details.comparison?.statusChanges?.length || 0}</div>
              <div>Duration warnings: {details.comparison?.durationRegressions?.length || 0}</div>
              <div>Output-size warnings: {details.comparison?.outputSizeRegressions?.length || 0}</div>
              <div>MIME/extension changes: {details.comparison?.mimeOrExtensionChanges?.length || 0}</div>
              <div>New console errors: {details.comparison?.newConsoleErrors?.length || 0}</div>
              <div>New API errors: {details.comparison?.newApiErrors?.length || 0}</div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {(['json', 'csv', 'html'] as const).map((format) => (
              <a
                key={format}
                href={`/api/admin/audit/results/${details.auditRun.id}/export?format=${format}`}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-800"
              >
                <Download size={14} />
                Export {format.toUpperCase()}
              </a>
            ))}
          </div>

          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Category Summary</h4>
            {details.auditRun.commandError && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
                <div className="font-semibold">
                  {details.auditRun.commandError.type === 'audit-partial'
                    ? 'Audit ended after partial completion'
                    : 'Audit command failed before completing tool checks'}
                </div>
                <div className="mt-1">{details.auditRun.commandError.message || details.auditRun.errorMessage}</div>
                <div className="mt-2 text-xs">
                  Expected {details.auditRun.commandError.expectedTools ?? details.stats.totalTests} tools,
                  completed {details.auditRun.commandError.completedTools ?? details.stats.totalTests}.
                </div>
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(categorySummaries).map(([category, summary]) => (
                <div key={category} className="rounded-lg border border-gray-200 p-3">
                  <div className="text-sm font-medium text-gray-900">{category}</div>
                  <div className="text-sm text-gray-600 mt-1">
                    {summary.passed} / {summary.total} passed
                    {summary.failed > 0 ? ` | ${summary.failed} failed` : ''}
                    {summary.skipped > 0 ? ` | ${summary.skipped} skipped` : ''}
                  </div>
                </div>
              ))}
              {Object.keys(categorySummaries).length === 0 && (
                <div className="rounded-lg border border-gray-200 p-3 text-sm text-gray-600">
                  No per-tool results were recorded for this run.
                </div>
              )}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-y border-gray-200">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-700">Tool</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-700">URL</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-700">Status</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-700">Duration</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-700">Failure</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-700">Functional evidence</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-700">Screenshot</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {details.testResults.map((result) => {
                  const logs = parseLogs(result.logs);
                  const consoleErrors = Array.isArray(logs.consoleErrors) ? logs.consoleErrors : [];
                  const evidence = logs.functionalEvidence && typeof logs.functionalEvidence === 'object'
                    ? logs.functionalEvidence as Record<string, any>
                    : null;

                  return (
                    <tr key={result.id}>
                      <td className="px-3 py-3">
                        <div className="text-sm font-medium text-gray-900">{result.toolName}</div>
                        <div className="text-xs text-gray-500">{result.toolSlug}</div>
                      </td>
                      <td className="px-3 py-3 text-xs text-gray-600 max-w-xs truncate">{result.url}</td>
                      <td className="px-3 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${result.status === 'PASS' ? 'bg-green-50 text-green-700' : result.status === 'SKIPPED' ? 'bg-gray-50 text-gray-700' : 'bg-red-50 text-red-700'}`}>
                          {result.status}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-sm text-gray-600">{formatDuration(result.durationMs)}</td>
                      <td className="px-3 py-3 text-xs text-gray-600 max-w-md">
                        <div className="font-medium text-gray-900">{logs.failureClass || '-'}</div>
                        <div className="line-clamp-2">{result.errorMessage}</div>
                        {consoleErrors.length > 0 && (
                          <div className="mt-1 text-red-600">{consoleErrors.length} console error(s)</div>
                        )}
                      </td>
                      <td className="px-3 py-3 text-xs text-gray-600 max-w-sm">
                        {evidence ? (
                          <div className="space-y-1">
                            <div>{evidence.fixtureEvidence?.length || 0} fixture(s) · {evidence.resultFlow || '-'}</div>
                            {evidence.output && <div>{evidence.output.filename} · {evidence.output.sizeBytes} B</div>}
                            {evidence.output?.sha256 && <div className="font-mono text-[10px]" title={evidence.output.sha256}>{evidence.output.sha256.slice(0, 16)}…</div>}
                            {evidence.renderedOutput && <div>Rendered {evidence.renderedOutput.length} characters</div>}
                            <div>Processing: {evidence.stages?.functionalProcessing || 'NOT_RUN'} · Output: {evidence.stages?.outputValidation || 'NOT_RUN'}</div>
                          </div>
                        ) : <span className="text-gray-400">No execution evidence</span>}
                      </td>
                      <td className="px-3 py-3 text-xs">
                        {result.screenshotPath ? (
                          <a className="text-blue-600 hover:underline" href={result.screenshotPath} target="_blank" rel="noreferrer">Open</a>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
