import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About SimplifyConvert - Online Utility Library',
  description: 'Learn how SimplifyConvert organizes free PDF, image, video, data, code, and calculator utilities alongside a separate credit-based Premium AI Studio.',
  keywords: ['about SimplifyConvert', 'online tools platform', 'free converter tools'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://simplifyconvert.com/about',
    siteName: 'SimplifyConvert',
    title: 'About SimplifyConvert - Online Utility Library',
    description: 'Learn about SimplifyConvert, its utility categories, processing model, and Premium AI Studio.',
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
    title: 'About SimplifyConvert - Online Utility Library',
    description: 'Learn about SimplifyConvert, its utility categories, and Premium AI Studio.',
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
