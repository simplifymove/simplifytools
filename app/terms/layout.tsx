import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service - SimplifyConvert',
  description: 'Read SimplifyConvert terms of service and conditions of use.',
  keywords: ['terms of service', 'terms and conditions'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://simplifyconvert.com/terms',
    siteName: 'SimplifyConvert',
    title: 'Terms of Service - SimplifyConvert',
    description: 'Read our terms of service.',
    images: [
      {
        url: 'https://simplifyconvert.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Terms of Service',
      },
    ],
  },
  alternates: {
    canonical: 'https://simplifyconvert.com/terms',
  },
};

export default function TermsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
