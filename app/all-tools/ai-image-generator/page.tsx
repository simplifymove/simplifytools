'use client';
import React from 'react';
import Link from 'next/link';
import { Sparkles, ChevronRight, Mail } from 'lucide-react';
import { HomeHeader } from '@/app/components/HomeHeader';
import { Footer } from '@/app/components/Footer';

export default function AiImageGeneratorPage() {
  return (
    <>
      <HomeHeader />
      <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex flex-col">
        {/* Hero Header */}
        <div className="relative bg-orange-500 py-16 px-4 md:px-8 overflow-hidden">
          <div className="max-w-6xl mx-auto relative z-10">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-white/90 text-sm mb-6">
              <Link href="/" className="hover:text-white transition">Home</Link>
              <ChevronRight size={16} />
              <Link href="/all-tools" className="hover:text-white transition">All Tools</Link>
              <ChevronRight size={16} />
              <span>AI Image Generator</span>
            </div>

            {/* Title Section */}
            <div className="flex items-start gap-4 mb-6">
              <div className="p-3 bg-white/20 rounded-lg">
                <Sparkles size={32} className="text-white" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">AI Image Generator</h1>
                <p className="text-lg text-white/90">Transform text prompts into stunning images using advanced AI models.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 py-20 px-4 md:px-8">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
              {/* Coming Soon Badge */}
              <div className="inline-block mb-6 px-4 py-2 bg-orange-100 rounded-full">
                <span className="text-orange-600 font-semibold text-sm">🚀 COMING SOON</span>
              </div>

              {/* Title */}
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                AI Image Generator
              </h2>

              {/* Description */}
              <p className="text-lg text-gray-600 mb-8">
                We're working hard to bring you an amazing AI Image Generator powered by cutting-edge AI models. This tool will allow you to create stunning images from text descriptions.
              </p>

              {/* Features Coming */}
              <div className="mb-10 p-8 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl border border-orange-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4">What to Expect:</h3>
                <ul className="space-y-3 text-left">
                  <li className="flex items-start gap-3">
                    <span className="text-2xl">🎨</span>
                    <span className="text-gray-700"><strong>Multiple AI Models:</strong> Choose from various image generation models</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-2xl">⚡</span>
                    <span className="text-gray-700"><strong>Lightning Fast:</strong> Generate beautiful images in seconds</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-2xl">💯</span>
                    <span className="text-gray-700"><strong>High Quality:</strong> Premium image generation at various resolutions</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-2xl">🎯</span>
                    <span className="text-gray-700"><strong>Advanced Controls:</strong> Fine-tune your results with style and quality options</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-2xl">💰</span>
                    <span className="text-gray-700"><strong>Completely Free:</strong> No signup, no API keys, no hidden costs</span>
                  </li>
                </ul>
              </div>

              {/* Status Info */}
              <div className="mb-8 p-6 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800">
                  <strong>Status:</strong> Our development team is actively working on integrating the latest AI image generation APIs. We expect to launch this tool very soon. Stay tuned!
                </p>
              </div>

              {/* Call to Action */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/all-tools"
                  className="px-8 py-3 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-all flex items-center justify-center gap-2"
                >
                  <ChevronRight size={18} />
                  Browse Other Tools
                </Link>
                <Link
                  href="/contact"
                  className="px-8 py-3 bg-gray-200 text-gray-900 rounded-lg font-medium hover:bg-gray-300 transition-all flex items-center justify-center gap-2"
                >
                  <Mail size={18} />
                  Notify Me
                </Link>
              </div>

              {/* Timeline */}
              <div className="mt-12 pt-8 border-t border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-4">Development Timeline</h4>
                <div className="space-y-3 text-sm text-gray-600">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">✅</span>
                    <span>API integration in progress</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-lg">🔄</span>
                    <span>Testing and optimization</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-lg">🎯</span>
                    <span>Launch preparation - Coming Very Soon!</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}







