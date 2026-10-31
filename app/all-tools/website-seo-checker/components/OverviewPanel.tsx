import type { WebsiteSeoAuditResult } from "@/lib/website-seo/orchestrator";
import type { IssueGroup } from "../utils/report-selectors";
import { label } from "../utils/report-selectors";
import {
  Badge,
  buttonClass,
  Details,
  Evidence,
  Panel,
  UrlList,
} from "./ReportPrimitives";

export type ReportTab =
  | "overview"
  | "issues"
  | "pages"
  | "metadata"
  | "links"
  | "sitemaps";
export default function OverviewPanel({
  result,
  groups,
  navigate,
}: {
  result: WebsiteSeoAuditResult;
  groups: IssueGroup[];
  navigate: (tab: ReportTab, filter?: string) => void;
}) {
  const a = result.analysis;
  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel
          title="Issue severity"
          description="Existing engine totals across crawled pages. Select a severity to investigate its original findings."
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {[
              ["error", "Errors", a.issueSummary.errors],
              ["warning", "Warnings", a.issueSummary.warnings],
              ["opportunity", "Opportunities", a.issueSummary.opportunities],
            ].map(([severity, title, count]) => (
              <button
                key={severity}
                type="button"
                className={`${buttonClass} text-left`}
                onClick={() => navigate("issues", severity as string)}
              >
                <Badge tone={severity as string}>{title}</Badge>
                <span className="mt-3 block text-2xl font-bold">{count}</span>
              </button>
            ))}
          </div>
        </Panel>
        <Panel
          title="Indexing directives"
          description="Detected directives are not a confirmation of Google indexing. Review whether noindex is intentional."
        >
          <div className="space-y-3">
            <Details
              title={`Without detected noindex · ${a.indexableUrls.length} URLs`}
            >
              <UrlList urls={a.indexableUrls} name="without detected noindex" />
            </Details>
            <Details
              title={`With detected noindex · ${a.nonIndexableUrls.length} URLs`}
            >
              <UrlList urls={a.nonIndexableUrls} name="with detected noindex" />
            </Details>
          </div>
        </Panel>
      </div>
      <Panel
        title="Where to start"
        description="Findings are ordered by existing severity and affected-page count. Verify intent and evidence before making changes."
      >
        <div className="space-y-3">
          {groups.slice(0, 5).map((group) => (
            <button
              type="button"
              key={group.id}
              onClick={() => navigate("issues", group.severity)}
              className="flex w-full flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 p-4 text-left text-sm hover:border-orange-300 hover:bg-orange-50 focus-visible:outline-2 focus-visible:outline-orange-600"
            >
              <span className="flex flex-wrap items-center gap-2">
                <Badge tone={group.severity}>{label(group.severity)}</Badge>
                <span className="font-semibold">{label(group.code)}</span>
              </span>
              <span className="text-slate-600">
                {group.affectedPages} affected pages →
              </span>
            </button>
          ))}
          {!groups.length && (
            <p className="text-sm text-slate-600">
              No page-level SEO findings were returned. Review crawl coverage
              and diagnostics before drawing conclusions.
            </p>
          )}
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            className={buttonClass}
            onClick={() => navigate("links")}
          >
            Review broken links & redirects
          </button>
          <button
            type="button"
            className={buttonClass}
            onClick={() => navigate("issues", "all")}
          >
            View all issues
          </button>
        </div>
      </Panel>
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Content, images & structured data">
          <dl className="grid grid-cols-2 gap-4">
            {[
              ["Average words", Math.round(a.averageWordCount)],
              ["Images", a.totalImages],
              ["Missing alt", a.imagesMissingAlt],
              ["JSON-LD blocks", a.structuredDataBlocks],
              ["Invalid JSON-LD", a.invalidStructuredDataBlocks],
            ].map(([title, value]) => (
              <div key={title}>
                <dt className="text-sm text-slate-500">{title}</dt>
                <dd className="mt-1 text-xl font-bold text-slate-900">
                  {value}
                </dd>
              </div>
            ))}
          </dl>
          <button
            type="button"
            className={`${buttonClass} mt-5`}
            onClick={() => navigate("metadata")}
          >
            Review metadata & content
          </button>
        </Panel>
        <Panel title="Crawl scope">
          <Evidence
            value={{
              startUrl: result.crawl.startUrl,
              discoveredUrls: result.crawl.discoveredUrls,
              maxPages: result.crawl.maxPages,
              durationMs: result.crawl.durationMs,
              crawlTruncated: result.crawl.truncated,
              discoveryTruncated: result.discovery.truncated,
            }}
          />
        </Panel>
      </div>
      <Panel
        title="Advanced report evidence"
        description="Complete original analysis and comparison records are retained here, including per-page totals. Searchable arrays are paginated without discarding entries."
      >
        <div className="space-y-3">
          <Details title="Complete site analysis">
            <Evidence value={a} />
          </Details>
          <Details title="Complete sitemap comparison">
            <Evidence value={result.sitemapComparison} />
          </Details>
        </div>
      </Panel>
    </div>
  );
}
