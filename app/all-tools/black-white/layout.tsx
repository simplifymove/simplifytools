import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Black & White - Free Image Grayscale Converter | SimplifyConvert',
  description: 'Convert images to black and white. Create stunning monochrome effects instantly.',
  keywords: ['black and white', 'grayscale', 'convert to bw', 'free tool'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://simplifyconvert.com/all-tools/black-white',
    siteName: 'SimplifyConvert',
    title: 'Black & White - Free Image Grayscale Converter',
    description: 'Convert images to black and white.',
    images: [{ url: 'https://simplifyconvert.com/og-image.jpg', width: 1200, height: 630, alt: 'Black and White' }],
  },
  twitter: { card: 'summary_large_image', title: 'Black & White - Free Image Grayscale Converter', description: 'Convert images to black and white.', images: ['https://simplifyconvert.com/og-image.jpg'] },
  alternates: { canonical: 'https://simplifyconvert.com/all-tools/black-white' },
};

export default function BlackWhiteLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

