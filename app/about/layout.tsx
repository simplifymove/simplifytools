import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About SimplifyConvert - Free Online Tools for Everyone',
  description: 'Learn about SimplifyConvert, the platform offering 100+ free online tools for image conversion, video editing, PDF manipulation, AI writing, and data transformation.',
  keywords: ['about SimplifyConvert', 'online tools platform', 'free converter tools'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://simplifyconvert.com/about',
    siteName: 'SimplifyConvert',
    title: 'About SimplifyConvert - Free Online Tools',
    description: 'Learn about SimplifyConvert and our mission to provide free online tools for everyone.',
    images: [
      {
        url: 'https://simplifyconvert.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'About SimplifyConvert',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About SimplifyConvert - Free Online Tools',
    description: 'Learn about SimplifyConvert and our mission.',
    images: ['https://simplifyconvert.com/og-image.jpg'],
  },
  alternates: {
    canonical: 'https://simplifyconvert.com/about',
  },
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
