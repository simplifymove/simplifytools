import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Chart Maker - Create Bar, Line & Pie Charts Online | SimplifyConvert',
  description:
    'Create bar, line, and pie charts online from your data. Add labels and values, preview your visualization, and download the finished chart as a PNG image.',
  keywords: [
    'chart maker',
    'online chart maker',
    'graph maker',
    'bar chart maker',
    'line chart maker',
    'pie chart maker',
    'data visualization',
  ],
  alternates: {
    canonical: 'https://simplifyconvert.com/all-tools/chart-maker',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://simplifyconvert.com/all-tools/chart-maker',
    siteName: 'SimplifyConvert',
    title: 'Chart Maker - Create Bar, Line & Pie Charts Online',
    description:
      'Create bar, line, and pie charts from your data and download the visualization as a PNG image.',
    images: [
      {
        url: 'https://simplifyconvert.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Chart Maker',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Chart Maker | SimplifyConvert',
    description:
      'Create bar, line, and pie charts from your data and download them as PNG images.',
    images: ['https://simplifyconvert.com/og-image.jpg'],
  },
};

export default function ChartMakerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
