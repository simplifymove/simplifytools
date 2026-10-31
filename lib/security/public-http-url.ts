import { promises as dns } from 'node:dns';
import { isIP } from 'node:net';

export type ResolvedAddress = {
  address: string;
  family: number;
};

export type PublicHttpUrlResolver = (
  hostname: string,
) => Promise<ResolvedAddress[]>;

export class PublicHttpUrlError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PublicHttpUrlError';
  }
}

const defaultResolver: PublicHttpUrlResolver = async (hostname) =>
  dns.lookup(hostname, { all: true, verbatim: true });

function ipv4ToInteger(address: string): number | null {
  const parts = address.split('.');
  if (parts.length !== 4) return null;

  const octets = parts.map((part) => Number(part));
  if (octets.some((octet) => !Number.isInteger(octet) || octet < 0 || octet > 255)) {
    return null;
  }

  return octets.reduce((value, octet) => ((value << 8) | octet) >>> 0, 0);
}

function ipv4InCidr(address: number, base: string, prefix: number): boolean {
  const baseAddress = ipv4ToInteger(base);
  if (baseAddress === null) return false;
  const mask = prefix === 0 ? 0 : (0xffffffff << (32 - prefix)) >>> 0;
  return (address & mask) === (baseAddress & mask);
}

function parseIpv6(address: string): bigint | null {
  const normalized = address.toLowerCase().split('%', 1)[0];
  if (!normalized || !normalized.includes(':')) return null;

  const ipv4Index = normalized.lastIndexOf(':');
  let expanded = normalized;
  const possibleIpv4 = normalized.slice(ipv4Index + 1);
  if (possibleIpv4.includes('.')) {
    const ipv4 = ipv4ToInteger(possibleIpv4);
    if (ipv4 === null) return null;
    const high = ((ipv4 >>> 16) & 0xffff).toString(16);
    const low = (ipv4 & 0xffff).toString(16);
    expanded = `${normalized.slice(0, ipv4Index)}:${high}:${low}`;
  }

  const doubleColonParts = expanded.split('::');
  if (doubleColonParts.length > 2) return null;

  const left = doubleColonParts[0] ? doubleColonParts[0].split(':') : [];
  const right = doubleColonParts.length === 2 && doubleColonParts[1]
    ? doubleColonParts[1].split(':')
    : [];
  const missing = 8 - left.length - right.length;
  if (
    missing < 0
    || (doubleColonParts.length === 1 && missing !== 0)
    || (doubleColonParts.length === 2 && missing < 1)
  ) {
    return null;
  }

  const groups = [
    ...left,
    ...Array.from({ length: missing }, () => '0'),
    ...right,
  ];
  if (groups.length !== 8 || groups.some((group) => !/^[0-9a-f]{1,4}$/.test(group))) {
    return null;
  }

  return groups.reduce(
    (value, group) => (value << BigInt(16)) | BigInt(`0x${group}`),
    BigInt(0),
  );
}

function ipv6InCidr(address: bigint, base: bigint, prefix: number): boolean {
  if (prefix === 0) return true;
  const shift = BigInt(128 - prefix);
  return (address >> shift) === (base >> shift);
}

function isPublicIpv4(address: string): boolean {
  const value = ipv4ToInteger(address);
  if (value === null) return false;

  const nonPublicRanges: Array<[string, number]> = [
    ['0.0.0.0', 8],       // Unspecified/current network
    ['10.0.0.0', 8],      // Private
    ['100.64.0.0', 10],   // Shared address space
    ['127.0.0.0', 8],     // Loopback
    ['169.254.0.0', 16],  // Link-local
    ['172.16.0.0', 12],   // Private
    ['192.0.0.0', 24],    // IETF protocol assignments
    ['192.0.2.0', 24],    // Documentation
    ['192.88.99.0', 24],  // Reserved/deprecated relay
    ['192.168.0.0', 16],  // Private
    ['198.18.0.0', 15],   // Benchmarking
    ['198.51.100.0', 24], // Documentation
    ['203.0.113.0', 24],  // Documentation
    ['224.0.0.0', 4],     // Multicast
    ['240.0.0.0', 4],     // Reserved/broadcast
  ];

  return !nonPublicRanges.some(([base, prefix]) => ipv4InCidr(value, base, prefix));
}

