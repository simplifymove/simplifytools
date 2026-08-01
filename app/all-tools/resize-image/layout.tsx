import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Resize Image - Set Width, Height & Aspect Ratio',
  description: 'Resize one image to exact pixel dimensions in browser Canvas, with optional aspect-ratio locking and guidance for downscaling, upscaling, web, and print.',
  keywords: ['resize image', 'image resizer', 'resize photo', 'change image size', 'scale image', 'image scaler', 'batch resize'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://simplifyconvert.com/all-tools/resize-image',
    siteName: 'SimplifyConvert',
    title: 'Resize Image - Set Width, Height & Aspect Ratio',
    description: 'Resize one image to exact pixel dimensions with optional aspect-ratio locking.',
    images: [{ url: 'https://simplifyconvert.com/og-image.jpg', width: 1200, height: 630, alt: 'Resize Image' }],
  },
  twitter: { card: 'summary_large_image', title: 'Resize Image - Pixel Dimension Resizer', description: 'Set exact width and height with optional aspect-ratio locking.', images: ['https://simplifyconvert.com/og-image.jpg'] },
  alternates: { canonical: 'https://simplifyconvert.com/all-tools/resize-image' },
};

export default function ResizeImageLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
