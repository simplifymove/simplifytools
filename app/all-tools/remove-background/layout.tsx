import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Remove Background - PNG, WebP or White JPG Output',
  description: 'Remove a photo background with Standard or HQ segmentation, then export transparent PNG or WebP, or a JPG flattened onto white. Edge results vary by image.',
  keywords: ['remove background', 'background remover', 'transparent background', 'AI tool', 'image editor', 'free tool', 'background removal'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://simplifyconvert.com/all-tools/remove-background',
    siteName: 'SimplifyConvert',
    title: 'Remove Background - Transparent Image Cutout Tool',
    description: 'Create a model-generated cutout and choose transparent or white-background output.',
    images: [{ url: 'https://simplifyconvert.com/og-image.jpg', width: 1200, height: 630, alt: 'Remove Background' }],
  },
  twitter: { card: 'summary_large_image', title: 'Remove Background - Image Cutout Tool', description: 'Create a cutout with Standard or HQ segmentation and review the generated edges.', images: ['https://simplifyconvert.com/og-image.jpg'] },
  alternates: { canonical: 'https://simplifyconvert.com/all-tools/remove-background' },
};

export default function RemoveBackgroundLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
