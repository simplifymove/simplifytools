'use client';

import { useRouter } from 'next/navigation';
import { dataTools } from '@/app/lib/data-tools';
import { ArrowRight, ChevronRight, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { HomeHeader } from '@/app/components/HomeHeader';
import { Footer } from '@/app/components/Footer';

export default function DataToolsPage() {
  const router = useRouter();

  // Group tools by category
  const toolsByCategory = Object.values(dataTools).reduce(
    (acc, tool) => {
      if (!acc[tool.category]) {
        acc[tool.category] = [];
      }
      acc[tool.category].push(tool);
      return acc;
    },
    {} as Record<string, (typeof dataTools)[keyof typeof dataTools][]>
  );

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
            <span>Data Conversion Tools</span>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">📊 Data Conversion Tools</h1>
            <p className="text-lg text-white/90 max-w-2xl">
              Convert between different file formats, merge files, split documents, and transform your data effortlessly
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
            <h2 className="text-3xl font-bold text-gray-900 mb-8 capitalize">
              {category === 'conversion' ? '🔄 File Conversions' : '✂️ File Splitting'}
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
                    className="h-full bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all p-6 group border-2 border-gray-100 hover:border-gray-200 cursor-pointer overflow-hidden"
                    onClick={() => router.push(`/tools/data/${tool.id}`)}
                  >
                    {/* Hover gradient */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-br from-teal-500/5 to-green-500/5 opacity-0 group-hover:opacity-100"
                      transition={{ duration: 0.3 }}
                    />

                    <div className="relative z-10">
                      {/* Icon */}
                      <div className="mb-4 text-4xl">📄</div>

                      {/* Title */}
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-teal-600 transition line-clamp-2">
                        {tool.title}
                      </h3>

                      {/* Description */}
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {tool.description}
                      </p>

                      {/* Input/Output Formats */}
                      <div className="mb-4 space-y-2 text-xs bg-gray-50 p-3 rounded-lg">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-700">Input:</span>
                          <span className="text-teal-600 font-mono font-medium">{tool.accepts.join(', ')}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-700">Output:</span>
                          <span className="text-green-600 font-mono font-medium">.{tool.output}</span>
                        </div>
                      </div>

                      {/* Engine Badge */}
                      <div className="mb-4 inline-block px-3 py-1 bg-gradient-to-r from-teal-100 to-green-100 text-teal-700 text-xs font-bold rounded-full">
                        {tool.engine}
                      </div>

                      {/* CTA */}
                      <div
                        className="flex items-center gap-2 text-teal-600 font-medium text-sm"
                      >
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
            Why Use Our Data Conversion Tools?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div whileHover={{ scale: 1.05 }}>
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-lg font-semibold mb-2">Fast Processing</h3>
              <p className="text-white/90">Optimized conversion engines handle files up to 100MB with blazing speed</p>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }}>
              <div className="text-4xl mb-4">🔒</div>
              <h3 className="text-lg font-semibold mb-2">Secure & Private</h3>
              <p className="text-white/90">Files are processed securely and automatically deleted after conversion</p>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }}>
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-lg font-semibold mb-2">Multiple Formats</h3>
              <p className="text-white/90">Support for CSV, Excel, JSON, XML, PDF and many more formats</p>
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
