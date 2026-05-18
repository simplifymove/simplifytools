/**
 * API Key Validation Module
 * Validates API keys against database records with fast SHA-256 verification
 */

import { prisma } from "@/lib/prisma";
import { verifyApiKey, extractKeyPrefix } from "@/lib/api-keys/generate";

export interface ValidatedApiKey {
  valid: boolean;
  userId?: string;
  keyId?: string;
  machineId?: string | null;
  isActive?: boolean;
  error?: string;
}

/**
 * Validate API key from Authorization header
 * Header format: Authorization: Bearer sca_live_xxxxxxxxxxxxxxxx
 */
export function extractApiKeyFromHeader(
  authHeader?: string
): string | undefined {
  if (!authHeader) return undefined;

  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return undefined;
  }

  return parts[1];
}

/**
 * Validate API key against database
 * Uses keyPrefix to narrow down search, then SHA-256 verification
 */
export async function validateApiKey(
  apiKey: string
): Promise<ValidatedApiKey> {
  if (!apiKey) {
    return {
      valid: false,
      error: "API key is required",
    };
  }

  try {
    // Extract prefix to narrow down database search
    const keyPrefix = extractKeyPrefix(apiKey);

    // Find API key by prefix first (much faster than fetching all)
    const dbKey = await prisma.apiKey.findFirst({
      where: {
        keyPrefix,
        isActive: true,
      },
      include: {
        user: {
          select: {
            id: true,
            subscription: {
              select: {
                status: true,
                expiresAt: true,
              },
            },
          },
        },
      },
    });

    if (!dbKey) {
      return {
        valid: false,
        error: "Invalid API key",
      };
    }

    // Verify against SHA-256 hash (synchronous, very fast)
    if (!verifyApiKey(apiKey, dbKey.keyHash)) {
      return {
        valid: false,
        error: "Invalid API key",
      };
    }

    // Check if subscription is active
    if (
      !dbKey.user.subscription ||
      dbKey.user.subscription.status !== "active"
    ) {
      return {
        valid: false,
        userId: dbKey.userId,
        keyId: dbKey.id,
        error: "Subscription is not active",
      };
    }

    // Check if subscription has expired
    if (
      dbKey.user.subscription.expiresAt &&
      dbKey.user.subscription.expiresAt < new Date()
    ) {
      return {
        valid: false,
        userId: dbKey.userId,
        keyId: dbKey.id,
        error: "Subscription has expired",
      };
    }

    return {
      valid: true,
      userId: dbKey.userId,
      keyId: dbKey.id,
      machineId: dbKey.machineId,
      isActive: dbKey.isActive,
    };
  } catch (error) {
    console.error("Error validating API key:", error);
    return {
      valid: false,
      error: "Failed to validate API key",
    };
  }
}

/**
 * Validate device lock (machine ID)
 */
export async function validateDeviceLock(
  keyId: string,
  incomingMachineId: string
): Promise<{ valid: boolean; error?: string }> {
  try {
    const key = await prisma.apiKey.findUnique({
      where: { id: keyId },
    });

    if (!key) {
      return { valid: false, error: "API key not found" };
    }

    // If no machine ID is set, this is the first use - set it
    if (!key.machineId) {
      await prisma.apiKey.update({
        where: { id: keyId },
        data: { machineId: incomingMachineId },
      });
      return { valid: true };
    }

    // Check if machine ID matches
    if (key.machineId !== incomingMachineId) {
      return {
        valid: false,
        error: "Device not authorized for this API key",
      };
    }

    return { valid: true };
  } catch (error) {
    console.error("Error validating device lock:", error);
    return {
      valid: false,
      error: "Failed to validate device",
    };
  }
}

/**
 * Check if user has enough credits
 */
export async function checkUserCredits(
  userId: string,
  requiredCredits: number
): Promise<{ hasEnough: boolean; remaining?: number; error?: string }> {
  try {
    const subscription = await prisma.aiSubscription.findUnique({
      where: { userId },
    });

    if (!subscription) {
      return {
        hasEnough: false,
        error: "No subscription found",
      };
    }

    if (subscription.creditsRemaining < requiredCredits) {
      return {
        hasEnough: false,
        remaining: subscription.creditsRemaining,
        error: `Insufficient credits. Required: ${requiredCredits}, Available: ${subscription.creditsRemaining}`,
      };
    }

    return {
      hasEnough: true,
      remaining: subscription.creditsRemaining,
    };
  } catch (error) {
    console.error("Error checking credits:", error);
    return {
      hasEnough: false,
      error: "Failed to check credits",
    };
  }
}
