'use client';

import { getAllTools } from '@/app/lib/code-tools';
import Link from 'next/link';
import { ArrowRight, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Header } from '@/app/components/Header';
import { Footer } from '@/app/components/Footer';

export default function CodeToolsPage() {
  const tools = getAllTools();

  // Group tools by engine
  const toolsByEngine = tools.reduce(
    (acc, tool) => {
      if (!acc[tool.engine]) {
        acc[tool.engine] = [];
      }
      acc[tool.engine].push(tool);
      return acc;
    },
    {} as Record<string, typeof tools>
  );

  const engineLabels: Record<string, { title: string; color: string; description: string }> = {
    formatter: {
      title: '✨ Formatters & Minifiers',
      color: 'from-blue-500 to-cyan-500',
      description: 'Format, beautify, and minify code',
    },
    converter: {
      title: '🔄 Converters & Encoders',
      color: 'from-purple-500 to-pink-500',
      description: 'Convert between formats and encoding',
    },
    validator: {
      title: '✓ Validators & Parsers',
      color: 'from-green-500 to-emerald-500',
      description: 'Validate and parse different formats',
    },
    generator: {
      title: '🎲 Generators & Utilities',
      color: 'from-orange-500 to-red-500',
      description: 'Generate IDs, hashes, and utilities',
    },
  };

  return (
    <>
      <Header />
      <main className="min-h-screen bg-slate-50 flex flex-col">
        <div className="flex-1">
      {/* Premium Header */}
      <div className="relative bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 py-16 px-4 md:px-8 overflow-hidden">
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
            <span>Code Tools</span>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
              💻 Code Tools
            </h1>
            <p className="text-lg text-white/90 max-w-2xl">
              Essential tools for developers. Format, validate, convert, and generate code instantly
            </p>
          </motion.div>
        </div>
      </div>

      {/* Tools Grid */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        {Object.entries(engineLabels).map(([engine, { title, color, description }], engineIdx) => (
          <motion.div 
            key={engine} 
            className="mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: engineIdx * 0.1 }}
          >
            {/* Section Header */}
            <div className="mb-8">
              <h2 className={`text-3xl font-bold bg-gradient-to-r ${color} bg-clip-text text-transparent mb-2`}>
                {title}
              </h2>
              <p className="text-gray-600 font-medium">{description}</p>
            </div>

            {/* Tools Grid */}
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ staggerChildren: 0.05, delayChildren: 0.2 }}
            >
              {toolsByEngine[engine]?.map((tool) => (
                <motion.div
                  key={tool.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <Link
                    href={`/tools/code/${tool.id}`}
                    className="group h-full"
                  >
                    <motion.div
                      className="relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all p-6 group border-2 border-gray-100 hover:border-gray-200 overflow-hidden cursor-pointer h-full flex flex-col"
                      whileHover={{ y: -8 }}
                      transition={{ duration: 0.3 }}
                    >
                      {/* Gradient overlay on hover */}
                      <motion.div 
                        className={`absolute inset-0 bg-gradient-to-r ${color} opacity-0 group-hover:opacity-5`}
                        transition={{ duration: 0.3 }}
                      />

                      <div className="relative z-10 flex flex-col h-full">
                        {/* Icon and Title */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="text-4xl mb-2">{tool.icon}</div>
                            <h3 className="text-lg font-bold text-gray-900 group-hover:text-green-600 transition line-clamp-2">
                              {tool.title}
                            </h3>
                          </div>
                          <motion.div
                            className="ml-2 text-gray-300 group-hover:text-green-600 transition flex-shrink-0"
                            whileHover={{ x: 2 }}
                          >
                            <ChevronRight size={20} />
                          </motion.div>
                        </div>

                        {/* Description */}
                        <p className="text-gray-600 text-sm line-clamp-2 mb-4 flex-grow">
                          {tool.description}
                        </p>

                        {/* Options count badge */}
                        {tool.options.length > 0 && (
                          <div className="inline-block px-3 py-1 bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 text-xs font-bold rounded-full self-start">
                            {tool.options.length} option{tool.options.length !== 1 ? 's' : ''}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        ))}
      </div>

      {/* Stats Section */}
      <motion.div 
        className="bg-gradient-to-r from-green-600 to-emerald-600 py-12 px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <motion.div whileHover={{ scale: 1.05 }}>
              <div className="text-3xl font-bold text-white">{tools.length}</div>
              <p className="text-white/80 text-sm mt-2 font-medium">Tools Available</p>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }}>
              <div className="text-3xl font-bold text-white">{Object.keys(toolsByEngine).length}</div>
              <p className="text-white/80 text-sm mt-2 font-medium">Categories</p>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }}>
              <div className="text-3xl font-bold text-white">100%</div>
              <p className="text-white/80 text-sm mt-2 font-medium">Free & Open</p>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }}>
              <div className="text-3xl font-bold text-white">⚡</div>
              <p className="text-white/80 text-sm mt-2 font-medium">Instant Results</p>
            </motion.div>
          </div>
        </div>
      </motion.div>
        </div>
      </main>
      <Footer />
    </>
  );
}
