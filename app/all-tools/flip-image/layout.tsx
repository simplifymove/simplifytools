import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Flip Image - Free Online Mirror & Flip Tool | SimplifyConvert',
  description: 'Flip images horizontally and vertically. Create mirror effects and rotations instantly.',
  keywords: ['flip image', 'mirror image', 'rotate image', 'free tool'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://simplifyconvert.com/all-tools/converters/flip-image',
    siteName: 'SimplifyConvert',
    title: 'Flip Image - Free Online Mirror & Flip Tool',
    description: 'Flip images horizontally and vertically.',
    images: [{ url: 'https://simplifyconvert.com/og-image.jpg', width: 1200, height: 630, alt: 'Flip Image' }],
  },
  twitter: { card: 'summary_large_image', title: 'Flip Image - Free Online Mirror & Flip Tool', description: 'Flip images horizontally and vertically.', images: ['https://simplifyconvert.com/og-image.jpg'] },
  alternates: { canonical: 'https://simplifyconvert.com/all-tools/converters/flip-image' },
};

export default function FlipImageLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
