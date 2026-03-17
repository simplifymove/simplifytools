'use client';

import React, { useState, useRef, use } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ChevronRight, Zap, Shield, CheckCircle, Loader } from 'lucide-react';
import { getToolById } from '@/app/lib/video-tools';
import { validateToolInput } from '@/app/lib/media-validation';
import type { VideoTool } from '@/app/lib/video-tools';
import { HomeHeader } from '@/app/components/HomeHeader';
import { Footer } from '@/app/components/Footer';

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default function VideoToolPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const tool = getToolById(resolvedParams.slug);
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState('');
  const [options, setOptions] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!tool) {
    return (
      <>
        <HomeHeader />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center flex flex-col">
          <div className="flex-1 flex items-center justify-center w-full">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Tool Not Found</h1>
              <p className="text-gray-600">The requested tool could not be found.</p>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError('');
    }
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
    const validation = validateToolInput(tool, { file: file || undefined, url });
    if (!validation.valid) {
      setError(validation.error || 'Validation failed');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('tool', resolvedParams.slug);

      if (file) {
        formData.append('file', file);
      }

      if (url) {
        formData.append('url', url);
      }

      // Add options
      Object.entries(options).forEach(([key, value]) => {
        formData.append(key, String(value));
      });

      const response = await fetch('/api/media', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Processing failed');
      }

      const contentType = response.headers.get('content-type');

      if (contentType?.includes('application/json')) {
        const data = await response.json();
        setResult(data);
      } else if (contentType?.includes('text')) {
        const text = await response.text();
        setResult({ content: text, type: 'text' });
      } else {
        // Binary file
        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = `output${getFileExtension(tool.outputType)}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(downloadUrl);
        document.body.removeChild(a);
        setResult({ type: 'file', message: 'File downloaded successfully' });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <HomeHeader />
      <main className="min-h-screen bg-gray-50 flex flex-col">
        <div className="flex-1">
      {/* Animated Gradient Header */}
      <div className="relative bg-gradient-to-r from-pink-600 via-rose-600 to-pink-700 overflow-hidden min-h-[280px] flex flex-col justify-between py-12 px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 flex items-center gap-2 text-white text-sm mb-6"
        >
          <Link href="/" className="hover:opacity-80 transition">Home</Link>
          <ChevronRight size={16} />
          <Link href="/tools/video" className="hover:opacity-80 transition">Video Tools</Link>
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
              <span className="text-2xl">🎥</span>
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">{tool.title}</h1>
              <p className="text-white text-lg opacity-95 max-w-2xl">{tool.description}</p>
              <div className="mt-4 flex items-center gap-3">
                <span className="inline-block text-white text-xs font-semibold px-4 py-1.5 rounded-full" style={{ backgroundColor: '#B90A45' }}>
                  {tool.category}
                </span>
                <span className="inline-block text-white text-xs font-semibold px-4 py-1.5 rounded-full" style={{ backgroundColor: '#B90A45' }}>
                  Engine: {tool.engine}
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
          {/* Left Column - Upload & Configure (Sticky) */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="md:col-span-1"
          >
            <div className="sticky top-4 space-y-6">
              {/* Upload Card */}
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-pink-50 to-rose-50 px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Configure</h2>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                  {/* File/URL Input */}
                  <div className="space-y-4">
                    {(tool.inputMethod === 'file' || tool.inputMethod === 'both') && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Upload {tool.inputMethod === 'both' ? 'File (or use URL below)' : 'File'}
                        </label>
                        <div
                          onClick={() => fileInputRef.current?.click()}
                          className="border-2 border-dashed border-pink-300 rounded-lg p-6 text-center cursor-pointer hover:border-pink-500 hover:bg-pink-50 transition"
                        >
                          <div className="text-gray-600">
                            <p className="text-sm font-medium mb-1">
                              {file ? file.name : 'Click to upload'}
                            </p>
                            <p className="text-xs text-gray-500">
                              {tool.accepts.join(', ')}
                            </p>
                          </div>
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept={tool.accepts.join(',')}
                            onChange={handleFileChange}
                            className="hidden"
                          />
                        </div>
                      </div>
                    )}

                    {(tool.inputMethod === 'url' || tool.inputMethod === 'both') && (
                      <div>
                        <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-2">
                          {tool.inputMethod === 'both' ? 'Or enter URL' : 'Enter URL'}
                        </label>
                        <input
                          id="url"
                          type="text"
                          value={url}
                          onChange={handleUrlChange}
                          placeholder="https://example.com/video.mp4"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-sm"
                        />
                      </div>
                    )}
                  </div>

                  {/* Tool Options */}
                  {tool.options.length > 0 && (
                    <div className="border-t border-gray-200 pt-4">
                      <h3 className="text-sm font-semibold text-gray-900 mb-3">Options</h3>
                      <div className="space-y-3">
                        {tool.options.map((option) => (
                          <div key={option.id}>
                            <label htmlFor={option.id} className="block text-xs font-medium text-gray-700 mb-1">
                              {option.label}
                              {option.required && <span className="text-red-500">*</span>}
                            </label>

                            {option.type === 'select' && (
                              <select
                                id={option.id}
                                value={options[option.id] ?? option.default ?? ''}
                                onChange={(e) => handleOptionChange(option.id, e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-sm"
                              >
                                {option.options?.map((opt) => (
                                  <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                  </option>
                                ))}
                              </select>
                            )}

                            {option.type === 'number' && (
                              <input
                                id={option.id}
                                type="number"
                                min={option.min}
                                max={option.max}
                                step={option.step}
                                placeholder={option.placeholder}
                                value={options[option.id] ?? option.default ?? ''}
                                onChange={(e) =>
                                  handleOptionChange(option.id, parseInt(e.target.value))
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-sm"
                              />
                            )}

                            {option.type === 'text' && (
                              <input
                                id={option.id}
                                type="text"
                                placeholder={option.placeholder}
                                value={options[option.id] ?? option.default ?? ''}
                                onChange={(e) => handleOptionChange(option.id, e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-sm"
                              />
                            )}

                            {option.type === 'checkbox' && (
                              <div className="flex items-center">
                                <input
                                  id={option.id}
                                  type="checkbox"
                                  checked={options[option.id] ?? option.default ?? false}
                                  onChange={(e) => handleOptionChange(option.id, e.target.checked)}
                                  className="w-4 h-4 text-pink-600 border-gray-300 rounded focus:ring-2 focus:ring-pink-500"
                                />
                                <label htmlFor={option.id} className="ml-2 text-sm text-gray-600">
                                  {option.label}
                                </label>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Error Message */}
                  {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-red-700 text-sm">{error}</p>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-pink-600 hover:bg-pink-700 disabled:bg-gray-400 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2 duration-0"
                  >
                    {loading ? (
                      <>
                        <Loader size={18} className="animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Zap size={18} />
                        Process
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </motion.div>

          {/* Right Column - Info & Results */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="md:col-span-2 space-y-6"
          >
            {/* Info Box */}
            <motion.div
              whileHover={{ y: -4 }}
              className="bg-gradient-to-br from-pink-50 to-rose-50 border border-pink-200 rounded-xl p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-3">About this tool</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                Process your video files with advanced compression and conversion capabilities. All operations are performed instantly and securely, without storing your files.
              </p>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2 text-gray-700">
                  <CheckCircle size={16} className="text-pink-600 flex-shrink-0" />
                  <span>Supported: {tool.accepts.slice(0, 3).join(', ')}...</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <CheckCircle size={16} className="text-pink-600 flex-shrink-0" />
                  <span>Output: {tool.outputType.toUpperCase()}</span>
                </div>
              </div>
            </motion.div>

            {/* Results Section */}
            {result && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-xl shadow-lg border border-gray-200 p-6"
              >
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle size={20} className="text-pink-600" />
                  <h2 className="text-xl font-bold text-gray-900">Success!</h2>
                </div>

                {result.type === 'text' && (
                  <div>
                    <div className="bg-gray-50 border border-gray-300 rounded-lg p-4 max-h-96 overflow-y-auto mb-4">
                      <pre className="text-sm text-gray-800 whitespace-pre-wrap break-words font-mono">
                        {result.content}
                      </pre>
                    </div>
                    <button
                      onClick={() => {
                        const element = document.createElement('a');
                        element.setAttribute(
                          'href',
                          'data:text/plain;charset=utf-8,' + encodeURIComponent(result.content)
                        );
                        element.setAttribute('download', `output.txt`);
                        element.style.display = 'none';
                        document.body.appendChild(element);
                        element.click();
                        document.body.removeChild(element);
                      }}
                      className="w-full px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 font-medium duration-0"
                    >
                      Download Text
                    </button>
                  </div>
                )}

                {result.type === 'file' && (
                  <p className="text-green-700 font-medium">{result.message}</p>
                )}
              </motion.div>
            )}

            {!result && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="bg-white rounded-xl shadow-lg border border-gray-200 p-12 text-center"
              >
                <div className="mb-4 flex justify-center">
                  <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center">
                    <Zap size={32} className="text-pink-600" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Ready to process</h3>
                <p className="text-gray-600">Upload a file or enter a URL and click Process to get started</p>
              </motion.div>
            )}
          </motion.div>
        </motion.div>

        {/* Footer Feature Cards */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.7 }} className="max-w-6xl mx-auto mt-20">
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Zap,
                title: 'Fast Processing',
                description: 'Optimized conversion engines for rapid video processing',
              },
              {
                icon: Shield,
                title: 'Secure & Private',
                description: 'Your files are never stored. All processing is secure.',
              },
              {
                icon: CheckCircle,
                title: 'Multiple Formats',
                description: 'Support for all major video and audio formats',
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                whileHover={{ y: -4 }}
                className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 text-center hover:shadow-xl transition"
              >
                <div className="mb-4 flex justify-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-pink-100 to-rose-100 rounded-full flex items-center justify-center">
                    <feature.icon size={24} className="text-pink-600" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

function getFileExtension(outputType: string): string {
  if (outputType === 'text' || outputType === 'multiple') {
    return '.txt';
  }
  return outputType.startsWith('.') ? outputType : '.' + outputType;
}
