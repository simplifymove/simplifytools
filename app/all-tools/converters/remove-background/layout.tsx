import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Remove Background - Free Automatic Background Remover | SimplifyConvert',
  description: 'Remove backgrounds from images automatically with AI. Perfect for product photos and portraits.',
  keywords: ['remove background', 'background remover', 'transparent background', 'free tool'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://simplifyconvert.com/all-tools/converters/remove-background',
    siteName: 'SimplifyConvert',
    title: 'Remove Background - Free Automatic Background Remover',
    description: 'Remove backgrounds from images automatically with AI.',
    images: [{ url: 'https://simplifyconvert.com/og-image.jpg', width: 1200, height: 630, alt: 'Remove Background' }],
  },
  twitter: { card: 'summary_large_image', title: 'Remove Background - Free Automatic Background Remover', description: 'Remove backgrounds from images automatically with AI.', images: ['https://simplifyconvert.com/og-image.jpg'] },
  alternates: { canonical: 'https://simplifyconvert.com/all-tools/converters/remove-background' },
};

export default function RemoveBackgroundLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
