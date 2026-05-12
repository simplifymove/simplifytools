import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Background Remover - AI Remove Image Backgrounds | SimplifyConvert',
  description: 'Remove image backgrounds instantly using AI. Extract objects perfectly. Free online background remover.',
  keywords: ['remove background', 'background remover', 'transparent background', 'AI tool', 'image editor', 'free tool', 'background removal'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://simplifyconvert.com/all-tools/remove-background',
    siteName: 'SimplifyConvert',
    title: 'Remove Background - Free Background Remover Tool',
    description: 'Remove backgrounds from images instantly.',
    images: [{ url: 'https://simplifyconvert.com/og-image.jpg', width: 1200, height: 630, alt: 'Remove Background' }],
  },
  twitter: { card: 'summary_large_image', title: 'Remove Background - Free Background Remover Tool', description: 'Remove backgrounds from images instantly.', images: ['https://simplifyconvert.com/og-image.jpg'] },
  alternates: { canonical: 'https://simplifyconvert.com/all-tools/remove-background' },
};

export default function RemoveBackgroundLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

