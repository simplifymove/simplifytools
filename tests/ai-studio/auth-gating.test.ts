import assert from 'node:assert/strict';
import test from 'node:test';
import {
  getAiStudioAuthenticationRedirect,
  getSafeInternalCallbackPath,
} from '../../lib/auth/redirect';

test('logged-out AI Studio navigation redirects to sign-in', () => {
  assert.equal(
    getAiStudioAuthenticationRedirect('/ai-studio', false),
    '/auth/signin?callbackUrl=%2Fai-studio',
  );
});

test('AI Studio sign-in callback returns to the intended dashboard', () => {
  const redirect = getAiStudioAuthenticationRedirect('/ai-studio', false);
  const callbackUrl = new URL(
    redirect ?? '',
    'https://simplifyconvert.com',
  ).searchParams.get('callbackUrl');

  assert.equal(callbackUrl, '/ai-studio');
});

test('direct logged-out AI Studio routes redirect safely', () => {
  const protectedPaths = [
    '/ai-studio/pricing',
    '/ai-studio/presentation-maker',
    '/ai-studio/document-maker',
    '/ai-studio/spreadsheet-maker',
    '/ai-studio/billing',
  ];

  for (const pathname of protectedPaths) {
    const redirect = getAiStudioAuthenticationRedirect(pathname, false);
    const callbackUrl = new URL(
      redirect ?? '',
      'https://simplifyconvert.com',
    ).searchParams.get('callbackUrl');

    assert.equal(callbackUrl, pathname);
  }
});

test('authenticated users access AI Studio without an auth redirect', () => {
  assert.equal(
    getAiStudioAuthenticationRedirect('/ai-studio', true),
    null,
  );
  assert.equal(
    getAiStudioAuthenticationRedirect('/ai-studio/pricing', true),
    null,
  );
});

test('external and absolute callback URLs are rejected', () => {
  assert.equal(
    getSafeInternalCallbackPath('https://example.com/phishing'),
    '/account',
  );
  assert.equal(
    getSafeInternalCallbackPath('//example.com/phishing'),
    '/account',
  );
  assert.equal(
    getSafeInternalCallbackPath('/\\example.com/phishing'),
    '/account',
  );
  assert.equal(
    getSafeInternalCallbackPath('/%5c%5cexample.com/phishing'),
    '/account',
  );
  assert.equal(
    getSafeInternalCallbackPath('/ai-studio/pricing'),
    '/ai-studio/pricing',
  );
});
