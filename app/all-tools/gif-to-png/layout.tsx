import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'GIF to PNG Converter - Free Online Tool | SimplifyConvert',
  description: 'Convert GIF to a static PNG image online. Browser-based conversion supports transparency from the decoded GIF image.',
  keywords: ['gif to png', 'convert gif', 'animation converter', 'free tool'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://simplifyconvert.com/all-tools/gif-to-png',
    siteName: 'SimplifyConvert',
    title: 'GIF to PNG Converter - Free Online Tool',
    description: 'Convert GIF images to static PNG files online.',
    images: [{ url: 'https://simplifyconvert.com/og-image.jpg', width: 1200, height: 630, alt: 'GIF to PNG' }],
  },
  twitter: { card: 'summary_large_image', title: 'GIF to PNG Converter - Free Online Tool', description: 'Convert GIF images to static PNG files online.', images: ['https://simplifyconvert.com/og-image.jpg'] },
  alternates: { canonical: 'https://simplifyconvert.com/all-tools/gif-to-png' },
};

export default function GifToPngLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

