import type { IndividualTestResult } from '@/lib/services/test-execution';

export interface AuditTestResultStore {
  findFirst(args: any): Promise<{ id: string } | null>;
  create(args: any): Promise<unknown>;
  update(args: any): Promise<unknown>;
}

export function auditResultStatus(result: IndividualTestResult): 'PASS' | 'FAIL' | 'SKIPPED' {
  return result.passed ? 'PASS' : result.skipped ? 'SKIPPED' : 'FAIL';
}

export function auditResultData(auditRunId: string, category: string, result: IndividualTestResult) {
  const durationMs = result.duration ? Math.round(result.duration * 1000) : 0;
  return {
    auditRunId,
    category,
    toolName: result.toolName || category,
    toolSlug: result.toolSlug || (result.toolName || category).toLowerCase().replace(/\s+/g, '-'),
    url: result.url || `http://localhost:3000/${category}`,
    testCase: result.testName || result.testCase || 'Functional audit',
    status: auditResultStatus(result),
    errorMessage: result.error?.message || (result.passed || result.skipped ? null : 'Test failed'),
    outputGenerated: result.outputGenerated || false,
    outputType: result.outputType,
    outputPath: result.outputPath,
    screenshotPath: result.screenshotPath,
    logs: JSON.stringify({
      stdout: result.output || result.stdout || '',
      stderr: result.stderr || result.error?.message || '',
      duration: durationMs,
      failureClass: result.failureClass,
      consoleErrors: result.consoleErrors || [],
      functionalEvidence: result.functionalEvidence,
      auditOutcome: result.auditOutcome,
      failureStage: result.failureStage,
      pageHealth: result.pageHealth,
      functionalProcessing: result.functionalProcessing,
      outputValidation: result.outputValidation,
      cleanup: result.cleanup,
    }),
    durationMs,
    timestamp: new Date(),
  };
}

export async function persistAuditToolResult(
  store: AuditTestResultStore,
  auditRunId: string,
  category: string,
  result: IndividualTestResult,
): Promise<'created' | 'updated'> {
  const data = auditResultData(auditRunId, category, result);
  const existing = await store.findFirst({
    where: { auditRunId, category, toolSlug: data.toolSlug },
    select: { id: true },
  });

  if (existing) {
    const { auditRunId: _auditRunId, ...updateData } = data;
    await store.update({ where: { id: existing.id }, data: updateData });
    return 'updated';
  }

  await store.create({ data });
  return 'created';
}
