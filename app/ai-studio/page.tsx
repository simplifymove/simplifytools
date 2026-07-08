import type { Metadata } from 'next';
import Link from 'next/link';
import { getServerSession } from 'next-auth';
import {
  Activity,
  ArrowRight,
  BarChart3,
  ChevronRight,
  Clock,
  CreditCard,
  Download,
  FileText,
  History,
  Presentation,
  Sparkles,
  Table2,
  WalletCards,
} from 'lucide-react';
import { HomeHeader } from '@/app/components/HomeHeader';
import { findAiStudioUserByEmail } from '@/lib/ai-studio/user';
import { getOrCreateWallet, serializeAiStudioWallet } from '@/lib/ai-studio/wallet';
import { authOptions } from '@/lib/auth/config';
import { getAiStudioAccessForCurrentUser } from '@/lib/entitlements/ai-studio-server';
import { prisma } from '@/lib/prisma';
import { PremiumAccessRequired } from './components/PremiumAccessRequired';

export const metadata: Metadata = {
  title: 'AI Studio Dashboard | SimplifyConvert',
  description:
    'Premium AI Workspace dashboard for AI credits, presentation generation, usage activity, and PPTX creation.',
  alternates: {
    canonical: 'https://simplifyconvert.com/ai-studio',
  },
  openGraph: {
    title: 'AI Studio Dashboard | SimplifyConvert',
    description:
      'Track AI credits, launch premium presentation generation, and review AI Studio usage activity.',
    url: 'https://simplifyconvert.com/ai-studio',
    siteName: 'SimplifyConvert',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Studio Dashboard | SimplifyConvert',
    description:
      'Premium AI Workspace for professional presentations, smart visual layouts, and PPTX export.',
  },
};

export const dynamic = 'force-dynamic';

const premiumCapabilities = [
  'AI-powered content planning',
  'Smart visual layouts',
  'PPTX export',
  'Professional themes',
  'Images and visual storytelling',
];

const creditSteps = [
  {
    title: 'Buy credits',
    description: 'Choose a one-time AI Studio credit pack for your region.',
    icon: CreditCard,
  },
  {
    title: 'Generate presentations',
    description: 'Use credits to create structured, professional presentation drafts.',
    icon: Presentation,
  },
  {
    title: 'Export PPTX',
    description: 'Download editable PowerPoint files for review, delivery, or sharing.',
    icon: Download,
  },
];

const studioTools = [
  {
    title: 'Presentation Maker',
    description: 'Create slide-by-slide presentation plans and export editable PPTX files.',
    href: '/ai-studio/presentation-maker',
    cta: 'Create Presentation',
    icon: Presentation,
  },
  {
    title: 'Document Maker',
    description: 'Generate reports, proposals, business plans, resumes, letters, and blog articles.',
    href: '/ai-studio/document-maker',
    cta: 'Create Document',
    icon: FileText,
  },
  {
    title: 'Spreadsheet Maker',
    description: 'Build budgets, reports, trackers, invoices, comparison tables, and plans.',
    href: '/ai-studio/spreadsheet-maker',
    cta: 'Create Spreadsheet',
    icon: Table2,
  },
];

function formatCredits(value: number) {
  return value.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

async function getDashboardData() {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email ?? null;

  if (!email) {
    return {
      wallet: null,
      creditsUsedThisMonth: 0,
      totalPresentationsGenerated: 0,
      recentActivity: [],
      signedIn: false,
    };
  }

  const user = await findAiStudioUserByEmail(email);

  if (!user) {
    return {
      wallet: null,
      creditsUsedThisMonth: 0,
      totalPresentationsGenerated: 0,
      recentActivity: [],
      signedIn: false,
    };
  }

  const wallet = await getOrCreateWallet(user.id);
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [usageThisMonth, totalPresentationsGenerated, recentUsage, recentTransactions] = await Promise.all([
    prisma.aiStudioUsageLog.aggregate({
      where: {
        userId: user.id,
        status: 'success',
        completedAt: { gte: startOfMonth },
      },
      _sum: { actualCredits: true },
    }),
    prisma.aiStudioUsageLog.count({
      where: {
        userId: user.id,
        status: 'success',
      },
    }),
    prisma.aiStudioUsageLog.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 4,
      select: {
        id: true,
        topic: true,
        toolType: true,
        slideCount: true,
        status: true,
        actualCredits: true,
        estimatedCredits: true,
        createdAt: true,
      },
    }),
    prisma.aiStudioCreditTransaction.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 4,
      select: {
        id: true,
        type: true,
        amountCredits: true,
        description: true,
        createdAt: true,
      },
    }),
  ]);

  const activity = [
    ...recentUsage.map((item) => ({
      id: `usage-${item.id}`,
      label: item.topic ? `Generated: ${item.topic}` : 'AI Studio generation',
      detail:
        item.toolType === 'presentation'
          ? `${item.slideCount} slides - ${item.status}`
          : `${item.toolType} - ${item.status}`,
      amount:
        item.actualCredits?.toNumber() ??
        item.estimatedCredits.toNumber(),
      date: item.createdAt,
      kind: 'usage' as const,
    })),
    ...recentTransactions.map((item) => ({
      id: `transaction-${item.id}`,
      label: item.description || `Credit ${item.type}`,
      detail: item.type,
      amount: item.amountCredits.toNumber(),
      date: item.createdAt,
      kind: 'transaction' as const,
    })),
  ]
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 6);

  return {
    wallet: serializeAiStudioWallet(wallet),
    creditsUsedThisMonth: usageThisMonth._sum.actualCredits?.toNumber() ?? 0,
    totalPresentationsGenerated,
    recentActivity: activity,
    signedIn: true,
  };
}

