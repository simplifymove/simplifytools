import { createHmac, timingSafeEqual } from 'node:crypto';

export const AUDIT_REQUEST_HEADER = 'x-simplifyconvert-audit';
const TOKEN_CONTEXT = 'simplifyconvert-functional-audit';
const MAX_TOKEN_AGE_MS = 15 * 60 * 1000;

function auditSecret(): string | undefined {
  return process.env.AUDIT_REQUEST_SECRET || process.env.NEXTAUTH_SECRET;
}

function signatureFor(timestamp: string, secret: string): string {
  return createHmac('sha256', secret)
    .update(`${TOKEN_CONTEXT}:${timestamp}`)
    .digest('base64url');
}

export function createAuditRequestToken(now = Date.now()): string {
  const secret = auditSecret();
  if (!secret) {
    throw new Error('AUDIT_REQUEST_SECRET or NEXTAUTH_SECRET is required to identify functional audit traffic');
  }
  const timestamp = String(now);
  return `${timestamp}.${signatureFor(timestamp, secret)}`;
}

export function isVerifiedAuditRequest(headers: Pick<Headers, 'get'>, now = Date.now()): boolean {
  const secret = auditSecret();
  const token = headers.get(AUDIT_REQUEST_HEADER);
  if (!secret || !token) return false;

  const separator = token.indexOf('.');
  if (separator <= 0) return false;
  const timestamp = token.slice(0, separator);
  const suppliedSignature = token.slice(separator + 1);
  const issuedAt = Number(timestamp);
  if (!Number.isFinite(issuedAt) || Math.abs(now - issuedAt) > MAX_TOKEN_AGE_MS) return false;

  const expected = Buffer.from(signatureFor(timestamp, secret));
  const supplied = Buffer.from(suppliedSignature);
  return expected.length === supplied.length && timingSafeEqual(expected, supplied);
}
