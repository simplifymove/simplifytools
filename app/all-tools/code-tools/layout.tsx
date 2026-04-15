import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Code Tools - Minifier, Formatter, Compiler Tools | SimplifyConvert',
  description: 'Free code tools for developers. Minify, format, validate, and compile code. Support for JavaScript, CSS, HTML, JSON, and more.',
  keywords: ['code minifier', 'code formatter', 'developer tools', 'code compiler', 'code validator'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://simplifyconvert.com/all-tools/code-tools',
    siteName: 'SimplifyConvert',
    title: 'Code Tools - Free Online Code Minifier & Formatter',
    description: 'Minify, format, validate and compile code online for free.',
    images: [
      {
        url: 'https://simplifyconvert.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Code Tools',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Code Tools - Free Online Code Minifier & Formatter',
    description: 'Minify, format, validate and compile code online for free.',
    images: ['https://simplifyconvert.com/og-image.jpg'],
  },
  alternates: {
    canonical: 'https://simplifyconvert.com/all-tools/code-tools',
  },
};

export default function CodeToolsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

