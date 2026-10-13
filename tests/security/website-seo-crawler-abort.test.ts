import assert from 'node:assert/strict';
import test from 'node:test';

import { crawlWebsiteSeo } from '../../lib/website-seo/crawler';
import { WebsiteSeoFetchError } from '../../lib/website-seo/safe-fetch';

function assertAuditAborted(error: unknown): boolean {
  assert.ok(error instanceof WebsiteSeoFetchError);
  assert.equal(error.code, 'AUDIT_ABORTED');
  return true;
}

test('crawler rejects an already-aborted signal without fetching', async () => {
  const controller = new AbortController();
  controller.abort();

  let fetchCount = 0;

  await assert.rejects(
    crawlWebsiteSeo(
      'https://example.com',
      {
        maxPages: 5,
        fetchOptions: { signal: controller.signal },
      },
      {
        fetchPage: async () => {
          fetchCount += 1;
          throw new Error('Fetch should not run');
        },
      },
    ),
    assertAuditAborted,
  );

  assert.equal(fetchCount, 0);
});

test('crawler stops when cancelled during its first fetch', async () => {
  const controller = new AbortController();
  let fetchCount = 0;

  await assert.rejects(
    crawlWebsiteSeo(
      'https://example.com',
      {
        maxPages: 5,
        fetchOptions: { signal: controller.signal },
      },
      {
        fetchPage: async () => {
          fetchCount += 1;
          controller.abort();

          throw new WebsiteSeoFetchError(
            'AUDIT_ABORTED',
            'The website audit was cancelled.',
          );
        },
      },
    ),
    assertAuditAborted,
  );

  assert.equal(controller.signal.aborted, true);
  assert.equal(fetchCount, 1);
});