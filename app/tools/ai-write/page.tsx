'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { aiWriteTools, type ToolCategory } from '@/app/lib/ai-tools';
import { ArrowRight, Sparkles } from 'lucide-react';

const categoryLabels: Record<ToolCategory, string> = {
  generate: '✨ Generate',
  rewrite: '✏️ Rewrite & Improve',
  summarize: '📝 Summarize',
  business: '💼 Business & Legal',
  social: '🌐 Social Media',
  utility: '🔧 Utilities',
};

const categoryColors: Record<ToolCategory, string> = {
  generate: 'from-purple-500 to-pink-500',
  rewrite: 'from-blue-500 to-cyan-500',
  summarize: 'from-orange-500 to-yellow-500',
  business: 'from-green-500 to-emerald-500',
  social: 'from-pink-500 to-rose-500',
  utility: 'from-gray-500 to-slate-500',
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
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="flex items-center gap-3 mb-4">
            <Sparkles className="w-8 h-8" />
            <span className="text-sm font-bold uppercase tracking-widest">AI Writing Tools</span>
          </div>
          <h1 className="text-5xl font-bold mb-4">
            Powerful AI Writing Assistant
          </h1>
          <p className="text-xl text-purple-100 max-w-2xl">
            Choose from our collection of AI-powered writing tools designed to help you create better content faster. Each tool is powered by advanced AI technology.
          </p>
        </div>
      </div>

      {/* Tools Grid */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        {Object.entries(categories).map(([category, tools]) => {
          if (Object.keys(tools).length === 0) return null;

          const categoryKey = category as ToolCategory;
          const bgGradient = categoryColors[categoryKey];

          return (
            <div key={category} className="mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                {categoryLabels[categoryKey]}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.entries(tools).map(([id, tool]) => (
                  <Link key={id} href={`/tools/ai-write/${id}`}>
                    <div className="h-full bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden group">
                      {/* Gradient Header */}
                      <div className={`h-2 bg-gradient-to-r ${bgGradient}`} />

                      {/* Card Content */}
                      <div className="p-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-purple-600 group-hover:to-pink-600 transition-all">
                          {tool.title}
                        </h3>

                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                          {tool.description}
                        </p>

                        <div className="flex items-center justify-between">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium text-white bg-gradient-to-r ${bgGradient}`}>
                            {categoryLabels[tool.category].split(' ')[1]}
                          </span>

                          <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all" />
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Create Better Content?
          </h2>
          <p className="text-lg text-purple-100 mb-8">
            Choose any tool above and start generating amazing content in seconds.
          </p>
          <p className="text-sm text-purple-200">
            💡 Tip: All tools use a shared AI engine, so you only need one API key to power all of them.
          </p>
        </div>
      </div>
    </main>
  );
}
