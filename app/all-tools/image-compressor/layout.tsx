import type { Metadata } from 'next';

export const metadata: Metadata = {
  alternates: {
    canonical: 'https://simplifyconvert.com/all-tools/image-compressor',
  },
};

export default function ImageCompressorLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