function isPublicIpv6(address: string): boolean {
  const value = parseIpv6(address);
  if (value === null) return false;

  const mappedIpv4Prefix = BigInt(0xffff);
  if ((value >> BigInt(32)) === mappedIpv4Prefix) {
    const mapped = Number(value & BigInt(0xffffffff));
    return isPublicIpv4([
      (mapped >>> 24) & 0xff,
      (mapped >>> 16) & 0xff,
      (mapped >>> 8) & 0xff,
      mapped & 0xff,
    ].join('.'));
  }

  const globalUnicastBase = BigInt('0x20000000000000000000000000000000');
  if (!ipv6InCidr(value, globalUnicastBase, 3)) {
    return false;
  }

  const nonPublicRanges: Array<[bigint, number]> = [
    [BigInt(0), 128],                                      // Unspecified
    [BigInt(1), 128],                                      // Loopback
    [BigInt('0x64ff9b00010000000000000000000000'), 48],   // Local-use translation
    [BigInt('0x01000000000000000000000000000000'), 64],   // Discard-only
    [BigInt('0x20010000000000000000000000000000'), 23],   // IETF special-purpose
    [BigInt('0x20010db8000000000000000000000000'), 32],   // Documentation
    [BigInt('0xfc000000000000000000000000000000'), 7],    // Unique local
    [BigInt('0xfe800000000000000000000000000000'), 10],   // Link-local
    [BigInt('0xfec00000000000000000000000000000'), 10],   // Deprecated site-local
    [BigInt('0xff000000000000000000000000000000'), 8],    // Multicast
  ];

  return !nonPublicRanges.some(([base, prefix]) => ipv6InCidr(value, base, prefix));
}

export function isPublicIpAddress(address: string): boolean {
  const normalized = address.startsWith('[') && address.endsWith(']')
    ? address.slice(1, -1)
    : address;
  const family = isIP(normalized);
  if (family === 4) return isPublicIpv4(normalized);
  if (family === 6) return isPublicIpv6(normalized);
  return false;
}

export async function validatePublicHttpUrl(
  rawUrl: string,
  resolver: PublicHttpUrlResolver = defaultResolver,
): Promise<URL> {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    throw new PublicHttpUrlError('Invalid URL.');
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new PublicHttpUrlError('Only HTTP and HTTPS URLs are allowed.');
  }
  if (parsed.username || parsed.password) {
    throw new PublicHttpUrlError('URLs containing embedded credentials are not allowed.');
  }

  const hostname = parsed.hostname.replace(/^\[|\]$/g, '').replace(/\.$/, '').toLowerCase();
  if (!hostname || hostname === 'localhost' || hostname.endsWith('.localhost')) {
    throw new PublicHttpUrlError('Localhost destinations are not allowed.');
  }
  if (hostname.includes('%')) {
    throw new PublicHttpUrlError('Scoped IP addresses are not allowed.');
  }

  if (isIP(hostname)) {
    if (!isPublicIpAddress(hostname)) {
      throw new PublicHttpUrlError('The URL resolves to a non-public network address.');
    }
    return parsed;
  }

  let addresses: ResolvedAddress[];
  try {
    addresses = await resolver(hostname);
  } catch {
    throw new PublicHttpUrlError('The URL hostname could not be resolved.');
  }

  if (addresses.length === 0) {
    throw new PublicHttpUrlError('The URL hostname did not resolve to an address.');
  }
  if (addresses.some(({ address }) => !isPublicIpAddress(address))) {
    throw new PublicHttpUrlError('The URL resolves to a non-public network address.');
  }

  return parsed;
}
