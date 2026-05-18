import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Text to Video Generator - Free Online | SimplifyConvert',
  description: 'Generate AI videos from text prompts online. Create cinematic videos, animations, and visual content in minutes. Free, no watermarks, no signup required.',
  keywords: ['text to video', 'AI video generator', 'video creation', 'AI video maker', 'generate videos from text', 'free video generator'],
  authors: [{ name: 'SimplifyConvert' }],
  creator: 'SimplifyConvert',
  robots: {
    index: true,
    follow: true,
    'max-snippet': -1,
    'max-image-preview': 'large',
    'max-video-preview': -1,
  },
  alternates: {
    canonical: 'https://simplifyconvert.com/all-tools/video-tools/text-to-video',
  },
  openGraph: {
    title: 'AI Text to Video Generator - Create Professional Videos',
    description: 'Transform text prompts into stunning AI videos. Modern styles, fast rendering, professional quality.',
    url: 'https://simplifyconvert.com/all-tools/video-tools/text-to-video',
    siteName: 'SimplifyConvert',
    images: [
      {
        url: 'https://simplifyconvert.com/og-text-to-video.png',
        width: 1200,
        height: 630,
        alt: 'AI Text to Video Generator',
        type: 'image/png',
      },
    ],
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Text to Video Generator',
    description: 'Generate professional videos from text in minutes with AI',
    images: ['https://simplifyconvert.com/og-text-to-video.png'],
    creator: '@simplifyconvert',
  },
};

export default function TextToVideoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      {/* JSON-LD Schema Markup */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'SoftwareApplication',
            name: 'AI Text to Video Generator',
            description: 'Generate professional videos from text prompts using artificial intelligence',
            url: 'https://simplifyconvert.com/all-tools/video-tools/text-to-video',
            applicationCategory: 'MediaApplication',
            offers: {
              '@type': 'Offer',
              price: '0',
              priceCurrency: 'USD',
              availability: 'https://schema.org/InStock',
            },
            operatingSystem: 'Web',
            featureList: [
              'AI Script Generation',
              'Multiple Video Styles',
              'Custom Durations',
              'Aspect Ratio Options',
              'Professional Quality Output',
              'Free HD Download',
            ],
            aggregateRating: {
              '@type': 'AggregateRating',
              ratingValue: '4.8',
              ratingCount: '256',
            },
            creator: {
              '@type': 'Organization',
              name: 'SimplifyConvert',
              url: 'https://simplifyconvert.com',
            },
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              {
                '@type': 'ListItem',
                position: 1,
                name: 'Home',
                item: 'https://simplifyconvert.com',
              },
              {
                '@type': 'ListItem',
                position: 2,
                name: 'All Tools',
                item: 'https://simplifyconvert.com/all-tools',
              },
              {
                '@type': 'ListItem',
                position: 3,
                name: 'Video Tools',
                item: 'https://simplifyconvert.com/all-tools/video-tools',
              },
              {
                '@type': 'ListItem',
                position: 4,
                name: 'AI Text to Video',
                item: 'https://simplifyconvert.com/all-tools/video-tools/text-to-video',
              },
            ],
          }),
        }}
      />
    </>
  );
}

