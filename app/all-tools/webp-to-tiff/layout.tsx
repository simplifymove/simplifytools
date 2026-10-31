import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'WebP to TIFF Converter - Lossless LZW TIFF | SimplifyConvert',
  description: 'Convert WebP images to TIFF with lossless LZW compression for imaging, publishing, print, and TIFF-based workflows.',
  keywords: ['webp to tiff', 'convert webp to tiff', 'LZW TIFF', 'TIFF converter', 'WebP converter', 'image converter'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://simplifyconvert.com/all-tools/webp-to-tiff',
    siteName: 'SimplifyConvert',
    title: 'WebP to TIFF Converter - Lossless LZW TIFF',
    description: 'Convert WebP images to TIFF with lossless LZW compression for imaging, publishing, print, and TIFF-based workflows.',
    images: [{ url: 'https://simplifyconvert.com/og-image.jpg', width: 1200, height: 630, alt: 'WebP to TIFF' }],
  },
  twitter: { card: 'summary_large_image', title: 'WebP to TIFF', description: 'Convert WebP images to TIFF with lossless LZW compression for imaging, publishing, print, and TIFF-based workflows.', images: ['https://simplifyconvert.com/og-image.jpg'] },
  alternates: { canonical: 'https://simplifyconvert.com/all-tools/webp-to-tiff' },
};

export default function WebpToTiffLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
