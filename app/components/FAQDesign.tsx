import React from 'react';

// Presentation copied from HomePageClient's FAQ. Keep native details behavior
// and schema generation at the call site so content and SEO remain unchanged.
export const faqStyles = {
  section: 'border-t border-slate-200 bg-slate-50 py-16 md:py-20',
  container: 'mx-auto max-w-4xl px-4 sm:px-6 lg:px-8',
  heading: 'mt-3 text-center text-3xl font-bold tracking-tight text-slate-950 md:text-4xl',
  list: 'mt-10 space-y-3',
  card: 'group rounded-2xl border border-slate-200 bg-white shadow-sm',
  question: 'flex cursor-pointer list-none items-center justify-between gap-5 rounded-2xl px-5 py-5 font-bold text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600 md:px-6',
  answer: 'border-t border-slate-100 px-5 py-5 leading-7 text-slate-600 md:px-6',
};

export function FAQPanel({ children, ...props }: React.HTMLAttributes<HTMLElement>) {
  return <section {...props} className={faqStyles.section}><div className={faqStyles.container}>{children}</div></section>;
}

export function FAQHeading(props: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h2 {...props} className={faqStyles.heading} />;
}

export function FAQList(props: React.HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className={faqStyles.list} />;
}

// Keep existing template imports compatible while giving every FAQ the same
// native, initially collapsed accordion used by the Homepage.
export function FAQCard(props: React.DetailsHTMLAttributes<HTMLDetailsElement>) {
  return <FAQDisclosure {...props} />;
}

export function FAQDisclosure(props: React.DetailsHTMLAttributes<HTMLDetailsElement>) {
  return <details {...props} className={faqStyles.card} />;
}

export function FAQQuestion({ children, ...props }: React.HTMLAttributes<HTMLElement>) {
  return <summary {...props} className={faqStyles.question}><span>{children}</span><span aria-hidden="true" className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-lg text-slate-600 transition group-open:rotate-45">+</span></summary>;
}

export function FAQStaticQuestion(props: React.HTMLAttributes<HTMLHeadingElement>) {
  return <FAQQuestion {...props} />;
}

export function FAQAnswer(props: React.HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className={faqStyles.answer} />;
}
