import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us - SimplifyConvert',
  description: 'Get in touch with SimplifyConvert. We would love to hear from you about feedback, bugs, or feature requests.',
  keywords: ['contact', 'support', 'feedback'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://simplifyconvert.com/contact',
    siteName: 'SimplifyConvert',
    title: 'Contact Us - SimplifyConvert',
    description: 'Get in touch with us.',
    images: [
      {
        url: 'https://simplifyconvert.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Contact Us',
      },
    ],
  },
  alternates: {
    canonical: 'https://simplifyconvert.com/contact',
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
