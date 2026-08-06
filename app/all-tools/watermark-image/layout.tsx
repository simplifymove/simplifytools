import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Watermark Image - Add Text Watermarks | SimplifyConvert',
  description: 'Add a text watermark to an image, adjust its size, opacity, and position, preview the result, and download the processed image.',
  alternates: {
    canonical: 'https://simplifyconvert.com/all-tools/watermark-image',
  },
};

export default function WatermarkImageLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
