import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Edit to PNG - Free Online Tool | SimplifyConvert',
  description: 'Convert and edit edit to png online instantly. Free tool without signup required.',
  keywords: ['edit to png', 'free tool', 'online converter'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://simplifyconvert.com/all-tools/edit-to-png',
    siteName: 'SimplifyConvert',
    title: 'Edit to PNG - Free Online Tool',
    description: 'Convert and edit edit to png online instantly. Free tool without signup required.',
    images: [{ url: 'https://simplifyconvert.com/og-image.jpg', width: 1200, height: 630, alt: 'Edit to PNG' }],
  },
  twitter: { card: 'summary_large_image', title: 'Edit to PNG', description: 'Convert and edit edit to png online instantly. Free tool without signup required.', images: ['https://simplifyconvert.com/og-image.jpg'] },
  alternates: { canonical: 'https://simplifyconvert.com/all-tools/edit-to-png' },
};

export default function EditToPngLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
