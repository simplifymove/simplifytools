'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  AlertCircle,
  CheckCircle,
  CreditCard,
  Download,
  FileText,
  Loader,
  Sparkles,
  WalletCards,
} from 'lucide-react';
import { HomeHeader } from '@/app/components/HomeHeader';

interface AiStudioWalletSummary {
  balanceCredits: number;
  reservedCredits: number;
  lifetimeCreditsAdded: number;
  lifetimeCreditsUsed: number;
}

interface DocumentSection {
  heading: string;
  paragraphs: string[];
  bulletPoints: string[];
  tables: Array<{
    title: string;
    columns: string[];
    rows: Array<Array<string | number>>;
  }>;
}

interface GeneratedDocument {
  title: string;
  subtitle: string;
  executiveSummary: string;
  sections: DocumentSection[];
  keyInsights: string[];
  recommendations: string[];
  conclusion: string;
}

const documentTypes = ['report', 'proposal', 'business plan', 'resume', 'letter', 'blog article'];
const tones = ['professional', 'simple', 'formal', 'marketing'];
const lengths = ['short', 'medium', 'detailed'];
const creditCost = 5;

function buildFileName(title: string) {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 70);

  return `${base || 'ai-studio-document'}.docx`;
}

export default function DocumentMakerClient() {
  const [topic, setTopic] = useState('');
  const [documentType, setDocumentType] = useState('report');
  const [tone, setTone] = useState('professional');
  const [length, setLength] = useState('medium');
  const [wallet, setWallet] = useState<AiStudioWalletSummary | null>(null);
  const [walletLoading, setWalletLoading] = useState(true);
  const [walletMessage, setWalletMessage] = useState('');
  const [document, setDocument] = useState<GeneratedDocument | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [lastCreditsUsed, setLastCreditsUsed] = useState<number | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadWallet() {
      try {
        const response = await fetch('/api/ai-studio/wallet');

        if (!response.ok) {
          throw new Error('Unable to load wallet');
        }

        const data = (await response.json()) as { wallet?: AiStudioWalletSummary };
        if (isMounted) {
          setWallet(data.wallet ?? null);
          setWalletMessage('');
        }
      } catch {
        if (isMounted) {
          setWallet(null);
          setWalletMessage('AI Studio credit balance is unavailable right now.');
        }
      } finally {
        if (isMounted) setWalletLoading(false);
      }
    }

    loadWallet();

    return () => {
      isMounted = false;
    };
  }, []);

  const hasInsufficientCredits = wallet !== null && wallet.balanceCredits < creditCost;
  const isGenerateDisabled = loading || !topic.trim() || hasInsufficientCredits;

  async function handleGenerate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!topic.trim()) {
      setError('Describe the document you want to create.');
      return;
    }

    if (hasInsufficientCredits) {
      setError(`Not enough AI Studio credits. You need ${creditCost} credits to generate a document.`);
      return;
    }

    setLoading(true);
    setError('');
    setDocument(null);
    setLastCreditsUsed(null);

    try {
      const response = await fetch('/api/ai-studio/document-maker/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, documentType, tone, length }),
      });
      const data = (await response.json()) as {
        document?: GeneratedDocument;
        creditsUsed?: number;
        wallet?: AiStudioWalletSummary;
        error?: string;
      };

      if (!response.ok || !data.document) {
        if (data.wallet) setWallet(data.wallet);
        setError(data.error || 'AI Studio could not generate this document right now.');
        return;
      }

      setDocument(data.document);
      if (data.wallet) setWallet(data.wallet);
      if (typeof data.creditsUsed === 'number') setLastCreditsUsed(data.creditsUsed);
    } catch {
      setError('AI Studio could not generate this document right now. Please try again in a few minutes.');
    } finally {
      setLoading(false);
    }
  }

  async function handleExport() {
    if (!document) return;

    setExporting(true);
    setError('');

    try {
      const response = await fetch('/api/ai-studio/document-maker/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(document),
      });

      if (!response.ok) {
        throw new Error('Export failed');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = window.document.createElement('a');
      anchor.href = url;
      anchor.download = buildFileName(document.title);
      anchor.click();
      URL.revokeObjectURL(url);
    } catch {
      setError('Unable to export DOCX right now.');
    } finally {
      setExporting(false);
    }
  }

  return (
    <>
      <HomeHeader />
      <main className="min-h-screen bg-[#080a12] text-white">
        <section className="px-4 py-10 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-cyan-50">
              <Sparkles size={16} />
              AI Studio
              <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-950">
                Available
              </span>
            </div>
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h1 className="text-4xl font-bold sm:text-5xl">AI Document Maker</h1>
                <p className="mt-4 max-w-2xl text-base leading-7 text-white/78">
                  Generate structured reports, proposals, business plans, resumes, letters, and blog articles.
                  Each generation uses {creditCost} AI Studio credits.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link href="/ai-studio/pricing" className="inline-flex h-11 items-center gap-2 rounded-lg bg-white px-4 text-sm font-semibold text-slate-950">
                  <CreditCard size={16} />
                  Buy Credits
                </Link>
                <Link href="/ai-studio/billing" className="inline-flex h-11 items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-4 text-sm font-semibold text-white">
                  <WalletCards size={16} />
                  View Billing
                </Link>
              </div>
            </div>

            <form onSubmit={handleGenerate} className="mt-8 rounded-lg border border-white/15 bg-white p-4 text-slate-950 shadow-2xl">
              <textarea
                value={topic}
                onChange={(event) => {
                  setTopic(event.target.value);
                  setError('');
                }}
                rows={7}
                className="w-full resize-none rounded-lg border border-slate-200 px-4 py-3 text-base outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
                placeholder="Describe the document you need, including purpose, audience, key points, and any specific details."
                maxLength={1200}
              />
              <div className="mt-4 grid gap-3 md:grid-cols-4">
                <label className="block">
                  <span className="text-xs font-bold uppercase tracking-wide text-slate-500">Document type</span>
                  <select value={documentType} onChange={(event) => setDocumentType(event.target.value)} className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm">
                    {documentTypes.map((item) => (
                      <option key={item} value={item}>{item}</option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="text-xs font-bold uppercase tracking-wide text-slate-500">Tone</span>
                  <select value={tone} onChange={(event) => setTone(event.target.value)} className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm">
                    {tones.map((item) => (
                      <option key={item} value={item}>{item}</option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="text-xs font-bold uppercase tracking-wide text-slate-500">Length</span>
                  <select value={length} onChange={(event) => setLength(event.target.value)} className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm">
                    {lengths.map((item) => (
                      <option key={item} value={item}>{item}</option>
                    ))}
                  </select>
                </label>
                <div className={`rounded-lg border p-3 ${hasInsufficientCredits ? 'border-amber-300 bg-amber-50 text-amber-950' : 'border-cyan-100 bg-cyan-50 text-cyan-950'}`}>
                  <p className="text-xs font-bold uppercase tracking-wide">Credits</p>
                  <p className="mt-1 text-sm font-semibold">
                    {walletLoading ? 'Loading wallet' : wallet ? `${wallet.balanceCredits.toLocaleString()} available - ${creditCost} needed` : walletMessage}
                  </p>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <button disabled={isGenerateDisabled} className="inline-flex h-11 items-center gap-2 rounded-lg bg-slate-950 px-5 text-sm font-semibold text-white disabled:bg-slate-400">
                  {loading ? <Loader size={16} className="animate-spin" /> : <FileText size={16} />}
                  {loading ? 'Planning, writing, and reviewing' : 'Generate Document'}
                </button>
                <span className="text-sm text-slate-500">
                  {creditCost} credits required - DOCX export - professional formatting included
                </span>
              </div>
            </form>

            {error && (
              <div className="mt-4 flex gap-2 rounded-lg border border-red-300/30 bg-red-950/40 p-3 text-sm text-red-100">
                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                <p>{error}</p>
              </div>
            )}

            {lastCreditsUsed !== null && (
              <div className="mt-4 flex gap-2 rounded-lg border border-cyan-300/30 bg-cyan-950/40 p-3 text-sm text-cyan-50">
                <CheckCircle size={16} className="mt-0.5 shrink-0" />
                <p>Used {lastCreditsUsed.toLocaleString()} AI Studio credits.</p>
              </div>
            )}
          </div>
        </section>

        <section className="bg-[#f7f8fb] px-4 py-8 text-slate-950 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            {document ? (
              <article className="rounded-lg border border-slate-200 bg-white p-6 shadow-lg shadow-slate-200/70">
                <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">{document.title}</h2>
                    {document.subtitle && <p className="mt-1 text-sm font-semibold text-cyan-800">{document.subtitle}</p>}
                    {document.executiveSummary && <p className="mt-2 text-sm leading-6 text-slate-600">{document.executiveSummary}</p>}
                  </div>
                  <button onClick={handleExport} disabled={exporting} className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 text-sm font-semibold text-white disabled:bg-slate-400">
                    {exporting ? <Loader size={16} className="animate-spin" /> : <Download size={16} />}
                    {exporting ? 'Exporting' : 'Export DOCX'}
                  </button>
                </div>
                <div className="mb-6 grid gap-3 md:grid-cols-3">
                  <div className="rounded-lg border border-cyan-100 bg-cyan-50 p-4">
                    <p className="text-xs font-bold uppercase tracking-wide text-cyan-800">Sections</p>
                    <p className="mt-1 text-2xl font-bold text-cyan-950">{document.sections.length}</p>
                  </div>
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Export</p>
                    <p className="mt-1 font-bold text-slate-950">DOCX with cover page</p>
                  </div>
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Formatting</p>
                    <p className="mt-1 font-bold text-slate-950">Headings, tables, callouts</p>
                  </div>
                </div>
                {(document.keyInsights.length > 0 || document.recommendations.length > 0) && (
                  <div className="mb-6 grid gap-4 md:grid-cols-2">
                    {document.keyInsights.length > 0 && (
                      <div className="rounded-lg border border-cyan-100 bg-cyan-50 p-4">
                        <h3 className="text-sm font-bold text-cyan-950">Key Insights</h3>
                        <ul className="mt-3 space-y-2 text-sm text-cyan-900">
                          {document.keyInsights.slice(0, 4).map((item) => (
                            <li key={item} className="flex gap-2">
                              <span className="mt-2 h-1.5 w-1.5 rounded-full bg-cyan-700" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {document.recommendations.length > 0 && (
                      <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-4">
                        <h3 className="text-sm font-bold text-emerald-950">Recommendations</h3>
                        <ul className="mt-3 space-y-2 text-sm text-emerald-900">
                          {document.recommendations.slice(0, 4).map((item) => (
                            <li key={item} className="flex gap-2">
                              <span className="mt-2 h-1.5 w-1.5 rounded-full bg-emerald-700" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
                <div className="space-y-5">
                  {document.sections.map((section) => (
                    <section key={section.heading} className="rounded-lg border border-slate-100 bg-slate-50 p-4">
                      <h3 className="font-bold text-slate-950">{section.heading}</h3>
                      {section.paragraphs.map((paragraph) => (
                        <p key={paragraph} className="mt-3 text-sm leading-7 text-slate-700">{paragraph}</p>
                      ))}
                      {section.bulletPoints.length > 0 && (
                        <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-700">
                          {section.bulletPoints.map((bullet) => (
                            <li key={bullet} className="flex gap-2">
                              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-700" />
                              <span>{bullet}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                      {section.tables.length > 0 && (
                        <p className="mt-3 text-xs font-bold uppercase tracking-wide text-cyan-800">
                          Includes {section.tables.length} formatted table{section.tables.length === 1 ? '' : 's'} in DOCX
                        </p>
                      )}
                    </section>
                  ))}
                </div>
              </article>
            ) : (
              <div className="rounded-lg border border-dashed border-slate-300 bg-white p-6">
                <FileText size={24} className="text-cyan-800" />
                <h2 className="mt-4 text-lg font-bold">Your generated document will appear here</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Add a brief, choose the document type, then generate a DOCX-ready draft with cover page,
                  overview, section hierarchy, tables, insights, and recommendations.
                </p>
              </div>
            )}
          </div>
        </section>
      </main>
    </>
  );
}
