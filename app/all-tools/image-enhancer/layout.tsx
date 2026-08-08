import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Image Enhancer - Adjust Brightness, Contrast & Color | SimplifyConvert',
  description: 'Adjust image brightness, contrast, and saturation with browser-based controls, preview the changes, and download the processed image.',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://simplifyconvert.com/all-tools/image-enhancer',
    siteName: 'SimplifyConvert',
    title: 'Image Enhancer - Adjust Brightness, Contrast & Color | SimplifyConvert',
    description: 'Adjust image brightness, contrast, and saturation with browser-based controls, preview the changes, and download the processed image.',
    images: [{ url: 'https://simplifyconvert.com/og-image.jpg', width: 1200, height: 630, alt: 'Image Enhancer' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Image Enhancer - Adjust Brightness, Contrast & Color | SimplifyConvert',
    description: 'Adjust image brightness, contrast, and saturation with browser-based controls, preview the changes, and download the processed image.',
    images: ['https://simplifyconvert.com/og-image.jpg'],
  },
  alternates: {
    canonical: 'https://simplifyconvert.com/all-tools/image-enhancer',
  },
};

export default function ImageEnhancerLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
