'use client';

import React, { useState, useRef } from 'react';
import { Upload, Download, Loader, AlertCircle, CheckCircle } from 'lucide-react';
import { HomeHeader } from '@/app/components/HomeHeader';
import { Footer } from '@/app/components/Footer';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

interface OCRResult {
  fullText: string;
  textBlocks: any[];
  confidence: number;
  pages: number;
  fileName: string;
}

export default function PDFOCRPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<OCRResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (selectedFile: File) => {
    setError(null);
    setResult(null);

    // Validate file type
    const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'image/tiff'];
    if (!validTypes.includes(selectedFile.type)) {
      setError('Invalid file type. Please upload PDF or image (JPG, PNG, WebP, TIFF)');
      return;
    }

    // Check file size
    if (selectedFile.size > 50 * 1024 * 1024) {
      setError('File too large. Maximum size: 50MB');
      return;
    }

    setFile(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/pdf/ocr', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to process file');
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'OCR processing failed');
      }

      setResult(data.data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to process file';
      setError(message);
      console.error('OCR Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadDOCX = async () => {
    if (!result) return;

    try {
      // Create a simple DOCX from the extracted text
      // For production, use docx library on backend
      const element = document.createElement('a');
      const file = new Blob([result.fullText], { type: 'text/plain' });
      element.href = URL.createObjectURL(file);
      element.download = `${result.fileName.replace(/\.[^.]+$/, '')}-extracted.txt`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    } catch (err) {
      setError('Failed to download file');
    }
  };

  const handleCopyText = () => {
    if (result?.fullText) {
      navigator.clipboard.writeText(result.fullText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col">
      <HomeHeader />

      <div className="flex-1 max-w-5xl mx-auto w-full px-4 py-12">
        {/* Page Header */}
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-4">
            <Link href="/all-tools">
              <span className="text-blue-600 hover:text-blue-700 font-medium">All Tools</span>
            </Link>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600">PDF to Editable Text (OCR)</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">PDF OCR - Extract Editable Text</h1>
          <p className="text-gray-600 text-lg">
            Convert PDF images and scanned documents to editable text using Tesseract.js (100% FREE & Open Source). 
            No accounts, no credits, no limits. Perfect for digitizing documents and forms.
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upload Section */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8"
            >
              {/* File Upload */}
              <div className="mb-8">
                <label className="block text-lg font-semibold text-gray-900 mb-4">Step 1: Upload File</label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="relative border-2 border-dashed border-blue-300 rounded-xl p-12 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,image/jpeg,image/png,image/webp,image/tiff"
                    onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                    className="hidden"
                  />
                  <Upload className="w-12 h-12 text-blue-500 mx-auto mb-3" />
                  <p className="text-gray-700 font-medium mb-1">Click to upload or drag and drop</p>
                  <p className="text-sm text-gray-500">PDF, JPG, PNG, WebP, TIFF (Max 50MB)</p>
                </div>

                {file && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{file.name}</p>
                      <p className="text-sm text-gray-600">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                    <button
                      onClick={() => setFile(null)}
                      className="text-red-600 hover:text-red-700 font-medium"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>

              {/* Process Button */}
              <div className="mb-8">
                <button
                  onClick={handleUpload}
                  disabled={!file || loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-all flex items-center justify-center gap-2"
                >
                  {loading && <Loader className="w-5 h-5 animate-spin" />}
                  {loading ? 'Processing...' : 'Process File'}
                </button>
              </div>

              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3 mb-8"
                >
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-red-900">Error</p>
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </motion.div>
              )}

              {/* Results Section */}
              {result && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-6"
                >
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-green-900">Processing Complete</p>
                      <p className="text-sm text-green-700">
                        Extracted text from {result.pages} page{result.pages !== 1 ? 's' : ''} with {result.confidence}% confidence
                      </p>
                    </div>
                  </div>

                  {/* Extracted Text Preview */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-3">Extracted Text Preview</label>
                    <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 max-h-96 overflow-y-auto">
                      <p className="text-gray-700 whitespace-pre-wrap text-sm leading-relaxed">{result.fullText}</p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={handleCopyText}
                      className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold py-2 px-4 rounded-lg transition-all"
                    >
                      {copied ? '✓ Copied!' : 'Copy Text'}
                    </button>
                    <button
                      onClick={handleDownloadDOCX}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-all flex items-center justify-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Download Text
                    </button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </div>

          {/* Info Section */}
          <div className="space-y-6">
            {/* Features */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl shadow-md border border-gray-200 p-6"
            >
              <h3 className="font-bold text-gray-900 mb-4">Features</h3>
              <ul className="space-y-3 text-sm text-gray-700">
                <li className="flex gap-2">
                  <span className="text-blue-600 font-bold">✓</span>
                  100% FREE - No API keys needed
                </li>
                <li className="flex gap-2">
                  <span className="text-blue-600 font-bold">✓</span>
                  Open source Tesseract.js engine
                </li>
                <li className="flex gap-2">
                  <span className="text-blue-600 font-bold">✓</span>
                  85-90% accuracy (great for documents)
                </li>
                <li className="flex gap-2">
                  <span className="text-blue-600 font-bold">✓</span>
                  Multi-page PDF support
                </li>
                <li className="flex gap-2">
                  <span className="text-blue-600 font-bold">✓</span>
                  Unlimited usage
                </li>
              </ul>
            </motion.div>

            {/* Supported Formats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl shadow-md border border-gray-200 p-6"
            >
              <h3 className="font-bold text-gray-900 mb-4">Supported Formats</h3>
              <div className="space-y-2 text-sm text-gray-700">
                <p>📄 PDF documents</p>
                <p>🖼️ JPEG images</p>
                <p>🖼️ PNG images</p>
                <p>🖼️ WebP images</p>
                <p>🖼️ TIFF images</p>
              </div>
            </motion.div>

            {/* Tips */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-amber-50 rounded-xl border border-amber-200 p-6"
            >
              <h3 className="font-bold text-amber-900 mb-3">Tips for Best Results</h3>
              <ul className="space-y-2 text-sm text-amber-800">
                <li>• Use clear, high-resolution documents (300+ DPI)</li>
                <li>• Avoid heavily skewed or rotated pages</li>
                <li>• Better results with typed text than handwriting</li>
                <li>• For 50+ pages, processing may take 1-2 minutes</li>
                <li>• Max file size: 50MB</li>
              </ul>
            </motion.div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
