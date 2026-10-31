import { FAQAnswer, FAQDisclosure, FAQHeading, FAQList, FAQPanel, FAQQuestion } from '@/app/components/FAQDesign';
import type { Metadata } from 'next';
import Link from 'next/link';
import { getServerSession } from 'next-auth';
import {
  ArrowRight,
  CreditCard,
  FileText,
  Film,
  ImageIcon,
  Lightbulb,
  Music2,
  Youtube,
  Presentation,
  Sparkles,
  Table2,
} from 'lucide-react';
import { HomeHeader } from '@/app/components/HomeHeader';
import { Footer } from '@/app/components/Footer';
import { authOptions } from '@/lib/auth/config';
import { getOrCreateWallet, serializeAiStudioWallet } from '@/lib/ai-studio/wallet';
import { prisma } from '@/lib/prisma';
import { AiStudioNav } from './components/AiStudioNav';
import { AiStudioProductCard } from './components/AiStudioProductCard';
import { ProtectedAiStudioLink } from './components/ProtectedAiStudioLink';

export const metadata: Metadata = {
  title: 'AI Studio â€“ Presentations, Documents, Images & Videos | SimplifyConvert',
  description:
    'Create presentations, documents, spreadsheets, images, videos, and music with focused AI tools in SimplifyConvert AI Studio.',
  alternates: {
    canonical: 'https://simplifyconvert.com/ai-studio',
  },
  openGraph: {
    title: 'AI Studio: Presentations, Documents, Images, Video & Music',
    description:
      'Create editable office files or explore focused AI image, video, and music workflows from one studio.',
    url: 'https://simplifyconvert.com/ai-studio',
    siteName: 'SimplifyConvert',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SimplifyConvert AI Studio',
    description:
      'Create presentations, documents, spreadsheets, images, videos, and music with AI.',
  },
};

export const dynamic = 'force-dynamic';

const productivityTools = [
  {
    title: 'Presentation',
    description: 'Create an editable presentation from your brief.',
    format: 'PPTX',
    href: '/ai-studio/presentation-maker',
    cta: 'Create Presentation',
    icon: Presentation,
  },
  {
    title: 'Document',
    description: 'Create reports, proposals, plans, and documents.',
    format: 'DOCX',
    href: '/ai-studio/document-maker',
    cta: 'Create Document',
    icon: FileText,
  },
  {
    title: 'Spreadsheet',
    description: 'Create structured sheets, tables, formulas, and summaries.',
    format: 'XLSX',
    href: '/ai-studio/spreadsheet-maker',
    cta: 'Create Spreadsheet',
    icon: Table2,
  },
];

const creativeTools = [
  {
    title: 'Image Generator',
    description: 'Create original images from a text prompt.',
    format: 'Preview',
    href: '/ai-studio/image-generator',
    cta: 'Explore Image Generator',
    icon: ImageIcon,
    protectLink: false,
  },
  {
    title: 'Video Generator',
    description: 'Create AI videos from text or an image.',
    format: 'Preview',
    href: '/ai-studio/video-generator',
    cta: 'Explore Video Generator',
    icon: Film,
    protectLink: false,
  },
  {
    title: 'Music Generator',
    description: 'Create original instrumental or vocal music from your ideas.',
    format: 'Preview',
    href: '/ai-studio/music-generator',
    cta: 'Explore Music Generator',
    icon: Music2,
    protectLink: false,
  },
  {
    title: 'YouTube Thumbnail Maker',
    description: 'Design high-impact 16:9 thumbnail concepts for YouTube videos.',
    format: 'Preview',
    href: '/ai-studio/youtube-thumbnail-maker',
    cta: 'Explore Thumbnail Maker',
    icon: Youtube,
    protectLink: false,
  },
];

const inspiration = [
  ['Presentation ideas', 'Pitch deck Â· Training outline'],
  ['Document ideas', 'Proposal Â· Project plan'],
  ['Spreadsheet ideas', 'Budget Â· Operations tracker'],
  ['Image ideas', 'Product visual Â· Social graphic'],
  ['Video ideas', 'Campaign concept Â· Product demo'],
  ['Music ideas', 'Cinematic score · Vocal song'],
  ['Thumbnail ideas', 'Tutorial | Product review'],
];

