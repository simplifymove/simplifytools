'use client';

import { useRouter } from 'next/navigation';
import { dataTools } from '@/app/lib/data-tools';
import { ArrowRight } from 'lucide-react';

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-12 px-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold mb-4">Data Conversion Tools</h1>
          <p className="text-blue-100 text-lg">
            Convert between different file formats effortlessly
          </p>
        </div>
      </div>

      {/* Tools Grid */}
      <div className="max-w-6xl mx-auto px-8 py-12">
        {Object.entries(toolsByCategory).map(([category, tools]) => (
          <div key={category} className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 capitalize">
              {category === 'conversion' ? 'File Conversions' : 'File Splitting'}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tools.map((tool) => (
                <div
                  key={tool.id}
                  className="bg-white rounded-lg shadow-md hover:shadow-lg transition duration-300 p-6 cursor-pointer group"
                  onClick={() => router.push(`/tools/data/${tool.id}`)}
                >
                  {/* Icon */}
                  <div className="mb-4 text-4xl">📄</div>

                  {/* Title */}
                  <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition">
                    {tool.title}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {tool.description}
                  </p>

                  {/* Input/Output Formats */}
                  <div className="mb-4 space-y-1 text-xs">
                    <div className="flex items-center gap-2 text-gray-700">
                      <span className="font-medium">Input:</span>
                      <span className="text-blue-600 font-mono">
                        {tool.accepts.join(', ')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700">
                      <span className="font-medium">Output:</span>
                      <span className="text-green-600 font-mono">
                        .{tool.output}
                      </span>
                    </div>
                  </div>

                  {/* Engine Info */}
                  <div className="mb-4 inline-block px-3 py-1 bg-blue-50 text-blue-700 text-xs rounded-full">
                    {tool.engine}
                  </div>

                  {/* CTA */}
                  <div className="flex items-center gap-2 text-blue-600 font-medium text-sm group-hover:gap-3 transition">
                    Use Tool
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Feature Highlight */}
      <div className="max-w-6xl mx-auto px-8 py-8 mb-12">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Why Use Our Conversion Tools?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="text-3xl mb-3">⚡</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Fast Processing
              </h3>
              <p className="text-gray-600">
                Optimized conversion engines handle files up to 100MB
              </p>
            </div>
            <div>
              <div className="text-3xl mb-3">🔒</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Secure
              </h3>
              <p className="text-gray-600">
                Files are processed securely and deleted after conversion
              </p>
            </div>
            <div>
              <div className="text-3xl mb-3">📊</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Multiple Formats
              </h3>
              <p className="text-gray-600">
                Support for CSV, Excel, JSON, XML, PDF and more
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
