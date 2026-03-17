'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { aiWriteTools, type ToolCategory } from '@/app/lib/ai-tools';
import { ArrowRight, Sparkles, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { HomeHeader } from '@/app/components/HomeHeader';
import { Footer } from '@/app/components/Footer';

const categoryLabels: Record<ToolCategory, string> = {
  generate: '✨ Generate',
  rewrite: '✏️ Rewrite & Improve',
  summarize: '📝 Summarize',
  business: '💼 Business & Legal',
  social: '🌐 Social Media',
  utility: '🔧 Utilities',
};

interface CategoryColorConfig {
  gradient: string;
  badgeBg: string;
  badgeText: string;
  hoverColor: string;
}

const categoryColors: Record<ToolCategory, CategoryColorConfig> = {
  generate: { gradient: 'from-purple-600 to-purple-700', badgeBg: 'bg-purple-100', badgeText: 'text-purple-700', hoverColor: '#7c3aed' },
  rewrite: { gradient: 'from-blue-600 to-blue-700', badgeBg: 'bg-blue-100', badgeText: 'text-blue-700', hoverColor: '#2563eb' },
  summarize: { gradient: 'from-orange-600 to-orange-700', badgeBg: 'bg-orange-100', badgeText: 'text-orange-700', hoverColor: '#ea580c' },
  business: { gradient: 'from-green-600 to-green-700', badgeBg: 'bg-green-100', badgeText: 'text-green-700', hoverColor: '#16a34a' },
  social: { gradient: 'from-pink-600 to-pink-700', badgeBg: 'bg-pink-100', badgeText: 'text-pink-700', hoverColor: '#db2777' },
  utility: { gradient: 'from-slate-600 to-slate-700', badgeBg: 'bg-slate-100', badgeText: 'text-slate-700', hoverColor: '#475569' },
};

export default function AIWriteToolsPage() {
  const categories = useMemo(() => {
    const grouped: Record<ToolCategory, typeof aiWriteTools> = {
      generate: {},
      rewrite: {},
      summarize: {},
      business: {},
      social: {},
      utility: {},
    };

    Object.entries(aiWriteTools).forEach(([id, tool]) => {
      grouped[tool.category][id] = tool;
    });

    return grouped;
  }, []);

  return (
    <>
      <HomeHeader />
      <main className="min-h-screen bg-slate-50 flex flex-col">
        <div className="flex-1">
      {/* Premium Header */}
      <div className="relative bg-gradient-to-r from-blue-600 to-cyan-700 py-16 px-4 md:px-8 overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-white/80 text-sm mb-6">
            <Link href="/" className="hover:text-white transition">Home</Link>
            <ChevronRight size={16} />
            <span>AI Writing Tools</span>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-3 flex items-center gap-3">
              ✨ AI Writing Tools
            </h1>
            <p className="text-lg text-white/90 max-w-2xl">
              Powerful AI-powered writing assistants to generate content, rewrite text, summarize documents, and more
            </p>
          </motion.div>
        </div>
      </div>

      {/* Tools Grid */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        {Object.entries(categories).map(([category, tools], catIndex) => {
          if (Object.keys(tools).length === 0) return null;

          const categoryKey = category as ToolCategory;
          const colors = categoryColors[categoryKey];

          return (
            <motion.div 
              key={category} 
              className="mb-16"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: catIndex * 0.1 }}
            >
              <h2 className={`text-3xl font-bold bg-gradient-to-r ${colors.gradient} bg-clip-text text-transparent mb-8`}>
                {categoryLabels[categoryKey]}
              </h2>

              <motion.div 
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ staggerChildren: 0.05, delayChildren: 0.2 }}
              >
                {Object.entries(tools).map(([id, tool], idx) => {
                  const colors = categoryColors[tool.category];
                  return (
                    <motion.div
                      key={id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4 }}
                    >
                      <Link href={`/tools/ai-write/${id}`}>
                        <motion.div 
                          className="h-full bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all group border-2 border-gray-100 hover:border-gray-200 overflow-hidden cursor-pointer"
                          whileHover={{ y: -8 }}
                          transition={{ duration: 0.3 }}
                        >
                          {/* Card Content */}
                          <div className="p-6 flex flex-col h-full">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <h3 className="text-lg font-bold text-gray-900 group-hover:opacity-80 transition line-clamp-2">
                                  {tool.title}
                                </h3>
                              </div>
                              <motion.div
                                className="ml-2 text-gray-300 group-hover:opacity-100 transition-opacity flex-shrink-0"
                                whileHover={{ x: 2 }}
                                style={{ color: colors.hoverColor }}
                              >
                                <ChevronRight size={20} />
                              </motion.div>
                            </div>

                            <p className="text-sm text-gray-600 mb-4 line-clamp-2 flex-grow">
                              {tool.description}
                            </p>

                            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                              <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${colors.badgeBg} ${colors.badgeText}`}>
                                {categoryLabels[tool.category].split(' ').pop()}
                              </span>

                              <motion.div
                                className="flex items-center gap-1 font-medium text-sm group-hover:opacity-100 opacity-75 transition-opacity"
                                whileHover={{ gap: 8 }}
                                style={{ color: colors.hoverColor }}
                              >
                                Use tool
                                <ChevronRight size={16} />
                              </motion.div>
                            </div>
                          </div>
                        </motion.div>
                      </Link>
                    </motion.div>
                  );
                })}
              </motion.div>
            </motion.div>
          );
        })}
      </div>

      {/* CTA Section */}
      <motion.div 
        className="bg-gradient-to-r from-blue-600 to-cyan-700 text-white py-16 px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">
            🚀 Ready to Create Amazing Content?
          </h2>
          <p className="text-lg text-white/90 mb-2">
            Choose any tool above and start generating professional content in seconds.
          </p>
          <p className="text-sm text-white/80">
            💡 All tools use our shared AI engine for consistent, high-quality results
          </p>
        </div>
      </motion.div>
        </div>
      </main>
      <Footer />
    </>
  );
}
