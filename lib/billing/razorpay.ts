/**
 * Razorpay Payment Integration Module
 * Handles order creation and webhook verification
 */

import crypto from "crypto";

export interface RazorpayOrderOptions {
  amount: number; // in paise (lowest unit)
  currency: string;
  receipt: string;
  customer_notify: number;
  notes?: Record<string, string>;
}

export interface RazorpayOrderResponse {
  id: string;
  entity: string;
  amount: number;
  amount_paid: number;
  amount_due: number;
  currency: string;
  receipt: string;
  offer_id?: string;
  status: string;
  attempts: number;
  notes: Record<string, string>;
  created_at: number;
}

/**
 * Create a new Razorpay order
 */
export async function createRazorpayOrder(
  options: RazorpayOrderOptions
): Promise<RazorpayOrderResponse> {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    throw new Error("Razorpay credentials not configured");
  }

  const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");

  try {
    const response = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(options),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Razorpay API error: ${error}`);
    }

    return (await response.json()) as RazorpayOrderResponse;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to create Razorpay order: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Verify Razorpay webhook signature
 */
export function verifyRazorpayWebhookSignature(
  webhookSecret: string,
  body: string,
  signature: string
): boolean {
  const expectedSignature = crypto
    .createHmac("sha256", webhookSecret)
    .update(body)
    .digest("hex");

  return expectedSignature === signature;
}

/**
 * Verify a Razorpay Checkout payment callback signature.
 */
export function verifyRazorpayPaymentSignature(
  orderId: string,
  paymentId: string,
  signature: string
): boolean {
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keySecret) {
    throw new Error("Razorpay credentials not configured");
  }

  const expectedSignature = crypto
    .createHmac("sha256", keySecret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

  return expectedSignature === signature;
}

/**
 * Fetch payment details from Razorpay
 */
export async function fetchRazorpayPayment(
  paymentId: string
): Promise<Record<string, unknown>> {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    throw new Error("Razorpay credentials not configured");
  }

  const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");

  try {
    const response = await fetch(
      `https://api.razorpay.com/v1/payments/${paymentId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Basic ${auth}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch payment: ${response.statusText}`);
    }

    return (await response.json()) as Record<string, unknown>;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to fetch Razorpay payment: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Refund a payment
 */
export async function refundRazorpayPayment(
  paymentId: string,
  amount?: number
): Promise<Record<string, unknown>> {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    throw new Error("Razorpay credentials not configured");
  }

  const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");

  const body: Record<string, unknown> = {};
  if (amount) {
    body.amount = amount;
  }

  try {
    const response = await fetch(
      `https://api.razorpay.com/v1/payments/${paymentId}/refund`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to refund payment: ${response.statusText}`);
    }

    return (await response.json()) as Record<string, unknown>;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(
        `Failed to refund Razorpay payment: ${error.message}`
      );
    }
    throw error;
  }
}
