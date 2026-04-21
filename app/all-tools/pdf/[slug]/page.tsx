'use client';

import React, { useState, useRef, Suspense } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { getPdfToolById } from '@/app/lib/pdf-tools';
import { validatePdfInput } from '@/app/lib/pdf-validation';
import type { PdfToolConfig } from '@/app/lib/pdf-tools';
import { Upload, Download, AlertCircle, Loader, ChevronRight, CheckCircle, Zap, Shield } from 'lucide-react';
import { HomeHeader } from '@/app/components/HomeHeader';
import { Footer } from '@/app/components/Footer';

// Dynamically import PDF components to avoid DOMMatrix errors
const PdfCropEditor = dynamic(() => import('@/app/components/PdfCropEditor').then(mod => ({ default: mod.PdfCropEditor })), {
  loading: () => <div className="p-4">Loading PDF editor...</div>,
  ssr: false,
});

const PdfAnnotator = dynamic(() => import('@/app/components/PdfAnnotator'), {
  loading: () => <div className="p-4">Loading PDF annotator...</div>,
  ssr: false,
});

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default function PdfToolPage({ params }: PageProps) {
  // Unwrap params promise
  const resolvedParams = React.use(params);
  const tool = getPdfToolById(resolvedParams.slug);

  // Special handling for annotate-pdf
  if (tool && resolvedParams.slug === 'annotate-pdf') {
    return <AnnotatePdfPage tool={tool} />;
  }

  const [files, setFiles] = useState<File[]>([]);
  const [url, setUrl] = useState('');
  const [options, setOptions] = useState<Record<string, any>>(() => {
    // Initialize options with default values from tool config
    const defaults: Record<string, any> = {};
    if (tool && tool.options) {
      for (const option of tool.options) {
        if (option.default !== undefined) {
          defaults[option.id] = option.default;
        }
      }
    }
    return defaults;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!tool) {
    return (
      <>
        <HomeHeader />
        <main className="min-h-screen bg-slate-50 flex flex-col">
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Tool Not Found</h1>
              <p className="text-gray-600">The requested PDF tool could not be found.</p>
            </div>
          </div>
        </main>
        <Footer />
      </>
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
      const errorMsg = err instanceof Error ? err.message : 'An error occurred';
      
      // Try to parse debug info from error message
      try {
        const debugInfo = JSON.parse(errorMsg);
        setError(debugInfo.error || errorMsg);
        if (debugInfo.debug) {
          // Store debug info and show it with error
          setResult({ 
            type: 'debug', 
            message: 'Processing encountered an issue. Check debug info below.',
            debug: debugInfo.debug 
          });
        }
      } catch {
        setError(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <HomeHeader />
      <main className="min-h-screen bg-slate-50 flex flex-col">
        <div className="flex-1">
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
            <Link href="/all-tools/pdf" className="hover:text-white transition">PDF Tools</Link>
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
                    {tool.options.map((option) => {
                      // Handle visual crop editor
                      if (option.type === 'visual-crop') {
                        return (
                          <div key={option.id}>
                            <PdfCropEditor
                              pdfFile={files.length > 0 ? files[0] : undefined}
                              onCropChange={(cropBox) => {
                                handleOptionChange('cropBox', cropBox);
                              }}
                            />
                          </div>
                        );
                      }

                      // Skip the visualCrop option itself
                      if (option.id === 'visualCrop') {
                        return null;
                      }

                      return (
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
                      );
                    })}
                  </motion.div>
                )}

                {/* Error Message */}
                {error && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-3"
                  >
                    <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl flex gap-3">
                      <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-red-900">Error</p>
                        <p className="text-sm text-red-700">{error}</p>
                      </div>
                    </div>
                    
                    {/* Debug Logs */}
                    {result?.debug && (
                      <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-xl">
                        <p className="font-medium text-blue-900 mb-2">Debug Information</p>
                        <pre className="text-xs text-blue-700 overflow-auto max-h-40 whitespace-pre-wrap break-words font-mono bg-white p-2 rounded border border-blue-100">
                          {result.debug}
                        </pre>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* Success Message */}
                {result && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-3"
                  >
                    <div className="p-4 bg-green-50 border-2 border-green-200 rounded-xl flex gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-green-900">Success</p>
                        <p className="text-sm text-green-700">{result.message}</p>
                      </div>
                    </div>
                    
                    {/* Debug Logs */}
                    {result.debug && (
                      <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-xl">
                        <p className="font-medium text-blue-900 mb-2">Debug Information</p>
                        <pre className="text-xs text-blue-700 overflow-auto max-h-40 whitespace-pre-wrap break-words font-mono bg-white p-2 rounded border border-blue-100">
                          {result.debug}
                        </pre>
                      </div>
                    )}
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
        </div>
      </main>
      <Footer />
    </>
  );
}

// Special component for Annotate PDF tool
function AnnotatePdfPage({ tool }: { tool: PdfToolConfig }) {
  const [files, setFiles] = useState<File[]>([]);
  const [annotations, setAnnotations] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length > 0) {
      setFiles(selectedFiles);
      setSaveError('');
      setSaveSuccess('');
    }
  };

  const handleAnnotationsChange = (newAnnotations: any[]) => {
    setAnnotations(newAnnotations);
  };

  const handleDownloadAnnotated = async () => {
    if (files.length === 0) {
      setSaveError('Please upload a PDF first');
      return;
    }

    setSaving(true);
    setSaveError('');
    setSaveSuccess('');

    try {
      const formData = new FormData();
      formData.append('tool', tool.id);
      formData.append('file', files[0]);
      formData.append('options', JSON.stringify({
        annotations: annotations,
      }));

      const response = await fetch('/api/pdf', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save annotations');
      }

      // Download the annotated PDF
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `annotated_${files[0].name}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(downloadUrl);
      document.body.removeChild(a);

      setSaveSuccess('PDF with annotations downloaded successfully!');
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'An error occurred';
      setSaveError(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <HomeHeader />
      <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex flex-col">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-700 py-12 px-4 md:px-8 overflow-hidden">
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

          <div className="max-w-7xl mx-auto relative z-10">
            <div className="flex items-center gap-2 text-white/80 text-sm mb-6">
              <Link href="/" className="hover:text-white transition">Home</Link>
              <ChevronRight size={16} />
              <Link href="/all-tools/pdf" className="hover:text-white transition">PDF Tools</Link>
              <ChevronRight size={16} />
              <span className="text-white">{tool.title}</span>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
                ✏️ {tool.title}
              </h1>
              <p className="text-lg text-white/90 max-w-2xl">
                {tool.description}
              </p>
            </motion.div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 max-w-7xl mx-auto w-full px-4 md:px-8 py-8">
          <div className="grid md:grid-cols-1 gap-8">
            {/* Upload Section */}
            {files.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="bg-white rounded-2xl shadow-xl p-12 border border-gray-100">
                  <h2 className="text-2xl font-bold text-gray-900 mb-8">📄 Upload PDF to Annotate</h2>

                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-purple-300 rounded-2xl p-12 text-center cursor-pointer hover:border-purple-500 hover:bg-purple-50 transition-all group"
                  >
                    <Upload className="w-16 h-16 text-purple-500 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                    <p className="text-lg font-semibold text-gray-700 mb-2">
                      Click to upload or drag & drop
                    </p>
                    <p className="text-sm text-gray-500">
                      PDF files up to 100MB
                    </p>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>
              </motion.div>
            )}

            {/* Annotator Section */}
            {files.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
              >
                <div className="p-4 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">📝 Annotation Tools</h2>
                      <p className="text-sm text-gray-600">
                        File: <span className="font-semibold">{files[0].name}</span>
                      </p>
                    </div>
                    <button
                      onClick={() => setFiles([])}
                      className="px-4 py-2 text-sm bg-gray-200 hover:bg-gray-300 rounded-lg transition"
                    >
                      Change File
                    </button>
                  </div>
                </div>

                <div style={{ height: '600px', overflow: 'hidden' }}>
                  <PdfAnnotator
                    file={files[0]}
                    onAnnotationsChange={handleAnnotationsChange}
                  />
                </div>
              </motion.div>
            )}

            {/* Download Section */}
            {files.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100"
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-4">⬇️ Save & Download</h2>

                {saveError && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl flex gap-3"
                  >
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-red-900">Error</p>
                      <p className="text-sm text-red-700">{saveError}</p>
                    </div>
                  </motion.div>
                )}

                {saveSuccess && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mb-6 p-4 bg-green-50 border-2 border-green-200 rounded-xl flex gap-3"
                  >
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-green-900">Success</p>
                      <p className="text-sm text-green-700">{saveSuccess}</p>
                    </div>
                  </motion.div>
                )}

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl mb-6">
                  <p className="text-sm text-blue-700">
                    <strong>Total Annotations:</strong> {annotations.length}
                  </p>
                </div>

                <motion.button
                  onClick={handleDownloadAnnotated}
                  disabled={saving || annotations.length === 0}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-700 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-purple-600/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Download className="w-5 h-5" />
                      Download Annotated PDF
                    </>
                  )}
                </motion.button>

                {annotations.length === 0 && (
                  <p className="text-sm text-gray-500 mt-4 text-center">
                    Add annotations to enable download
                  </p>
                )}
              </motion.div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
