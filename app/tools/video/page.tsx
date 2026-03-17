'use client';

import { useRouter } from 'next/navigation';
import { videoTools } from '@/app/lib/video-tools';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { HomeHeader } from '@/app/components/HomeHeader';
import { Footer } from '@/app/components/Footer';

export default function VideoToolsPage() {
  const router = useRouter();

  // Group tools by category
  const toolsByCategory = Object.values(videoTools).reduce(
    (acc, tool) => {
      if (!acc[tool.category]) {
        acc[tool.category] = [];
      }
      acc[tool.category].push(tool);
      return acc;
    },
    {} as Record<string, (typeof videoTools)[keyof typeof videoTools][]>
  );

  return (
    <>
      <HomeHeader />
      <main className="min-h-screen bg-slate-50 flex flex-col">
        <div className="flex-1">
      {/* Premium Header */}
      <div className="relative bg-gradient-to-r from-pink-600 via-rose-600 to-pink-700 py-16 px-4 md:px-8 overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-white/80 text-sm mb-6">
            <Link href="/" className="hover:text-white transition">Home</Link>
            <ChevronRight size={16} />
            <span>Video Tools</span>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">🎬 Video Tools</h1>
            <p className="text-lg text-white/90 max-w-2xl">
              Powerful video processing tools to compress, convert, edit, and transform your videos effortlessly
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
              {category === 'compression' && '📦 Compression'}
              {category === 'conversion' && '🔄 Conversion'}
              {category === 'editing' && '✂️ Editing'}
              {category === 'enhancement' && '✨ Enhancement'}
              {category === 'extraction' && '📂 Extraction'}
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
                    onClick={() => router.push(`/tools/video/${tool.id}`)}
                  >
                    {/* Hover gradient */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-rose-500/5 opacity-0 group-hover:opacity-100"
                      transition={{ duration: 0.3 }}
                    />

                    <div className="relative z-10">
                      {/* Icon */}
                      <div className="mb-4 text-4xl">🎥</div>

                      {/* Title */}
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-pink-600 transition line-clamp-2">
                        {tool.title}
                      </h3>

                      {/* Description */}
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {tool.description}
                      </p>

                      {/* Tool Info */}
                      <div className="mb-4 space-y-2 text-xs bg-gray-50 p-3 rounded-lg">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-700">Category:</span>
                          <span className="text-pink-600 font-mono font-medium capitalize">{tool.category}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-700">Engine:</span>
                          <span className="text-rose-600 font-mono font-medium">{tool.engine}</span>
                        </div>
                      </div>

                      {/* Category Badge */}
                      <div className="mb-4 inline-block px-3 py-1 bg-gradient-to-r from-pink-100 to-rose-100 text-pink-700 text-xs font-bold rounded-full">
                        {tool.category}
                      </div>

                      {/* CTA */}
                      <div
                        className="flex items-center gap-2 text-pink-600 font-medium text-sm"
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
          className="bg-gradient-to-r from-pink-600 to-rose-600 rounded-2xl shadow-xl p-12 text-white"
          whileHover={{ y: -4 }}
        >
          <h2 className="text-3xl font-bold mb-8">
            Why Use Our Video Tools?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div whileHover={{ scale: 1.05 }}>
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-lg font-semibold mb-2">Fast Processing</h3>
              <p className="text-white/90">Optimized video engines handle large files with blazing speed</p>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }}>
              <div className="text-4xl mb-4">🔒</div>
              <h3 className="text-lg font-semibold mb-2">Secure & Private</h3>
              <p className="text-white/90">Videos are processed securely and automatically deleted after processing</p>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }}>
              <div className="text-4xl mb-4">🎬</div>
              <h3 className="text-lg font-semibold mb-2">Multiple Formats</h3>
              <p className="text-white/90">Support for MP4, MOV, AVI, MKV, WebM and many more formats</p>
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
