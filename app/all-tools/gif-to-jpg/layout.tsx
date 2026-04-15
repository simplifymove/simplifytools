import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'GIF to JPG - Free Animated to Static Converter | SimplifyConvert',
  description: 'Convert GIF animations to JPG static images. Extract single frames or combine.',
  keywords: ['gif to jpg', 'convert gif', 'animation converter', 'free tool'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://simplifyconvert.com/all-tools/converters/gif-to-jpg',
    siteName: 'SimplifyConvert',
    title: 'GIF to JPG - Free Animated to Static Converter',
    description: 'Convert GIF animations to JPG static images.',
    images: [{ url: 'https://simplifyconvert.com/og-image.jpg', width: 1200, height: 630, alt: 'GIF to JPG' }],
  },
  twitter: { card: 'summary_large_image', title: 'GIF to JPG - Free Animated to Static Converter', description: 'Convert GIF animations to JPG static images.', images: ['https://simplifyconvert.com/og-image.jpg'] },
  alternates: { canonical: 'https://simplifyconvert.com/all-tools/converters/gif-to-jpg' },
};

export default function GifToJpgLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

