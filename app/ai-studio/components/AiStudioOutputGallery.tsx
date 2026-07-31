import { BarChart3, FileText, Presentation } from 'lucide-react';

export function AiStudioOutputGallery() {
  return (
    <div className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
      <article className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-950 p-4 text-white shadow-xl sm:p-6">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-300">Presentation sample</p>
            <h3 className="mt-2 text-xl font-bold">Quarterly growth strategy</h3>
          </div>
          <Presentation className="text-cyan-200" aria-hidden="true" />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="aspect-[16/10] rounded-2xl bg-gradient-to-br from-cyan-200 via-white to-indigo-200 p-5 text-slate-950">
            <p className="text-xs font-bold uppercase tracking-wide text-cyan-900">2026 plan</p>
            <p className="mt-8 text-2xl font-bold">Build durable, efficient growth</p>
            <div className="mt-5 h-1.5 w-20 rounded-full bg-cyan-700" />
          </div>
          <div className="aspect-[16/10] rounded-2xl bg-white p-5 text-slate-950">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Market momentum</p>
            <div className="mt-5 flex h-24 items-end gap-2" aria-hidden="true">
              {[38, 55, 48, 76, 92].map((height, index) => (
                <span key={index} className="flex-1 rounded-t bg-cyan-600" style={{ height: `${height}%` }} />
              ))}
            </div>
            <p className="mt-4 text-sm font-semibold text-slate-700">Editable charts, copy, and layouts</p>
          </div>
        </div>
      </article>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-1">
        <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="rounded-xl bg-indigo-50 p-2.5 text-indigo-700"><FileText size={20} aria-hidden="true" /></span>
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-indigo-700">Document sample</p>
              <h3 className="font-bold text-slate-950">Business proposal</h3>
            </div>
          </div>
          <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="h-3 w-2/3 rounded bg-slate-800" />
            <div className="mt-4 space-y-2" aria-hidden="true">
              <div className="h-2 rounded bg-slate-300" />
              <div className="h-2 w-11/12 rounded bg-slate-300" />
              <div className="h-2 w-4/5 rounded bg-slate-300" />
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="h-14 rounded-lg bg-indigo-100" />
              <div className="h-14 rounded-lg bg-cyan-100" />
            </div>
          </div>
        </article>

        <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="rounded-xl bg-emerald-50 p-2.5 text-emerald-700"><BarChart3 size={20} aria-hidden="true" /></span>
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">Spreadsheet sample</p>
              <h3 className="font-bold text-slate-950">Sales planning workbook</h3>
            </div>
          </div>
          <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200">
            <div className="grid grid-cols-4 bg-slate-100 text-[10px] font-bold uppercase text-slate-500">
              {['Region', 'Target', 'Actual', 'Gap'].map((cell) => <span key={cell} className="p-2">{cell}</span>)}
            </div>
            {[
              ['North', '$42k', '$46k', '+9%'],
              ['West', '$38k', '$35k', '-8%'],
              ['South', '$31k', '$34k', '+10%'],
            ].map((row) => (
              <div key={row[0]} className="grid grid-cols-4 border-t border-slate-100 text-xs text-slate-700">
                {row.map((cell) => <span key={cell} className="p-2">{cell}</span>)}
              </div>
            ))}
          </div>
        </article>
      </div>
    </div>
  );
}
