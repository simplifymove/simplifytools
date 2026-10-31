import Link from 'next/link';
import type { Metadata } from 'next';
import { HomeHeader } from '@/app/components/HomeHeader';
import { Footer } from '@/app/components/Footer';

export const metadata: Metadata = {
  title: 'SEO Tools - Website SEO Checker | SimplifyConvert',
  description: 'Explore website SEO tools for reviewing metadata, links, crawlability, sitemaps, and robots.txt.',
  alternates: {
    canonical: 'https://www.simplifyconvert.com/all-tools/seo-tools',
  },
};

export default function SeoToolsPage() {
  return (
    <>
      <HomeHeader />
      <main className="min-h-screen bg-slate-50 px-4 py-16">
        <div className="mx-auto max-w-5xl">
          <h1 className="text-4xl font-bold text-slate-900">SEO Tools</h1>
          <p className="mt-4 max-w-3xl text-slate-600">
            Review technical SEO signals and discover issues that may affect
            how search engines crawl and understand your website.
          </p>
          <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <h2 className="text-2xl font-semibold text-slate-900">
              Website SEO Checker
            </h2>
            <p className="mt-3 text-slate-600">
              Analyze website metadata, internal links, crawlability,
              sitemap discovery, and robots.txt signals. Use the report
              to prioritize issues that need further investigation.
            </p>
            <Link
              href="/all-tools/website-seo-checker"
              className="mt-6 inline-flex rounded-lg bg-orange-500 px-6 py-3 font-semibold text-white hover:bg-orange-600"
            >
              Open Website SEO Checker
            </Link>
          </section>
          <section className="mt-10 max-w-3xl text-slate-700">
            <h2 className="text-xl font-semibold">Understanding SEO audit results</h2>
            <p className="mt-3">
              Automated checks can help identify missing metadata, broken links,
              indexing directives, and other technical signals. Results depend
              on which pages the checker can access and do not guarantee
              search rankings or Google indexing.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
