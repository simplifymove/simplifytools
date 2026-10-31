import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import {
  Activity,
  ArrowRight,
  CreditCard,
  FileSpreadsheet,
  FileText,
  Presentation,
  Sparkles,
  UserRound,
  WalletCards,
} from 'lucide-react';

import { Header } from '@/app/components/Header';
import { authOptions } from '@/lib/auth/config';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

function formatCredits(value: number) {
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 2,
  }).format(value);
}

function formatDate(value: Date | null | undefined) {
  if (!value) return 'Not available';

  return new Intl.DateTimeFormat('en', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(value);
}

function titleCase(value: string) {
  return value
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(' ');
}

function getInitials(name: string | null | undefined, email: string) {
  if (name?.trim()) {
    const parts = name.trim().split(/\s+/);

    return parts
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join('');
  }

  return email.charAt(0).toUpperCase();
}

async function getAccountData(email: string) {
  const user = await prisma.user.findFirst({
    where: {
      email: {
        equals: email.trim().toLowerCase(),
        mode: 'insensitive',
      },
    },
    select: {
      id: true,
      email: true,
      role: true,
    },
  });

  if (!user) {
    return null;
  }

  const [wallet, purchases, usageLogs] = await Promise.all([
    prisma.aiStudioWallet.findUnique({
      where: { userId: user.id },
      select: {
        balanceCredits: true,
        reservedCredits: true,
        lifetimeCreditsAdded: true,
        lifetimeCreditsUsed: true,
        updatedAt: true,
      },
    }),

    prisma.aiStudioPlanPurchase.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        planId: true,
        status: true,
        creditsGranted: true,
        createdAt: true,
        paidAt: true,
        providerPaymentId: true,
      },
    }),

    prisma.aiStudioUsageLog.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        topic: true,
        toolType: true,
        status: true,
        actualCredits: true,
        reservedCredits: true,
        estimatedCredits: true,
        createdAt: true,
      },
    }),
  ]);

  return {
    user,
    wallet,
    purchases,
    usageLogs,
  };
}

