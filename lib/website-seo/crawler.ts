import { setTimeout as sleep } from 'node:timers/promises';

import {
  evaluateWebsiteSeoRobotsAccess,
  type WebsiteSeoRobotsParseResult,
} from './robots-parser';
import {
  safeWebsiteSeoFetch,
  WebsiteSeoFetchError,
  type WebsiteSeoFetchOptions,
  type WebsiteSeoFetchResult,
} from './safe-fetch';
import {
  extractWebsiteSeoHtml,
  type WebsiteSeoHtmlExtraction,
} from './html-extractor';
import {
  analyzeWebsiteSeoIssues,
  type WebsiteSeoIssueAnalysis,
} from './issue-engine';
import { parseWebsiteSeoUrl } from './url-safety';

const DEFAULT_MAX_PAGES = 100;
const MAX_ALLOWED_PAGES = 500;

const TRACKING_QUERY_PARAMETERS = new Set([
  'fbclid',
  'gclid',
  'dclid',
  'msclkid',
  'mc_cid',
  'mc_eid',
]);

const NON_HTML_EXTENSIONS = new Set([
  '.7z',
  '.aac',
  '.avi',
  '.avif',
  '.bmp',
  '.css',
  '.csv',
  '.doc',
  '.docx',
  '.eot',
  '.epub',
  '.exe',
  '.flac',
  '.gif',
  '.gz',
  '.ico',
  '.jpeg',
  '.jpg',
  '.js',
  '.json',
  '.m4a',
  '.m4v',
  '.mov',
  '.mp3',
  '.mp4',
  '.mpeg',
  '.mpg',
  '.ogg',
  '.ogv',
  '.otf',
  '.pdf',
  '.png',
  '.ppt',
  '.pptx',
  '.rar',
  '.rss',
  '.svg',
  '.tar',
  '.tgz',
  '.tif',
  '.tiff',
  '.ttf',
  '.txt',
  '.wav',
  '.webm',
  '.webp',
  '.woff',
  '.woff2',
  '.xls',
  '.xlsx',
  '.xml',
  '.zip',
]);

export interface WebsiteSeoCrawlerOptions {
  /**
   * Optional parsed robots.txt policy.
   * When supplied, disallowed page URLs are skipped before fetch.
   */
  robots?: WebsiteSeoRobotsParseResult | null;

  /**
   * User-agent token used when evaluating robots.txt.
   */
  robotsUserAgent?: string;

  /**
   * Additional page URLs admitted to the initial crawl queue.
   *
   * Seeds are normalized, restricted to the same site, filtered through
   * the normal crawlable-page policy, and deduplicated against the
   * entered start URL and one another.
   */
  seedUrls?: Array<string | URL>;

  maxPages?: number;
  fetchOptions?: WebsiteSeoFetchOptions;
}

export interface WebsiteSeoCrawlQueueItem {
  url: string;
  depth: number;
  discoveredFrom: string | null;
}

export interface WebsiteSeoCrawlPage {
  requestedUrl: string;
  finalUrl: string;
  depth: number;
  discoveredFrom: string | null;

  status: number;
  statusText: string;
  contentType: string;
  byteLength: number;
  durationMs: number;
  redirectChain: string[];

  extraction: WebsiteSeoHtmlExtraction;
  analysis: WebsiteSeoIssueAnalysis;
}

export interface WebsiteSeoCrawlFailure {
  url: string;
  depth: number;
  discoveredFrom: string | null;
  code: string;
  message: string;
  status: number | null;
}

export interface WebsiteSeoCrawlResult {
  startUrl: string;
  siteOrigin: string;

  pages: WebsiteSeoCrawlPage[];
  failures: WebsiteSeoCrawlFailure[];

  discoveredUrls: number;
  crawledUrls: number;
  failedUrls: number;
  maxPages: number;
  truncated: boolean;
  durationMs: number;
}

export type WebsiteSeoCrawlerFetch = (
  input: string | URL,
  options?: WebsiteSeoFetchOptions,
) => Promise<WebsiteSeoFetchResult>;

export type WebsiteSeoCrawlerDelay = (
  milliseconds: number,
) => Promise<void>;

export interface WebsiteSeoCrawlerDependencies {
  fetchPage?: WebsiteSeoCrawlerFetch;
  delay?: WebsiteSeoCrawlerDelay;
}

function parseMaxPages(value: number | undefined): number {
  if (!Number.isFinite(value)) {
    return DEFAULT_MAX_PAGES;
  }

  return Math.min(
    MAX_ALLOWED_PAGES,
    Math.max(1, Math.floor(value as number)),
  );
}

