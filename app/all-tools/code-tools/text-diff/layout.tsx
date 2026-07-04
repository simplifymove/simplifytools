import type { Metadata } from 'next';

export const metadata: Metadata = {
  alternates: {
    canonical: 'https://simplifyconvert.com/all-tools/code-tools/text-diff',
  },
};

export default function TextDiffLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

