import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy - SimplifyConvert',
  description: 'Learn how SimplifyConvert handles files, accounts, AI Studio content, analytics, advertising, cookies, payments, and temporary download results.',
  keywords: ['privacy policy', 'data protection'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://simplifyconvert.com/privacy',
    siteName: 'SimplifyConvert',
    title: 'Privacy Policy - SimplifyConvert',
    description: 'How SimplifyConvert handles files, accounts, AI content, analytics, advertising, cookies, and payments.',
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
