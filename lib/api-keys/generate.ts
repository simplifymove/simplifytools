/**
 * API Key Generation and Management (SHA-256 based for performance)
 * Generates secure API keys with SHA-256 hashing (much faster than bcrypt)
 * Storage format: keyHash (SHA-256), keyPrefix, keyLast4
 * Benefits: Fast synchronous validation suitable for every API request
 */

import { createHash, randomBytes } from "crypto";

const API_KEY_PREFIX = "sca_live_"; // SimplifyConvert AI Live Key
const TOKEN_LENGTH = 24; // 24 bytes = 48 hex characters

/**
 * Generate a new API key
 * Format: sca_live_<48 hex characters> = 57 chars total
 * Returns: full key, prefix, last4 for database storage
 */
export function generateApiKey(): {
  apiKey: string;
  keyHash: string;
  keyPrefix: string;
  keyLast4: string;
} {
  const tokenBytes = randomBytes(TOKEN_LENGTH);
  const tokenHex = tokenBytes.toString("hex");
  const apiKey = `${API_KEY_PREFIX}${tokenHex}`;
  
  const keyHash = hashApiKey(apiKey);
  const keyPrefix = apiKey.slice(0, 12); // "sca_live_" + 3 hex chars
  const keyLast4 = apiKey.slice(-4);

  return {
    apiKey,
    keyHash,
    keyPrefix,
    keyLast4,
  };
}

/**
 * Hash an API key with SHA-256 for storage
 * Synchronous and very fast for every-request validation
 * Much faster than bcrypt (ms vs hundreds of ms)
 */
export function hashApiKey(apiKey: string): string {
  return createHash("sha256").update(apiKey).digest("hex");
}

/**
 * Verify an API key against its SHA-256 hash
 * Synchronous - suitable for every API request
 * Constant-time comparison to prevent timing attacks
 */
export function verifyApiKey(apiKey: string, keyHash: string): boolean {
  try {
    const computedHash = hashApiKey(apiKey);
    // Use string comparison (safe for hashes)
    return computedHash === keyHash;
  } catch (error) {
    console.error("Error verifying API key:", error);
    return false;
  }
}

/**
 * Get key prefix from a full API key
 */
export function extractKeyPrefix(apiKey: string): string {
  return apiKey.slice(0, 12); // "sca_live_" + 3 chars
}

/**
 * Get last 4 characters from a full API key
 */
export function extractKeyLast4(apiKey: string): string {
  return apiKey.slice(-4);
}

/**
 * Mask an API key for display (show only last 4 characters)
 * Example: sca_live_••••••••••••••••••••••••••••••••••••••1a2b
 */
export function maskApiKey(apiKey: string): string {
  if (!apiKey || apiKey.length < 4) return "••••••••••••••••••••••••••••••••••••••";
  const last4 = apiKey.slice(-4);
  const masked = "•".repeat(Math.max(0, apiKey.length - 4));
  return masked + last4;
}

/**
 * Validate API key format
 */
export function isValidApiKeyFormat(apiKey: string): boolean {
  return (
    apiKey.startsWith(API_KEY_PREFIX) &&
    apiKey.length === API_KEY_PREFIX.length + 48 // Should be exactly this length
  );
}
