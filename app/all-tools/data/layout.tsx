import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Data Converter - Free Data Format Conversion | SimplifyConvert',
  description: 'Convert between CSV, Excel, JSON, XML and other data formats. Transform your data instantly.',
  keywords: ['data converter', 'CSV to Excel', 'data format conversion', 'free tool'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://simplifyconvert.com/all-tools/data',
    siteName: 'SimplifyConvert',
    title: 'Data Converter - Free Data Format Conversion',
    description: 'Convert between CSV, Excel, JSON, XML and other data formats.',
    images: [{ url: 'https://simplifyconvert.com/og-image.jpg', width: 1200, height: 630, alt: 'Data Converter' }],
  },
  twitter: { card: 'summary_large_image', title: 'Data Converter - Free Data Format Conversion', description: 'Convert between CSV, Excel, JSON, XML and other data formats.', images: ['https://simplifyconvert.com/og-image.jpg'] },
  alternates: { canonical: 'https://simplifyconvert.com/all-tools/data' },
};

export default function DataLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
