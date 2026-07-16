const PRIVATE_PATH_KEYS = new Set([
  'outputPath',
  'filePath',
  'reportHtmlPath',
  'reportJsonPath',
  'reportCsvPath',
  's3Path',
]);

const WINDOWS_PATH = /(?:file:\/\/\/)?[A-Za-z]:[\\/][^\r\n"'<>]*/g;
const UNIX_PRIVATE_PATH = /(?:file:\/\/)?\/(?:var\/www|tmp|home|root|opt|srv)(?:\/[^\s\r\n"'<>]*)?/g;

export function redactAuditText(value: unknown): string {
  return String(value ?? '')
    .replace(WINDOWS_PATH, '[REDACTED_PATH]')
    .replace(UNIX_PRIVATE_PATH, '[REDACTED_PATH]')
    .replace(/(authorization|api[_-]?key|token|secret|password)\s*[:=]\s*[^\s,;]+/gi, '$1=[REDACTED]')
    .replace(/\bsk-[A-Za-z0-9_-]{12,}\b/g, '[REDACTED_TOKEN]');
}

export function publicArtifactUrl(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  return value.startsWith('/api/') || value.startsWith('/artifacts/') ? value : null;
}

export function sanitizeAuditValue(value: unknown): unknown {
  if (typeof value === 'string') return redactAuditText(value);
  if (Array.isArray(value)) return value.map(sanitizeAuditValue);
  if (value instanceof Date) return value;
  if (!value || typeof value !== 'object') return value;

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>)
      .filter(([key]) => !PRIVATE_PATH_KEYS.has(key))
      .map(([key, child]) => [
        key,
        key === 'screenshotPath' || key === 'tracePath' || key === 'artifactPath'
          ? publicArtifactUrl(child)
          : sanitizeAuditValue(child),
      ]),
  );
}

export function sanitizeAuditLogs(logs: string | null): string | null {
  if (!logs) return null;
  try {
    return JSON.stringify(sanitizeAuditValue(JSON.parse(logs)));
  } catch {
    return redactAuditText(logs);
  }
}

export function parseSanitizedAuditLogs(logs: string | null): unknown {
  const sanitized = sanitizeAuditLogs(logs);
  if (!sanitized) return null;
  try { return JSON.parse(sanitized); } catch { return sanitized; }
}

export function serializeAuditTestResult(result: Record<string, any>) {
  return {
    id: result.id,
    auditRunId: result.auditRunId,
    category: result.category,
    toolName: result.toolName,
    toolSlug: result.toolSlug,
    url: result.url,
    testCase: result.testCase,
    status: result.status,
    errorMessage: result.errorMessage ? redactAuditText(result.errorMessage) : null,
    outputGenerated: result.outputGenerated,
    outputType: result.outputType,
    screenshotPath: publicArtifactUrl(result.screenshotPath),
    durationMs: result.durationMs,
    timestamp: result.timestamp,
    logs: sanitizeAuditLogs(result.logs),
  };
}

export function serializeAuditRun(run: Record<string, any>) {
  return {
    id: run.id,
    userId: run.userId,
    categories: typeof run.categories === 'string' ? JSON.parse(run.categories) : run.categories,
    status: run.status,
    totalTests: run.totalTests,
    passedTests: run.passedTests,
    failedTests: run.failedTests,
    errorTests: run.errorTests,
    skippedTests: run.skippedTests,
    successPercentage: run.successPercentage,
    startedAt: run.startedAt,
    completedAt: run.completedAt,
    errorMessage: run.errorMessage ? redactAuditText(run.errorMessage) : null,
    createdAt: run.createdAt,
    updatedAt: run.updatedAt,
  };
}

export function serializeAuditArtifact(artifact: Record<string, any>) {
  return {
    id: artifact.id,
    auditRunId: artifact.auditRunId,
    toolName: artifact.toolName,
    category: artifact.category,
    testName: artifact.testName,
    type: artifact.type,
    mimeType: artifact.mimeType,
    fileSize: artifact.fileSize,
    downloadUrl: publicArtifactUrl(artifact.downloadUrl),
    createdAt: artifact.createdAt,
    expiresAt: artifact.expiresAt,
  };
}
