import { isIP } from 'node:net';
import { lookup } from 'node:dns/promises';

const ALLOWED_PROTOCOLS = new Set(['http:', 'https:']);

export class WebsiteSeoUrlSafetyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'WebsiteSeoUrlSafetyError';
  }
}

function normalizeHostname(hostname: string): string {
  return hostname.trim().toLowerCase().replace(/\.$/, '');
}

function normalizeIpHostname(hostname: string): string {
  const normalized = normalizeHostname(hostname);

  if (
    normalized.startsWith('[') &&
    normalized.endsWith(']')
  ) {
    return normalized.slice(1, -1);
  }

  return normalized;
}

function isBlockedHostname(hostname: string): boolean {
  const normalized = normalizeHostname(hostname);

  if (!normalized) {
    return true;
  }

  if (
    normalized === 'localhost' ||
    normalized.endsWith('.localhost') ||
    normalized === 'localhost.localdomain'
  ) {
    return true;
  }

  return false;
}

function isBlockedIpv4(address: string): boolean {
  const parts = address.split('.').map(Number);

  if (
    parts.length !== 4 ||
    parts.some((part) => !Number.isInteger(part) || part < 0 || part > 255)
  ) {
    return true;
  }

  const [a, b, c] = parts;

  return (
    a === 0 ||
    a === 10 ||
    a === 127 ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    (a === 192 && b === 0 && c === 2) ||
    (a === 198 && b === 51 && c === 100) ||
    (a === 203 && b === 0 && c === 113) ||
    (a === 100 && b >= 64 && b <= 127) ||
    (a === 198 && (b === 18 || b === 19)) ||
    a >= 224
  );
}

function ipv4FromMappedIpv6(address: string): string | null {
  const normalized = address.toLowerCase().split('%')[0];

  if (!normalized.startsWith('::ffff:')) {
    return null;
  }

  const tail = normalized.slice('::ffff:'.length);

  const dottedMatch = tail.match(
    /^(\d{1,3}(?:\.\d{1,3}){3})$/,
  );

  if (dottedMatch) {
    return dottedMatch[1];
  }

  const hexMatch = tail.match(
    /^([0-9a-f]{1,4}):([0-9a-f]{1,4})$/,
  );

  if (!hexMatch) {
    return null;
  }

  const high = Number.parseInt(hexMatch[1], 16);
  const low = Number.parseInt(hexMatch[2], 16);

  if (
    !Number.isInteger(high) ||
    !Number.isInteger(low) ||
    high < 0 ||
    high > 0xffff ||
    low < 0 ||
    low > 0xffff
  ) {
    return null;
  }

  return [
    (high >> 8) & 0xff,
    high & 0xff,
    (low >> 8) & 0xff,
    low & 0xff,
  ].join('.');
}

function ipv6Words(address: string): number[] | null {
  let normalized = address.toLowerCase().split('%')[0];

  const dottedMatch = normalized.match(
    /(\d{1,3}(?:\.\d{1,3}){3})$/,
  );

  if (dottedMatch) {
    const octets = dottedMatch[1].split('.').map(Number);

    if (
      octets.some(
        (part) =>
          !Number.isInteger(part) || part < 0 || part > 255,
      )
    ) {
      return null;
    }

    const high = ((octets[0] << 8) | octets[1]).toString(16);
    const low = ((octets[2] << 8) | octets[3]).toString(16);

    normalized = normalized.replace(
      dottedMatch[1],
      `${high}:${low}`,
    );
  }

  const halves = normalized.split('::');

  if (halves.length > 2) {
    return null;
  }

  const left = halves[0] ? halves[0].split(':') : [];
  const right = halves.length === 2 && halves[1]
    ? halves[1].split(':')
    : [];

  const missing = 8 - left.length - right.length;

  if (
    (halves.length === 1 && missing !== 0) ||
    (halves.length === 2 && missing < 1)
  ) {
    return null;
  }

  const groups = [
    ...left,
    ...Array(halves.length === 2 ? missing : 0).fill('0'),
    ...right,
  ];

  if (
    groups.length !== 8 ||
    groups.some(
      (group) =>
        !/^[0-9a-f]{1,4}$/.test(group),
    )
  ) {
    return null;
  }

  return groups.map((group) => Number.parseInt(group, 16));
}

