import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ChevronRight,
  FileText,
  Presentation,
  Sparkles,
  Table2,
  WandSparkles,
} from 'lucide-react';
import { HomeHeader } from '@/app/components/HomeHeader';
import { getAiStudioAccessForCurrentUser } from '@/lib/entitlements/ai-studio-server';
import { PremiumAccessRequired } from './components/PremiumAccessRequired';

export const metadata: Metadata = {
  title: 'AI Studio | SimplifyConvert',
  description:
    'Premium AI Workspace for professional presentations, smart visual layouts, PPTX export, and polished business work.',
  alternates: {
    canonical: 'https://simplifyconvert.com/ai-studio',
  },
  openGraph: {
    title: 'AI Studio | SimplifyConvert',
    description:
      'Premium AI Workspace for professional presentations, smart visual layouts, PPTX export, and polished business work.',
    url: 'https://simplifyconvert.com/ai-studio',
    siteName: 'SimplifyConvert',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Studio | SimplifyConvert',
    description:
      'Create professional presentations in minutes with AI-powered content planning and smart visual layouts.',
  },
};

export const dynamic = 'force-dynamic';

const studioTools = [
  {
    title: 'Presentation Maker',
    description: 'Create professional presentations in minutes with AI-powered content planning, smart visual layouts, and PPTX export.',
    href: '/ai-studio/presentation-maker',
    status: 'Premium',
    icon: Presentation,
  },
  {
    title: 'Document Maker',
    description: 'Premium document planning for structured reports, briefs, proposals, and business narratives.',
    status: 'Premium',
    icon: FileText,
  },
  {
    title: 'Spreadsheet Maker',
    description: 'Premium spreadsheet planning for analysis tables, trackers, and data-ready business structures.',
    status: 'Premium',
    icon: Table2,
  },
];

const examplePrompts = [
  'Create a Series A pitch deck for a B2B analytics startup.',
  'Draft a product launch strategy for an AI meeting assistant.',
  'Build a quarterly marketing plan for a cybersecurity SaaS company.',
  'Create a spreadsheet structure for tracking sales pipeline risk.',
];

const premiumCapabilities = [
  'AI-powered content planning',
  'Smart visual layouts',
  'PPTX export',
  'Professional themes',
  'Images and visual storytelling',
];

export default async function AIStudioPage() {
  const access = await getAiStudioAccessForCurrentUser();

  if (!access.allowed) {
    return <PremiumAccessRequired returnTo="/ai-studio" />;
  }

  return (
    <>
      <HomeHeader />
      <main className="min-h-screen bg-[#080a12] text-white">
        <section className="relative overflow-hidden px-4 pt-8 pb-10 sm:px-6 lg:px-8">
          <div className="absolute inset-0 bg-[linear-gradient(135deg,#080a12_0%,#111827_35%,#12343b_70%,#312e81_100%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(103,232,249,0.22),rgba(8,10,18,0)_44%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.10)_0%,rgba(255,255,255,0)_42%,rgba(255,255,255,0.06)_100%)]" />

          <div className="relative z-10 mx-auto max-w-7xl">
            <nav className="mb-12 flex items-center gap-2 text-sm text-white/70" aria-label="Breadcrumb">
              <Link href="/" className="hover:text-white transition">
                Home
              </Link>
              <ChevronRight size={16} />
              <span>AI Studio</span>
            </nav>

            <div className="mx-auto max-w-4xl text-center">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-cyan-50 shadow-lg shadow-cyan-950/30 backdrop-blur">
                <Sparkles size={16} />
                AI Studio
                <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-950">
                  Premium
                </span>
              </div>

              <h1 className="text-4xl font-bold tracking-normal text-white sm:text-5xl lg:text-6xl">
                Premium AI Workspace
              </h1>
              <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-white/78 sm:text-lg">
                Create professional presentations in minutes with AI-powered content planning, smart visual layouts,
                PPTX export, professional themes, and visual storytelling.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-2">
                {premiumCapabilities.map((capability) => (
                  <span
                    key={capability}
                    className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold text-cyan-50"
                  >
                    {capability}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="bg-[#f7f8fb] px-4 py-10 text-slate-950 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[1160px] space-y-10">
            <div className="grid gap-4 md:grid-cols-3">
              {studioTools.map((tool) => {
                const Icon = tool.icon;
                const isAvailable = Boolean(tool.href);
                const content = (
                  <div
                    className={`h-full rounded-lg border bg-white p-6 shadow-lg shadow-slate-200/70 transition ${
                      isAvailable
                        ? 'border-cyan-200 hover:-translate-y-1 hover:border-cyan-400 hover:shadow-xl hover:shadow-cyan-100'
                        : 'border-slate-200 opacity-80'
                    }`}
                  >
                    <div className="mb-6 flex items-start justify-between gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-950 text-cyan-100">
                        <Icon size={24} />
                      </div>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${
                          isAvailable
                            ? 'bg-cyan-100 text-cyan-800'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {tool.status}
                      </span>
                    </div>
                    <h2 className="text-xl font-bold text-slate-950">{tool.title}</h2>
                    <p className="mt-3 text-sm leading-6 text-slate-600">{tool.description}</p>
                    {isAvailable && (
                      <div className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-cyan-800">
                        Open workspace
                        <ChevronRight size={16} />
                      </div>
                    )}
                  </div>
                );

                return isAvailable && tool.href ? (
                  <Link key={tool.title} href={tool.href}>
                    {content}
                  </Link>
                ) : (
                  <div key={tool.title}>{content}</div>
                );
              })}
            </div>

            <section>
              <div className="mb-4">
                <h2 className="text-xl font-bold text-slate-950">Recent Creations</h2>
                <p className="mt-1 text-sm text-slate-600">
                  Premium AI Studio creations, exports, and presentation drafts will appear here.
                </p>
              </div>
              <div className="grid gap-3 md:grid-cols-3">
                {['Presentation draft', 'Document brief', 'Spreadsheet plan'].map((label) => (
                  <div key={label} className="rounded-lg border border-dashed border-slate-300 bg-white/70 p-5">
                    <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
                      <WandSparkles size={18} className="text-slate-400" />
                    </div>
                    <h3 className="text-sm font-semibold text-slate-700">{label}</h3>
                    <div className="mt-4 h-3 w-full rounded-full bg-slate-100" />
                    <div className="mt-2 h-3 w-4/5 rounded-full bg-slate-100" />
                  </div>
                ))}
              </div>
            </section>

            <section>
              <div className="mb-4 flex items-center gap-2">
                <Sparkles size={20} className="text-cyan-700" />
                <h2 className="text-xl font-bold text-slate-950">Example Prompts</h2>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                {examplePrompts.map((prompt) => (
                  <div key={prompt} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                    <p className="text-sm leading-6 text-slate-700">{prompt}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </section>
      </main>
    </>
  );
}
