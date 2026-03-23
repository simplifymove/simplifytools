import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Code Tools - Free Code Formatting & Conversion | SimplifyConvert',
  description: 'Format, validate, convert, and minify code. Work with JSON, XML, JavaScript, Python and more.',
  keywords: ['code tools', 'code formatter', 'code converter', 'code validator', 'free tool'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://simplifyconvert.com/all-tools/code',
    siteName: 'SimplifyConvert',
    title: 'Code Tools - Free Code Formatting & Conversion',
    description: 'Format, validate, convert, and minify code.',
    images: [{ url: 'https://simplifyconvert.com/og-image.jpg', width: 1200, height: 630, alt: 'Code Tools' }],
  },
  twitter: { card: 'summary_large_image', title: 'Code Tools - Free Code Formatting & Conversion', description: 'Format, validate, convert, and minify code.', images: ['https://simplifyconvert.com/og-image.jpg'] },
  alternates: { canonical: 'https://simplifyconvert.com/all-tools/code' },
};

export default function CodeLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
