'use client';

import { useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getDataViewToolById, getRelatedDataViewTools } from '@/app/lib/data-view-tools';
import { Copy, Check, AlertCircle, CheckCircle, Loader2, ChevronRight, Zap, Shield, Download } from 'lucide-react';
import { motion } from 'framer-motion';
import { HomeHeader } from '@/app/components/HomeHeader';
import { Footer } from '@/app/components/Footer';

interface FormData {
  [key: string]: string | number | boolean;
}

// Action-specific text for each data view tool
function getActionText(toolId: string): string {
  const actionMap: Record<string, string> = {
    'csv-to-json': 'Convert to JSON',
    'json-to-csv': 'Convert to CSV',
    'json-to-xml': 'Convert to XML',
    'xml-to-json': 'Convert to JSON',
    'yaml-to-json': 'Convert to JSON',
    'json-to-yaml': 'Convert to YAML',
    'tsv-to-csv': 'Convert to CSV',
    'sql-to-json': 'Convert to JSON',
    'json-to-sql': 'Convert to SQL',
    'csv-viewer': 'View CSV',
    'json-viewer': 'View JSON',
    'xml-viewer': 'View XML',
    'yaml-viewer': 'View YAML',
  };

  return actionMap[toolId] || 'Process';
}

export default function DataViewToolPage() {
  const params = useParams();
  const slug = params.slug as string;

  const tool = getDataViewToolById(slug);
  const relatedTools = tool ? getRelatedDataViewTools(slug, 4) : [];

  const [input, setInput] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [formData, setFormData] = useState<FormData>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [output, setOutput] = useState('');
  const [copied, setCopied] = useState(false);

  // FAQ Schema
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Is this tool secure?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, your data is processed securely and not stored on our servers. All processing happens in your browser or is immediately deleted after processing."
        }
      },
      {
        "@type": "Question",
        "name": "What file size limits do you have?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Most tools support inputs up to 10MB. For larger data, consider processing in smaller chunks or using command-line tools."
        }
      },
      {
        "@type": "Question",
        "name": "Is my data stored after processing?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "No. All uploads and outputs are processed and automatically deleted. We do not store or log your data."
        }
      },
      {
        "@type": "Question",
        "name": "Can I use this for production data?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, but we recommend testing with sample data first and verifying output matches your expectations."
        }
      },
      {
        "@type": "Question",
        "name": "What encoding formats are supported?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Most tools support UTF-8, UTF-16, Latin-1, and ISO-8859-1. Encoding is auto-detected when possible."
        }
      },
      {
        "@type": "Question",
        "name": "Can I convert multiple files at once?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Currently, one conversion at a time. For batch processing, process files sequentially or use command-line tools."
        }
      }
    ]
  };

  // Breadcrumb Schema
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://simplifyconvert.com"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Data Tools",
        "item": "https://simplifyconvert.com/all-tools/data"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": tool?.title || "Tool",
        "item": `https://simplifyconvert.com/all-tools/data/${slug}`
      }
    ]
  };

  if (!tool) {
    return (
      <>
        <HomeHeader />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center border border-gray-200">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Tool Not Found</h1>
            <p className="text-gray-600 mb-6">The requested tool "{slug}" does not exist.</p>
            <Link
              href="/all-tools/data"
              className="inline-block bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700 transition font-medium"
            >
              Back to Tools
            </Link>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setInput(event.target?.result as string);
        setSelectedFile(file);
      };
      reader.readAsText(file);
    }
  }, []);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadOutput = () => {
    const element = document.createElement('a');
    const file = new Blob([output], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `output.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <>
      <HomeHeader />
      
      {/* JSON-LD Schema */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <main className="min-h-screen bg-gray-50 flex flex-col">
        <div className="flex-1">
          {/* Header */}
          <div className="relative bg-gradient-to-r from-teal-600 to-emerald-700 overflow-hidden min-h-[280px] flex flex-col justify-between py-12 px-4 sm:px-6 lg:px-8">
            {/* Breadcrumb */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="relative z-10 flex items-center gap-2 text-white text-sm mb-6"
            >
              <Link href="/" className="hover:opacity-80">Home</Link>
              <ChevronRight size={16} />
              <Link href="/all-tools/data" className="hover:opacity-80">Data Tools</Link>
              <ChevronRight size={16} />
              <span className="opacity-90">{tool.title}</span>
            </motion.div>

            {/* Header Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="relative z-10"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">📊</span>
                </div>
                <div>
                  <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">{tool.title}</h1>
                  <p className="text-white text-lg opacity-95 max-w-2xl">{tool.description}</p>
                  <div className="mt-4 flex items-center gap-3">
                    <span className="inline-block text-white text-xs font-semibold px-4 py-1.5 rounded-full" style={{ backgroundColor: '#0D9488' }}>
                      {tool.engine}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Main Content */}
          <div className="px-4 sm:px-6 lg:px-8 py-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8"
            >
              {/* Input Section */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="md:col-span-1"
              >
                <div className="sticky top-4 space-y-6">
                  <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                    <div className="bg-gradient-to-r from-teal-50 to-emerald-50 px-6 py-4 border-b border-gray-200">
                      <h2 className="text-lg font-semibold text-gray-900">Input</h2>
                    </div>

                    <div className="p-6 space-y-6">
                      {/* Input Mode */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Paste or Upload
                        </label>
                        <textarea
                          value={input}
                          onChange={(e) => setInput(e.target.value)}
                          className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm font-mono bg-gray-50 resize-none h-48"
                          placeholder="Paste your data here..."
                          disabled={loading}
                        />
                      </div>

                      {tool.inputMode === 'file' || tool.inputMode === 'both' ? (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Or Upload File
                          </label>
                          <div className="border-2 border-dashed border-teal-300 rounded-lg p-6 hover:border-teal-400 transition cursor-pointer bg-teal-50">
                            <input
                              type="file"
                              onChange={handleFileSelect}
                              className="absolute opacity-0 cursor-pointer"
                              disabled={loading}
                            />
                            <div className="text-center">
                              <p className="text-gray-900 font-medium text-sm">
                                {selectedFile ? selectedFile.name : 'Click to select'}
                              </p>
                            </div>
                          </div>
                        </div>
                      ) : null}

                      {/* Options */}
                      {tool.options && tool.options.length > 0 && (
                        <div className="space-y-4">
                          <h3 className="text-sm font-semibold text-gray-900">Options</h3>
                          {tool.options.map((option) => (
                            <div key={option.name}>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                {option.label}
                              </label>
                              {option.type === 'select' && (
                                <select
                                  name={option.name}
                                  value={String(formData[option.name] ?? option.default ?? '')}
                                  onChange={(e) => setFormData({ ...formData, [option.name]: e.target.value })}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 text-sm bg-white"
                                >
                                  {option.options?.map((opt) => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                  ))}
                                </select>
                              )}
                              {option.type === 'number' && (
                                <input
                                  type="number"
                                  value={((): string | number => {
                                    const val = formData[option.name];
                                    if (typeof val === 'number') return val;
                                    if (typeof option.default === 'number') return option.default;
                                    return '';
                                  })()}
                                  onChange={(e) => setFormData({ ...formData, [option.name]: e.target.value ? parseFloat(e.target.value) : '' })}
                                  min={option.min}
                                  max={option.max}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 text-sm"
                                />
                              )}
                              {option.type === 'checkbox' && (
                                <input
                                  type="checkbox"
                                  checked={(formData[option.name] as boolean) ?? false}
                                  onChange={(e) => setFormData({ ...formData, [option.name]: e.target.checked })}
                                  className="w-4 h-4 text-teal-600 rounded focus:ring-2 focus:ring-teal-500"
                                />
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {error && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                          <p className="text-red-700 text-sm">{error}</p>
                        </div>
                      )}

                      {/* Submit Button */}
                      <button
                        onClick={() => setOutput(input)}
                        disabled={loading || !input}
                        className="w-full bg-teal-600 hover:bg-teal-700 disabled:bg-gray-400 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2"
                      >
                        {loading ? <Loader2 size={18} className="animate-spin" /> : null}
                        {getActionText(tool.id)}
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Output Section */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="md:col-span-2 space-y-6"
              >
                {/* Info Box */}
                <motion.div
                  whileHover={{ y: -4 }}
                  className="bg-gradient-to-br from-teal-50 to-emerald-50 border border-teal-200 rounded-xl p-6"
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">About this tool</h3>
                  <p className="text-gray-700 leading-relaxed mb-4">{tool.description}</p>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2 text-gray-700">
                      <CheckCircle size={16} className="text-teal-600 flex-shrink-0" />
                      <span>Input: {tool.inputMode}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700">
                      <CheckCircle size={16} className="text-teal-600 flex-shrink-0" />
                      <span>Output: {tool.outputMode}</span>
                    </div>
                  </div>
                </motion.div>

                {/* Output Display */}
                {output && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white rounded-xl shadow-lg border border-gray-200 p-6"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-bold text-gray-900">Output</h2>
                      <div className="flex gap-2">
                        <button
                          onClick={copyToClipboard}
                          className="px-3 py-2 bg-teal-100 text-teal-700 rounded-lg hover:bg-teal-200 text-sm font-medium flex items-center gap-2"
                        >
                          {copied ? <Check size={16} /> : <Copy size={16} />}
                          {copied ? 'Copied' : 'Copy'}
                        </button>
                        <button
                          onClick={downloadOutput}
                          className="px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 text-sm font-medium flex items-center gap-2"
                        >
                          <Download size={16} />
                          Download
                        </button>
                      </div>
                    </div>
                    <textarea
                      value={output}
                      readOnly
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-sm font-mono resize-none h-64"
                    />
                  </motion.div>
                )}

                {!output && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-white rounded-xl shadow-lg border border-gray-200 p-12 text-center"
                  >
                    <div className="mb-4 flex justify-center">
                      <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center">
                        <span className="text-3xl">📊</span>
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Ready to process</h3>
                    <p className="text-gray-600">Paste data or upload a file to get started</p>
                  </motion.div>
                )}
              </motion.div>
            </motion.div>

            {/* Feature Cards */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.7 }} className="max-w-6xl mx-auto mt-20">
              <div className="grid md:grid-cols-3 gap-6">
                {[
                  {
                    icon: Zap,
                    title: 'Instant Processing',
                    description: 'Process your data in seconds with optimized engines',
                  },
                  {
                    icon: Shield,
                    title: 'Secure & Private',
                    description: 'Your data stays private and is automatically deleted',
                  },
                  {
                    icon: CheckCircle,
                    title: 'Accurate Results',
                    description: 'Reliable conversion and transformation tools',
                  },
                ].map((feature, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ y: -4 }}
                    className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 text-center"
                  >
                    <div className="mb-4 flex justify-center">
                      <div className="w-12 h-12 bg-gradient-to-br from-teal-100 to-emerald-100 rounded-full flex items-center justify-center">
                        <feature.icon size={24} className="text-teal-600" />
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                    <p className="text-gray-600 text-sm">{feature.description}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* SEO Content Sections */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.8 }} className="max-w-4xl mx-auto mt-24 space-y-16">
              {/* How-To Guide */}
              <section className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">How to {getActionText(tool.id)}</h2>
                <ol className="space-y-4 list-decimal list-inside">
                  <li className="text-gray-700"><strong>Input your data:</strong> Paste text or upload a file in the input area above.</li>
                  <li className="text-gray-700"><strong>Configure options:</strong> Adjust any tool-specific settings if available.</li>
                  <li className="text-gray-700"><strong>Process:</strong> Click the {getActionText(tool.id)} button to transform your data.</li>
                  <li className="text-gray-700"><strong>Get results:</strong> Copy to clipboard or download the output instantly.</li>
                </ol>
              </section>

              {/* Benefits Section */}
              <section className="bg-gradient-to-br from-teal-50 to-emerald-50 rounded-xl border border-teal-200 p-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Why Use {tool.title}?</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {[
                    { title: 'No Installation', description: 'Works in your browser—no software to download' },
                    { title: 'Free Forever', description: 'Use as much as you need with no limits' },
                    { title: 'Privacy First', description: 'Data is processed securely and never stored' },
                    { title: 'Fast & Reliable', description: 'Accurate results delivered instantly' }
                  ].map((benefit, idx) => (
                    <div key={idx} className="bg-white rounded-lg p-4 border border-gray-100">
                      <h3 className="font-semibold text-gray-900 mb-2">{benefit.title}</h3>
                      <p className="text-gray-700 text-sm">{benefit.description}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* FAQ Section */}
              <section className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-8">Frequently Asked Questions</h2>
                <div className="space-y-6">
                  {[
                    { q: 'Is this tool secure?', a: 'Yes, your data is processed securely and not stored on our servers.' },
                    { q: 'What file size limits exist?', a: 'Most tools support inputs up to 10MB. For larger data, process in chunks.' },
                    { q: 'Is my data stored?', a: 'No. All data is automatically deleted after processing. We don\'t store anything.' },
                    { q: 'Which encodings are supported?', a: 'UTF-8, UTF-16, Latin-1, ISO-8859-1, and more. Auto-detection available.' },
                    { q: 'Can I process multiple items?', a: 'Process one item at a time. Repeat for batch processing or use CLI tools.' },
                    { q: 'What if processing fails?', a: 'You\'ll see a detailed error message. Check your data format and try again.' }
                  ].map((faq, idx) => (
                    <div key={idx} className="border-b border-gray-200 pb-6 last:border-0">
                      <h3 className="font-semibold text-gray-900 mb-2">{faq.q}</h3>
                      <p className="text-gray-700">{faq.a}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Related Tools */}
              {relatedTools.length > 0 && (
                <section className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">Related Tools</h2>
                  <div className="grid md:grid-cols-2 gap-4">
                    {relatedTools.map((relatedTool) => (
                      <Link
                        key={relatedTool.id}
                        href={`/all-tools/data/${relatedTool.id}`}
                        className="group p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-200 hover:border-teal-300 hover:shadow-md transition"
                      >
                        <h3 className="font-semibold text-gray-900 group-hover:text-teal-600 mb-1">{relatedTool.title}</h3>
                        <p className="text-gray-600 text-sm">{relatedTool.description.substring(0, 60)}...</p>
                      </Link>
                    ))}
                  </div>
                </section>
              )}

              {/* Best Practices */}
              <section className="bg-blue-50 rounded-xl border border-blue-200 p-8">
                <div className="flex gap-3">
                  <AlertCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-blue-900 mb-3">Best Practices</h3>
                    <ul className="text-blue-900 text-sm space-y-2 list-disc list-inside">
                      <li>Test with sample data before production use</li>
                      <li>Verify output matches your expectations</li>
                      <li>Keep backups of original data</li>
                      <li>Check for special characters that may affect conversion</li>
                      <li>Review encoding settings for your data</li>
                      <li>Document your conversion settings for consistency</li>
                    </ul>
                  </div>
                </div>
              </section>
            </motion.div>
        </div>
      </div>
      </main>
      <Footer />
    </>
  );
}
