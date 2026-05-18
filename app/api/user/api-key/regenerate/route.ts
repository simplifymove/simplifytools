/**
 * POST /api/user/api-key/regenerate
 * Generates a new API key and deactivates the old one
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { prisma } from "@/lib/prisma";
import {
  generateApiKey,
  hashApiKey,
  maskApiKey,
} from "@/lib/api-keys/generate";

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
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Check subscription
    const subscription = await prisma.aiSubscription.findUnique({
      where: { userId: user.id },
    });

    if (!subscription || subscription.status !== "active") {
      return NextResponse.json(
        { error: "No active subscription" },
        { status: 403 }
      );
    }

    // Deactivate old keys
    await prisma.apiKey.updateMany({
      where: { userId: user.id, isActive: true },
      data: {
        isActive: false,
        deactivatedAt: new Date(),
      },
    });

    // Generate new key
    const { apiKey, keyHash, keyPrefix, keyLast4 } = generateApiKey();

    const newKey = await prisma.apiKey.create({
      data: {
        userId: user.id,
        keyHash,
        keyPrefix,
        keyLast4,
        isActive: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        apiKey, // Show full key only once
        keyId: newKey.id,
        masked: maskApiKey(apiKey),
        message:
          "API key regenerated. Save your new key - it will not be shown again.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error regenerating API key:", error);
    return NextResponse.json(
      { error: "Failed to regenerate API key" },
      { status: 500 }
    );
  }
}
