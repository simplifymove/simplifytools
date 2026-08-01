'use client';

import Link from 'next/link';
import { Layers, ShieldCheck, Target, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { HomeHeader } from '@/app/components/HomeHeader';
import { Footer } from '@/app/components/Footer';

const values = [
  { icon: Zap, title: 'Practical and Efficient', description: 'We focus each utility on a clear task and avoid unnecessary setup.' },
  { icon: Layers, title: 'Focused Workflows', description: 'Inputs and options are organized around the job each tool is designed to complete.' },
  { icon: Target, title: 'Useful Guidance', description: 'We explain format tradeoffs and encourage users to review important outputs before relying on them.' },
  { icon: ShieldCheck, title: 'Clear Product Boundaries', description: 'Free utilities and the credit-based Premium AI Studio are presented as distinct services with relevant policies.' },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white">
      <HomeHeader />
      <div className="bg-orange-500 px-4 py-16 md:px-8">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-4xl font-bold text-white md:text-5xl">About SimplifyConvert</h1>
          <p className="mt-4 max-w-2xl text-xl text-white/90">Practical online utilities for everyday files, data, code, and writing tasks.</p>
        </div>
      </div>
      <div className="mx-auto max-w-4xl space-y-12 px-4 py-16 md:px-8 md:py-24">
        <section>
          <h2 className="mb-6 text-3xl font-bold text-gray-900">What SimplifyConvert Does</h2>
          <div className="space-y-4 text-lg leading-relaxed text-gray-600">
            <p>SimplifyConvert brings focused online tools together so people can complete common digital tasks without installing a separate application for each one.</p>
            <p>The free utility library covers PDFs, images, video, structured data, code, and calculators. Premium AI Studio is a separate account-based product that uses purchased credits for advanced AI workflows.</p>
            <p>Some tasks run in the browser, while file conversion, media processing, AI, and other complex operations may send input to our servers. Supported formats, limits, and processing methods vary by tool.</p>
          </div>
        </section>
        <section>
          <h2 className="mb-6 text-3xl font-bold text-gray-900">Tool Categories</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {['PDF conversion, organization, and editing', 'Image conversion, resizing, and enhancement', 'Video conversion and media workflows', 'Spreadsheet and structured-data conversion', 'Code formatting, validation, and encoding', 'AI-assisted writing utilities', 'Focused financial planning calculators'].map((offer) => (
              <div key={offer} className="flex items-center gap-3 rounded-lg border border-gray-200 p-4 text-gray-700"><span className="h-2 w-2 rounded-full bg-orange-500" />{offer}</div>
            ))}
          </div>
        </section>
        <section>
          <h2 className="mb-8 text-3xl font-bold text-gray-900">What Guides the Site</h2>
          <div className="grid gap-6 md:grid-cols-2">
            {values.map(({ icon: Icon, title, description }) => (
              <motion.div key={title} className="rounded-xl border-2 border-gray-200 p-6" whileHover={{ y: -4 }}>
                <Icon className="mb-3 h-8 w-8 text-orange-500" /><h3 className="mb-2 text-xl font-bold text-gray-900">{title}</h3><p className="text-gray-600">{description}</p>
              </motion.div>
            ))}
          </div>
        </section>
        <section>
          <h2 className="mb-6 text-3xl font-bold text-gray-900">Questions and Feedback</h2>
          <p className="text-lg leading-relaxed text-gray-600">If a tool behaves unexpectedly, tell us which tool you used, the input format, and the error you saw. Visit our <Link href="/contact" className="text-orange-600 underline">Contact page</Link> or email info@simplifyconvert.com.</p>
        </section>
        <div className="rounded-2xl bg-orange-50 p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900">Find the Right Utility</h2><p className="my-4 text-gray-600">Browse by category or search for a specific format and action.</p>
          <Link href="/all-tools" className="inline-block rounded-full bg-orange-500 px-8 py-3 font-semibold text-white hover:bg-orange-600">Explore All Tools</Link>
        </div>
      </div>
      <Footer />
    </main>
  );
}
