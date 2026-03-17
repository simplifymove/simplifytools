'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, ChevronRight } from 'lucide-react';
import { getAllPdfTools } from '@/app/lib/pdf-tools';
import { ToolCard } from '@/app/components/ToolCard';
import { motion } from 'framer-motion';
import { HomeHeader } from '@/app/components/HomeHeader';
import { Footer } from '@/app/components/Footer';

export default function PdfToolsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const allPdfTools = getAllPdfTools();

  // Get unique categories
  const categories = Array.from(new Set(allPdfTools.map((tool) => tool.category)));

  // Filter tools based on search and category
  const filteredTools = useMemo(() => {
    let results = allPdfTools;

    // Filter by category
    if (selectedCategory !== 'all') {
      results = results.filter((tool) => tool.category === selectedCategory);
    }

    // Filter by search term
    if (searchTerm.trim()) {
      results = results.filter(
        (tool) =>
          tool.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          tool.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return results;
  }, [searchTerm, selectedCategory]);

  return (
    <>
      <HomeHeader />
      <main className="min-h-screen bg-slate-50 flex flex-col">
        <div className="flex-1">
      {/* Premium Header */}
      <div className="relative bg-gradient-to-r from-purple-600 via-purple-700 to-purple-800 py-16 px-4 md:px-8 overflow-hidden">
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
            <span>PDF Tools</span>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">📄 PDF Tools</h1>
            <p className="text-lg text-white/90 max-w-2xl">
              Professional tools for PDF manipulation, conversion, merging, splitting, and editing
            </p>
          </motion.div>
        </div>
      </div>

      {/* Search & Filter Section */}
      <div className="py-8 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.form
            onSubmit={(e) => e.preventDefault()}
            className="space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {/* Search Bar */}
            <div className="flex gap-2 flex-col sm:flex-row">
              <div className="flex-1 relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-purple-600 transition">
                  <Search className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  placeholder="Search PDF tools..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-full border-2 border-gray-200 hover:border-purple-300 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300 bg-white"
                />
              </div>
              <button
                type="submit"
                className="px-8 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-full font-medium hover:shadow-lg hover:shadow-purple-600/30 transition-all whitespace-nowrap flex items-center justify-center gap-2"
              >
                <Search className="w-4 h-4" />
                Search
              </button>
            </div>

            {/* Category Filters */}
            <div className="flex flex-wrap gap-3 items-center">
              <span className="text-sm font-semibold text-gray-700">Filter by:</span>
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-4 py-2 rounded-full font-medium transition-all ${
                  selectedCategory === 'all'
                    ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg shadow-purple-600/30'
                    : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-purple-300'
                }`}
              >
                All ({allPdfTools.length})
              </button>
              {categories.map((category) => {
                const count = allPdfTools.filter((t) => t.category === category).length;
                return (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-full font-medium transition-all ${
                      selectedCategory === category
                        ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg shadow-purple-600/30'
                        : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-purple-300'
                    }`}
                  >
                    {category} ({count})
                  </button>
                );
              })}
            </div>
          </motion.form>
        </div>
      </div>

      {/* Tools Grid */}
      <div className="py-12 px-4 md:px-8 pb-20">
        <div className="max-w-7xl mx-auto">
          {filteredTools.length === 0 ? (
            <motion.div
              className="flex flex-col items-center justify-center py-32"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="text-center">
                <p className="text-lg text-gray-500 font-medium">
                  {searchTerm
                    ? `No PDF tools found matching "${searchTerm}"`
                    : 'No PDF tools available'}
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ staggerChildren: 0.05, delayChildren: 0.3 }}
            >
              {filteredTools.map((tool) => (
                <motion.div
                  key={tool.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <Link href={`/tools/pdf/${tool.id}`}>
                    <motion.div
                      className="h-full rounded-2xl bg-white border-2 border-gray-200 hover:border-gray-300 p-6 hover:shadow-xl transition-all group relative overflow-hidden"
                      whileHover={{ y: -8 }}
                      transition={{ duration: 0.3 }}
                    >
                      {/* Hover gradient background */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100"
                        transition={{ duration: 0.3 }}
                      />

                      <div className="relative z-10">
                        {/* Icon */}
                        <motion.div
                          className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center group-hover:from-purple-200 group-hover:to-purple-300 transition mb-4"
                          whileHover={{ scale: 1.2, rotate: 12 }}
                        >
                          {tool.icon && <tool.icon className="w-6 h-6 text-purple-600" />}
                        </motion.div>

                        {/* Content */}
                        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-purple-600 transition">{tool.title}</h3>
                        <p className="text-sm text-gray-600 line-clamp-2 mb-4">{tool.description}</p>
                        <motion.div
                          className="flex items-center gap-1 text-purple-600 font-medium text-sm"
                          whileHover={{ gap: 8 }}
                        >
                          Open tool
                          <ChevronRight size={16} />
                        </motion.div>
                      </div>
                    </motion.div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </div>        </div>    </main>
    <Footer />
    </>
  );
}
