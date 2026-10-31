import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Make Background Transparent - Create Transparent Images | SimplifyConvert',
  description: 'Make selected background colors transparent with browser-based image processing, adjust tolerance and edge controls, and download the result.',
  keywords: ['transparent background', 'remove background', 'image editor', 'free tool'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://simplifyconvert.com/all-tools/make-background-transparent',
    siteName: 'SimplifyConvert',
    title: 'Make Background Transparent - Free Tool',
    description: 'Make image backgrounds transparent with one click.',
    images: [{ url: 'https://simplifyconvert.com/og-image.jpg', width: 1200, height: 630, alt: 'Make Background Transparent' }],
  },
  twitter: { card: 'summary_large_image', title: 'Make Background Transparent - Free Tool', description: 'Make image backgrounds transparent with one click.', images: ['https://simplifyconvert.com/og-image.jpg'] },
  alternates: { canonical: 'https://simplifyconvert.com/all-tools/make-background-transparent' },
};

export default function MakeBackgroundTransparentLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