function normalizeCrawlUrl(input: string | URL): string {
  const url =
    input instanceof URL
      ? new URL(input.toString())
      : new URL(input);

  url.hash = '';

  if (
    (url.protocol === 'https:' && url.port === '443') ||
    (url.protocol === 'http:' && url.port === '80')
  ) {
    url.port = '';
  }

  const normalizedParameters = Array.from(
    url.searchParams.entries(),
  )
    .filter(([key]) => {
      const normalizedKey = key.toLowerCase();

      return (
        !normalizedKey.startsWith('utm_') &&
        !TRACKING_QUERY_PARAMETERS.has(normalizedKey)
      );
    })
    .sort(([keyA, valueA], [keyB, valueB]) => {
      const keyComparison = keyA.localeCompare(keyB);

      if (keyComparison !== 0) {
        return keyComparison;
      }

      return valueA.localeCompare(valueB);
    });

  url.search = '';

  for (const [key, value] of normalizedParameters) {
    url.searchParams.append(key, value);
  }

  return url.toString();
}

function getPathExtension(pathname: string): string {
  const finalSegment =
    pathname.split('/').pop()?.toLowerCase() || '';

  const lastDot = finalSegment.lastIndexOf('.');

  if (
    lastDot <= 0 ||
    lastDot === finalSegment.length - 1
  ) {
    return '';
  }

  return finalSegment.slice(lastDot);
}

function isCrawlablePageUrl(
  input: string | URL,
): boolean {
  let url: URL;

  try {
    url =
      input instanceof URL
        ? new URL(input.toString())
        : new URL(input);
  } catch {
    return false;
  }

  if (
    url.protocol !== 'http:' &&
    url.protocol !== 'https:'
  ) {
    return false;
  }

  const extension = getPathExtension(
    url.pathname,
  );

  if (
    extension &&
    NON_HTML_EXTENSIONS.has(extension)
  ) {
    return false;
  }

  return true;
}

function normalizeHostname(hostname: string): string {
  return hostname
    .trim()
    .toLowerCase()
    .replace(/\.$/, '')
    .replace(/^www\./, '');
}

function isSameSite(candidate: string | URL, siteUrl: URL): boolean {
  let candidateUrl: URL;

  try {
    candidateUrl =
      candidate instanceof URL
        ? new URL(candidate.toString())
        : new URL(candidate);
  } catch {
    return false;
  }

  if (
    candidateUrl.protocol !== 'http:' &&
    candidateUrl.protocol !== 'https:'
  ) {
    return false;
  }

  return (
    normalizeHostname(candidateUrl.hostname) ===
    normalizeHostname(siteUrl.hostname)
  );
}

function toFailure(
  item: WebsiteSeoCrawlQueueItem,
  error: unknown,
): WebsiteSeoCrawlFailure {
  if (error instanceof WebsiteSeoFetchError) {
    return {
      url: item.url,
      depth: item.depth,
      discoveredFrom: item.discoveredFrom,
      code: error.code,
      message: error.message,
      status: error.status ?? null,
    };
  }

  if (error instanceof Error) {
    return {
      url: item.url,
      depth: item.depth,
      discoveredFrom: item.discoveredFrom,
      code: 'CRAWL_ERROR',
      message: error.message,
      status: null,
    };
  }

  return {
    url: item.url,
    depth: item.depth,
    discoveredFrom: item.discoveredFrom,
    code: 'CRAWL_ERROR',
    message: 'The page could not be crawled.',
    status: null,
  };
}

