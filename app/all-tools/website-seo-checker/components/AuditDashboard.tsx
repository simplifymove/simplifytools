"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { AlertTriangle, CheckCircle2, ArrowUpRight } from "lucide-react";
import type { WebsiteSeoAuditResult } from "@/lib/website-seo/orchestrator";
import { groupIssues } from "../utils/report-selectors";
import OverviewPanel, { type ReportTab } from "./OverviewPanel";
import IssuesPanel from "./IssuesPanel";
import PagesPanel from "./PagesPanel";
import MetadataContentPanel from "./MetadataContentPanel";
import LinksCrawlPanel from "./LinksCrawlPanel";
import SitemapsRobotsPanel from "./SitemapsRobotsPanel";
import { Select, UrlValue } from "./ReportPrimitives";

const tabs: Array<[ReportTab, string]> = [
  ["overview", "Overview"],
  ["issues", "Issues"],
  ["pages", "Pages"],
  ["metadata", "Metadata & Content"],
  ["links", "Links & Crawl"],
  ["sitemaps", "Sitemaps & Robots"],
];

export default function AuditDashboard({
  result,
}: {
  result: WebsiteSeoAuditResult;
}) {
  const [active, setActive] = useState<ReportTab>("overview");
  const [visited, setVisited] = useState<ReportTab[]>(["overview"]);
  const [issueFilter, setIssueFilter] = useState("all");
  const [pageFilter, setPageFilter] = useState("all");
  const [issueVisit, setIssueVisit] = useState(0);
  const [pageVisit, setPageVisit] = useState(0);
  const heading = useRef<HTMLHeadingElement>(null);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const groups = useMemo(() => groupIssues(result), [result]);
  useEffect(() => {
    heading.current?.focus({ preventScroll: true });
    heading.current?.scrollIntoView({ block: "start" });
  }, []);
  function navigate(tab: ReportTab, filter?: string) {
    if (filter !== undefined && tab === "issues") {
      setIssueFilter(filter);
      setIssueVisit((value) => value + 1);
    }
    if (filter !== undefined && tab === "pages") {
      setPageFilter(filter);
      setPageVisit((value) => value + 1);
    }
    setActive(tab);
    setVisited((current) =>
      current.includes(tab) ? current : [...current, tab],
    );
  }
  return (
    <section
      aria-labelledby="website-seo-audit-summary"
      className="border-b border-slate-200 bg-slate-50"
    >
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex min-w-0 flex-col justify-between gap-4 sm:flex-row">
          <div className="min-w-0">
            <h2
              ref={heading}
              tabIndex={-1}
              id="website-seo-audit-summary"
              className="flex scroll-mt-28 items-center gap-2 text-2xl font-bold tracking-tight text-slate-950 focus-visible:outline-2 focus-visible:outline-orange-600"
            >
              <CheckCircle2
                aria-hidden="true"
                className="h-6 w-6 shrink-0 text-orange-600"
              />
              SEO audit completed
            </h2>
            <div className="mt-2 max-w-3xl text-sm text-slate-600">
              <UrlValue value={result.crawl.startUrl} />
            </div>
          </div>
          <p className="shrink-0 text-sm text-slate-500">
            {result.crawl.crawledUrls} pages checked ·{" "}
            {(result.crawl.durationMs / 1000).toFixed(1)}s crawl
          </p>
        </div>
        {(result.crawl.truncated ||
          result.discovery.truncated ||
          result.sitemapComparison.crawlTruncated ||
          result.sitemapComparison.discoveryTruncated) && (
          <div
            role="status"
            className="mb-6 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900"
          >
            <AlertTriangle
              aria-hidden="true"
              className="mt-1 h-5 w-5 shrink-0"
            />
            <div>
              <p className="font-semibold">
                Partial coverage —{" "}
                {result.crawl.truncated ||
                result.sitemapComparison.crawlTruncated
                  ? "crawl limit reached"
                  : "sitemap discovery limit reached"}
              </p>
              <p>
                Crawl or discovery limits were reached. Coverage gaps, inbound
                links and orphan candidates reflect only this limited audit.
              </p>
            </div>
          </div>
        )}
        <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[
            ["Pages crawled", result.crawl.crawledUrls, "pages", "success"],
            ["Crawl failures", result.crawl.failedUrls, "pages", "failure"],
            ["SEO issues", result.analysis.issueSummary.total, "issues", "all"],
            [
              "Sitemap URLs",
              result.sitemapComparison.sitemapUrlCount,
              "sitemaps",
              undefined,
            ],
          ].map(([title, count, tab, filter]) => (
            <button
              type="button"
              key={title}
              onClick={() =>
                navigate(tab as ReportTab, filter as string | undefined)
              }
              className="min-w-0 rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm hover:border-orange-300 hover:bg-orange-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600 sm:p-5"
            >
              <span className="flex items-start justify-between gap-1 text-sm text-slate-600">
                {title}
                <ArrowUpRight
                  aria-hidden="true"
                  className="h-4 w-4 shrink-0 text-orange-600"
                />
              </span>
              <span className="mt-2 block text-3xl font-bold tracking-tight text-slate-950">
                {count}
              </span>
            </button>
          ))}
        </div>
        <div className="mb-6 rounded-xl border border-slate-200 bg-white p-2">
          <div className="p-2 md:hidden">
            <Select
              label="Report section"
              value={active}
              onChange={(value) => navigate(value as ReportTab)}
              options={tabs}
            />
          </div>
          <div
            role="tablist"
            aria-label="SEO report sections"
            className="hidden flex-wrap gap-1 md:flex"
          >
            {tabs.map(([id, title], index) => (
              <button
                key={id}
                ref={(element) => {
                  tabRefs.current[index] = element;
                }}
                type="button"
                role="tab"
                id={`seo-tab-${id}`}
                aria-controls={`seo-panel-${id}`}
                aria-selected={active === id}
                tabIndex={active === id ? 0 : -1}
                onClick={() => navigate(id)}
                onKeyDown={(event) => {
                  let next = index;
                  if (event.key === "ArrowRight")
                    next = (index + 1) % tabs.length;
                  else if (event.key === "ArrowLeft")
                    next = (index + tabs.length - 1) % tabs.length;
                  else if (event.key === "Home") next = 0;
                  else if (event.key === "End") next = tabs.length - 1;
                  else return;
                  event.preventDefault();
                  navigate(tabs[next][0]);
                  tabRefs.current[next]?.focus();
                }}
                className={`min-h-11 rounded-lg px-4 py-3 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600 ${active === id ? "bg-orange-600 text-white shadow-sm" : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"}`}
              >
                {title}
              </button>
            ))}
          </div>
        </div>
        {tabs.map(([id, title]) => (
          <div
            key={id}
            role="tabpanel"
            id={`seo-panel-${id}`}
            aria-label={title}
            tabIndex={0}
            hidden={active !== id}
            className="min-w-0 rounded-xl focus-visible:outline-2 focus-visible:outline-orange-600"
          >
            {visited.includes(id) && (
              <>
                {id === "overview" && (
                  <OverviewPanel
                    result={result}
                    groups={groups}
                    navigate={navigate}
                  />
                )}
                {id === "issues" && (
                  <IssuesPanel
                    key={`${issueFilter}:${issueVisit}`}
                    groups={groups}
                    initialSeverity={issueFilter}
                  />
                )}
                {id === "pages" && (
                  <PagesPanel
                    key={`${pageFilter}:${pageVisit}`}
                    result={result}
                    initialKind={pageFilter}
                  />
                )}
                {id === "metadata" && <MetadataContentPanel result={result} />}
                {id === "links" && <LinksCrawlPanel result={result} />}
                {id === "sitemaps" && <SitemapsRobotsPanel result={result} />}
              </>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
