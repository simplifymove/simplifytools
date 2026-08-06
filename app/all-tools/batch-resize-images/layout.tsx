import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Batch Resize Images - Resize Multiple Images | SimplifyConvert',
  description: 'Resize multiple supported images in one workflow, choose output dimensions and aspect-ratio settings, and download the processed results.',
  alternates: {
    canonical: 'https://simplifyconvert.com/all-tools/batch-resize-images',
  },
};

export default function BatchResizeImagesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
