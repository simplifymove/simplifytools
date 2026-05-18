/**
 * POST /api/user/device/reset
 * Resets device lock for an API key
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { prisma } from "@/lib/prisma";
import {
  resetDeviceLock,
  logDeviceReset,
  canResetDevice,
  getDeviceResetCount,
  getDeviceResetLimit,
} from "@/lib/device/device-lock";

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

    // Get request body
    const body = await request.json();
    const { keyId } = body;

    if (!keyId) {
      return NextResponse.json(
        { error: "keyId is required" },
        { status: 400 }
      );
    }

    // Verify key belongs to user
    const apiKey = await prisma.apiKey.findUnique({
      where: { id: keyId },
    });

    if (!apiKey || apiKey.userId !== user.id) {
      return NextResponse.json(
        { error: "API key not found or not authorized" },
        { status: 404 }
      );
    }

    // Check if user can reset device (monthly limit)
    const canReset = await canResetDevice(user.id);

    if (!canReset) {
      const limit = getDeviceResetLimit();
      return NextResponse.json(
        {
          error: `Monthly device reset limit (${limit}) reached`,
        },
        { status: 429 }
      );
    }

    // Reset device lock
    await resetDeviceLock(keyId);
    await logDeviceReset(user.id, keyId);

    // Get updated reset count
    const resetCount = await getDeviceResetCount(user.id);
    const resetLimit = getDeviceResetLimit();

    return NextResponse.json(
      {
        success: true,
        message: "Device lock has been reset. Use this API key on a new device.",
        resetCount,
        resetLimit,
        resets_remaining: resetLimit - resetCount,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error resetting device lock:", error);
    return NextResponse.json(
      { error: "Failed to reset device lock" },
      { status: 500 }
    );
  }
}
