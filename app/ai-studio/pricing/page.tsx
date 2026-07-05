import type { Metadata } from 'next';
import Link from 'next/link';
import { CheckCircle, ChevronRight, CreditCard, Sparkles, WalletCards } from 'lucide-react';
import { HomeHeader } from '@/app/components/HomeHeader';
import { AI_STUDIO_PLANS, type AiStudioPlanConfig } from '@/lib/ai-studio/plans';
import { getAiStudioRequestRegion } from '@/lib/ai-studio/region';
import { getAiStudioAccessForCurrentUser } from '@/lib/entitlements/ai-studio-server';
import { PremiumAccessRequired } from '../components/PremiumAccessRequired';

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

function formatPlanPrice(plan: AiStudioPlanConfig) {
  const majorAmount = plan.grossAmountMinor / 100;

  if (plan.currency === 'INR') {
    return `₹${majorAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
  }

  return `$${majorAmount.toFixed(2)}`;
}

function formatCreditValue(plan: AiStudioPlanConfig) {
  const majorAmount = plan.aiCreditAmountMinor / 100;

  if (plan.currency === 'INR') {
    return `₹${majorAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })} AI credits value`;
  }

  return `$${majorAmount.toFixed(2)} AI credits value`;
}

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
            </div>
          </div>
        </section>

        <section className="bg-[#f7f8fb] px-4 py-10 text-slate-950 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[980px]">
            <div className="grid gap-5 md:grid-cols-2">
              {plans.map((plan) => (
                <article key={plan.id} className="rounded-lg border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/70">
                  <div className="mb-6 flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wide text-cyan-800">
                        {plan.region === 'india' ? 'India' : 'Global'}
                      </p>
                      <h2 className="mt-2 text-2xl font-bold text-slate-950">
                        {plan.name.replace('India ', '').replace('Global ', '')}
                      </h2>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-950 text-cyan-100">
                      <CreditCard size={22} />
                    </div>
                  </div>

                  <div className="flex items-end gap-2">
                    <span className="text-4xl font-bold text-slate-950">{formatPlanPrice(plan)}</span>
                    <span className="pb-2 text-sm font-semibold text-slate-500">gross plan price</span>
                  </div>

                  <div className="mt-6 rounded-lg border border-cyan-100 bg-cyan-50 p-4">
                    <p className="text-sm font-bold text-cyan-950">
                      {plan.creditsGranted.toLocaleString()} AI credits
                    </p>
                    <p className="mt-1 text-sm leading-6 text-cyan-900">{formatCreditValue(plan)}</p>
                  </div>

                  <ul className="mt-6 space-y-3 text-sm leading-6 text-slate-700">
                    {[
                      'AI-powered content planning',
                      'Smart visual layouts',
                      'PPTX export',
                      'Professional themes',
                      'Images and visual storytelling',
                    ].map((feature) => (
                      <li key={feature} className="flex gap-2">
                        <CheckCircle size={17} className="mt-0.5 shrink-0 text-cyan-700" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    type="button"
                    className="mt-7 inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 text-sm font-semibold text-white shadow-lg shadow-slate-950/20"
                  >
                    Payment integration coming next
                  </button>
                </article>
              ))}
            </div>

            <div className="mt-6 rounded-lg border border-slate-200 bg-white p-5 text-sm leading-6 text-slate-600 shadow-sm">
              Payments are not connected on this page yet. Razorpay will be used for India plans and Stripe will be
              used for global plans in the next billing phase.
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
