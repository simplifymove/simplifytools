'use client';

import React, { useRef, useState, Suspense } from 'react';
import { motion } from 'framer-motion';
import { Upload, Download, AlertCircle, Shield, Loader, ChevronRight } from 'lucide-react';
import dynamic from 'next/dynamic';
import { PdfToolConfig } from '@/app/lib/pdf-tools';

// Dynamic imports with ssr: false for browser-only components
const PdfCropEditor = dynamic(() => import('@/app/components/PdfCropEditor').then(mod => ({ default: mod.PdfCropEditor })), {
  loading: () => <div className="p-4">Loading PDF editor...</div>,
  ssr: false,
});

const PdfPageReorderer = dynamic(() => import('@/app/components/PdfPageReorderer'), {
  loading: () => <div className="p-4">Loading page reorderer...</div>,
  ssr: false,
});

const PdfAnnotator = dynamic(() => import('@/app/components/PdfAnnotator'), {
  loading: () => <div className="p-4">Loading annotator...</div>,
  ssr: false,
});

interface ToolFormProps {
  tool: PdfToolConfig;
  onProcess: (files: File[], options: Record<string, any>, url: string) => Promise<void>;
  loading: boolean;
  error: string | null;
  result: any;
  setError: (error: string | null) => void;
}

export default function ToolForm({ tool, onProcess, loading, error, result, setError }: ToolFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [url, setUrl] = useState('');
  const [options, setOptions] = useState<Record<string, any>>({});
  const [pageOrder, setPageOrder] = useState<number[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [annotations, setAnnotations] = useState<any[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setFiles(tool.inputMode === 'multi-file' ? selectedFiles : [selectedFiles[0]]);
      setError(null);
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value);
    setError(null);
  };

  const handleOptionChange = (optionId: string, value: any) => {
    setOptions(prev => ({ ...prev, [optionId]: value }));
  };

  const handleAnnotationsChange = (newAnnotations: any[]) => {
    setAnnotations(newAnnotations);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onProcess(files, { ...options, pageOrder, annotations }, url);
  };

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col">
      <div className="flex-1">
        {/* Main Content */}
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-12">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Controls Panel */}
            <div>
              <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 hover:shadow-2xl transition-all sticky top-4">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <span className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">⚙️</span>
                  Configure
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* File/URL Input */}
                  <div>
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
                  </div>

                  {/* Trust Reinforcement Badge */}
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3 text-center justify-center">
                    <Shield className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <p className="text-sm text-gray-700">
                      <span className="font-semibold text-green-700">Secure processing</span>
                      <span className="text-gray-500"> • </span>
                      <span>Files auto-deleted after processing</span>
                      <span className="text-gray-500"> • </span>
                      <span>No signup required</span>
                    </p>
                  </div>

                  {/* Tool Options */}
                  {tool.options && tool.options.length > 0 && (
                    <div className="space-y-4">
                      {tool.options.map((option) => {
                        // Handle rearrange-pdf page reorderer
                        if (tool.id === 'rearrange-pdf' && option.id === 'pageOrder') {
                          return (
                            <div key={option.id}>
                              {files.length > 0 ? (
                                <Suspense fallback={
                                  <div className="p-4 bg-gray-50 border-2 border-gray-200 rounded-xl text-center">
                                    <p className="text-gray-600 font-medium">Page Reorderer Loading</p>
                                    <p className="text-sm text-gray-500 mt-2">View and reorder pages from your PDF document.</p>
                                  </div>
                                }>
                                  <PdfPageReorderer
                                    pdfFile={files[0]}
                                    onReorder={(order) => setPageOrder(order)}
                                    onTotalPagesChange={(total) => setTotalPages(total)}
                                  />
                                </Suspense>
                              ) : (
                                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-700">
                                  Upload a PDF to see page preview and reorder.
                                </div>
                              )}
                            </div>
                          );
                        }

                        // Handle visual crop editor
                        if (option.type === 'visual-crop') {
                          return (
                            <div key={option.id}>
                              <Suspense fallback={
                                <div className="p-4 bg-gray-50 border-2 border-gray-200 rounded-xl text-center">
                                  <p className="text-gray-600 font-medium">Visual PDF Crop Editor</p>
                                  <p className="text-sm text-gray-500 mt-2">Upload your PDF to see the visual crop editor and select areas to crop.</p>
                                </div>
                              }>
                                <PdfCropEditor
                                  pdfFile={files.length > 0 ? files[0] : undefined}
                                  onCropChange={(cropBox) => {
                                    handleOptionChange('cropBox', cropBox);
                                  }}
                                />
                              </Suspense>
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
                    </div>
                  )}

                  {/* Error Message */}
                  {error && (
                    <div className="space-y-3">
                      <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl flex gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium text-red-900">Error</p>
                          <p className="text-sm text-red-700">{error}</p>
                        </div>
                      </div>
                    </div>
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
                        {tool.id === 'unlock-pdf' ? 'Unlock PDF' : 
                         tool.id === 'protect-pdf' ? 'Protect PDF' :
                         tool.id === 'merge-pdf' ? 'Merge PDF Files' :
                         tool.id === 'split-pdf' ? 'Split PDF' :
                         tool.id === 'rotate-pdf' ? 'Rotate PDF' :
                         tool.id === 'crop-pdf' ? 'Crop PDF' :
                         `Process ${tool.output.replace('.', '').toUpperCase()}`}
                      </>
                    )}
                  </motion.button>
                </form>
              </div>
            </div>

            {/* Info Panel */}
            <div>
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
                      <span className="inline-block px-3 py-1 bg-pink-100 text-pink-700 text-xs font-semibold rounded-full">
                        Output
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{tool.output}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
