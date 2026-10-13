import assert from 'node:assert/strict';
import test from 'node:test';

import { discoverWebsiteSeoSite } from '../../lib/website-seo/site-discovery';
import { WebsiteSeoFetchError } from '../../lib/website-seo/safe-fetch';

function assertAuditAborted(error: unknown): boolean {
  assert.ok(error instanceof WebsiteSeoFetchError);
  assert.equal(error.code, 'AUDIT_ABORTED');
  return true;
}

test('discovery rejects an already-aborted signal without fetching', async () => {
  const controller = new AbortController();
  controller.abort();

  let fetchCount = 0;

  await assert.rejects(
    discoverWebsiteSeoSite(
      'https://example.com',
      { fetchOptions: { signal: controller.signal } },
      async () => {
        fetchCount += 1;
        throw new Error('Fetch should not run');
      },
    ),
    assertAuditAborted,
  );

  assert.equal(fetchCount, 0);
});

test('discovery stops when cancelled during robots fetch', async () => {
  const controller = new AbortController();
  const requestedUrls: string[] = [];

  await assert.rejects(
    discoverWebsiteSeoSite(
      'https://example.com',
      { fetchOptions: { signal: controller.signal } },
      async (input) => {
        requestedUrls.push(String(input));
        controller.abort();

        throw new WebsiteSeoFetchError(
          'AUDIT_ABORTED',
          'The website audit was cancelled.',
        );
      },
    ),
    assertAuditAborted,
  );

  assert.deepEqual(requestedUrls, [
    'https://example.com/robots.txt',
  ]);
});

test('discovery stops when cancelled during sitemap fetch', async () => {
  const controller = new AbortController();
  const requestedUrls: string[] = [];

  await assert.rejects(
    discoverWebsiteSeoSite(
      'https://example.com',
      { fetchOptions: { signal: controller.signal } },
      async (input) => {
        const url = String(input);
        requestedUrls.push(url);

        if (url.endsWith('/robots.txt')) {
          return {
            requestedUrl: url,
            finalUrl: url,
            status: 404,
            statusText: 'Not Found',
            headers: {},
            body: '',
            contentType: 'text/plain',
          } as Awaited<ReturnType<
            typeof import('../../lib/website-seo/safe-fetch').safeWebsiteSeoFetch
          >>;
        }

        controller.abort();

        throw new WebsiteSeoFetchError(
          'AUDIT_ABORTED',
          'The website audit was cancelled.',
        );
      },
    ),
    assertAuditAborted,
  );

  assert.deepEqual(requestedUrls, [
    'https://example.com/robots.txt',
    'https://example.com/sitemap.xml',
  ]);
});