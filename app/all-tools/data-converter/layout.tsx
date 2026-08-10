import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Data Converters for CSV, JSON, XML & Excel',
  description: 'Convert among CSV, JSON, XML, and Excel formats with tools designed for specific format pairs. Review headers, data types, and nested structures.',
  keywords: ['free data converter', 'convert CSV to JSON', 'data format converter', 'JSON to CSV converter', 'data transformation tool', 'online data converter'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://simplifyconvert.com/all-tools/data',
    siteName: 'SimplifyConvert',
    title: 'Free Data Converter for CSV, JSON, XML & Excel',
    description: 'Convert among CSV, JSON, XML, and Excel formats using online tools for specific format pairs. Review the generated structure before using the result.',
    images: [
      {
        url: 'https://simplifyconvert.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Free data converter to convert between CSV, JSON, XML, and Excel formats',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Data Converter for CSV, JSON, XML & Excel',
    description: 'Convert among CSV, JSON, XML, and Excel formats using tools designed for specific format pairs. No account is required for these utilities.',
    images: ['https://simplifyconvert.com/og-image.jpg'],
  },
  alternates: {
    canonical: 'https://simplifyconvert.com/all-tools/data',
  },
};

export default function DataConverterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
