'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { getPdfToolById } from '@/app/lib/pdf-tools';
import { validatePdfInput } from '@/app/lib/pdf-validation';
import type { PdfToolConfig } from '@/app/lib/pdf-tools';
import { Upload, Download, AlertCircle, Loader, ChevronRight, CheckCircle, Zap, Shield } from 'lucide-react';

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default function PdfToolPage({ params }: PageProps) {
  // Unwrap params promise
  const resolvedParams = React.use(params);
  const tool = getPdfToolById(resolvedParams.slug);

  const [files, setFiles] = useState<File[]>([]);
  const [url, setUrl] = useState('');
  const [options, setOptions] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!tool) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Tool Not Found</h1>
          <p className="text-gray-600">The requested PDF tool could not be found.</p>
        </div>
      </div>
    );
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    setFiles(selectedFiles);
    setError('');
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value);
    setError('');
  };

  const handleOptionChange = (optionId: string, value: any) => {
    setOptions({ ...options, [optionId]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setResult(null);

    // Validate input
    const validation = validatePdfInput(tool, files, url);
    if (!validation.valid) {
      setError(validation.error || 'Validation failed');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('tool', tool.id);
      formData.append('options', JSON.stringify(options));

      // Add files or URL
      if (tool.inputMode === 'url') {
        formData.append('url', url);
      } else {
        for (const file of files) {
          formData.append('file', file);
        }
      }

      const response = await fetch('/api/pdf', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Processing failed');
      }

      // Get the output file
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `${tool.id}_output${tool.output}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(downloadUrl);
      document.body.removeChild(a);

      setResult({ type: 'file', message: 'File processed successfully!' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Premium Header */}
      <div className="relative bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-700 py-12 px-4 md:px-8 overflow-hidden">
        {/* Animated background shapes */}
        <motion.div
          className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full mix-blend-multiply filter blur-3xl"
          animate={{ x: [0, 30, -20, 0], y: [0, -30, 20, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full mix-blend-multiply filter blur-3xl"
          animate={{ x: [0, -30, 20, 0], y: [0, 30, -20, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />

        <div className="max-w-6xl mx-auto relative z-10">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-white/80 text-sm mb-6">
            <Link href="/" className="hover:text-white transition">Home</Link>
            <ChevronRight size={16} />
            <Link href="/tools/pdf" className="hover:text-white transition">PDF Tools</Link>
            <ChevronRight size={16} />
            <span className="text-white">{tool.title}</span>
          </div>

          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <tool.icon className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
                  {tool.title}
                </h1>
                <p className="text-lg text-white/90 max-w-2xl">
                  {tool.description}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-12">
        <motion.div 
          className="grid md:grid-cols-2 gap-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ staggerChildren: 0.1, delayChildren: 0.2 }}
        >
          {/* Controls Panel */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 hover:shadow-2xl transition-all sticky top-4">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <span className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">⚙️</span>
                Configure
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* File/URL Input */}
                <motion.div 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  transition={{ delay: 0.1 }}
                >
                  {tool.inputMode === 'url' ? (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Website URL
                      </label>
                      <input
                        type="url"
                        value={url}
                        onChange={handleUrlChange}
                        placeholder="https://example.com"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition outline-none"
                        required
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        {tool.inputMode === 'multi-file' ? 'Upload Files' : 'Upload File'}
                      </label>
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-purple-300 rounded-xl p-8 text-center cursor-pointer hover:border-purple-500 hover:bg-purple-50 transition-all group"
                      >
                        <Upload className="w-8 h-8 text-purple-500 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                        <p className="text-sm font-semibold text-gray-700">
                          {files.length > 0
                            ? `✓ ${files.length} file(s) selected`
                            : 'Click to upload or drag & drop'}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {tool.accepts.join(', ')}
                        </p>
                      </div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple={tool.inputMode === 'multi-file'}
                        accept={tool.accepts.join(',')}
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </div>
                  )}
                </motion.div>

                {/* Tool Options */}
                {tool.options && tool.options.length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    transition={{ delay: 0.2 }}
                    className="space-y-4"
                  >
                    <h3 className="font-semibold text-gray-900">Options</h3>
                    {tool.options.map((option) => (
                      <div key={option.id}>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {option.label}
                          {option.required && <span className="text-red-500">*</span>}
                        </label>
                        {option.type === 'select' && option.options ? (
                          <select
                            value={options[option.id] ?? option.default ?? ''}
                            onChange={(e) => handleOptionChange(option.id, e.target.value)}
                            className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition"
                          >
                            {option.options.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        ) : option.type === 'checkbox' ? (
                          <input
                            type="checkbox"
                            checked={options[option.id] ?? option.default ?? false}
                            onChange={(e) => handleOptionChange(option.id, e.target.checked)}
                            className="w-5 h-5 text-purple-600 rounded accent-purple-600"
                          />
                        ) : option.type === 'number' ? (
                          <input
                            type="number"
                            value={options[option.id] ?? option.default ?? ''}
                            onChange={(e) => handleOptionChange(option.id, e.target.value)}
                            min={option.min}
                            max={option.max}
                            step={option.step}
                            placeholder={option.placeholder}
                            className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition"
                          />
                        ) : (
                          <input
                            type={option.type}
                            value={options[option.id] ?? option.default ?? ''}
                            onChange={(e) => handleOptionChange(option.id, e.target.value)}
                            placeholder={option.placeholder}
                            className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition"
                          />
                        )}
                      </div>
                    ))}
                  </motion.div>
                )}

                {/* Error Message */}
                {error && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-4 bg-red-50 border-2 border-red-200 rounded-xl flex gap-3"
                  >
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-red-900">Error</p>
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  </motion.div>
                )}

                {/* Success Message */}
                {result && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-4 bg-green-50 border-2 border-green-200 rounded-xl flex gap-3"
                  >
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-green-900">Success</p>
                      <p className="text-sm text-green-700">{result.message}</p>
                    </div>
                  </motion.div>
                )}

                {/* Submit Button */}
                <motion.button
                  type="submit"
                  disabled={loading || (tool.inputMode !== 'url' && files.length === 0)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-700 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-purple-600/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Download className="w-5 h-5" />
                      Process PDF
                    </>
                  )}
                </motion.button>
              </form>
            </div>
          </motion.div>

          {/* Info Panel */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 hover:shadow-2xl transition-all">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <span className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">ℹ️</span>
                About This Tool
              </h2>

              <div className="space-y-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full">
                      Category
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{tool.category}</p>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="inline-block px-3 py-1 bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-full">
                      Input
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {tool.inputMode === 'url' ? 'Website URL' : tool.inputMode === 'multi-file' ? 'Multiple Files' : 'Single File'}
                  </p>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="inline-block px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                      Output
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{tool.output.replace('.', '').toUpperCase()}</p>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="inline-block px-3 py-1 bg-amber-100 text-amber-700 text-xs font-semibold rounded-full">
                      Formats
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {tool.accepts.map((format) => (
                      <span key={format} className="text-xs font-medium bg-gray-100 text-gray-700 px-2 py-1 rounded">
                        {format}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Footer Section - Features */}
      <motion.div
        className="mt-12 grid md:grid-cols-3 gap-6 max-w-6xl mx-auto px-4 md:px-8 pb-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <motion.div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-l-purple-600 hover:shadow-xl transition-all" whileHover={{ y: -4 }}>
          <h3 className="font-bold text-gray-900 mb-3 text-lg flex items-center gap-2">
            <Zap className="w-5 h-5 text-purple-600" />
            Fast Processing
          </h3>
          <p className="text-sm text-gray-600">
            Cloud-based processing ensures rapid file conversion and manipulation without local resource usage.
          </p>
        </motion.div>

        <motion.div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-l-indigo-600 hover:shadow-xl transition-all" whileHover={{ y: -4 }}>
          <h3 className="font-bold text-gray-900 mb-3 text-lg flex items-center gap-2">
            <Shield className="w-5 h-5 text-indigo-600" />
            Secure & Private
          </h3>
          <p className="text-sm text-gray-600">
            All uploads are processed securely and automatically deleted after processing. Your data is never stored.
          </p>
        </motion.div>

        <motion.div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-l-purple-700 hover:shadow-xl transition-all" whileHover={{ y: -4 }}>
          <h3 className="font-bold text-gray-900 mb-3 text-lg flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-purple-700" />
            No Installation
          </h3>
          <p className="text-sm text-gray-600">
            Works 100% online. No software installation or sign-up required. Start processing right now!
          </p>
        </motion.div>
      </motion.div>
    </main>
  );
}
