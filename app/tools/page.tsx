'use client';

import React, { useState, useMemo, Suspense } from 'react';
import { Search, Clock } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ToolCard } from '@/app/components/ToolCard';
import { allTools } from '@/app/data/tools';

function ToolsContent() {
  const [searchTerm, setSearchTerm] = useState('');
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get('category');

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

    return results;
  }, [searchTerm, categoryParam, isComingSoon]);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  };

  const getToolHref = (tool: any) => {
    return tool.route || '#';
  };

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
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
            {categoryParam 
              ? `${categoryParam.charAt(0).toUpperCase() + categoryParam.slice(1)} Tools`
              : 'All Tools'
            }
          </h1>
          <p className="text-lg text-gray-600">
            {categoryParam 
              ? `Browse our collection of ${categoryParam} tools`
              : 'Browse all available tools'
            }
          </p>
        </div>
      </div>

      {/* Search Section */}
      <div className="bg-white border-b border-gray-200 py-8 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder={categoryParam ? `Search ${categoryParam} tools...` : "Search tools..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              type="submit"
              className="px-8 py-3 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2"
            >
              <Search className="w-4 h-4" />
              Search
            </button>
          </form>
        </div>
      </div>

      {/* Tools Grid */}
      <div className="py-12 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          {isDataTools ? (
            <div className="flex flex-col items-center justify-center py-32">
              <div className="bg-white rounded-2xl shadow-lg p-12 text-center max-w-md">
                <div className="flex justify-center mb-6">
                  <span className="text-6xl">📊</span>
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Data Conversion Tools</h2>
                <p className="text-gray-600 text-lg mb-8">
                  Redirecting to our data conversion tools...
                </p>
                <Link
                  href="/tools/data"
                  className="inline-block px-8 py-3 bg-blue-600 text-white font-bold rounded-full hover:bg-blue-700 transition-colors"
                >
                  Go to Data Tools
                </Link>
              </div>
            </div>
          ) : isPdfTools ? (
            <div className="flex flex-col items-center justify-center py-32">
              <div className="bg-white rounded-2xl shadow-lg p-12 text-center max-w-md">
                <div className="flex justify-center mb-6">
                  <span className="text-6xl">📄</span>
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">PDF Tools</h2>
                <p className="text-gray-600 text-lg mb-8">
                  Redirecting to our PDF tools...
                </p>
                <Link
                  href="/tools/pdf"
                  className="inline-block px-8 py-3 bg-blue-600 text-white font-bold rounded-full hover:bg-blue-700 transition-colors"
                >
                  Go to PDF Tools
                </Link>
              </div>
            </div>
          ) : isComingSoon ? (
            <div className="flex flex-col items-center justify-center py-32">
              <div className="bg-white rounded-2xl shadow-lg p-12 text-center max-w-md">
                <div className="flex justify-center mb-6">
                  <Clock className="w-16 h-16 text-blue-600" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Coming Soon</h2>
                <p className="text-gray-600 text-lg mb-8">
                  {categoryParam.charAt(0).toUpperCase() + categoryParam.slice(1)} tools are being developed and will be available soon.
                </p>
                <Link
                  href="/"
                  className="inline-block px-8 py-3 bg-blue-600 text-white font-bold rounded-full hover:bg-blue-700 transition-colors"
                >
                  Back to Home
                </Link>
              </div>
            </div>
          ) : filteredTools.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-lg text-gray-500">
                No tools found matching "{searchTerm}"
              </p>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  {categoryParam 
                    ? `${categoryParam.charAt(0).toUpperCase() + categoryParam.slice(1)} Tools`
                    : 'All Tools'
                  } ({filteredTools.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {filteredTools.map((tool) => (
                    <ToolCard
                      key={tool.id}
                      icon={tool.icon}
                      title={tool.title}
                      description={tool.description}
                      category={tool.category}
                      href={getToolHref(tool)}
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

export default function ToolsPage() {
  return (
    <Suspense>
      <ToolsContent />
    </Suspense>
  );
}
