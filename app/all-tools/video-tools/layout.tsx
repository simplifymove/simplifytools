import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Video Tools - Convert, Compress, Edit Videos Online | SimplifyConvert',
  description: 'Free video tools online. Convert, compress, trim, and edit videos in any format. MP4, WebM, MKV, and more. No software installation needed.',
  keywords: ['video converter', 'video editor', 'compress video', 'video compression', 'online video tools'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://simplifyconvert.com/all-tools/video-tools',
    siteName: 'SimplifyConvert',
    title: 'Video Tools - Free Online Video Converter & Editor',
    description: 'Convert, compress, trim and edit videos online for free in any format.',
    images: [
      {
        url: 'https://simplifyconvert.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Video Tools',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Video Tools - Free Online Video Converter & Editor',
    description: 'Convert, compress, trim and edit videos online for free.',
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

