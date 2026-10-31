import type { Metadata } from 'next';
import Link from 'next/link';
import { HomeHeader } from '@/app/components/HomeHeader';
import { Footer } from '@/app/components/Footer';

export const metadata: Metadata = {
  title: 'AI YouTube Thumbnail Maker Preview | SimplifyConvert',
  description: 'The thumbnail maker is currently in Preview. Image generation and export capabilities are being prepared for broader availability.',
  robots: { index: false, follow: true },
};

export default function PreviewPage() {
  return (
    <>
      <HomeHeader />
      <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <Link href="/ai-studio" className="text-sm font-semibold text-orange-700 hover:underline">
          Back to AI Studio
        </Link>
        <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm sm:p-12">
          <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-900">
            Preview
          </span>
          <h1 className="mt-5 text-3xl font-bold text-slate-950">AI YouTube Thumbnail Maker</h1>
          <p className="mt-3 text-lg text-slate-700">Plan thumbnails for YouTube videos</p>
          <p className="mt-6 leading-7 text-slate-600">The thumbnail maker is currently in Preview. Image generation and export capabilities are being prepared for broader availability.</p>
          <p className="mt-5 text-sm text-slate-600">
            Generation is not available on this preview page. No credits will be charged.
          </p>
          <Link
            href="/ai-studio"
            className="mt-8 inline-flex rounded-xl bg-slate-950 px-5 py-3 font-semibold text-white hover:bg-slate-800"
          >
            Explore available AI Studio tools
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
