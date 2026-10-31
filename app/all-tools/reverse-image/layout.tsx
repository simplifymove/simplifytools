import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Reverse Image - Flip, Mirror & Invert Colors | SimplifyConvert',
  description: 'Flip images horizontally or vertically, create mirror effects, or invert RGB colors in your browser and download the result as PNG.',
  keywords: ['reverse image', 'invert image', 'flip image', 'mirror effect', 'free tool'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://simplifyconvert.com/all-tools/reverse-image',
    siteName: 'SimplifyConvert',
    title: 'Reverse Image - Flip, Mirror & Invert Colors',
    description: 'Flip images horizontally or vertically, mirror them, or invert RGB colors online.',
    images: [{ url: 'https://simplifyconvert.com/og-image.jpg', width: 1200, height: 630, alt: 'Reverse Image' }],
  },
  twitter: { card: 'summary_large_image', title: 'Reverse Image - Flip, Mirror & Invert Colors', description: 'Flip images horizontally or vertically, mirror them, or invert RGB colors online.', images: ['https://simplifyconvert.com/og-image.jpg'] },
  alternates: { canonical: 'https://simplifyconvert.com/all-tools/reverse-image' },
};

export default function ReverseImageLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

