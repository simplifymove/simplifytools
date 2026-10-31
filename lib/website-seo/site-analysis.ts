import type {
  WebsiteSeoCrawlPage,
  WebsiteSeoCrawlResult,
} from './crawler';

import type {
  WebsiteSeoIssueSeverity,
  WebsiteSeoIssueSummary,
} from './issue-engine';

export interface WebsiteSeoDuplicateGroup {
  value: string;
  urls: string[];
  count: number;
}

export interface WebsiteSeoStatusGroup {
  status: number;
  count: number;
  urls: string[];
}

export interface WebsiteSeoDepthGroup {
  depth: number;
  count: number;
  urls: string[];
}

export interface WebsiteSeoCanonicalRelationship {
  url: string;
  canonical: string;
  selfCanonical: boolean;
}

export interface WebsiteSeoInboundLinkCount {
  url: string;
  inboundLinks: number;
  linkedFrom: string[];
}

export interface WebsiteSeoBrokenInternalLink {
  url: string;
  status: number | null;
  code: string | null;
  linkedFrom: string[];
}

export interface WebsiteSeoRedirectSummary {
  requestedUrl: string;
  finalUrl: string;
  redirectChain: string[];
  redirectCount: number;
  linkedFrom: string[];
}
export interface WebsiteSeoNearDuplicatePair {
  urlA: string;
  urlB: string;
  similarity: number;
}

export interface WebsiteSeoNearDuplicateCandidateGroup {
  urls: string[];
  minimumSimilarity: number;
}
export interface WebsiteSeoPageIssueTotal {
  url: string;
  errors: number;
  warnings: number;
  opportunities: number;
  total: number;
}

export interface WebsiteSeoSiteAnalysis {
  pageCount: number;
  failureCount: number;

  statusGroups: WebsiteSeoStatusGroup[];

  indexableUrls: string[];
  nonIndexableUrls: string[];

  /*
   * Actionable duplicate groups contain indexable pages only.
   * Non-indexable utility/auth pages should not create primary SEO findings.
   */
  duplicateTitles: WebsiteSeoDuplicateGroup[];
  duplicateMetaDescriptions: WebsiteSeoDuplicateGroup[];
  duplicateH1: WebsiteSeoDuplicateGroup[];

  /*
   * Diagnostic groups retain duplicate information across every
   * successfully crawled page, including noindex pages.
   */
  allPageDuplicateTitles: WebsiteSeoDuplicateGroup[];
  allPageDuplicateMetaDescriptions: WebsiteSeoDuplicateGroup[];
  allPageDuplicateH1: WebsiteSeoDuplicateGroup[];

  missingTitleUrls: string[];
  missingMetaDescriptionUrls: string[];
  missingH1Urls: string[];
  missingCanonicalUrls: string[];

  canonicalRelationships: WebsiteSeoCanonicalRelationship[];

  depthGroups: WebsiteSeoDepthGroup[];

  inboundInternalLinks: WebsiteSeoInboundLinkCount[];
  orphanCandidateUrls: string[];

  brokenInternalLinks: WebsiteSeoBrokenInternalLink[];
  redirects: WebsiteSeoRedirectSummary[];

  nearDuplicatePairs: WebsiteSeoNearDuplicatePair[];
  nearDuplicateCandidateGroups: WebsiteSeoNearDuplicateCandidateGroup[];

  totalWords: number;
  averageWordCount: number;
  minimumWordCount: number;
  maximumWordCount: number;

  totalImages: number;
  imagesMissingAlt: number;

  structuredDataBlocks: number;
  invalidStructuredDataBlocks: number;

  issueSummary: WebsiteSeoIssueSummary;
  pageIssueTotals: WebsiteSeoPageIssueTotal[];
}

function normalizeComparableValue(value: string): string {
  return value.trim().replace(/\s+/g, ' ').toLocaleLowerCase();
}

function hasDirective(page: WebsiteSeoCrawlPage, directive: string): boolean {
  const target = directive.toLocaleLowerCase();

  return [...page.extraction.robots, ...page.extraction.googlebot].some(
    (value) => value.toLocaleLowerCase() === target,
  );
}

