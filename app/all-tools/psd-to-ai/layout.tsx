import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'PSD to AI - Free Photoshop to Illustrator Converter | SimplifyConvert',
  description: 'Convert PSD files to AI format. Import Photoshop designs into Adobe Illustrator.',
  keywords: ['psd to ai', 'convert psd', 'illustrator converter', 'free tool'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://simplifyconvert.com/all-tools/converters/psd-to-ai',
    siteName: 'SimplifyConvert',
    title: 'PSD to AI - Free Photoshop to Illustrator Converter',
    description: 'Convert PSD files to AI format.',
    images: [{ url: 'https://simplifyconvert.com/og-image.jpg', width: 1200, height: 630, alt: 'PSD to AI' }],
  },
  twitter: { card: 'summary_large_image', title: 'PSD to AI - Free Photoshop to Illustrator Converter', description: 'Convert PSD files to AI format.', images: ['https://simplifyconvert.com/og-image.jpg'] },
  alternates: { canonical: 'https://simplifyconvert.com/all-tools/converters/psd-to-ai' },
};

export default function PsdToAiLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
