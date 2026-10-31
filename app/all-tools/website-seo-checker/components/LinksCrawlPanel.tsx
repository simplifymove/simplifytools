import type { WebsiteSeoAuditResult } from "@/lib/website-seo/orchestrator";
import DiagnosticCollection from "./DiagnosticCollection";
import { Details, Panel, UrlList } from "./ReportPrimitives";

export default function LinksCrawlPanel({
  result,
}: {
  result: WebsiteSeoAuditResult;
}) {
  const a = result.analysis;
  return (
    <div className="space-y-6">
      <DiagnosticCollection
        title="Broken internal links"
        description="Retains HTTP statuses, failure codes and every referring page. Verify temporary network failures before changing links. Correct incorrect links, restore missing pages where appropriate, or redirect outdated URLs to relevant working pages."
        items={a.brokenInternalLinks}
        summary={(link) =>
          `${link.status === null ? "No HTTP status" : `HTTP ${link.status}`} · ${link.linkedFrom.length} referring pages · ${link.url}`
        }
        sortFields={[
          { key: "URL", value: (link) => link.url },
          { key: "referring pages", value: (link) => link.linkedFrom.length },
          { key: "status", value: (link) => link.status ?? -1 },
        ]}
      />
      <DiagnosticCollection
        title="Redirect diagnostics"
        description="Successful redirecting URLs with their final destinations, complete ordered redirect chains, hop counts and referring pages. Redirects can be intentional."
        items={a.redirects}
        summary={(redirect) =>
          `${redirect.redirectCount} redirects · ${redirect.requestedUrl} → ${redirect.finalUrl}`
        }
        sortFields={[
          {
            key: "redirect count",
            value: (redirect) => redirect.redirectCount,
          },
          { key: "URL", value: (redirect) => redirect.requestedUrl },
        ]}
      />
      <DiagnosticCollection
        title="HTTP status groups"
        items={a.statusGroups}
        summary={(group) => `HTTP ${group.status} · ${group.count} URLs`}
        sortFields={[
          { key: "status", value: (group) => group.status },
          { key: "count", value: (group) => group.count },
        ]}
      />
      <DiagnosticCollection
        title="Crawl depth"
        items={a.depthGroups}
        summary={(group) => `Depth ${group.depth} · ${group.count} URLs`}
        sortFields={[
          { key: "depth", value: (group) => group.depth },
          { key: "count", value: (group) => group.count },
        ]}
      />
      <DiagnosticCollection
        title="Inbound internal links"
        description="Counts reflect links from other successfully crawled pages. Expand to see every referring URL. An incomplete crawl cannot establish the absence of all internal links."
        items={a.inboundInternalLinks}
        summary={(item) => `${item.inboundLinks} inbound links · ${item.url}`}
        sortFields={[
          { key: "inbound links", value: (item) => item.inboundLinks },
          { key: "URL", value: (item) => item.url },
        ]}
      />
      <Panel
        title="Orphan candidates"
        description="Candidates are successfully crawled pages with zero inbound internal links from other crawled pages, excluding the entered start URL. The sitemap-backed set also appears in the discovered sitemap. Partial crawling cannot prove a page is orphaned."
      >
        <div className="space-y-3">
          <Details
            title={`Sitemap-backed candidates · ${result.sitemapComparison.sitemapOrphanCandidateUrls.length}`}
          >
            <UrlList
              urls={result.sitemapComparison.sitemapOrphanCandidateUrls}
              name="sitemap-backed orphan candidates"
            />
          </Details>
          <Details
            title={`Crawl-derived candidates · ${a.orphanCandidateUrls.length}`}
          >
            <UrlList
              urls={a.orphanCandidateUrls}
              name="crawl-derived orphan candidates"
            />
          </Details>
        </div>
      </Panel>
    </div>
  );
}