function buildDuplicateGroups(
  pages: WebsiteSeoCrawlPage[],
  getValue: (page: WebsiteSeoCrawlPage) => string | null,
): WebsiteSeoDuplicateGroup[] {
  const groups = new Map<
    string,
    {
      value: string;
      urls: Set<string>;
    }
  >();

  for (const page of pages) {
    const rawValue = getValue(page);

    if (!rawValue || !rawValue.trim()) {
      continue;
    }

    const normalized = normalizeComparableValue(rawValue);

    const existing = groups.get(normalized);

    if (existing) {
      existing.urls.add(page.finalUrl);
      continue;
    }

    groups.set(normalized, {
      value: rawValue.trim(),
      urls: new Set([page.finalUrl]),
    });
  }

  return [...groups.values()]
    .filter((group) => group.urls.size > 1)
    .map((group) => ({
      value: group.value,
      urls: [...group.urls].sort(),
      count: group.urls.size,
    }))
    .sort(
      (a, b) =>
        b.count - a.count ||
        a.value.localeCompare(b.value),
    );
}

function buildStatusGroups(
  pages: WebsiteSeoCrawlPage[],
): WebsiteSeoStatusGroup[] {
  const groups = new Map<number, Set<string>>();

  for (const page of pages) {
    const urls = groups.get(page.status) ?? new Set<string>();

    urls.add(page.finalUrl);
    groups.set(page.status, urls);
  }

  return [...groups.entries()]
    .map(([status, urls]) => ({
      status,
      count: urls.size,
      urls: [...urls].sort(),
    }))
    .sort((a, b) => a.status - b.status);
}

function buildDepthGroups(
  pages: WebsiteSeoCrawlPage[],
): WebsiteSeoDepthGroup[] {
  const groups = new Map<number, Set<string>>();

  for (const page of pages) {
    const urls = groups.get(page.depth) ?? new Set<string>();

    urls.add(page.finalUrl);
    groups.set(page.depth, urls);
  }

  return [...groups.entries()]
    .map(([depth, urls]) => ({
      depth,
      count: urls.size,
      urls: [...urls].sort(),
    }))
    .sort((a, b) => a.depth - b.depth);
}

function buildInboundInternalLinks(
  pages: WebsiteSeoCrawlPage[],
): WebsiteSeoInboundLinkCount[] {
  const crawledUrls = new Set(
    pages.map((page) => page.finalUrl),
  );

  const inbound = new Map<string, Set<string>>();

  for (const url of crawledUrls) {
    inbound.set(url, new Set());
  }

  for (const page of pages) {
    const uniqueTargets = new Set(
      page.extraction.internalLinks.map((link) => link.href),
    );

    for (const target of uniqueTargets) {
      if (!crawledUrls.has(target)) {
        continue;
      }

      if (target === page.finalUrl) {
        continue;
      }

      inbound.get(target)?.add(page.finalUrl);
    }
  }

  return [...inbound.entries()]
    .map(([url, linkedFrom]) => ({
      url,
      inboundLinks: linkedFrom.size,
      linkedFrom: [...linkedFrom].sort(),
    }))
    .sort(
      (a, b) =>
        a.inboundLinks - b.inboundLinks ||
        a.url.localeCompare(b.url),
    );
}

function buildBrokenInternalLinks(
  crawl: WebsiteSeoCrawlResult,
): WebsiteSeoBrokenInternalLink[] {
  const internalLinkSources =
    new Map<string, Set<string>>();

  for (const page of crawl.pages) {
    for (const link of page.extraction.internalLinks) {
      const sources =
        internalLinkSources.get(link.href) ??
        new Set<string>();

      sources.add(page.finalUrl);
      internalLinkSources.set(link.href, sources);
    }
  }

  const failuresByUrl = new Map(
    crawl.failures.map((failure) => [
      failure.url,
      failure,
    ]),
  );

  return [...internalLinkSources.entries()]
    .flatMap(([url, linkedFrom]) => {
      const failure =
        failuresByUrl.get(url);

      if (!failure) {
        return [];
      }

      return [{
        url,
        status: failure.status,
        code: failure.code,
        linkedFrom: [...linkedFrom].sort(),
      }];
    })
    .sort(
      (a, b) =>
        a.url.localeCompare(b.url),
    );
}

