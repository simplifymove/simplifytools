'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search } from 'lucide-react';
import { getAllPdfTools } from '@/app/lib/pdf-tools';
import { ToolCard } from '@/app/components/ToolCard';

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
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 py-12 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-4">
            <Link href="/" className="text-blue-600 hover:text-blue-700 font-medium">
              ← Back Home
            </Link>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">PDF Tools</h1>
          <p className="text-lg text-gray-600">
            Powerful tools for PDF manipulation, conversion, and editing
          </p>
        </div>
      </div>

      {/* Search Section */}
      <div className="bg-white border-b border-gray-200 py-8 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <form
            onSubmit={(e) => e.preventDefault()}
            className="flex gap-2 flex-col md:flex-row"
          >
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Search PDF tools..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              type="submit"
              className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center gap-2"
            >
              <Search className="w-4 h-4" />
              Search
            </button>
          </form>

          {/* Category Filter */}
          <div className="mt-6">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-4 py-2 rounded-full font-medium transition-colors ${
                  selectedCategory === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
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
                    className={`px-4 py-2 rounded-full font-medium transition-colors ${
                      selectedCategory === category
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                    }`}
                  >
                    {category} ({count})
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Tools Grid */}
      <div className="py-12 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          {filteredTools.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-lg text-gray-500">
                {searchTerm
                  ? `No PDF tools found matching "${searchTerm}"`
                  : 'No PDF tools available'}
              </p>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  {selectedCategory === 'all'
                    ? 'All PDF Tools'
                    : `${selectedCategory} Tools`}{' '}
                  ({filteredTools.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {filteredTools.map((tool) => (
                    <ToolCard
                      key={tool.id}
                      icon={tool.icon}
                      title={tool.title}
                      description={tool.description}
                      category={tool.category}
                      href={`/tools/pdf/${tool.id}`}
                    />
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
