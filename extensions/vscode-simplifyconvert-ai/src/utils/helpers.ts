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
    'OLLAMA_ERROR': 'AI service error. The model may be loading. Please try again in a moment.',
    'SERVER_BUSY': 'Server is temporarily busy. Please try again in a few seconds.',
    'DEVICE_MISMATCH': 'API key is locked to a different device. Reset in your account to use it here.',
    'CREDITS_EXHAUSTED': 'You\'ve used all monthly credits. Upgrade your plan to continue.',
    'SUBSCRIPTION_EXPIRED': 'Your subscription expired. Renew to continue using the AI assistant.',
    'INVALID_API_KEY': 'Invalid API key format or expired. Please check and update your API key.',
    'NETWORK_ERROR': 'Network error. Check your internet connection and try again.',
    'INSUFFICIENT_CREDITS': 'Not enough credits for this request. Upgrade your plan.',
    'PROMPT_TOO_LARGE': 'Your prompt is too large. Please split your request into smaller parts.',
    'SECRET_DETECTED': 'Sensitive data detected (API keys, passwords, etc.). Please remove and try again.',
    'RATE_LIMITED': 'Rate limit exceeded. Please wait a moment before trying again.',
    'OLLAMA_UNAVAILABLE': 'AI service is loading or unavailable. Try again in a moment.',
    'INTERNAL_ERROR': 'Server error occurred. Please try again or contact support.',
    'TIMEOUT': 'Request timed out. The AI is taking too long. Try a simpler prompt.',
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
