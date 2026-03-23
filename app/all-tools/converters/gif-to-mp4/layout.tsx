import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'GIF to MP4 - Free Animation to Video Converter | SimplifyConvert',
  description: 'Convert GIF animations to MP4 video format. Smaller files with better quality.',
  keywords: ['gif to mp4', 'convert gif', 'animation to video', 'free tool'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://simplifyconvert.com/all-tools/converters/gif-to-mp4',
    siteName: 'SimplifyConvert',
    title: 'GIF to MP4 - Free Animation to Video Converter',
    description: 'Convert GIF animations to MP4 video format.',
    images: [{ url: 'https://simplifyconvert.com/og-image.jpg', width: 1200, height: 630, alt: 'GIF to MP4' }],
  },
  twitter: { card: 'summary_large_image', title: 'GIF to MP4 - Free Animation to Video Converter', description: 'Convert GIF animations to MP4 video format.', images: ['https://simplifyconvert.com/og-image.jpg'] },
  alternates: { canonical: 'https://simplifyconvert.com/all-tools/converters/gif-to-mp4' },
};

export default function GifToMp4Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
