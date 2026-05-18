/**
 * Rate Limiting Module
 * Implements in-memory rate limiting for API endpoints
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore: Map<string, RateLimitEntry> = new Map();
const CLEANUP_INTERVAL = 60 * 1000; // 1 minute

// Cleanup old entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetTime < now) {
      rateLimitStore.delete(key);
    }
  }
}, CLEANUP_INTERVAL);

/**
 * Check rate limit for a user/API key
 */
export function checkRateLimit(
  identifier: string,
  limit: number = parseInt(process.env.AI_RATE_LIMIT_PER_MINUTE || "30"),
  windowSeconds: number = 60
): { allowed: boolean; remaining: number; resetIn: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(identifier);

  // If no entry or reset time has passed, create new window
  if (!entry || entry.resetTime < now) {
    const newEntry: RateLimitEntry = {
      count: 1,
      resetTime: now + windowSeconds * 1000,
    };
    rateLimitStore.set(identifier, newEntry);

    return {
      allowed: true,
      remaining: limit - 1,
      resetIn: windowSeconds,
    };
  }

  // Within window, increment count
  if (entry.count < limit) {
    entry.count++;
    return {
      allowed: true,
      remaining: limit - entry.count,
      resetIn: Math.ceil((entry.resetTime - now) / 1000),
    };
  }

  // Limit exceeded
  return {
    allowed: false,
    remaining: 0,
    resetIn: Math.ceil((entry.resetTime - now) / 1000),
  };
}

/**
 * Get rate limit status without incrementing
 */
export function getRateLimitStatus(
  identifier: string,
  limit: number = parseInt(process.env.AI_RATE_LIMIT_PER_MINUTE || "30"),
  windowSeconds: number = 60
): { count: number; limit: number; resetIn: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(identifier);

  if (!entry || entry.resetTime < now) {
    return {
      count: 0,
      limit,
      resetIn: windowSeconds,
    };
  }

  return {
    count: entry.count,
    limit,
    resetIn: Math.ceil((entry.resetTime - now) / 1000),
  };
}

/**
 * Reset rate limit for a user
 */
export function resetRateLimit(identifier: string): void {
  rateLimitStore.delete(identifier);
}

/**
 * Clear all rate limits
 */
export function clearAllRateLimits(): void {
  rateLimitStore.clear();
}
