import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronRight, History, Sparkles, WalletCards } from 'lucide-react';
import { HomeHeader } from '@/app/components/HomeHeader';
import { AI_STUDIO_PLANS } from '@/lib/ai-studio/plans';
import { getAiStudioRequestRegion } from '@/lib/ai-studio/region';
import { getAiStudioAccessForCurrentUser } from '@/lib/entitlements/ai-studio-server';
import { PremiumAccessRequired } from '../components/PremiumAccessRequired';
import { AiStudioPricingClient } from './AiStudioPricingClient';

export const metadata: Metadata = {
  title: 'AI Studio Pricing | SimplifyConvert',
  description:
    'Buy AI Studio credits for premium AI presentation generation, smart visual layouts, and PPTX export.',
  alternates: {
    canonical: 'https://simplifyconvert.com/ai-studio/pricing',
  },
  openGraph: {
    title: 'AI Studio Pricing | SimplifyConvert',
    description:
      'AI Studio credit plans for premium presentation generation, visual storytelling, and PPTX export.',
    url: 'https://simplifyconvert.com/ai-studio/pricing',
    siteName: 'SimplifyConvert',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Studio Pricing | SimplifyConvert',
    description: 'Choose AI Studio credits for professional AI presentation generation.',
  },
};

export const dynamic = 'force-dynamic';

export default async function AiStudioPricingPage() {
  const access = await getAiStudioAccessForCurrentUser();

  if (!access.allowed) {
    return <PremiumAccessRequired toolName="AI Studio Credits" returnTo="/ai-studio/pricing" />;
  }

  const region = await getAiStudioRequestRegion();
  const plans = AI_STUDIO_PLANS.filter((plan) => plan.region === region);
  const regionLabel = region === 'india' ? 'India plans · INR' : 'Global plans · USD';

  return (
    <>
      <HomeHeader />
      <main className="min-h-screen bg-[#080a12] text-white">
        <section className="relative overflow-hidden px-4 pt-8 pb-10 sm:px-6 lg:px-8">
          <div className="absolute inset-0 bg-[linear-gradient(135deg,#080a12_0%,#111827_35%,#12343b_70%,#312e81_100%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(103,232,249,0.22),rgba(8,10,18,0)_44%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.10)_0%,rgba(255,255,255,0)_42%,rgba(255,255,255,0.06)_100%)]" />

          <div className="relative z-10 mx-auto max-w-7xl">
            <nav className="mb-8 flex items-center gap-2 text-sm text-white/70" aria-label="Breadcrumb">
              <Link href="/" className="transition hover:text-white">
                Home
              </Link>
              <ChevronRight size={16} />
              <Link href="/ai-studio" className="transition hover:text-white">
                AI Studio
              </Link>
              <ChevronRight size={16} />
              <span>Pricing</span>
            </nav>

            <div className="mx-auto max-w-3xl text-center">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-cyan-50 shadow-lg shadow-cyan-950/30 backdrop-blur">
                <Sparkles size={16} />
                AI Studio
                <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-950">
                  Premium
                </span>
              </div>
              <h1 className="text-4xl font-bold tracking-normal text-white sm:text-5xl">
                Buy AI Studio Credits
              </h1>
              <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-white/78 sm:text-lg">
                Choose credits for professional AI presentations, smart visual layouts, images and visual storytelling,
                and PPTX export.
              </p>
              <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-cyan-50">
                <WalletCards size={16} />
                {regionLabel}
              </div>
              <div className="mt-5">
                <Link
                  href="/ai-studio/billing"
                  className="inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/15"
                >
                  <History size={16} />
                  Billing History
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-[#f7f8fb] px-4 py-10 text-slate-950 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[980px]">
            <AiStudioPricingClient plans={plans} />

            <div className="mt-6 rounded-lg border border-slate-200 bg-white p-5 text-sm leading-6 text-slate-600 shadow-sm">
              Razorpay checkout is enabled for India plans. Stripe Checkout is enabled for global USD plans as a
              one-time AI Credits purchase.
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
