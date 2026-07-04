import type { Metadata } from 'next';

export const metadata: Metadata = {
  alternates: {
    canonical: 'https://simplifyconvert.com/all-tools/image-enhancer',
  },
};

export default function ImageEnhancerLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
