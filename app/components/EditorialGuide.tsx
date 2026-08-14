import type { ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Footer } from '@/app/components/Footer';
import { GUIDE_DISPLAY_DATE, GUIDE_PUBLISHED_DATE } from '@/app/blog/guides';

interface EditorialGuideProps {
  slug: string;
  title: string;
  description: string;
  category: string;
  readTime: string;
  marker: string;
  image?: string;
  imageAlt?: string;
  children: ReactNode;
}

export function EditorialGuide({
  slug,
  title,
  description,
  category,
  readTime,
  marker,
  image,
  imageAlt,
  children,
}: EditorialGuideProps) {
  const url = `https://simplifyconvert.com/blog/${slug}`;
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: title,
    description,
    url,
    mainEntityOfPage: url,
    datePublished: GUIDE_PUBLISHED_DATE,
    author: { '@type': 'Organization', name: 'SimplifyConvert', url: 'https://simplifyconvert.com' },
    publisher: { '@type': 'Organization', name: 'SimplifyConvert', url: 'https://simplifyconvert.com' },
    ...(image ? { image: `https://simplifyconvert.com${image}` } : {}),
  };

  return (
    <>
      <main className="min-h-screen bg-white" data-editorial-guide={slug}>
        <article className="mx-auto max-w-3xl px-4 py-12 md:py-16">
          <nav aria-label="Breadcrumb" className="mb-8 flex flex-wrap items-center gap-2 text-sm text-gray-600">
            <Link href="/" className="rounded-sm hover:text-orange-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600">Home</Link>
            <span aria-hidden="true">/</span>
            <Link href="/blog" className="rounded-sm hover:text-orange-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600">Blog</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page">{category}</span>
          </nav>

          <header className="border-b border-gray-200 pb-8">
            <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-orange-700">{category} guide</p>
            <h1 className="text-4xl font-bold leading-tight text-gray-950 md:text-5xl">{title}</h1>
            <p className="mt-5 text-xl leading-8 text-gray-700">{description}</p>
            <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm text-gray-600">
              <span>Published by SimplifyConvert</span>
              <time dateTime={GUIDE_PUBLISHED_DATE}>{GUIDE_DISPLAY_DATE}</time>
              <span>{readTime} read</span>
            </div>
          </header>

          {image && (
            <figure className="mt-8 overflow-hidden rounded-2xl border border-gray-200 bg-gray-50">
              <Image
                src={image}
                alt={imageAlt || title}
                width={1200}
                height={630}
                className="h-auto w-full"
                priority
              />
            </figure>
          )}

          <p className="sr-only">{marker}</p>
          <div className="editorial-copy mt-10 space-y-6 text-[1.0625rem] leading-8 text-gray-700">
            {children}
          </div>

          <footer className="mt-12 border-t border-gray-200 pt-8">
            <Link href="/blog" className="inline-flex rounded-md font-semibold text-orange-700 underline decoration-orange-300 underline-offset-4 hover:text-orange-800 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-orange-600">
              Browse all SimplifyConvert guides
            </Link>
          </footer>
        </article>
      </main>
      <Footer />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
    </>
  );
}
