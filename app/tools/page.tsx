'use client';

import React, { useState, useMemo, Suspense } from 'react';
import { Search, Clock, ChevronRight, Filter, Sparkles, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ToolCard } from '@/app/components/ToolCard';
import { allTools } from '@/app/data/tools';
import { motion } from 'framer-motion';

const categoryColors: Record<string, { bg: string; gradient: string; text: string }> = {
  'Image': { bg: 'bg-orange-50', gradient: 'from-orange-500 to-orange-600', text: 'text-orange-600' },
  'PDF': { bg: 'bg-purple-50', gradient: 'from-purple-500 to-purple-600', text: 'text-purple-600' },
  'Video': { bg: 'bg-pink-50', gradient: 'from-pink-500 to-pink-600', text: 'text-pink-600' },
  'AI Write': { bg: 'bg-blue-50', gradient: 'from-blue-500 to-blue-600', text: 'text-blue-600' },
  'File': { bg: 'bg-indigo-50', gradient: 'from-indigo-500 to-indigo-600', text: 'text-indigo-600' },
};

function ToolsContent() {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('default');
  const [showFilters, setShowFilters] = useState(false);
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get('category');
  const searchParam = searchParams.get('search');

  // Initialize searchTerm from URL parameter
  React.useEffect(() => {
    if (searchParam) {
      setSearchTerm(searchParam);
    }
  }, [searchParam]);

  // Check if category is coming soon or is data tools
  const isDataTools = categoryParam && ['data', 'Data'].includes(categoryParam);
  const isPdfTools = categoryParam && ['pdf', 'PDF'].includes(categoryParam);
  const isComingSoon = categoryParam && !['image', 'Image', 'data', 'Data', 'video', 'Video', 'pdf', 'PDF'].includes(categoryParam);

  const filteredTools = useMemo(() => {
    if (isComingSoon) return [];
    
    let results = allTools;

    // Filter by category if provided
    if (categoryParam) {
      results = results.filter(
        (tool) => tool.category.toLowerCase().includes(categoryParam.toLowerCase())
      );
    }

    // Filter by search term
    if (searchTerm.trim()) {
      results = results.filter(
        (tool) =>
          tool.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          tool.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          tool.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort
    if (sortBy === 'name') {
      results.sort((a, b) => a.title.localeCompare(b.title));
    }

    return results;
  }, [searchTerm, categoryParam, isComingSoon, sortBy]);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  };

  const getToolHref = (tool: any) => {
    return tool.route || '#';
  };

  const categories = ['Image', 'PDF', 'Video', 'AI Write', 'File'];
  const uniqueCategories = [...new Set(allTools.map(t => t.category))];

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Premium Header */}
      <div className="relative bg-orange-500 py-16 px-4 md:px-8 overflow-hidden">
        {/* Animated background shapes */}
        <motion.div
          className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full mix-blend-multiply filter blur-3xl"
          animate={{ x: [0, 30, -20, 0], y: [0, -30, 20, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full mix-blend-multiply filter blur-3xl"
          animate={{ x: [0, -30, 20, 0], y: [0, 30, -20, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />

        <div className="max-w-7xl mx-auto relative z-10">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-white/80 text-sm mb-6">
            <Link href="/" className="hover:text-white transition">Home</Link>
            <ChevronRight size={16} />
            <span>{categoryParam ? `${categoryParam} Tools` : 'All Tools'}</span>
          </div>

          <motion.h1 
            className="text-4xl md:text-6xl font-bold text-white mb-4 leading-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {categoryParam 
              ? `${categoryParam.charAt(0).toUpperCase() + categoryParam.slice(1)} Tools`
              : 'All Tools'
            }
          </motion.h1>
          <motion.p 
            className="text-lg text-white/90 max-w-2xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            {categoryParam 
              ? `Discover our powerful collection of ${categoryParam.toLowerCase()} tools`
              : 'Browse our complete collection of free online tools'
            }
          </motion.p>
        </div>
      </div>

      {/* Search & Filter Section */}
      <div className="py-8 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.form 
            onSubmit={handleSearch} 
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
                  placeholder={categoryParam ? `Search ${categoryParam} tools...` : "Search 200+ tools..."}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-full border-2 border-gray-200 hover:border-purple-300 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300 bg-white"
                />
              </div>
              <button
                type="submit"
                className="px-8 py-3 bg-orange-500 text-white rounded-full font-medium hover:bg-orange-600 hover:shadow-lg hover:shadow-orange-500/30 transition-all whitespace-nowrap flex items-center justify-center gap-2"
              >
                <Search className="w-4 h-4" />
                Search
              </button>
            </div>

            {/* Filter & Sort Controls */}
            <div className="flex gap-4 flex-wrap items-center justify-between">
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="px-4 py-2 rounded-full border-2 border-gray-300 hover:border-purple-500 text-gray-700 hover:text-purple-600 font-medium transition-all flex items-center gap-2"
                >
                  <Filter size={16} />
                  Filters
                </button>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2 rounded-full border-2 border-gray-300 focus:outline-none focus:border-purple-500 bg-white font-medium transition-all"
                >
                  <option value="default">Default</option>
                  <option value="name">A-Z</option>
                </select>
              </div>
              <div className="text-sm text-gray-600">
                <span className="font-semibold text-gray-900">{filteredTools.length}</span> tools found
              </div>
            </div>
          </motion.form>

          {/* Category Pills */}
          {!categoryParam && (
            <motion.div
              className="flex gap-2 flex-wrap mt-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <span className="text-sm font-semibold text-gray-700">Quick categories:</span>
              {uniqueCategories.map((cat) => (
                <Link
                  key={cat}
                  href={`/tools?category=${cat}`}
                  className="px-4 py-2 rounded-full bg-white border-2 border-gray-200 hover:border-purple-500 text-gray-700 hover:text-purple-600 font-medium transition-all hover:shadow-md text-sm"
                >
                  {cat}
                </Link>
              ))}
            </motion.div>
          )}
        </div>
      </div>

      {/* Tools Grid */}
      <div className="py-12 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          {isDataTools ? (
            <motion.div 
              className="flex flex-col items-center justify-center py-32"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="bg-white rounded-2xl shadow-lg p-12 text-center max-w-md border-2 border-gray-100">
                <div className="flex justify-center mb-6">
                  <span className="text-6xl">📊</span>
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Data Conversion Tools</h2>
                <p className="text-gray-600 text-lg mb-8">
                  Powerful tools for converting and transforming your data.
                </p>
                <Link
                  href="/tools/data"
                  className="inline-block px-8 py-3 bg-orange-500 text-white font-bold rounded-full hover:bg-orange-600 hover:shadow-lg transition-all"
                >
                  Go to Data Tools
                </Link>
              </div>
            </motion.div>
          ) : isPdfTools ? (
            <motion.div 
              className="flex flex-col items-center justify-center py-32"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="bg-white rounded-2xl shadow-lg p-12 text-center max-w-md border-2 border-gray-100">
                <div className="flex justify-center mb-6">
                  <span className="text-6xl">📄</span>
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">PDF Tools</h2>
                <p className="text-gray-600 text-lg mb-8">
                  Professional PDF conversion, editing, and manipulation tools.
                </p>
                <Link
                  href="/tools/pdf"
                  className="inline-block px-8 py-3 bg-orange-500 text-white font-bold rounded-full hover:bg-orange-600 hover:shadow-lg transition-all"
                >
                  Go to PDF Tools
                </Link>
              </div>
            </motion.div>
          ) : isComingSoon ? (
            <motion.div 
              className="flex flex-col items-center justify-center py-32"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="bg-white rounded-2xl shadow-lg p-12 text-center max-w-md border-2 border-gray-100">
                <div className="flex justify-center mb-6">
                  <Clock className="w-16 h-16 text-indigo-600" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Coming Soon</h2>
                <p className="text-gray-600 text-lg mb-8">
                  {categoryParam.charAt(0).toUpperCase() + categoryParam.slice(1)} tools are being developed and will be available soon.
                </p>
                <Link
                  href="/"
                  className="inline-block px-8 py-3 bg-orange-500 text-white font-bold rounded-full hover:bg-orange-600 hover:shadow-lg transition-all"
                >
                  Back Home
                </Link>
              </div>
            </motion.div>
          ) : (
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ staggerChildren: 0.05, delayChildren: 0.3 }}
            >
              {filteredTools.map((tool, idx) => (
                <motion.div
                  key={tool.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <Link href={getToolHref(tool)}>
                    <motion.div
                      className="h-full rounded-2xl bg-white border-2 border-gray-200 hover:border-gray-300 p-6 hover:shadow-xl transition-all group relative overflow-hidden"
                      whileHover={{ y: -8 }}
                      transition={{ duration: 0.3 }}
                    >
                      {/* Hover gradient background */}
                      <motion.div
                        className="absolute inset-0 bg-orange-500/5 opacity-0 group-hover:opacity-100"
                        transition={{ duration: 0.3 }}
                      />

                      <div className="relative z-10">
                        {/* Header with Icon & Category */}
                        <div className="flex items-start justify-between mb-4">
                          <motion.div
                            className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center group-hover:bg-orange-200 transition"
                            whileHover={{ scale: 1.2, rotate: 12 }}
                          >
                            {tool.icon && <tool.icon className="w-6 h-6 text-indigo-600" />}
                          </motion.div>
                          <span className="text-xs font-semibold text-gray-600 bg-gray-100 px-2 py-1 rounded-full group-hover:bg-purple-100 group-hover:text-purple-700 transition">
                            {tool.category}
                          </span>
                        </div>

                        {/* Content */}
                        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-purple-600 transition">{tool.title}</h3>
                        <p className="text-sm text-gray-600 line-clamp-2 mb-4">{tool.description}</p>
                        <motion.div
                          className="flex items-center gap-1 text-purple-600 font-medium text-sm"
                          whileHover={{ gap: 8 }}
                        >
                          Open tool
                          <motion.div whileHover={{ x: 2 }}>
                            <ChevronRight size={16} />
                          </motion.div>
                        </motion.div>
                      </div>
                    </motion.div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* No Results */}
          {!isComingSoon && !isDataTools && !isPdfTools && filteredTools.length === 0 && (
            <motion.div
              className="flex flex-col items-center justify-center py-32"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="text-center">
                <Sparkles className="w-16 h-16 text-gray-400 mx-auto mb-6" />
                <h2 className="text-3xl font-bold text-gray-900 mb-2">No tools found</h2>
                <p className="text-gray-600 text-lg mb-8">
                  Try adjusting your search or filters to find what you're looking for.
                </p>
                <Link
                  href="/tools"
                  className="inline-block px-8 py-3 bg-orange-500 text-white font-bold rounded-full hover:bg-orange-600 hover:shadow-lg transition-all"
                >
                  Clear Filters
                </Link>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </main>
  );
}

export default function ToolsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50" />}>
      <ToolsContent />
    </Suspense>
  );
}
