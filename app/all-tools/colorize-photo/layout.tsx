import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Colorize Photo - Free AI Photo Colorization | SimplifyConvert',
  description: 'Add colors to black and white photos using AI. Restore and enhance old photographs instantly.',
  keywords: ['colorize photo', 'colorize image', 'restore photo', 'free tool'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://simplifyconvert.com/all-tools/colorize-photo',
    siteName: 'SimplifyConvert',
    title: 'Colorize Photo - Free AI Photo Colorization',
    description: 'Add colors to black and white photos using AI.',
    images: [{ url: 'https://simplifyconvert.com/og-image.jpg', width: 1200, height: 630, alt: 'Colorize Photo' }],
  },
  twitter: { card: 'summary_large_image', title: 'Colorize Photo - Free AI Photo Colorization', description: 'Add colors to black and white photos using AI.', images: ['https://simplifyconvert.com/og-image.jpg'] },
  alternates: { canonical: 'https://simplifyconvert.com/all-tools/colorize-photo' },
};

export default function ColorizePhotoLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

