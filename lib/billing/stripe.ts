import Stripe from 'stripe';

export function getStripeServerClient() {
  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!secretKey) {
    throw new Error('Stripe secret key not configured');
  }

  return new Stripe(secretKey);
}

export function getStripeWebhookSecret() {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    throw new Error('Stripe webhook secret not configured');
  }

  return webhookSecret;
}
