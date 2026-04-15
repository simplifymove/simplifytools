import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Reverse Image - Free Image Reversal Tool | SimplifyConvert',
  description: 'Reverse, invert, and flip images with ease. Create mirror effects and color inversions instantly.',
  keywords: ['reverse image', 'invert image', 'flip image', 'mirror effect', 'free tool'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://simplifyconvert.com/all-tools/converters/reverse-image',
    siteName: 'SimplifyConvert',
    title: 'Reverse Image - Free Image Reversal Tool',
    description: 'Reverse, invert, and flip images with ease.',
    images: [{ url: 'https://simplifyconvert.com/og-image.jpg', width: 1200, height: 630, alt: 'Reverse Image' }],
  },
  twitter: { card: 'summary_large_image', title: 'Reverse Image - Free Image Reversal Tool', description: 'Reverse, invert, and flip images with ease.', images: ['https://simplifyconvert.com/og-image.jpg'] },
  alternates: { canonical: 'https://simplifyconvert.com/all-tools/converters/reverse-image' },
};

export default function ReverseImageLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
