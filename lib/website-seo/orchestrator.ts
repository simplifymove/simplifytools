import {
  crawlWebsiteSeo,
  type WebsiteSeoCrawlerDependencies,
  type WebsiteSeoCrawlerOptions,
  type WebsiteSeoCrawlResult,
} from './crawler';

import {
  analyzeWebsiteSeoSite,
  type WebsiteSeoSiteAnalysis,
} from './site-analysis';

import {
  discoverWebsiteSeoSite,
  type WebsiteSeoDiscoveryOptions,
  type WebsiteSeoSiteDiscoveryResult,
} from './site-discovery';

import {
  safeWebsiteSeoFetch,
  WebsiteSeoFetchError,
} from './safe-fetch';

export interface WebsiteSeoAuditOptions {
  signal?: AbortSignal;
  discovery?: WebsiteSeoDiscoveryOptions;
  crawler?: WebsiteSeoCrawlerOptions;
}

export interface WebsiteSeoAuditDependencies {
  discoveryFetch?: typeof safeWebsiteSeoFetch;
  crawler?: WebsiteSeoCrawlerDependencies;
}

export interface WebsiteSeoSitemapCrawlComparison {
  /*
   * Normalized page URLs discovered from sitemap documents.
   */
  sitemapUrlCount: number;

  /*
   * Sitemap URLs that produced successfully crawled pages.
   */
  sitemapUrlsCrawled: string[];

  /*
   * Sitemap URLs for which no successful crawl page exists.
   *
   * This is diagnostic coverage information only. A URL may be absent
   * because of robots policy, crawler filtering, fetch failure, or
   * maxPages truncation, so this list must not be treated as an SEO
   * error by itself.
   */
  sitemapUrlsNotCrawled: string[];

  /*
   * Successfully crawled final URLs that are represented in the sitemap.
   */
  crawledUrlsInSitemap: string[];

  /*
   * Successfully crawled final URLs that are not represented in the
   * discovered sitemap page set.
   */
  crawledUrlsNotInSitemap: string[];

  /*
   * Stronger orphan candidates:
   * - present in the sitemap
   * - successfully crawled
   * - zero inbound internal links from other successfully crawled pages
   * - not the entered crawl start URL
   *
   * This remains candidate terminology because incomplete/truncated
   * crawling cannot prove the absence of every possible internal link.
   */
  sitemapOrphanCandidateUrls: string[];

  /*
   * Preserve crawl/discovery completeness signals beside the comparison
   * so callers do not accidentally interpret partial coverage as final.
   */
  crawlTruncated: boolean;
  discoveryTruncated: boolean;
}

export interface WebsiteSeoAuditResult {
  discovery: WebsiteSeoSiteDiscoveryResult;
  crawl: WebsiteSeoCrawlResult;
  analysis: WebsiteSeoSiteAnalysis;
  sitemapComparison: WebsiteSeoSitemapCrawlComparison;
}

