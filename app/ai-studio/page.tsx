import type { Metadata } from 'next';
import Link from 'next/link';
import { getServerSession } from 'next-auth';
import {
  ArrowRight,
  BarChart3,
  Check,
  CreditCard,
  FileText,
  Presentation,
  ShieldCheck,
  Sparkles,
  Table2,
  WalletCards,
} from 'lucide-react';
import { HomeHeader } from '@/app/components/HomeHeader';
import { Footer } from '@/app/components/Footer';
import { authOptions } from '@/lib/auth/config';
import { findAiStudioUserByEmail } from '@/lib/ai-studio/user';
import { getOrCreateWallet, serializeAiStudioWallet } from '@/lib/ai-studio/wallet';
import { prisma } from '@/lib/prisma';
import { AiStudioNav } from './components/AiStudioNav';
import { AiStudioOutputGallery } from './components/AiStudioOutputGallery';
import { AiStudioProductCard } from './components/AiStudioProductCard';
import { ProtectedAiStudioLink } from './components/ProtectedAiStudioLink';

export const metadata: Metadata = {
  title: 'AI Presentation, Document & Spreadsheet Maker | SimplifyConvert',
  description:
    'Turn a brief into an editable PowerPoint presentation, Word document, or Excel workbook with SimplifyConvert AI Studio.',
  alternates: {
    canonical: 'https://simplifyconvert.com/ai-studio',
  },
  openGraph: {
    title: 'AI Studio: Editable Presentations, Documents & Spreadsheets',
    description:
      'Create polished, editable PPTX, DOCX, and XLSX files from a clear brief.',
    url: 'https://simplifyconvert.com/ai-studio',
    siteName: 'SimplifyConvert',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SimplifyConvert AI Studio',
    description:
      'Create editable presentations, documents, and spreadsheets with AI.',
  },
};

export const dynamic = 'force-dynamic';

const products = [
  {
    title: 'Presentation Maker',
    description:
      'Plan a clear story, organize slide content, and create a professionally structured PowerPoint deck.',
    useCases: ['Sales decks', 'Training', 'Strategy'],
    format: 'Editable PPTX',
    href: '/ai-studio/presentation-maker',
    cta: 'Create Presentation',
    icon: Presentation,
  },
  {
    title: 'Document Maker',
    description:
      'Turn a detailed brief into a structured report, proposal, plan, letter, or long-form document.',
    useCases: ['Proposals', 'Reports', 'Business plans'],
    format: 'Editable DOCX',
    href: '/ai-studio/document-maker',
    cta: 'Create Document',
    icon: FileText,
  },
  {
    title: 'Spreadsheet Maker',
    description:
      'Build an organized workbook with useful sheets, sample data, formulas, summaries, and formatting.',
    useCases: ['Trackers', 'Budgets', 'Planning'],
    format: 'Editable XLSX',
    href: '/ai-studio/spreadsheet-maker',
    cta: 'Create Spreadsheet',
    icon: Table2,
  },
];

const useCases = [
  'Sales presentations',
  'Business proposals',
  'Executive reports',
  'Training material',
  'Project plans',
  'Operational trackers',
  'Financial planning sheets',
];

const faqs = [
  {
    question: 'What can I create with AI Studio?',
    answer:
      'AI Studio creates presentation drafts, structured documents, and organized spreadsheets that can be exported as PPTX, DOCX, or XLSX files.',
  },
  {
    question: 'Can I edit the downloaded files?',
    answer:
      'Yes. The exported PowerPoint, Word, and Excel files remain editable in compatible desktop or web applications.',
  },
  {
    question: 'How do AI Studio credits work?',
    answer:
      'AI Studio uses one-time credit packs. Credits are charged after a successful generation, and usage can vary with output size and complexity.',
  },
  {
    question: 'Which payment methods are available?',
    answer:
      'INR credit packs use Razorpay and USD credit packs use PayPal. The pricing page lets you select the supported currency for your purchase.',
  },
  {
    question: 'Do I need an account to explore AI Studio?',
    answer:
      'No. You can view the product and pricing publicly. Sign-in is required when you create a file, purchase credits, or open billing.',
  },
];

