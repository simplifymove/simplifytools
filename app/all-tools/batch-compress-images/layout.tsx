import type { Metadata } from 'next';

export const metadata: Metadata = {
  alternates: {
    canonical: 'https://simplifyconvert.com/all-tools/batch-compress-images',
  },
};

export default function BatchCompressImagesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