const faqs = [
  {
    question: 'What can I create with AI Studio?',
    answer:
      'Choose focused workflows for presentations, documents, spreadsheets, images, videos, music, and YouTube thumbnail concepts. Office-file outputs support editable PPTX, DOCX, and XLSX files.',
  },
  {
    question: 'Are the office files editable?',
    answer:
      'Yes. Exported PowerPoint, Word, and Excel files remain editable in compatible desktop or web applications.',
  },
  {
    question: 'How do AI Studio credits work?',
    answer:
      'Credits are used when supported generations complete successfully. Usage varies by tool and generation requirements.',
  },
  {
    question: 'Are the Image, Video, Music, and YouTube Thumbnail tools available?',
    answer:
      'Image Generator, Video Generator, Music Generator, and YouTube Thumbnail Maker are currently Preview experiences being prepared for broader availability. Commercial pricing remains under calibration.',
  },
];

async function getWorkspace(email: string | null | undefined) {
  if (!email) return null;

  try {
    const user = await prisma.user.findFirst({
      where: {
        email: {
          equals: email.trim().toLowerCase(),
          mode: 'insensitive',
        },
      },
      select: {
        id: true,
      },
    });

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
      'Create presentations, documents, spreadsheets, images, videos, and music with focused AI workflows.',
    url: 'https://simplifyconvert.com/ai-studio',
  };

  return (
    <>
      <HomeHeader />
      <AiStudioNav />
      <main className="bg-white text-slate-950">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(applicationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />

        <section id="product" className="scroll-mt-28 border-b border-slate-200 bg-slate-50 px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <div className="inline-flex items-center gap-2 text-sm font-bold text-orange-700">
                  <Sparkles size={16} aria-hidden="true" />
                  AI Studio
                </div>
                <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
                  What do you want to create?
                </h1>
                <p className="mt-2 text-base text-slate-600">
                  Choose a focused AI tool for documents, data, images, video, music, and YouTube thumbnails.
                </p>
              </div>

              <aside
                className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center"
                aria-label="AI Studio credit summary"
              >
                <div className="min-w-44">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-500">AI credits</p>
                  {isAuthenticated ? (
                    <>
                      <p className="mt-1 text-2xl font-bold" aria-live="polite">
                        {workspace ? workspace.wallet.balanceCredits.toLocaleString() : 'Unavailable'}
                      </p>
                      <p className="text-xs text-slate-500">
                        {workspace
                          ? `${workspace.wallet.reservedCredits.toLocaleString()} currently reserved`
                          : 'Credit summary could not be loaded.'}
                      </p>
                    </>
                  ) : (
                    <p className="mt-1 text-sm font-medium text-slate-600">Sign in to view your balance.</p>
                  )}
                </div>
                <Link
                  href="/ai-studio/pricing"
                  className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 text-sm font-semibold text-slate-800 transition hover:border-orange-300 hover:text-orange-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-600 focus-visible:ring-offset-2"
                >
                  View pricing
                  <ArrowRight size={15} aria-hidden="true" />
                </Link>
              </aside>
            </div>

            <div className="mt-8">
              <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-slate-600">
                Work &amp; Productivity
              </h2>
              <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {productivityTools.map((tool) => (
                  <AiStudioProductCard
                    key={tool.title}
                    {...tool}
                    isAuthenticated={isAuthenticated}
                  />
                ))}
              </div>
            </div>

            <div className="mt-6">
              <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-slate-600">Creative</h2>
              <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {creativeTools.map((tool) => (
                  <AiStudioProductCard
                    key={tool.title}
                    {...tool}
                    isAuthenticated={isAuthenticated}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="recent" className="scroll-mt-28 px-4 py-10 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.14em] text-orange-700">Your workspace</p>
              <h2 className="mt-1 text-2xl font-bold tracking-tight">Recent creations</h2>
            </div>

            {isAuthenticated ? (
              workspace?.recentUsage.length ? (
                <ul className="mt-5 grid gap-3 md:grid-cols-3">
                  {workspace.recentUsage.map((item) => (
                    <li key={item.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                      <p className="truncate font-semibold text-slate-950">{item.topic || 'Untitled creation'}</p>
                      <div className="mt-3 flex items-center justify-between gap-3 text-xs text-slate-500">
                        <span className="capitalize">{item.toolType} Â· {item.status}</span>
                        <time dateTime={item.createdAt.toISOString()}>
                          {new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' }).format(item.createdAt)}
                        </time>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-600">
                  Your recent AI Studio creations will appear here.
                </p>
              )
            ) : (
              <div className="mt-4 flex flex-col gap-3 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-slate-600">Sign in to view your recent AI Studio creations.</p>
                <ProtectedAiStudioLink
                  href="/ai-studio#recent"
                  isAuthenticated={false}
                  className="inline-flex min-h-10 items-center justify-center rounded-xl bg-slate-950 px-4 text-sm font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-600 focus-visible:ring-offset-2"
                >
                  Sign in
                </ProtectedAiStudioLink>
              </div>
            )}
          </div>
        </section>

        <section className="border-y border-slate-200 bg-slate-50 px-4 py-10 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 text-orange-700">
                <Lightbulb size={20} aria-hidden="true" />
              </span>
              <div>
                <h2 className="text-xl font-bold">Need inspiration?</h2>
                <p className="text-sm text-slate-600">Start with a familiar task and make the details your own.</p>
              </div>
            </div>
            <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {inspiration.map(([title, examples]) => (
                <li key={title} className="rounded-xl border border-slate-200 bg-white p-4">
                  <h3 className="text-sm font-bold">{title}</h3>
                  <p className="mt-1 text-xs leading-5 text-slate-500">{examples}</p>
                </li>
              ))}
            </ul>

            <div className="mt-8 border-t border-slate-200 pt-7">
              <h2 className="text-lg font-bold">How AI Studio works</h2>
              <ol className="mt-4 grid gap-3 sm:grid-cols-3">
                {['Choose a tool', 'Describe what you need', 'Generate and refine'].map((step, index) => (
                  <li key={step} className="flex items-center gap-3 rounded-xl bg-white p-3 text-sm font-semibold ring-1 ring-slate-200">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-950 text-xs text-white">
                      {index + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        <section className="px-4 py-10 sm:px-6 lg:px-8" aria-labelledby="credits-title">
          <div className="mx-auto flex max-w-7xl flex-col gap-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-950 text-orange-200">
                <CreditCard size={19} aria-hidden="true" />
              </span>
              <div>
                <h2 id="credits-title" className="font-bold">AI Studio credits</h2>
                <p className="mt-1 text-sm text-slate-600">
                  Credits are used when supported generations complete successfully. Image, Video, Music, and YouTube Thumbnail pricing remains under calibration.
                </p>
              </div>
            </div>
            <Link
              href="/ai-studio/pricing"
              className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-orange-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-600 focus-visible:ring-offset-2"
            >
              View pricing
              <ArrowRight size={15} aria-hidden="true" />
            </Link>
          </div>
        </section>

        <section
          aria-labelledby="ai-studio-creation-guide"
          className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8"
        >
          <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8">
            <h2
              id="ai-studio-creation-guide"
              className="text-2xl font-bold tracking-tight text-slate-950"
            >
              Get more useful results from your first draft
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
              AI-generated files are starting points. Include your intended audience,
              required information, and preferred structure in the request, then review
              the output before sharing or publishing it.
            </p>
            <div className="mt-6 grid gap-5 md:grid-cols-3">
              <article className="rounded-2xl border border-slate-200 p-5">
                <h3 className="font-bold text-slate-950">Presentations</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Describe the audience, objective, and key points. After exporting,
                  verify slide content, chart labels, images, and layout in PowerPoint.
                </p>
              </article>
              <article className="rounded-2xl border border-slate-200 p-5">
                <h3 className="font-bold text-slate-950">Documents</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Specify the document type, sections, tone, and important facts.
                  Review generated wording, references, and formatting before use.
                </p>
              </article>
              <article className="rounded-2xl border border-slate-200 p-5">
                <h3 className="font-bold text-slate-950">Spreadsheets</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Explain the columns, calculations, and expected results. Check
                  formulas, units, and data accuracy before making decisions.
                </p>
              </article>
            </div>
          </div>
        </section>

        <section id="faq" className="scroll-mt-28">
          <FAQPanel>
            <div className="text-center">
              <p className="text-sm font-bold uppercase tracking-[0.14em] text-orange-700">Help</p>
              <FAQHeading>AI Studio questions</FAQHeading>
            </div>
            <FAQList>
              {faqs.map((faq) => (
                <FAQDisclosure key={faq.question}>
                  <FAQQuestion>
                    {faq.question}
                  </FAQQuestion>
                  <FAQAnswer>{faq.answer}</FAQAnswer>
                </FAQDisclosure>
              ))}
            </FAQList>
          </FAQPanel>
        </section>
      </main>
      <Footer />
    </>
  );
}
