const PAYPAL_SANDBOX_BASE_URL = 'https://api-m.sandbox.paypal.com';
const PAYPAL_LIVE_BASE_URL = 'https://api-m.paypal.com';
const PAYPAL_REQUEST_TIMEOUT_MS = 15_000;
const PAYPAL_REQUEST_ID_MAX_LENGTH = 38;

interface PayPalConfig {
  clientId: string;
  clientSecret: string;
  baseUrl: string;
}

interface PayPalAccessTokenResponse {
  access_token?: unknown;
}

interface PayPalApiAmount {
  currency_code?: unknown;
  value?: unknown;
}

interface PayPalApiCapture {
  id?: unknown;
  status?: unknown;
  amount?: PayPalApiAmount;
}

interface PayPalApiPurchaseUnit {
  reference_id?: unknown;
  custom_id?: unknown;
  invoice_id?: unknown;
  amount?: PayPalApiAmount;
  payments?: {
    captures?: PayPalApiCapture[];
  };
}

interface PayPalApiOrder {
  id?: unknown;
  status?: unknown;
  purchase_units?: PayPalApiPurchaseUnit[];
}

export interface PayPalOrderCreateInput {
  purchaseId: string;
  description: string;
  amountMinor: number;
  requestId: string;
}

export interface NormalizedPayPalAmount {
  currencyCode: string;
  value: string;
}

export interface NormalizedPayPalCapture {
  id: string;
  status: string;
  amount: NormalizedPayPalAmount | null;
}

export interface NormalizedPayPalPurchaseUnit {
  referenceId: string | null;
  customId: string | null;
  invoiceId: string | null;
  amount: NormalizedPayPalAmount | null;
  captures: NormalizedPayPalCapture[];
}

export interface NormalizedPayPalOrder {
  id: string;
  status: string;
  purchaseUnits: NormalizedPayPalPurchaseUnit[];
}

export class PayPalConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PayPalConfigurationError';
  }
}

export class PayPalApiError extends Error {
  constructor(
    message: string,
    readonly status: number | null = null,
    readonly code: 'api_error' | 'timeout' | 'invalid_response' = 'api_error',
  ) {
    super(message);
    this.name = 'PayPalApiError';
  }
}

function requiredEnvironmentValue(name: 'PAYPAL_CLIENT_ID' | 'PAYPAL_CLIENT_SECRET') {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new PayPalConfigurationError(`${name} is not configured`);
  }

  return value;
}

export function getPayPalConfig(): PayPalConfig {
  const configuredEnvironment = process.env.PAYPAL_ENVIRONMENT?.trim();

  if (
    configuredEnvironment !== 'sandbox' &&
    configuredEnvironment !== 'live'
  ) {
    throw new PayPalConfigurationError(
      'PAYPAL_ENVIRONMENT must be configured as sandbox or live',
    );
  }

  return {
    clientId: requiredEnvironmentValue('PAYPAL_CLIENT_ID'),
    clientSecret: requiredEnvironmentValue('PAYPAL_CLIENT_SECRET'),
    baseUrl:
      configuredEnvironment === 'sandbox'
        ? PAYPAL_SANDBOX_BASE_URL
        : PAYPAL_LIVE_BASE_URL,
  };
}

export function getPayPalPublicClientId() {
  return getPayPalConfig().clientId;
}

function validateRequestId(requestId: string) {
  if (
    !requestId ||
    requestId.length > PAYPAL_REQUEST_ID_MAX_LENGTH ||
    !/^[A-Za-z0-9._-]+$/.test(requestId)
  ) {
    throw new Error('Invalid PayPal request ID');
  }
}

async function fetchWithTimeout(
  url: string,
  init: RequestInit,
): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    PAYPAL_REQUEST_TIMEOUT_MS,
  );

  try {
    return await fetch(url, {
      ...init,
      cache: 'no-store',
      signal: controller.signal,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      (error.name === 'AbortError' || controller.signal.aborted)
    ) {
      throw new PayPalApiError('PayPal request timed out', null, 'timeout');
    }

    throw new PayPalApiError('Unable to reach PayPal');
  } finally {
    clearTimeout(timeout);
  }
}