function buildRedirectSummaries(
  crawl: WebsiteSeoCrawlResult,
): WebsiteSeoRedirectSummary[] {
  const internalLinkSources =
    new Map<string, Set<string>>();

  for (const page of crawl.pages) {
    for (const link of page.extraction.internalLinks) {
      const sources =
        internalLinkSources.get(link.href) ??
        new Set<string>();

      sources.add(page.finalUrl);
      internalLinkSources.set(link.href, sources);
    }
  }

  return crawl.pages
    .filter(
      (page) =>
        page.redirectChain.length > 0 ||
        page.requestedUrl !== page.finalUrl,
    )
    .map((page) => ({
      requestedUrl: page.requestedUrl,
      finalUrl: page.finalUrl,
      redirectChain: [...page.redirectChain],
      redirectCount:
        page.redirectChain.length,
      linkedFrom: [
        ...(
          internalLinkSources.get(
            page.requestedUrl,
          ) ?? new Set<string>()
        ),
      ].sort(),
    }))
    .sort(
      (a, b) =>
        a.requestedUrl.localeCompare(
          b.requestedUrl,
        ),
    );
}
const NEAR_DUPLICATE_SHINGLE_SIZE = 5;
const NEAR_DUPLICATE_MIN_WORDS = 40;
const NEAR_DUPLICATE_MAX_SHINGLES_PER_PAGE = 2_000;
const NEAR_DUPLICATE_MAX_PAGES = 200;
const NEAR_DUPLICATE_SIMILARITY_THRESHOLD = 0.85;

function buildWordShingles(
  fingerprint: string,
): Set<string> {
  const words =
    fingerprint
      .split(/\s+/)
      .filter(Boolean);

  if (words.length < NEAR_DUPLICATE_MIN_WORDS) {
    return new Set<string>();
  }

  const shingles = new Set<string>();

  for (
    let index = 0;
    index <= words.length - NEAR_DUPLICATE_SHINGLE_SIZE;
    index += 1
  ) {
    shingles.add(
      words
        .slice(
          index,
          index + NEAR_DUPLICATE_SHINGLE_SIZE,
        )
        .join(' '),
    );

    if (
      shingles.size >=
      NEAR_DUPLICATE_MAX_SHINGLES_PER_PAGE
    ) {
      break;
    }
  }

  return shingles;
}

function calculateJaccardSimilarity(
  a: Set<string>,
  b: Set<string>,
): number {
  if (a.size === 0 || b.size === 0) {
    return 0;
  }

  let intersection = 0;

  const smaller =
    a.size <= b.size
      ? a
      : b;

  const larger =
    a.size <= b.size
      ? b
      : a;

  for (const value of smaller) {
    if (larger.has(value)) {
      intersection += 1;
    }
  }

  const union =
    a.size + b.size - intersection;

  if (union === 0) {
    return 0;
  }

  return intersection / union;
}

function buildNearDuplicatePairs(
  pages: WebsiteSeoCrawlPage[],
): WebsiteSeoNearDuplicatePair[] {
  const candidates =
    pages
      .filter(
        (page) =>
          page.extraction.contentFingerprint
            .split(/\s+/)
            .filter(Boolean)
            .length >=
          NEAR_DUPLICATE_MIN_WORDS,
      )
      .slice(
        0,
        NEAR_DUPLICATE_MAX_PAGES,
      )
      .map((page) => ({
        url: page.finalUrl,
        shingles:
          buildWordShingles(
            page.extraction.contentFingerprint,
          ),
      }));

  const pairs: WebsiteSeoNearDuplicatePair[] = [];

  for (
    let leftIndex = 0;
    leftIndex < candidates.length;
    leftIndex += 1
  ) {
    const left = candidates[leftIndex];

    for (
      let rightIndex = leftIndex + 1;
      rightIndex < candidates.length;
      rightIndex += 1
    ) {
      const right = candidates[rightIndex];

      const similarity =
        calculateJaccardSimilarity(
          left.shingles,
          right.shingles,
        );

      if (
        similarity <
        NEAR_DUPLICATE_SIMILARITY_THRESHOLD
      ) {
        continue;
      }

      pairs.push({
        urlA: left.url,
        urlB: right.url,
        similarity:
          Math.round(similarity * 10_000) /
          10_000,
      });
    }
  }

  return pairs.sort((a, b) => {
    if (b.similarity !== a.similarity) {
      return b.similarity - a.similarity;
    }

    const first =
      a.urlA.localeCompare(b.urlA);

    if (first !== 0) {
      return first;
    }

    return a.urlB.localeCompare(b.urlB);
  });
}

