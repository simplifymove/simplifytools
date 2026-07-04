import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free Data Converter for CSV, JSON, XML & Excel',
  description: 'Free data converter to transform CSV, JSON, XML, and Excel formats instantly. Convert between data formats online without signup. Fast, secure, and reliable.',
  keywords: ['free data converter', 'convert CSV to JSON', 'data format converter', 'JSON to CSV converter', 'data transformation tool', 'online data converter'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://simplifyconvert.com/all-tools/data',
    siteName: 'SimplifyConvert',
    title: 'Free Data Converter for CSV, JSON, XML & Excel',
    description: 'Free data converter to transform CSV, JSON, XML, and Excel formats instantly. Convert between data formats online without signup.',
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
    description: 'Free data converter to transform CSV, JSON, XML, and Excel formats instantly. Convert without signup.',
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
