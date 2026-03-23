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
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '1000',
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
