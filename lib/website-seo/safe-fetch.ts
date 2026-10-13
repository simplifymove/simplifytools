import * as http from 'node:http';
import * as https from 'node:https';
import { isIP } from 'node:net';
import {
  resolveWebsiteSeoTarget,
  type WebsiteSeoResolvedTarget,
} from './url-safety';

const DEFAULT_TIMEOUT_MS = 10_000;
const DEFAULT_MAX_REDIRECTS = 5;
const DEFAULT_MAX_RESPONSE_BYTES = 2 * 1024 * 1024;

const WEBSITE_SEO_USER_AGENT =
  'SimplifyConvertWebsiteSeoChecker/1.0 (+https://www.simplifyconvert.com/)';

const HTML_CONTENT_TYPES = [
  'text/html',
  'application/xhtml+xml',
];

export class WebsiteSeoFetchError extends Error {
  readonly code: string;
  readonly status?: number;

  constructor(
    code: string,
    message: string,
    options?: {
      status?: number;
      cause?: unknown;
    },
  ) {
    super(message, options?.cause ? { cause: options.cause } : undefined);
    this.name = 'WebsiteSeoFetchError';
    this.code = code;
    this.status = options?.status;
  }
}

export interface WebsiteSeoFetchOptions {
  timeoutMs?: number;
  maxRedirects?: number;
  maxResponseBytes?: number;
  requireHtml?: boolean;
  signal?: AbortSignal;
}

export interface WebsiteSeoFetchResult {
  requestedUrl: string;
  finalUrl: string;
  status: number;
  statusText: string;
  headers: Record<string, string>;
  contentType: string;
  body: string;
  byteLength: number;
  redirectChain: string[];
  durationMs: number;
}

function normalizeContentType(value: string | null): string {
  return (value || '')
    .split(';', 1)[0]
    .trim()
    .toLowerCase();
}

function isHtmlContentType(contentType: string): boolean {
  return HTML_CONTENT_TYPES.includes(contentType);
}

function isRedirectStatus(status: number): boolean {
  return [301, 302, 303, 307, 308].includes(status);
}

function parsePositiveInteger(
  value: number | undefined,
  fallback: number,
  minimum: number,
  maximum: number,
): number {
  if (!Number.isFinite(value)) {
    return fallback;
  }

  return Math.min(
    maximum,
    Math.max(minimum, Math.floor(value as number)),
  );
}

interface NativeResponseResult {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  contentType: string;
  body: string;
  byteLength: number;
}

function selectPinnedAddress(
  target: WebsiteSeoResolvedTarget,
): {
  address: string;
  family: 4 | 6;
} {
  const selected = target.addresses[0];

  if (!selected) {
    throw new WebsiteSeoFetchError(
      'DNS_RESOLUTION_FAILED',
      'The website did not resolve to a usable public address.',
    );
  }

  return selected;
}

function nativeRequest(
  target: WebsiteSeoResolvedTarget,
  timeoutMs: number,
  maxResponseBytes: number,
  requireHtml: boolean,
  signal?: AbortSignal,
): Promise<NativeResponseResult> {
  return new Promise((resolve, reject) => {
    const selected = selectPinnedAddress(target);
    const url = target.url;

    const transport =
      url.protocol === 'https:' ? https : http;

    const request = transport.request(
      {
        signal,
        protocol: url.protocol,
        hostname: url.hostname,
        port:
          url.port ||
          (url.protocol === 'https:' ? 443 : 80),
        path: `${url.pathname}${url.search}`,
        method: 'GET',
        headers: {
          host: url.host,
          'user-agent': WEBSITE_SEO_USER_AGENT,
          accept:
            'text/html,application/xhtml+xml;q=0.9,*/*;q=0.1',
          'accept-encoding': 'identity',
          connection: 'close',
        },

        // Critical SSRF control:
        // the socket must use the public address that was
        // already resolved and validated above.
        lookup: (_hostname, options, callback) => {
          const lookupOptions =
            typeof options === 'object' && options !== null
              ? options
              : {};

          if ('all' in lookupOptions && lookupOptions.all) {
            callback(
              null,
              [
                {
                  address: selected.address,
                  family: selected.family,
                },
              ],
            );

            return;
          }

          callback(
            null,
            selected.address,
            selected.family,
          );
        },

        ...(url.protocol === 'https:' &&
        !isIP(target.hostname)
          ? {
              servername: target.hostname,
            }
          : {}),
      },
      (response) => {
        const status = response.statusCode ?? 0;
        const statusText = response.statusMessage ?? '';

        const headers: Record<string, string> = {};

        for (
          const [name, value]
          of Object.entries(response.headers)
        ) {
          if (Array.isArray(value)) {
            headers[name.toLowerCase()] =
              value.join(', ');
          } else if (typeof value === 'string') {
            headers[name.toLowerCase()] = value;
          } else if (typeof value === 'number') {
            headers[name.toLowerCase()] =
              String(value);
          }
        }

        const contentType = normalizeContentType(
          headers['content-type'] ?? null,
        );

        if (
          requireHtml &&
          contentType &&
          !isHtmlContentType(contentType)
        ) {
          response.resume();

          reject(
            new WebsiteSeoFetchError(
              'UNSUPPORTED_CONTENT_TYPE',
              `Expected an HTML page but received ${contentType}.`,
              { status },
            ),
          );

          return;
        }

        const declaredLength = Number(
          headers['content-length'] || '',
        );

        if (
          Number.isFinite(declaredLength) &&
          declaredLength > maxResponseBytes
        ) {
          response.destroy();

          reject(
            new WebsiteSeoFetchError(
              'RESPONSE_TOO_LARGE',
              `Website response exceeds the ${maxResponseBytes} byte limit.`,
              { status },
            ),
          );

          return;
        }

        const chunks: Buffer[] = [];
        let totalBytes = 0;
        let finished = false;

        const fail = (
          error: WebsiteSeoFetchError,
        ) => {
          if (finished) {
            return;
          }

          finished = true;
          response.destroy();
          reject(error);
        };

        response.on('data', (chunk: Buffer) => {
          if (finished) {
            return;
          }

          totalBytes += chunk.length;

          if (totalBytes > maxResponseBytes) {
            fail(
              new WebsiteSeoFetchError(
                'RESPONSE_TOO_LARGE',
                `Website response exceeds the ${maxResponseBytes} byte limit.`,
                { status },
              ),
            );

            return;
          }

          chunks.push(chunk);
        });

        response.on('end', () => {
          if (finished) {
            return;
          }

          finished = true;

          resolve({
            status,
            statusText,
            headers,
            contentType,
            body: Buffer.concat(chunks).toString(
              'utf8',
            ),
            byteLength: totalBytes,
          });
        });

        response.on('error', (error) => {
          if (finished) {
            return;
          }

          finished = true;

          reject(
            new WebsiteSeoFetchError(
              'NETWORK_ERROR',
              'The website response failed.',
              {
                status,
                cause: error,
              },
            ),
          );
        });
      },
    );

    request.setTimeout(timeoutMs, () => {
      request.destroy(
        new WebsiteSeoFetchError(
          'REQUEST_TIMEOUT',
          `Website request exceeded the ${timeoutMs}ms timeout.`,
        ),
      );
    });

    request.on('error', (error) => {
      if (signal?.aborted) {
        reject(
          new WebsiteSeoFetchError(
            'AUDIT_ABORTED',
            'The website audit was cancelled.',
            { cause: error },
          ),
        );
        return;
      }

      if (error instanceof WebsiteSeoFetchError) {
        reject(error);
        return;
      }

      reject(
        new WebsiteSeoFetchError(
          'NETWORK_ERROR',
          'The website could not be fetched.',
          { cause: error },
        ),
      );
    });

    request.end();
  });
}

