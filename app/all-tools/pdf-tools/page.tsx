'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { getAllPdfTools } from '@/app/lib/pdf-tools';
import { ToolCard } from '@/app/components/ToolCard';
import { SearchBox } from '@/app/components/SearchBox';
import { FAQ } from '@/app/components/FAQ';
import { motion } from 'framer-motion';
import { HomeHeader } from '@/app/components/HomeHeader';
import { Footer } from '@/app/components/Footer';

export default function PdfToolsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Remove global FAQPage schema on this page - keep only PDF-specific FAQ schema
  useEffect(() => {
    const scripts = document.querySelectorAll('script[type="application/ld+json"]');
    scripts.forEach((script) => {
      try {
        const schema = JSON.parse(script.innerHTML);
        // Remove the global FAQ schema (contains "200+ free online tools")
        if (
          schema['@type'] === 'FAQPage' &&
          schema.mainEntity &&
          schema.mainEntity[0]?.name?.includes('SimplifyConvert tools')
        ) {
          script.remove();
        }
      } catch (e) {
        // Ignore parsing errors
      }
    });
  }, []);

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

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Are all PDF tools really free?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes! All free PDF tools at SimplifyConvert are completely free to use. No signup required, no hidden fees, no premium tiers. Use any PDF tool unlimited times without payment.',
        },
      },
      {
        '@type': 'Question',
        name: 'Do I need to install software to use PDF tools?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'No. All PDF tools work directly in your browser on Windows, Mac, iOS, and Android. Just upload your PDF, click convert, and download the result. No installation required.',
        },
      },
      {
        '@type': 'Question',
        name: 'Is my data safe when using SimplifyConvert PDF tools?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. Files are processed securely and automatically deleted after processing. We do not store your files. We use HTTPS encryption for all transfers.',
        },
      },
      {
        '@type': 'Question',
        name: 'Which PDF tools are most popular?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Merge PDF, PDF to text extraction, split PDF, and compress PDF are among our most popular tools. All are free, fast, and work without signup or installation.',
        },
      },
      {
        '@type': 'Question',
        name: 'Can I use PDF tools on mobile devices?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Absolutely! Our PDF tools are fully responsive and work perfectly on smartphones and tablets. Use any tool on iPhone, Android, iPad, or tablet with the same features and speed as desktop.',
        },
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      {/* Breadcrumb Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              {
                '@type': 'ListItem',
                position: 1,
                name: 'Home',
                item: 'https://simplifyconvert.com',
              },
              {
                '@type': 'ListItem',
                position: 2,
                name: 'All Tools',
                item: 'https://simplifyconvert.com/all-tools',
              },
              {
                '@type': 'ListItem',
                position: 3,
                name: 'PDF Tools',
                item: 'https://simplifyconvert.com/all-tools/pdf-tools',
              },
            ],
          }),
        }}
      />
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
                <Link href="/all-tools" className="hover:text-white transition">All Tools</Link>
                <ChevronRight size={16} />
                <span>PDF Tools</span>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">Free PDF Tools Online - Merge, Split & Compress</h1>
                <p className="text-lg text-white/90 max-w-2xl mb-4">
                  Professional free PDF tools for merging, splitting, compressing, converting, and editing PDF files instantly. No signup or installation required.
                </p>
                {/* Keyword-rich intro paragraph */}
                <p className="text-base text-white/85 max-w-3xl leading-relaxed">
                  Use our free online PDF tools to merge, split, compress, and convert PDF files instantly. No signup required, secure processing, and fast performance across all devices.
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
                    placeholder="Search PDF tools..."
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
                      <Link href={`/all-tools/pdf/${tool.id}`}>
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
                              title={tool.title}
                              role="img"
                              aria-label={`${tool.title} tool icon`}
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
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Why Use Our Free PDF Tools?</h2>
                
                <p className="text-gray-700 leading-relaxed mb-6">
                  SimplifyConvert offers a complete suite of free PDF tools to handle all your document needs. Whether you need to merge multiple PDFs into one document, split a large PDF into individual pages, compress files for email sharing, or convert PDFs to other formats, our free PDF tools deliver professional results without any cost, signup, or software installation.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg border border-purple-200">
                    <h3 className="font-bold text-gray-900 mb-3 text-lg">✓ Completely Free</h3>
                    <p className="text-gray-700 text-sm">All 55+ PDF tools are permanently free. No hidden charges, premium tiers, or surprise fees. Use unlimited PDF conversions without payment or credit card.</p>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg border border-purple-200">
                    <h3 className="font-bold text-gray-900 mb-3 text-lg">✓ No Installation</h3>
                    <p className="text-gray-700 text-sm">Works directly in your browser. Use PDF tools on Windows, Mac, iPhone, Android, and any device with internet. No software downloads or complex setup.</p>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg border border-purple-200">
                    <h3 className="font-bold text-gray-900 mb-3 text-lg">✓ Fast Processing</h3>
                    <p className="text-gray-700 text-sm">Convert, merge, split, and compress PDFs in seconds. Advanced processing algorithms deliver fast results without lag or delays.</p>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg border border-purple-200">
                    <h3 className="font-bold text-gray-900 mb-3 text-lg">✓ Secure & Private</h3>
                    <p className="text-gray-700 text-sm">Files are processed securely and automatically deleted after processing. HTTPS encryption protects all transfers. We do not store your files.</p>
                  </div>
                </div>

                {/* Popular PDF Tools - Internal Linking Section */}
                <div className="mb-12 bg-gray-50 p-8 rounded-lg border border-gray-200">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Popular PDF Tools</h2>
                  <p className="text-gray-700 mb-6">Quick access to our most-used PDF conversion and editing tools:</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Link href="/all-tools/pdf/merge-pdf" className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-300 hover:border-purple-500 hover:bg-purple-50 transition">
                      <span className="text-purple-600 font-semibold">→</span>
                      <span className="text-gray-900 font-medium hover:text-purple-600">Merge PDF Files</span>
                    </Link>
                    <Link href="/all-tools/pdf/compress-pdf" className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-300 hover:border-purple-500 hover:bg-purple-50 transition">
                      <span className="text-purple-600 font-semibold">→</span>
                      <span className="text-gray-900 font-medium hover:text-purple-600">Compress PDF</span>
                    </Link>
                    <Link href="/all-tools/pdf/split-pdf" className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-300 hover:border-purple-500 hover:bg-purple-50 transition">
                      <span className="text-purple-600 font-semibold">→</span>
                      <span className="text-gray-900 font-medium hover:text-purple-600">Split PDF Pages</span>
                    </Link>
                    <Link href="/all-tools/pdf/pdf-to-word" className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-300 hover:border-purple-500 hover:bg-purple-50 transition">
                      <span className="text-purple-600 font-semibold">→</span>
                      <span className="text-gray-900 font-medium hover:text-purple-600">PDF to Word Converter</span>
                    </Link>
                  </div>
                </div>

                <h2 className="text-2xl font-bold text-gray-900 mb-4">How to Use Free PDF Tools</h2>
                <p className="text-gray-700 leading-relaxed">
                  Using SimplifyConvert PDF tools is simple and straightforward. Select the tool you need, upload your PDF file, configure options if needed, and click process. The tool handles complex PDF operations in seconds while maintaining document quality. Download your converted or modified PDF instantly. No signup required, no registration needed, no learning curve.
                </p>
              </motion.div>
            </div>
          </div>

          <FAQ
            items={[
              {
                name: 'Are all PDF tools really free?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Yes! All free PDF tools at SimplifyConvert are completely free to use. No signup required, no hidden fees, no premium tiers. Use any PDF tool unlimited times without payment.'
                }
              },
              {
                name: 'Do I need to install software to use PDF tools?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'No. All PDF tools work directly in your browser on Windows, Mac, iOS, and Android. Just upload your PDF, click convert, and download the result. No installation required.'
                }
              },
              {
                name: 'Is my data safe when using SimplifyConvert PDF tools?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Yes. Files are processed securely and automatically deleted after processing. We do not store your files. We use HTTPS encryption for all transfers.'
                }
              },
              {
                name: 'Which PDF tools are most popular?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Merge PDF, PDF to text extraction, split PDF, and compress PDF are among our most popular tools. All are free, fast, and work without signup or installation.'
                }
              },
              {
                name: 'Can I use PDF tools on mobile devices?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Absolutely! Our PDF tools are fully responsive and work perfectly on smartphones and tablets. Use any tool on iPhone, Android, iPad, or tablet with the same features and speed as desktop.'
                }
              }
            ]}
            colorClass="purple"
            bgColor="white"
          />
        </div>
      </main>
      <Footer />
    </>
  );
}