function buildNearDuplicateCandidateGroups(
  pairs: WebsiteSeoNearDuplicatePair[],
): WebsiteSeoNearDuplicateCandidateGroup[] {
  const adjacency =
    new Map<string, Set<string>>();

  for (const pair of pairs) {
    const left =
      adjacency.get(pair.urlA) ??
      new Set<string>();

    left.add(pair.urlB);
    adjacency.set(pair.urlA, left);

    const right =
      adjacency.get(pair.urlB) ??
      new Set<string>();

    right.add(pair.urlA);
    adjacency.set(pair.urlB, right);
  }

  const visited = new Set<string>();
  const groups: WebsiteSeoNearDuplicateCandidateGroup[] = [];

  for (const start of adjacency.keys()) {
    if (visited.has(start)) {
      continue;
    }

    const stack = [start];
    const urls: string[] = [];

    while (stack.length > 0) {
      const current = stack.pop();

      if (!current || visited.has(current)) {
        continue;
      }

      visited.add(current);
      urls.push(current);

      for (
        const neighbor of
        adjacency.get(current) ?? []
      ) {
        if (!visited.has(neighbor)) {
          stack.push(neighbor);
        }
      }
    }

    if (urls.length < 2) {
      continue;
    }

    urls.sort();

    const urlSet = new Set(urls);

    const groupPairs =
      pairs.filter(
        (pair) =>
          urlSet.has(pair.urlA) &&
          urlSet.has(pair.urlB),
      );

    const minimumSimilarity =
      groupPairs.length === 0
        ? 0
        : Math.min(
            ...groupPairs.map(
              (pair) => pair.similarity,
            ),
          );

    groups.push({
      urls,
      minimumSimilarity,
    });
  }

  return groups.sort(
    (a, b) =>
      b.urls.length - a.urls.length ||
      a.urls[0].localeCompare(b.urls[0]),
  );
}
function emptyIssueSummary(): WebsiteSeoIssueSummary {
  return {
    errors: 0,
    warnings: 0,
    opportunities: 0,
    total: 0,
  };
}

function addIssueSeverity(
  summary: WebsiteSeoIssueSummary,
  severity: WebsiteSeoIssueSeverity,
): void {
  if (severity === 'error') {
    summary.errors += 1;
  } else if (severity === 'warning') {
    summary.warnings += 1;
  } else {
    summary.opportunities += 1;
  }

  summary.total += 1;
}

