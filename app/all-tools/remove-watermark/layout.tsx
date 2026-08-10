import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Remove Watermark - Mark and Inpaint Image Areas Online',
  description: 'Mark watermarks, logos, timestamps, text, or other unwanted image areas with a brush, then process the selection using Fast or Quality inpainting modes.',
  keywords: [
    'remove watermark',
    'watermark remover',
    'remove logo',
    'delete watermark',
    'logo removal',
    'watermark eraser',
    'free watermark remover',
    'online watermark removal',
    'remove text from image',
    'image cleanup',
    'inpainting tool',
    'photo retouching'
  ],
  authors: [{ name: 'SimplifyConvert' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://simplifyconvert.com/all-tools/remove-watermark',
    siteName: 'SimplifyConvert',
    title: 'Remove Watermark - Free Online Watermark & Logo Remover Tool',
    description: 'Mark unwanted image regions with a brush and process them using selectable inpainting modes.',
    images: [{ url: 'https://simplifyconvert.com/og-image.jpg', width: 1200, height: 630, alt: 'Remove Watermark Tool' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Remove Watermark - Free Online Watermark & Logo Remover Tool',
    description: 'Brush over unwanted image regions and process the marked areas with inpainting.',
    images: ['https://simplifyconvert.com/og-image.jpg']
  },
  alternates: { canonical: 'https://simplifyconvert.com/all-tools/remove-watermark' },
  robots: 'index, follow',
  applicationName: 'SimplifyConvert',
};

export default function RemoveWatermarkLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