function isBlockedIpv6(address: string): boolean {
  const normalized = address.toLowerCase().split('%')[0];

  if (
    normalized === '::' ||
    normalized === '::1' ||
    normalized.startsWith('fc') ||
    normalized.startsWith('fd') ||
    normalized.startsWith('fe8') ||
    normalized.startsWith('fe9') ||
    normalized.startsWith('fea') ||
    normalized.startsWith('feb')
  ) {
    return true;
  }

  const mappedIpv4 = ipv4FromMappedIpv6(normalized);

  if (mappedIpv4) {
    return isBlockedIpv4(mappedIpv4);
  }

  const words = ipv6Words(normalized);

  if (!words) {
    return true;
  }

  // Reject IPv6 multicast addresses (ff00::/8).
  if ((words[0] & 0xff00) === 0xff00) {
    return true;
  }

  // Reject IPv6 documentation addresses (2001:db8::/32).
  if (words[0] === 0x2001 && words[1] === 0x0db8) {
    return true;
  }

  // Reject Teredo (2001::/32) and 6to4 (2002::/16).
  // These transition mechanisms can encapsulate IPv4 destinations.
  if (
    (words[0] === 0x2001 && words[1] === 0x0000) ||
    words[0] === 0x2002
  ) {
    return true;
  }

  return false;
}

export function isBlockedIpAddress(address: string): boolean {
  const version = isIP(address);

  if (version === 4) {
    return isBlockedIpv4(address);
  }

  if (version === 6) {
    return isBlockedIpv6(address);
  }

  return true;
}

export function parseWebsiteSeoUrl(input: string): URL {
  const value = input.trim();

  if (!value) {
    throw new WebsiteSeoUrlSafetyError('Website URL is required.');
  }

  let url: URL;

  try {
    url = new URL(value);
  } catch {
    throw new WebsiteSeoUrlSafetyError('Enter a valid absolute website URL.');
  }

  if (!ALLOWED_PROTOCOLS.has(url.protocol)) {
    throw new WebsiteSeoUrlSafetyError(
      'Only HTTP and HTTPS website URLs are supported.',
    );
  }

  if (url.username || url.password) {
    throw new WebsiteSeoUrlSafetyError(
      'Website URLs containing credentials are not allowed.',
    );
  }

  if (isBlockedHostname(url.hostname)) {
    throw new WebsiteSeoUrlSafetyError(
      'Local or private network destinations are not allowed.',
    );
  }

  const ipHostname = normalizeIpHostname(url.hostname);

  if (isIP(ipHostname) && isBlockedIpAddress(ipHostname)) {
    throw new WebsiteSeoUrlSafetyError(
      'Local or private network destinations are not allowed.',
    );
  }

  url.hash = '';

  return url;
}

export interface WebsiteSeoResolvedAddress {
  address: string;
  family: 4 | 6;
}

export interface WebsiteSeoResolvedTarget {
  url: URL;
  hostname: string;
  addresses: WebsiteSeoResolvedAddress[];
}

export async function resolveWebsiteSeoTarget(
  input: string | URL,
): Promise<WebsiteSeoResolvedTarget> {
  const url =
    input instanceof URL
      ? parseWebsiteSeoUrl(input.toString())
      : parseWebsiteSeoUrl(input);

  const hostname = normalizeIpHostname(url.hostname);

  if (isIP(hostname)) {
    if (isBlockedIpAddress(hostname)) {
      throw new WebsiteSeoUrlSafetyError(
        'Local or private network destinations are not allowed.',
      );
    }

    return {
      url,
      hostname,
      addresses: [
        {
          address: hostname,
          family: isIP(hostname) as 4 | 6,
        },
      ],
    };
  }

  let resolvedAddresses: Array<{
    address: string;
    family: number;
  }>;

  try {
    resolvedAddresses = await lookup(hostname, {
      all: true,
      verbatim: true,
    });
  } catch {
    throw new WebsiteSeoUrlSafetyError(
      'The website hostname could not be resolved.',
    );
  }

  if (resolvedAddresses.length === 0) {
    throw new WebsiteSeoUrlSafetyError(
      'The website hostname could not be resolved.',
    );
  }

  const addresses: WebsiteSeoResolvedAddress[] = [];

  for (const resolved of resolvedAddresses) {
    if (
      resolved.family !== 4 &&
      resolved.family !== 6
    ) {
      throw new WebsiteSeoUrlSafetyError(
        'The website resolved to an unsupported network address.',
      );
    }

    if (isBlockedIpAddress(resolved.address)) {
      throw new WebsiteSeoUrlSafetyError(
        'Local or private network destinations are not allowed.',
      );
    }

    addresses.push({
      address: resolved.address,
      family: resolved.family,
    });
  }

  return {
    url,
    hostname,
    addresses,
  };
}

export async function assertWebsiteSeoUrlSafe(
  input: string | URL,
): Promise<URL> {
  return (await resolveWebsiteSeoTarget(input)).url;
}
