import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Make Round Image - Create Circular & Rounded Images | SimplifyConvert',
  description: 'Create circular or rounded images in your browser, adjust the corner radius, preview the result, and download the processed image.',
  keywords: ['round image', 'circular image', 'image converter', 'free tool'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://simplifyconvert.com/all-tools/make-round-image',
    siteName: 'SimplifyConvert',
    title: 'Make Round Image - Free Circular Image Converter',
    description: 'Create circular or rounded images with adjustable roundness controls.',
    images: [{ url: 'https://simplifyconvert.com/og-image.jpg', width: 1200, height: 630, alt: 'Make Round Image' }],
  },
  twitter: { card: 'summary_large_image', title: 'Make Round Image - Create Circular & Rounded Images', description: 'Create circular or rounded images with adjustable roundness controls.', images: ['https://simplifyconvert.com/og-image.jpg'] },
  alternates: { canonical: 'https://simplifyconvert.com/all-tools/make-round-image' },
};

export default function MakeRoundImageLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

