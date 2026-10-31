import { NextResponse } from 'next/server';

import { runWebsiteSeoAudit } from '@/lib/website-seo/orchestrator';
import { checkRateLimit } from '@/lib/security/rate-limit';
import { WebsiteSeoFetchError } from '@/lib/website-seo/safe-fetch';
import { WebsiteSeoUrlSafetyError } from '@/lib/website-seo/url-safety';




interface WebsiteSeoAuditRequest {
  url?: unknown;
  maxPages?: unknown;
}

export interface WebsiteSeoAuditRouteDependencies {
  runAudit?: typeof runWebsiteSeoAudit;
  rateLimit?: typeof checkRateLimit;
  /** Test injection only; production POST uses the default deadline. */
  timeoutMs?: number;
}

/*
 * Keep the first synchronous API deliberately conservative.
 *
 * The crawler itself owns the authoritative crawl bounds. This API-level
 * bound limits the amount of work a single HTTP request may request while
 * the Website SEO Checker remains synchronous.
 */
const DEFAULT_API_MAX_PAGES = 25;
const MAX_API_MAX_PAGES = 50;

/*
 * Website crawling is substantially more expensive than a normal
 * lightweight API request, so keep a dedicated conservative limit.
 *
 * This is intentionally separate from AI_RATE_LIMIT_PER_MINUTE.
 */
const WEBSITE_SEO_RATE_LIMIT = 5;
const WEBSITE_SEO_RATE_LIMIT_WINDOW_SECONDS = 60;
const WEBSITE_SEO_AUDIT_TIMEOUT_MS = 60_000;

function normalizeUrl(value: unknown): string | null {
  if (typeof value !== 'string') {
    return null;
  }

  const normalized = value.trim();

  return normalized.length > 0
    ? normalized
    : null;
}

function normalizeMaxPages(
  value: unknown,
): number | null {
  if (value === undefined) {
    return DEFAULT_API_MAX_PAGES;
  }

  if (
    typeof value !== 'number' ||
    !Number.isInteger(value) ||
    value < 1 ||
    value > MAX_API_MAX_PAGES
  ) {
    return null;
  }

  return value;
}

function getClientIdentifier(
  request: Request,
): string {
  const forwarded =
    request.headers.get('x-forwarded-for');

  const forwardedIp =
    forwarded
      ?.split(',')[0]
      ?.trim();

  const realIp =
    request.headers
      .get('x-real-ip')
      ?.trim();

  return (
    forwardedIp ||
    realIp ||
    'unknown'
  );
}

interface WebsiteSeoApiError {
  status: number;
  error: string;
  errorCode: string;
}

