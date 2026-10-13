import assert from 'node:assert/strict';
import test from 'node:test';

import {
  handleWebsiteSeoAuditRequest,
} from '../../app/api/website-seo/audit/handler';
import { WebsiteSeoFetchError } from '../../lib/website-seo/safe-fetch';
import type { WebsiteSeoAuditRouteDependencies } from '../../app/api/website-seo/audit/handler';

type AuditRunner = NonNullable<WebsiteSeoAuditRouteDependencies['runAudit']>;
type RateLimiter = NonNullable<WebsiteSeoAuditRouteDependencies['rateLimit']>;

const allowRequest: RateLimiter = () => ({
  allowed: true,
  remaining: 4,
  resetIn: 60,
});

function makeRequest(body: unknown): Request {
  return new Request('http://localhost/api/website-seo/audit', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify(body),
  });
}

test('successful audit returns HTTP 200', async () => {
  const expected = { testResult: true };

  const runAudit = (async () => expected) as unknown as AuditRunner;

  const response = await handleWebsiteSeoAuditRequest(
    makeRequest({ url: 'https://example.com', maxPages: 5 }),
    { runAudit, rateLimit: allowRequest },
  );

  assert.equal(response.status, 200);

  const body = await response.json();
  assert.equal(body.success, true);
  assert.deepEqual(body.result, expected);
});

test('invalid request returns HTTP 400 without running audit', async () => {
  let called = false;

  const runAudit = (async () => {
    called = true;
    throw new Error('Audit should not run');
  }) as AuditRunner;

  const response = await handleWebsiteSeoAuditRequest(
    new Request('http://localhost/api/website-seo/audit', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: '{invalid-json',
    }),
    { runAudit, rateLimit: allowRequest },
  );

  assert.equal(response.status, 400);
  assert.equal((await response.json()).errorCode, 'INVALID_REQUEST');
  assert.equal(called, false);
});

test('audit runner receives an active abort signal', async () => {
  let receivedSignal: AbortSignal | undefined;

  const runAudit = (async (
    _input: unknown,
    options: { signal?: AbortSignal },
  ) => {
    receivedSignal = options.signal;
    return { testResult: true };
  }) as unknown as AuditRunner;

  const response = await handleWebsiteSeoAuditRequest(
    makeRequest({ url: 'https://example.com' }),
    { runAudit, rateLimit: allowRequest },
  );

  assert.equal(response.status, 200);
  assert.ok(receivedSignal instanceof AbortSignal);
  assert.equal(receivedSignal.aborted, false);
});
test('deadline aborts an ongoing audit and returns HTTP 504', async () => {
  let receivedSignal: AbortSignal | undefined;

  const runAudit = (async (
    _input: unknown,
    options: { signal?: AbortSignal },
  ) => {
    const signal = options.signal;
    assert.ok(signal instanceof AbortSignal);
    receivedSignal = signal;

    await new Promise<void>((resolve, reject) => {
      if (signal.aborted) {
        reject(new WebsiteSeoFetchError(
          'AUDIT_ABORTED',
          'The website audit was cancelled.',
        ));
        return;
      }

      signal.addEventListener('abort', () => {
        resolve();
      }, { once: true });
    });

    throw new WebsiteSeoFetchError(
      'AUDIT_ABORTED',
      'The website audit was cancelled.',
    );
  }) as unknown as AuditRunner;

  const response = await handleWebsiteSeoAuditRequest(
    makeRequest({ url: 'https://example.com' }),
    {
      runAudit,
      rateLimit: allowRequest,
      timeoutMs: 25,
    },
  );

  assert.equal(response.status, 504);
  assert.equal((await response.json()).errorCode, 'AUDIT_TIMEOUT');
  assert.equal(receivedSignal?.aborted, true);
});
test('cancelled audit returns HTTP 504', async () => {
  const runAudit = (async () => {
    throw new WebsiteSeoFetchError(
      'AUDIT_ABORTED',
      'The website audit was cancelled.',
    );
  }) as AuditRunner;

  const response = await handleWebsiteSeoAuditRequest(
    makeRequest({ url: 'https://example.com' }),
    { runAudit, rateLimit: allowRequest },
  );

  assert.equal(response.status, 504);
  assert.equal((await response.json()).errorCode, 'AUDIT_TIMEOUT');
});