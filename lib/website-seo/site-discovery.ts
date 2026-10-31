import {
  safeWebsiteSeoFetch,
  WebsiteSeoFetchError,
  type WebsiteSeoFetchOptions,
} from './safe-fetch';

import {
  parseWebsiteSeoRobotsTxt,
  type WebsiteSeoRobotsParseResult,
} from './robots-parser';

import {
  parseWebsiteSeoSitemapXml,
  type WebsiteSeoSitemapParseResult,
} from './sitemap-parser';

const DEFAULT_MAX_SITEMAPS = 25;
const HARD_MAX_SITEMAPS = 100;

export interface WebsiteSeoDiscoveryOptions {
  fetchOptions?: WebsiteSeoFetchOptions;
  maxSitemaps?: number;
}

export interface WebsiteSeoRobotsDiscovery {
  requestedUrl: string;
  finalUrl: string | null;
  status: number | null;
  found: boolean;
  document: WebsiteSeoRobotsParseResult | null;
  error: string | null;
}

export interface WebsiteSeoSitemapFetchResult {
  requestedUrl: string;
  finalUrl: string | null;
  status: number | null;
  found: boolean;
  document: WebsiteSeoSitemapParseResult | null;
  error: string | null;
}

export interface WebsiteSeoSiteDiscoveryResult {
  origin: string;
  robots: WebsiteSeoRobotsDiscovery;

  sitemapSources: string[];
  sitemaps: WebsiteSeoSitemapFetchResult[];

  discoveredPageUrls: string[];
  discoveredSitemapUrls: string[];

  maxSitemaps: number;
  truncated: boolean;
}

type Fetcher = typeof safeWebsiteSeoFetch;

function normalizeOrigin(input: string): string {
  const url = new URL(input);

  if (
    url.protocol !== 'http:' &&
    url.protocol !== 'https:'
  ) {
    throw new Error(
      'Website SEO discovery requires an HTTP or HTTPS URL.',
    );
  }

  url.username = '';
  url.password = '';
  url.pathname = '/';
  url.search = '';
  url.hash = '';

  return url.origin;
}

function normalizeHttpUrl(
  value: string,
  baseUrl: string,
): string | null {
  try {
    const url = new URL(value, baseUrl);

    if (
      url.protocol !== 'http:' &&
      url.protocol !== 'https:'
    ) {
      return null;
    }

    url.hash = '';

    return url.toString();
  } catch {
    return null;
  }
}

function normalizeMaxSitemaps(
  value: number | undefined,
): number {
  if (
    value === undefined ||
    !Number.isFinite(value)
  ) {
    return DEFAULT_MAX_SITEMAPS;
  }

  return Math.min(
    HARD_MAX_SITEMAPS,
    Math.max(1, Math.floor(value)),
  );
}

function buildNonHtmlFetchOptions(
  options: WebsiteSeoFetchOptions | undefined,
): WebsiteSeoFetchOptions {
  return {
    ...options,
    requireHtml: false,
  };
}

export async function fetchWebsiteSeoRobots(
  input: string,
  options: WebsiteSeoFetchOptions = {},
  fetcher: Fetcher = safeWebsiteSeoFetch,
): Promise<WebsiteSeoRobotsDiscovery> {
  const origin = normalizeOrigin(input);
  const requestedUrl = `${origin}/robots.txt`;

  try {
    const fetched = await fetcher(
      requestedUrl,
      buildNonHtmlFetchOptions(options),
    );

    /*
     * A successful HTTP response can still mean robots.txt does
     * not exist. Treat 404/410 as an absent robots file rather
     * than a parser or crawler failure.
     */
    if (
      fetched.status === 404 ||
      fetched.status === 410
    ) {
      return {
        requestedUrl,
        finalUrl: fetched.finalUrl,
        status: fetched.status,
        found: false,
        document: null,
        error: null,
      };
    }

    if (
      fetched.status < 200 ||
      fetched.status >= 300
    ) {
      return {
        requestedUrl,
        finalUrl: fetched.finalUrl,
        status: fetched.status,
        found: false,
        document: null,
        error:
          `robots.txt returned HTTP ${fetched.status}.`,
      };
    }

    return {
      requestedUrl,
      finalUrl: fetched.finalUrl,
      status: fetched.status,
      found: true,
      document: parseWebsiteSeoRobotsTxt(
        fetched.body,
        fetched.finalUrl,
      ),
      error: null,
    };
  } catch (error) {
    if (
      error instanceof WebsiteSeoFetchError &&
      error.code === 'AUDIT_ABORTED'
    ) {
      throw error;
    }

    return {
      requestedUrl,
      finalUrl: null,
      status: null,
      found: false,
      document: null,
      error:
        error instanceof Error
          ? error.message
          : 'robots.txt could not be fetched.',
    };
  }
}

