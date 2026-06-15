import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free Video Tools Online - Convert & Compress Videos',
  description: 'Free online video tools to convert, compress, trim, and edit videos in any format. Fast, secure, and no signup required. Works on all devices.',
  keywords: ['free video tools', 'video converter online', 'compress video', 'edit video online', 'convert MP4 free', 'video compression tool'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://simplifyconvert.com/all-tools/video-tools',
    siteName: 'SimplifyConvert',
    title: 'Free Video Tools Online - Convert & Compress Videos',
    description: 'Convert, compress, trim and edit videos online for free. No signup, no watermarks, completely free.',
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
