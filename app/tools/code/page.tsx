'use client';

import { getAllTools } from '@/app/lib/code-tools';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-4">💻 Code Tools</h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            A collection of essential tools for developers. Format, validate, convert, and
            generate code instantly.
          </p>
        </div>
      </div>

      {/* Tools Grid */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        {Object.entries(engineLabels).map(([engine, { title, color, description }]) => (
          <div key={engine} className="mb-16">
            {/* Section Header */}
            <div className="mb-8">
              <h2 className={`text-3xl font-bold bg-gradient-to-r ${color} bg-clip-text text-transparent mb-2`}>
                {title}
              </h2>
              <p className="text-gray-600">{description}</p>
            </div>

            {/* Tools Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {toolsByEngine[engine]?.map((tool) => (
                <Link
                  key={tool.id}
                  href={`/tools/code/${tool.id}`}
                  className="group relative bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 hover:border-blue-400"
                >
                  {/* Gradient overlay on hover */}
                  <div className={`absolute inset-0 bg-gradient-to-r ${color} opacity-0 group-hover:opacity-5 transition-opacity`} />

                  <div className="relative p-6">
                    {/* Icon and Title */}
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="text-3xl mb-2">{tool.icon}</div>
                        <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition">
                          {tool.title}
                        </h3>
                      </div>
                      <ArrowRight
                        className="text-gray-300 group-hover:text-blue-600 transition transform group-hover:translate-x-1"
                        size={20}
                      />
                    </div>

                    {/* Description */}
                    <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                      {tool.description}
                    </p>

                    {/* Options count badge */}
                    {tool.options.length > 0 && (
                      <div className="inline-block px-2 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full">
                        {tool.options.length} option{tool.options.length !== 1 ? 's' : ''}
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Stats Section */}
      <div className="bg-white border-t border-gray-200 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-600">{tools.length}</div>
              <p className="text-gray-600 text-sm mt-2">Tools Available</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600">
                {Object.keys(toolsByEngine).length}
              </div>
              <p className="text-gray-600 text-sm mt-2">Tool Categories</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600">100%</div>
              <p className="text-gray-600 text-sm mt-2">Free & Open</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-orange-600">⚡</div>
              <p className="text-gray-600 text-sm mt-2">Instant Results</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
