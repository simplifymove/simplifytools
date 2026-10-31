import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'PNG to WebP - Convert PNG Images to WebP | SimplifyConvert',
  description: 'Convert PNG images to WebP with an adjustable quality setting and prepare the processed result for download.',
  keywords: ['png to webp', 'free tool', 'online converter'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://simplifyconvert.com/all-tools/png-to-webp',
    siteName: 'SimplifyConvert',
    title: 'PNG to WebP - Convert PNG Images to WebP',
    description: 'Convert PNG images to WebP with an adjustable quality setting and prepare the processed result for download.',
    images: [{ url: 'https://simplifyconvert.com/og-image.jpg', width: 1200, height: 630, alt: 'PNG to WebP' }],
  },
  twitter: { card: 'summary_large_image', title: 'PNG to WebP', description: 'Convert PNG images to WebP with an adjustable quality setting and prepare the processed result for download.', images: ['https://simplifyconvert.com/og-image.jpg'] },
  alternates: { canonical: 'https://simplifyconvert.com/all-tools/png-to-webp' },
};

export default function PngToWebpLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