export default async function AccountPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect('/auth/signin?callbackUrl=/account');
  }

  const email = session.user.email;
  const account = await getAccountData(email);

  if (!account) {
    redirect('/auth/signin?callbackUrl=/account');
  }

  const balanceCredits = account.wallet?.balanceCredits.toNumber() ?? 0;
  const reservedCredits = account.wallet?.reservedCredits.toNumber() ?? 0;
  const lifetimeAdded =
    account.wallet?.lifetimeCreditsAdded.toNumber() ?? 0;
  const lifetimeUsed =
    account.wallet?.lifetimeCreditsUsed.toNumber() ?? 0;

  const latestPaidPurchase = account.purchases.find(
    (purchase) =>
      purchase.status === 'paid' ||
      Boolean(purchase.paidAt) ||
      Boolean(purchase.providerPaymentId),
  );

  const hasPremiumHistory =
    Boolean(latestPaidPurchase) ||
    lifetimeAdded > 0 ||
    balanceCredits > 0;

  const planLabel = latestPaidPurchase
    ? titleCase(latestPaidPurchase.planId)
    : hasPremiumHistory
      ? 'AI Studio'
      : 'Free Account';

  const displayName =
    session.user.name?.trim() ||
    'SimplifyConvert User';

  const recentUsage = account.usageLogs.slice(0, 4);

  return (
    <>
      <Header />

      <main className="min-h-screen bg-slate-50 text-slate-950">
        <section className="border-b border-slate-200 bg-white px-4 py-8 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-slate-950 text-lg font-bold text-white">
                  {getInitials(displayName, email)}
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                      {displayName}
                    </h1>

                    {hasPremiumHistory ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-2.5 py-1 text-xs font-bold text-orange-700 ring-1 ring-inset ring-orange-200">
                        <Sparkles size={13} />
                        PREMIUM
                      </span>
                    ) : null}
                  </div>

                  <p className="mt-1 text-sm text-slate-600">{email}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                {hasPremiumHistory ? (
                  <>
                    <Link
                      href="/ai-studio"
                      className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-slate-950 px-5 text-sm font-semibold text-white transition hover:bg-slate-800"
                    >
                      <Sparkles size={16} />
                      Open AI Studio
                    </Link>

                    <Link
                      href="/ai-studio/pricing"
                      className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
                    >
                      <CreditCard size={16} />
                      Buy Credits
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      href="/ai-studio/pricing"
                      className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-orange-500 px-5 text-sm font-bold text-white shadow-sm transition hover:bg-orange-600"
                    >
                      <Sparkles size={16} />
                      Upgrade to Premium
                    </Link>

                    <Link
                      href="/ai-studio"
                      className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
                    >
                      Explore AI Studio
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="px-4 py-8 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl space-y-6">

            <section className="relative overflow-hidden rounded-2xl bg-slate-950 p-6 text-white shadow-xl sm:p-8">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_20%,rgba(249,115,22,0.30),transparent_32%)]" />

              <div className="relative grid gap-8 lg:grid-cols-[1.3fr_0.7fr] lg:items-center">
                <div>
                  <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-bold text-orange-100">
                    <Sparkles size={14} />
                    {hasPremiumHistory
                      ? 'SimplifyConvert Premium'
                      : 'SimplifyConvert Account'}
                  </div>

                  <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                    {hasPremiumHistory
                      ? 'Your AI workspace is ready.'
                      : 'Unlock Premium AI Studio'}
                  </h2>

                  <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
                    {hasPremiumHistory
                      ? 'Create presentations, documents and spreadsheets while keeping your AI credits, usage and billing activity together in one account.'
                      : 'Upgrade to Premium to create AI-powered presentations, documents and spreadsheets with SimplifyConvert credits and access to the complete AI Studio workspace.'}
                  </p>

                  {!hasPremiumHistory ? (
                    <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-200">
                      <span>✓ AI Presentation Maker</span>
                      <span>✓ AI Document Maker</span>
                      <span>✓ AI Spreadsheet Maker</span>
                      <span>✓ Credit-based AI generation</span>
                    </div>
                  ) : null}

                  <div className="mt-6 flex flex-wrap gap-3">
                    {hasPremiumHistory ? (
                      <>
                        <Link
                          href="/ai-studio"
                          className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-orange-500 px-5 text-sm font-bold text-white transition hover:bg-orange-600"
                        >
                          Open AI Studio
                          <ArrowRight size={16} />
                        </Link>

                        <Link
                          href="/ai-studio/billing"
                          className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-white/20 bg-white/10 px-5 text-sm font-semibold text-white transition hover:bg-white/15"
                        >
                          Billing & Usage
                        </Link>
                      </>
                    ) : (
                      <>
                        <Link
                          href="/ai-studio/pricing"
                          className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-orange-500 px-5 text-sm font-bold text-white transition hover:bg-orange-600"
                        >
                          Upgrade to Premium
                          <ArrowRight size={16} />
                        </Link>

                        <Link
                          href="/ai-studio"
                          className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-white/20 bg-white/10 px-5 text-sm font-semibold text-white transition hover:bg-white/15"
                        >
                          Explore AI Studio
                        </Link>
                      </>
                    )}
                  </div>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/10 p-5 backdrop-blur">
                  {hasPremiumHistory ? (
                    <>
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-300">
                        Current AI Credits
                      </p>

                      <div className="mt-2 flex items-end gap-2">
                        <span className="text-4xl font-bold">
                          {formatCredits(balanceCredits)}
                        </span>
                        <span className="pb-1 text-sm text-slate-300">
                          available
                        </span>
                      </div>

                      <div className="mt-5 grid grid-cols-2 gap-3">
                        <div className="rounded-lg bg-black/20 p-3">
                          <p className="text-xs text-slate-400">Reserved</p>
                          <p className="mt-1 font-bold">
                            {formatCredits(reservedCredits)}
                          </p>
                        </div>

                        <div className="rounded-lg bg-black/20 p-3">
                          <p className="text-xs text-slate-400">Plan</p>
                          <p className="mt-1 truncate font-bold">{planLabel}</p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="text-xs font-bold uppercase tracking-wider text-orange-200">
                        Premium AI Studio
                      </p>

                      <p className="mt-3 text-2xl font-bold">
                        Ready when you are
                      </p>

                      <p className="mt-2 text-sm leading-6 text-slate-300">
                        Choose a Premium plan to receive AI credits and start creating with all three AI Studio makers.
                      </p>

                      <Link
                        href="/ai-studio/pricing"
                        className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-orange-300 transition hover:text-orange-200"
                      >
                        View Premium Plans
                        <ArrowRight size={15} />
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </section>

            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {[
                {
                  label: 'Available Credits',
                  value: formatCredits(balanceCredits),
                  detail: 'Ready to use',
                  icon: WalletCards,
                },
                {
                  label: 'Credits Used',
                  value: formatCredits(lifetimeUsed),
                  detail: 'Lifetime AI Studio usage',
                  icon: Activity,
                },
                {
                  label: 'Credits Added',
                  value: formatCredits(lifetimeAdded),
                  detail: 'Purchases and adjustments',
                  icon: Sparkles,
                },
                {
                  label: 'Account',
                  value: hasPremiumHistory ? 'Premium' : 'Free',
                  detail: latestPaidPurchase
                    ? `Latest purchase ${formatDate(
                        latestPaidPurchase.paidAt ||
                          latestPaidPurchase.createdAt,
                      )}`
                    : 'No paid AI Studio purchase yet',
                  icon: UserRound,
                },
              ].map((stat) => {
                const Icon = stat.icon;

                return (
                  <div
                    key={stat.label}
                    className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-50 text-orange-600">
                      <Icon size={20} />
                    </div>

                    <p className="mt-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                      {stat.label}
                    </p>

                    <p className="mt-1 text-2xl font-bold text-slate-950">
                      {stat.value}
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      {stat.detail}
                    </p>
                  </div>
                );
              })}
            </section>

            <section className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">

              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold">AI Studio</h2>
                    <p className="mt-1 text-sm text-slate-500">
                      {hasPremiumHistory
                        ? 'Start your next AI-assisted file.'
                        : 'Premium tools for creating presentations, documents and spreadsheets.'}
                    </p>
                  </div>

                  <Link
                    href={hasPremiumHistory ? '/ai-studio' : '/ai-studio/pricing'}
                    className="text-sm font-bold text-orange-600 hover:text-orange-700"
                  >
                    {hasPremiumHistory ? 'View Studio' : 'View Premium Plans'}
                  </Link>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  {[
                    {
                      title: 'Presentation',
                      detail: 'Create slide decks',
                      href: '/ai-studio/presentation-maker',
                      icon: Presentation,
                    },
                    {
                      title: 'Document',
                      detail: 'Create documents',
                      href: '/ai-studio/document-maker',
                      icon: FileText,
                    },
                    {
                      title: 'Spreadsheet',
                      detail: 'Create spreadsheets',
                      href: '/ai-studio/spreadsheet-maker',
                      icon: FileSpreadsheet,
                    },
                  ].map((tool) => {
                    const Icon = tool.icon;

                    return (
                      <Link
                        key={tool.title}
                        href={hasPremiumHistory ? tool.href : '/ai-studio/pricing'}
                        className="group rounded-xl border border-slate-200 p-4 transition hover:border-orange-300 hover:bg-orange-50/40"
                      >
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-950 text-white">
                          <Icon size={19} />
                        </div>

                        <div className="mt-4 flex flex-wrap items-center gap-2">
                          <h3 className="font-bold text-slate-950">
                            {tool.title}
                          </h3>

                          {!hasPremiumHistory ? (
                            <span className="rounded-full bg-orange-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-orange-700 ring-1 ring-inset ring-orange-200">
                              Premium
                            </span>
                          ) : null}
                        </div>

                        <p className="mt-1 text-sm text-slate-500">
                          {tool.detail}
                        </p>

                        <span className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-orange-600">
                          {hasPremiumHistory ? 'Open' : 'Upgrade to access'}
                          <ArrowRight
                            size={14}
                            className="transition group-hover:translate-x-0.5"
                          />
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-xl font-bold">Account details</h2>

                <div className="mt-5 space-y-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                      Name
                    </p>
                    <p className="mt-1 font-semibold text-slate-900">
                      {displayName}
                    </p>
                  </div>

                  <div className="border-t border-slate-100 pt-4">
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                      Email
                    </p>
                    <p className="mt-1 break-all font-semibold text-slate-900">
                      {email}
                    </p>
                  </div>

                  <div className="border-t border-slate-100 pt-4">
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                      AI Studio plan
                    </p>
                    <p className="mt-1 font-semibold text-slate-900">
                      {planLabel}
                    </p>
                  </div>

                  <Link
                    href="/ai-studio/billing"
                    className="mt-2 inline-flex items-center gap-2 text-sm font-bold text-orange-600 hover:text-orange-700"
                  >
                    Manage billing
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            </section>

            <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold">Recent AI activity</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Your latest AI Studio generations.
                  </p>
                </div>

                <Link
                  href="/ai-studio/billing"
                  className="inline-flex items-center gap-1 text-sm font-bold text-orange-600 hover:text-orange-700"
                >
                  View full history
                  <ArrowRight size={14} />
                </Link>
              </div>

              {recentUsage.length > 0 ? (
                <div className="mt-5 divide-y divide-slate-100">
                  {recentUsage.map((usage) => {
                    const credits =
                      usage.actualCredits?.toNumber() ??
                      usage.reservedCredits.toNumber() ??
                      usage.estimatedCredits.toNumber();

                    return (
                      <div
                        key={usage.id}
                        className="grid gap-3 py-4 sm:grid-cols-[1fr_auto_auto] sm:items-center"
                      >
                        <div>
                          <p className="font-semibold text-slate-950">
                            {usage.topic || 'Untitled AI Studio generation'}
                          </p>

                          <p className="mt-1 text-sm text-slate-500">
                            {titleCase(usage.toolType)} ·{' '}
                            {formatDate(usage.createdAt)}
                          </p>
                        </div>

                        <span className="w-fit rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">
                          {titleCase(usage.status)}
                        </span>

                        <p className="text-sm font-bold text-slate-800">
                          {formatCredits(credits)} credits
                        </p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="mt-5 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                  <Sparkles
                    size={28}
                    className="mx-auto text-slate-400"
                  />

                  <h3 className="mt-3 font-bold text-slate-900">
                    No AI activity yet
                  </h3>

                  <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                    Your recent presentation, document and spreadsheet
                    generations will appear here.
                  </p>

                  <Link
                    href={hasPremiumHistory ? '/ai-studio' : '/ai-studio/pricing'}
                    className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-orange-600"
                  >
                    {hasPremiumHistory ? 'Start creating' : 'Upgrade to start creating'}
                    <ArrowRight size={14} />
                  </Link>
                </div>
              )}
            </section>

          </div>
        </section>
      </main>
    </>
  );
}
