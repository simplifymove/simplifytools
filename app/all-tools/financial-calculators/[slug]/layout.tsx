import { Metadata } from 'next';
import { notFound } from 'next/navigation';

// Calculator metadata map
const calculatorMetadata: Record<string, { title: string; description: string }> = {
  'startup-runway': {
    title: 'Startup Runway Calculator - Estimate Cash Runway',
    description: 'Estimate startup runway, burn, and possible funding needs from the values and growth assumptions entered.',
  },
  'saas-profit': {
    title: 'SaaS Profit Simulator - Revenue and Cost Scenarios',
    description: 'Explore SaaS revenue, costs, churn, customer acquisition, and profitability scenarios using the assumptions entered.',
  },
  'loan-optimizer': {
    title: 'Loan Repayment Calculator - EMI and Interest Estimate',
    description: 'Estimate monthly EMI, total interest, repayment timing, and the effect of additional payments from the loan terms entered.',
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
