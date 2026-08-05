import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'PSD to AI Converter - Convert PSD Files Online | SimplifyConvert',
  description:
    'Convert Photoshop PSD files to AI output online. Choose conversion quality, process the file, and download the generated AI result.',
  keywords: [
    'PSD to AI',
    'convert PSD to AI',
    'PSD converter',
    'AI file converter',
    'Photoshop PSD conversion',
  ],
  alternates: {
    canonical: 'https://simplifyconvert.com/all-tools/psd-to-ai',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://simplifyconvert.com/all-tools/psd-to-ai',
    siteName: 'SimplifyConvert',
    title: 'PSD to AI Converter',
    description:
      'Convert PSD files to AI output online with selectable conversion quality.',
    images: [
      {
        url: 'https://simplifyconvert.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'PSD to AI Converter',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PSD to AI Converter | SimplifyConvert',
    description:
      'Convert PSD files to AI output online with selectable conversion quality.',
    images: ['https://simplifyconvert.com/og-image.jpg'],
  },
};

export default function PsdToAiLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
