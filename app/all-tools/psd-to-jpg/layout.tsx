import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'PSD to JPG - Free Photoshop to JPEG Converter | SimplifyConvert',
  description: 'Convert PSD Photoshop files to JPG format. Export and share designs easily.',
  keywords: ['psd to jpg', 'convert psd', 'photoshop converter', 'free tool'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://simplifyconvert.com/all-tools/converters/psd-to-jpg',
    siteName: 'SimplifyConvert',
    title: 'PSD to JPG - Free Photoshop to JPEG Converter',
    description: 'Convert PSD Photoshop files to JPG format.',
    images: [{ url: 'https://simplifyconvert.com/og-image.jpg', width: 1200, height: 630, alt: 'PSD to JPG' }],
  },
  twitter: { card: 'summary_large_image', title: 'PSD to JPG - Free Photoshop to JPEG Converter', description: 'Convert PSD Photoshop files to JPG format.', images: ['https://simplifyconvert.com/og-image.jpg'] },
  alternates: { canonical: 'https://simplifyconvert.com/all-tools/converters/psd-to-jpg' },
};

export default function PsdToJpgLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
