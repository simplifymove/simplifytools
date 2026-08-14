'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  Check,
  Code2,
  Combine,
  Database,
  Eraser,
  FileImage,
  FileSpreadsheet,
  FileText,
  FileCheck,
  Download,
  Image,
  PenTool,
  Presentation,
  Sparkles,
  TrendingUp,
  Video,
  Volume2,
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
    description: 'Explore tools',
    icon: FileText,
    accent: 'bg-violet-100 text-violet-700',
    link: '/all-tools/pdf-tools',
  },
  {
    id: 'image',
    title: 'Image Tools',
    description: 'Explore tools',
    icon: Image,
    accent: 'bg-orange-100 text-orange-700',
    link: '/all-tools/image-tools',
  },
  {
    id: 'video',
    title: 'Video Tools',
    description: 'Explore tools',
    icon: Video,
    accent: 'bg-rose-100 text-rose-700',
    link: '/all-tools/video-tools',
  },
  {
    id: 'ai-writing',
    title: 'AI Writing Tools',
    description: 'Explore tools',
    icon: PenTool,
    accent: 'bg-blue-100 text-blue-700',
    link: '/all-tools/ai-tools',
  },
  {
    id: 'data',
    title: 'Data Tools',
    description: 'Explore tools',
    icon: Database,
    accent: 'bg-teal-100 text-teal-700',
    link: '/all-tools/data',
  },
  {
    id: 'code',
    title: 'Code Tools',
    description: 'Explore tools',
    icon: Code2,
    accent: 'bg-emerald-100 text-emerald-700',
    link: '/all-tools/code-tools',
  },
  {
    id: 'text-to-speech',
    title: 'Text to Speech',
    description: 'Explore tools',
    icon: Volume2,
    accent: 'bg-indigo-100 text-indigo-700',
    link: '/all-tools/text-to-speech',
  },
  {
    id: 'financial',
    title: 'Financial Calculators',
    description: 'Explore tools',
    icon: TrendingUp,
    accent: 'bg-emerald-100 text-emerald-700',
    link: '/all-tools/financial-calculators',
  },
  {
    id: 'resume-maker',
    title: 'Resume Maker',
    description: 'Explore tools',
    icon: FileCheck,
    accent: 'bg-sky-100 text-sky-700',
    link: '/all-tools/resume-maker',
  },
  {
    id: 'downloader',
    title: 'Save From Online',
    description: 'Explore tools',
    icon: Download,
    accent: 'bg-green-100 text-green-700',
    link: '/all-tools/save-from-online',
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

      <section className="relative overflow-hidden border-b border-slate-200 bg-[radial-gradient(circle_at_top,rgba(251,146,60,0.10),transparent_38%),linear-gradient(to_bottom,#fffaf5,#ffffff)]">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="text-4xl font-bold leading-[1.08] tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
              Free online tools to{' '}
              <span className="text-orange-600">convert, edit, and create files</span>
            </h1>

            <p className="mx-auto mt-5 max-w-3xl text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
              Convert, compress, edit, and create files directly in your browser. Explore free
              tools for PDFs, images, videos, data, code, and AI-powered documents, presentations,
              and spreadsheets.
            </p>
          </div>

          <div className="mx-auto mt-9 max-w-3xl">
            <SearchBox
              placeholder="Search for a tool or task"
              onSearch={(query) =>
                router.push(`/all-tools?search=${encodeURIComponent(query)}`)
              }
              variant="hero"
              showSuggestions
            />
          </div>

          <div
            className="mx-auto mt-8 grid max-w-5xl grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5"
            aria-label="Tool categories"
          >
            {categories.map((category) => {
              const Icon = category.icon;

              return (
                <Link
                  key={category.id}
                  href={category.link}
                  className="group rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-orange-300 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600"
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${category.accent}`}
                    >
                      <Icon aria-hidden="true" size={17} />
                    </span>

                    <p className="text-sm font-bold leading-5 text-slate-800 transition group-hover:text-orange-700">
                      {category.title}
                    </p>
                  </div>

                  <p className="mt-3 text-xs font-medium text-slate-500">
                    {category.description}
                  </p>
                </Link>
              );
            })}
          </div>

          <div className="mx-auto mt-5 max-w-5xl">
            <Link
              href="/ai-studio"
              className="group block overflow-hidden rounded-2xl bg-gradient-to-r from-slate-950 via-blue-950 to-cyan-900 p-5 text-white shadow-[0_18px_45px_-25px_rgba(15,23,42,0.65)] transition hover:-translate-y-0.5 hover:shadow-[0_22px_55px_-25px_rgba(15,23,42,0.8)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600 sm:p-6"
            >
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10 text-cyan-200">
                    <Sparkles aria-hidden="true" size={21} />
                  </span>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-base font-bold sm:text-lg">
                        Premium AI Studio
                      </p>
                      <span className="rounded-full border border-cyan-300/25 bg-cyan-300/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-cyan-100">
                        Premium
                      </span>
                    </div>

                    <p className="mt-1.5 max-w-2xl text-sm leading-6 text-slate-300">
                      Create presentations, documents, and spreadsheets from a simple idea with
                      our guided AI workspace.
                    </p>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {['Presentation', 'Document', 'Spreadsheet'].map((format) => (
                        <span
                          key={format}
                          className="rounded-full border border-white/15 bg-white/[0.08] px-3 py-1 text-xs font-medium text-cyan-50"
                        >
                          {format}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <span className="inline-flex shrink-0 items-center gap-2 text-sm font-bold text-white">
                  Explore AI Studio
                  <ArrowRight
                    aria-hidden="true"
                    className="transition group-hover:translate-x-1"
                    size={17}
                  />
                </span>
              </div>
            </Link>
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
            <div className="max-w-3xl space-y-4">
              <h2
                id="categories-heading"
                className="text-3xl font-bold tracking-tight text-slate-950 md:text-4xl"
              >
                Find the Right Tool for Your Task
              </h2>
              <p className="text-base leading-7 text-slate-600 md:text-lg md:leading-8">
                Not every file problem needs complicated software. Sometimes you simply need to
                turn a PDF into another format, reduce the size of an image before uploading it,
                extract audio from a video, or convert data into a format another application can
                understand.
              </p>
              <p className="text-base leading-7 text-slate-600 md:text-lg md:leading-8">
                SimplifyConvert organizes these tasks into focused categories so you can start
                with what you need instead of working through a complicated editor.
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

          <div className="mt-10 grid gap-5 lg:grid-cols-2">
            <article className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 sm:p-6">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
                  <FileText aria-hidden="true" size={21} />
                </span>
                <h3 className="text-xl font-bold text-slate-900">
                  <Link className="hover:text-orange-700" href="/all-tools/pdf-tools">PDF Tools</Link>
                </h3>
              </div>
              <div className="mt-4 space-y-3 text-sm leading-6 text-slate-600 sm:text-base sm:leading-7">
                <p>
                  Work with common PDF tasks such as converting, merging, splitting, compressing
                  and organizing documents.
                </p>
                <p>
                  Different PDF operations affect documents in different ways. A simple page
                  operation may preserve most of the original document, while conversions to
                  editable formats can change fonts, spacing, tables or complex layouts. Review
                  important documents after conversion before relying on the output.
                </p>
              </div>
            </article>

            <article className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 sm:p-6">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-orange-700">
                  <Image aria-hidden="true" size={21} />
                </span>
                <h3 className="text-xl font-bold text-slate-900">
                  <Link className="hover:text-orange-700" href="/all-tools/image-tools">Image Tools</Link>
                </h3>
              </div>
              <div className="mt-4 space-y-3 text-sm leading-6 text-slate-600 sm:text-base sm:leading-7">
                <p>
                  Convert image formats, resize or crop pictures, compress file sizes, remove
                  backgrounds and make other common image adjustments.
                </p>
                <p>
                  The best output depends on what you plan to do with the image. JPG is often
                  practical for photographs and smaller files, while PNG is useful when you need
                  lossless image storage or transparency support. Converting an already compressed
                  image to another format cannot restore detail that was previously lost.
                </p>
              </div>
            </article>

            <article className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 sm:p-6">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-700">
                  <Video aria-hidden="true" size={21} />
                </span>
                <h3 className="text-xl font-bold text-slate-900">
                  <Link className="hover:text-orange-700" href="/all-tools/video-tools">Video &amp; Audio Tools</Link>
                </h3>
              </div>
              <div className="mt-4 space-y-3 text-sm leading-6 text-slate-600 sm:text-base sm:leading-7">
                <p>
                  Handle practical media tasks including format conversion, compression, trimming,
                  audio extraction and transcription.
                </p>
                <p>
                  Video processing can take longer than image or document tasks because media files
                  are usually larger and may need to be re-encoded. Output size and quality can also
                  change depending on the source file, selected settings and type of processing.
                </p>
                <p>
                  Some URL-based media tools depend on whether the source is publicly accessible and
                  supported by the configured provider.
                </p>
              </div>
            </article>

            <article className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 sm:p-6">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-teal-100 text-teal-700">
                  <Database aria-hidden="true" size={21} />
                </span>
                <h3 className="text-xl font-bold text-slate-900">
                  <Link className="hover:text-orange-700" href="/all-tools/data">Data Tools</Link>
                </h3>
              </div>
              <div className="mt-4 space-y-3 text-sm leading-6 text-slate-600 sm:text-base sm:leading-7">
                <p>
                  Convert structured information between formats such as CSV, Excel, XML and JSON,
                  or split larger datasets into more manageable outputs.
                </p>
                <p>
                  A successful format conversion does not always mean two formats represent
                  information in exactly the same way. Spreadsheet formatting, formulas, nested XML
                  structures, column types and special characters can affect the result, so
                  important datasets should be checked after conversion.
                </p>
              </div>
            </article>

            <article className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 sm:p-6">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                  <Code2 aria-hidden="true" size={21} />
                </span>
                <h3 className="text-xl font-bold text-slate-900">
                  <Link className="hover:text-orange-700" href="/all-tools/code-tools">Code Tools</Link>
                </h3>
              </div>
              <div className="mt-4 space-y-3 text-sm leading-6 text-slate-600 sm:text-base sm:leading-7">
                <p>Use focused utilities for common development and text-processing tasks.</p>
                <p>
                  These tools are intended to make small, repetitive operations easier. For code or
                  configuration that will be used in production, review generated or transformed
                  output before deploying it.
                </p>
              </div>
            </article>

            <article className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 sm:p-6">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                  <PenTool aria-hidden="true" size={21} />
                </span>
                <h3 className="text-xl font-bold text-slate-900">
                  <Link className="hover:text-orange-700" href="/all-tools/ai-tools">AI Tools</Link>
                </h3>
              </div>
              <div className="mt-4 space-y-3 text-sm leading-6 text-slate-600 sm:text-base sm:leading-7">
                <p>Use AI-assisted tools for writing, analysis and other supported content tasks.</p>
                <p>
                  AI output can be useful as a starting point, but it can also contain mistakes or
                  unexpected results. Review generated content before publishing it or using it for
                  decisions where accuracy matters.
                </p>
              </div>
            </article>
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
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8 lg:p-10">
            <h2
              id="how-it-works-heading"
              className="text-3xl font-bold tracking-tight text-slate-950 md:text-4xl"
            >
              How SimplifyConvert Works
            </h2>
            <div className="mt-6 space-y-4 text-base leading-8 text-slate-600">
              <p>
                Start by choosing the tool that matches your task. The page will show the type of
                input it accepts and any options available for that particular operation.
              </p>
              <p>
                After processing, supported tools provide an output that you can review or
                download. Because SimplifyConvert includes different types of tools, processing is
                not identical across the entire website. Some operations can happen in the browser,
                while file conversions, media processing and certain AI features may require
                server-side or provider-based processing.
              </p>
              <p>
                File-size limits, supported formats and processing requirements can also vary by
                tool. Check the information shown on the individual tool page when working with an
                important or unusually large file.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-16 md:py-20" aria-labelledby="why-heading">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.7fr_1.3fr] lg:px-8">
          <div>
            <h2
              id="why-heading"
              className="text-3xl font-bold tracking-tight text-slate-950 md:text-4xl"
            >
              Why We Built SimplifyConvert
            </h2>
          </div>
          <div className="max-w-3xl space-y-5 text-base leading-8 text-slate-600">
            <p>Simple file tasks often become unnecessarily complicated.</p>
            <p>
              You may need one website to convert a document, another to resize an image and another
              to work with a video. Some services also make users navigate through features they
              don&apos;t need before reaching a basic conversion.
            </p>
            <p>
              SimplifyConvert is built around smaller, task-focused tools. Instead of requiring you
              to learn one large editing application, each page concentrates on a particular job and
              provides the controls and information relevant to that task.
            </p>
            <p>
              That also means we don&apos;t pretend every conversion is perfect. File formats work
              differently, compression can affect quality, complex documents can change during
              conversion, and AI-generated results need review. Where a tool has an important
              limitation, we aim to explain it on the page so you can decide whether the result is
              suitable for your use.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-16 md:py-20" aria-labelledby="important-file-heading">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 rounded-3xl border border-orange-200 bg-orange-50/50 p-6 sm:p-8 lg:grid-cols-[0.75fr_1.25fr] lg:p-10">
            <h2
              id="important-file-heading"
              className="text-3xl font-bold tracking-tight text-slate-950 md:text-4xl"
            >
              Before You Process an Important File
            </h2>
            <div className="space-y-4 text-base leading-8 text-slate-600">
              <p>Keep the original copy of any file that would be difficult to replace.</p>
              <p>
                After converting or editing a document, image, video or dataset, check the
                downloaded result before deleting the source. Pay particular attention to complex
                PDF layouts, spreadsheet formulas, image quality after compression, video
                synchronization and structured-data formatting.
              </p>
              <p>
                For sensitive or business-critical material, also review the processing information
                and limitations provided for the specific tool before uploading the file.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-16 md:py-20" aria-labelledby="explore-heading">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2
            id="explore-heading"
            className="text-3xl font-bold tracking-tight text-slate-950 md:text-4xl"
          >
            Explore SimplifyConvert
          </h2>
          <div className="mx-auto mt-5 max-w-3xl space-y-4 text-base leading-8 text-slate-600">
            <p>
              You don&apos;t need to know the technical name of every conversion before getting
              started. Browse the available categories or search for the task you want to complete.
            </p>
            <p>
              Whether you need to prepare an image for a website, change a document format, extract
              audio from a video, reorganize data or try an AI-assisted workflow, start with the tool
              designed for that specific job.
            </p>
          </div>
          <Link
            href="/all-tools"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-orange-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-orange-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600"
          >
            Browse all tools
            <ArrowRight aria-hidden="true" size={17} />
          </Link>
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
