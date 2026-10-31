import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'PNG to TIFF Converter - Lossless LZW TIFF | SimplifyConvert',
  description: 'Convert PNG images to TIFF with lossless LZW compression while retaining compatible alpha transparency and source dimensions.',
  keywords: ['png to tiff', 'convert png to tiff', 'transparent png to tiff', 'LZW TIFF', 'TIFF converter', 'image converter'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://simplifyconvert.com/all-tools/png-to-tiff',
    siteName: 'SimplifyConvert',
    title: 'PNG to TIFF Converter - Lossless LZW TIFF',
    description: 'Convert PNG images to TIFF with lossless LZW compression while retaining compatible alpha transparency and source dimensions.',
    images: [{ url: 'https://simplifyconvert.com/og-image.jpg', width: 1200, height: 630, alt: 'PNG to TIFF' }],
  },
  twitter: { card: 'summary_large_image', title: 'PNG to TIFF', description: 'Convert PNG images to TIFF with lossless LZW compression while retaining compatible alpha transparency and source dimensions.', images: ['https://simplifyconvert.com/og-image.jpg'] },
  alternates: { canonical: 'https://simplifyconvert.com/all-tools/png-to-tiff' },
};

export default function PngToTiffLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
