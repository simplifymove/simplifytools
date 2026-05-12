import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Image Resizer - Change Image Dimensions & Scale | SimplifyConvert',
  description: 'Resize images to custom dimensions. Batch resize multiple images instantly. Perfect for web, social media, and printing.',
  keywords: ['resize image', 'image resizer', 'resize photo', 'change image size', 'scale image', 'image scaler', 'batch resize'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://simplifyconvert.com/all-tools/resize-image',
    siteName: 'SimplifyConvert',
    title: 'Resize Image - Free Image Resizer Tool',
    description: 'Resize images to custom dimensions.',
    images: [{ url: 'https://simplifyconvert.com/og-image.jpg', width: 1200, height: 630, alt: 'Resize Image' }],
  },
  twitter: { card: 'summary_large_image', title: 'Resize Image - Free Image Resizer Tool', description: 'Resize images to custom dimensions.', images: ['https://simplifyconvert.com/og-image.jpg'] },
  alternates: { canonical: 'https://simplifyconvert.com/all-tools/resize-image' },
};

export default function ResizeImageLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

