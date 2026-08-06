import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Image Enhancer - Adjust Brightness, Contrast & Color | SimplifyConvert',
  description: 'Adjust image brightness, contrast, and saturation with browser-based controls, preview the changes, and download the processed image.',
  alternates: {
    canonical: 'https://simplifyconvert.com/all-tools/image-enhancer',
  },
};

export default function ImageEnhancerLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
