import type { LucideIcon } from 'lucide-react';
import { ArrowRight } from 'lucide-react';
import { ProtectedAiStudioLink } from './ProtectedAiStudioLink';

interface AiStudioProductCardProps {
  title: string;
  description: string;
  useCases: string[];
  format: string;
  href: string;
  cta: string;
  icon: LucideIcon;
  isAuthenticated: boolean;
}

export function AiStudioProductCard({
  title,
  description,
  useCases,
  format,
  href,
  cta,
  icon: Icon,
  isAuthenticated,
}: AiStudioProductCardProps) {
  return (
    <article className="flex h-full flex-col rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition motion-safe:hover:-translate-y-1 motion-safe:hover:shadow-xl sm:p-7">
      <div className="mb-6 flex items-center justify-between">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-cyan-200">
          <Icon size={23} aria-hidden="true" />
        </span>
        <span className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-bold text-cyan-900">
          {format}
        </span>
      </div>
      <h3 className="text-xl font-bold text-slate-950">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-slate-600">{description}</p>
      <ul className="mt-5 flex flex-wrap gap-2" aria-label={`${title} example uses`}>
        {useCases.map((useCase) => (
          <li key={useCase} className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600">
            {useCase}
          </li>
        ))}
      </ul>
      <ProtectedAiStudioLink
        href={href}
        isAuthenticated={isAuthenticated}
        className="mt-7 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-cyan-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-700 focus-visible:ring-offset-2"
      >
        {cta}
        <ArrowRight size={16} aria-hidden="true" />
      </ProtectedAiStudioLink>
    </article>
  );
}
