import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Remove Watermark - Free Online Watermark & Logo Remover Tool | AI Powered',
  description: 'Remove watermarks, logos, timestamps, and text from images instantly using AI. Clean up photos with precision. Fast & quality modes available. No registration required.',
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
    description: 'Remove watermarks, logos, and text from images instantly using AI inpainting technology.',
    images: [{ url: 'https://simplifyconvert.com/og-image.jpg', width: 1200, height: 630, alt: 'Remove Watermark Tool' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Remove Watermark - Free Online Watermark & Logo Remover Tool',
    description: 'Remove watermarks, logos, and text from images instantly using AI.',
    images: ['https://simplifyconvert.com/og-image.jpg']
  },
  alternates: { canonical: 'https://simplifyconvert.com/all-tools/remove-watermark' },
  robots: 'index, follow',
  applicationName: 'SimplifyConvert',
};

export default function RemoveWatermarkLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

