import { expect, test } from '@playwright/test';
import { getAuditCategoryDefinition, type AuditToolTarget } from '../app/lib/audit-category-tools';

const categoryId = process.env.AUDIT_CATEGORY || '';
const categoryConfig = getAuditCategoryDefinition(categoryId);
const startedAt = Date.now();
const auditResults: Array<{
  slug: string;
  title: string;
  url?: string;
  status: 'passed' | 'failed';
  durationMs?: number;
  failureClass?: FailureClass;
  reason?: string;
  consoleErrors?: string[];
  screenshotPath?: string;
}> = [];

type FailureClass =
  | 'Route not found (404)'
  | 'Server error (500)'
  | 'Missing H1'
  | 'Hydration error'
  | 'JavaScript exception'
  | 'Console error'
  | 'Infinite loading'
  | 'Missing main UI'
  | 'Timeout'
  | 'Network failure'
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

  if (/404|not found|could not be found/i.test(text)) return 'Route not found (404)';
  if (/500|internal server error|server error/i.test(text)) return 'Server error (500)';
  if (/primary heading|visible h1|Missing H1/i.test(text)) return 'Missing H1';
  if (/hydration/i.test(text)) return 'Hydration error';
  if (/TypeError|ReferenceError|SyntaxError|pageerror|exception|Unhandled/i.test(text)) return 'JavaScript exception';
  if (/fatal client errors|console/i.test(text)) return 'Console error';
  if (/infinite loading|Loading|Processing/i.test(text)) return 'Infinite loading';
  if (/interactive UI|main UI/i.test(text)) return 'Missing main UI';
  if (/timeout|timed out/i.test(text)) return 'Timeout';
  if (/ECONN|ENOTFOUND|net::|network/i.test(text)) return 'Network failure';
  if (/browserType\.launch|playwright|locator|expect\(/i.test(text)) return 'Playwright failure';

  return 'Unknown';
}

async function auditToolPage(page: any, request: any, target: AuditToolTarget) {
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

  page.on('console', (message: any) => {
    if (message.type() !== 'error') return;

    const text = message.text();
    if (isFatalConsoleMessage(text)) {
      consoleErrors.push(text);
    }
  });

  page.on('pageerror', (error: Error) => {
    pageErrors.push(error.message);
  });

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

  expect([...consoleErrors, ...pageErrors], `${target.route} should not log fatal client errors`).toEqual([]);

  return { consoleErrors: [...consoleErrors, ...pageErrors] };
}

test.describe('Registry-driven category audit', () => {
  test.skip(!categoryConfig, `No audit category configured for: ${categoryId || '(missing)'}`);

  test.afterEach(async ({}, testInfo) => {
    const slug = testInfo.title.split(' :: ')[0];
    const target = categoryConfig?.tools.find((tool) => tool.slug === slug);
    if (!target) return;

    const resultIndex = auditResults.length + 1;
    const total = categoryConfig?.tools.length || 0;
    const failed = testInfo.status !== 'passed';
    const reason = testInfo.error?.message;
    const failureClass = failed ? classifyFailure(reason) : undefined;
    const screenshotAttachment = testInfo.attachments.find((attachment) =>
      attachment.contentType === 'image/png' || attachment.contentType === 'image/jpeg'
    );
    let screenshotPath = screenshotAttachment?.path;
    const consoleErrors = testInfo.errors
      .map((error) => error.message)
      .filter((message): message is string => Boolean(message));

    const resultPayload = {
      category: categoryId,
      categoryId,
      categoryName: categoryConfig?.name,
      toolSlug: target.slug,
      toolTitle: target.title,
      slug: target.slug,
      title: target.title,
      url: target.route,
      status: testInfo.status === 'passed' ? 'passed' : 'failed',
      durationMs: testInfo.duration,
      failureClass,
      reason,
      consoleErrors,
      screenshotPath,
      index: resultIndex,
      total,
      elapsedMs: Date.now() - startedAt,
    };

    auditResults.push({
      slug: target.slug,
      title: target.title,
      url: target.route,
      status: testInfo.status === 'passed' ? 'passed' : 'failed',
      durationMs: testInfo.duration,
      failureClass,
      reason,
      consoleErrors,
      screenshotPath,
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
      failedCount: failed.length,
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
    test(`${target.slug} :: ${target.title}`, async ({ page, request }) => {
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

      await auditToolPage(page, request, target);
    });
  }
});
