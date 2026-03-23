import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blog - SimplifyConvert Tips, Tricks & Tutorials',
  description: 'Read the latest articles about online tools, image editing, video conversion, and productivity tips on the SimplifyConvert blog.',
  keywords: ['blog', 'tutorials', 'tips', 'guides', 'articles'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://simplifyconvert.com/blog',
    siteName: 'SimplifyConvert',
    title: 'Blog - SimplifyConvert Tips & Tutorials',
    description: 'Read articles about online tools and productivity tips.',
    images: [
      {
        url: 'https://simplifyconvert.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'SimplifyConvert Blog',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Blog - SimplifyConvert Tips & Tutorials',
    description: 'Read articles about online tools and productivity tips.',
    images: ['https://simplifyconvert.com/og-image.jpg'],
  },
  alternates: {
    canonical: 'https://simplifyconvert.com/blog',
  },
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
