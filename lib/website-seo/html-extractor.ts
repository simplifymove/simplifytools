import * as cheerio from 'cheerio';

export interface WebsiteSeoHeading {
  level: number;
  text: string;
}

export interface WebsiteSeoLink {
  href: string;
  text: string;
  rel: string[];
  nofollow: boolean;
}

export interface WebsiteSeoImage {
  src: string;
  alt: string | null;
  title: string | null;
  width: string | null;
  height: string | null;
  loading: string | null;
}

export interface WebsiteSeoHreflang {
  hreflang: string;
  href: string;
}

export interface WebsiteSeoOpenGraph {
  title: string | null;
  description: string | null;
  type: string | null;
  url: string | null;
  image: string | null;
  siteName: string | null;
}

export interface WebsiteSeoTwitter {
  card: string | null;
  title: string | null;
  description: string | null;
  image: string | null;
  site: string | null;
  creator: string | null;
}

export interface WebsiteSeoStructuredData {
  raw: string;
  validJson: boolean;
  value: unknown | null;
}

export interface WebsiteSeoHtmlExtraction {
  url: string;

  htmlLanguage: string | null;

  title: string | null;
  titleLength: number;

  metaDescription: string | null;
  metaDescriptionLength: number;

  metaKeywords: string | null;

  robots: string[];
  googlebot: string[];

  canonical: string | null;

  viewport: string | null;

  headings: WebsiteSeoHeading[];
  h1: string[];
  h2: string[];
  h3: string[];
  h4: string[];
  h5: string[];
  h6: string[];

  wordCount: number;

  /*
   * Bounded normalized visible body content used for local,
   * site-wide near-duplicate diagnostics.
   *
   * Raw HTML is not retained. Non-content elements are removed
   * before whitespace normalization.
   */
  contentFingerprint: string;

  links: WebsiteSeoLink[];
  internalLinks: WebsiteSeoLink[];
  externalLinks: WebsiteSeoLink[];

  images: WebsiteSeoImage[];
  imagesMissingAlt: number;

  hreflang: WebsiteSeoHreflang[];

  openGraph: WebsiteSeoOpenGraph;
  twitter: WebsiteSeoTwitter;

  structuredData: WebsiteSeoStructuredData[];

  pagination: {
    next: string | null;
    prev: string | null;
  };
}

function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

function cleanAttribute(
  value: string | undefined,
): string | null {
  if (typeof value !== 'string') {
    return null;
  }

  const cleaned = normalizeWhitespace(value);

  return cleaned || null;
}

function firstMetaContent(
  $: cheerio.CheerioAPI,
  selector: string,
): string | null {
  return cleanAttribute($(selector).first().attr('content'));
}

function parseDirectives(
  value: string | null,
): string[] {
  if (!value) {
    return [];
  }

  return Array.from(
    new Set(
      value
        .split(',')
        .map((item) => item.trim().toLowerCase())
        .filter(Boolean),
    ),
  );
}

function getHeadingTexts(
  $: cheerio.CheerioAPI,
  level: number,
): string[] {
  return $(`h${level}`)
    .map((_, element) =>
      normalizeWhitespace($(element).text()),
    )
    .get()
    .filter(Boolean);
}

function resolveUrl(
  value: string | null,
  baseUrl: URL,
): string | null {
  if (!value) {
    return null;
  }

  try {
    return new URL(value, baseUrl).toString();
  } catch {
    return null;
  }
}

function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);

    return (
      url.protocol === 'http:' ||
      url.protocol === 'https:'
    );
  } catch {
    return false;
  }
}

function getRegistrableComparisonHost(
  hostname: string,
): string {
  return hostname
    .trim()
    .toLowerCase()
    .replace(/\.$/, '')
    .replace(/^www\./, '');
}

function isInternalUrl(
  value: string,
  baseUrl: URL,
): boolean {
  try {
    const target = new URL(value);

    return (
      getRegistrableComparisonHost(target.hostname) ===
      getRegistrableComparisonHost(baseUrl.hostname)
    );
  } catch {
    return false;
  }
}