export function analyzeWebsiteSeoSite(
  crawl: WebsiteSeoCrawlResult,
): WebsiteSeoSiteAnalysis {
  const pages = crawl.pages;


  const missingTitleUrls = pages
    .filter((page) => !page.extraction.title)
    .map((page) => page.finalUrl)
    .sort();

  const missingMetaDescriptionUrls = pages
    .filter((page) => !page.extraction.metaDescription)
    .map((page) => page.finalUrl)
    .sort();

  const missingH1Urls = pages
    .filter((page) => page.extraction.h1.length === 0)
    .map((page) => page.finalUrl)
    .sort();

  const missingCanonicalUrls = pages
    .filter((page) => !page.extraction.canonical)
    .map((page) => page.finalUrl)
    .sort();

  const canonicalRelationships = pages
    .filter(
      (page) =>
        typeof page.extraction.canonical === 'string' &&
        page.extraction.canonical.length > 0,
    )
    .map((page) => ({
      url: page.finalUrl,
      canonical: page.extraction.canonical as string,
      selfCanonical:
        page.extraction.canonical === page.finalUrl,
    }))
    .sort((a, b) => a.url.localeCompare(b.url));

  const indexableUrls: string[] = [];
  const nonIndexableUrls: string[] = [];

  for (const page of pages) {
    if (hasDirective(page, 'noindex')) {
      nonIndexableUrls.push(page.finalUrl);
    } else {
      indexableUrls.push(page.finalUrl);
    }
  }

  indexableUrls.sort();
  nonIndexableUrls.sort();

  const indexableUrlSet = new Set(indexableUrls);

  const indexablePages = pages.filter((page) =>
    indexableUrlSet.has(page.finalUrl),
  );

  /*
   * Near-duplicate diagnostics operate only on successfully crawled,
   * indexable pages. Exact duplicate metadata rules remain separate.
   */
  const nearDuplicatePairs =
    buildNearDuplicatePairs(
      indexablePages,
    );

  const nearDuplicateCandidateGroups =
    buildNearDuplicateCandidateGroups(
      nearDuplicatePairs,
    );

  /*
   * Primary duplicate findings are SEO-actionable duplicates:
   * only pages eligible for indexing participate.
   */
  const duplicateTitles = buildDuplicateGroups(
    indexablePages,
    (page) => page.extraction.title,
  );

  const duplicateMetaDescriptions = buildDuplicateGroups(
    indexablePages,
    (page) => page.extraction.metaDescription,
  );

  const duplicateH1 = buildDuplicateGroups(
    indexablePages,
    (page) => page.extraction.h1[0] ?? null,
  );

  /*
   * Preserve complete crawl diagnostics separately so callers can still
   * inspect duplicate metadata on intentionally non-indexable pages.
   */
  const allPageDuplicateTitles = buildDuplicateGroups(
    pages,
    (page) => page.extraction.title,
  );

  const allPageDuplicateMetaDescriptions = buildDuplicateGroups(
    pages,
    (page) => page.extraction.metaDescription,
  );

  const allPageDuplicateH1 = buildDuplicateGroups(
    pages,
    (page) => page.extraction.h1[0] ?? null,
  );

  const inboundInternalLinks = buildInboundInternalLinks(pages);

  const brokenInternalLinks =
    buildBrokenInternalLinks(crawl);

  const redirects =
    buildRedirectSummaries(crawl);

  /*
   * This is deliberately named "orphan candidate".
   *
   * A normal crawl cannot prove a true orphan because a true orphan may
   * never be discovered. At this stage we only identify successfully
   * crawled pages, excluding the crawl start page, that have zero inbound
   * links from the other successfully crawled pages.
   *
   * Sitemap comparison can make this stronger in a later milestone.
   */
  const orphanCandidateUrls = inboundInternalLinks
    .filter(
      (entry) =>
        entry.inboundLinks === 0 &&
        entry.url !== crawl.startUrl,
    )
    .map((entry) => entry.url)
    .sort();

  const wordCounts = pages.map(
    (page) => page.extraction.wordCount,
  );

  const totalWords = wordCounts.reduce(
    (total, count) => total + count,
    0,
  );

  const averageWordCount =
    pages.length > 0
      ? Math.round((totalWords / pages.length) * 100) / 100
      : 0;

  const minimumWordCount =
    wordCounts.length > 0 ? Math.min(...wordCounts) : 0;

  const maximumWordCount =
    wordCounts.length > 0 ? Math.max(...wordCounts) : 0;

  const totalImages = pages.reduce(
    (total, page) => total + page.extraction.images.length,
    0,
  );

  const imagesMissingAlt = pages.reduce(
    (total, page) =>
      total + page.extraction.imagesMissingAlt,
    0,
  );

  const structuredDataBlocks = pages.reduce(
    (total, page) =>
      total + page.extraction.structuredData.length,
    0,
  );

  const invalidStructuredDataBlocks = pages.reduce(
    (total, page) =>
      total +
      page.extraction.structuredData.filter(
        (item) => !item.validJson,
      ).length,
    0,
  );

  const issueSummary = emptyIssueSummary();

  const pageIssueTotals: WebsiteSeoPageIssueTotal[] =
    pages.map((page) => {
      for (const issue of page.analysis.issues) {
        addIssueSeverity(issueSummary, issue.severity);
      }

      return {
        url: page.finalUrl,
        errors: page.analysis.summary.errors,
        warnings: page.analysis.summary.warnings,
        opportunities: page.analysis.summary.opportunities,
        total: page.analysis.summary.total,
      };
    });

  pageIssueTotals.sort(
    (a, b) =>
      b.errors - a.errors ||
      b.warnings - a.warnings ||
      b.opportunities - a.opportunities ||
      a.url.localeCompare(b.url),
  );

  return {
    pageCount: pages.length,
    failureCount: crawl.failures.length,

    statusGroups: buildStatusGroups(pages),

    indexableUrls,
    nonIndexableUrls,

    duplicateTitles,
    duplicateMetaDescriptions,
    duplicateH1,

    allPageDuplicateTitles,
    allPageDuplicateMetaDescriptions,
    allPageDuplicateH1,

    missingTitleUrls,
    missingMetaDescriptionUrls,
    missingH1Urls,
    missingCanonicalUrls,

    canonicalRelationships,

    depthGroups: buildDepthGroups(pages),

    inboundInternalLinks,
    orphanCandidateUrls,

    brokenInternalLinks,
    redirects,

    nearDuplicatePairs,
    nearDuplicateCandidateGroups,

    totalWords,
    averageWordCount,
    minimumWordCount,
    maximumWordCount,

    totalImages,
    imagesMissingAlt,

    structuredDataBlocks,
    invalidStructuredDataBlocks,

    issueSummary,
    pageIssueTotals,
  };
}