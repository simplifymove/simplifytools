import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'PNG to JPG Converter - Remove Transparency & Compress | SimplifyConvert',
  description: 'Convert PNG to JPG online with background color options. Remove transparency and reduce file size instantly. Free and fast.',
  keywords: ['PNG to JPG', 'convert PNG to JPG', 'PNG converter', 'JPG converter', 'remove transparency', 'online converter', 'image compression'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://simplifyconvert.com/all-tools/png-to-jpg',
    siteName: 'SimplifyConvert',
    title: 'PNG to JPG Converter - Remove Transparency',
    description: 'Convert PNG to JPG with background color options. Remove transparency and reduce file size. Free online tool.',
    images: [{ url: 'https://simplifyconvert.com/og-image.jpg', width: 1200, height: 630, alt: 'PNG to JPG Converter' }],
  },
  twitter: { card: 'summary_large_image', title: 'PNG to JPG Converter - Convert Online', description: 'Convert PNG to JPG, remove transparency, reduce file size. Fast and free.', images: ['https://simplifyconvert.com/og-image.jpg'] },
  alternates: { canonical: 'https://simplifyconvert.com/all-tools/png-to-jpg' },
};

export default function PngToJpgLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
