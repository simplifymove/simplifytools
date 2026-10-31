import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Image Compressor - Adjust Image Quality Online | SimplifyConvert',
  description: 'Compress JPG, PNG, and WebP images in your browser using adjustable quality settings. Compare file sizes and download the processed image.',
  alternates: {
    canonical: 'https://simplifyconvert.com/all-tools/image-compressor',
  },
};

export default function ImageCompressorLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
