import type { Metadata } from 'next';

export const metadata: Metadata = {
  alternates: {
    canonical: 'https://simplifyconvert.com/all-tools/batch-resize-images',
  },
};

export default function BatchResizeImagesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
