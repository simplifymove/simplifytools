import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Data Converter - JSON, CSV, XML Conversion Tools | SimplifyConvert',
  description: 'Free data conversion tools online. Convert between JSON, CSV, XML, YAML, and more. Format, validate, and transform data instantly.',
  keywords: ['data converter', 'JSON converter', 'CSV converter', 'XML converter', 'data transformation'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://simplifyconvert.com/all-tools/data-converter',
    siteName: 'SimplifyConvert',
    title: 'Data Converter - Free Online Data Format Conversion',
    description: 'Convert between JSON, CSV, XML, YAML and more formats instantly.',
    images: [
      {
        url: 'https://simplifyconvert.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Data Converter',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Data Converter - Free Online Data Format Conversion',
    description: 'Convert between JSON, CSV, XML, YAML and more formats instantly.',
    images: ['https://simplifyconvert.com/og-image.jpg'],
  },
  alternates: {
    canonical: 'https://simplifyconvert.com/all-tools/data-converter',
  },
};

export default function DataConverterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
