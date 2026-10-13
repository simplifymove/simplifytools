import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { isPaymentEnabled } from '../../lib/billing/payment-availability';
import { isAiStudioPaymentEnabled } from '../../lib/ai-studio/payment-availability';

const studioRoutes = [
  'app/api/ai-studio/payments/razorpay/create-order/route.ts',
  'app/api/ai-studio/payments/paypal/create-order/route.ts',
  'app/api/ai-studio/payments/stripe/create-checkout-session/route.ts',
];

const codeAssistantRoute = 'app/api/payments/create-order/route.ts';

test('global payments default to disabled', () => {
  const previous = process.env.SIMPLIFYCONVERT_PAYMENTS_ENABLED;

  try {
    delete process.env.SIMPLIFYCONVERT_PAYMENTS_ENABLED;
    assert.equal(isPaymentEnabled(), false);

    process.env.SIMPLIFYCONVERT_PAYMENTS_ENABLED = 'false';
    assert.equal(isPaymentEnabled(), false);

    process.env.SIMPLIFYCONVERT_PAYMENTS_ENABLED = 'TRUE';
    assert.equal(isPaymentEnabled(), false);

    process.env.SIMPLIFYCONVERT_PAYMENTS_ENABLED = 'true';
    assert.equal(isPaymentEnabled(), true);
  } finally {
    if (previous === undefined) {
      delete process.env.SIMPLIFYCONVERT_PAYMENTS_ENABLED;
    } else {
      process.env.SIMPLIFYCONVERT_PAYMENTS_ENABLED = previous;
    }
  }
});

test('AI Studio requires both payment switches', () => {
  const previousGlobal = process.env.SIMPLIFYCONVERT_PAYMENTS_ENABLED;
  const previousStudio = process.env.AI_STUDIO_PAYMENTS_ENABLED;

  try {
    delete process.env.SIMPLIFYCONVERT_PAYMENTS_ENABLED;
    delete process.env.AI_STUDIO_PAYMENTS_ENABLED;
    assert.equal(isAiStudioPaymentEnabled(), false);

    process.env.AI_STUDIO_PAYMENTS_ENABLED = 'true';
    assert.equal(isAiStudioPaymentEnabled(), false);

    process.env.SIMPLIFYCONVERT_PAYMENTS_ENABLED = 'true';
    assert.equal(isAiStudioPaymentEnabled(), true);

    process.env.AI_STUDIO_PAYMENTS_ENABLED = 'false';
    assert.equal(isAiStudioPaymentEnabled(), false);
  } finally {
    for (const [key, value] of [
      ['SIMPLIFYCONVERT_PAYMENTS_ENABLED', previousGlobal],
      ['AI_STUDIO_PAYMENTS_ENABLED', previousStudio],
    ] as const) {
      if (value === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    }
  }
});

for (const route of studioRoutes) {
  test(`${route} has an early payment guard`, () => {
    const source = readFileSync(route, 'utf8');
    const handler = source.indexOf('export async function POST');
    const guard = source.indexOf('if (!isAiStudioPaymentEnabled())', handler);
    const session = source.indexOf('getServerSession(authOptions)', handler);

    assert.ok(handler >= 0);
    assert.ok(guard > handler);
    assert.ok(session > guard);
    assert.match(source, /status:\s*503/);
  });
}

test('AI Code Assistant has an early global payment guard', () => {
  const source = readFileSync(codeAssistantRoute, 'utf8');
  const handler = source.indexOf('export async function POST');
  const guard = source.indexOf('if (!isPaymentEnabled())', handler);
  const session = source.indexOf('getServerSession(authOptions)', handler);

  assert.ok(handler >= 0);
  assert.ok(guard > handler);
  assert.ok(session > guard);
  assert.match(source, /status:\s*503/);
});
