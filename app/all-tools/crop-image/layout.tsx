import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Crop Image - Free Online Image Cropper & Resizer Tool | Precise Crop',
  description: 'Crop and resize images with precision. Free online image cropping tool with aspect ratio control. Supports all formats. No registration needed.',
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
    title: 'Crop Image - Free Online Image Cropper & Resizer Tool',
    description: 'Crop and resize images precisely. Adjust aspect ratios, rotate, and download in any format.',
    images: [{ url: 'https://simplifyconvert.com/og-image.jpg', width: 1200, height: 630, alt: 'Crop Image Tool' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Crop Image - Free Online Image Cropper & Resizer Tool',
    description: 'Crop and resize images with precision and control.',
    images: ['https://simplifyconvert.com/og-image.jpg']
  },
  alternates: { canonical: 'https://simplifyconvert.com/all-tools/crop-image' },
  robots: 'index, follow',
  applicationName: 'SimplifyConvert',
};

export default function CropImageLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
