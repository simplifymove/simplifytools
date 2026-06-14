interface SecretScanResult {
  hasSecrets: boolean;
  secretTypes: string[];
  message?: string;
}

const SECRET_PATTERNS: Array<{ type: string; pattern: RegExp }> = [
  { type: 'AWS access key', pattern: /\bAKIA[0-9A-Z]{16}\b/g },
  { type: 'GitHub token', pattern: /\bgh[pousr]_[A-Za-z0-9_]{36,255}\b/g },
  { type: 'OpenAI API key', pattern: /\bsk-[A-Za-z0-9_-]{20,}\b/g },
  { type: 'Google API key', pattern: /\bAIza[0-9A-Za-z_-]{35}\b/g },
  { type: 'Private key', pattern: /-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----/g },
  { type: 'Connection string', pattern: /\b(?:mongodb|postgres|postgresql|mysql):\/\/[^\s'"`]+/gi },
];

export function scanForSecrets(input: string): SecretScanResult {
  const secretTypes = new Set<string>();

  for (const { type, pattern } of SECRET_PATTERNS) {
    pattern.lastIndex = 0;
    if (pattern.test(input)) {
      secretTypes.add(type);
    }
  }

  const detectedTypes = Array.from(secretTypes);

  return {
    hasSecrets: detectedTypes.length > 0,
    secretTypes: detectedTypes,
    message: detectedTypes.length > 0
      ? 'Sensitive credentials detected. Remove secrets before sending code to AI.'
      : undefined,
  };
}
