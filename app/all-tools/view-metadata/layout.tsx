import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'View Image Properties Online - Image Metadata Viewer | SimplifyConvert',
  description: 'View basic image properties online including dimensions, file size, file type, aspect ratio, and modification time. Copy the displayed details instantly.',
  keywords: ['view metadata', 'free tool', 'online converter'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://simplifyconvert.com/all-tools/view-metadata',
    siteName: 'SimplifyConvert',
    title: 'View Metadata - Free Online Tool',
    description: 'View basic image properties online including dimensions, file size, file type, aspect ratio, and modification time. Copy the displayed details instantly.',
    images: [{ url: 'https://simplifyconvert.com/og-image.jpg', width: 1200, height: 630, alt: 'View Metadata' }],
  },
  twitter: { card: 'summary_large_image', title: 'View Metadata', description: 'View basic image properties online including dimensions, file size, file type, aspect ratio, and modification time. Copy the displayed details instantly.', images: ['https://simplifyconvert.com/og-image.jpg'] },
  alternates: { canonical: 'https://simplifyconvert.com/all-tools/view-metadata' },
};

export default function ViewMetadataLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
