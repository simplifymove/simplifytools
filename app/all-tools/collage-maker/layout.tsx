import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Collage Maker - Free Online Photo Collage Creator | SimplifyConvert',
  description: 'Create stunning photo collages from multiple images. Professional layouts and templates.',
  keywords: ['collage maker', 'photo collage', 'image collage', 'free tool'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://simplifyconvert.com/all-tools/collage-maker',
    siteName: 'SimplifyConvert',
    title: 'Collage Maker - Free Online Photo Collage Creator',
    description: 'Create stunning photo collages from multiple images.',
    images: [{ url: 'https://simplifyconvert.com/og-image.jpg', width: 1200, height: 630, alt: 'Collage Maker' }],
  },
  twitter: { card: 'summary_large_image', title: 'Collage Maker - Free Online Photo Collage Creator', description: 'Create stunning photo collages from multiple images.', images: ['https://simplifyconvert.com/og-image.jpg'] },
  alternates: { canonical: 'https://simplifyconvert.com/all-tools/collage-maker' },
};

export default function CollageMakerLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

