'use client';

import React from 'react';
import Link from 'next/link';
import { FileText, Image, Video, PenTool, File, ArrowRight, Database, Code2, Volume2 } from 'lucide-react';

export default function Home() {
  const categories = [
    {
      id: 'pdf',
      title: 'PDF Tools',
      subtitle: 'Solve Your PDF Problems',
      count: '47+ tools',
      description: 'PDF conversion, compression, editing',
      icon: FileText,
      color: 'from-purple-600 to-purple-700',
      link: '/tools/pdf',
      featured: 'PDF Creator'
    },
    {
      id: 'image',
      title: 'Image Tools',
      subtitle: 'Solve Your Image Problems',
      count: '30+ tools',
      description: 'Image conversion, editing, optimization',
      icon: Image,
      color: 'from-orange-600 to-orange-700',
      link: '/tools?category=Image',
      featured: 'Remove BG'
    },
    {
      id: 'video',
      title: 'Video Tools',
      subtitle: 'Solve Your Video Problems',
      count: '10+ tools',
      description: 'Video conversion, editing, enhancement',
      icon: Video,
      color: 'from-pink-600 to-pink-700',
      link: '/tools?category=video',
      featured: 'Mute Video'
    },
    {
      id: 'ai',
      title: 'AI Write',
      subtitle: 'Solve Your Text Problems',
      count: '50+ tools',
      description: 'AI-powered writing and text generation',
      icon: PenTool,
      color: 'from-blue-600 to-blue-700',
      link: '/tools/ai-write',
      featured: 'Paragraph Writer'
    },
    {
      id: 'data',
      title: 'Data Conversion',
      subtitle: 'Convert Your Data Files',
      count: '12 tools',
      description: 'CSV, Excel, JSON, XML conversions & splitting',
      icon: Database,
      color: 'from-cyan-600 to-cyan-700',
      link: '/tools/data',
      featured: 'CSV to Excel'
    },
    {
      id: 'code-minifier',
      title: 'Code Minifier',
      subtitle: 'Reduce File Size',
      count: '3 formats',
      description: 'Minify JavaScript, CSS, and HTML code',
      icon: Code2,
      color: 'from-gray-600 to-gray-700',
      link: '/tools/code-minifier',
      featured: 'JS Minifier'
    },
    {
      id: 'text-to-speech',
      title: 'Text to Speech',
      subtitle: 'Speak Your Text',
      count: 'Multi-lang',
      description: 'Convert text into natural-sounding audio',
      icon: Volume2,
      color: 'from-indigo-600 to-indigo-700',
      link: '/tools/text-to-speech',
      featured: 'Audio Converter'
    }
  ];

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Recent Tools */}
      <div className="bg-white border-b border-gray-200 py-4 px-4 md:px-8">
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          <span className="text-sm font-medium text-gray-700">Recent Tools:</span>
          <Link href="/tools/profile-photo-maker" className="px-4 py-2 rounded-full border-2 border-blue-500 text-blue-600 font-medium hover:bg-blue-50 transition-colors">
            Profile Photo Maker
          </Link>
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-white py-16 px-4 md:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-2">
            Free Tools to Make <span className="mx-3 bg-pink-600 text-white px-6 py-2 inline-block rounded">Your Life</span> Simple
          </h1>
          <p className="text-xl text-gray-600 mt-6 max-w-2xl mx-auto">
            We offer PDF, video, image, AI, code, and other online tools to make your life easier
          </p>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="py-16 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {categories.map((category) => {
              const Icon = category.icon;
              const bgGradient = category.color;
              return (
                <Link key={category.id} href={category.link} className="group">
                  <div className="h-full rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
                    {/* Category Header */}
                    <div className={`bg-gradient-to-r ${bgGradient} text-white p-8 pb-20 relative`}>
                      <div className="flex items-start justify-between mb-4">
                        <Icon className="w-12 h-12" />
                        <span className="bg-white bg-opacity-30 px-3 py-1 rounded-full text-sm font-medium">
                          {category.count}
                        </span>
                      </div>
                      <h3 className="text-2xl font-bold mb-1">{category.title}</h3>
                      <p className="text-sm text-white text-opacity-90">{category.subtitle}</p>
                    </div>

                    {/* Category Footer */}
                    <div className="bg-white p-6 pt-8 -mt-8 relative">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-gray-500 font-medium">Featured Tool:</p>
                          <p className="text-sm font-semibold text-gray-900">{category.featured}</p>
                        </div>
                        <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-gray-900 transition-colors" />
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 py-16 px-4 md:px-8">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Explore All Tools
          </h2>
          <p className="text-lg text-blue-100 mb-8">
            Discover hundreds of free tools to handle any task
          </p>
          <Link
            href="/tools"
            className="inline-block px-8 py-3 bg-white text-blue-600 font-bold rounded-full hover:bg-blue-50 transition-colors"
          >
            Browse All Tools
          </Link>
        </div>
      </div>
    </main>
  );
}
