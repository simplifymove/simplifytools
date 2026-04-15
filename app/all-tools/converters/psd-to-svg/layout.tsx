import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'PSD to SVG - Free Photoshop to Vector Converter | SimplifyConvert',
  description: 'Convert PSD designs to SVG vector format. Vectorize Photoshop files easily.',
  keywords: ['psd to svg', 'convert psd', 'vector converter', 'free tool'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://simplifyconvert.com/all-tools/converters/psd-to-svg',
    siteName: 'SimplifyConvert',
    title: 'PSD to SVG - Free Photoshop to Vector Converter',
    description: 'Convert PSD designs to SVG vector format.',
    images: [{ url: 'https://simplifyconvert.com/og-image.jpg', width: 1200, height: 630, alt: 'PSD to SVG' }],
  },
  twitter: { card: 'summary_large_image', title: 'PSD to SVG - Free Photoshop to Vector Converter', description: 'Convert PSD designs to SVG vector format.', images: ['https://simplifyconvert.com/og-image.jpg'] },
  alternates: { canonical: 'https://simplifyconvert.com/all-tools/converters/psd-to-svg' },
};

export default function PsdToSvgLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
