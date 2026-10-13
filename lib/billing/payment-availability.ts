export function isPaymentEnabled(): boolean {
  return process.env.SIMPLIFYCONVERT_PAYMENTS_ENABLED === 'true';
}
