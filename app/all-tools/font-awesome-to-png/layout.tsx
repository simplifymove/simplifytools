import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Font Awesome to PNG - Convert Icons to PNG | SimplifyConvert',
  description: 'Render Font Awesome icons as PNG images with configurable size, color, and background settings.',
  keywords: ['font awesome to png', 'icon converter', 'export icons', 'free tool'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://simplifyconvert.com/all-tools/font-awesome-to-png',
    siteName: 'SimplifyConvert',
    title: 'Font-Awesome to PNG - Free Icon Converter',
    description: 'Convert Font Awesome icons to PNG images.',
    images: [{ url: 'https://simplifyconvert.com/og-image.jpg', width: 1200, height: 630, alt: 'Font-Awesome to PNG' }],
  },
  twitter: { card: 'summary_large_image', title: 'Font-Awesome to PNG - Free Icon Converter', description: 'Convert Font Awesome icons to PNG images.', images: ['https://simplifyconvert.com/og-image.jpg'] },
  alternates: { canonical: 'https://simplifyconvert.com/all-tools/font-awesome-to-png' },
};

export default function FontAwesomeToPngLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

