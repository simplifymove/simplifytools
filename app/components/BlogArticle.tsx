'use client';

import React from 'react';
import Link from 'next/link';
import { Calendar, User, Clock, Share2, ArrowRight } from 'lucide-react';

interface BlogArticleProps {
  title: string;
  description: string;
  author: string;
  date: string;
  datePublished: string;
  canonicalUrl: string;
  readTime: string;
  category: string;
  image: string;
  imageAlt: string;
  children: React.ReactNode;
  relatedLinks?: Array<{ title: string; url: string }>;
}

/**
 * SEO-Optimized Blog Article Component
 * Includes proper heading hierarchy, article schema, and content structure
 */
export function BlogArticle({
  title,
  description,
  author,
  date,
  datePublished,
  canonicalUrl,
  readTime,
  category,
  image,
  imageAlt,
  children,
  relatedLinks,
}: BlogArticleProps) {
  // Generate article schema
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: title,
    description: description,
    url: canonicalUrl,
    mainEntityOfPage: canonicalUrl,
    image: [image],
    datePublished,
    author: {
      '@type': 'Organization',
      name: author,
      url: 'https://simplifyconvert.com',
    },
    publisher: {
      '@type': 'Organization',
      name: 'SimplifyConvert',
      logo: {
        '@type': 'ImageObject',
        url: 'https://simplifyconvert.com/favicon.png',
        width: 96,
        height: 96,
      },
    },
  };

  return (
    <>
      {/* Article Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleSchema),
        }}
        suppressHydrationWarning
      />

      <article className="max-w-3xl mx-auto px-4 py-12">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-gray-600 text-sm mb-8">
          <Link href="/" className="hover:text-gray-900">
            Home
          </Link>
          <span>/</span>
          <Link href="/blog" className="hover:text-gray-900">
            Blog
          </Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">{category}</span>
        </nav>

        {/* Header */}
        <header className="mb-8">
          {/* Category Badge */}
          <div className="mb-3">
            <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
              {category}
            </span>
          </div>

          {/* Main Heading - Single H1 */}
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
            {title}
          </h1>

          {/* Description/Subheading */}
          <p className="text-xl text-gray-600 mb-6 leading-relaxed">
            {description}
          </p>

          {/* Meta Information */}
          <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600 border-b border-gray-200 pb-6">
            <div className="flex items-center gap-2">
              <User size={16} />
              <span>By {author}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar size={16} />
              <time dateTime={datePublished}>{date}</time>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={16} />
              <span>{readTime} read</span>
            </div>
          </div>
        </header>

        {/* Featured Image */}
        <figure className="mb-8">
          <img
            src={image}
            alt={imageAlt}
            className="w-full h-auto rounded-lg shadow-lg object-cover"
            loading="lazy"
          />
          <figcaption className="text-sm text-gray-600 mt-2 text-center">
            {imageAlt}
          </figcaption>
        </figure>

        {/* Article Content */}
        <div className="prose prose-lg max-w-none mb-12 text-gray-700">
          {children}
        </div>

        {/* Share Section */}
        <div className="bg-gray-50 rounded-lg p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Share2 size={20} />
            Share This Article
          </h2>
          <div className="flex gap-4">
            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=https://simplifyconvert.com/blog`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
            >
              Twitter
            </a>
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=https://simplifyconvert.com/blog`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
              Facebook
            </a>
            <a
              href={`https://www.linkedin.com/sharing/share-offsite/?url=https://simplifyconvert.com/blog`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-800 transition"
            >
              LinkedIn
            </a>
          </div>
        </div>

        {/* Related Articles */}
        {relatedLinks && relatedLinks.length > 0 && (
          <div className="border-t border-gray-200 pt-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Articles</h2>
            <ul className="space-y-4">
              {relatedLinks.map((link, index) => (
                <li key={index}>
                  <Link
                    href={link.url}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition group"
                  >
                    <span className="text-gray-900 font-medium group-hover:text-blue-600">
                      {link.title}
                    </span>
                    <ArrowRight
                      size={16}
                      className="text-gray-400 group-hover:text-blue-600 transition"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Author Bio */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">About the Author</h3>
          <p className="text-gray-700">
            {author} is part of the SimplifyConvert team dedicated to making file conversion, editing, and transformation accessible to everyone.
          </p>
        </div>
      </article>
    </>
  );
}

export default BlogArticle;
