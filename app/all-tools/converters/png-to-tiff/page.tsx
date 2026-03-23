'use client';

import Link from 'next/link';
import { HomeHeader } from '../../../components/HomeHeader';
import { Footer } from '../../../components/Footer';

export default function PngToTiffPage() {
  return (
    <>
      <HomeHeader />
      <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex flex-col">
        <div className="relative bg-blue-500 py-16 px-4 md:px-8">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold text-white">PNG to TIFF</h1>
            <p className="text-white/90">Tool coming soon</p>
          </div>
        </div>
        <div className="flex-1 py-12 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl font-bold mb-4">Coming Soon</h2>
            <Link href="/all-tools" className="text-blue-600 hover:underline">Back to Tools</Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
