import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'PSD to PNG Converter - Convert Photoshop Files to PNG Online Free',
  description: 'Convert PSD (Photoshop) files to PNG format instantly. Free online PSD to PNG converter with transparency support, no registration required.',
  keywords: 'PSD to PNG, convert PSD to PNG, Photoshop to PNG, PSD converter, image converter, free converter, online tool, file conversion, Photoshop export, PNG export',
  robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
  authors: [{ name: 'SimplifyConvert' }],
  applicationName: 'PSD to PNG Converter',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://simplifyconvert.com/all-tools/psd-to-png',
    siteName: 'SimplifyConvert',
    title: 'PSD to PNG Converter - Free Online Tool',
    description: 'Convert Photoshop PSD files to PNG format instantly with full transparency support.',
    images: [{ url: 'https://simplifyconvert.com/og-image.jpg', width: 1200, height: 630, alt: 'PSD to PNG Converter' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PSD to PNG Converter - Free Online',
    description: 'Convert Photoshop files to PNG format instantly',
    images: ['https://simplifyconvert.com/og-image.jpg'],
  },
  alternates: { canonical: 'https://simplifyconvert.com/all-tools/psd-to-png' },
};

export default function PsdToPngLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

