import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Compress Image - Free Image Compressor Tool | SimplifyConvert',
  description: 'Reduce image file sizes while maintaining quality. Optimize images for web instantly.',
  keywords: ['compress image', 'image compressor', 'image optimization', 'free tool'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://simplifyconvert.com/all-tools/compress-image',
    siteName: 'SimplifyConvert',
    title: 'Compress Image - Free Image Compressor Tool',
    description: 'Reduce image file sizes while maintaining quality.',
    images: [{ url: 'https://simplifyconvert.com/og-image.jpg', width: 1200, height: 630, alt: 'Compress Image' }],
  },
  twitter: { card: 'summary_large_image', title: 'Compress Image - Free Image Compressor Tool', description: 'Reduce image file sizes while maintaining quality.', images: ['https://simplifyconvert.com/og-image.jpg'] },
  alternates: { canonical: 'https://simplifyconvert.com/all-tools/compress-image' },
};

export default function CompressImageLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

