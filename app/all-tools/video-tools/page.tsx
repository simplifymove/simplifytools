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

export default function VideoToolsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Get all video tools
  const allVideoTools = useMemo(() => {
    return allTools.filter((tool) => tool.category === 'Video');
  }, []);

  // Get unique categories for video tools
  const categories = useMemo(() => {
    return Array.from(new Set(allVideoTools.map((tool) => tool.category)));
  }, [allVideoTools]);

  // Filter tools based on search and category
  const filteredTools = useMemo(() => {
    let results = allVideoTools;

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
  }, [searchTerm, selectedCategory, allVideoTools]);

  return (
    <>
      <HomeHeader />
      <main className="min-h-screen bg-slate-50 flex flex-col">
        <div className="flex-1">
          {/* Premium Header */}
          <div className="relative bg-gradient-to-r from-pink-500 via-pink-600 to-pink-700 py-16 px-4 md:px-8 overflow-hidden">
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
                <span className="text-white">Video Tools</span>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">Free Video Tools Online</h1>
                <p className="text-lg text-white/90 max-w-3xl">
                  Use our free video tools to convert, compress, trim, and edit videos instantly. Convert MP4, WebM, MKV, and more formats. No signup required, no watermarks, completely free.
                </p>
              </motion.div>
            </div>
          </div>

          {/* Search & Filter Section */}
          <div className="py-8 px-4 md:px-8">
            <div className="max-w-7xl mx-auto">
              <motion.div
                className="space-y-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                {/* Search Bar with Enhanced Component */}
                <div className="flex-1">
                  <SearchBox
                    placeholder="Search video tools..."
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
                        ? 'bg-gradient-to-r from-pink-600 to-pink-700 text-white shadow-lg shadow-pink-600/30'
                        : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-pink-300'
                    }`}
                  >
                    All ({allVideoTools.length})
                  </button>
                  {categories.map((category) => {
                    const count = allVideoTools.filter((t) => t.category === category).length;
                    return (
                      <button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className={`px-4 py-2 rounded-full font-medium transition-all ${
                          selectedCategory === category
                            ? 'bg-gradient-to-r from-pink-600 to-pink-700 text-white shadow-lg shadow-pink-600/30'
                            : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-pink-300'
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
                        ? `No video tools found matching "${searchTerm}"`
                        : 'No video tools available'}
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
                            className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100"
                            transition={{ duration: 0.3 }}
                          />

                          <div className="relative z-10">
                            {/* Icon */}
                            <motion.div
                              className="w-12 h-12 bg-gradient-to-br from-pink-100 to-pink-200 rounded-xl flex items-center justify-center group-hover:from-pink-200 group-hover:to-pink-300 transition mb-4"
                              whileHover={{ scale: 1.2, rotate: 12 }}
                            >
                              {tool.icon && <tool.icon className="w-6 h-6 text-pink-600" />}
                            </motion.div>

                            {/* Content */}
                            <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-pink-600 transition">{tool.title}</h3>
                            <p className="text-sm text-gray-600 line-clamp-2 mb-4">{tool.description}</p>
                            <motion.div
                              className="flex items-center gap-1 text-pink-600 font-medium text-sm"
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
          <div className="py-12 px-4 md:px-8 bg-white border-b border-gray-200">
            <div className="max-w-4xl mx-auto space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Choose a Video Workflow by Output</h2>
                
                <p className="text-gray-700 leading-relaxed mb-6">
                  Convert when a player or platform needs another container, compress when file size matters, trim when only a time range is needed, and extract audio when the picture track is unnecessary. Re-encoding can change quality, compatibility, and processing time.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                  <div className="bg-gradient-to-br from-pink-50 to-pink-100 p-6 rounded-lg border border-pink-200">
                    <h3 className="font-bold text-gray-900 mb-3 text-lg">✓ Completely Free</h3>
                    <p className="text-gray-700 text-sm">The category separates conversion, compression, trimming, extraction, and related workflows by intended result.</p>
                  </div>
                  <div className="bg-gradient-to-br from-pink-50 to-pink-100 p-6 rounded-lg border border-pink-200">
                    <h3 className="font-bold text-gray-900 mb-3 text-lg">✓ No Installation</h3>
                    <p className="text-gray-700 text-sm">Works directly in your browser. Use video tools on Windows, Mac, iPhone, Android, and any device with internet. No software downloads or complex setup.</p>
                  </div>
                  <div className="bg-gradient-to-br from-pink-50 to-pink-100 p-6 rounded-lg border border-pink-200">
                    <h3 className="font-bold text-gray-900 mb-3 text-lg">✓ Fast Processing</h3>
                    <p className="text-gray-700 text-sm">Video is server-processed. Upload and encoding time depend on duration, resolution, codec, operation, and network speed.</p>
                  </div>
                  <div className="bg-gradient-to-br from-pink-50 to-pink-100 p-6 rounded-lg border border-pink-200">
                    <h3 className="font-bold text-gray-900 mb-3 text-lg">✓ Secure & Private</h3>
                    <p className="text-gray-700 text-sm">Uploads use HTTPS and are retained temporarily for processing and download. Media cleanup is scheduled after approximately one hour.</p>
                  </div>
                </div>

                {/* Popular Video Tools - Internal Linking Section */}
                <div className="mb-12 bg-gray-50 p-8 rounded-lg border border-gray-200">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Popular Video Tools</h2>
                  <p className="text-gray-700 mb-6">Quick access to our most-used video conversion and editing tools:</p>
                  <div className="space-y-3">
                    <Link href="/all-tools/video/video-to-gif" className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-300 hover:border-pink-500 hover:bg-pink-50 transition">
                      <span className="text-pink-600 font-semibold">→</span>
                      <span className="text-gray-900 font-medium hover:text-pink-600">Video to GIF Converter</span>
                    </Link>
                    <Link href="/all-tools/video/compress-video" className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-300 hover:border-pink-500 hover:bg-pink-50 transition">
                      <span className="text-pink-600 font-semibold">→</span>
                      <span className="text-gray-900 font-medium hover:text-pink-600">Video Compressor - Reduce file size</span>
                    </Link>
                    <Link href="/all-tools/video/trim-video" className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-300 hover:border-pink-500 hover:bg-pink-50 transition">
                      <span className="text-pink-600 font-semibold">→</span>
                      <span className="text-gray-900 font-medium hover:text-pink-600">Video Trimmer - Cut unwanted sections</span>
                    </Link>
                    <Link href="/all-tools/video/mp4-to-mp3" className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-300 hover:border-pink-500 hover:bg-pink-50 transition">
                      <span className="text-pink-600 font-semibold">→</span>
                      <span className="text-gray-900 font-medium hover:text-pink-600">MP4 to MP3 - Extract audio from video</span>
                    </Link>
                  </div>
                </div>

                <h2 className="text-2xl font-bold text-gray-900 mb-4">How to Use Free Video Tools</h2>
                <p className="text-gray-700 leading-relaxed mb-6">
                  Using SimplifyConvert video tools is simple and straightforward. Select the tool you need from our 58 options, upload your video file, configure options if needed, and click process. The tool handles complex video operations in seconds while maintaining quality. Download your converted or edited video instantly. No signup required, no registration needed, no learning curve.
                </p>
              </motion.div>
            </div>
          </div>

          {/* FAQ Section */}
          <FAQ
            items={[
              {
                name: 'Are all video tools really free?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'The listed video utilities do not require Premium AI Studio credits. File-size, duration, format, and rate limits can vary by tool.'
                }
              },
              {
                name: 'What video formats do you support?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'We support most common video formats including MP4, WebM, MKV, AVI, MOV, FLV, and more. Our video tools can convert between any formats while maintaining quality and preserving video properties.'
                }
              },
              {
                name: 'Is my video data safe?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Videos are uploaded over HTTPS for server processing and temporary download. Media cleanup is scheduled after approximately one hour; do not submit content you are not authorized to process.'
                }
              },
              {
                name: 'Can I use video tools on mobile?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Yes. All video tools work on iOS, Android, tablets, and mobile browsers. No app installation required. Simply visit SimplifyConvert from your mobile device and start using any tool.'
                }
              },
              {
                name: 'How large can video files be?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'The media API currently validates uploads up to 500 MB, and individual tools may use lower limits. Larger, longer, or high-resolution files take more time and can fail if resources are unavailable.'
                }
              },
              {
                name: 'Which video tools are most popular?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Video compression, MP4 conversion, video trimming, and video to GIF conversion are our most popular tools. All are free, fast, and work without signup or installation. Perfect for social media, web design, and general video editing.'
                }
              }
            ]}
            colorClass="pink"
            bgColor="white"
          />

          {/* Breadcrumb + Organization Schema */}
          <script type="application/ld+json">
            {JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'BreadcrumbList',
              itemListElement: [
                {
                  '@type': 'ListItem',
                  position: 1,
                  name: 'Home',
                  item: 'https://simplifyconvert.com'
                },
                {
                  '@type': 'ListItem',
                  position: 2,
                  name: 'All Tools',
                  item: 'https://simplifyconvert.com/all-tools'
                },
                {
                  '@type': 'ListItem',
                  position: 3,
                  name: 'Video Tools',
                  item: 'https://simplifyconvert.com/all-tools/video-tools'
                }
              ]
            })}
          </script>
        </div>
      </main>
      <Footer />
    </>
  );
}






