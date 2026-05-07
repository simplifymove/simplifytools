import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'WebP to TIFF - Free Online Tool | SimplifyConvert',
  description: 'Convert and edit webp to tiff online instantly. Free tool without signup required.',
  keywords: ['webp to tiff', 'free tool', 'online converter'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://simplifyconvert.com/all-tools/webp-to-tiff',
    siteName: 'SimplifyConvert',
    title: 'WebP to TIFF - Free Online Tool',
    description: 'Convert and edit webp to tiff online instantly. Free tool without signup required.',
    images: [{ url: 'https://simplifyconvert.com/og-image.jpg', width: 1200, height: 630, alt: 'WebP to TIFF' }],
  },
  twitter: { card: 'summary_large_image', title: 'WebP to TIFF', description: 'Convert and edit webp to tiff online instantly. Free tool without signup required.', images: ['https://simplifyconvert.com/og-image.jpg'] },
  alternates: { canonical: 'https://simplifyconvert.com/all-tools/webp-to-tiff' },
};

export default function WebpToTiffLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
