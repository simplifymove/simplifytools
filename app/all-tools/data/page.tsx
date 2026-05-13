'use client';

import { useRouter } from 'next/navigation';
import { dataViewTools, getDataViewToolsByCategory } from '@/app/lib/data-view-tools';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { HomeHeader } from '@/app/components/HomeHeader';
import { Footer } from '@/app/components/Footer';

export default function DataToolsPage() {
  const router = useRouter();

  // Get tools grouped by category
  const toolsByCategory = getDataViewToolsByCategory();

  return (
    <>
      <HomeHeader />
      <main className="min-h-screen bg-slate-50 flex flex-col">
        <div className="flex-1">
      {/* Premium Header */}
      <div className="relative bg-gradient-to-r from-teal-600 via-emerald-600 to-green-600 py-16 px-4 md:px-8 overflow-hidden">
        {/* Animated background shapes */}
        <motion.div
          className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full mix-blend-multiply filter blur-3xl"
          animate={{ x: [0, 30, -20, 0], y: [0, -30, 20, 0] }}
          transition={{ duration: 10, repeat: Infinity }}
        />

        <div className="max-w-7xl mx-auto relative z-10">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-white/80 text-sm mb-6">
            <Link href="/" className="hover:text-white transition">Home</Link>
            <ChevronRight size={16} />
            <Link href="/all-tools" className="hover:text-white transition">All Tools</Link>
            <ChevronRight size={16} />
            <span>Data Conversion Tools</span>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">📊 Data Tools Suite</h1>
            <p className="text-lg text-white/90 max-w-2xl">
              Convert, encode, format, validate, and view data in 25+ formats. Transform JSON, CSV, XML, YAML, Base64, HTML, and more—instantly and securely.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Tools Grid */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        {Object.entries(toolsByCategory).map(([category, tools], catIdx) => (
          <motion.div 
            key={category} 
            className="mb-14"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: catIdx * 0.1 }}
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              {category === 'Format Conversion' && '🔄 Format Converters'}
              {category === 'Encoding' && '🔐 Encoding Tools'}
              {category === 'Formatting' && '✨ Formatters'}
              {category === 'Validation' && '✅ Validators'}
              {category === 'Viewers' && '👁️ Data Viewers'}
            </h2>

            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ staggerChildren: 0.05, delayChildren: 0.2 }}
            >
              {tools.map((tool) => (
                <motion.div
                  key={tool.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <motion.div
                    className="h-full bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all p-6 group border-2 border-gray-100 hover:border-teal-200 cursor-pointer overflow-hidden"
                    onClick={() => router.push(`/all-tools/data/${tool.id}`)}
                  >
                    {/* Hover gradient */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-br from-teal-500/5 to-green-500/5 opacity-0 group-hover:opacity-100"
                      transition={{ duration: 0.3 }}
                    />

                    <div className="relative z-10">
                      {/* Icon */}
                      <div className="mb-4 text-4xl">
                        {tool.id.includes('encode') || tool.id.includes('decode') && '🔐'}
                        {tool.id.includes('formatter') && '✨'}
                        {tool.id.includes('validator') && '✅'}
                        {(tool.id.includes('viewer') || tool.id.includes('view')) && '👁️'}
                        {(tool.id.includes('csv') || tool.id.includes('json') || tool.id.includes('xml') || tool.id.includes('yaml') || tool.id.includes('tsv') || tool.id.includes('sql')) && !tool.id.includes('validator') && !tool.id.includes('formatter') && !tool.id.includes('viewer') && '🔄'}
                      </div>

                      {/* Title */}
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-teal-600 transition line-clamp-2">
                        {tool.title}
                      </h3>

                      {/* Description */}
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                        {tool.description}
                      </p>

                      {/* Category Badge */}
                      <div className="mb-4 inline-block px-3 py-1 bg-gradient-to-r from-teal-100 to-green-100 text-teal-700 text-xs font-bold rounded-full">
                        {tool.engine}
                      </div>

                      {/* Mode Indicators */}
                      <div className="mb-4 text-xs text-gray-600 space-y-1">
                        <div><span className="font-semibold">Input:</span> {tool.inputMode}</div>
                        <div><span className="font-semibold">Output:</span> {tool.outputMode}</div>
                      </div>

                      {/* CTA */}
                      <div className="flex items-center gap-2 text-teal-600 font-medium text-sm">
                        Use Tool
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        ))}
      </div>

      {/* Feature Highlight */}
      <motion.div 
        className="max-w-7xl mx-auto px-4 py-12 pb-20"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <motion.div 
          className="bg-gradient-to-r from-teal-600 to-green-600 rounded-2xl shadow-xl p-12 text-white"
          whileHover={{ y: -4 }}
        >
          <h2 className="text-3xl font-bold mb-8">
            Why Choose SimplifyConvert Data Tools?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div whileHover={{ scale: 1.05 }}>
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-lg font-semibold mb-2">Instant Processing</h3>
              <p className="text-white/90">25+ tools for converting, encoding, formatting, and validating data in seconds—no installation needed</p>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }}>
              <div className="text-4xl mb-4">🔒</div>
              <h3 className="text-lg font-semibold mb-2">Secure & Private</h3>
              <p className="text-white/90">Your data stays private. Files are processed securely and automatically deleted after use</p>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }}>
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-lg font-semibold mb-2">All Formats</h3>
              <p className="text-white/90">Work with JSON, CSV, XML, YAML, Base64, URL, HTML, and more—all in one suite</p>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
        </div>
      </main>
      <Footer />
    </>
  );
}







