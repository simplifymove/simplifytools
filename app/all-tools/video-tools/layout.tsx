import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Video Tools - Convert, Compress, Trim & Extract',
  description: 'Browse server-assisted video tools for conversion, compression, trimming, audio extraction, and related media workflows. Support varies by tool.',
  keywords: ['free video tools', 'video converter online', 'compress video', 'edit video online', 'convert MP4 free', 'video compression tool'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://simplifyconvert.com/all-tools/video-tools',
    siteName: 'SimplifyConvert',
    title: 'Video Tools - Convert, Compress, Trim & Extract',
    description: 'Convert, compress, trim, and extract media with workflow-specific tools.',
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
    title: 'Video Tools - Convert, Compress, Trim & Extract',
    description: 'Convert, compress, trim, and extract media with workflow-specific tools.',
    images: ['https://simplifyconvert.com/og-image.jpg'],
  },
  alternates: {
    canonical: 'https://simplifyconvert.com/all-tools/video-tools',
  },
};

export default function VideoToolsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
