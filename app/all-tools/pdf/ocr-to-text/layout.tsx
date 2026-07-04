import type { Metadata } from 'next';

export const metadata: Metadata = {
  alternates: {
    canonical: 'https://simplifyconvert.com/all-tools/pdf/ocr-to-text',
  },
};

export default function PdfOcrToTextLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