function extractLinks(
  $: cheerio.CheerioAPI,
  baseUrl: URL,
): {
  links: WebsiteSeoLink[];
  internalLinks: WebsiteSeoLink[];
  externalLinks: WebsiteSeoLink[];
} {
  const links: WebsiteSeoLink[] = [];

  $('a[href]').each((_, element) => {
    const rawHref = cleanAttribute($(element).attr('href'));

    if (!rawHref) {
      return;
    }

    // Fragment-only anchors navigate within the current document.
    // They are not crawlable page URLs and must not enter the
    // internal/external link dataset.
    if (rawHref.startsWith('#')) {
      return;
    }

    const href = resolveUrl(rawHref, baseUrl);

    if (!href || !isHttpUrl(href)) {
      return;
    }

    const rel = (
      cleanAttribute($(element).attr('rel')) || ''
    )
      .toLowerCase()
      .split(/\s+/)
      .filter(Boolean);

    links.push({
      href,
      text: normalizeWhitespace($(element).text()),
      rel,
      nofollow: rel.includes('nofollow'),
    });
  });

  return {
    links,
    internalLinks: links.filter((link) =>
      isInternalUrl(link.href, baseUrl),
    ),
    externalLinks: links.filter(
      (link) => !isInternalUrl(link.href, baseUrl),
    ),
  };
}

function extractImages(
  $: cheerio.CheerioAPI,
  baseUrl: URL,
): WebsiteSeoImage[] {
  const images: WebsiteSeoImage[] = [];

  $('img').each((_, element) => {
    const rawSrc = cleanAttribute($(element).attr('src'));

    if (!rawSrc) {
      return;
    }

    const src = resolveUrl(rawSrc, baseUrl);

    if (!src) {
      return;
    }

    const rawAlt = $(element).attr('alt');

    images.push({
      src,
      alt:
        typeof rawAlt === 'string'
          ? normalizeWhitespace(rawAlt)
          : null,
      title: cleanAttribute($(element).attr('title')),
      width: cleanAttribute($(element).attr('width')),
      height: cleanAttribute($(element).attr('height')),
      loading: cleanAttribute($(element).attr('loading')),
    });
  });

  return images;
}

function extractStructuredData(
  $: cheerio.CheerioAPI,
): WebsiteSeoStructuredData[] {
  return $('script[type="application/ld+json"]')
    .map((_, element) => {
      const raw = $(element).html()?.trim() || '';

      if (!raw) {
        return {
          raw: '',
          validJson: false,
          value: null,
        };
      }

      try {
        return {
          raw,
          validJson: true,
          value: JSON.parse(raw) as unknown,
        };
      } catch {
        return {
          raw,
          validJson: false,
          value: null,
        };
      }
    })
    .get();
}

const MAX_CONTENT_FINGERPRINT_CHARACTERS = 20_000;

function extractNormalizedBodyText(
  $: cheerio.CheerioAPI,
): string {
  const clone = $('body').clone();

  clone
    .find(
      'script,style,noscript,template,svg,canvas',
    )
    .remove();

  return normalizeWhitespace(clone.text());
}

function buildContentFingerprint(
  normalizedBodyText: string,
): string {
  if (!normalizedBodyText) {
    return '';
  }

  /*
   * Keep the comparison payload deterministic and bounded.
   * Word-count analysis continues to use the complete body text.
   */
  return normalizedBodyText
    .toLowerCase()
    .slice(
      0,
      MAX_CONTENT_FINGERPRINT_CHARACTERS,
    );
}

function calculateWordCount(
  normalizedBodyText: string,
): number {
  if (!normalizedBodyText) {
    return 0;
  }

  return normalizedBodyText
    .split(/\s+/)
    .filter(Boolean)
    .length;
}