export default async function AIStudioPage() {
  const access = await getAiStudioAccessForCurrentUser();

  if (!access.allowed) {
    return <PremiumAccessRequired returnTo="/ai-studio" />;
  }

  const dashboard = await getDashboardData();

  const stats = [
    {
      label: 'AI Credits Balance',
      value: dashboard.wallet ? `${formatCredits(dashboard.wallet.balanceCredits)} credits` : 'Sign in',
      detail: dashboard.wallet ? `${formatCredits(dashboard.wallet.reservedCredits)} reserved` : 'Connect an account to view wallet',
      icon: WalletCards,
    },
    {
      label: 'Generation Usage',
      value: 'Variable',
      detail: 'Usage depends on output size and complexity',
      icon: Presentation,
    },
    {
      label: 'Credits Used This Month',
      value: formatCredits(dashboard.creditsUsedThisMonth),
      detail: 'Successful AI Studio generations',
      icon: BarChart3,
    },
    {
      label: 'Total Generations',
      value: dashboard.totalPresentationsGenerated.toLocaleString(),
      detail: 'Completed AI Studio generations',
      icon: FileText,
    },
  ];

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
              <span>AI Studio</span>
            </nav>

            <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-cyan-50 shadow-lg shadow-cyan-950/30 backdrop-blur">
                  <Sparkles size={16} />
                  AI Studio
                  <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-950">
                    Premium
                  </span>
                </div>
                <h1 className="text-4xl font-bold tracking-normal text-white sm:text-5xl">
                  Create presentation decks with AI credits
                </h1>
                <p className="mt-5 max-w-2xl text-base leading-7 text-white/78 sm:text-lg">
                  Buy credits once, generate professional presentation outlines with smart visual direction,
                  and export editable PPTX files from AI Studio.
                </p>
                <div className="mt-6 flex flex-wrap gap-2">
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

              <div className="flex flex-wrap gap-3">
                <Link
                  href="/ai-studio/presentation-maker"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-white px-4 text-sm font-semibold text-slate-950 shadow-lg shadow-black/20 transition hover:bg-cyan-50"
                >
                  <Presentation size={16} />
                  Create Presentation
                </Link>
                <Link
                  href="/ai-studio/document-maker"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-white/20 bg-white/10 px-4 text-sm font-semibold text-white transition hover:bg-white/15"
                >
                  <FileText size={16} />
                  Create Document
                </Link>
                <Link
                  href="/ai-studio/spreadsheet-maker"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-white/20 bg-white/10 px-4 text-sm font-semibold text-white transition hover:bg-white/15"
                >
                  <Table2 size={16} />
                  Create Spreadsheet
                </Link>
                <Link
                  href="/ai-studio/pricing"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-white/20 bg-white/10 px-4 text-sm font-semibold text-white transition hover:bg-white/15"
                >
                  <CreditCard size={16} />
                  Buy Credits
                </Link>
                <Link
                  href="/ai-studio/billing"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-white/20 bg-white/10 px-4 text-sm font-semibold text-white transition hover:bg-white/15"
                >
                  <History size={16} />
                  View Billing
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-[#f7f8fb] px-4 py-10 text-slate-950 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[1160px] space-y-8">
            <section className="grid gap-4 md:grid-cols-3">
              {studioTools.map((tool) => {
                const Icon = tool.icon;

                return (
                  <Link
                    key={tool.title}
                    href={tool.href}
                    className="rounded-lg border border-slate-200 bg-white p-5 shadow-lg shadow-slate-200/70 transition hover:-translate-y-0.5 hover:border-cyan-300"
                  >
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-slate-950 text-cyan-100">
                        <Icon size={22} />
                      </div>
                      <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
                        Available
                      </span>
                    </div>
                    <h2 className="text-lg font-bold text-slate-950">{tool.title}</h2>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{tool.description}</p>
                    <span className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-cyan-800">
                      {tool.cta}
                      <ArrowRight size={15} />
                    </span>
                  </Link>
                );
              })}
            </section>

            <section className="grid gap-4 md:grid-cols-3">
              {creditSteps.map((step, index) => {
                const Icon = step.icon;

                return (
                  <div key={step.title} className="rounded-lg border border-slate-200 bg-white p-5 shadow-lg shadow-slate-200/70">
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-slate-950 text-cyan-100">
                        <Icon size={22} />
                      </div>
                      <span className="text-xs font-bold uppercase tracking-wide text-slate-400">
                        Step {index + 1}
                      </span>
                    </div>
                    <h2 className="text-lg font-bold text-slate-950">{step.title}</h2>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{step.description}</p>
                  </div>
                );
              })}
            </section>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {stats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <div key={stat.label} className="rounded-lg border border-slate-200 bg-white p-5 shadow-lg shadow-slate-200/70">
                    <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-slate-950 text-cyan-100">
                      <Icon size={22} />
                    </div>
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{stat.label}</p>
                    <p className="mt-2 text-2xl font-bold text-slate-950">{stat.value}</p>
                    <p className="mt-1 text-sm leading-6 text-slate-600">{stat.detail}</p>
                  </div>
                );
              })}
            </div>

            <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
              <section id="activity" className="rounded-lg border border-slate-200 bg-white p-5 shadow-lg shadow-slate-200/70">
                <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-slate-950">Recent AI Studio Activity</h2>
                    <p className="mt-1 text-sm text-slate-600">AI Studio generations and wallet updates appear here.</p>
                  </div>
                  <Link href="/ai-studio/billing" className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-800">
                    View Usage
                    <ArrowRight size={15} />
                  </Link>
                </div>

                {dashboard.recentActivity.length > 0 ? (
                  <div className="divide-y divide-slate-100">
                    {dashboard.recentActivity.map((item) => (
                      <div key={item.id} className="flex items-start gap-3 py-4">
                        <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-cyan-50 text-cyan-800">
                          {item.kind === 'usage' ? <Presentation size={17} /> : <WalletCards size={17} />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-bold text-slate-950">{item.label}</p>
                          <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                            {item.detail} · {formatDate(item.date)}
                          </p>
                        </div>
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
                          {item.amount > 0 ? '+' : ''}
                          {formatCredits(item.amount)}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-white text-slate-500 shadow-sm">
                      <Activity size={22} />
                    </div>
                    <h3 className="text-base font-bold text-slate-950">Premium activity will appear here</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      Generate a professional presentation or add AI credits to start building your AI Studio history.
                    </p>
                  </div>
                )}
              </section>

              <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-lg shadow-slate-200/70">
                <h2 className="text-xl font-bold text-slate-950">Quick Actions</h2>
                <div className="mt-5 space-y-3">
                  <Link
                    href="/ai-studio/presentation-maker"
                    className="flex items-center justify-between gap-4 rounded-lg border border-cyan-100 bg-cyan-50 p-4 text-cyan-950 transition hover:border-cyan-300"
                  >
                    <span className="flex items-center gap-3 text-sm font-bold">
                      <Presentation size={18} />
                      Create Presentation
                    </span>
                    <ChevronRight size={18} />
                  </Link>
                  <Link
                    href="/ai-studio/document-maker"
                    className="flex items-center justify-between gap-4 rounded-lg border border-slate-200 bg-white p-4 text-slate-950 transition hover:border-cyan-300"
                  >
                    <span className="flex items-center gap-3 text-sm font-bold">
                      <FileText size={18} />
                      Create Document
                    </span>
                    <ChevronRight size={18} />
                  </Link>
                  <Link
                    href="/ai-studio/spreadsheet-maker"
                    className="flex items-center justify-between gap-4 rounded-lg border border-slate-200 bg-white p-4 text-slate-950 transition hover:border-cyan-300"
                  >
                    <span className="flex items-center gap-3 text-sm font-bold">
                      <Table2 size={18} />
                      Create Spreadsheet
                    </span>
                    <ChevronRight size={18} />
                  </Link>
                  <Link
                    href="/ai-studio/pricing"
                    className="flex items-center justify-between gap-4 rounded-lg border border-slate-200 bg-white p-4 text-slate-950 transition hover:border-cyan-300"
                  >
                    <span className="flex items-center gap-3 text-sm font-bold">
                      <CreditCard size={18} />
                      Buy Credits
                    </span>
                    <ChevronRight size={18} />
                  </Link>
                  <Link
                    href="/ai-studio/billing"
                    className="flex items-center justify-between gap-4 rounded-lg border border-slate-200 bg-white p-4 text-slate-950 transition hover:border-cyan-300"
                  >
                    <span className="flex items-center gap-3 text-sm font-bold">
                      <Clock size={18} />
                      View Billing
                    </span>
                    <ChevronRight size={18} />
                  </Link>
                </div>

                {!dashboard.signedIn && (
                  <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
                    Sign in with your premium-enabled account to load wallet balance and usage activity.
                  </div>
                )}
              </section>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
