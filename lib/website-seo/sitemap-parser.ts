import { load } from 'cheerio';

export type WebsiteSeoSitemapDocumentType =
  | 'urlset'
  | 'sitemapindex'
  | 'unknown';

export interface WebsiteSeoSitemapUrlEntry {
  loc: string;
  lastmod: string | null;
  changefreq: string | null;
  priority: number | null;
}

export interface WebsiteSeoSitemapIndexEntry {
  loc: string;
  lastmod: string | null;
}

export interface WebsiteSeoSitemapParseResult {
  type: WebsiteSeoSitemapDocumentType;
  urls: WebsiteSeoSitemapUrlEntry[];
  sitemaps: WebsiteSeoSitemapIndexEntry[];
}

function normalizeUrl(
  value: string,
  baseUrl?: string | URL,
): string | null {
  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  try {
    const url = baseUrl
      ? new URL(trimmed, baseUrl)
      : new URL(trimmed);

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

function parsePriority(
  value: string,
): number | null {
  if (!value.trim()) {
    return null;
  }

  const number = Number(value.trim());

  if (
    !Number.isFinite(number) ||
    number < 0 ||
    number > 1
  ) {
    return null;
  }

  return number;
}

function nodeText(
  $: ReturnType<typeof load>,
  element: Parameters<
    ReturnType<typeof load>
  >[0] extends never
    ? never
    : never,
): string {
  return $(element).text().trim();
}

/*
 * Cheerio's XML mode gives us tolerant local XML parsing without
 * introducing another dependency. We intentionally query by local
 * element names and support both standard urlset and sitemapindex
 * documents.
 */
export function parseWebsiteSeoSitemapXml(
  xml: string,
  baseUrl?: string | URL,
): WebsiteSeoSitemapParseResult {
  const $ = load(xml, {
    xmlMode: true,
  });

  const root = $.root().children().first();

  const rootName =
    root.get(0)?.tagName
      ?.split(':')
      .pop()
      ?.toLowerCase() ?? '';

  if (rootName === 'urlset') {
    const urls: WebsiteSeoSitemapUrlEntry[] =
      [];

    root.children().each((_, element) => {
      const tagName =
        element.tagName
          ?.split(':')
          .pop()
          ?.toLowerCase();

      if (tagName !== 'url') {
        return;
      }

      const child = $(element);

      const locValue =
        child
          .children()
          .filter((__, item) =>
            item.tagName
              ?.split(':')
              .pop()
              ?.toLowerCase() === 'loc',
          )
          .first()
          .text()
          .trim();

      const loc = normalizeUrl(
        locValue,
        baseUrl,
      );

      if (!loc) {
        return;
      }

      const lastmod =
        child
          .children()
          .filter((__, item) =>
            item.tagName
              ?.split(':')
              .pop()
              ?.toLowerCase() === 'lastmod',
          )
          .first()
          .text()
          .trim() || null;

      const changefreq =
        child
          .children()
          .filter((__, item) =>
            item.tagName
              ?.split(':')
              .pop()
              ?.toLowerCase() === 'changefreq',
          )
          .first()
          .text()
          .trim()
          .toLowerCase() || null;

      const priorityText =
        child
          .children()
          .filter((__, item) =>
            item.tagName
              ?.split(':')
              .pop()
              ?.toLowerCase() === 'priority',
          )
          .first()
          .text()
          .trim();

      urls.push({
        loc,
        lastmod,
        changefreq,
        priority:
          parsePriority(priorityText),
      });
    });

    return {
      type: 'urlset',
      urls,
      sitemaps: [],
    };
  }

  if (rootName === 'sitemapindex') {
    const sitemaps: WebsiteSeoSitemapIndexEntry[] =
      [];

    root.children().each((_, element) => {
      const tagName =
        element.tagName
          ?.split(':')
          .pop()
          ?.toLowerCase();

      if (tagName !== 'sitemap') {
        return;
      }

      const child = $(element);

      const locValue =
        child
          .children()
          .filter((__, item) =>
            item.tagName
              ?.split(':')
              .pop()
              ?.toLowerCase() === 'loc',
          )
          .first()
          .text()
          .trim();

      const loc = normalizeUrl(
        locValue,
        baseUrl,
      );

      if (!loc) {
        return;
      }

      const lastmod =
        child
          .children()
          .filter((__, item) =>
            item.tagName
              ?.split(':')
              .pop()
              ?.toLowerCase() === 'lastmod',
          )
          .first()
          .text()
          .trim() || null;

      sitemaps.push({
        loc,
        lastmod,
      });
    });

    return {
      type: 'sitemapindex',
      urls: [],
      sitemaps,
    };
  }

  return {
    type: 'unknown',
    urls: [],
    sitemaps: [],
  };
}