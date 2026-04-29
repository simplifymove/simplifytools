'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { generateBreadcrumbSchema } from '@/app/lib/seo';

export interface BreadcrumbItem {
  name: string;
  url?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  includeLogo?: boolean;
  textColor?: string;
}

export function Breadcrumb({ items, includeLogo = false, textColor = 'text-white/90' }: BreadcrumbProps) {
  // Create full URLs for schema
  const breadcrumbItems = items.map((item) => ({
    name: item.name,
    url: item.url ? `https://simplifyconvert.com${item.url}` : 'https://simplifyconvert.com',
  }));

  return (
    <>
      {/* JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateBreadcrumbSchema(breadcrumbItems)),
        }}
        suppressHydrationWarning
      />

      {/* Breadcrumb Navigation */}
      <nav
        className={`flex items-center gap-2 ${textColor} text-sm mb-6`}
        aria-label="Breadcrumb"
      >
        {items.map((item, index) => (
          <React.Fragment key={index}>
            {index > 0 && <ChevronRight size={16} className="opacity-75" />}
            {item.url ? (
              <Link
                href={item.url}
                className="hover:opacity-100 opacity-90 transition-opacity"
              >
                {item.name}
              </Link>
            ) : (
              <span className="opacity-90">{item.name}</span>
            )}
          </React.Fragment>
        ))}
      </nav>
    </>
  );
}

export default Breadcrumb;
