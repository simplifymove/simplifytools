import { Metadata } from 'next';

export function generatePageMetadata(options: {
  title: string;
  description: string;
  path: string;
  image?: string;
  keywords?: string[];
  type?: 'website' | 'article';
}): Metadata {
  const baseUrl = 'https://simplifyconvert.com';
  const fullUrl = `${baseUrl}${options.path}`;
  const image = options.image || 'https://simplifyconvert.com/og-image.jpg';

  return {
    title: options.title,
    description: options.description,
    keywords: options.keywords,
    openGraph: {
      type: options.type || 'website',
      locale: 'en_US',
      url: fullUrl,
      siteName: 'SimplifyConvert',
      title: options.title,
      description: options.description,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: options.title,
          type: 'image/jpeg',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: options.title,
      description: options.description,
      images: [image],
    },
    alternates: {
      canonical: fullUrl,
    },
  };
}

export function generateBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function generateSoftwareApplicationSchema(options: {
  name: string;
  description: string;
  url: string;
  image?: string;
  applicationCategory: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: options.name,
    description: options.description,
    url: options.url,
    image: options.image || 'https://simplifyconvert.com/og-image.jpg',
    applicationCategory: options.applicationCategory,
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
  };
}

export function generateToolSchema({
  name,
  description,
  url,
  category = "UtilityApplication",
}: {
  name: string;
  description: string;
  url: string;
  category?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name,
    description,
    applicationCategory: category,
    operatingSystem: "Web",
    url,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  };
}

export function generateFAQSchema(faqs: Array<{ question: string; answer: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

// Generate Organization structured data (JSON-LD)
export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'SimplifyConvert',
    url: 'https://simplifyconvert.com',
    logo: 'https://simplifyconvert.com/favicon.png',
    description: '200+ free online tools for image editing, video conversion, AI writing, PDF manipulation, and data transformation.',
    sameAs: [
      'https://twitter.com/simplifyconvert',
      'https://facebook.com/simplifyconvert',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Support',
      url: 'https://simplifyconvert.com/contact',
    },
  };
}

// Generate WebSite schema with search action
export function generateWebSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'SimplifyConvert',
    url: 'https://simplifyconvert.com',
    description: 'Free online tools for conversion, editing, and transformation',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://simplifyconvert.com/all-tools?search={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
  };
}

// Generate optimized title (50-60 characters)
export function generateOptimalTitle(keyword: string, suffix: string = '| SimplifyConvert'): string {
  const title = `${keyword} - ${suffix}`;
  return title.length > 60 ? `${keyword} ${suffix}`.slice(0, 60) : title;
}

// Generate optimized meta description (140-160 characters)
export function generateOptimalDescription(primary: string, secondary?: string): string {
  let desc = primary;
  if (secondary && primary.length < 140) {
    desc = `${primary} ${secondary}`;
  }
  return desc.length > 160 ? desc.slice(0, 157) + '...' : desc;
}

// Generate SEO keywords array
export function generateKeywords(mainKeyword: string, variations: string[] = []): string[] {
  const baseKeywords = [mainKeyword, ...variations];
  return [...new Set(baseKeywords)];
}

// Generate canonical URL
export function generateCanonicalUrl(path: string): string {
  return `https://simplifyconvert.com${path}`;
}

// Create slug from text (SEO-friendly)
export function createSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Generate image alt text
export function generateAltText(context: string, tool?: string): string {
  if (tool) {
    return `${tool} - ${context} - SimplifyConvert`;
  }
  return `${context} - SimplifyConvert`;
}

// Generate long-tail keyword variations
export function generateLongTailKeywords(mainKeyword: string): string[] {
  const prefixes = ['free', 'online', 'best', 'how to', 'how do i', 'what is', 'convert'];
  const suffixes = ['online', 'tool', 'converter', 'editor', 'free', 'quickly'];

  const variations = [
    ...prefixes.map(p => `${p} ${mainKeyword}`),
    ...suffixes.map(s => `${mainKeyword} ${s}`),
  ];

  return [...new Set([mainKeyword, ...variations])];
}

// Extract first 100 words for SEO optimization
export function extractFirst100Words(text: string): string {
  const words = text.split(/\s+/);
  return words.slice(0, 100).join(' ');
}
