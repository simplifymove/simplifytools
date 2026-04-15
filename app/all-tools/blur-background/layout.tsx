import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blur Background - Free Background Blur Tool | SimplifyConvert',
  description: 'Blur backgrounds in images easily. Create stunning portrait and focus effects.',
  keywords: ['blur background', 'background blur', 'image editor', 'free tool'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://simplifyconvert.com/all-tools/blur-background',
    siteName: 'SimplifyConvert',
    title: 'Blur Background - Free Background Blur Tool',
    description: 'Blur backgrounds in images easily.',
    images: [{ url: 'https://simplifyconvert.com/og-image.jpg', width: 1200, height: 630, alt: 'Blur Background' }],
  },
  twitter: { card: 'summary_large_image', title: 'Blur Background - Free Background Blur Tool', description: 'Blur backgrounds in images easily.', images: ['https://simplifyconvert.com/og-image.jpg'] },
  alternates: { canonical: 'https://simplifyconvert.com/all-tools/blur-background' },
};

export default function BlurBackgroundLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

