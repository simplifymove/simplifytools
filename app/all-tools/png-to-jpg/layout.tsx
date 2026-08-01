import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'PNG to JPG - Transparency and JPEG Tradeoffs',
  description: 'Convert one PNG to a same-dimension JPEG and understand transparency loss, opaque background behavior, recompression artifacts, and file-size tradeoffs.',
  keywords: ['PNG to JPG', 'convert PNG to JPG', 'PNG converter', 'JPG converter', 'remove transparency', 'online converter', 'image compression'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://simplifyconvert.com/all-tools/png-to-jpg',
    siteName: 'SimplifyConvert',
    title: 'PNG to JPG - Transparency and JPEG Tradeoffs',
    description: 'Create a same-dimension JPEG copy while reviewing transparency and recompression limitations.',
    images: [{ url: 'https://simplifyconvert.com/og-image.jpg', width: 1200, height: 630, alt: 'PNG to JPG Converter' }],
  },
  twitter: { card: 'summary_large_image', title: 'PNG to JPG Converter', description: 'Convert PNG to JPEG with clear transparency and quality caveats.', images: ['https://simplifyconvert.com/og-image.jpg'] },
  alternates: { canonical: 'https://simplifyconvert.com/all-tools/png-to-jpg' },
};

export default function PngToJpgLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
