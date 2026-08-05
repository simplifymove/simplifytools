import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Convert Image to PNG Online - Free PNG Converter | SimplifyConvert',
  description: 'Convert supported image files to PNG format online. Preview the image, create a PNG version, and continue to download when conversion is complete.',
  keywords: ['edit to png', 'free tool', 'online converter'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://simplifyconvert.com/all-tools/edit-to-png',
    siteName: 'SimplifyConvert',
    title: 'Edit to PNG - Free Online Tool',
    description: 'Convert supported image files to PNG format online. Preview the image, create a PNG version, and continue to download when conversion is complete.',
    images: [{ url: 'https://simplifyconvert.com/og-image.jpg', width: 1200, height: 630, alt: 'Edit to PNG' }],
  },
  twitter: { card: 'summary_large_image', title: 'Edit to PNG', description: 'Convert supported image files to PNG format online. Preview the image, create a PNG version, and continue to download when conversion is complete.', images: ['https://simplifyconvert.com/og-image.jpg'] },
  alternates: { canonical: 'https://simplifyconvert.com/all-tools/edit-to-png' },
};

export default function EditToPngLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
