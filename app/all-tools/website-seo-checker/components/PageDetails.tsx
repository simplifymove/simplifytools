import type { WebsiteSeoCrawlPage } from "@/lib/website-seo/crawler";
import { Details, Evidence } from "./ReportPrimitives";

export default function PageDetails({ page }: { page: WebsiteSeoCrawlPage }) {
  const { extraction: e, analysis, ...fetch } = page;
  const sections: Array<[string, unknown]> = [
    ["Fetch & crawl information", fetch],
    ["Original SEO issues & counts", analysis],
    [
      "Metadata & indexing directives",
      {
        url: e.url,
        title: e.title,
        titleLength: e.titleLength,
        metaDescription: e.metaDescription,
        metaDescriptionLength: e.metaDescriptionLength,
        metaKeywords: e.metaKeywords,
        canonical: e.canonical,
        robots: e.robots,
        googlebot: e.googlebot,
      },
    ],
    [
      "Complete heading hierarchy",
      {
        headings: e.headings,
        h1: e.h1,
        h2: e.h2,
        h3: e.h3,
        h4: e.h4,
        h5: e.h5,
        h6: e.h6,
      },
    ],
    [
      "Internal, external & all links",
      {
        internalLinks: e.internalLinks,
        externalLinks: e.externalLinks,
        links: e.links,
      },
    ],
    [
      "Images & alternative text",
      { imagesMissingAlt: e.imagesMissingAlt, images: e.images },
    ],
    ["Structured data (JSON syntax only)", e.structuredData],
    [
      "Mobile, language, social & pagination",
      {
        viewport: e.viewport,
        htmlLanguage: e.htmlLanguage,
        hreflang: e.hreflang,
        openGraph: e.openGraph,
        twitter: e.twitter,
        pagination: e.pagination,
      },
    ],
    [
      "Content & advanced extraction evidence",
      { wordCount: e.wordCount, contentFingerprint: e.contentFingerprint },
    ],
    ["Complete page record", page],
  ];
  return (
    <div className="space-y-3">
      {sections.map(([title, value]) => (
        <Details key={title} title={title}>
          <Evidence value={value} />
        </Details>
      ))}
    </div>
  );
}
