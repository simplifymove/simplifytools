import { expect, test } from '@playwright/test';
import { getAuditCategoryDefinition, type AuditToolTarget } from '../app/lib/audit-category-tools';
import { executeFunctionalAudit, type FunctionalAuditEvidence } from './functional-audit/runner';

const categoryId = process.env.AUDIT_CATEGORY || '';
const categoryConfig = getAuditCategoryDefinition(categoryId);
const startedAt = Date.now();
const auditResults: Array<{
  slug: string;
  title: string;
  url?: string;
  status: 'passed' | 'failed' | 'skipped';
  auditOutcome?: AuditOutcome;
  durationMs?: number;
  failureClass?: FailureClass;
  reason?: string;
  consoleErrors?: string[];
  screenshotPath?: string;
  functionalEvidence?: FunctionalAuditEvidence;
}> = [];
const functionalEvidenceBySlug = new Map<string, FunctionalAuditEvidence>();

type AuditOutcome = 'FULLY_VERIFIED' | 'SKIPPED_EXTERNAL' | 'NOT_CONFIGURED' | 'RATE_LIMITED' | 'PAID_PROVIDER_DISABLED' | 'FAILED';

function configuredSkipOutcome(target: AuditToolTarget): AuditOutcome | undefined {
  const contract = target.functionalAudit;
  if (contract.strategy === 'inactive') return 'NOT_CONFIGURED';
  if (contract.executionClass === 'PAID_PROVIDER_DISABLED') return 'PAID_PROVIDER_DISABLED';
  if (contract.executionClass === 'EXTERNAL_NOT_CONFIGURED') return 'NOT_CONFIGURED';
  if (contract.executionClass === 'RATE_LIMITED') return 'RATE_LIMITED';
  if (contract.executionClass === 'EXTERNAL_CONFIGURED' && contract.rateSensitive && process.env.AUDIT_INCLUDE_EXTERNAL !== 'true') return 'SKIPPED_EXTERNAL';
  return undefined;
}

type FailureClass =
  | 'Route not found (404)'
  | 'Server error (500)'
  | 'Missing H1'
  | 'Hydration error'
  | 'JavaScript exception'
  | 'Console error'
  | 'Infinite loading'
  | 'Missing main UI'
  | 'Preview Render failure'
  | 'Timeout'
  | 'Network failure'
  | 'Missing functional audit contract'
  | 'Fixture missing or invalid'
  | 'Processing failed'
  | 'Expected result missing'
  | 'Output validation failed'
  | 'Playwright failure'
  | 'Unknown';

function emitAuditEvent(eventName: 'AUDIT_TOOL_PROGRESS' | 'AUDIT_TOOL_RESULT', payload: Record<string, unknown>) {
  console.log(`${eventName}:${JSON.stringify(payload)}`);
}

function isFatalConsoleMessage(text: string) {
  if (/favicon|manifest|ResizeObserver|Failed to load resource/i.test(text)) {
    return false;
  }

  return /Application error|Hydration failed|Minified React error|Unhandled Runtime Error|TypeError|ReferenceError|SyntaxError|next-dev|next\/static/i.test(text);
}

function bodyLooksLikeErrorPage(text: string) {
  return /404\s*not\s*found|page\s*not\s*found|500\s*internal\s*server\s*error|application\s*error|this page could not be found/i.test(text);
}

