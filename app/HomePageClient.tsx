'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  Check,
  CheckCircle2,
  Code2,
  Combine,
  Database,
  Eraser,
  FileImage,
  FileSpreadsheet,
  FileText,
  Image,
  Lock,
  PenTool,
  Presentation,
  Search,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Video,
  Zap,
} from 'lucide-react';
import { Footer } from './components/Footer';
import { HomeHeader } from './components/HomeHeader';
import { SearchBox } from './components/SearchBox';
import { getBestSearchResult } from './lib/search-index';

const categories = [
  {
    id: 'pdf',
    title: 'PDF Tools',
    description: 'Merge, compress, convert, and edit PDF files.',
    icon: FileText,
    accent: 'bg-violet-100 text-violet-700',
    link: '/all-tools/pdf-tools',
  },
  {
    id: 'image',
    title: 'Image Tools',
    description: 'Convert, resize, enhance, and optimize images.',
    icon: Image,
    accent: 'bg-orange-100 text-orange-700',
    link: '/all-tools/image-tools',
  },
  {
    id: 'video',
    title: 'Video Tools',
    description: 'Convert, compress, trim, and process video.',
    icon: Video,
    accent: 'bg-rose-100 text-rose-700',
    link: '/all-tools/video-tools',
  },
  {
    id: 'data',
    title: 'Data Tools',
    description: 'Work with CSV, JSON, Excel, XML, and more.',
    icon: Database,
    accent: 'bg-teal-100 text-teal-700',
    link: '/all-tools/data',
  },
  {
    id: 'code',
    title: 'Code Tools',
    description: 'Format, validate, minify, and transform code.',
    icon: Code2,
    accent: 'bg-emerald-100 text-emerald-700',
    link: '/all-tools/code-tools',
  },
  {
    id: 'ai-writing',
    title: 'AI Writing Tools',
    description: 'Draft, rewrite, summarize, and refine content.',
    icon: PenTool,
    accent: 'bg-blue-100 text-blue-700',
    link: '/all-tools/ai-tools',
  },
  {
    id: 'financial',
    title: 'Financial Calculators',
    description: 'Plan loans, investments, savings, and budgets.',
    icon: TrendingUp,
    accent: 'bg-amber-100 text-amber-800',
    link: '/all-tools/financial-calculators',
  },
];

const popularTasks = [
  {
    title: 'Remove Background',
    description: 'Create a clean transparent background.',
    icon: Eraser,
    accent: 'bg-orange-100 text-orange-700',
    link: '/all-tools/remove-background',
  },
  {
    title: 'Merge PDF',
    description: 'Combine multiple PDFs into one file.',
    icon: Combine,
    accent: 'bg-violet-100 text-violet-700',
    link: '/all-tools/pdf/merge-pdf',
  },
  {
    title: 'Compress Image',
    description: 'Reduce image size for easier sharing.',
    icon: Zap,
    accent: 'bg-amber-100 text-amber-700',
    link: '/all-tools/compress-image',
  },
  {
    title: 'JPG to PNG',
    description: 'Convert JPG images to PNG format.',
    icon: FileImage,
    accent: 'bg-sky-100 text-sky-700',
    link: '/all-tools/jpg-to-png',
  },
  {
    title: 'Compress PDF',
    description: 'Make PDF files smaller online.',
    icon: FileText,
    accent: 'bg-rose-100 text-rose-700',
    link: '/all-tools/pdf/compress-pdf',
  },
];

const trustItems = [
  'Free online utility tools',
  'No installation required',
  'Works on desktop and mobile',
  'AI-powered productivity tools',
];


const studioTools = [
  {
    title: 'Presentation Maker',
    description: 'Turn an idea into a structured, polished presentation.',
    icon: Presentation,
  },
  {
    title: 'Document Maker',
    description: 'Create clear reports, proposals, and long-form documents.',
    icon: FileText,
  },
  {
    title: 'Spreadsheet Maker',
    description: 'Build useful spreadsheets from a simple description.',
    icon: FileSpreadsheet,
  },
];

const steps = [
  {
    title: 'Find the right tool',
    description: 'Search by task or browse a focused category.',
    icon: Search,
  },
  {
    title: 'Add your content',
    description: 'Upload a supported file or enter the information the tool needs.',
    icon: FileText,
  },
  {
    title: 'Get your result',
    description: 'Process, preview, and download the result from your browser.',
    icon: CheckCircle2,
  },
];

