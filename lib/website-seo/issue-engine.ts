import type { WebsiteSeoHtmlExtraction } from './html-extractor';

export type WebsiteSeoIssueSeverity =
  | 'error'
  | 'warning'
  | 'opportunity';

export type WebsiteSeoIssueCategory =
  | 'indexability'
  | 'title'
  | 'meta-description'
  | 'headings'
  | 'canonical'
  | 'content'
  | 'links'
  | 'images'
  | 'structured-data'
  | 'mobile'
  | 'social';

export interface WebsiteSeoIssue {
  code: string;
  severity: WebsiteSeoIssueSeverity;
  category: WebsiteSeoIssueCategory;
  message: string;
  value?: string | number;
}

export interface WebsiteSeoIssueSummary {
  errors: number;
  warnings: number;
  opportunities: number;
  total: number;
}

export interface WebsiteSeoIssueAnalysis {
  issues: WebsiteSeoIssue[];
  summary: WebsiteSeoIssueSummary;
}

function addIssue(
  issues: WebsiteSeoIssue[],
  issue: WebsiteSeoIssue,
): void {
  issues.push(issue);
}

function hasDirective(
  directives: string[],
  directive: string,
): boolean {
  const target = directive.toLowerCase();

  return directives.some(
    (value) => value.toLowerCase() === target,
  );
}

export function analyzeWebsiteSeoIssues(
  page: WebsiteSeoHtmlExtraction,
): WebsiteSeoIssueAnalysis {
  const issues: WebsiteSeoIssue[] = [];

  /*
   * INDEXABILITY
   */

  if (
    hasDirective(page.robots, 'noindex') ||
    hasDirective(page.googlebot, 'noindex')
  ) {
    addIssue(issues, {
      code: 'NOINDEX',
      severity: 'error',
      category: 'indexability',
      message:
        'Page contains a noindex directive and may not be indexed by search engines.',
    });
  }

  if (
    hasDirective(page.robots, 'nofollow') ||
    hasDirective(page.googlebot, 'nofollow')
  ) {
    addIssue(issues, {
      code: 'NOFOLLOW_PAGE',
      severity: 'warning',
      category: 'indexability',
      message:
        'Page contains a nofollow directive for page links.',
    });
  }

  /*
   * TITLE
   */

  if (!page.title) {
    addIssue(issues, {
      code: 'TITLE_MISSING',
      severity: 'error',
      category: 'title',
      message: 'Page is missing a title element.',
    });
  } else {
    if (page.titleLength < 30) {
      addIssue(issues, {
        code: 'TITLE_SHORT',
        severity: 'warning',
        category: 'title',
        message:
          'Page title is shorter than the recommended range.',
        value: page.titleLength,
      });
    }

    if (page.titleLength > 60) {
      addIssue(issues, {
        code: 'TITLE_LONG',
        severity: 'warning',
        category: 'title',
        message:
          'Page title is longer than the recommended range.',
        value: page.titleLength,
      });
    }
  }

  /*
   * META DESCRIPTION
   */

  if (!page.metaDescription) {
    addIssue(issues, {
      code: 'META_DESCRIPTION_MISSING',
      severity: 'warning',
      category: 'meta-description',
      message: 'Page is missing a meta description.',
    });
  } else {
    if (page.metaDescriptionLength < 70) {
      addIssue(issues, {
        code: 'META_DESCRIPTION_SHORT',
        severity: 'opportunity',
        category: 'meta-description',
        message:
          'Meta description is relatively short.',
        value: page.metaDescriptionLength,
      });
    }

    if (page.metaDescriptionLength > 160) {
      addIssue(issues, {
        code: 'META_DESCRIPTION_LONG',
        severity: 'warning',
        category: 'meta-description',
        message:
          'Meta description is longer than the recommended range.',
        value: page.metaDescriptionLength,
      });
    }
  }

  /*
   * HEADINGS
   */

  if (page.h1.length === 0) {
    addIssue(issues, {
      code: 'H1_MISSING',
      severity: 'error',
      category: 'headings',
      message: 'Page does not contain an H1 heading.',
    });
  }

  if (page.h1.length > 1) {
    addIssue(issues, {
      code: 'MULTIPLE_H1',
      severity: 'warning',
      category: 'headings',
      message: 'Page contains multiple H1 headings.',
      value: page.h1.length,
    });
  }

  /*
   * CANONICAL
   */

  if (!page.canonical) {
    addIssue(issues, {
      code: 'CANONICAL_MISSING',
      severity: 'warning',
      category: 'canonical',
      message: 'Page does not declare a canonical URL.',
    });
  }

  /*
   * CONTENT
   */

  if (page.wordCount < 100) {
    addIssue(issues, {
      code: 'VERY_LOW_CONTENT',
      severity: 'warning',
      category: 'content',
      message:
        'Page contains very little indexable text content.',
      value: page.wordCount,
    });
  } else if (page.wordCount < 300) {
    addIssue(issues, {
      code: 'LOW_CONTENT',
      severity: 'opportunity',
      category: 'content',
      message:
        'Page contains relatively little indexable text content.',
      value: page.wordCount,
    });
  }

  /*
   * LINKS
   */

  if (page.internalLinks.length === 0) {
    addIssue(issues, {
      code: 'NO_INTERNAL_LINKS',
      severity: 'warning',
      category: 'links',
      message:
        'Page contains no crawlable internal links.',
    });
  }

  /*
   * IMAGES
   */

  if (page.imagesMissingAlt > 0) {
    addIssue(issues, {
      code: 'IMAGES_MISSING_ALT',
      severity: 'warning',
      category: 'images',
      message:
        'One or more images are missing an alt attribute.',
      value: page.imagesMissingAlt,
    });
  }

  /*
   * STRUCTURED DATA
   */

  const invalidStructuredData =
    page.structuredData.filter(
      (item) => !item.validJson,
    ).length;

  if (invalidStructuredData > 0) {
    addIssue(issues, {
      code: 'INVALID_JSON_LD',
      severity: 'warning',
      category: 'structured-data',
      message:
        'One or more JSON-LD blocks contain invalid JSON.',
      value: invalidStructuredData,
    });
  }

  /*
   * MOBILE
   */

  if (!page.viewport) {
    addIssue(issues, {
      code: 'VIEWPORT_MISSING',
      severity: 'warning',
      category: 'mobile',
      message:
        'Page is missing a viewport meta tag.',
    });
  }

  /*
   * SOCIAL METADATA
   */

  if (!page.openGraph.title) {
    addIssue(issues, {
      code: 'OG_TITLE_MISSING',
      severity: 'opportunity',
      category: 'social',
      message: 'Open Graph title is missing.',
    });
  }

  if (!page.openGraph.description) {
    addIssue(issues, {
      code: 'OG_DESCRIPTION_MISSING',
      severity: 'opportunity',
      category: 'social',
      message: 'Open Graph description is missing.',
    });
  }

  if (!page.openGraph.image) {
    addIssue(issues, {
      code: 'OG_IMAGE_MISSING',
      severity: 'opportunity',
      category: 'social',
      message: 'Open Graph image is missing.',
    });
  }

  const summary: WebsiteSeoIssueSummary = {
    errors: issues.filter(
      (issue) => issue.severity === 'error',
    ).length,

    warnings: issues.filter(
      (issue) => issue.severity === 'warning',
    ).length,

    opportunities: issues.filter(
      (issue) => issue.severity === 'opportunity',
    ).length,

    total: issues.length,
  };

  return {
    issues,
    summary,
  };
}
