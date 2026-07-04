import type { Metadata } from 'next';

export const metadata: Metadata = {
  alternates: {
    canonical: 'https://simplifyconvert.com/all-tools/watermark-image',
  },
};

export default function WatermarkImageLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
