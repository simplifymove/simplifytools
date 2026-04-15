'use client';

import Link from 'next/link';
import { HomeHeader } from '../../../components/HomeHeader';
import { Footer } from '../../../components/Footer';

export default function StubConverterPage() {
  return (
    <>
      <HomeHeader />
      <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex flex-col">
        <div className="relative bg-blue-500 py-16 px-4 md:px-8 overflow-hidden">
          <div className="max-w-6xl mx-auto relative z-10">
            <div className="flex items-center gap-2 text-white/90 text-sm mb-6">
              <Link href="/" className="hover:text-white transition">Home</Link>
              <span>/</span>
              <Link href="/all-tools" className="hover:text-white transition">Tools</Link>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">Converter Tool</h1>
            <p className="text-lg text-white/90">This converter tool is currently being updated. Please check back soon!</p>
          </div>
        </div>
        <div className="flex-1 py-12 px-4 md:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
              <h2 className="text-2xl font-bold mb-4">Coming Soon</h2>
              <p className="text-gray-600 mb-6">We're working on this converter. Please browse other available tools.</p>
              <Link href="/all-tools" className="inline-block px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                Back to Tools
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}







