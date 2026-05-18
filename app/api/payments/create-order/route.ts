/**
 * POST /api/payments/create-order
 * Creates a Razorpay order for subscription purchase
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { prisma } from "@/lib/prisma";
import { createRazorpayOrder } from "@/lib/billing/razorpay";

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, name: true, email: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Get plan price
    const priceINR = parseInt(process.env.AI_PLAN_PRICE_INR || "499");
    const currency = process.env.AI_PLAN_CURRENCY || "INR";

    // Create Razorpay order
    const razorpayOrder = await createRazorpayOrder({
      amount: priceINR * 100, // Convert to paise
      currency,
      receipt: `user_${user.id}_${Date.now()}`,
      customer_notify: 1,
      notes: {
        userId: user.id,
        userEmail: user.email || "",
        userName: user.name || "",
      },
    });

    // Save payment record in database
    const payment = await prisma.payment.create({
      data: {
        userId: user.id,
        razorpayOrderId: razorpayOrder.id,
        amount: priceINR * 100,
        currency,
        status: "created",
      },
    });

    return NextResponse.json(
      {
        success: true,
        orderId: razorpayOrder.id,
        amount: priceINR * 100,
        currency,
        keyId: process.env.RAZORPAY_KEY_ID,
        user: {
          email: user.email,
          name: user.name,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error creating Razorpay order:", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}
