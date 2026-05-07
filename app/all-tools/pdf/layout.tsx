import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'PDF Tools - Free Online Tool | SimplifyConvert',
  description: 'Convert and edit pdf online instantly. Free tool without signup required.',
  keywords: ['pdf', 'free tool', 'online converter'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://simplifyconvert.com/all-tools/pdf',
    siteName: 'SimplifyConvert',
    title: 'PDF Tools - Free Online Tool',
    description: 'Convert and edit pdf online instantly. Free tool without signup required.',
    images: [{ url: 'https://simplifyconvert.com/og-image.jpg', width: 1200, height: 630, alt: 'PDF Tools' }],
  },
  twitter: { card: 'summary_large_image', title: 'PDF Tools', description: 'Convert and edit pdf online instantly. Free tool without signup required.', images: ['https://simplifyconvert.com/og-image.jpg'] },
  alternates: { canonical: 'https://simplifyconvert.com/all-tools/pdf' },
};

export default function PdfLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