const homepageFaqs = [
  {
    question: 'Which SimplifyConvert tools are free?',
    answer:
      'Our utility tools are free to use. Premium AI Studio is a separate credit-based service for creating presentations, documents, and spreadsheets.',
  },
  {
    question: 'Do I need to install software?',
    answer:
      'No. SimplifyConvert tools run through your web browser, so there is no desktop software to install.',
  },
  {
    question: 'How are my files processed?',
    answer:
      'Connections use HTTPS. Some tools process files in your browser, while others use temporary server processing. See our Privacy Policy for more information.',
  },
  {
    question: 'Do I need an account?',
    answer:
      'Most free utility tools can be used without an account. Premium AI Studio requires an eligible account and credits.',
  },
  {
    question: 'Can I use SimplifyConvert on mobile?',
    answer:
      'Yes. The website and its utility tools are designed to work across modern desktop, tablet, and mobile browsers.',
  },
];

const homepageFaqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: homepageFaqs.map((faq) => ({
    '@type': 'Question',
    name: faq.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: faq.answer,
    },
  })),
};

export default function Home() {
  const router = useRouter();

  const navigateSearch = (query: string) => {
    const bestMatch = getBestSearchResult(query);
    router.push(bestMatch?.route ?? `/all-tools?search=${encodeURIComponent(query)}`);
  };

  return (
    <main className="home-page min-h-screen overflow-x-clip bg-white text-slate-950">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homepageFaqSchema) }}
      />
      <HomeHeader />

      <section className="relative overflow-hidden border-b border-slate-200 bg-[radial-gradient(circle_at_top_left,rgba(251,146,60,0.14),transparent_38%),linear-gradient(to_bottom,#fffaf5,#ffffff)]">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 md:py-24 lg:grid-cols-[1.08fr_0.92fr] lg:px-8 lg:py-28">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white px-3 py-1.5 text-sm font-semibold text-orange-700 shadow-sm">
              <Sparkles aria-hidden="true" size={16} />
              Hundreds of tools, one simple workspace
            </div>
            <h1 className="max-w-4xl text-4xl font-bold leading-[1.08] tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
              Free online tools to{' '}
              <span className="text-orange-600">convert, edit, and create files</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              Convert, compress, edit, and create files directly in your browser. Explore free
              tools for PDFs, images, videos, data, code, and AI-powered documents, presentations,
              and spreadsheets.
            </p>

            <div className="mt-8 max-w-2xl">
              <SearchBox
                placeholder="Search for a tool or task"
                onSearch={(query) =>
                  router.push(`/all-tools?search=${encodeURIComponent(query)}`)
                }
                variant="hero"
                showSuggestions
              />
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Try
                </span>
                {['Remove background', 'Merge PDF', 'JPG to PNG'].map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => navigateSearch(tag)}
                    className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:border-orange-300 hover:bg-orange-50 hover:text-orange-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600"
                  >
                    {tag}
                  </button>
                ))}
              </div>
              <Link
                href="/all-tools"
                className="mt-6 inline-flex items-center gap-2 rounded-lg px-1 py-2 text-sm font-semibold text-slate-700 underline decoration-slate-300 underline-offset-4 transition hover:text-orange-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600"
              >
                Browse all tools
                <ArrowRight aria-hidden="true" size={16} />
              </Link>
            </div>
          </div>

          <div
            className="relative mx-auto w-full max-w-xl"
            aria-label="SimplifyConvert product overview"
          >
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_24px_70px_-32px_rgba(15,23,42,0.35)] sm:p-7">
              <div className="flex items-center justify-between border-b border-slate-100 pb-5">
                <div>
                  <p className="text-sm font-semibold text-orange-600">Explore our tools</p>
                  <p className="mt-1 text-xl font-bold text-slate-900">Everything you need in one place</p>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-100 text-orange-700">
                  <Zap aria-hidden="true" size={22} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 py-5">
                {categories.slice(0, 4).map((category) => {
                  const Icon = category.icon;
                  return (
                    <Link
                      key={category.id}
                      href={category.link}
                      className="group rounded-2xl border border-slate-100 bg-slate-50 p-3.5 transition hover:border-orange-200 hover:bg-orange-50/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600"
                    >
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${category.accent}`}
                        >
                          <Icon aria-hidden="true" size={18} />
                        </span>

                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-bold text-slate-800 transition group-hover:text-orange-700">
                            {category.title}
                          </p>
                          <p className="mt-0.5 line-clamp-2 text-[11px] leading-4 text-slate-500">
                            {category.description}
                          </p>
                        </div>

                        <ArrowRight
                          aria-hidden="true"
                          className="shrink-0 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-orange-600"
                          size={14}
                        />
                      </div>
                    </Link>
                  );
                })}
              </div>
              <div className="rounded-2xl bg-gradient-to-r from-slate-950 via-blue-950 to-cyan-900 p-4 text-white">
                <div className="flex items-center gap-3">
                  <Sparkles aria-hidden="true" className="shrink-0 text-cyan-300" size={19} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold">Premium AI Studio</p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {['Presentation', 'Document', 'Spreadsheet'].map((format) => (
                        <span
                          key={format}
                          className="rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-[11px] font-medium text-cyan-50"
                        >
                          {format}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section aria-label="Product benefits" className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-px bg-slate-200 sm:grid-cols-2 lg:grid-cols-4">
          {trustItems.map((item) => (
            <div
              key={item}
              className="flex items-center gap-3 bg-white px-5 py-4 text-sm font-medium text-slate-700"
            >
              <Check aria-hidden="true" className="shrink-0 text-orange-600" size={18} />
              {item}
            </div>
          ))}
        </div>
      </section>

      <section className="bg-slate-50 py-16 md:py-20" aria-labelledby="popular-tasks-heading">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-orange-600">
              Popular tasks
            </p>
            <h2
              id="popular-tasks-heading"
              className="mt-3 text-3xl font-bold tracking-tight text-slate-950 md:text-4xl"
            >
              Get common file tasks done quickly
            </h2>
            <p className="mt-4 text-lg leading-8 text-slate-600">
              Start with frequently used conversion, PDF, image, and AI tools.
            </p>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {popularTasks.map((task) => {
              const Icon = task.icon;
              return (
                <Link
                  key={task.title}
                  href={task.link}
                  className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-orange-300 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600"
                >
                  <div className="flex items-start justify-between gap-4">
                    <span
                      className={`flex h-11 w-11 items-center justify-center rounded-xl ${task.accent}`}
                    >
                      <Icon aria-hidden="true" size={21} />
                    </span>
                    <ArrowRight
                      aria-hidden="true"
                      className="text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-orange-600"
                      size={19}
                    />
                  </div>
                  <h3 className="mt-5 text-lg font-bold text-slate-900">{task.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{task.description}</p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-white py-16 md:py-20" aria-labelledby="categories-heading">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div className="max-w-2xl">
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-orange-600">
                Browse by category
              </p>
              <h2
                id="categories-heading"
                className="mt-3 text-3xl font-bold tracking-tight text-slate-950 md:text-4xl"
              >
                Find the right tool for your workflow
              </h2>
              <p className="mt-4 text-lg leading-8 text-slate-600">
                Explore a focused category or search for the exact task you need.
              </p>
            </div>
            <Link
              href="/all-tools"
              className="inline-flex items-center gap-2 self-start rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 transition hover:border-orange-300 hover:bg-orange-50 hover:text-orange-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600 md:self-auto"
            >
              View all tools
              <ArrowRight aria-hidden="true" size={16} />
            </Link>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <Link
                  key={category.id}
                  href={category.link}
                  className="group rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-orange-300 hover:bg-orange-50/40 hover:shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600"
                >
                  <span
                    className={`flex h-12 w-12 items-center justify-center rounded-xl ${category.accent}`}
                  >
                    <Icon aria-hidden="true" size={23} />
                  </span>
                  <h3 className="mt-5 text-lg font-bold text-slate-900">{category.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{category.description}</p>
                  <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-700 group-hover:text-orange-700">
                    Explore category
                    <ArrowRight aria-hidden="true" size={15} />
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-white px-4 py-8 sm:px-6 md:py-12 lg:px-8" aria-labelledby="studio-heading">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-blue-950 to-cyan-900 px-6 py-12 text-white shadow-[0_30px_80px_-40px_rgba(14,116,144,0.7)] sm:px-10 lg:px-14 lg:py-16">
          <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-sm font-semibold text-cyan-100">
                <Sparkles aria-hidden="true" size={16} />
                Premium AI Studio
              </div>
              <h2 id="studio-heading" className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">
                Go from an idea to finished business content
              </h2>
              <p className="mt-5 text-lg leading-8 text-slate-300">
                Create structured presentations, documents, and spreadsheets with a guided AI
                workspace.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/ai-studio"
                  className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
                >
                  Explore AI Studio
                  <ArrowRight aria-hidden="true" size={17} />
                </Link>
                <Link
                  href="/ai-studio/pricing"
                  className="inline-flex items-center rounded-full border border-white/30 bg-white/10 px-5 py-3 text-sm font-bold text-white transition hover:border-white/50 hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
                >
                  View pricing
                </Link>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {studioTools.map((tool) => {
                const Icon = tool.icon;
                return (
                  <div
                    key={tool.title}
                    className="rounded-2xl border border-white/15 bg-white/[0.07] p-5"
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400/15 text-cyan-200">
                      <Icon aria-hidden="true" size={20} />
                    </span>
                    <h3 className="mt-5 font-bold text-white">{tool.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-300">{tool.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-16 md:py-20" aria-labelledby="how-it-works-heading">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-orange-600">
              Simple by design
            </p>
            <h2
              id="how-it-works-heading"
              className="mt-3 text-3xl font-bold tracking-tight text-slate-950 md:text-4xl"
            >
              From task to result in three clear steps
            </h2>
            <p className="mt-4 text-lg leading-8 text-slate-600">
              Use SimplifyConvert directly in your browser, without installing desktop software.
            </p>
          </div>
          <ol className="mt-10 grid gap-5 md:grid-cols-3">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <li key={step.title} className="rounded-2xl border border-slate-200 bg-white p-6">
                  <div className="flex items-center justify-between">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-100 text-orange-700">
                      <Icon aria-hidden="true" size={21} />
                    </span>
                    <span className="text-sm font-bold text-slate-400">0{index + 1}</span>
                  </div>
                  <h3 className="mt-5 text-lg font-bold text-slate-900">{step.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{step.description}</p>
                </li>
              );
            })}
          </ol>

          <div className="mt-6 grid gap-5 rounded-2xl border border-slate-200 bg-white p-6 md:grid-cols-2 md:p-8">
            <div className="flex gap-4">
              <ShieldCheck aria-hidden="true" className="mt-1 shrink-0 text-orange-600" size={24} />
              <div>
                <h3 className="font-bold text-slate-900">Practical privacy information</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Some tools process files locally in your browser; others use temporary server
                  processing. Details vary by tool.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <Lock aria-hidden="true" className="mt-1 shrink-0 text-orange-600" size={24} />
              <div>
                <h3 className="font-bold text-slate-900">Clear service boundaries</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Utility tools are free. Premium AI Studio is a separate, credit-based product.
                  Read our{' '}
                  <Link
                    href="/privacy"
                    className="font-semibold text-orange-700 underline underline-offset-2 hover:text-orange-800"
                  >
                    Privacy Policy
                  </Link>
                  .
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-16 md:py-20" aria-labelledby="about-heading">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.7fr_1.3fr] lg:px-8">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-orange-600">
              One practical toolkit
            </p>
            <h2
              id="about-heading"
              className="mt-3 text-3xl font-bold tracking-tight text-slate-950 md:text-4xl"
            >
              What is SimplifyConvert?
            </h2>
          </div>
          <div className="max-w-3xl space-y-5 text-base leading-8 text-slate-600">
            <p>
              SimplifyConvert brings common file and content tasks into one browser-based
              workspace. Convert formats, edit images, process PDFs and videos, work with data and
              code, or use AI-assisted writing tools without searching across separate apps.
            </p>
            <p>
              Most utility tools can be used without an account. For larger creation workflows,
              Premium AI Studio provides dedicated tools for presentations, documents, and
              spreadsheets.
            </p>
            <div className="flex flex-wrap gap-x-5 gap-y-3 pt-1">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={category.link}
                  className="inline-flex items-center gap-1.5 font-semibold text-slate-800 underline decoration-slate-300 underline-offset-4 hover:text-orange-700"
                >
                  {category.title}
                  <ArrowRight aria-hidden="true" size={14} />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-slate-200 bg-slate-50 py-16 md:py-20" aria-labelledby="faq-heading">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-orange-600">
              Helpful answers
            </p>
            <h2
              id="faq-heading"
              className="mt-3 text-3xl font-bold tracking-tight text-slate-950 md:text-4xl"
            >
              Frequently asked questions
            </h2>
          </div>
          <div className="mt-10 space-y-3">
            {homepageFaqs.map((faq) => (
              <details
                key={faq.question}
                className="group rounded-2xl border border-slate-200 bg-white shadow-sm"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-5 rounded-2xl px-5 py-5 font-bold text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600 md:px-6">
                  <span>{faq.question}</span>
                  <span
                    aria-hidden="true"
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-lg text-slate-600 transition group-open:rotate-45"
                  >
                    +
                  </span>
                </summary>
                <p className="border-t border-slate-100 px-5 py-5 leading-7 text-slate-600 md:px-6">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