function classifyFailure(message?: string): FailureClass {
  const text = message || '';

  if (/Preview Render failure|PDF preview (?:failed|did not)/i.test(text)) return 'Preview Render failure';
  if (/404|not found|could not be found/i.test(text)) return 'Route not found (404)';
  if (/500|internal server error|server error/i.test(text)) return 'Server error (500)';
  if (/primary heading|visible h1|Missing H1/i.test(text)) return 'Missing H1';
  if (/hydration/i.test(text)) return 'Hydration error';
  if (/TypeError|ReferenceError|SyntaxError|pageerror|exception|Unhandled/i.test(text)) return 'JavaScript exception';
  if (/fatal client errors|console/i.test(text)) return 'Console error';
  if (/fake worker|WorkerMessageHandler|PDF worker/i.test(text)) return 'Processing failed';
  if (/interactive UI|main UI/i.test(text)) return 'Missing main UI';
  if (/timeout|timed out/i.test(text)) return 'Timeout';
  if (/ECONN|ENOTFOUND|net::|network/i.test(text)) return 'Network failure';
  if (/functional audit contract|No fixture is configured/i.test(text)) return 'Missing functional audit contract';
  if (/fixture|ENOENT|no such file/i.test(text)) return 'Fixture missing or invalid';
  if (/Processing API failed|processing failed|HTTP [45]\d\d/i.test(text)) return 'Processing failed';
  if (/without a (?:changed, )?non-empty rendered output|No enabled processing action|manual download URL/i.test(text)) return 'Expected result missing';
  if (/Output .* expected|signature|MIME|extension|not a valid/i.test(text)) return 'Output validation failed';
  if (/infinite loading|Loading|Processing/i.test(text)) return 'Infinite loading';
  if (/browserType\.launch|playwright|locator|expect\(/i.test(text)) return 'Playwright failure';

  return 'Unknown';
}

async function auditToolPage(page: any, request: any, target: AuditToolTarget, testInfo: any) {
  if (!target.route) {
    throw new Error(`Registry item has no route: ${target.slug}`);
  }

  const response = await request.get(target.route);
  const status = response.status();
  if (status === 404) {
    throw new Error(`Route not found (404): ${target.route}`);
  }
  if (status >= 500) {
    throw new Error(`Server error (${status}): ${target.route}`);
  }
  expect(status, `${target.route} should return a valid response`).toBeLessThan(400);

  const consoleErrors: string[] = [];
  const pageErrors: string[] = [];
  const browserConsole: Array<{ type: string; text: string }> = [];
  const networkFailures: Array<{ method: string; url: string; status?: number; error?: string }> = [];

  page.on('console', (message: any) => {
    browserConsole.push({ type: message.type(), text: message.text() });
    if (message.type() !== 'error') return;

    const text = message.text();
    if (isFatalConsoleMessage(text)) {
      consoleErrors.push(text);
    }
  });

  page.on('pageerror', (error: Error) => {
    pageErrors.push(error.message);
  });
  page.on('requestfailed', (requestEvent: any) => {
    const url = new URL(requestEvent.url());
    networkFailures.push({ method: requestEvent.method(), url: `${url.origin}${url.pathname}`, error: requestEvent.failure()?.errorText });
  });
  page.on('response', (responseEvent: any) => {
    if (responseEvent.status() < 400) return;
    const url = new URL(responseEvent.url());
    networkFailures.push({ method: responseEvent.request().method(), url: `${url.origin}${url.pathname}`, status: responseEvent.status() });
  });
  Object.assign(testInfo, { browserConsole, networkFailures });

  await page.goto(target.route, { waitUntil: 'domcontentloaded' });
  await expect(page.locator('body')).toBeVisible();

  const heading = page.locator('h1, [role="heading"][aria-level="1"]').first();
  await expect(heading, `${target.route} should render a visible primary heading`).toBeVisible({ timeout: 10000 });

  const bodyText = await page.locator('body').innerText({ timeout: 5000 });
  expect(bodyLooksLikeErrorPage(bodyText), `${target.route} should not render 404/500 content`).toBe(false);

  const interactiveElements = page.locator('main a[href], main button, main input, main textarea, main select, main [role="button"], form button, form input, form textarea, form select');
  expect(await interactiveElements.count(), `${target.route} should expose main interactive UI`).toBeGreaterThan(0);

  await page.waitForTimeout(750);
  const persistentLoading = page.locator('main :visible').filter({ hasText: /^(Loading|Loading\.\.\.|Processing\.\.\.)$/i });
  expect(await persistentLoading.count(), `${target.route} should not remain in an infinite loading state`).toBe(0);

  expect([...consoleErrors, ...pageErrors], `${target.route} should not log fatal client errors before execution`).toEqual([]);
  const functionalEvidence = await executeFunctionalAudit(page, request, target, testInfo);
  expect(functionalEvidence.stages.pageHealth).toBe('PASS');
  expect(['PASS', 'NOT_APPLICABLE']).toContain(functionalEvidence.stages.fixtureUpload);
  expect(functionalEvidence.stages.functionalProcessing).toBe('PASS');
  expect(functionalEvidence.stages.outputValidation).toBe('PASS');
  expect(['PASS', 'NOT_APPLICABLE']).toContain(functionalEvidence.stages.cleanup);
  expect([...consoleErrors, ...pageErrors], `${target.route} should not log fatal client errors during processing`).toEqual([]);
  return { consoleErrors: [...consoleErrors, ...pageErrors], functionalEvidence };
}

test.describe('Registry-driven category audit', () => {
  test.describe.configure({ mode: 'default' });
  test.skip(!categoryConfig, `No audit category configured for: ${categoryId || '(missing)'}`);

  test.afterEach(async ({}, testInfo) => {
    const slug = testInfo.title.split(' :: ')[0];
    const target = categoryConfig?.tools.find((tool) => tool.slug === slug);
    if (!target) return;

    const resultIndex = auditResults.length + 1;
    const total = categoryConfig?.tools.length || 0;
    const skipped = testInfo.status === 'skipped';
    const failed = testInfo.status !== 'passed' && !skipped;
    const reason = testInfo.error?.message;
    const failureClass = failed ? classifyFailure(reason) : undefined;
    const screenshotAttachment = testInfo.attachments.find((attachment) =>
      (attachment.contentType === 'image/png' || attachment.contentType === 'image/jpeg') &&
      !attachment.name.startsWith('failed-output-')
    );
    const screenshotPath = screenshotAttachment?.path;
    const consoleErrors = testInfo.errors
      .map((error) => error.message)
      .filter((message): message is string => Boolean(message));
    const functionalEvidence = functionalEvidenceBySlug.get(slug) || (testInfo as typeof testInfo & {
      functionalAuditEvidence?: FunctionalAuditEvidence;
    }).functionalAuditEvidence;
    const runtimeRateLimited = functionalEvidence?.apiResponses.some((response) => response.status === 429) || /HTTP 429|rate limit/i.test(reason || '');
    const auditOutcome: AuditOutcome = configuredSkipOutcome(target) || (runtimeRateLimited ? 'RATE_LIMITED' : failed ? 'FAILED' : skipped ? 'NOT_CONFIGURED' : 'FULLY_VERIFIED');
    const diagnosticState = testInfo as typeof testInfo & {
      browserConsole?: Array<{ type: string; text: string }>;
      networkFailures?: Array<{ method: string; url: string; status?: number; error?: string }>;
    };
    if (failed) {
      if (diagnosticState.browserConsole?.length) {
        await testInfo.attach('browser-console.log', { body: Buffer.from(diagnosticState.browserConsole.map((entry) => `[${entry.type}] ${entry.text}`).join('\n')), contentType: 'text/plain' });
      }
      if (diagnosticState.networkFailures?.length) {
        await testInfo.attach('network-failures.json', { body: Buffer.from(JSON.stringify(diagnosticState.networkFailures, null, 2)), contentType: 'application/json' });
      }
    }

    const resultPayload = {
      category: categoryId,
      categoryId,
      categoryName: categoryConfig?.name,
      toolSlug: target.slug,
      toolTitle: target.title,
      slug: target.slug,
      title: target.title,
      url: target.route,
      status: testInfo.status === 'passed' ? 'passed' : skipped ? 'skipped' : 'failed',
      auditOutcome,
      pageHealth: functionalEvidence?.stages.pageHealth || (failed ? 'FAIL' : skipped ? 'NOT_RUN' : 'PASS'),
      functionalProcessing: functionalEvidence?.stages.functionalProcessing || 'NOT_RUN',
      outputValidation: functionalEvidence?.stages.outputValidation || 'NOT_RUN',
      cleanup: functionalEvidence?.stages.cleanup || 'NOT_RUN',
      failureStage: functionalEvidence?.failureStage,
      durationMs: testInfo.duration,
      failureClass,
      reason,
      consoleErrors,
      screenshotPath,
      functionalEvidence,
      outputGenerated: Boolean(functionalEvidence?.output || functionalEvidence?.renderedOutput),
      outputType: functionalEvidence?.output?.mimeType || functionalEvidence?.output?.extension || (functionalEvidence?.renderedOutput ? 'rendered-output' : undefined),
      index: resultIndex,
      total,
      elapsedMs: Date.now() - startedAt,
    };

    auditResults.push({
      slug: target.slug,
      title: target.title,
      url: target.route,
      status: testInfo.status === 'passed' ? 'passed' : skipped ? 'skipped' : 'failed',
      auditOutcome,
      durationMs: testInfo.duration,
      failureClass,
      reason,
      consoleErrors,
      screenshotPath,
      functionalEvidence,
    });

    emitAuditEvent('AUDIT_TOOL_RESULT', resultPayload);
  });

  test.afterAll(async () => {
    if (!categoryConfig) return;

    const failed = auditResults.filter((result) => result.status === 'failed');
    const summary = {
      category: categoryConfig.name,
      totalToolsTested: categoryConfig.tools.length,
      passedCount: auditResults.filter((result) => result.status === 'passed').length,
      skippedCount: auditResults.filter((result) => result.status === 'skipped').length,
      failedCount: failed.length,
      fullyVerifiedCount: auditResults.filter((result) => result.auditOutcome === 'FULLY_VERIFIED').length,
      skippedExternalCount: auditResults.filter((result) => result.auditOutcome === 'SKIPPED_EXTERNAL').length,
      notConfiguredCount: auditResults.filter((result) => result.auditOutcome === 'NOT_CONFIGURED').length,
      rateLimitedCount: auditResults.filter((result) => result.auditOutcome === 'RATE_LIMITED').length,
      paidProviderDisabledCount: auditResults.filter((result) => result.auditOutcome === 'PAID_PROVIDER_DISABLED').length,
      failures: failed.map((failure) => ({
        title: failure.title,
        slug: failure.slug,
        url: failure.url,
        durationMs: failure.durationMs,
        failureClass: failure.failureClass,
        reason: failure.reason,
        screenshotPath: failure.screenshotPath,
        consoleErrors: failure.consoleErrors || [],
      })),
    };

    console.log(`CATEGORY_AUDIT_SUMMARY ${JSON.stringify(summary)}`);
  });

  for (const target of categoryConfig?.tools || []) {
    test(`${target.slug} :: ${target.title}`, async ({ page, request }, testInfo) => {
      const skipOutcome = configuredSkipOutcome(target);
      test.skip(Boolean(skipOutcome), `${skipOutcome}: ${target.functionalAudit.inactiveReason || target.functionalAudit.externalProvider || 'workflow is not configured for deterministic execution'}`);
      const index = (categoryConfig?.tools.findIndex((tool) => tool.slug === target.slug) || 0) + 1;
      const total = categoryConfig?.tools.length || 0;
      emitAuditEvent('AUDIT_TOOL_PROGRESS', {
        category: categoryId,
        categoryId,
        categoryName: categoryConfig?.name,
        toolSlug: target.slug,
        toolTitle: target.title,
        slug: target.slug,
        title: target.title,
        url: target.route,
        index,
        total,
        elapsedMs: Date.now() - startedAt,
      });

      const result = await auditToolPage(page, request, target, testInfo);
      functionalEvidenceBySlug.set(target.slug, result.functionalEvidence);
    });
  }
});
