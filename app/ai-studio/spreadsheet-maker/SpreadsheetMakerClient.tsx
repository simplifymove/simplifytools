'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  AlertCircle,
  CheckCircle,
  CreditCard,
  Download,
  Loader,
  Sparkles,
  Table2,
  WalletCards,
} from 'lucide-react';
import { HomeHeader } from '@/app/components/HomeHeader';

interface AiStudioWalletSummary {
  balanceCredits: number;
  reservedCredits: number;
  lifetimeCreditsAdded: number;
  lifetimeCreditsUsed: number;
}

interface GeneratedSpreadsheet {
  workbookTitle: string;
  sheets: Array<{
    sheetName: string;
    description: string;
    columns: string[];
    rows: Array<Array<string | number>>;
    formulas: Array<{ cell: string; formula: string; label: string }>;
    summaryMetrics: Array<{ label: string; value: string | number; format: string }>;
    chartSuggestions: string[];
  }>;
  summaryMetrics: Array<{ label: string; value: string | number; format: string }>;
  chartSuggestions: string[];
  notes: string[];
}

const spreadsheetTypes = ['budget', 'sales report', 'project tracker', 'invoice', 'comparison table', 'plan'];
const complexities = ['simple', 'medium', 'detailed'];
const creditCost = 5;

function buildFileName(title: string) {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 70);

  return `${base || 'ai-studio-spreadsheet'}.xlsx`;
}

