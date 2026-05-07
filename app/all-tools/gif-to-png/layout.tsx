import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'GIF to PNG - Free Animation Frame Extractor | SimplifyConvert',
  description: 'Convert GIF to PNG with transparent backgrounds. Extract or combine frames.',
  keywords: ['gif to png', 'convert gif', 'animation converter', 'free tool'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://simplifyconvert.com/all-tools/gif-to-png',
    siteName: 'SimplifyConvert',
    title: 'GIF to PNG - Free Animation Frame Extractor',
    description: 'Convert GIF to PNG with transparent backgrounds.',
    images: [{ url: 'https://simplifyconvert.com/og-image.jpg', width: 1200, height: 630, alt: 'GIF to PNG' }],
  },
  twitter: { card: 'summary_large_image', title: 'GIF to PNG - Free Animation Frame Extractor', description: 'Convert GIF to PNG with transparent backgrounds.', images: ['https://simplifyconvert.com/og-image.jpg'] },
  alternates: { canonical: 'https://simplifyconvert.com/all-tools/gif-to-png' },
};

export default function GifToPngLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

