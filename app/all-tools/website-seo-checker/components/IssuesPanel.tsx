"use client";
import { useState } from "react";
import type { IssueGroup } from "../utils/report-selectors";
import { label, severityOrder } from "../utils/report-selectors";
import { issueGuidance } from "../utils/issue-guidance";
import {
  Badge,
  Collection,
  Details,
  Evidence,
  Panel,
  Select,
} from "./ReportPrimitives";

export default function IssuesPanel({
  groups,
  initialSeverity = "all",
}: {
  groups: IssueGroup[];
  initialSeverity?: string;
}) {
  const [severity, setSeverity] = useState(initialSeverity);
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("priority");
  const categories = [...new Set(groups.map((group) => group.category))].sort();
  return (
    <Panel
      title="Prioritized SEO issues"
      description="Original page-level findings, grouped by code. Occurrences and unique affected pages are different counts. Site diagnostics appear in their dedicated tabs and are not added to the engine’s SEO issue total."
    >
      <Collection
        items={groups}
        name="issues"
        getKey={(group) => group.id}
        matches={(group) =>
          (severity === "all" || group.severity === severity) &&
          (category === "all" || group.category === category)
        }
        compare={(a, b) =>
          (sort === "code"
            ? a.code.localeCompare(b.code)
            : sort === "pages"
              ? b.affectedPages - a.affectedPages
              : severityOrder[a.severity] - severityOrder[b.severity] ||
                b.affectedPages - a.affectedPages) ||
          a.code.localeCompare(b.code)
        }
        onClear={() => {
          setSeverity("all");
          setCategory("all");
          setSort("priority");
        }}
        controls={
          <>
            <Select
              label="Severity"
              value={severity}
              onChange={setSeverity}
              options={["all", "error", "warning", "opportunity"].map(
                (value) => [value, label(value)],
              )}
            />
            <Select
              label="Category"
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
              label="Sort issues"
              value={sort}
              onChange={setSort}
              options={[
                ["priority", "Severity, then affected pages"],
                ["pages", "Most affected pages"],
                ["code", "Issue code A–Z"],
              ]}
            />
          </>
        }
        render={(group) => (
          <Details
            title={
              <span className="flex flex-wrap items-center gap-2">
                <Badge tone={group.severity}>{label(group.severity)}</Badge>
                <span>{label(group.code)}</span>
                <span className="font-normal text-slate-500">
                  {group.affectedPages} pages · {group.occurrences} occurrences
                </span>
              </span>
            }
          >
            <p className="mb-2 font-mono text-xs text-slate-500">
              {group.code} · {group.category}
            </p>
            <p className="mb-4 rounded-lg bg-orange-50 p-3 leading-6 text-orange-900">
              {issueGuidance(group.category)}
            </p>
            <Collection
              items={group.evidence}
              name="affected URLs"
              getKey={(entry, index) => `${entry.requestedUrl}:${index}`}
              render={(entry) => (
                <div className="rounded-lg bg-slate-50 p-4">
                  <Evidence value={entry} />
                </div>
              )}
            />
          </Details>
        )}
      />
    </Panel>
  );
}