export async function fetchWebsiteSeoSitemap(
  input: string,
  options: WebsiteSeoFetchOptions = {},
  fetcher: Fetcher = safeWebsiteSeoFetch,
): Promise<WebsiteSeoSitemapFetchResult> {
  const requestedUrl = normalizeHttpUrl(
    input,
    input,
  );

  if (!requestedUrl) {
    return {
      requestedUrl: input,
      finalUrl: null,
      status: null,
      found: false,
      document: null,
      error: 'Invalid sitemap URL.',
    };
  }

  try {
    const fetched = await fetcher(
      requestedUrl,
      buildNonHtmlFetchOptions(options),
    );

    if (
      fetched.status === 404 ||
      fetched.status === 410
    ) {
      return {
        requestedUrl,
        finalUrl: fetched.finalUrl,
        status: fetched.status,
        found: false,
        document: null,
        error: null,
      };
    }

    if (
      fetched.status < 200 ||
      fetched.status >= 300
    ) {
      return {
        requestedUrl,
        finalUrl: fetched.finalUrl,
        status: fetched.status,
        found: false,
        document: null,
        error:
          `Sitemap returned HTTP ${fetched.status}.`,
      };
    }

    return {
      requestedUrl,
      finalUrl: fetched.finalUrl,
      status: fetched.status,
      found: true,
      document: parseWebsiteSeoSitemapXml(
        fetched.body,
        fetched.finalUrl,
      ),
      error: null,
    };
  } catch (error) {
    if (
      error instanceof WebsiteSeoFetchError &&
      error.code === 'AUDIT_ABORTED'
    ) {
      throw error;
    }

    return {
      requestedUrl,
      finalUrl: null,
      status: null,
      found: false,
      document: null,
      error:
        error instanceof Error
          ? error.message
          : 'Sitemap could not be fetched.',
    };
  }
}

export async function discoverWebsiteSeoSite(
  input: string,
  options: WebsiteSeoDiscoveryOptions = {},
  fetcher: Fetcher = safeWebsiteSeoFetch,
): Promise<WebsiteSeoSiteDiscoveryResult> {
  const origin = normalizeOrigin(input);
  const maxSitemaps = normalizeMaxSitemaps(
    options.maxSitemaps,
  );

  const throwIfAborted = () => {
    if (options.fetchOptions?.signal?.aborted) {
      throw new WebsiteSeoFetchError(
        'AUDIT_ABORTED',
        'The website audit was cancelled.',
      );
    }
  };

  throwIfAborted();

  /*
   * Discovery is intentionally sequential.
   * This avoids burst traffic and keeps the first implementation
   * deterministic and easy to bound.
   */
  const robots = await fetchWebsiteSeoRobots(
    origin,
    options.fetchOptions,
    fetcher,
  );

  throwIfAborted();

  const sitemapSources: string[] = [];
  const queued = new Set<string>();
  const processed = new Set<string>();

  function enqueueSitemap(
    value: string,
    baseUrl: string,
  ): void {
    const normalized = normalizeHttpUrl(
      value,
      baseUrl,
    );

    if (
      !normalized ||
      queued.has(normalized)
    ) {
      return;
    }

    queued.add(normalized);
    sitemapSources.push(normalized);
  }

  if (
    robots.found &&
    robots.document
  ) {
    for (
      const sitemap of
      robots.document.sitemaps
    ) {
      enqueueSitemap(
        sitemap,
        robots.finalUrl ??
          `${origin}/robots.txt`,
      );
    }
  }

  /*
   * sitemap.xml is a conventional fallback when robots.txt does
   * not advertise any sitemap.
   */
  if (sitemapSources.length === 0) {
    enqueueSitemap(
      `${origin}/sitemap.xml`,
      origin,
    );
  }

  const queue = [...sitemapSources];

  const sitemaps: WebsiteSeoSitemapFetchResult[] =
    [];

  const pageUrls = new Set<string>();
  const sitemapUrls = new Set<string>(
    sitemapSources,
  );

  while (
    queue.length > 0 &&
    processed.size < maxSitemaps
  ) {
    throwIfAborted();

    const sitemapUrl = queue.shift();

    if (
      !sitemapUrl ||
      processed.has(sitemapUrl)
    ) {
      continue;
    }

    processed.add(sitemapUrl);

    const result =
      await fetchWebsiteSeoSitemap(
        sitemapUrl,
        options.fetchOptions,
        fetcher,
      );

    throwIfAborted();

    sitemaps.push(result);

    if (
      !result.found ||
      !result.document
    ) {
      continue;
    }

    for (
      const entry of
      result.document.urls
    ) {
      const normalized =
        normalizeHttpUrl(
          entry.loc,
          result.finalUrl ??
            sitemapUrl,
        );

      if (normalized) {
        pageUrls.add(normalized);
      }
    }

    for (
      const entry of
      result.document.sitemaps
    ) {
      const normalized =
        normalizeHttpUrl(
          entry.loc,
          result.finalUrl ??
            sitemapUrl,
        );

      if (
        !normalized ||
        sitemapUrls.has(normalized)
      ) {
        continue;
      }

      sitemapUrls.add(normalized);
      queue.push(normalized);
    }
  }

  throwIfAborted();

  return {
    origin,
    robots,

    sitemapSources: [...sitemapSources],
    sitemaps,

    discoveredPageUrls: [
      ...pageUrls,
    ].sort(),

    discoveredSitemapUrls: [
      ...sitemapUrls,
    ].sort(),

    maxSitemaps,
    truncated: queue.length > 0,
  };
}