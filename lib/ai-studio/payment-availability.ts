import { isPaymentEnabled } from '@/lib/billing/payment-availability';

export function isAiStudioPaymentEnabled(): boolean {
  return (
    isPaymentEnabled() &&
    process.env.AI_STUDIO_PAYMENTS_ENABLED === 'true'
  );
}
