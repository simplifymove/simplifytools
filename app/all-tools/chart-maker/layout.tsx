import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Chart Maker - Free Online Chart Creator | SimplifyConvert',
  description: 'Create beautiful charts and graphs from your data. Visualize information instantly.',
  keywords: ['chart maker', 'graph creator', 'data visualization', 'free tool'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://simplifyconvert.com/all-tools/converters/chart-maker',
    siteName: 'SimplifyConvert',
    title: 'Chart Maker - Free Online Chart Creator',
    description: 'Create beautiful charts and graphs from your data.',
    images: [{ url: 'https://simplifyconvert.com/og-image.jpg', width: 1200, height: 630, alt: 'Chart Maker' }],
  },
  twitter: { card: 'summary_large_image', title: 'Chart Maker - Free Online Chart Creator', description: 'Create beautiful charts and graphs from your data.', images: ['https://simplifyconvert.com/og-image.jpg'] },
  alternates: { canonical: 'https://simplifyconvert.com/all-tools/converters/chart-maker' },
};

export default function ChartMakerLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