function mapAuditError(
  error: unknown,
): WebsiteSeoApiError {
  if (error instanceof WebsiteSeoUrlSafetyError) {
    return {
      status: 400,
      error:
        'This URL cannot be audited.',
      errorCode:
        'URL_NOT_ALLOWED',
    };
  }

  if (error instanceof WebsiteSeoFetchError) {
    switch (error.code) {
      case 'AUDIT_ABORTED':
        return {
          status: 504,
          error:
            'The website audit exceeded the time limit. Please try again with fewer pages.',
          errorCode:
            'AUDIT_TIMEOUT',
        };

      case 'REQUEST_TIMEOUT':
        return {
          status: 504,
          error:
            'The website took too long to respond.',
          errorCode:
            'WEBSITE_TIMEOUT',
        };

      case 'DNS_RESOLUTION_FAILED':
      case 'NETWORK_ERROR':
        return {
          status: 502,
          error:
            'The website could not be reached.',
          errorCode:
            'WEBSITE_UNREACHABLE',
        };

      case 'UNSUPPORTED_CONTENT_TYPE':
        return {
          status: 400,
          error:
            'The requested URL did not return a supported HTML page.',
          errorCode:
            'UNSUPPORTED_WEBSITE_CONTENT',
        };

      case 'RESPONSE_TOO_LARGE':
        return {
          status: 400,
          error:
            'The website response is too large to audit safely.',
          errorCode:
            'WEBSITE_RESPONSE_TOO_LARGE',
        };

      case 'TOO_MANY_REDIRECTS':
      case 'INVALID_REDIRECT':
        return {
          status: 400,
          error:
            'The website redirect chain could not be audited safely.',
          errorCode:
            'INVALID_WEBSITE_REDIRECT',
        };

      default:
        return {
          status: 502,
          error:
            'The website could not be audited.',
          errorCode:
            'WEBSITE_FETCH_FAILED',
        };
    }
  }

  return {
    status: 500,
    error:
      'Unable to audit this website.',
    errorCode:
      'AUDIT_FAILED',
  };
}
export async function handleWebsiteSeoAuditRequest(
  request: Request,
  dependencies: WebsiteSeoAuditRouteDependencies = {},
) {
  const runAudit =
    dependencies.runAudit ??
    runWebsiteSeoAudit;

  const applyRateLimit =
    dependencies.rateLimit ??
    checkRateLimit;

  try {
    const clientIdentifier =
      getClientIdentifier(request);

    const rateLimit =
      applyRateLimit(
        `website-seo:${clientIdentifier}`,
        WEBSITE_SEO_RATE_LIMIT,
        WEBSITE_SEO_RATE_LIMIT_WINDOW_SECONDS,
      );

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error:
            'Too many website audits. Please try again shortly.',
          errorCode:
            'RATE_LIMITED',
          retryAfterSeconds:
            rateLimit.resetIn,
        },
        {
          status: 429,
          headers: {
            'Retry-After':
              String(rateLimit.resetIn),
          },
        },
      );
    }

    const body =
      (await request.json().catch(() => null)) as
        | WebsiteSeoAuditRequest
        | null;

    if (
      !body ||
      typeof body !== 'object' ||
      Array.isArray(body)
    ) {
      return NextResponse.json(
        {
          error: 'Invalid JSON request body.',
          errorCode: 'INVALID_REQUEST',
        },
        { status: 400 },
      );
    }

    const url = normalizeUrl(body.url);

    if (!url) {
      return NextResponse.json(
        {
          error: 'URL is required.',
          errorCode: 'URL_REQUIRED',
        },
        { status: 400 },
      );
    }

    const maxPages =
      normalizeMaxPages(body.maxPages);

    if (maxPages === null) {
      return NextResponse.json(
        {
          error:
            `maxPages must be an integer between 1 and ${MAX_API_MAX_PAGES}.`,
          errorCode: 'INVALID_MAX_PAGES',
        },
        { status: 400 },
      );
    }

    const controller = new AbortController();

    const timeoutMs =
      Number.isFinite(dependencies.timeoutMs) &&
      (dependencies.timeoutMs ?? 0) > 0
        ? dependencies.timeoutMs!
        : WEBSITE_SEO_AUDIT_TIMEOUT_MS;

    const timeout = setTimeout(() => {
      controller.abort();
    }, timeoutMs);

    let result: Awaited<ReturnType<typeof runAudit>>;

    try {
      result = await runAudit(
        url,
        {
          signal: controller.signal,
          crawler: {
            maxPages,
          },
        },
      );

      if (controller.signal.aborted) {
        throw new WebsiteSeoFetchError(
          'AUDIT_ABORTED',
          'The website audit was cancelled.',
        );
      }
    } finally {
      clearTimeout(timeout);
    }

    return NextResponse.json(
      {
        success: true,
        result,
      },
      { status: 200 },
    );
  } catch (error) {
    const mapped =
      mapAuditError(error);

    /*
     * Keep server logs diagnostic without serializing arbitrary
     * exception messages, URL-safety details, or stack traces.
     */
    console.error(
      '[website-seo-audit] Audit failed',
      {
        errorCode: mapped.errorCode,
        status: mapped.status,
      },
    );

    return NextResponse.json(
      {
        error: mapped.error,
        errorCode: mapped.errorCode,
      },
      { status: mapped.status },
    );
  }
}
