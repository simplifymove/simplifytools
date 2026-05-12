'use client';

import { HomeHeader } from '@/app/components/HomeHeader';
import { Footer } from '@/app/components/Footer';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

export default function AddTextToPdfPage() {
  return (
    <>
      <HomeHeader />
      <main className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 flex flex-col">
        {/* Hero Section */}
        <div className="relative bg-linear-to-r from-blue-600 via-blue-700 to-blue-800 py-16 px-4 md:px-8 overflow-hidden">
          <div className="max-w-6xl mx-auto relative z-10 w-full">
            <div className="flex items-center gap-2 text-white/80 text-sm mb-6">
              <Link href="/" className="hover:text-white transition">
                Home
              </Link>
              <ChevronRight size={16} />
              <Link href="/all-tools" className="hover:text-white transition">
                All Tools
              </Link>
              <ChevronRight size={16} />
              <Link href="/all-tools/pdf" className="hover:text-white transition">
                PDF Tools
              </Link>
              <ChevronRight size={16} />
              <span>Add Text to PDF</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">✍️ Add Text to PDF</h1>
            <p className="text-lg text-white/90 max-w-2xl">
              This tool is currently under development. We're working on a robust, user-friendly PDF text editor.
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 py-8 px-4 md:px-8">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-8 text-center">
              <div className="mb-6">
                <div className="text-6xl mb-4">🚧</div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Coming Soon</h2>
                <p className="text-gray-600 mb-4">
                  The PDF Add Text tool is currently being refined and will be available soon. 
                  In the meantime, check out our other PDF tools below.
                </p>
              </div>

              <Link
                href="/all-tools/pdf"
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition"
              >
                ← Back to PDF Tools
              </Link>
            </div>
          </div>
        </div>

        <Footer />
      </main>
    </>
  );
}
