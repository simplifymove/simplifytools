import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Video Tools - Free Online Tool | SimplifyConvert',
  description: 'Convert and edit video online instantly. Free tool without signup required.',
  keywords: ['video', 'free tool', 'online converter'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://simplifyconvert.com/all-tools/video',
    siteName: 'SimplifyConvert',
    title: 'Video Tools - Free Online Tool',
    description: 'Convert and edit video online instantly. Free tool without signup required.',
    images: [{ url: 'https://simplifyconvert.com/og-image.jpg', width: 1200, height: 630, alt: 'Video Tools' }],
  },
  twitter: { card: 'summary_large_image', title: 'Video Tools', description: 'Convert and edit video online instantly. Free tool without signup required.', images: ['https://simplifyconvert.com/og-image.jpg'] },
  alternates: { canonical: 'https://simplifyconvert.com/all-tools/video' },
};

export default function VideoLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