async function getWorkspace(email: string | null | undefined) {
  if (!email) return null;

  try {
    const user = await findAiStudioUserByEmail(email);
    if (!user) return null;

    const [wallet, recentUsage] = await Promise.all([
      getOrCreateWallet(user.id),
      prisma.aiStudioUsageLog.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        take: 3,
        select: {
          id: true,
          topic: true,
          toolType: true,
          status: true,
          createdAt: true,
        },
      }),
    ]);

    return {
      wallet: serializeAiStudioWallet(wallet),
      recentUsage,
    };
  } catch (error) {
    console.error('[ai-studio-landing] Unable to load workspace summary:', error);
    return null;
  }
}

export default async function AIStudioPage() {
  const session = await getServerSession(authOptions);
  const isAuthenticated = Boolean(session?.user?.email);
  const workspace = await getWorkspace(session?.user?.email);
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
  const applicationSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'SimplifyConvert AI Studio',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    description:
      'Create editable presentations, documents, and spreadsheets from a brief.',
    url: 'https://simplifyconvert.com/ai-studio',
  };

  return (
    <>
      <HomeHeader />
      <AiStudioNav />
      <main className="overflow-hidden bg-white text-slate-950">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(applicationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />

        <section className="relative border-b border-slate-200 bg-[linear-gradient(180deg,#f8fafc_0%,#ffffff_100%)] px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
          <div className="pointer-events-none absolute left-1/2 top-0 h-80 w-[46rem] -translate-x-1/2 rounded-full bg-cyan-100/60 blur-3xl" />
          <div className="relative mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-cyan-900">
                <Sparkles size={14} aria-hidden="true" />
                AI Studio
              </div>
              <h1 className="mt-6 max-w-3xl text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
                Turn a brief into an editable presentation, document, or spreadsheet
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
                Describe the outcome you need. AI Studio structures the content,
                prepares the file, and gives you an editable PPTX, DOCX, or XLSX
                to review and refine.
              </p>
              <div className="mt-8 flex flex-col gap-3 min-[420px]:flex-row">
                <ProtectedAiStudioLink
                  href="/ai-studio/presentation-maker"
                  isAuthenticated={isAuthenticated}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 text-sm font-semibold text-white shadow-lg shadow-slate-950/15 transition hover:bg-cyan-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-700 focus-visible:ring-offset-2"
                >
                  Create a presentation
                  <ArrowRight size={17} aria-hidden="true" />
                </ProtectedAiStudioLink>
                <Link
                  href="#examples"
                  className="inline-flex min-h-12 items-center justify-center rounded-xl border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-800 transition hover:border-cyan-400 hover:text-cyan-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-700 focus-visible:ring-offset-2"
                >
                  See examples
                </Link>
              </div>
              <p className="mt-4 text-sm text-slate-500">
                Explore freely. Sign in only when you are ready to create.
              </p>
            </div>

            <div className="relative">
              <div className="absolute -inset-5 rounded-[2.5rem] bg-gradient-to-br from-cyan-100 via-indigo-50 to-white blur-2xl" />
              <div className="relative rounded-[2rem] border border-slate-200 bg-white p-4 shadow-2xl shadow-slate-300/45 sm:p-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wide text-slate-400">
                    Editable output
                  </span>
                </div>
                <div className="mt-5 grid gap-4 sm:grid-cols-[1.35fr_0.65fr]">
                  <div className="min-h-64 rounded-2xl bg-slate-950 p-6 text-white">
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-300">
                      Strategy deck
                    </p>
                    <p className="mt-10 max-w-sm text-3xl font-bold">
                      From market signal to focused action
                    </p>
                    <p className="mt-4 text-sm leading-6 text-slate-300">
                      Clear narrative, structured slide intent, and an editable PowerPoint file.
                    </p>
                    <div className="mt-8 flex gap-2">
                      <span className="rounded-full bg-white/10 px-3 py-1 text-xs">PPTX</span>
                      <span className="rounded-full bg-white/10 px-3 py-1 text-xs">12 slides</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-1">
                    <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-4">
                      <FileText className="text-indigo-700" aria-hidden="true" />
                      <p className="mt-5 font-bold">Proposal</p>
                      <p className="mt-1 text-xs text-slate-600">DOCX</p>
                    </div>
                    <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
                      <BarChart3 className="text-emerald-700" aria-hidden="true" />
                      <p className="mt-5 font-bold">Forecast</p>
                      <p className="mt-1 text-xs text-slate-600">XLSX</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section aria-label="AI Studio assurances" className="border-b border-slate-200 bg-white px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-4 text-sm font-semibold text-slate-700 sm:grid-cols-2 lg:grid-cols-5">
            {[
              'Editable PPTX, DOCX & XLSX',
              'Charged after successful generation',
              'Razorpay for INR',
              'PayPal for USD',
              'Edit files after download',
            ].map((item) => (
              <div key={item} className="flex items-center gap-2">
                <Check size={17} className="shrink-0 text-emerald-700" aria-hidden="true" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </section>

        <section id="product" className="scroll-mt-32 px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="max-w-3xl">
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-cyan-800">Three focused makers</p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                Choose the file you need, not a generic chat response
              </h2>
              <p className="mt-4 text-lg leading-8 text-slate-600">
                Each maker uses a workflow designed for its final format and keeps
                the result ready for further editing.
              </p>
            </div>
            <div className="mt-10 grid gap-6 lg:grid-cols-3">
              {products.map((product) => (
                <AiStudioProductCard
                  key={product.title}
                  {...product}
                  isAuthenticated={isAuthenticated}
                />
              ))}
            </div>
          </div>
        </section>

        <section id="examples" className="scroll-mt-32 bg-slate-50 px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-10 max-w-3xl">
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-cyan-800">Sample outputs</p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                Structured for real work after download
              </h2>
              <p className="mt-4 text-lg leading-8 text-slate-600">
                These lightweight previews illustrate the editable structure AI Studio prepares. They do not contain user data.
              </p>
            </div>
            <AiStudioOutputGallery />
          </div>
        </section>

        <section id="how-it-works" className="scroll-mt-32 px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="text-center">
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-cyan-800">How it works</p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">From brief to editable file</h2>
            </div>
            <ol className="mt-12 grid gap-6 md:grid-cols-3">
              {[
                ['01', 'Describe what you need', 'Add the purpose, audience, tone, and important details for the file.'],
                ['02', 'Generate and review', 'AI Studio organizes the content and presents a structured result for review.'],
                ['03', 'Export and edit', 'Download a PPTX, DOCX, or XLSX and continue editing in compatible software.'],
              ].map(([number, title, description]) => (
                <li key={number} className="rounded-3xl border border-slate-200 bg-white p-6">
                  <span className="text-sm font-bold text-cyan-800">{number}</span>
                  <h3 className="mt-5 text-xl font-bold">{title}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{description}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="bg-slate-950 px-4 py-16 text-white sm:px-6 sm:py-20 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-cyan-300">Built for everyday business work</p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                Start with the outcome, then refine the details
              </h2>
              <p className="mt-4 leading-7 text-slate-300">
                Use AI Studio for a first structured draft, then apply your judgment,
                brand, data, and final review.
              </p>
            </div>
            <ul className="grid gap-3 sm:grid-cols-2">
              {useCases.map((useCase) => (
                <li key={useCase} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                  <Check size={18} className="shrink-0 text-cyan-300" aria-hidden="true" />
                  <span className="font-semibold">{useCase}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section id="pricing" className="scroll-mt-32 px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="mx-auto max-w-5xl rounded-[2rem] border border-slate-200 bg-[linear-gradient(135deg,#ecfeff_0%,#ffffff_52%,#eef2ff_100%)] p-7 sm:p-10 lg:p-12">
            <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-cyan-200">
                  <CreditCard size={22} aria-hidden="true" />
                </div>
                <h2 className="mt-6 text-3xl font-bold tracking-tight">One-time credit packs, in your preferred currency</h2>
                <p className="mt-4 max-w-2xl leading-7 text-slate-600">
                  Credits work across the three makers. Actual usage can depend on output size and complexity.
                  Choose INR with Razorpay or USD with PayPal on the pricing page.
                </p>
              </div>
              <Link
                href="/ai-studio/pricing"
                className="inline-flex min-h-14 items-center justify-center gap-2 rounded-xl bg-slate-950 px-6 text-sm font-bold text-white shadow-lg shadow-slate-950/15 transition hover:bg-cyan-950 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-700 focus-visible:ring-offset-2"
              >
                View pricing
                <ArrowRight size={17} aria-hidden="true" />
              </Link>
            </div>
          </div>
        </section>

        {isAuthenticated && (
          <section className="bg-slate-50 px-4 py-16 sm:px-6 lg:px-8" aria-labelledby="workspace-title">
            <div className="mx-auto max-w-7xl">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-sm font-bold uppercase tracking-[0.16em] text-cyan-800">Your workspace</p>
                  <h2 id="workspace-title" className="mt-2 text-3xl font-bold">Continue creating</h2>
                </div>
                <ProtectedAiStudioLink
                  href="/ai-studio/billing"
                  isAuthenticated
                  className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold transition hover:border-cyan-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-700 focus-visible:ring-offset-2"
                >
                  <WalletCards size={17} aria-hidden="true" />
                  View Billing
                </ProtectedAiStudioLink>
              </div>

              <div className="mt-8 grid gap-6 lg:grid-cols-[0.75fr_1.25fr]">
                <div className="rounded-3xl border border-slate-200 bg-white p-6">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-500">AI credit balance</p>
                  <p className="mt-3 text-3xl font-bold">
                    {workspace ? workspace.wallet.balanceCredits.toLocaleString() : 'Unavailable'}
                  </p>
                  <p className="mt-2 text-sm text-slate-600">
                    {workspace
                      ? `${workspace.wallet.reservedCredits.toLocaleString()} credits currently reserved`
                      : 'Your workspace summary could not be loaded.'}
                  </p>
                </div>
                <div className="rounded-3xl border border-slate-200 bg-white p-6">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Recent activity</p>
                  {workspace?.recentUsage.length ? (
                    <ul className="mt-3 divide-y divide-slate-100">
                      {workspace.recentUsage.map((item) => (
                        <li key={item.id} className="flex items-center justify-between gap-4 py-3 text-sm">
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-slate-950">{item.topic || 'Untitled generation'}</p>
                            <p className="mt-1 capitalize text-slate-500">{item.toolType} · {item.status}</p>
                          </div>
                          <time className="shrink-0 text-xs text-slate-500" dateTime={item.createdAt.toISOString()}>
                            {new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' }).format(item.createdAt)}
                          </time>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-3 text-sm leading-6 text-slate-600">
                      Your latest successful and in-progress generations will appear here.
                    </p>
                  )}
                </div>
              </div>
              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                {products.map((product) => (
                  <ProtectedAiStudioLink
                    key={product.title}
                    href={product.href}
                    isAuthenticated
                    className="inline-flex min-h-12 items-center justify-between rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold transition hover:border-cyan-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-700 focus-visible:ring-offset-2"
                  >
                    {product.title}
                    <ArrowRight size={16} aria-hidden="true" />
                  </ProtectedAiStudioLink>
                ))}
              </div>
            </div>
          </section>
        )}

        <section id="faq" className="scroll-mt-32 px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <div className="text-center">
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-cyan-800">FAQ</p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Questions before you create</h2>
            </div>
            <div className="mt-10 space-y-3">
              {faqs.map((faq) => (
                <details key={faq.question} className="group rounded-2xl border border-slate-200 bg-white p-5 open:border-cyan-300">
                  <summary className="cursor-pointer list-none rounded-md pr-8 font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-700">
                    {faq.question}
                  </summary>
                  <p className="mt-4 leading-7 text-slate-600">{faq.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 pb-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl rounded-[2rem] bg-slate-950 px-6 py-12 text-center text-white sm:px-10">
            <ShieldCheck className="mx-auto text-cyan-300" size={30} aria-hidden="true" />
            <h2 className="mt-5 text-3xl font-bold">Create the file your next task needs</h2>
            <p className="mx-auto mt-4 max-w-2xl leading-7 text-slate-300">
              Start with a clear brief, review the generated structure, and keep editing after export.
            </p>
            <ProtectedAiStudioLink
              href="/ai-studio/presentation-maker"
              isAuthenticated={isAuthenticated}
              className="mt-7 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-white px-5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
            >
              Create a presentation
              <ArrowRight size={17} aria-hidden="true" />
            </ProtectedAiStudioLink>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
