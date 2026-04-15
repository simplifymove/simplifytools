import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Unblur Image - Free Image Sharpening Tool | SimplifyConvert',
  description: 'Enhance and sharpen blurry images. Improve image clarity and quality instantly.',
  keywords: ['unblur image', 'sharpen image', 'image enhancement', 'free tool'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://simplifyconvert.com/all-tools/unblur-image',
    siteName: 'SimplifyConvert',
    title: 'Unblur Image - Free Image Sharpening Tool',
    description: 'Enhance and sharpen blurry images.',
    images: [{ url: 'https://simplifyconvert.com/og-image.jpg', width: 1200, height: 630, alt: 'Unblur Image' }],
  },
  twitter: { card: 'summary_large_image', title: 'Unblur Image - Free Image Sharpening Tool', description: 'Enhance and sharpen blurry images.', images: ['https://simplifyconvert.com/og-image.jpg'] },
  alternates: { canonical: 'https://simplifyconvert.com/all-tools/unblur-image' },
};

export default function UnblurImageLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

