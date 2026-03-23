import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy - SimplifyConvert',
  description: 'Read SimplifyConvert privacy policy to understand how we protect your data and use it.',
  keywords: ['privacy policy', 'data protection'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://simplifyconvert.com/privacy',
    siteName: 'SimplifyConvert',
    title: 'Privacy Policy - SimplifyConvert',
    description: 'Read our privacy policy.',
    images: [
      {
        url: 'https://simplifyconvert.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Privacy Policy',
      },
    ],
  },
  alternates: {
    canonical: 'https://simplifyconvert.com/privacy',
  },
};

export default function PrivacyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
