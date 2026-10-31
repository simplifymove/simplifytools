import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'PDF Tools - Free Online Tool | SimplifyConvert',
  description: "Convert, edit, organize, and work with PDF files online using SimplifyConvert's collection of PDF tools.",
  keywords: ['pdf', 'free tool', 'online converter'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://simplifyconvert.com/all-tools/pdf',
    siteName: 'SimplifyConvert',
    title: 'PDF Tools - Free Online Tool',
    description: "Convert, edit, organize, and work with PDF files online using SimplifyConvert's collection of PDF tools.",
    images: [{ url: 'https://simplifyconvert.com/og-image.jpg', width: 1200, height: 630, alt: 'PDF Tools' }],
  },
  twitter: { card: 'summary_large_image', title: 'PDF Tools', description: "Convert, edit, organize, and work with PDF files online using SimplifyConvert's collection of PDF tools.", images: ['https://simplifyconvert.com/og-image.jpg'] },
};

export default function PdfLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
