import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Grayscale Image - Free Image Converter to Black & White | SimplifyConvert',
  description: 'Convert color images to beautiful grayscale. Transform images to black and white instantly.',
  keywords: ['grayscale image', 'black and white', 'image converter', 'free tool'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://simplifyconvert.com/all-tools/grayscale-image',
    siteName: 'SimplifyConvert',
    title: 'Grayscale Image - Free Image Converter to Black & White',
    description: 'Convert color images to beautiful grayscale.',
    images: [{ url: 'https://simplifyconvert.com/og-image.jpg', width: 1200, height: 630, alt: 'Grayscale Image' }],
  },
  twitter: { card: 'summary_large_image', title: 'Grayscale Image - Free Image Converter to Black & White', description: 'Convert color images to beautiful grayscale.', images: ['https://simplifyconvert.com/og-image.jpg'] },
  alternates: { canonical: 'https://simplifyconvert.com/all-tools/grayscale-image' },
};

export default function GrayscaleImageLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