function buildWebsiteSeoSitemapCrawlComparison(
  discovery: WebsiteSeoSiteDiscoveryResult,
  crawl: WebsiteSeoCrawlResult,
  analysis: WebsiteSeoSiteAnalysis,
): WebsiteSeoSitemapCrawlComparison {
  const sitemapUrls =
    new Set(discovery.discoveredPageUrls);

  /*
   * Compare sitemap URLs against both requested and final successful
   * crawl URLs. This keeps the comparison useful when a sitemap URL
   * redirects to another same-site URL.
   */
  const successfulRequestedUrls =
    new Set(
      crawl.pages.map(
        (page) => page.requestedUrl,
      ),
    );

  const successfulFinalUrls =
    new Set(
      crawl.pages.map(
        (page) => page.finalUrl,
      ),
    );

  const sitemapUrlsCrawled =
    [...sitemapUrls]
      .filter(
        (url) =>
          successfulRequestedUrls.has(url) ||
          successfulFinalUrls.has(url),
      )
      .sort();

  const sitemapUrlsNotCrawled =
    [...sitemapUrls]
      .filter(
        (url) =>
          !successfulRequestedUrls.has(url) &&
          !successfulFinalUrls.has(url),
      )
      .sort();

  const crawledUrlsInSitemap =
    [...successfulFinalUrls]
      .filter((url) => sitemapUrls.has(url))
      .sort();

  const crawledUrlsNotInSitemap =
    [...successfulFinalUrls]
      .filter((url) => !sitemapUrls.has(url))
      .sort();

  const sitemapOrphanCandidateUrls =
    analysis.inboundInternalLinks
      .filter(
        (entry) =>
          entry.inboundLinks === 0 &&
          entry.url !== crawl.startUrl &&
          sitemapUrls.has(entry.url),
      )
      .map((entry) => entry.url)
      .sort();

  return {
    sitemapUrlCount: sitemapUrls.size,
    sitemapUrlsCrawled,
    sitemapUrlsNotCrawled,
    crawledUrlsInSitemap,
    crawledUrlsNotInSitemap,
    sitemapOrphanCandidateUrls,
    crawlTruncated: crawl.truncated,
    discoveryTruncated: discovery.truncated,
  };
}
export async function runWebsiteSeoAudit(
  input: string,
  options: WebsiteSeoAuditOptions = {},
  dependencies: WebsiteSeoAuditDependencies = {},
): Promise<WebsiteSeoAuditResult> {
  /*
   * Phase 1: discover robots.txt and sitemap metadata.
   *
   * Discovery remains independently bounded and uses the same secure
   * transport foundation. No page crawling happens during this phase.
   */
  const throwIfAborted = () => {
    if (options.signal?.aborted) {
      throw new WebsiteSeoFetchError(
        'AUDIT_ABORTED',
        'The website audit was cancelled.',
      );
    }
  };

  throwIfAborted();

  const discovery =
    await discoverWebsiteSeoSite(
      input,
      {
        ...options.discovery,
        fetchOptions: {
          ...options.discovery?.fetchOptions,
          signal: options.signal ?? options.discovery?.fetchOptions?.signal,
        },
      },
      dependencies.discoveryFetch,
    );

  throwIfAborted();

  /*
   * Phase 2: crawl the entered website.
   *
   * The discovered robots policy is automatically applied unless the
   * caller explicitly supplied a crawler robots policy.
   *
   * Sitemap-discovered page URLs are supplied as additional crawl
   * seeds. The crawler remains responsible for normalization,
   * same-site filtering, deduplication, robots enforcement, and bounds.
   */
  const crawlerOptions: WebsiteSeoCrawlerOptions = {
    ...options.crawler,

    fetchOptions: {
      ...options.crawler?.fetchOptions,
      signal: options.signal ?? options.crawler?.fetchOptions?.signal,
    },

    robots:
      options.crawler?.robots ??
      discovery.robots.document,

    /*
     * Sitemap-discovered page URLs become additional crawl roots.
     * Explicit caller seeds are retained and combined with discovery.
     * The crawler performs normalization, same-site filtering,
     * crawlability filtering, deduplication, and robots enforcement.
     */
    seedUrls: [
      ...(options.crawler?.seedUrls ?? []),
      ...discovery.discoveredPageUrls,
    ],
  };

  const crawl =
    await crawlWebsiteSeo(
      input,
      crawlerOptions,
      dependencies.crawler,
    );

  throwIfAborted();

  /*
   * Phase 3: site-wide aggregation over the completed crawl.
   */
  const analysis =
    analyzeWebsiteSeoSite(crawl);

  /*
   * Phase 4: compare sitemap discovery with successful crawl coverage
   * and the completed internal-link graph.
   *
   * The comparison remains orchestration-level because lower-level site
   * analysis intentionally has no dependency on sitemap discovery.
   */
  throwIfAborted();

  const sitemapComparison =
    buildWebsiteSeoSitemapCrawlComparison(
      discovery,
      crawl,
      analysis,
    );

  throwIfAborted();

  return {
    discovery,
    crawl,
    analysis,
    sitemapComparison,
  };
}