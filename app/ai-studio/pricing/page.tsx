import type { Metadata } from 'next';
import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { ChevronRight, History, Sparkles } from 'lucide-react';
import { HomeHeader } from '@/app/components/HomeHeader';
import { Footer } from '@/app/components/Footer';
import { AI_STUDIO_PLANS } from '@/lib/ai-studio/plans';
import { getAiStudioPricingRegion } from '@/lib/ai-studio/region';
import { getPayPalPublicClientId } from '@/lib/billing/paypal';
import { authOptions } from '@/lib/auth/config';
import { AiStudioNav } from '../components/AiStudioNav';
import { ProtectedAiStudioLink } from '../components/ProtectedAiStudioLink';
import { AiStudioPricingClient } from './AiStudioPricingClient';

export const metadata: Metadata = {
  title: 'AI Studio Pricing | SimplifyConvert',
  description:
    'Compare one-time AI Studio credit packs in INR or USD for editable presentations, documents, and spreadsheets.',
  alternates: {
    canonical: 'https://simplifyconvert.com/ai-studio/pricing',
  },
  openGraph: {
    title: 'AI Studio Pricing | SimplifyConvert',
    description:
      'One-time credit packs for editable AI presentations, documents, and spreadsheets.',
    url: 'https://simplifyconvert.com/ai-studio/pricing',
    siteName: 'SimplifyConvert',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Studio Pricing | SimplifyConvert',
    description: 'Choose one-time AI Studio credits in INR or USD.',
  },
};

export const dynamic = 'force-dynamic';

export default async function AiStudioPricingPage() {
  const [initialRegion, session] = await Promise.all([
    getAiStudioPricingRegion(),
    getServerSession(authOptions),
  ]);
  let paypalClientId: string | null = null;

  try {
    paypalClientId = getPayPalPublicClientId();
  } catch {
    paypalClientId = null;
  }

  return (
    <>
      <HomeHeader />
      <AiStudioNav />
      <main className="min-h-screen bg-[#080a12] text-white">
        <section className="relative overflow-hidden px-4 pt-8 pb-14 sm:px-6 lg:px-8">
          <div className="absolute inset-0 bg-[linear-gradient(135deg,#080a12_0%,#0f172a_42%,#083344_100%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(103,232,249,0.22),rgba(8,10,18,0)_46%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.10)_0%,rgba(255,255,255,0)_48%,rgba(255,255,255,0.04)_100%)]" />

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
                Simple, one-time AI Studio credits
              </h1>
              <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-white/78 sm:text-lg">
                Choose a credit pack in INR or USD. Use credits across presentations,
                documents, and spreadsheets without starting a recurring subscription.
              </p>
              <div className="mt-7">
                <ProtectedAiStudioLink
                  href="/ai-studio/billing"
                  isAuthenticated={Boolean(session?.user?.email)}
                  className="inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/15"
                >
                  <History size={16} />
                  Billing History
                </ProtectedAiStudioLink>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-[#f7f8fb] px-4 py-14 text-slate-950 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl">
            <AiStudioPricingClient
              plans={AI_STUDIO_PLANS}
              initialRegion={initialRegion}
              paypalClientId={paypalClientId}
            />

            <div className="mt-8 rounded-lg border border-slate-200 bg-white p-5 text-center text-sm leading-6 text-slate-600 shadow-sm">
              <p className="font-semibold text-slate-900">
                INR payments use Razorpay. USD payments use PayPal.
              </p>
              <p className="mt-1">
                Credits are added after payment confirmation. Actual generation
                usage can depend on output size and complexity.
              </p>
              <div className="mt-3 flex flex-wrap justify-center gap-x-4 gap-y-2">
                <Link href="/terms" className="font-semibold text-cyan-800 underline-offset-4 hover:underline">
                  Terms
                </Link>
                <Link href="/privacy" className="font-semibold text-cyan-800 underline-offset-4 hover:underline">
                  Privacy
                </Link>
                <Link href="/contact" className="font-semibold text-cyan-800 underline-offset-4 hover:underline">
                  Support
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
