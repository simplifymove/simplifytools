import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'JPG to WebP - Convert JPEG Images to WebP | SimplifyConvert',
  description: 'Convert JPG images to WebP with an adjustable quality setting and prepare the processed result for download.',
  keywords: ['jpg to webp', 'free tool', 'online converter'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://simplifyconvert.com/all-tools/jpg-to-webp',
    siteName: 'SimplifyConvert',
    title: 'JPG to WebP - Convert JPEG Images to WebP',
    description: 'Convert JPG images to WebP with an adjustable quality setting and prepare the processed result for download.',
    images: [{ url: 'https://simplifyconvert.com/og-image.jpg', width: 1200, height: 630, alt: 'JPG to WebP' }],
  },
  twitter: { card: 'summary_large_image', title: 'JPG to WebP', description: 'Convert JPG images to WebP with an adjustable quality setting and prepare the processed result for download.', images: ['https://simplifyconvert.com/og-image.jpg'] },
  alternates: { canonical: 'https://simplifyconvert.com/all-tools/jpg-to-webp' },
};

export default function JpgToWebpLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
