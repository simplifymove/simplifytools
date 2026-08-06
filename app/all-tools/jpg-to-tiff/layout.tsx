import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'JPG to TIFF Converter - Lossless LZW TIFF | SimplifyConvert',
  description: 'Convert JPG and JPEG images to TIFF with lossless LZW compression for imaging, publishing, print, and archival workflows.',
  keywords: ['jpg to tiff', 'jpeg to tiff', 'convert jpg to tiff', 'LZW TIFF', 'TIFF converter', 'image converter'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://simplifyconvert.com/all-tools/jpg-to-tiff',
    siteName: 'SimplifyConvert',
    title: 'JPG to TIFF Converter - Lossless LZW TIFF',
    description: 'Convert JPG and JPEG images to TIFF with lossless LZW compression for imaging, publishing, print, and archival workflows.',
    images: [{ url: 'https://simplifyconvert.com/og-image.jpg', width: 1200, height: 630, alt: 'JPG to TIFF' }],
  },
  twitter: { card: 'summary_large_image', title: 'JPG to TIFF', description: 'Convert JPG and JPEG images to TIFF with lossless LZW compression for imaging, publishing, print, and archival workflows.', images: ['https://simplifyconvert.com/og-image.jpg'] },
  alternates: { canonical: 'https://simplifyconvert.com/all-tools/jpg-to-tiff' },
};

export default function JpgToTiffLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
