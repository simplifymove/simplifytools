import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Video Script Planner from Text | SimplifyConvert',
  description: 'Turn a text prompt into a structured video plan with a title, voiceover, scenes, captions, timing, style, and aspect-ratio guidance. Video rendering is not currently available.',
  keywords: ['video script generator', 'AI video planner', 'storyboard planner', 'video scene planner', 'voiceover script generator'],
  authors: [{ name: 'SimplifyConvert' }],
  creator: 'SimplifyConvert',
  robots: {
    index: true,
    follow: true,
    'max-snippet': -1,
    'max-image-preview': 'large',
    'max-video-preview': 0,
  },
  alternates: {
    canonical: 'https://simplifyconvert.com/all-tools/video-tools/text-to-video',
  },
  openGraph: {
    title: 'AI Video Script Planner from Text',
    description: 'Create a structured video script and scene plan from a text prompt. Video rendering is not currently available.',
    url: 'https://simplifyconvert.com/all-tools/video-tools/text-to-video',
    siteName: 'SimplifyConvert',
    images: [
      {
        url: 'https://simplifyconvert.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'AI Video Script Planner',
        type: 'image/png',
      },
    ],
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Video Script Planner',
    description: 'Create a structured video script and scene plan from a text prompt.',
    images: ['https://simplifyconvert.com/og-image.jpg'],
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
            name: 'AI Video Script Planner',
            description: 'Generate a structured video script and scene plan from a text prompt. Video rendering is not currently available.',
            url: 'https://simplifyconvert.com/all-tools/video-tools/text-to-video',
            applicationCategory: 'MediaApplication',
            operatingSystem: 'Web',
            featureList: [
              'AI Script Generation',
              'Scene Planning',
              'Voiceover Drafting',
              'Timing Guidance',
              'Style and Aspect Ratio Planning',
              'Text Script Download',
            ],
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
                name: 'AI Video Script Planner',
                item: 'https://simplifyconvert.com/all-tools/video-tools/text-to-video',
              },
            ],
          }),
        }}
      />
    </>
  );
}
