export type WebsiteSeoRobotsDirectiveType =
  | 'allow'
  | 'disallow';

export interface WebsiteSeoRobotsRule {
  type: WebsiteSeoRobotsDirectiveType;
  path: string;
  line: number;
}

export interface WebsiteSeoRobotsGroup {
  userAgents: string[];
  rules: WebsiteSeoRobotsRule[];
  crawlDelay: number | null;
}

export interface WebsiteSeoRobotsParseResult {
  groups: WebsiteSeoRobotsGroup[];
  sitemaps: string[];
  host: string | null;
  unknownDirectives: Array<{
    name: string;
    value: string;
    line: number;
  }>;
}

function stripBom(value: string): string {
  return value.replace(/^\uFEFF/, '');
}

function stripInlineComment(value: string): string {
  const index = value.indexOf('#');

  if (index === -1) {
    return value;
  }

  return value.slice(0, index);
}

function normalizeDirectiveName(value: string): string {
  return value.trim().toLowerCase();
}

function parseCrawlDelay(value: string): number | null {
  if (!value.trim()) {
    return null;
  }

  const number = Number(value.trim());

  if (!Number.isFinite(number) || number < 0) {
    return null;
  }

  return number;
}

function normalizeAbsoluteUrl(
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

export function parseWebsiteSeoRobotsTxt(
  input: string,
  baseUrl?: string | URL,
): WebsiteSeoRobotsParseResult {
  const groups: WebsiteSeoRobotsGroup[] = [];
  const sitemaps = new Set<string>();
  const unknownDirectives: WebsiteSeoRobotsParseResult['unknownDirectives'] =
    [];

  let host: string | null = null;

  let currentGroup: WebsiteSeoRobotsGroup | null = null;
  let groupHasRules = false;

  const lines = stripBom(input).split(/\r?\n/);

  for (
    let index = 0;
    index < lines.length;
    index += 1
  ) {
    const lineNumber = index + 1;

    const uncommented = stripInlineComment(
      lines[index] ?? '',
    ).trim();

    if (!uncommented) {
      continue;
    }

    const separator = uncommented.indexOf(':');

    if (separator === -1) {
      unknownDirectives.push({
        name: uncommented,
        value: '',
        line: lineNumber,
      });

      continue;
    }

    const name = normalizeDirectiveName(
      uncommented.slice(0, separator),
    );

    const value = uncommented
      .slice(separator + 1)
      .trim();

    if (name === 'user-agent') {
      /*
       * Consecutive User-agent directives belong to the same group
       * until a rule/directive belonging to that group has appeared.
       */
      if (
        !currentGroup ||
        groupHasRules
      ) {
        currentGroup = {
          userAgents: [],
          rules: [],
          crawlDelay: null,
        };

        groups.push(currentGroup);
        groupHasRules = false;
      }

      if (value) {
        currentGroup.userAgents.push(
          value.toLowerCase(),
        );
      }

      continue;
    }

    if (name === 'sitemap') {
      const sitemap = normalizeAbsoluteUrl(
        value,
        baseUrl,
      );

      if (sitemap) {
        sitemaps.add(sitemap);
      }

      continue;
    }

    if (name === 'host') {
      if (value) {
        host = value;
      }

      continue;
    }

    if (
      name === 'allow' ||
      name === 'disallow'
    ) {
      if (!currentGroup) {
        currentGroup = {
          userAgents: ['*'],
          rules: [],
          crawlDelay: null,
        };

        groups.push(currentGroup);
      }

      /*
       * Empty Disallow means "disallow nothing", so it does not
       * create a blocking rule.
       *
       * Empty Allow likewise has no useful matching value.
       */
      if (value) {
        currentGroup.rules.push({
          type: name,
          path: value,
          line: lineNumber,
        });
      }

      groupHasRules = true;
      continue;
    }

    if (name === 'crawl-delay') {
      if (!currentGroup) {
        currentGroup = {
          userAgents: ['*'],
          rules: [],
          crawlDelay: null,
        };

        groups.push(currentGroup);
      }

      currentGroup.crawlDelay =
        parseCrawlDelay(value);

      groupHasRules = true;
      continue;
    }

    unknownDirectives.push({
      name,
      value,
      line: lineNumber,
    });
  }

  return {
    groups: groups.filter(
      (group) =>
        group.userAgents.length > 0,
    ),
    sitemaps: [...sitemaps].sort(),
    host,
    unknownDirectives,
  };
}

function robotsPathMatches(
  rulePath: string,
  pathnameWithSearch: string,
): boolean {
  if (!rulePath) {
    return false;
  }

  /*
   * Minimal robots matching foundation:
   * - plain prefix rules
   * - "*" wildcard
   * - optional terminal "$"
   *
   * This is sufficient for the current milestone and can later be
   * expanded if we need crawler-specific RFC/search-engine parity.
   */
  const anchoredEnd = rulePath.endsWith('$');

  const rawPattern = anchoredEnd
    ? rulePath.slice(0, -1)
    : rulePath;

  const escaped = rawPattern
    .split('*')
    .map((segment) =>
      segment.replace(
        /[.*+?^${}()|[\]\\]/g,
        '\\$&',
      ),
    )
    .join('.*');

  const expression = new RegExp(
    `^${escaped}${anchoredEnd ? '$' : ''}`,
  );

  return expression.test(
    pathnameWithSearch,
  );
}

function selectRobotsGroups(
  result: WebsiteSeoRobotsParseResult,
  userAgent: string,
): WebsiteSeoRobotsGroup[] {
  const normalizedAgent =
    userAgent.trim().toLowerCase();

  const specific = result.groups.filter(
    (group) =>
      group.userAgents.some(
        (agent) =>
          agent !== '*' &&
          normalizedAgent.includes(agent),
      ),
  );

  if (specific.length > 0) {
    return specific;
  }

  return result.groups.filter(
    (group) =>
      group.userAgents.includes('*'),
  );
}

export interface WebsiteSeoRobotsAccessResult {
  allowed: boolean;
  matchedRule: WebsiteSeoRobotsRule | null;
  crawlDelay: number | null;
}

export function evaluateWebsiteSeoRobotsAccess(
  result: WebsiteSeoRobotsParseResult,
  url: string | URL,
  userAgent = 'SimplifyConvertWebsiteSeoChecker',
): WebsiteSeoRobotsAccessResult {
  const target =
    url instanceof URL
      ? url
      : new URL(url);

  const pathnameWithSearch =
    `${target.pathname}${target.search}`;

  const groups = selectRobotsGroups(
    result,
    userAgent,
  );

  let matchedRule: WebsiteSeoRobotsRule | null =
    null;

  let matchedLength = -1;

  let crawlDelay: number | null = null;

  for (const group of groups) {
    if (
      crawlDelay === null &&
      group.crawlDelay !== null
    ) {
      crawlDelay = group.crawlDelay;
    }

    for (const rule of group.rules) {
      if (
        !robotsPathMatches(
          rule.path,
          pathnameWithSearch,
        )
      ) {
        continue;
      }

      const effectiveLength =
        rule.path.replace(/\*|\$/g, '').length;

      if (
        effectiveLength > matchedLength ||
        (
          effectiveLength === matchedLength &&
          matchedRule?.type === 'disallow' &&
          rule.type === 'allow'
        )
      ) {
        matchedRule = rule;
        matchedLength = effectiveLength;
      }
    }
  }

  return {
    allowed:
      matchedRule?.type !== 'disallow',
    matchedRule,
    crawlDelay,
  };
}