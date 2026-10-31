"use client";
import { useMemo, useState } from "react";
import type { WebsiteSeoAuditResult } from "@/lib/website-seo/orchestrator";
import { getPageRows, label } from "../utils/report-selectors";
import {
  Badge,
  Collection,
  Details,
  Evidence,
  Panel,
  Select,
  UrlValue,
} from "./ReportPrimitives";
import PageDetails from "./PageDetails";

export default function PagesPanel({
  result,
  initialKind = "all",
}: {
  result: WebsiteSeoAuditResult;
  initialKind?: string;
}) {
  const rows = useMemo(() => getPageRows(result), [result]);
  const [kind, setKind] = useState(initialKind);
  const [indexing, setIndexing] = useState("all");
  const [severity, setSeverity] = useState("all");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState("issues");
  const statuses = [
    ...new Set(
      rows.map((row) => (row.status === null ? "none" : String(row.status))),
    ),
  ].sort();
  const categories = [
    ...new Set(
      result.crawl.pages.flatMap((page) =>
        page.analysis.issues.map((issue) => issue.category),
      ),
    ),
  ].sort();
  return (
    <Panel
      title="Pages & failed attempts"
      description="Explore successful crawl records and failures. ‘Without detected noindex’ does not confirm actual search-engine indexing. Fetch duration is a crawler measurement, not a Core Web Vitals score."
    >
      <Collection
        items={rows}
        name="pages"
        getKey={(row) => row.id}
        matches={(row) =>
          (kind === "all" || row.kind === kind) &&
          (indexing === "all" ||
            (row.noindex !== null &&
              row.noindex === (indexing === "noindex"))) &&
          (status === "all" ||
            (row.status === null ? "none" : String(row.status)) === status) &&
          (severity === "all" ||
            !!row.page?.analysis.issues.some(
              (issue) => issue.severity === severity,
            )) &&
          (category === "all" ||
            !!row.page?.analysis.issues.some(
              (issue) => issue.category === category,
            ))
        }
        compare={(a, b) =>
          (sort === "url"
            ? a.url.localeCompare(b.url)
            : sort === "depth"
              ? b.depth - a.depth
              : sort === "words"
                ? (b.words ?? -1) - (a.words ?? -1)
                : sort === "status"
                  ? (b.status ?? -1) - (a.status ?? -1)
                  : b.total - a.total) || a.id.localeCompare(b.id)
        }
        onClear={() => {
          setKind("all");
          setIndexing("all");
          setStatus("all");
          setSeverity("all");
          setCategory("all");
          setSort("issues");
        }}
        controls={
          <>
            <Select
              label="Crawl outcome"
              value={kind}
              onChange={setKind}
              options={[
                ["all", "All attempts"],
                ["success", "Successful pages"],
                ["failure", "Failed attempts"],
              ]}
            />
            <Select
              label="Noindex directive"
              value={indexing}
              onChange={setIndexing}
              options={[
                ["all", "All directives"],
                ["noindex", "Detected noindex"],
                ["without", "Without detected noindex"],
              ]}
            />
            <Select
              label="HTTP status"
              value={status}
              onChange={setStatus}
              options={[
                ["all", "All statuses"],
                ...statuses.map(
                  (value) =>
                    [
                      value,
                      value === "none" ? "No HTTP status" : `HTTP ${value}`,
                    ] as [string, string],
                ),
              ]}
            />
            <Select
              label="Issue severity"
              value={severity}
              onChange={setSeverity}
              options={["all", "error", "warning", "opportunity"].map(
                (value) => [value, label(value)],
              )}
            />
            <Select
              label="Issue category"
              value={category}
              onChange={setCategory}
              options={[
                ["all", "All categories"],
                ...categories.map(
                  (value) => [value, label(value)] as [string, string],
                ),
              ]}
            />
            <Select
              label="Sort pages"
              value={sort}
              onChange={setSort}
              options={[
                ["issues", "Most issues"],
                ["url", "URL A–Z"],
                ["status", "HTTP status descending"],
                ["depth", "Deepest first"],
                ["words", "Most words"],
              ]}
            />
          </>
        }
        render={(row) => (
          <article className="min-w-0 rounded-xl border border-slate-200 p-4">
            <div className="mb-3 text-sm font-semibold text-slate-900">
              <UrlValue value={row.url} />
            </div>
            <div className="mb-4 flex flex-wrap gap-2">
              <Badge tone={row.kind === "failure" ? "error" : "neutral"}>
                {row.status === null ? "No HTTP status" : `HTTP ${row.status}`}
              </Badge>
              {row.failure ? (
                <Badge tone="error">{row.failure.code}</Badge>
              ) : (
                <Badge>
                  {row.noindex
                    ? "Detected noindex"
                    : "Without detected noindex"}
                </Badge>
              )}
              <Badge>Depth {row.depth}</Badge>
              {row.words !== null && <Badge>{row.words} words</Badge>}
              {row.page && (
                <>
                  <Badge tone="error">
                    {row.page.analysis.summary.errors} errors
                  </Badge>
                  <Badge tone="warning">
                    {row.page.analysis.summary.warnings} warnings
                  </Badge>
                  <Badge tone="opportunity">
                    {row.page.analysis.summary.opportunities} opportunities
                  </Badge>
                </>
              )}
            </div>
            <Details
              title={
                row.failure ? "View failure evidence" : "View page diagnostics"
              }
            >
              {row.page ? (
                <PageDetails page={row.page} />
              ) : (
                <Evidence value={row.failure} />
              )}
            </Details>
          </article>
        )}
      />
    </Panel>
  );
}
