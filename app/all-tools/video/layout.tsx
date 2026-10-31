import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free Video Tools Online - Convert & Compress Videos',
  description: 'Browse online video tools for conversion, compression, trimming, audio extraction, transcription, and other media tasks. Supported formats and processing options vary by tool.',
  keywords: ['free video tools', 'video converter online', 'compress video', 'edit video online', 'convert MP4 free', 'video compression tool'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://simplifyconvert.com/all-tools/video-tools',
    siteName: 'SimplifyConvert',
    title: 'Free Video Tools Online - Convert & Compress Videos',
    description: 'Convert, compress, trim, and edit supported video formats online for free. No signup is required; output depends on the selected tool and source.',
    images: [
      {
        url: 'https://simplifyconvert.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Free video tools online for converting, compressing, and editing videos',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Video Tools Online - Convert & Compress Videos',
    description: 'Convert, compress, trim and edit videos online for free. No signup needed.',
    images: ['https://simplifyconvert.com/og-image.jpg'],
  },
  alternates: {
    canonical: 'https://simplifyconvert.com/all-tools/video-tools',
  },
};

export default function VideoLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
