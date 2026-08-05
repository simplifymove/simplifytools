import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'GIF to JPG Converter - Convert GIF to JPG | SimplifyConvert',
  description: 'Convert GIF to JPG online with adjustable JPEG quality. Animated GIFs are converted to a static JPG using the first frame.',
  keywords: ['gif to jpg', 'convert gif', 'animation converter', 'free tool'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://simplifyconvert.com/all-tools/gif-to-jpg',
    siteName: 'SimplifyConvert',
    title: 'GIF to JPG Converter - Convert GIF to JPG',
    description: 'Convert GIF files to static JPG images online with adjustable JPEG quality.',
    images: [{ url: 'https://simplifyconvert.com/og-image.jpg', width: 1200, height: 630, alt: 'GIF to JPG' }],
  },
  twitter: { card: 'summary_large_image', title: 'GIF to JPG Converter - Convert GIF to JPG', description: 'Convert GIF files to static JPG images online with adjustable JPEG quality.', images: ['https://simplifyconvert.com/og-image.jpg'] },
  alternates: { canonical: 'https://simplifyconvert.com/all-tools/gif-to-jpg' },
};

export default function GifToJpgLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

