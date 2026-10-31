"use client";
import { useState } from "react";
import type { WebsiteSeoAuditResult } from "@/lib/website-seo/orchestrator";
import { Details, Evidence, Panel, Select, UrlList } from "./ReportPrimitives";
import DiagnosticCollection from "./DiagnosticCollection";

export default function MetadataContentPanel({
  result,
}: {
  result: WebsiteSeoAuditResult;
}) {
  const a = result.analysis;
  const [scope, setScope] = useState("actionable");
  const [type, setType] = useState("titles");
  const duplicates =
    scope === "actionable"
      ? {
          titles: a.duplicateTitles,
          descriptions: a.duplicateMetaDescriptions,
          h1: a.duplicateH1,
        }
      : {
          titles: a.allPageDuplicateTitles,
          descriptions: a.allPageDuplicateMetaDescriptions,
          h1: a.allPageDuplicateH1,
        };
  const groups = duplicates[type as keyof typeof duplicates];
  return (
    <div className="space-y-6">
      <Panel
        title="Missing metadata"
        description="These lists retain the original analysis across successfully crawled pages. Review page purpose and indexing directives before changing metadata."
      >
        <div className="space-y-3">
          {[
            ["Missing titles", a.missingTitleUrls],
            ["Missing meta descriptions", a.missingMetaDescriptionUrls],
            ["Missing H1 headings", a.missingH1Urls],
            ["Missing canonicals", a.missingCanonicalUrls],
          ].map(([title, urls]) => (
            <Details
              key={title as string}
              title={`${title} · ${(urls as string[]).length} URLs`}
            >
              <UrlList urls={urls as string[]} name={title as string} />
            </Details>
          ))}
        </div>
      </Panel>
      <Panel
        title="Duplicate metadata scope"
        description="Actionable groups contain pages without detected noindex. All-page diagnostics also retain duplicates on noindex utility or authentication pages. A duplicate group is not added to the page-level issue total."
      >
        <div className="flex flex-wrap gap-3">
          <Select
            label="Duplicate scope"
            value={scope}
            onChange={setScope}
            options={[
              ["actionable", "Actionable: indexable pages"],
              ["all", "Diagnostic: all pages"],
            ]}
          />
          <Select
            label="Metadata type"
            value={type}
            onChange={setType}
            options={[
              ["titles", "Titles"],
              ["descriptions", "Meta descriptions"],
              ["h1", "H1 headings"],
            ]}
          />
        </div>
      </Panel>
      <DiagnosticCollection
        key={`${scope}:${type}`}
        title="Duplicate groups"
        items={groups}
        summary={(group) => `${group.count} pages · ${group.value}`}
        sortFields={[
          { key: "pages", value: (group) => group.count },
          { key: "value", value: (group) => group.value },
        ]}
      />
      <DiagnosticCollection
        title="Canonical relationships"
        items={a.canonicalRelationships}
        summary={(item) =>
          `${item.selfCanonical ? "Self canonical" : "Different canonical target"} · ${item.url}`
        }
        sortFields={[
          { key: "URL", value: (item) => item.url },
          { key: "canonical", value: (item) => item.canonical },
        ]}
      />
      <Panel
        title="Content, images & structured data"
        description="Word counts and missing alternative text are diagnostic signals. JSON-LD validity here means JSON syntax validity, not schema validation."
      >
        <Evidence
          value={{
            totalWords: a.totalWords,
            averageWordCount: a.averageWordCount,
            minimumWordCount: a.minimumWordCount,
            maximumWordCount: a.maximumWordCount,
            totalImages: a.totalImages,
            imagesMissingAlt: a.imagesMissingAlt,
            structuredDataBlocks: a.structuredDataBlocks,
            invalidStructuredDataBlocks: a.invalidStructuredDataBlocks,
          }}
        />
        <div className="mt-4">
          <Details title="Pages with invalid JSON-LD">
            <UrlList
              urls={result.crawl.pages
                .filter((page) =>
                  page.extraction.structuredData.some(
                    (block) => !block.validJson,
                  ),
                )
                .map((page) => page.finalUrl)}
              name="invalid JSON-LD pages"
            />
          </Details>
        </div>
      </Panel>
      <DiagnosticCollection
        title="Near-duplicate candidate groups"
        description="85%+ similarity candidates, not automatic SEO errors. Connected groups contain one or more qualifying relationships; the minimum similarity is retained in each group’s evidence. Review page purpose, search intent, canonical strategy and unique value. Do not automatically delete, merge or rewrite pages."
        items={a.nearDuplicateCandidateGroups}
        summary={(group) =>
          `${group.urls.length} pages · Minimum similarity ${(group.minimumSimilarity * 100).toFixed(1)}%`
        }
        sortFields={[
          { key: "pages", value: (group) => group.urls.length },
          { key: "similarity", value: (group) => group.minimumSimilarity },
        ]}
      />
      <DiagnosticCollection
        title="Similar page pairs"
        description="Similarity uses normalized visible page content among eligible indexable pages. Expand to see both complete URLs and the original similarity value."
        items={a.nearDuplicatePairs}
        summary={(pair) =>
          `${(pair.similarity * 100).toFixed(1)}% similarity · ${pair.urlA} ↔ ${pair.urlB}`
        }
        sortFields={[
          { key: "similarity", value: (pair) => pair.similarity },
          { key: "URL", value: (pair) => pair.urlA },
        ]}
      />
    </div>
  );
}