export async function crawlWebsiteSeo(
  input: string,
  options: WebsiteSeoCrawlerOptions = {},
  dependencies: WebsiteSeoCrawlerDependencies = {},
): Promise<WebsiteSeoCrawlResult> {
  const startedAt = Date.now();
  const maxPages = parseMaxPages(options.maxPages);

  /*
   * Parse synchronously first so malformed, local and explicitly
   * blocked URL literals fail before the crawler queue is created.
   *
   * The actual fetch transport performs DNS validation and socket
   * pinning before every network connection.
   */
  const parsedStartUrl = parseWebsiteSeoUrl(input);
  const startUrl = normalizeCrawlUrl(parsedStartUrl);

  const siteUrl = new URL(startUrl);
  const siteOrigin = siteUrl.origin;

  const fetchPage =
    dependencies.fetchPage ?? safeWebsiteSeoFetch;

  const signal = options.fetchOptions?.signal;

  const throwIfAborted = () => {
    if (signal?.aborted) {
      throw new WebsiteSeoFetchError(
        'AUDIT_ABORTED',
        'The website audit was cancelled.',
      );
    }
  };

  const delay =
    dependencies.delay ??
    (async (milliseconds: number) => {
      try {
        await sleep(milliseconds, undefined, { signal });
      } catch (error) {
        if (signal?.aborted) {
          throw new WebsiteSeoFetchError(
            'AUDIT_ABORTED',
            'The website audit was cancelled.',
            { cause: error },
          );
        }

        throw error;
      }
    });

  const queue: WebsiteSeoCrawlQueueItem[] = [
    {
      url: startUrl,
      depth: 0,
      discoveredFrom: null,
    },
  ];

  /*
   * scheduled contains every normalized URL admitted to the queue.
   * This prevents duplicate URLs from consuming crawl capacity.
   */
  const scheduled = new Set<string>([startUrl]);

  /*
   * Additional seeds share depth 0 with the entered start URL because
   * they are independent discovery roots rather than links discovered
   * from another crawled page.
   *
   * Every seed passes through the same normalization, same-site,
   * crawlability, and deduplication policy used for discovered links.
   * Robots policy is intentionally evaluated later, immediately before
   * the page fetch, so seeded and link-discovered URLs behave identically.
   */
  for (const seed of options.seedUrls ?? []) {
    let normalized: string;

    try {
      normalized = normalizeCrawlUrl(seed);
    } catch {
      continue;
    }

    if (!isSameSite(normalized, siteUrl)) {
      continue;
    }

    if (!isCrawlablePageUrl(normalized)) {
      continue;
    }

    if (scheduled.has(normalized)) {
      continue;
    }

    scheduled.add(normalized);

    queue.push({
      url: normalized,
      depth: 0,
      discoveredFrom: null,
    });
  }

  /*
   * processed protects against duplicate final destinations caused
   * by redirects or equivalent queue entries.
   */
  const processed = new Set<string>();

  const pages: WebsiteSeoCrawlPage[] = [];

  /*
   * Timestamp of the most recent page request.
   * Used only when robots.txt supplies Crawl-delay.
   */
  let lastRequestStartedAt: number | null = null;
  const failures: WebsiteSeoCrawlFailure[] = [];

  while (
    queue.length > 0 &&
    pages.length + failures.length < maxPages
  ) {
    throwIfAborted();

    const item = queue.shift();

    if (!item) {
      break;
    }

    if (processed.has(item.url)) {
      continue;
    }

    processed.add(item.url);

    try {
      /*
       * Respect robots.txt before any page network request.
       * No robots document means existing crawl behavior is preserved.
       */
      let crawlDelaySeconds: number | null = null;

      if (options.robots) {
        const robotsAccess =
          evaluateWebsiteSeoRobotsAccess(
            options.robots,
            item.url,
            options.robotsUserAgent,
          );

        if (!robotsAccess.allowed) {
          continue;
        }

        crawlDelaySeconds = robotsAccess.crawlDelay;
      }

      /*
       * Crawl-delay is expressed in seconds by robots.txt.
       * Do not delay the first permitted request. For later requests,
       * wait only for the remaining interval since the previous
       * request started.
       */
      if (
        crawlDelaySeconds !== null &&
        crawlDelaySeconds > 0 &&
        lastRequestStartedAt !== null
      ) {
        const crawlDelayMs =
          crawlDelaySeconds * 1000;

        const elapsedMs =
          Date.now() - lastRequestStartedAt;

        const remainingDelayMs =
          Math.max(0, crawlDelayMs - elapsedMs);

        if (remainingDelayMs > 0) {
          await delay(remainingDelayMs);
        }
      }

      throwIfAborted();

      lastRequestStartedAt = Date.now();

      const fetched = await fetchPage(
        item.url,
        options.fetchOptions,
      );

      throwIfAborted();

      if (fetched.status >= 400 && fetched.status <= 599) {
        throw new WebsiteSeoFetchError(
          'HTTP_ERROR',
          `HTTP ${fetched.status}: ${fetched.statusText || "Request failed"}.`,
          { status: fetched.status },
        );
      }

      const finalUrl = normalizeCrawlUrl(fetched.finalUrl);

      /*
       * Redirects are allowed by safe-fetch, but the crawler must not
       * expand into another website. We still record the fetched page,
       * while discovered links are admitted only when they remain on
       * the original site.
       */
      processed.add(finalUrl);
      scheduled.add(finalUrl);

      const extraction = extractWebsiteSeoHtml(
        fetched.body,
        finalUrl,
      );

      const analysis =
        analyzeWebsiteSeoIssues(extraction);

      pages.push({
        requestedUrl: normalizeCrawlUrl(
          fetched.requestedUrl,
        ),
        finalUrl,
        depth: item.depth,
        discoveredFrom: item.discoveredFrom,

        status: fetched.status,
        statusText: fetched.statusText,
        contentType: fetched.contentType,
        byteLength: fetched.byteLength,
        durationMs: fetched.durationMs,
        redirectChain: fetched.redirectChain.map(
          normalizeCrawlUrl,
        ),

        extraction,
        analysis,
      });

      for (const link of extraction.internalLinks) {
        let normalized: string;

        try {
          normalized = normalizeCrawlUrl(link.href);
        } catch {
          continue;
        }

        if (!isSameSite(normalized, siteUrl)) {
          continue;
        }

        if (!isCrawlablePageUrl(normalized)) {
          continue;
        }

        if (scheduled.has(normalized)) {
          continue;
        }

        scheduled.add(normalized);

        queue.push({
          url: normalized,
          depth: item.depth + 1,
          discoveredFrom: finalUrl,
        });
      }
    } catch (error) {
      if (
        error instanceof WebsiteSeoFetchError &&
        error.code === 'AUDIT_ABORTED'
      ) {
        throw error;
      }

      failures.push(toFailure(item, error));
    }
  }

  throwIfAborted();

  const truncated = queue.length > 0;

  return {
    startUrl,
    siteOrigin,

    pages,
    failures,

    discoveredUrls: scheduled.size,
    crawledUrls: pages.length,
    failedUrls: failures.length,
    maxPages,
    truncated,
    durationMs: Date.now() - startedAt,
  };
}
