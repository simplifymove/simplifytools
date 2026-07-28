import assert from 'node:assert/strict';
import test from 'node:test';
import {
  createPayPalOrder,
  getPayPalConfig,
  type NormalizedPayPalOrder,
} from '../../lib/billing/paypal';
import {
  AiStudioPayPalCaptureValidationError,
  validateAiStudioPayPalCapture,
} from '../../lib/ai-studio/paypal-purchase';
import {
  getAiStudioPlan,
  isAiStudioPayPalUsdPlan,
} from '../../lib/ai-studio/plans';

const originalPayPalEnvironment = process.env.PAYPAL_ENVIRONMENT;
const originalPayPalClientId = process.env.PAYPAL_CLIENT_ID;
const originalPayPalClientSecret = process.env.PAYPAL_CLIENT_SECRET;
const originalFetch = globalThis.fetch;

function restoreEnvironment() {
  if (originalPayPalEnvironment === undefined) {
    delete process.env.PAYPAL_ENVIRONMENT;
  } else {
    process.env.PAYPAL_ENVIRONMENT = originalPayPalEnvironment;
  }

  if (originalPayPalClientId === undefined) {
    delete process.env.PAYPAL_CLIENT_ID;
  } else {
    process.env.PAYPAL_CLIENT_ID = originalPayPalClientId;
  }

  if (originalPayPalClientSecret === undefined) {
    delete process.env.PAYPAL_CLIENT_SECRET;
  } else {
    process.env.PAYPAL_CLIENT_SECRET = originalPayPalClientSecret;
  }

  globalThis.fetch = originalFetch;
}

test.afterEach(restoreEnvironment);

function purchaseSnapshot() {
  return {
    id: 'purchase_123',
    userId: 'user_123',
    planId: 'global-starter',
    provider: 'paypal',
    providerOrderId: 'ORDER123',
    currency: 'USD',
    grossAmountMinor: 599,
    status: 'created',
  };
}

function completedOrder(overrides: Partial<NormalizedPayPalOrder> = {}) {
  return {
    id: 'ORDER123',
    status: 'COMPLETED',
    purchaseUnits: [
      {
        referenceId: 'purchase_123',
        customId: 'purchase_123',
        invoiceId: 'purchase_123',
        amount: {
          currencyCode: 'USD',
          value: '5.99',
        },
        captures: [
          {
            id: 'CAPTURE123',
            status: 'COMPLETED',
            amount: {
              currencyCode: 'USD',
              value: '5.99',
            },
          },
        ],
      },
    ],
    ...overrides,
  } satisfies NormalizedPayPalOrder;
}

test('PayPal configuration fails closed and selects the sandbox API', () => {
  process.env.PAYPAL_ENVIRONMENT = 'sandbox';
  process.env.PAYPAL_CLIENT_ID = 'public-client-id';
  process.env.PAYPAL_CLIENT_SECRET = 'server-secret';

  assert.equal(
    getPayPalConfig().baseUrl,
    'https://api-m.sandbox.paypal.com',
  );

  process.env.PAYPAL_ENVIRONMENT = 'staging';
  assert.throws(() => getPayPalConfig(), /sandbox or live/);
});

test('PayPal create order uses the server-provided minor-unit amount', async () => {
  process.env.PAYPAL_ENVIRONMENT = 'sandbox';
  process.env.PAYPAL_CLIENT_ID = 'public-client-id';
  process.env.PAYPAL_CLIENT_SECRET = 'server-secret';

  const requests: Array<{ url: string; init: RequestInit }> = [];
  globalThis.fetch = async (input, init = {}) => {
    requests.push({ url: String(input), init });

    if (requests.length === 1) {
      return Response.json({
        access_token: 'mock-access-token',
        expires_in: 3600,
      });
    }

    return Response.json(
      {
        id: 'ORDER123',
        status: 'CREATED',
        purchase_units: [
          {
            reference_id: 'purchase_123',
            custom_id: 'purchase_123',
            invoice_id: 'purchase_123',
            amount: { currency_code: 'USD', value: '5.99' },
          },
        ],
      },
      { status: 201 },
    );
  };

  await createPayPalOrder({
    purchaseId: 'purchase_123',
    description: 'AI Studio Starter credits',
    amountMinor: 599,
    requestId: 'ai-create-purchase_123',
  });

  assert.equal(requests.length, 2);
  assert.match(requests[1].url, /\/v2\/checkout\/orders$/);
  const requestBody = JSON.parse(String(requests[1].init.body)) as {
    purchase_units: Array<{
      custom_id: string;
      amount: { currency_code: string; value: string };
    }>;
  };
  assert.deepEqual(requestBody.purchase_units[0].amount, {
    currency_code: 'USD',
    value: '5.99',
  });
  assert.equal(requestBody.purchase_units[0].custom_id, 'purchase_123');
  assert.equal(
    (requests[1].init.headers as Record<string, string>)[
      'PayPal-Request-Id'
    ],
    'ai-create-purchase_123',
  );
});

test('PayPal plans reject Razorpay INR plans', () => {
  assert.equal(isAiStudioPayPalUsdPlan(getAiStudioPlan('india-starter')), false);
  assert.equal(isAiStudioPayPalUsdPlan(getAiStudioPlan('global-starter')), true);
});

test('non-COMPLETED PayPal orders are never accepted for fulfillment', () => {
  assert.throws(
    () =>
      validateAiStudioPayPalCapture(
        purchaseSnapshot(),
        completedOrder({ status: 'APPROVED' }),
      ),
    (error) =>
      error instanceof AiStudioPayPalCaptureValidationError &&
      error.pendingVerification,
  );
});

test('a matching COMPLETED capture passes the pre-fulfillment gate', () => {
  const result = validateAiStudioPayPalCapture(
    purchaseSnapshot(),
    completedOrder(),
  );

  assert.equal(result.id, 'CAPTURE123');
  assert.equal(result.status, 'COMPLETED');
});

test('a capture amount mismatch is rejected before fulfillment', () => {
  const order = completedOrder();
  order.purchaseUnits[0].captures[0].amount = {
    currencyCode: 'USD',
    value: '6.00',
  };

  assert.throws(
    () => validateAiStudioPayPalCapture(purchaseSnapshot(), order),
    /amount does not match/,
  );
});
