import type { Metadata } from 'next';
import PdfToolsClient from './PdfToolsClient';

export const metadata: Metadata = {
  alternates: {
    canonical: 'https://simplifyconvert.com/all-tools/pdf',
  },
};

export default function PdfToolsPage() {
  return <PdfToolsClient />;
}
