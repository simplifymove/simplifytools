import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'WebP to AVIF - Free Online Tool | SimplifyConvert',
  description: 'Convert WebP images to AVIF format with server-assisted processing and download the converted result.',
  keywords: ['webp to avif', 'free tool', 'online converter'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://simplifyconvert.com/all-tools/webp-to-avif',
    siteName: 'SimplifyConvert',
    title: 'WebP to AVIF - Free Online Tool',
    description: 'Convert WebP images to AVIF format with server-assisted processing and download the converted result.',
    images: [{ url: 'https://simplifyconvert.com/og-image.jpg', width: 1200, height: 630, alt: 'WebP to AVIF' }],
  },
  twitter: { card: 'summary_large_image', title: 'WebP to AVIF', description: 'Convert WebP images to AVIF format with server-assisted processing and download the converted result.', images: ['https://simplifyconvert.com/og-image.jpg'] },
  alternates: { canonical: 'https://simplifyconvert.com/all-tools/webp-to-avif' },
};

export default function WebpToAvifLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