export async function safeWebsiteSeoFetch(
  input: string | URL,
  options: WebsiteSeoFetchOptions = {},
): Promise<WebsiteSeoFetchResult> {
  const timeoutMs = parsePositiveInteger(
    options.timeoutMs,
    DEFAULT_TIMEOUT_MS,
    1_000,
    30_000,
  );

  const maxRedirects = parsePositiveInteger(
    options.maxRedirects,
    DEFAULT_MAX_REDIRECTS,
    0,
    10,
  );

  const maxResponseBytes = parsePositiveInteger(
    options.maxResponseBytes,
    DEFAULT_MAX_RESPONSE_BYTES,
    64 * 1024,
    10 * 1024 * 1024,
  );

  const requireHtml = options.requireHtml ?? true;

  const throwIfAborted = () => {
    if (options.signal?.aborted) {
      throw new WebsiteSeoFetchError(
        'AUDIT_ABORTED',
        'The website audit was cancelled.',
      );
    }
  };

  throwIfAborted();

  const requestedTarget =
    await resolveWebsiteSeoTarget(input);

  throwIfAborted();

  let currentTarget = requestedTarget;
  const redirectChain: string[] = [];
  const startedAt = Date.now();

  for (
    let redirectCount = 0;
    ;
    redirectCount += 1
  ) {
    throwIfAborted();

    // Resolve + validate immediately before each
    // connection, including every redirect target.
    currentTarget =
      await resolveWebsiteSeoTarget(
        currentTarget.url,
      );

    throwIfAborted();

    const response = await nativeRequest(
      currentTarget,
      timeoutMs,
      maxResponseBytes,
      requireHtml,
      options.signal,
    );

    if (isRedirectStatus(response.status)) {
      if (redirectCount >= maxRedirects) {
        throw new WebsiteSeoFetchError(
          'TOO_MANY_REDIRECTS',
          `Website exceeded the ${maxRedirects} redirect limit.`,
          { status: response.status },
        );
      }

      const location =
        response.headers.location;

      if (!location) {
        throw new WebsiteSeoFetchError(
          'INVALID_REDIRECT',
          'Website returned a redirect without a Location header.',
          { status: response.status },
        );
      }

      let nextUrl: URL;

      try {
        nextUrl = new URL(
          location,
          currentTarget.url,
        );
      } catch {
        throw new WebsiteSeoFetchError(
          'INVALID_REDIRECT',
          'Website returned an invalid redirect URL.',
          { status: response.status },
        );
      }

      const nextTarget =
        await resolveWebsiteSeoTarget(nextUrl);

      throwIfAborted();

      redirectChain.push(
        nextTarget.url.toString(),
      );

      currentTarget = nextTarget;
      continue;
    }

    throwIfAborted();

    return {
      requestedUrl:
        requestedTarget.url.toString(),
      finalUrl:
        currentTarget.url.toString(),
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
      contentType: response.contentType,
      body: response.body,
      byteLength: response.byteLength,
      redirectChain,
      durationMs: Date.now() - startedAt,
    };
  }
}