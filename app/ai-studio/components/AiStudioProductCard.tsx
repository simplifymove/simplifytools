import type { LucideIcon } from 'lucide-react';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { ProtectedAiStudioLink } from './ProtectedAiStudioLink';

interface AiStudioProductCardProps {
  title: string;
  description: string;
  format: string;
  href: string;
  cta: string;
  icon: LucideIcon;
  isAuthenticated: boolean;
  protectLink?: boolean;
}

export function AiStudioProductCard({
  title,
  description,
  format,
  href,
  cta,
  icon: Icon,
  isAuthenticated,
  protectLink = true,
}: AiStudioProductCardProps) {
  const linkClassName =
    'mt-5 inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-orange-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-600 focus-visible:ring-offset-2';
  const linkContent = (
    <>
      {cta}
      <ArrowRight size={16} aria-hidden="true" />
    </>
  );

  return (
    <article className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition motion-safe:hover:-translate-y-0.5 motion-safe:hover:border-orange-200 motion-safe:hover:shadow-lg">
      <div className="mb-4 flex items-center justify-between">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-700">
          <Icon size={21} aria-hidden="true" />
        </span>
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-bold ${
            format === 'Preview'
              ? 'bg-amber-50 text-amber-900 ring-1 ring-inset ring-amber-200'
              : 'bg-slate-100 text-slate-700'
          }`}
          aria-label={`${title}: ${format}`}
        >
          {format}
        </span>
      </div>
      <h3 className="text-lg font-bold text-slate-950">{title}</h3>
      <p className="mt-2 flex-1 text-sm leading-5 text-slate-600">{description}</p>
      {protectLink ? (
        <ProtectedAiStudioLink
          href={href}
          isAuthenticated={isAuthenticated}
          className={linkClassName}
          aria-label={`${cta} with AI Studio`}
        >
          {linkContent}
        </ProtectedAiStudioLink>
      ) : (
        <Link
          href={href}
          className={linkClassName}
          aria-label={`${cta} in AI Studio`}
        >
          {linkContent}
        </Link>
      )}
    </article>
  );
}
