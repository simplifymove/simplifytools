import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Remove Background - Free Background Remover Tool | SimplifyConvert',
  description: 'Remove backgrounds from images instantly. Get transparent or custom backgrounds.',
  keywords: ['remove background', 'background remover', 'image editor', 'free tool'],
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

