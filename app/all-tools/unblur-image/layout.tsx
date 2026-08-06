import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Unblur Image - Reduce Motion & Defocus Blur | SimplifyConvert',
  description: 'Reduce the appearance of motion or defocus blur with adjustable restoration strength, refinement passes, and controlled image sharpening.',
  keywords: ['unblur image', 'reduce image blur', 'motion blur', 'defocus blur', 'sharpen image', 'image restoration'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://simplifyconvert.com/all-tools/unblur-image',
    siteName: 'SimplifyConvert',
    title: 'Unblur Image - Reduce Motion & Defocus Blur',
    description: 'Reduce motion or defocus blur with adjustable filtering and controlled sharpening.',
    images: [{ url: 'https://simplifyconvert.com/og-image.jpg', width: 1200, height: 630, alt: 'Unblur Image' }],
  },
  twitter: { card: 'summary_large_image', title: 'Unblur Image - Reduce Motion & Defocus Blur', description: 'Reduce motion or defocus blur with adjustable filtering and controlled sharpening.', images: ['https://simplifyconvert.com/og-image.jpg'] },
  alternates: { canonical: 'https://simplifyconvert.com/all-tools/unblur-image' },
};

export default function UnblurImageLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

