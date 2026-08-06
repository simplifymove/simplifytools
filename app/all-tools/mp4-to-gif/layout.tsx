import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'MP4 to GIF Converter - Create Animated GIFs | SimplifyConvert',
  description: 'Convert MP4 video clips to animated GIF output with server-side processing and GIF-specific conversion settings.',
  keywords: ['mp4 to gif', 'free tool', 'online converter'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://simplifyconvert.com/all-tools/mp4-to-gif',
    siteName: 'SimplifyConvert',
    title: 'MP4 to GIF Converter - Create Animated GIFs',
    description: 'Convert MP4 video clips to animated GIF output with server-side processing and GIF-specific conversion settings.',
    images: [{ url: 'https://simplifyconvert.com/og-image.jpg', width: 1200, height: 630, alt: 'MP4 to GIF' }],
  },
  twitter: { card: 'summary_large_image', title: 'MP4 to GIF', description: 'Convert MP4 video clips to animated GIF output with server-side processing and GIF-specific conversion settings.', images: ['https://simplifyconvert.com/og-image.jpg'] },
  alternates: { canonical: 'https://simplifyconvert.com/all-tools/mp4-to-gif' },
};

export default function Mp4ToGifLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
