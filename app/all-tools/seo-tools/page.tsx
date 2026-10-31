import Link from 'next/link';
import type { Metadata } from 'next';
import { HomeHeader } from '@/app/components/HomeHeader';
import { Footer } from '@/app/components/Footer';

export const metadata: Metadata = {
  title: 'SEO Tools - Website SEO Checker | SimplifyConvert',
  description:
    'Check website metadata, canonical URLs, crawlability, robots.txt, sitemaps, and internal links. Learn how to interpret technical SEO findings.',
  alternates: {
    canonical: 'https://simplifyconvert.com/all-tools/seo-tools',
  },
};

const checks = [
  {
    title: 'Page titles and descriptions',
    description:
      'Review whether important pages have descriptive titles and meta descriptions. Missing, duplicated, or unclear metadata can make search results less useful.',
  },
  {
    title: 'Canonical URLs',
    description:
      'Check which URL a page identifies as its preferred version. Canonical tags should generally reference the intended indexable URL and avoid unnecessary redirects.',
  },
  {
    title: 'Robots and indexing directives',
    description:
      'Review robots.txt and page-level robots directives. A crawl restriction and a noindex directive serve different purposes, so interpret each finding separately.',
  },
  {
    title: 'XML sitemaps',
    description:
      'Look for discoverable sitemap files and review whether they list preferred, accessible URLs. A sitemap helps discovery but does not guarantee indexing.',
  },
  {
    title: 'Internal links',
    description:
      'Review navigation and links between important pages. Useful descriptive links help visitors discover related content and can help crawlers understand site structure.',
  },
];

const steps = [
  'Start with important pages such as the homepage, main categories, and pages that answer specific visitor needs.',
  'Review each reported issue in the context of the actual page. Automated checks can produce incomplete results or flag intentional configurations.',
  'Fix broken links, unintended indexing restrictions, incorrect canonical URLs, and missing important metadata where applicable.',
  'Check the updated pages in your browser and use Google Search Console to investigate Google-specific crawling and indexing information.',
  'Monitor the results over time. Technical corrections improve accessibility and clarity but do not guarantee rankings or indexing.',
];

export default function SeoToolsPage() {
  return (
    <>
      <HomeHeader />

      <main className="min-h-screen bg-slate-50 px-4 py-16">
        <div className="mx-auto max-w-5xl">
          <nav aria-label="Breadcrumb" className="mb-6 text-sm text-slate-600">
            <Link href="/" className="hover:text-orange-600">Home</Link>
            <span className="mx-2">/</span>
            <Link href="/all-tools" className="hover:text-orange-600">
              All Tools
            </Link>
            <span className="mx-2">/</span>
            <span aria-current="page">SEO Tools</span>
          </nav>

          <h1 className="text-4xl font-bold text-slate-900">
            SEO Tools
          </h1>

          <p className="mt-4 max-w-3xl text-lg text-slate-600">
            Explore technical SEO checks that help you understand how your
            website communicates with search engines. Review page metadata,
            crawlability, indexing signals, internal links, and sitemap
            discovery before deciding what needs attention.
          </p>

          <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <h2 className="text-2xl font-semibold text-slate-900">
              Website SEO Checker
            </h2>

            <p className="mt-3 max-w-3xl text-slate-600">
              Enter a website URL to review supported technical SEO signals.
              Use the results to investigate potential problems with metadata,
              canonical URLs, internal links, robots directives, and sitemaps.
              The report is a starting point for manual review, not a complete
              evaluation of search performance.
            </p>

            <Link
              href="/all-tools/website-seo-checker"
              className="mt-6 inline-flex rounded-lg bg-orange-500 px-6 py-3 font-semibold text-white hover:bg-orange-600"
            >
              Open Website SEO Checker
            </Link>
          </section>

          <section className="mt-14">
            <h2 className="text-2xl font-semibold text-slate-900">
              What should you check during a technical SEO review?
            </h2>

            <p className="mt-3 max-w-3xl text-slate-600">
              A useful SEO review considers individual findings together
              rather than treating every warning as an equally serious issue.
              The following areas are common starting points.
            </p>

            <div className="mt-6 grid gap-5 md:grid-cols-2">
              {checks.map((check) => (
                <article
                  key={check.title}
                  className="rounded-xl border border-slate-200 bg-white p-6"
                >
                  <h3 className="text-lg font-semibold text-slate-900">
                    {check.title}
                  </h3>
                  <p className="mt-3 text-slate-600">
                    {check.description}
                  </p>
                </article>
              ))}
            </div>
          </section>

          <section className="mt-14 max-w-4xl">
            <h2 className="text-2xl font-semibold text-slate-900">
              How to use your SEO audit results
            </h2>

            <ol className="mt-5 list-decimal space-y-4 pl-6 text-slate-700">
              {steps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </section>

          <section className="mt-14 max-w-4xl">
            <h2 className="text-2xl font-semibold text-slate-900">
              What an automated SEO checker cannot guarantee
            </h2>

            <p className="mt-4 text-slate-700">
              Automated tools cannot determine whether Google will index a
              particular page, how it will rank, or whether its content
              satisfies every search intent. Some checks depend on which
              pages and resources are accessible to the tool.
            </p>

            <p className="mt-4 text-slate-700">
              For Google-specific indexing details, review the URL Inspection
              and Page Indexing reports in Google Search Console. Combine
              technical findings with a manual assessment of content
              usefulness, accuracy, and the visitor experience.
            </p>

            <p className="mt-5 text-slate-700">
              Ready to begin?{' '}
              <Link
                href="/all-tools/website-seo-checker"
                className="font-semibold text-orange-600 hover:underline"
              >
                Run the Website SEO Checker
              </Link>
              .
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </>
  );
}