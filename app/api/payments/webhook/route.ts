/**
 * POST /api/payments/webhook
 * Razorpay webhook handler for payment completion
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyRazorpayWebhookSignature } from "@/lib/billing/razorpay";
import {
  generateApiKey,
  hashApiKey,
} from "@/lib/api-keys/generate";
import { getMonthlyCredits } from "@/lib/ai/credit-calculator";

interface RazorpayPaymentData {
  id: string;
  entity: string;
  amount: number;
  currency: string;
  status: string;
  method: string;
  description?: string;
  amount_refunded: number;
  refund_status?: string;
  captured: boolean;
  card_id?: string;
  bank?: string;
  wallet?: string;
  vpa?: string;
  email: string;
  contact?: string;
  fee?: number;
  tax?: number;
  error_code?: string;
  error_description?: string;
  error_source?: string;
  error_reason?: string;
  acquirer_data: Record<string, unknown>;
  notes: Record<string, string>;
  fee_details?: Record<string, unknown>;
  order_id: string;
  invoice_id?: string;
  international: boolean;
  amount_paise: number;
  created_at: number;
}

interface RazorpayOrderData {
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

interface RazorpayWebhookPayload {
  event: string;
  created_at: number;
  payload: {
    payment: RazorpayPaymentData;
    order: RazorpayOrderData;
  };
}

export async function POST(request: NextRequest) {
  try {
    // Get webhook body and signature
    const body = await request.text();
    const signature = request.headers.get("x-razorpay-signature");

    if (!signature) {
      return NextResponse.json(
        { error: "Missing signature" },
        { status: 400 }
      );
    }

    // Verify webhook signature
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error("RAZORPAY_WEBHOOK_SECRET not configured");
      return NextResponse.json(
        { error: "Webhook secret not configured" },
        { status: 500 }
      );
    }

    const isValid = verifyRazorpayWebhookSignature(
      webhookSecret,
      body,
      signature
    );

    if (!isValid) {
      console.warn("Invalid webhook signature");
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 401 }
      );
    }

    // Parse webhook payload
    const payload = JSON.parse(body) as RazorpayWebhookPayload;

    // Handle payment.authorized event
    if (payload.event === "payment.authorized") {
      const paymentData = payload.payload.payment;
      const orderData = payload.payload.order;

      // Find the payment record
      const payment = await prisma.payment.findUnique({
        where: { razorpayOrderId: orderData.id },
        include: { user: true },
      });

      if (!payment) {
        console.warn(`Payment order not found: ${orderData.id}`);
        return NextResponse.json(
          { error: "Order not found" },
          { status: 404 }
        );
      }

      // Update payment status
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          razorpayPaymentId: paymentData.id,
          status: "authorized",
          rawWebhookPayload: body,
        },
      });

      // Create or update subscription
      const now = new Date();
      const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days

      const monthlyCredits = getMonthlyCredits();

      let subscription = await prisma.aiSubscription.findUnique({
        where: { userId: payment.userId },
      });

      if (subscription) {
        // Update existing subscription
        await prisma.aiSubscription.update({
          where: { id: subscription.id },
          data: {
            status: "active",
            monthlyCredits,
            creditsUsed: 0,
            creditsRemaining: monthlyCredits,
            startsAt: now,
            expiresAt,
            lastPaymentId: payment.id,
          },
        });
      } else {
        // Create new subscription
        subscription = await prisma.aiSubscription.create({
          data: {
            userId: payment.userId,
            planName: "monthly",
            status: "active",
            monthlyCredits,
            creditsUsed: 0,
            creditsRemaining: monthlyCredits,
            startsAt: now,
            expiresAt,
            lastPaymentId: payment.id,
          },
        });
      }

      // Generate API key if user doesn't have one
      const existingKeys = await prisma.apiKey.count({
        where: { userId: payment.userId },
      });

      if (existingKeys === 0) {
        const { apiKey, keyHash, keyPrefix, keyLast4 } = generateApiKey();

        await prisma.apiKey.create({
          data: {
            userId: payment.userId,
            keyHash,
            keyPrefix,
            keyLast4,
            isActive: true,
          },
        });

        // TODO: Send email with API key
        console.log(`New API key generated for user ${payment.userId}`);
      }

      console.log(
        `Subscription activated for user ${payment.userId}`
      );
    }

    // Return success response
    return NextResponse.json({ status: "success" }, { status: 200 });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return NextResponse.json(
      { error: "Failed to process webhook" },
      { status: 500 }
    );
  }
}
