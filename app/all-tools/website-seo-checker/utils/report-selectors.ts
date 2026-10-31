import type { WebsiteSeoAuditResult } from "@/lib/website-seo/orchestrator";
import type { WebsiteSeoIssue } from "@/lib/website-seo/issue-engine";

export interface IssueGroup {
  id: string;
  code: string;
  category: string;
  severity: WebsiteSeoIssue["severity"];
  occurrences: number;
  affectedPages: number;
  evidence: Array<{
    requestedUrl: string;
    url: string;
    issue: WebsiteSeoIssue;
  }>;
}

export const severityOrder = { error: 0, warning: 1, opportunity: 2 };

/** Presentation only: never replace the engine's issue totals or severity. */
export function groupIssues(result: WebsiteSeoAuditResult): IssueGroup[] {
  const groups = new Map<string, IssueGroup>();
  for (const page of result.crawl.pages) {
    for (const issue of page.analysis.issues) {
      const id = `${issue.code}:${issue.severity}:${issue.category}`;
      const group = groups.get(id) ?? {
        id,
        code: issue.code,
        category: issue.category,
        severity: issue.severity,
        occurrences: 0,
        affectedPages: 0,
        evidence: [],
      };
      group.evidence.push({
        requestedUrl: page.requestedUrl,
        url: page.finalUrl,
        issue,
      });
      group.occurrences++;
      groups.set(id, group);
    }
  }
  return [...groups.values()]
    .map((group) => ({
      ...group,
      affectedPages: new Set(group.evidence.map((entry) => entry.url)).size,
    }))
    .sort(
      (a, b) =>
        severityOrder[a.severity] - severityOrder[b.severity] ||
        b.affectedPages - a.affectedPages ||
        a.code.localeCompare(b.code),
    );
}

export function getPageRows(result: WebsiteSeoAuditResult) {
  return [
    ...result.crawl.pages.map((page, index) => ({
      id: `page:${index}:${page.requestedUrl}`,
      url: page.finalUrl,
      requestedUrl: page.requestedUrl,
      kind: "success" as const,
      status: page.status,
      depth: page.depth,
      words: page.extraction.wordCount,
      total: page.analysis.summary.total,
      noindex: [...page.extraction.robots, ...page.extraction.googlebot].some(
        (value) => value.toLowerCase() === "noindex",
      ),
      page,
      failure: null,
    })),
    ...result.crawl.failures.map((failure, index) => ({
      id: `failure:${index}:${failure.url}`,
      url: failure.url,
      requestedUrl: failure.url,
      kind: "failure" as const,
      status: failure.status,
      depth: failure.depth,
      words: null,
      total: 0,
      noindex: null,
      page: null,
      failure,
    })),
  ];
}

export function searchText(value: unknown): string {
  return (JSON.stringify(value) ?? "").toLowerCase();
}

export function selectCollection<T>(
  items: readonly T[],
  query: string,
  matches: (item: T) => boolean,
  compare: (a: T, b: T) => number,
  getSearch: (item: T) => string = searchText,
): T[] {
  const term = query.trim().toLowerCase();
  return items
    .filter(
      (item) =>
        matches(item) &&
        (!term || getSearch(item).toLowerCase().includes(term)),
    )
    .sort(compare);
}

export function label(value: string): string {
  const text = value === value.toUpperCase() ? value.toLowerCase() : value;
  return text
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[-_]/g, " ")
    .replace(/^./, (char) => char.toUpperCase());
}
