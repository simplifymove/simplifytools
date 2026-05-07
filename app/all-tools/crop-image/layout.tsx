import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Crop Image - Free Online Image Cropping Tool | SimplifyConvert',
  description: 'Crop and resize images to your exact dimensions. Perfect for thumbnails, profiles, and custom sizes.',
  keywords: ['crop image', 'image cropper', 'resize image', 'free tool'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://simplifyconvert.com/all-tools/crop-image',
    siteName: 'SimplifyConvert',
    title: 'Crop Image - Free Online Image Cropping Tool',
    description: 'Crop and resize images to your exact dimensions.',
    images: [{ url: 'https://simplifyconvert.com/og-image.jpg', width: 1200, height: 630, alt: 'Crop Image' }],
  },
  twitter: { card: 'summary_large_image', title: 'Crop Image - Free Online Image Cropping Tool', description: 'Crop and resize images to your exact dimensions.', images: ['https://simplifyconvert.com/og-image.jpg'] },
  alternates: { canonical: 'https://simplifyconvert.com/all-tools/crop-image' },
};

export default function CropImageLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

