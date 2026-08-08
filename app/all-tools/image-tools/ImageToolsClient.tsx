'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { allTools } from '@/app/data/tools';
import { ToolCard } from '@/app/components/ToolCard';
import { SearchBox } from '@/app/components/SearchBox';
import { FAQ } from '@/app/components/FAQ';
import { motion } from 'framer-motion';
import { HomeHeader } from '@/app/components/HomeHeader';
import { Footer } from '@/app/components/Footer';

export default function ImageToolsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Get all image tools
  const allImageTools = useMemo(() => {
    return allTools.filter((tool) => tool.category === 'Image');
  }, []);

  // Get unique categories for image tools
  const categories = useMemo(() => {
    return Array.from(new Set(allImageTools.map((tool) => tool.category)));
  }, [allImageTools]);

  // Filter tools based on search and category
  const filteredTools = useMemo(() => {
    let results = allImageTools;

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
  }, [searchTerm, selectedCategory, allImageTools]);

  return (
    <>
      <HomeHeader />
      <main className="min-h-screen bg-slate-50 flex flex-col">
        <div className="flex-1">
          {/* Premium Header */}
          <div className="relative bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700 py-16 px-4 md:px-8 overflow-hidden">
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
                <Link href="/all-tools" className="hover:text-white transition">All Tools</Link>
                <ChevronRight size={16} />
                <span>Image Tools</span>
              </div>

              <motion.div
                initial={false}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Free Image Tools Online</h1>
                <p className="text-lg text-white/90 max-w-3xl mb-4">
                  Use our free image tools to compress, convert, resize, and enhance images instantly. Supports JPG, PNG, WebP, and more. No signup required, no watermarks, completely free.
                </p>
                <p className="text-base text-white/80 max-w-3xl">
                  Professional-grade image processing tools for everyone. Fast, secure, and easy to use on all devices.
                </p>
              </motion.div>
            </div>
          </div>

          {/* Search & Filter Section */}
          <div className="py-8 px-4 md:px-8">
            <div className="max-w-7xl mx-auto">
              <motion.div
                className="space-y-6"
                initial={false}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                {/* Search Bar with Enhanced Component */}
                <div className="flex-1">
                  <SearchBox
                    placeholder="Search image tools..."
                    onSearch={(query) => setSearchTerm(query)}
                    variant="header"
                    showSuggestions={true}
                  />
                </div>

                {/* Category Filters */}
                <div className="flex flex-wrap gap-3 items-center">
                  <span className="text-sm font-semibold text-gray-700">Filter by:</span>
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className={`px-4 py-2 rounded-full font-medium transition-all ${
                      selectedCategory === 'all'
                        ? 'bg-gradient-to-r from-orange-600 to-orange-700 text-white shadow-lg shadow-orange-600/30'
                        : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-orange-300'
                    }`}
                  >
                    All ({allImageTools.length})
                  </button>
                  {categories.map((category) => {
                    const count = allImageTools.filter((t) => t.category === category).length;
                    return (
                      <button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className={`px-4 py-2 rounded-full font-medium transition-all ${
                          selectedCategory === category
                            ? 'bg-gradient-to-r from-orange-600 to-orange-700 text-white shadow-lg shadow-orange-600/30'
                            : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-orange-300'
                        }`}
                      >
                        {category} ({count})
                      </button>
                    );
                  })}
                </div>
              </motion.div>
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
                        ? `No image tools found matching "${searchTerm}"`
                        : 'No image tools available'}
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
                      <Link href={tool.route || '#'}>
                        <motion.div
                          className="h-full rounded-2xl bg-white border-2 border-gray-200 hover:border-gray-300 p-6 hover:shadow-xl transition-all group relative overflow-hidden"
                          whileHover={{ y: -8 }}
                          transition={{ duration: 0.3 }}
                        >
                          {/* Hover gradient background */}
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-orange-500/5 opacity-0 group-hover:opacity-100"
                            transition={{ duration: 0.3 }}
                          />

                          <div className="relative z-10">
                            {/* Icon */}
                            <motion.div
                              className="w-12 h-12 bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl flex items-center justify-center group-hover:from-orange-200 group-hover:to-orange-300 transition mb-4"
                              whileHover={{ scale: 1.2, rotate: 12 }}
                            >
                              {tool.icon && <tool.icon className="w-6 h-6 text-orange-600" />}
                            </motion.div>

                            {/* Content */}
                            <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-orange-600 transition">{tool.title}</h3>
                            <p className="text-sm text-gray-600 line-clamp-2 mb-4">{tool.description}</p>
                            <motion.div
                              className="flex items-center gap-1 text-orange-600 font-medium text-sm"
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
          </div>

          {/* SEO Content Section */}
          <div className="py-16 px-4 md:px-8 bg-white border-t border-gray-200">
            <div className="max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="space-y-8"
              >
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Choose the Image Operation That Matches the Goal</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h3 className="font-semibold text-gray-900 text-lg">⚡ Lightning Fast Processing</h3>
                    <p className="text-gray-700">Resize changes pixel dimensions, compression targets file size, and conversion changes the format. Each choice affects quality differently.</p>
                  </div>
                  <div className="space-y-3">
                    <h3 className="font-semibold text-gray-900 text-lg">🔒 100% Secure & Private</h3>
                    <p className="text-gray-700">Some basic image operations use browser APIs, while AI-assisted and background workflows can upload images for server processing. Check the individual tool before submitting sensitive material.</p>
                  </div>
                  <div className="space-y-3">
                    <h3 className="font-semibold text-gray-900 text-lg">📱 Works on All Devices</h3>
                    <p className="text-gray-700">Use image tools on desktop, tablet, or mobile. No app installation needed. Works on Windows, Mac, iOS, and Android.</p>
                  </div>
                  <div className="space-y-3">
                    <h3 className="font-semibold text-gray-900 text-lg">🎨 Professional Results</h3>
                    <p className="text-gray-700">Preview the result at full size and confirm transparency, color, dimensions, and compression artifacts before publishing it.</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Popular Image Tools Section */}
          <div className="py-16 px-4 md:px-8 bg-gray-50 border-t border-gray-200">
            <div className="max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Popular Image Tools</h2>
                <p className="text-gray-700 mb-6">Start with these common resize, compression, conversion, and cropping workflows:</p>
                <div className="space-y-3">
                  <Link href="/all-tools/compress-image" className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-300 hover:border-orange-500 hover:bg-orange-50 transition">
                    <span className="text-orange-600 font-semibold">→</span>
                    <span className="text-gray-900 font-medium hover:text-orange-600">Image Compressor - Reduce file size</span>
                  </Link>
                  <Link href="/all-tools/resize-image" className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-300 hover:border-orange-500 hover:bg-orange-50 transition">
                    <span className="text-orange-600 font-semibold">→</span>
                    <span className="text-gray-900 font-medium hover:text-orange-600">Image Resizer - Change dimensions</span>
                  </Link>
                  <Link href="/all-tools/png-to-jpg" className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-300 hover:border-orange-500 hover:bg-orange-50 transition">
                    <span className="text-orange-600 font-semibold">→</span>
                    <span className="text-gray-900 font-medium hover:text-orange-600">PNG to JPG Converter</span>
                  </Link>
                  <Link href="/all-tools/crop-image" className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-300 hover:border-orange-500 hover:bg-orange-50 transition">
                    <span className="text-orange-600 font-semibold">→</span>
                    <span className="text-gray-900 font-medium hover:text-orange-600">Image Cropper - Trim & compose</span>
                  </Link>
                </div>
              </motion.div>
            </div>
          </div>

          {/* How to Use Section */}
          <div className="py-16 px-4 md:px-8 bg-white border-t border-gray-200">
            <div className="max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                <h2 className="text-3xl font-bold text-gray-900 mb-6">How to Use the Image Tools</h2>
                <p className="text-gray-700 leading-relaxed mb-6">
                  Choose the operation first, upload a supported image, and set dimensions, format, quality, or other available options. Download the result and compare it with the original at full size. Keep the original until you have checked sharpness, transparency, color, orientation, and file size.
                </p>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center font-bold">1</div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Upload Your Image</h3>
                      <p className="text-gray-700">Click on the tool and upload your image file. Supports JPG, PNG, WebP, BMP, GIF, and more.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center font-bold">2</div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Configure Settings (Optional)</h3>
                      <p className="text-gray-700">Adjust quality, compression level, dimensions, or other options based on your needs.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center font-bold">3</div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Process & Download</h3>
                      <p className="text-gray-700">Process the image, download the result, and compare it with the original before discarding your source file.</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          <FAQ
            items={[
              {
                name: 'Are all image tools really free?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'The image utilities are available without Premium AI Studio credits. Individual workflows may still impose file-size or rate limits.'
                }
              },
              {
                name: 'What image formats do you support?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'We support most common image formats including JPG, PNG, WebP, BMP, GIF, TIFF, and more. Our image converter tools can transform between any of these formats while maintaining quality.'
                }
              },
              {
                name: 'Is my image data safe?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Processing varies by tool: some basic operations use browser APIs, while server-assisted and AI workflows upload the image over HTTPS. Review the individual tool and Privacy Policy before submitting sensitive images.'
                }
              },
              {
                name: 'Can I use image tools on mobile?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Yes. All image tools work on iOS, Android, tablets, and mobile browsers. No app installation required. Simply visit SimplifyConvert from your mobile device and start using any tool.'
                }
              },
              {
                name: 'How many images can I process?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Limits vary by operation, file size, and current service capacity. The individual tool displays applicable validation or error messages.'
                }
              },
              {
                name: 'Which image tools are most popular?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Image compression, resizing, PNG to JPG conversion, and image cropping are our most popular tools. All are free, fast, and work without signup or installation. Perfect for social media, web design, and general photo editing.'
                }
              }
            ]}
            colorClass="orange"
            bgColor="gray"
          />
        </div>
      </main>
      <Footer />
    </>
  );
}


