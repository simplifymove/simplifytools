import { Metadata } from 'next';
import { notFound } from 'next/navigation';

// Calculator metadata map
const calculatorMetadata: Record<string, { title: string; description: string }> = {
  'startup-runway': {
    title: 'Startup Runway Calculator - Forecast Funding Needs',
    description: 'Calculate your startup\'s financial runway, burn rate, and funding requirements. Project cash runway and monthly burn costs.',
  },
  'saas-profit': {
    title: 'SaaS Profit Simulator - Revenue & Growth Modeling',
    description: 'Model SaaS revenue growth, profitability, churn rates, and customer acquisition costs. Analyze your business profitability.',
  },
  'loan-optimizer': {
    title: 'Loan Optimization Engine - Payment Strategy Analyzer',
    description: 'Analyze loan terms, calculate monthly payments, and optimize your payment strategy to save money on interest.',
  },
  'india-tax': {
    title: 'India Tax Estimator Under Review | SimplifyConvert',
    description: 'This India Tax Estimator is under review and should not be used for current tax filing calculations.',
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  
  const meta = calculatorMetadata[slug];
  if (!meta) notFound();

  const canonicalUrl = `https://simplifyconvert.com/all-tools/financial-calculators/${slug}`;

  return {
    title: meta.title,
    description: meta.description,
    keywords: ['financial calculator', 'calculator', slug.replace(/-/g, ' ')],
    openGraph: {
      type: 'website',
      locale: 'en_US',
      url: canonicalUrl,
      siteName: 'SimplifyConvert',
      title: meta.title,
      description: meta.description,
      images: [
        {
          url: 'https://simplifyconvert.com/og-image.jpg',
          width: 1200,
          height: 630,
          alt: meta.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: meta.title,
      description: meta.description,
      images: ['https://simplifyconvert.com/og-image.jpg'],
    },
    alternates: {
      canonical: canonicalUrl,
    },
    robots: slug === 'india-tax'
      ? { index: false, follow: true }
      : { index: true, follow: true },
  };
}

export default async function CalculatorLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!calculatorMetadata[slug]) notFound();

  return <>{children}</>;
}
