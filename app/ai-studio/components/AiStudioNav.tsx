import Link from 'next/link';
import { Sparkles } from 'lucide-react';

const navigation = [
  { label: 'Product', href: '/ai-studio#product' },
  { label: 'Examples', href: '/ai-studio#examples' },
  { label: 'How it works', href: '/ai-studio#how-it-works' },
  { label: 'Pricing', href: '/ai-studio/pricing' },
  { label: 'FAQ', href: '/ai-studio#faq' },
];

export function AiStudioNav() {
  return (
    <div className="border-b border-slate-200 bg-white px-4 py-4 text-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 md:flex-row md:items-center md:justify-between md:gap-6">
        <div className="flex min-w-0 items-start gap-2.5">
          <Sparkles size={17} className="mt-0.5 shrink-0 text-cyan-800" aria-hidden="true" />
          <div>
            <p className="text-sm font-bold leading-5 text-slate-950">AI Studio</p>
            <p className="text-xs leading-5 text-slate-500">
              Create presentations, documents and spreadsheets with AI
            </p>
          </div>
        </div>

        <nav
          className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm font-medium text-slate-600"
          aria-label="AI Studio sections"
        >
          {navigation.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="rounded-md transition hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-700 focus-visible:ring-offset-2"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
