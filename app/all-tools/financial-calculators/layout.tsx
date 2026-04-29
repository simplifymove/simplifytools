import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free Financial Calculators for Loans, Tax & Startups',
  description: 'Advanced financial calculators for startups, SaaS businesses, loans & taxes. Real-time modeling and projections. Free, no signup required.',
  keywords: ['financial calculators', 'free financial calculators', 'online financial calculator', 'startup calculator', 'business calculator', 'loan calculator', 'tax calculator', 'financial planning tool'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://simplifyconvert.com/all-tools/financial-calculators',
    siteName: 'SimplifyConvert',
    title: 'Free Financial Calculators for Loans, Tax & Startups',
    description: 'Advanced financial calculators for startups, SaaS, loan optimization, and tax planning. Designed for advanced analysis, instant results',
    images: [
      {
        url: 'https://simplifyconvert.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Free advanced financial calculators for business planning and analysis',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Financial Calculators for Loans, Tax & Startups',
    description: 'Advanced financial calculators for startups, SaaS, loan optimization, and tax planning. Real-time modeling, no signup',
    images: ['https://simplifyconvert.com/og-image.jpg'],
  },
  alternates: {
    canonical: 'https://simplifyconvert.com/all-tools/financial-calculators',
  },
};

export default function FinancialCalculatorsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
