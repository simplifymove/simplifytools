import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Resize Image - Free Image Resizer Tool | SimplifyConvert',
  description: 'Resize images to custom dimensions. Scale, crop, and adjust your images easily.',
  keywords: ['resize image', 'image resizer', 'image scaler', 'free tool'],
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

