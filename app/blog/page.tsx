import Link from 'next/link';
import { ArrowRight, Calendar, FileText, Image, Video, Database } from 'lucide-react';
import { Footer } from '@/app/components/Footer';
import { blogGuides, existingBlogGuide, GUIDE_DISPLAY_DATE } from './guides';

const posts = [
  ...blogGuides.map((guide) => ({ ...guide, date: GUIDE_DISPLAY_DATE })),
  { ...existingBlogGuide, date: 'January 15, 2024' },
];

const categoryStyles: Record<string, string> = {
  PDF: 'bg-purple-100 text-purple-800',
  Images: 'bg-orange-100 text-orange-800',
  Data: 'bg-teal-100 text-teal-800',
  Video: 'bg-pink-100 text-pink-800',
};

const categoryIcons = {
  PDF: FileText,
  Images: Image,
  Data: Database,
  Video: Video,
};

export default function BlogPage() {
  const featured = blogGuides[0];

  return (
    <main className="min-h-screen bg-white">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-8">
          <Link href="/" className="flex items-center gap-2 rounded-sm text-2xl font-bold text-gray-900 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-orange-600">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500 text-sm text-white">SC</span>
            <span className="hidden sm:inline">SimplifyConvert</span>
          </Link>
          <nav aria-label="Primary" className="flex items-center gap-5 text-sm font-semibold text-gray-700">
            <Link href="/all-tools" className="rounded-sm hover:text-orange-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-orange-600">All tools</Link>
            <Link href="/blog" aria-current="page" className="rounded-sm text-orange-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-orange-600">Guides</Link>
          </nav>
        </div>
      </header>

      <section className="bg-orange-500 px-4 py-16 md:px-8">
        <div className="mx-auto max-w-7xl">
          <h1 className="text-4xl font-bold text-white md:text-5xl">SimplifyConvert Guides</h1>
          <p className="mt-4 max-w-2xl text-xl leading-8 text-white/95">Practical explanations of file formats, conversion tradeoffs, and how to choose the right operation before changing a file.</p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-16 md:px-8 md:py-20">
        <section aria-labelledby="featured-guide" className="rounded-2xl border-2 border-orange-200 bg-linear-to-br from-orange-50 to-white p-8 md:p-10">
          <p className="font-semibold uppercase tracking-wider text-orange-700">Featured guide</p>
          <h2 id="featured-guide" className="mt-3 max-w-4xl text-3xl font-bold text-gray-950 md:text-4xl">{featured.title}</h2>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-gray-700">{featured.description}</p>
          <Link href={`/blog/${featured.slug}`} className="mt-6 inline-flex items-center gap-2 rounded-full bg-orange-600 px-6 py-3 font-semibold text-white hover:bg-orange-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-orange-700">
            Read the PDF workflow guide <ArrowRight size={18} aria-hidden="true" />
          </Link>
        </section>

        <section aria-labelledby="all-guides" className="mt-16">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
            <div><h2 id="all-guides" className="text-3xl font-bold text-gray-950">All guides</h2><p className="mt-2 text-gray-600">Six published articles; every card opens a complete guide.</p></div>
            <span className="text-sm font-semibold text-gray-600">{posts.length} articles</span>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => {
              const Icon = categoryIcons[post.category];
              return (
                <article key={post.slug} className="flex flex-col rounded-2xl border-2 border-gray-200 bg-white p-6 transition hover:border-orange-300 hover:shadow-lg">
                  <div className="flex items-center justify-between gap-3">
                    <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${categoryStyles[post.category]}`}><Icon size={14} aria-hidden="true" />{post.category}</span>
                    <span className="text-xs text-gray-500">{post.readTime} read</span>
                  </div>
                  <h3 className="mt-5 text-xl font-bold leading-7 text-gray-950">{post.title}</h3>
                  <p className="mt-3 grow leading-7 text-gray-600">{post.description}</p>
                  <div className="mt-5 flex items-center gap-2 border-t border-gray-100 pt-4 text-xs text-gray-500"><Calendar size={14} aria-hidden="true" /><time>{post.date}</time></div>
                  <Link href={`/blog/${post.slug}`} className="mt-5 inline-flex items-center gap-2 rounded-sm font-semibold text-orange-700 hover:text-orange-800 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-orange-600">
                    Read {post.category.toLowerCase()} guide <ArrowRight size={16} aria-hidden="true" />
                  </Link>
                </article>
              );
            })}
          </div>
        </section>
      </div>
      <Footer />
    </main>
  );
}
