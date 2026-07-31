import assert from 'node:assert/strict';
import test from 'node:test';
import {
  getAiStudioAuthenticationRedirect,
  getSafeInternalCallbackPath,
  getSignInPath,
  getSignUpPath,
} from '../../lib/auth/redirect';
import { canStartAiStudioCheckout } from '../../lib/ai-studio/checkout-access';

test('logged-out users can open the public AI Studio landing page', () => {
  assert.equal(
    getAiStudioAuthenticationRedirect('/ai-studio', false),
    null,
  );
});

test('logged-out users can open public AI Studio pricing', () => {
  assert.equal(
    getAiStudioAuthenticationRedirect('/ai-studio/pricing', false),
    null,
  );
});

test('direct logged-out maker and billing routes redirect safely', () => {
  const protectedPaths = [
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

test('protected route callbacks preserve safe query parameters', () => {
  const redirect = getAiStudioAuthenticationRedirect(
    '/ai-studio/presentation-maker',
    false,
    '?template=sales',
  );
  const callbackUrl = new URL(
    redirect ?? '',
    'https://simplifyconvert.com',
  ).searchParams.get('callbackUrl');

  assert.equal(
    callbackUrl,
    '/ai-studio/presentation-maker?template=sales',
  );
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

test('protected CTA callbacks survive sign-in and signup navigation', () => {
  const destination = '/ai-studio/document-maker';
  const signInPath = getSignInPath(destination);
  const signInCallback = new URL(
    signInPath,
    'https://simplifyconvert.com',
  ).searchParams.get('callbackUrl');
  const signUpPath = getSignUpPath(signInCallback ?? '');
  const signUpCallback = new URL(
    signUpPath,
    'https://simplifyconvert.com',
  ).searchParams.get('callbackUrl');

  assert.equal(signInCallback, destination);
  assert.equal(signUpCallback, destination);
  assert.equal(
    new URL(
      getSignInPath(signUpCallback ?? ''),
      'https://simplifyconvert.com',
    ).searchParams.get('callbackUrl'),
    destination,
  );
});

test('purchase checkout cannot start before authentication', () => {
  assert.equal(canStartAiStudioCheckout('loading'), false);
  assert.equal(canStartAiStudioCheckout('unauthenticated'), false);
  assert.equal(canStartAiStudioCheckout('authenticated'), true);
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
