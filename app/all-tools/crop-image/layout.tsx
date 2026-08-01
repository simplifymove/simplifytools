import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Crop Image with Free or Fixed Aspect-Ratio Selection',
  description: 'Crop a rectangular image region using free selection or 1:1, 4:3, 16:9, and 3:2 presets, then export PNG, JPG, or WebP.',
  keywords: [
    'crop image',
    'image cropper',
    'crop photo',
    'resize image',
    'image resizer',
    'free crop tool',
    'online image cropper',
    'crop and resize',
    'aspect ratio crop',
    'image trimmer',
    'photo editor',
    'free image editor'
  ],
  authors: [{ name: 'SimplifyConvert' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://simplifyconvert.com/all-tools/crop-image',
    siteName: 'SimplifyConvert',
    title: 'Crop Image with Aspect-Ratio Presets',
    description: 'Select image boundaries, compare cropping with resizing, and export PNG, JPG, or WebP.',
    images: [{ url: 'https://simplifyconvert.com/og-image.jpg', width: 1200, height: 630, alt: 'Crop Image Tool' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Crop Image with Aspect-Ratio Presets',
    description: 'Crop image boundaries and export PNG, JPG, or WebP.',
    images: ['https://simplifyconvert.com/og-image.jpg']
  },
  alternates: { canonical: 'https://simplifyconvert.com/all-tools/crop-image' },
  robots: 'index, follow',
  applicationName: 'SimplifyConvert',
};

export default function CropImageLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
