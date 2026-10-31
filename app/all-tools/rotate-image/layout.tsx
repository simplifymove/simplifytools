import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Rotate Image - Rotate & Straighten Images | SimplifyConvert',
  description: 'Rotate an image to the required angle, preview the orientation, and download the processed result.',
  keywords: ['rotate image', 'image rotation', 'flip image', 'free tool'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://simplifyconvert.com/all-tools/rotate-image',
    siteName: 'SimplifyConvert',
    title: 'Rotate Image - Free Image Rotation Tool',
    description: 'Rotate images to any angle.',
    images: [{ url: 'https://simplifyconvert.com/og-image.jpg', width: 1200, height: 630, alt: 'Rotate Image' }],
  },
  twitter: { card: 'summary_large_image', title: 'Rotate Image - Free Image Rotation Tool', description: 'Rotate images to any angle.', images: ['https://simplifyconvert.com/og-image.jpg'] },
  alternates: { canonical: 'https://simplifyconvert.com/all-tools/rotate-image' },
};

export default function RotateImageLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

