import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Image Upscaler - Free Online Image Enlargement Tool | 2x 3x 4x Upscale',
  description: 'Upscale images 2×, 3×, or 4× using Real-ESRGAN AI technology. Increase image dimensions and enhance visual detail with adjustable upscaling options.',
  keywords: [
    'upscale image',
    'image upscaler',
    'image enlarger',
    'increase image resolution',
    'AI upscaling',
    'upscale photo',
    '4x upscale',
    'Real-ESRGAN',
    'enhance image quality',
    'enlarger tool',
    'free image upscaler',
    'online image enhancer'
  ],
  authors: [{ name: 'SimplifyConvert' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://simplifyconvert.com/all-tools/upscale-image',
    siteName: 'SimplifyConvert',
    title: 'AI Image Upscaler - Free Online Image Enlargement Tool',
    description: 'Enlarge images to 2×, 3×, or 4× using AI-based upscaling designed to improve visible detail and clarity.',
    images: [{ url: 'https://simplifyconvert.com/og-image.jpg', width: 1200, height: 630, alt: 'AI Image Upscaler Tool' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Image Upscaler - Free Online Image Enlargement Tool',
    description: 'Upscale images 2x, 3x, or 4x using AI-based image enhancement.',
    images: ['https://simplifyconvert.com/og-image.jpg']
  },
  alternates: { canonical: 'https://simplifyconvert.com/all-tools/upscale-image' },
  robots: 'index, follow',
  applicationName: 'SimplifyConvert',
}

export default function UpscaleImageLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

