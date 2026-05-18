/**
 * Device Lock Management Module
 * Handles device authorization and reset limits
 */

import { prisma } from "@/lib/prisma";

/**
 * Reset device lock for an API key
 * Updates the API key to clear the machine ID
 */
export async function resetDeviceLock(keyId: string): Promise<void> {
  try {
    await prisma.apiKey.update({
      where: { id: keyId },
      data: { machineId: null },
    });
  } catch (error) {
    console.error("Error resetting device lock:", error);
    throw new Error("Failed to reset device lock");
  }
}

/**
 * Log a device reset
 */
export async function logDeviceReset(
  userId: string,
  keyId: string
): Promise<void> {
  try {
    await prisma.deviceResetLog.create({
      data: {
        userId,
        apiKeyId: keyId,
        resetAt: new Date(),
      },
    });
  } catch (error) {
    console.error("Error logging device reset:", error);
    throw new Error("Failed to log device reset");
  }
}

/**
 * Check device reset limit
 * Users can reset their device N times per month
 */
export async function canResetDevice(userId: string): Promise<boolean> {
  const resetLimit = parseInt(
    process.env.DEVICE_RESET_LIMIT_PER_MONTH || "3"
  );

  try {
    // Get resets from current month
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const resets = await prisma.deviceResetLog.count({
      where: {
        userId,
        resetAt: {
          gte: monthStart,
        },
      },
    });

    return resets < resetLimit;
  } catch (error) {
    console.error("Error checking device reset limit:", error);
    throw new Error("Failed to check device reset limit");
  }
}

/**
 * Get device reset count for user in current month
 */
export async function getDeviceResetCount(userId: string): Promise<number> {
  try {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const count = await prisma.deviceResetLog.count({
      where: {
        userId,
        resetAt: {
          gte: monthStart,
        },
      },
    });

    return count;
  } catch (error) {
    console.error("Error getting device reset count:", error);
    return 0;
  }
}

/**
 * Get device reset limit
 */
export function getDeviceResetLimit(): number {
  return parseInt(process.env.DEVICE_RESET_LIMIT_PER_MONTH || "3");
}
