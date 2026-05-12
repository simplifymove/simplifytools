import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'JPG to PNG Converter - Free Image Format Conversion | SimplifyConvert',
  description: 'Convert JPG to PNG online instantly with full transparency support. Preserve quality, maintain colors. Free, no signup required.',
  keywords: ['JPG to PNG', 'convert JPG to PNG', 'JPG converter', 'PNG converter', 'free image converter', 'online converter', 'image format conversion'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://simplifyconvert.com/all-tools/jpg-to-png',
    siteName: 'SimplifyConvert',
    title: 'JPG to PNG Converter - Free Image Format Conversion',
    description: 'Convert JPG to PNG online instantly with full transparency support. Preserve quality, maintain colors.',
    images: [{ url: 'https://simplifyconvert.com/og-image.jpg', width: 1200, height: 630, alt: 'JPG to PNG Converter' }],
  },
  twitter: { card: 'summary_large_image', title: 'JPG to PNG Converter - Convert Images Online', description: 'Convert JPG to PNG with transparency support. Fast, free, no signup.', images: ['https://simplifyconvert.com/og-image.jpg'] },
  alternates: { canonical: 'https://simplifyconvert.com/all-tools/jpg-to-png' },
};

export default function JpgToPngLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
