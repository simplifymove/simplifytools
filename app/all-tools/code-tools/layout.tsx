import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Code Tools: Format, Minify & Validate Code',
  description: 'Developer utilities for formatting, minification, validation, encoding, decoding, conversion, and generation across supported code and data formats.',
  keywords: ['free code tools', 'code formatter', 'code minifier', 'online code editor', 'code validator', 'developer tools online', 'JSON formatter', 'HTML minifier'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://simplifyconvert.com/all-tools/code-tools',
    siteName: 'SimplifyConvert',
    title: 'Code Tools: Format, Minify & Validate Code',
    description: 'Browse 49 developer utilities for supported formatting, minification, validation, encoding, decoding, conversion, and generation workflows.',
    images: [
      {
        url: 'https://simplifyconvert.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Free code tools to format, minify, validate and convert code for developers',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Code Tools: Format, Minify & Validate Code',
    description: 'Browse developer utilities for supported formatting, minification, validation, encoding, decoding, conversion, and generation workflows.',
    images: ['https://simplifyconvert.com/og-image.jpg'],
  },
};

export default function CodeToolsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
