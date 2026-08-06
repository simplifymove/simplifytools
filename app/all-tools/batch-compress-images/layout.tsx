import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Batch Compress Images - Compress Multiple Images | SimplifyConvert',
  description: 'Compress multiple supported images in one workflow with an adjustable quality setting and review the resulting file sizes.',
  alternates: {
    canonical: 'https://simplifyconvert.com/all-tools/batch-compress-images',
  },
};

export default function BatchCompressImagesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
