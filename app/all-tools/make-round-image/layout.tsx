import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Make Round Image - Free Circular Image Converter | SimplifyConvert',
  description: 'Convert square images to perfect circles. Create profile pictures and avatars instantly.',
  keywords: ['round image', 'circular image', 'image converter', 'free tool'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://simplifyconvert.com/all-tools/converters/make-round-image',
    siteName: 'SimplifyConvert',
    title: 'Make Round Image - Free Circular Image Converter',
    description: 'Convert square images to perfect circles.',
    images: [{ url: 'https://simplifyconvert.com/og-image.jpg', width: 1200, height: 630, alt: 'Make Round Image' }],
  },
  twitter: { card: 'summary_large_image', title: 'Make Round Image - Free Circular Image Converter', description: 'Convert square images to perfect circles.', images: ['https://simplifyconvert.com/og-image.jpg'] },
  alternates: { canonical: 'https://simplifyconvert.com/all-tools/converters/make-round-image' },
};

export default function MakeRoundImageLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
