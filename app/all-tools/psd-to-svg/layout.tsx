import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'PSD to SVG - Free Photoshop to Vector Converter | SimplifyConvert',
  description: 'Convert Photoshop PSD designs to SVG vector format using industry-standard vectorization. Perfect for logos, icons, and graphics.',
  keywords: ['psd to svg', 'convert psd', 'photoshop to vector', 'vectorize psd', 'logo vectorizer', 'free tool'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://simplifyconvert.com/all-tools/psd-to-svg',
    siteName: 'SimplifyConvert',
    title: 'PSD to SVG - Free Photoshop to Vector Converter',
    description: 'Convert Photoshop PSD designs to scalable SVG vector format.',
    images: [{ url: 'https://simplifyconvert.com/og-image.jpg', width: 1200, height: 630, alt: 'PSD to SVG Converter' }],
  },
  twitter: { card: 'summary_large_image', title: 'PSD to SVG Vectorizer', description: 'Convert PSD to vector SVG with Potrace vectorization technology.', images: ['https://simplifyconvert.com/og-image.jpg'] },
  alternates: { canonical: 'https://simplifyconvert.com/all-tools/psd-to-svg' },
};

export default function PsdToSvgLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

