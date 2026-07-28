import {
  getAiStudioPlan,
  isAiStudioPayPalUsdPlan,
} from '@/lib/ai-studio/plans';
import type {
  NormalizedPayPalCapture,
  NormalizedPayPalOrder,
} from '@/lib/billing/paypal';

interface PayPalPurchaseSnapshot {
  id: string;
  planId: string;
  provider: string;
  providerOrderId: string | null;
  currency: string;
  grossAmountMinor: number;
}

export class AiStudioPayPalCaptureValidationError extends Error {
  constructor(
    message: string,
    readonly pendingVerification = false,
  ) {
    super(message);
    this.name = 'AiStudioPayPalCaptureValidationError';
  }
}

function parseUsdMinorUnits(value: string) {
  const match = /^(\d+)(?:\.(\d{1,2}))?$/.exec(value);

  if (!match) {
    return null;
  }

  const major = Number(match[1]);
  const minor = Number((match[2] || '').padEnd(2, '0'));

  if (!Number.isSafeInteger(major) || !Number.isSafeInteger(minor)) {
    return null;
  }

  const amountMinor = major * 100 + minor;
  return Number.isSafeInteger(amountMinor) ? amountMinor : null;
}

function requireExpectedPlan(
  purchase: PayPalPurchaseSnapshot,
) {
  const plan = getAiStudioPlan(purchase.planId);

  if (
    !isAiStudioPayPalUsdPlan(plan) ||
    purchase.provider !== 'paypal' ||
    purchase.currency !== 'USD' ||
    purchase.grossAmountMinor !== plan.grossAmountMinor
  ) {
    throw new AiStudioPayPalCaptureValidationError(
      'Purchase no longer matches an available PayPal USD plan',
    );
  }

}

export function validateAiStudioPayPalCapture(
  purchase: PayPalPurchaseSnapshot,
  order: NormalizedPayPalOrder,
): NormalizedPayPalCapture {
  requireExpectedPlan(purchase);

  if (!purchase.providerOrderId || order.id !== purchase.providerOrderId) {
    throw new AiStudioPayPalCaptureValidationError(
      'PayPal order does not match the purchase',
    );
  }

  if (order.purchaseUnits.length !== 1) {
    throw new AiStudioPayPalCaptureValidationError(
      'PayPal order has an unexpected purchase-unit count',
    );
  }

  const unit = order.purchaseUnits[0];

  if (
    unit.referenceId !== purchase.id ||
    unit.customId !== purchase.id ||
    unit.invoiceId !== purchase.id
  ) {
    throw new AiStudioPayPalCaptureValidationError(
      'PayPal order reference does not match the purchase',
    );
  }

  if (order.status !== 'COMPLETED') {
    throw new AiStudioPayPalCaptureValidationError(
      'PayPal capture is not completed',
      order.status === 'APPROVED' || order.status === 'PAYER_ACTION_REQUIRED',
    );
  }

  if (unit.captures.length !== 1) {
    throw new AiStudioPayPalCaptureValidationError(
      'PayPal order does not contain one completed capture',
      unit.captures.length === 0,
    );
  }

  const capture = unit.captures[0];

  if (!capture.id || capture.status !== 'COMPLETED' || !capture.amount) {
    throw new AiStudioPayPalCaptureValidationError(
      'PayPal capture is not completed',
      capture.status === 'PENDING' || !capture.id,
    );
  }

  const capturedAmountMinor = parseUsdMinorUnits(capture.amount.value);

  if (
    capture.amount.currencyCode !== 'USD' ||
    capturedAmountMinor !== purchase.grossAmountMinor
  ) {
    throw new AiStudioPayPalCaptureValidationError(
      'PayPal capture amount does not match the purchase',
    );
  }

  return capture;
}