async function getPayPalAccessToken(config: PayPalConfig) {
  const authorization = Buffer.from(
    `${config.clientId}:${config.clientSecret}`,
  ).toString('base64');
  const response = await fetchWithTimeout(`${config.baseUrl}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      Authorization: `Basic ${authorization}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  if (!response.ok) {
    throw new PayPalApiError(
      'PayPal authentication failed',
      response.status,
    );
  }

  const payload = (await response.json().catch(() => null)) as
    | PayPalAccessTokenResponse
    | null;
  const accessToken =
    typeof payload?.access_token === 'string' ? payload.access_token : '';

  if (!accessToken) {
    throw new PayPalApiError(
      'PayPal authentication returned an invalid response',
      response.status,
      'invalid_response',
    );
  }

  return accessToken;
}

async function paypalRequest(
  path: string,
  init: RequestInit,
  requestId?: string,
) {
  const config = getPayPalConfig();
  const accessToken = await getPayPalAccessToken(config);

  if (requestId) {
    validateRequestId(requestId);
  }

  const response = await fetchWithTimeout(`${config.baseUrl}${path}`, {
    ...init,
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
      ...(requestId ? { 'PayPal-Request-Id': requestId } : {}),
      ...init.headers,
    },
  });

  if (!response.ok) {
    throw new PayPalApiError('PayPal request was not accepted', response.status);
  }

  const payload = (await response.json().catch(() => null)) as PayPalApiOrder | null;

  if (!payload) {
    throw new PayPalApiError(
      'PayPal returned an invalid response',
      response.status,
      'invalid_response',
    );
  }

  return normalizePayPalOrder(payload);
}

function normalizedAmount(
  amount: PayPalApiAmount | undefined,
): NormalizedPayPalAmount | null {
  const currencyCode =
    typeof amount?.currency_code === 'string' ? amount.currency_code : '';
  const value = typeof amount?.value === 'string' ? amount.value : '';

  return currencyCode && value ? { currencyCode, value } : null;
}

export function normalizePayPalOrder(
  order: PayPalApiOrder,
): NormalizedPayPalOrder {
  const id = typeof order.id === 'string' ? order.id : '';
  const status = typeof order.status === 'string' ? order.status : '';

  if (!id || !status || !Array.isArray(order.purchase_units)) {
    throw new PayPalApiError(
      'PayPal returned an incomplete order',
      null,
      'invalid_response',
    );
  }

  return {
    id,
    status,
    purchaseUnits: order.purchase_units.map((unit) => ({
      referenceId:
        typeof unit.reference_id === 'string' ? unit.reference_id : null,
      customId: typeof unit.custom_id === 'string' ? unit.custom_id : null,
      invoiceId: typeof unit.invoice_id === 'string' ? unit.invoice_id : null,
      amount: normalizedAmount(unit.amount),
      captures: Array.isArray(unit.payments?.captures)
        ? unit.payments.captures.map((capture) => ({
            id: typeof capture.id === 'string' ? capture.id : '',
            status:
              typeof capture.status === 'string' ? capture.status : '',
            amount: normalizedAmount(capture.amount),
          }))
        : [],
    })),
  };
}

export function formatPayPalUsdAmount(amountMinor: number) {
  if (!Number.isSafeInteger(amountMinor) || amountMinor <= 0) {
    throw new Error('PayPal amount must be a positive integer in minor units');
  }

  return `${Math.floor(amountMinor / 100)}.${String(amountMinor % 100).padStart(2, '0')}`;
}

export async function createPayPalOrder({
  purchaseId,
  description,
  amountMinor,
  requestId,
}: PayPalOrderCreateInput) {
  return paypalRequest(
    '/v2/checkout/orders',
    {
      method: 'POST',
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [
          {
            reference_id: purchaseId,
            custom_id: purchaseId,
            invoice_id: purchaseId,
            description,
            amount: {
              currency_code: 'USD',
              value: formatPayPalUsdAmount(amountMinor),
            },
          },
        ],
        application_context: {
          shipping_preference: 'NO_SHIPPING',
          user_action: 'PAY_NOW',
        },
      }),
    },
    requestId,
  );
}

export async function capturePayPalOrder(
  orderId: string,
  requestId: string,
) {
  if (!orderId) {
    throw new Error('PayPal order ID is required');
  }

  return paypalRequest(
    `/v2/checkout/orders/${encodeURIComponent(orderId)}/capture`,
    {
      method: 'POST',
      body: '{}',
    },
    requestId,
  );
}

export async function getPayPalOrder(orderId: string) {
  if (!orderId) {
    throw new Error('PayPal order ID is required');
  }

  return paypalRequest(
    `/v2/checkout/orders/${encodeURIComponent(orderId)}`,
    {
      method: 'GET',
    },
  );
}
