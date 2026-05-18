/**
 * GET /api/user/ai-subscription
 * Returns user's AI subscription details
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { prisma } from "@/lib/prisma";
import { maskApiKey } from "@/lib/api-keys/generate";

export async function GET(request: NextRequest) {
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
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Get subscription
    const subscription = await prisma.aiSubscription.findUnique({
      where: { userId: user.id },
    });

    // Get API keys
    const apiKeys = await prisma.apiKey.findMany({
      where: { userId: user.id },
      select: {
        id: true,
        keyPrefix: true,
        keyLast4: true,
        machineId: true,
        isActive: true,
        createdAt: true,
        deactivatedAt: true,
      },
    });

    if (!subscription) {
      return NextResponse.json({
        subscription: null,
        apiKeys: apiKeys.map((k) => ({
          ...k,
          masked: `${k.keyPrefix}...${k.keyLast4}`,
        })),
        creditsInfo: {
          monthlyCredits: parseInt(process.env.AI_MONTHLY_CREDITS || "100"),
        },
      });
    }

    return NextResponse.json({
      subscription: {
        id: subscription.id,
        planName: subscription.planName,
        status: subscription.status,
        monthlyCredits: subscription.monthlyCredits,
        creditsUsed: subscription.creditsUsed,
        creditsRemaining: subscription.creditsRemaining,
        startsAt: subscription.startsAt,
        expiresAt: subscription.expiresAt,
        daysRemaining: subscription.expiresAt
          ? Math.ceil(
              (subscription.expiresAt.getTime() - Date.now()) /
                (1000 * 60 * 60 * 24)
            )
          : null,
      },
      apiKeys: apiKeys.map((k) => ({
        ...k,
        masked: `${k.keyPrefix}...${k.keyLast4}`,
      })),
      creditsInfo: {
        monthlyCredits: subscription.monthlyCredits,
        creditsUsed: subscription.creditsUsed,
        creditsRemaining: subscription.creditsRemaining,
        percentUsed: Math.round(
          (subscription.creditsUsed / subscription.monthlyCredits) * 100
        ),
      },
    });
  } catch (error) {
    console.error("Error fetching subscription:", error);
    return NextResponse.json(
      { error: "Failed to fetch subscription" },
      { status: 500 }
    );
  }
}
