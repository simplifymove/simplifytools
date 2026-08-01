import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Financial Calculators for Startups, SaaS, Loans & Tax',
  description: 'Explore focused calculators for startup runway, SaaS profit, loan repayment, and Indian income tax estimates. Results are informational, not financial advice.',
  keywords: ['financial calculators', 'free financial calculators', 'online financial calculator', 'startup calculator', 'business calculator', 'loan calculator', 'tax calculator', 'financial planning tool'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://simplifyconvert.com/all-tools/financial-calculators',
    siteName: 'SimplifyConvert',
    title: 'Free Financial Calculators for Loans, Tax & Startups',
    description: 'Focused estimates for startup runway, SaaS profit, loan repayment, and Indian income tax.',
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
    description: 'Focused estimates for startup runway, SaaS profit, loan repayment, and Indian income tax.',
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