export default function SpreadsheetMakerClient() {
  const [topic, setTopic] = useState('');
  const [spreadsheetType, setSpreadsheetType] = useState('budget');
  const [complexity, setComplexity] = useState('medium');
  const [wallet, setWallet] = useState<AiStudioWalletSummary | null>(null);
  const [walletLoading, setWalletLoading] = useState(true);
  const [walletMessage, setWalletMessage] = useState('');
  const [spreadsheet, setSpreadsheet] = useState<GeneratedSpreadsheet | null>(null);
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
      setError('Describe the spreadsheet you want to create.');
      return;
    }

    if (hasInsufficientCredits) {
      setError(`Not enough AI Studio credits. You need ${creditCost} credits to generate a spreadsheet.`);
      return;
    }

    setLoading(true);
    setError('');
    setSpreadsheet(null);
    setLastCreditsUsed(null);

    try {
      const response = await fetch('/api/ai-studio/spreadsheet-maker/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, spreadsheetType, complexity }),
      });
      const data = (await response.json()) as {
        spreadsheet?: GeneratedSpreadsheet;
        creditsUsed?: number;
        wallet?: AiStudioWalletSummary;
        error?: string;
      };

      if (!response.ok || !data.spreadsheet) {
        if (data.wallet) setWallet(data.wallet);
        setError(data.error || 'AI Studio could not generate this spreadsheet right now.');
        return;
      }

      setSpreadsheet(data.spreadsheet);
      if (data.wallet) setWallet(data.wallet);
      if (typeof data.creditsUsed === 'number') setLastCreditsUsed(data.creditsUsed);
    } catch {
      setError('AI Studio could not generate this spreadsheet right now. Please try again in a few minutes.');
    } finally {
      setLoading(false);
    }
  }

  async function handleExport() {
    if (!spreadsheet) return;

    setExporting(true);
    setError('');

    try {
      const response = await fetch('/api/ai-studio/spreadsheet-maker/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(spreadsheet),
      });

      if (!response.ok) {
        throw new Error('Export failed');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = window.document.createElement('a');
      anchor.href = url;
      anchor.download = buildFileName(spreadsheet.workbookTitle);
      anchor.click();
      URL.revokeObjectURL(url);
    } catch {
      setError('Unable to export XLSX right now.');
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
                <h1 className="text-4xl font-bold sm:text-5xl">AI Spreadsheet Maker</h1>
                <p className="mt-4 max-w-2xl text-base leading-7 text-white/78">
                  Generate budgets, reports, trackers, invoices, comparison tables, and planning sheets.
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
                placeholder="Describe the spreadsheet you need, including purpose, columns, example rows, business context, or calculations."
                maxLength={1200}
              />
              <div className="mt-4 grid gap-3 md:grid-cols-3">
                <label className="block">
                  <span className="text-xs font-bold uppercase tracking-wide text-slate-500">Spreadsheet type</span>
                  <select value={spreadsheetType} onChange={(event) => setSpreadsheetType(event.target.value)} className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm">
                    {spreadsheetTypes.map((item) => (
                      <option key={item} value={item}>{item}</option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="text-xs font-bold uppercase tracking-wide text-slate-500">Rows / complexity</span>
                  <select value={complexity} onChange={(event) => setComplexity(event.target.value)} className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm">
                    {complexities.map((item) => (
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
                  {loading ? <Loader size={16} className="animate-spin" /> : <Table2 size={16} />}
                  {loading ? 'Generating spreadsheet' : 'Generate Spreadsheet'}
                </button>
                <span className="text-sm text-slate-500">
                  {creditCost} credits required - XLSX export - professional formatting included
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
            {spreadsheet ? (
              <article className="rounded-lg border border-slate-200 bg-white p-6 shadow-lg shadow-slate-200/70">
                <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">{spreadsheet.workbookTitle}</h2>
                    {spreadsheet.notes.length > 0 && (
                      <p className="mt-2 text-sm leading-6 text-slate-600">{spreadsheet.notes[0]}</p>
                    )}
                  </div>
                  <button onClick={handleExport} disabled={exporting} className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 text-sm font-semibold text-white disabled:bg-slate-400">
                    {exporting ? <Loader size={16} className="animate-spin" /> : <Download size={16} />}
                    {exporting ? 'Exporting' : 'Export XLSX'}
                  </button>
                </div>
                <div className="mb-6 grid gap-3 md:grid-cols-4">
                  <div className="rounded-lg border border-cyan-100 bg-cyan-50 p-4">
                    <p className="text-xs font-bold uppercase tracking-wide text-cyan-800">Sheets</p>
                    <p className="mt-1 text-2xl font-bold text-cyan-950">{spreadsheet.sheets.length + 2}</p>
                  </div>
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Metrics</p>
                    <p className="mt-1 font-bold text-slate-950">{spreadsheet.summaryMetrics.length}</p>
                  </div>
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Formulas</p>
                    <p className="mt-1 font-bold text-slate-950">{spreadsheet.sheets.reduce((total, sheet) => total + sheet.formulas.length, 0)}</p>
                  </div>
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Export</p>
                    <p className="mt-1 font-bold text-slate-950">Styled XLSX workbook</p>
                  </div>
                </div>
                {spreadsheet.summaryMetrics.length > 0 && (
                  <div className="mb-6 grid gap-3 md:grid-cols-3">
                    {spreadsheet.summaryMetrics.slice(0, 6).map((metric) => (
                      <div key={metric.label} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                        <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{metric.label}</p>
                        <p className="mt-1 text-lg font-bold text-slate-950">{metric.value}</p>
                      </div>
                    ))}
                  </div>
                )}
                <div className="overflow-x-auto rounded-lg border border-slate-200">
                  {spreadsheet.sheets.length > 0 && (
                  <table className="min-w-full text-left text-sm">
                    <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wide text-slate-500">
                      <tr>
                        {spreadsheet.sheets[0].columns.map((column) => (
                          <th key={column} className="px-4 py-3">{column}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {spreadsheet.sheets[0].rows.slice(0, 8).map((row, rowIndex) => (
                        <tr key={`${spreadsheet.workbookTitle}-${rowIndex}`}>
                          {spreadsheet.sheets[0].columns.map((column, columnIndex) => (
                            <td key={`${column}-${columnIndex}`} className="px-4 py-3 text-slate-700">
                              {row[columnIndex] ?? ''}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  )}
                </div>
                <div className="mt-5 grid gap-3 md:grid-cols-2">
                  {spreadsheet.sheets.map((sheet) => (
                    <div key={sheet.sheetName} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                      <p className="font-bold text-slate-950">{sheet.sheetName}</p>
                      <p className="mt-1 text-sm text-slate-600">{sheet.description || `${sheet.rows.length} rows`}</p>
                    </div>
                  ))}
                </div>
              </article>
            ) : (
              <div className="rounded-lg border border-dashed border-slate-300 bg-white p-6">
                <Table2 size={24} className="text-cyan-800" />
                <h2 className="mt-4 text-lg font-bold">Your generated spreadsheet will appear here</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Add a brief, choose the spreadsheet type, then generate a styled XLSX workbook with Summary,
                  data sheets, formulas, formatting, filters, and notes.
                </p>
              </div>
            )}
          </div>
        </section>
      </main>
    </>
  );
}
