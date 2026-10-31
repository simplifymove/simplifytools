import type { WebsiteSeoAuditResult } from "@/lib/website-seo/orchestrator";
import DiagnosticCollection from "./DiagnosticCollection";
import { Details, Evidence, Panel, UrlList } from "./ReportPrimitives";

export default function SitemapsRobotsPanel({
  result,
}: {
  result: WebsiteSeoAuditResult;
}) {
  const s = result.sitemapComparison,
    d = result.discovery;
  return (
    <div className="space-y-6">
      <Panel
        title="Sitemap & crawl coverage"
        description="Coverage gaps are diagnostic information, not SEO errors by themselves. Crawl limits, robots policy, URL filtering, redirects and fetch failures affect these lists. A URL absent from this report is not necessarily absent from Google."
      >
        <div className="mb-5">
          <Evidence
            value={{
              sitemapUrlCount: s.sitemapUrlCount,
              crawlTruncated: s.crawlTruncated,
              discoveryTruncated: s.discoveryTruncated,
            }}
          />
        </div>
        <div className="space-y-3">
          {[
            ["Sitemap URLs successfully crawled", s.sitemapUrlsCrawled],
            ["Sitemap URLs not successfully crawled", s.sitemapUrlsNotCrawled],
            ["Crawled final URLs in sitemap", s.crawledUrlsInSitemap],
            ["Crawled final URLs not in sitemap", s.crawledUrlsNotInSitemap],
            ["Sitemap-backed orphan candidates", s.sitemapOrphanCandidateUrls],
          ].map(([name, urls]) => (
            <Details
              key={name as string}
              title={`${name} · ${(urls as string[]).length}`}
            >
              <UrlList urls={urls as string[]} name={name as string} />
            </Details>
          ))}
        </div>
      </Panel>
      <Panel
        title="Robots.txt"
        description="Fetch evidence and parsed user-agent groups, allow/disallow rules, crawl delays, sitemap declarations and unknown directives."
      >
        <Details
          title={
            d.robots.found
              ? "View robots.txt diagnostics"
              : "Robots.txt unavailable or not found — view evidence"
          }
        >
          <Evidence value={d.robots} />
        </Details>
      </Panel>
      <DiagnosticCollection
        title="Sitemap documents"
        description="Original requested/final URLs, HTTP status, fetch errors, document type, URL entries and index entries. Expand a document to inspect all parsed data."
        items={d.sitemaps}
        summary={(item) =>
          `${item.status ?? "No status"} · ${item.found ? "Found" : "Unavailable"} · ${item.requestedUrl}`
        }
        sortFields={[
          { key: "URL", value: (item) => item.requestedUrl },
          { key: "status", value: (item) => item.status ?? -1 },
        ]}
      />
      <Panel title="Discovery details">
        <div className="space-y-3">
          <Details title="Discovery scope & limits">
            <Evidence
              value={{
                origin: d.origin,
                maxSitemaps: d.maxSitemaps,
                truncated: d.truncated,
              }}
            />
          </Details>
          <Details title={`Sitemap sources · ${d.sitemapSources.length}`}>
            <UrlList urls={d.sitemapSources} name="sitemap sources" />
          </Details>
          <Details
            title={`Discovered sitemap URLs · ${d.discoveredSitemapUrls.length}`}
          >
            <UrlList
              urls={d.discoveredSitemapUrls}
              name="discovered sitemap URLs"
            />
          </Details>
          <Details
            title={`Discovered page URLs · ${d.discoveredPageUrls.length}`}
          >
            <UrlList urls={d.discoveredPageUrls} name="discovered page URLs" />
          </Details>
        </div>
      </Panel>
    </div>
  );
}
