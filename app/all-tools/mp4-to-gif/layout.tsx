import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'MP4 to GIF - Free Online Tool | SimplifyConvert',
  description: 'Convert and edit mp4 to gif online instantly. Free tool without signup required.',
  keywords: ['mp4 to gif', 'free tool', 'online converter'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://simplifyconvert.com/all-tools/mp4-to-gif',
    siteName: 'SimplifyConvert',
    title: 'MP4 to GIF - Free Online Tool',
    description: 'Convert and edit mp4 to gif online instantly. Free tool without signup required.',
    images: [{ url: 'https://simplifyconvert.com/og-image.jpg', width: 1200, height: 630, alt: 'MP4 to GIF' }],
  },
  twitter: { card: 'summary_large_image', title: 'MP4 to GIF', description: 'Convert and edit mp4 to gif online instantly. Free tool without signup required.', images: ['https://simplifyconvert.com/og-image.jpg'] },
  alternates: { canonical: 'https://simplifyconvert.com/all-tools/mp4-to-gif' },
};

export default function Mp4ToGifLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
