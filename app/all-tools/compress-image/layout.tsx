import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Compress Image - Adjust Browser Encoding Quality',
  description: 'Re-encode one browser-supported image at its original dimensions with an adjustable quality setting, then compare the output size and visible artifacts.',
  keywords: ['compress image', 'image compressor', 'image optimization', 'reduce file size', 'optimize image', 'free tool', 'online compressor'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://simplifyconvert.com/all-tools/compress-image',
    siteName: 'SimplifyConvert',
    title: 'Compress Image - Adjust Browser Encoding Quality',
    description: 'Adjust image encoding quality without changing pixel dimensions.',
    images: [{ url: 'https://simplifyconvert.com/og-image.jpg', width: 1200, height: 630, alt: 'Image Compressor Tool' }],
  },
  twitter: { card: 'summary_large_image', title: 'Compress Image - Browser Image Compressor', description: 'Adjust image encoding quality and compare the resulting size.', images: ['https://simplifyconvert.com/og-image.jpg'] },
  alternates: { canonical: 'https://simplifyconvert.com/all-tools/compress-image' },
};

export default function CompressImageLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
