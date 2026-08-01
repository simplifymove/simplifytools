import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cookie Policy | SimplifyConvert',
  description: 'Learn how SimplifyConvert uses authentication and preference cookies, analytics, advertising technologies, browser storage, and payment-provider cookies.',
  alternates: {
    canonical: 'https://simplifyconvert.com/cookies',
  },
  openGraph: {
    type: 'website',
    url: 'https://simplifyconvert.com/cookies',
    siteName: 'SimplifyConvert',
    title: 'Cookie Policy | SimplifyConvert',
    description: 'How SimplifyConvert uses authentication, preferences, analytics, advertising, browser storage, and payment-provider cookies.',
    images: [
      {
        url: 'https://simplifyconvert.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'SimplifyConvert Cookie Policy',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cookie Policy | SimplifyConvert',
    description: 'Learn how SimplifyConvert uses cookies and how to manage your cookie preferences.',
    images: ['https://simplifyconvert.com/og-image.jpg'],
  },
};

export default function CookiesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
