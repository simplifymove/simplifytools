'use client';

import React from 'react';
import { generateBreadcrumbSchema, generateToolSchema } from '@/app/lib/seo';

interface ToolPageSEOProps {
  title: string;
  description: string;
  category: string;
  breadcrumbs: Array<{ name: string; url: string }>;
  url: string;
  image?: string;
  children: React.ReactNode;
  includeH1?: boolean;
  headingColor?: string;
  descriptionColor?: string;
}

/**
 * SEO-Optimized Tool Page Wrapper
 * Provides proper heading hierarchy, structured data, and SEO best practices
 */
export function ToolPageSEO({
  title,
  description,
  category,
  breadcrumbs,
  url,
  image,
  children,
  includeH1 = true,
  headingColor = 'text-white',
  descriptionColor = 'text-white/95',
}: ToolPageSEOProps) {
  const toolSchema = generateToolSchema({
    title,
    description,
    category,
    url: `https://simplifyconvert.com${url}`,
    image: image ? `https://simplifyconvert.com${image}` : undefined,
  });

  const breadcrumbItems = breadcrumbs.map((item) => ({
    name: item.name,
    url: `https://simplifyconvert.com${item.url}`,
  }));

  return (
    <>
      {/* JSON-LD Schemas */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateBreadcrumbSchema(breadcrumbItems)),
        }}
        suppressHydrationWarning
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(toolSchema),
        }}
        suppressHydrationWarning
      />

      {/* Breadcrumb Navigation */}
      <nav
        className="flex items-center gap-2 text-white/80 text-sm mb-6"
        aria-label="Breadcrumb"
      >
        {breadcrumbs.map((item, index) => (
          <React.Fragment key={index}>
            {index > 0 && <span className="opacity-60">›</span>}
            <a href={item.url} className="hover:text-white transition-colors">
              {item.name}
            </a>
          </React.Fragment>
        ))}
      </nav>

      {/* Main Heading - Single H1 for SEO */}
      {includeH1 && (
        <div className="mb-6">
          <h1 className={`text-4xl md:text-5xl font-bold ${headingColor} mb-4`}>
            {title}
          </h1>
          <p className={`text-lg md:text-xl ${descriptionColor} max-w-3xl leading-relaxed`}>
            {description}
          </p>
        </div>
      )}

      {/* Content */}
      {children}
    </>
  );
}

export default ToolPageSEO;
