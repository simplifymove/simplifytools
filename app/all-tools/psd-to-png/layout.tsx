import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'PSD to PNG - Free Photoshop File Converter | SimplifyConvert',
  description: 'Convert PSD files to PNG images. Export Photoshop designs with transparency.',
  keywords: ['psd to png', 'convert psd', 'photoshop converter', 'free tool'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://simplifyconvert.com/all-tools/converters/psd-to-png',
    siteName: 'SimplifyConvert',
    title: 'PSD to PNG - Free Photoshop File Converter',
    description: 'Convert PSD files to PNG images.',
    images: [{ url: 'https://simplifyconvert.com/og-image.jpg', width: 1200, height: 630, alt: 'PSD to PNG' }],
  },
  twitter: { card: 'summary_large_image', title: 'PSD to PNG - Free Photoshop File Converter', description: 'Convert PSD files to PNG images.', images: ['https://simplifyconvert.com/og-image.jpg'] },
  alternates: { canonical: 'https://simplifyconvert.com/all-tools/converters/psd-to-png' },
};

export default function PsdToPngLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

