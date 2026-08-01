import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'JPG to PNG Converter - Format, Size & Quality Guide',
  description: 'Re-encode a JPG as PNG at the same dimensions. Learn why conversion cannot restore JPEG detail or create transparency and why PNG output may be larger.',
  keywords: ['JPG to PNG', 'convert JPG to PNG', 'JPG converter', 'PNG converter', 'free image converter', 'online converter', 'image format conversion'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://simplifyconvert.com/all-tools/jpg-to-png',
    siteName: 'SimplifyConvert',
    title: 'JPG to PNG Converter - Format, Size & Quality Guide',
    description: 'Re-encode JPG as PNG without claiming restored detail or automatic transparency.',
    images: [{ url: 'https://simplifyconvert.com/og-image.jpg', width: 1200, height: 630, alt: 'JPG to PNG Converter' }],
  },
  twitter: { card: 'summary_large_image', title: 'JPG to PNG Converter', description: 'Convert JPG to PNG and understand the quality, transparency, and file-size tradeoffs.', images: ['https://simplifyconvert.com/og-image.jpg'] },
  alternates: { canonical: 'https://simplifyconvert.com/all-tools/jpg-to-png' },
};

export default function JpgToPngLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
