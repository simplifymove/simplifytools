import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Website SEO Checker - Audit Your Website Online',
  description:
    'Check your website for technical and on-page SEO issues, including titles, meta descriptions, headings, canonicals, broken links, crawl coverage, images, structured data, and more.',
  alternates: {
    canonical: 'https://simplifyconvert.com/all-tools/website-seo-checker',
  },
  openGraph: {
    title: 'Website SEO Checker - Audit Your Website Online',
    description:
      'Audit your website for technical and on-page SEO issues with SimplifyConvert.',
    url: 'https://simplifyconvert.com/all-tools/website-seo-checker',
    type: 'website',
  },
};

export default function WebsiteSeoCheckerLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
