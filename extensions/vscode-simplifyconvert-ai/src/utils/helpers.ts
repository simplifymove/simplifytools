import * as crypto from 'crypto';

/**
 * Generate or retrieve stable machine ID
 * Stored in VS Code globalState to persist across sessions
 */
export async function getOrCreateMachineId(globalState: any): Promise<string> {
  let machineId: string | undefined = globalState.get('simplifyconvertAI.machineId') as string | undefined;

  if (!machineId) {
    // Generate new machine ID using crypto random UUID
    const uuid = require('crypto').randomUUID() as string;
    machineId = uuid;
    await globalState.update('simplifyconvertAI.machineId', machineId);
  }

  return machineId;
}

/**
 * Format error message based on error code from backend
 */
export function formatErrorMessage(code: string, message: string): string {
  const friendlyMessages: { [key: string]: string } = {
    'INVALID_API_KEY': 'Invalid API key. Please check your key and try again.',
    'SUBSCRIPTION_EXPIRED': 'Your subscription has expired. Please renew to continue.',
    'CREDITS_EXHAUSTED': 'You\'ve used all your monthly credits. Please upgrade your plan.',
    'INSUFFICIENT_CREDITS': 'Not enough credits for this request.',
    'DEVICE_MISMATCH': 'This API key is locked to a different device. Reset in your dashboard to use on this device.',
    'PROMPT_TOO_LARGE': 'Your prompt is too large (max 40,000 characters). Please split your request.',
    'SECRET_DETECTED': 'Your prompt contains sensitive information (API keys, credentials, etc.). Please remove them.',
    'SERVER_BUSY': 'Server is busy. Please try again in a few seconds.',
    'RATE_LIMITED': 'You\'ve exceeded the rate limit (30 requests/minute). Please wait a moment.',
    'OLLAMA_UNAVAILABLE': 'AI service is temporarily unavailable. Please try again later.',
    'INTERNAL_ERROR': 'An error occurred. Please try again or contact support.',
  };

  return friendlyMessages[code] || message || 'An error occurred';
}

/**
 * Check if filename is potentially dangerous to send
 */
export function isBlockedFileName(fileName: string): boolean {
  const blockedPatterns = ['.env', '.env.local', '.env.production', '.env.development'];
  return blockedPatterns.some(pattern => fileName.includes(pattern));
}

/**
 * Validate API key format
 */
export function isValidApiKeyFormat(apiKey: string): boolean {
  return /^sca_live_[a-f0-9]{48}$/.test(apiKey);
}

/**
 * Mask API key for display
 */
export function maskApiKey(apiKey: string): string {
  if (apiKey.length <= 8) {
    return apiKey;
  }
  const visible = apiKey.substring(0, 10);
  const masked = '*'.repeat(Math.max(0, apiKey.length - 14));
  const end = apiKey.substring(apiKey.length - 4);
  return `${visible}${masked}${end}`;
}
