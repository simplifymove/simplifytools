import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blur Image Online Free | Add Blur Effect to Photos',
  description: 'Apply an adjustable blur effect to images in your browser for softened details, backgrounds, and creative image workflows.',
  keywords: ['blur image', 'image blur tool', 'blur photo online', 'photo blur effect', 'privacy blur'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://simplifyconvert.com/all-tools/blur-image',
    siteName: 'SimplifyConvert',
    title: 'Blur Image Online Free | Add Blur Effect to Photos',
    description: 'Apply an adjustable browser-based blur effect for softened details, backgrounds, and creative image workflows.',
    images: [{ url: 'https://simplifyconvert.com/og-image.jpg', width: 1200, height: 630, alt: 'Blur Image' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Blur Image Online Free | Add Blur Effect to Photos',
    description: 'Apply an adjustable blur effect to images in your browser.',
    images: ['https://simplifyconvert.com/og-image.jpg'],
  },
  alternates: { canonical: 'https://simplifyconvert.com/all-tools/blur-image' },
};

export default function BlurImageLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