export function extractWebsiteSeoHtml(
  html: string,
  pageUrl: string | URL,
): WebsiteSeoHtmlExtraction {
  const baseUrl =
    pageUrl instanceof URL
      ? new URL(pageUrl.toString())
      : new URL(pageUrl);

  baseUrl.hash = '';

  const $ = cheerio.load(html);

  /*
   * Compute cleaned visible body text once and reuse it for both
   * word-count and content-comparison data.
   */
  const normalizedBodyText =
    extractNormalizedBodyText($);

  const title =
    normalizeWhitespace($('title').first().text()) || null;

  const metaDescription = firstMetaContent(
    $,
    'meta[name="description" i]',
  );

  const metaKeywords = firstMetaContent(
    $,
    'meta[name="keywords" i]',
  );

  const robotsRaw = firstMetaContent(
    $,
    'meta[name="robots" i]',
  );

  const googlebotRaw = firstMetaContent(
    $,
    'meta[name="googlebot" i]',
  );

  const canonical = resolveUrl(
    cleanAttribute(
      $('link[rel~="canonical" i]')
        .first()
        .attr('href'),
    ),
    baseUrl,
  );

  const viewport = firstMetaContent(
    $,
    'meta[name="viewport" i]',
  );

  const headings: WebsiteSeoHeading[] = [];

  for (let level = 1; level <= 6; level += 1) {
    $(`h${level}`).each((_, element) => {
      const text = normalizeWhitespace(
        $(element).text(),
      );

      if (text) {
        headings.push({
          level,
          text,
        });
      }
    });
  }

  const linkResult = extractLinks($, baseUrl);
  const images = extractImages($, baseUrl);

  const hreflang: WebsiteSeoHreflang[] = [];

  $('link[rel~="alternate" i][hreflang][href]').each(
    (_, element) => {
      const language = cleanAttribute(
        $(element).attr('hreflang'),
      );

      const href = resolveUrl(
        cleanAttribute($(element).attr('href')),
        baseUrl,
      );

      if (!language || !href) {
        return;
      }

      hreflang.push({
        hreflang: language.toLowerCase(),
        href,
      });
    },
  );

  const openGraph: WebsiteSeoOpenGraph = {
    title: firstMetaContent(
      $,
      'meta[property="og:title" i]',
    ),
    description: firstMetaContent(
      $,
      'meta[property="og:description" i]',
    ),
    type: firstMetaContent(
      $,
      'meta[property="og:type" i]',
    ),
    url: resolveUrl(
      firstMetaContent(
        $,
        'meta[property="og:url" i]',
      ),
      baseUrl,
    ),
    image: resolveUrl(
      firstMetaContent(
        $,
        'meta[property="og:image" i]',
      ),
      baseUrl,
    ),
    siteName: firstMetaContent(
      $,
      'meta[property="og:site_name" i]',
    ),
  };

  const twitter: WebsiteSeoTwitter = {
    card: firstMetaContent(
      $,
      'meta[name="twitter:card" i]',
    ),
    title: firstMetaContent(
      $,
      'meta[name="twitter:title" i]',
    ),
    description: firstMetaContent(
      $,
      'meta[name="twitter:description" i]',
    ),
    image: resolveUrl(
      firstMetaContent(
        $,
        'meta[name="twitter:image" i]',
      ),
      baseUrl,
    ),
    site: firstMetaContent(
      $,
      'meta[name="twitter:site" i]',
    ),
    creator: firstMetaContent(
      $,
      'meta[name="twitter:creator" i]',
    ),
  };

  return {
    url: baseUrl.toString(),

    htmlLanguage: cleanAttribute(
      $('html').first().attr('lang'),
    ),

    title,
    titleLength: title?.length ?? 0,

    metaDescription,
    metaDescriptionLength:
      metaDescription?.length ?? 0,

    metaKeywords,

    robots: parseDirectives(robotsRaw),
    googlebot: parseDirectives(googlebotRaw),

    canonical,

    viewport,

    headings,
    h1: getHeadingTexts($, 1),
    h2: getHeadingTexts($, 2),
    h3: getHeadingTexts($, 3),
    h4: getHeadingTexts($, 4),
    h5: getHeadingTexts($, 5),
    h6: getHeadingTexts($, 6),

    wordCount: calculateWordCount(
      normalizedBodyText,
    ),

    contentFingerprint:
      buildContentFingerprint(
        normalizedBodyText,
      ),

    links: linkResult.links,
    internalLinks: linkResult.internalLinks,
    externalLinks: linkResult.externalLinks,

    images,
    imagesMissingAlt: images.filter(
      (image) => image.alt === null,
    ).length,

    hreflang,

    openGraph,
    twitter,

    structuredData: extractStructuredData($),

    pagination: {
      next: resolveUrl(
        cleanAttribute(
          $('link[rel~="next" i]')
            .first()
            .attr('href'),
        ),
        baseUrl,
      ),
      prev: resolveUrl(
        cleanAttribute(
          $('link[rel~="prev" i]')
            .first()
            .attr('href'),
        ),
        baseUrl,
      ),
    },
  };
}