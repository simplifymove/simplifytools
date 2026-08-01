'use client';

import { dataTools } from '@/app/lib/data-tools';
import { ArrowRight, ChevronRight, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { HomeHeader } from '@/app/components/HomeHeader';
import { Footer } from '@/app/components/Footer';
import { FAQ } from '@/app/components/FAQ';

export default function DataToolsPage() {
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
    <>
      <HomeHeader />
      <main className="min-h-screen bg-slate-50 flex flex-col">
        <div className="flex-1">
      {/* Premium Header */}
      <div className="relative bg-gradient-to-r from-teal-600 via-emerald-600 to-green-600 py-16 overflow-hidden">
        {/* Animated background shapes */}
        <motion.div
          className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full mix-blend-multiply filter blur-3xl"
          animate={{ x: [0, 30, -20, 0], y: [0, -30, 20, 0] }}
          transition={{ duration: 10, repeat: Infinity }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-white/80 text-sm mb-6">
            <Link href="/" className="hover:text-white transition">Home</Link>
            <ChevronRight size={16} />            <Link href="/all-tools" className="hover:text-white transition">All Tools</Link>
            <ChevronRight size={16} />            <span>Data Tools</span>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">Free Data Tools for CSV, JSON, XML & Excel</h1>
            <p className="text-lg text-white/90 max-w-2xl">
              Convert and transform CSV, JSON, XML, Excel, and other data formats securely online.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Tools Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {Object.entries(toolsByCategory).map(([category, tools], catIdx) => (
          <motion.div 
            key={category} 
            className="mb-14"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: catIdx * 0.1 }}
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-8 capitalize">
              {category === 'conversion' ? '🔄 File Conversions' : '✂️ File Splitting'}
            </h2>

            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ staggerChildren: 0.05, delayChildren: 0.2 }}
            >
              {tools.map((tool) => (
                <motion.div
                  key={tool.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <Link href={`/all-tools/data/${tool.id}`}>
                    <motion.div
                      className="h-full bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all p-6 group border-2 border-gray-100 hover:border-gray-200 cursor-pointer overflow-hidden"
                    >
                    {/* Hover gradient */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-br from-teal-500/5 to-green-500/5 opacity-0 group-hover:opacity-100"
                      transition={{ duration: 0.3 }}
                    />

                    <div className="relative z-10">
                      {/* Icon */}
                      <div className="mb-4 text-4xl">📄</div>

                      {/* Title */}
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-teal-600 transition line-clamp-2">
                        {tool.title}
                      </h3>

                      {/* Description */}
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {tool.description}
                      </p>

                      {/* Input/Output Formats */}
                      <div className="mb-4 space-y-2 text-xs bg-gray-50 p-3 rounded-lg">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-700">Input:</span>
                          <span className="text-teal-600 font-mono font-medium">{tool.accepts.join(', ')}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-700">Output:</span>
                          <span className="text-green-600 font-mono font-medium">.{tool.output}</span>
                        </div>
                      </div>

                      {/* Engine Badge */}
                      <div className="mb-4 inline-block px-3 py-1 bg-gradient-to-r from-teal-100 to-green-100 text-teal-700 text-xs font-bold rounded-full">
                        {tool.engine}
                      </div>

                      {/* CTA */}
                      <div
                        className="flex items-center gap-2 text-teal-600 font-medium text-sm"
                      >
                        Use Tool
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </div>
                    </motion.div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        ))}
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
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Move Data Between Common Formats</h2>
            
            <p className="text-gray-700 leading-relaxed mb-6">
              Use a format-pair tool such as <Link href="/all-tools/data/csv-to-json" className="text-teal-600 font-medium hover:underline">CSV to JSON</Link>, <Link href="/all-tools/data/excel-to-xml" className="text-teal-600 font-medium hover:underline">Excel to XML</Link>, or <Link href="/all-tools/data/json-to-xml" className="text-teal-600 font-medium hover:underline">JSON to XML</Link>. Tabular and nested formats represent data differently, so inspect headers, types, empty values, and nesting in the result.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
              <div className="bg-gradient-to-br from-teal-50 to-green-100 p-6 rounded-lg border border-teal-200">
                <h3 className="font-bold text-gray-900 mb-3 text-lg">✓ Completely Free</h3>
                <p className="text-gray-700 text-sm">Choose a specific source-and-target pair so parsing rules match the formats you are working with.</p>
              </div>
              <div className="bg-gradient-to-br from-teal-50 to-green-100 p-6 rounded-lg border border-teal-200">
                <h3 className="font-bold text-gray-900 mb-3 text-lg">✓ No Installation</h3>
                <p className="text-gray-700 text-sm">Works directly in your browser. Use data converter tools on Windows, Mac, iPhone, Android, and any device with internet. No software downloads or complex setup required.</p>
              </div>
              <div className="bg-gradient-to-br from-teal-50 to-green-100 p-6 rounded-lg border border-teal-200">
                <h3 className="font-bold text-gray-900 mb-3 text-lg">✓ Instant Results</h3>
                <p className="text-gray-700 text-sm">Conversion time depends on input size and structure. Inspect the result before replacing a source dataset.</p>
              </div>
              <div className="bg-gradient-to-br from-teal-50 to-green-100 p-6 rounded-lg border border-teal-200">
                <h3 className="font-bold text-gray-900 mb-3 text-lg">✓ Secure & Private</h3>
                <p className="text-gray-700 text-sm">Input is sent over HTTPS to the conversion service. Remove credentials and sensitive records before submitting data.</p>
              </div>
            </div>

            {/* Popular Data Tools - Internal Linking Section */}
            <div className="mb-12 bg-gray-50 p-8 rounded-lg border border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Popular Data Tools</h2>
              <p className="text-gray-700 mb-6">Quick access to our most-used data format conversion tools:</p>
              <div className="space-y-3">
                <Link href="/all-tools/data/csv-to-json" className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-300 hover:border-teal-500 hover:bg-teal-50 transition">
                  <span className="text-teal-600 font-semibold">→</span>
                  <span className="text-gray-900 font-medium hover:text-teal-600">CSV to JSON Converter - Transform CSV files</span>
                </Link>
                <Link href="/all-tools/data/excel-to-csv" className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-300 hover:border-teal-500 hover:bg-teal-50 transition">
                  <span className="text-teal-600 font-semibold">→</span>
                  <span className="text-gray-900 font-medium hover:text-teal-600">Excel to CSV Converter - Export spreadsheet data</span>
                </Link>
                <Link href="/all-tools/data/csv-to-xml" className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-300 hover:border-teal-500 hover:bg-teal-50 transition">
                  <span className="text-teal-600 font-semibold">→</span>
                  <span className="text-gray-900 font-medium hover:text-teal-600">CSV to XML Converter - Create XML from CSV</span>
                </Link>
                <Link href="/all-tools/data/json-to-xml" className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-300 hover:border-teal-500 hover:bg-teal-50 transition">
                  <span className="text-teal-600 font-semibold">→</span>
                  <span className="text-gray-900 font-medium hover:text-teal-600">JSON to XML Converter - Convert JSON data</span>
                </Link>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">Check the Structure After Conversion</h2>
            <p className="text-gray-700 leading-relaxed mb-6">
              It's simple and intuitive. Select the tool you need from our collection—try <Link href="/all-tools/data/csv-to-json" className="text-teal-600 font-medium hover:underline">CSV to JSON</Link>, <Link href="/all-tools/data/excel-to-csv" className="text-teal-600 font-medium hover:underline">Excel to CSV</Link>, or any other format pair. Upload your file or paste your data, then choose your desired output format. Our tools automatically process your input and generate results instantly. Download your file or copy the output to clipboard. No signup, no registration, no learning curve—just fast, secure format transformation in seconds.
            </p>
          </motion.div>
        </div>
      </div>
      {/* Feature Highlight */}
      <motion.div 
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-20"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
      </motion.div>

      {/* FAQ Section */}
      <FAQ
        items={[
          {
            name: 'Are all data converter tools really free?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'The data conversion utilities are available without Premium AI Studio credits. Individual tools may apply input-size or rate limits.'
            }
          },
          {
            name: 'What data formats can I convert?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Our free data converter supports CSV, JSON, XML, Excel, YAML, and more formats. You can transform data between any of these formats using our specialized conversion tools. Each tool is optimized for specific format pairs.'
            }
          },
          {
            name: 'Do I need to sign up to use the data converter?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'No signup required! Our free data converter works instantly without registration, login, or account creation. Simply select your conversion tool, upload or paste your data, and get results immediately. No personal information needed.'
            }
          },
          {
            name: 'Is my data safe when using the converter?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Data is sent over HTTPS to the server-side conversion service. Remove passwords, tokens, and sensitive records before submitting input, and review the Privacy Policy for retention details.'
            }
          },
          {
            name: 'Can I use the data converter on mobile?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Yes. All data conversion tools work on iOS, Android, tablets, and mobile browsers. No app installation required. Simply visit SimplifyConvert from your mobile device and start converting data formats instantly.'
            }
          },
          {
            name: 'What file sizes can the converter handle?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Our data converter tools can handle files up to 100MB depending on the format and your internet connection. Large files may take longer to process, but our tools handle them efficiently without losing data quality.'
            }
          }
        ]}
        colorClass="teal"
        bgColor="white"
      />

      {/* Tools ItemList Schema for SEO */}
      <script type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          name: 'Free Data Conversion Tools',
          description: '12 free online tools to convert between CSV, JSON, XML, Excel, and other data formats',
          itemListElement: Object.values(dataTools).map((tool, idx) => ({
            '@type': 'SoftwareApplication',
            position: idx + 1,
            name: tool.title,
            description: tool.description,
            url: `https://simplifyconvert.com/all-tools/data/${tool.id}`,
            applicationCategory: 'Utility',
            operatingSystem: 'Web',
            offers: {
              '@type': 'Offer',
              price: '0',
              priceCurrency: 'USD'
            }
          }))
        })}
      </script>

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
              name: 'Data Converter',
              item: 'https://simplifyconvert.com/all-tools/data'
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



