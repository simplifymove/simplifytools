import Link from 'next/link';
import { LockKeyhole, Sparkles } from 'lucide-react';
import { HomeHeader } from '@/app/components/HomeHeader';

interface PremiumAccessRequiredProps {
  toolName?: string;
  returnTo?: string;
}

export function PremiumAccessRequired({ toolName = 'AI Studio', returnTo = '/ai-studio' }: PremiumAccessRequiredProps) {
  const signInHref = `/auth/signin?callbackUrl=${encodeURIComponent(returnTo)}`;

  return (
    <>
      <HomeHeader />
      <main className="min-h-screen bg-[#080a12] px-4 py-14 text-white sm:px-6 lg:px-8">
        <section className="mx-auto max-w-3xl rounded-lg border border-white/15 bg-white/10 p-8 shadow-2xl shadow-cyan-950/30 backdrop-blur">
          <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-lg bg-cyan-100 text-slate-950">
            <LockKeyhole size={24} />
          </div>
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-cyan-50">
            <Sparkles size={14} />
            Premium AI Workspace
          </div>
          <h1 className="text-3xl font-bold tracking-normal text-white sm:text-4xl">Premium access required</h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-white/75">
            {toolName} is reserved for premium workspaces. Sign in with a premium-enabled account to continue
            creating professional presentations, smart layouts, and PPTX exports.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href={signInHref}
              className="inline-flex items-center justify-center rounded-lg bg-cyan-300 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-200"
            >
              Sign in
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-lg border border-white/20 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/10"
            >
              Back to tools
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
