'use client';

import { getAllTools } from '@/app/lib/code-tools';
import Link from 'next/link';
import { ArrowRight, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { HomeHeader } from '@/app/components/HomeHeader';
import { Footer } from '@/app/components/Footer';
import { FAQ } from '@/app/components/FAQ';

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
    <>
      <HomeHeader />
      <main className="min-h-screen bg-slate-50 flex flex-col">
        <div className="flex-1">
      {/* Premium Header */}
      <div className="relative bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 py-16 px-4 md:px-8 overflow-hidden">
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
            <span>Code Tools</span>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
              Free Code Tools Online (Format, Minify, Validate)
            </h1>
            <p className="text-lg text-white/90 max-w-2xl">
              49 free online tools for developers. Format, minify, validate, and convert code in JavaScript, HTML, CSS, JSON, XML, and more. No signup required.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Tools Grid */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        {Object.entries(engineLabels).map(([engine, { title, color, description }], engineIdx) => (
          <motion.div 
            key={engine} 
            className="mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: engineIdx * 0.1 }}
          >
            {/* Section Header */}
            <div className="mb-8">
              <h2 className={`text-3xl font-bold bg-gradient-to-r ${color} bg-clip-text text-transparent mb-2`}>
                {title}
              </h2>
              <p className="text-gray-600 font-medium">{description}</p>
            </div>

            {/* Tools Grid */}
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ staggerChildren: 0.05, delayChildren: 0.2 }}
            >
              {toolsByEngine[engine]?.map((tool) => (
                <motion.div
                  key={tool.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <Link
                    href={`/all-tools/code-tools/${tool.id}`}
                    className="group h-full"
                  >
                    <motion.div
                      className="relative bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all p-6 group border-2 border-gray-100 hover:border-green-200 overflow-hidden cursor-pointer h-full flex flex-col"
                      whileHover={{ y: -4 }}
                      transition={{ duration: 0.2 }}
                    >
                      {/* Gradient overlay on hover */}
                      <motion.div 
                        className={`absolute inset-0 bg-gradient-to-r ${color} opacity-0 group-hover:opacity-5`}
                        transition={{ duration: 0.3 }}
                      />

                      <div className="relative z-10 flex flex-col h-full">
                        {/* Icon and Title */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="text-lg font-bold text-gray-900 group-hover:text-green-600 transition line-clamp-2">
                              {tool.title}
                            </h3>
                          </div>
                          <motion.div
                            className="ml-2 text-gray-300 group-hover:text-green-600 transition flex-shrink-0"
                            whileHover={{ x: 2 }}
                          >
                            <ChevronRight size={20} />
                          </motion.div>
                        </div>

                        {/* Description */}
                        <p className="text-gray-600 text-sm line-clamp-2 mb-4 flex-grow">
                          {tool.description}
                        </p>

                        {/* Options count badge */}
                        {tool.options.length > 0 && (
                          <div className="inline-block px-3 py-1 bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 text-xs font-bold rounded-full self-start">
                            {tool.options.length} option{tool.options.length !== 1 ? 's' : ''}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        ))}
      </div>

      {/* Stats Section */}
      <motion.div 
        className="bg-gradient-to-r from-green-600 to-emerald-600 py-12 px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <motion.div whileHover={{ scale: 1.05 }}>
              <div className="text-3xl font-bold text-white">{tools.length}</div>
              <p className="text-white/80 text-sm mt-2 font-medium">Tools Available</p>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }}>
              <div className="text-3xl font-bold text-white">{Object.keys(toolsByEngine).length}</div>
              <p className="text-white/80 text-sm mt-2 font-medium">Categories</p>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }}>
              <div className="text-3xl font-bold text-white">100%</div>
              <p className="text-white/80 text-sm mt-2 font-medium">Free & Open</p>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }}>
              <div className="text-3xl font-bold text-white">⚡</div>
              <p className="text-white/80 text-sm mt-2 font-medium">Instant Results</p>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* SEO Content Section */}
      <div className="py-12 px-4 md:px-8 bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Developer Utilities for Specific Text Transformations</h2>
            
            <p className="text-gray-700 leading-relaxed mb-6">
              Use focused tools to <Link href="/all-tools/code-tools/code-minifier" className="text-green-600 font-medium hover:underline">minify JavaScript or CSS</Link>, <Link href="/all-tools/code-tools/json-formatter" className="text-green-600 font-medium hover:underline">format JSON</Link>, or <Link href="/all-tools/code-tools/html-validator" className="text-green-600 font-medium hover:underline">validate HTML</Link>. Formatting changes presentation, validation checks syntax rules, and encoding is not encryption.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
              <div className="bg-gradient-to-br from-green-50 to-emerald-100 p-6 rounded-lg border border-green-200">
                <h3 className="font-bold text-gray-900 mb-3 text-lg">✓ Completely Free</h3>
                <p className="text-gray-700 text-sm">Choose a formatter, validator, minifier, encoder, decoder, converter, or generator based on the output you need.</p>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-emerald-100 p-6 rounded-lg border border-green-200">
                <h3 className="font-bold text-gray-900 mb-3 text-lg">✓ No Installation</h3>
                <p className="text-gray-700 text-sm">Works directly in your browser. Use code tools on Windows, Mac, iPhone, Android, and any device with internet. No software downloads or complex setup required.</p>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-emerald-100 p-6 rounded-lg border border-green-200">
                <h3 className="font-bold text-gray-900 mb-3 text-lg">✓ Instant Results</h3>
                <p className="text-gray-700 text-sm">Runtime depends on input length and operation. Validation identifies syntax problems but does not prove application correctness or security.</p>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-emerald-100 p-6 rounded-lg border border-green-200">
                <h3 className="font-bold text-gray-900 mb-3 text-lg">✓ Secure & Private</h3>
                <p className="text-gray-700 text-sm">Tool input is sent over HTTPS to the processing API. Remove secrets, tokens, private keys, passwords, and sensitive customer data first.</p>
              </div>
            </div>

            {/* Popular Tools - Internal Linking */}
            <div className="mb-12 bg-gray-50 p-8 rounded-lg border border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Popular Developer Tools</h2>
              <p className="text-gray-700 mb-6">Quick access to our most-used code tools:</p>
              <div className="space-y-3">
                <Link href="/all-tools/code-tools/code-minifier" className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-300 hover:border-green-500 hover:bg-green-50 transition">
                  <span className="text-green-600 font-semibold">→</span>
                  <span className="text-gray-900 font-medium hover:text-green-600">Code Minifier - Reduce file size</span>
                </Link>
                <Link href="/all-tools/code-tools/code-beautifier" className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-300 hover:border-green-500 hover:bg-green-50 transition">
                  <span className="text-green-600 font-semibold">→</span>
                  <span className="text-gray-900 font-medium hover:text-green-600">Code Beautifier - Format code</span>
                </Link>
                <Link href="/all-tools/code-tools/json-formatter" className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-300 hover:border-green-500 hover:bg-green-50 transition">
                  <span className="text-green-600 font-semibold">→</span>
                  <span className="text-gray-900 font-medium hover:text-green-600">JSON Formatter - Pretty-print JSON</span>
                </Link>
                <Link href="/all-tools/code-tools/base64-encode" className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-300 hover:border-green-500 hover:bg-green-50 transition">
                  <span className="text-green-600 font-semibold">→</span>
                  <span className="text-gray-900 font-medium hover:text-green-600">Base64 Encoder - Encode text</span>
                </Link>
                <Link href="/all-tools/code-tools/uuid-generator" className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-300 hover:border-green-500 hover:bg-green-50 transition">
                  <span className="text-green-600 font-semibold">→</span>
                  <span className="text-gray-900 font-medium hover:text-green-600">UUID Generator - Create unique IDs</span>
                </Link>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">How to Use Our Code Tools</h2>
            <p className="text-gray-700 leading-relaxed mb-6">
              It's simple and intuitive. Select the tool you need from our collection—try <Link href="/all-tools/code-tools/code-minifier" className="text-green-600 font-medium hover:underline">minify code</Link>, <Link href="/all-tools/code-tools/json-formatter" className="text-green-600 font-medium hover:underline">format JSON</Link>, or any other tool. Paste your code or upload a file, then click process. Our tools automatically transform your input and generate results instantly. Copy the output or download it. No signup, no registration, no learning curve—just fast, secure code processing in seconds.
            </p>
          </motion.div>
        </div>
      </div>

      {/* FAQ Section */}
      <FAQ
        items={[
          {
            name: 'Are all code tools really free?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'The code utilities are available without Premium AI Studio credits. Individual tools may apply input-size or rate limits.'
            }
          },
          {
            name: 'What programming languages are supported?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Our code tools support JavaScript, HTML, CSS, JSON, XML, YAML, SQL, Base64, and many more formats. You can format, minify, validate, encode, decode, and convert between different code formats with specialized tools for each language.'
            }
          },
          {
            name: 'Do I need to sign up or install anything?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'No signup required! Our code tools work instantly in your browser without registration, login, or account creation. Simply select your tool, paste your code, and get results immediately. No personal information needed or software to download.'
            }
          },
          {
            name: 'Is my code safe when using these tools?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Input is sent over HTTPS to the tool service. Do not submit production secrets, API keys, access tokens, passwords, private keys, or sensitive customer data.'
            }
          },
          {
            name: 'Can I use the code tools on mobile?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Yes. All code tools work on iOS, Android, tablets, and mobile browsers. No app installation required. Simply visit SimplifyConvert from your mobile device and start processing code formats instantly. Full functionality on all devices.'
            }
          },
          {
            name: 'What file sizes can the tools handle?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Our code tools can handle code up to 100MB depending on the tool and your internet connection. Large files may take longer to process, but our tools handle them efficiently without losing quality or accuracy.'
            }
          }
        ]}
        colorClass="green"
        bgColor="white"
      />

      {/* Tools ItemList Schema for SEO */}
      <script type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          name: 'Free Code Tools for Developers',
          description: '49 free online tools for developers to format, minify, validate, and convert code instantly',
          itemListElement: tools.map((tool, idx) => ({
            '@type': 'SoftwareApplication',
            position: idx + 1,
            name: tool.title,
            description: tool.description,
            url: `https://simplifyconvert.com/all-tools/code-tools/${tool.id}`,
            applicationCategory: 'DeveloperTools',
            operatingSystem: 'Web',
            offers: {
              '@type': 'Offer',
              price: '0',
              priceCurrency: 'USD'
            }
          }))
        })}
      </script>

      {/* Breadcrumb Schema */}
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
              name: 'Code Tools',
              item: 'https://simplifyconvert.com/all-tools/code-tools'
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




