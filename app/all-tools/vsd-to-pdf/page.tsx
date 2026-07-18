'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Download, ChevronRight, Loader, FileText, X } from 'lucide-react';
import { ImageUploader } from '../../components/ImageUploader';
import { HomeHeader } from '../../components/HomeHeader';
import { Footer } from '../../components/Footer';
import { uploadBrowserDownloadResult } from "@/app/lib/download-result-client";
import { useRouter } from "next/navigation";

export default function VsdToPdfPage() {
    const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [pageSize, setPageSize] = useState('A4');
  const [orientation, setOrientation] = useState('portrait');
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [resultFileName, setResultFileName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    setError(null);
    setPreview('vsd-selected');
  };

  const handleClearPreview = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setError(null);
  };

  const handleConvert = async () => {
    if (!file) return;
    
    setProcessing(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('config', JSON.stringify({ 
        from_format: 'vsd',
        to_format: 'pdf',
        options: {
          pageSize,
          orientation
        }
      }));

      const response = await fetch('/api/convert', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Conversion failed');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setResult(url);
      setResultFileName(`diagram.pdf`);
    } catch (err) {
      setError((err as Error).message || 'Error converting file');
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = async () => {

      if (!result || !resultFileName) return;

      const blob = await fetch(result).then((response) => response.blob());

      const downloadResult = await uploadBrowserDownloadResult({
        blob,
        toolSlug: "vsd-to-pdf",
        originalName: resultFileName,
        outputName: resultFileName,
      });

      router.push(downloadResult.downloadPageUrl);
  };

  return (
    <>
      <HomeHeader />
      <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex flex-col">
        {/* Hero Header */}
        <div className="relative bg-gradient-to-r from-red-600 to-orange-600 py-16 px-4 md:px-8 overflow-hidden">
          <div className="max-w-6xl mx-auto relative z-10">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-white/90 text-sm mb-6">
              <Link href="/" className="hover:text-white transition">Home</Link>
              <ChevronRight size={16} />
              <Link href="/all-tools" className="hover:text-white transition">All Tools</Link>
              <ChevronRight size={16} />
              <span>VSD to PDF</span>
            </div>

            {/* Title Section */}
            <div className="flex items-start gap-4">
              <div className="p-3 bg-white/20 rounded-lg">
                <FileText size={32} className="text-white" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">VSD to PDF Converter</h1>
                <p className="text-lg text-white/90">Convert Visio VSD/VSDX diagrams to PDF format. Perfect for sharing, printing, and archiving your technical drawings and flowcharts.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 py-12 px-4 md:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Upload Section - Left (2 cols) */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Step 1: Upload Visio File</h2>
                  
                  {!file ? (
                    <ImageUploader
                      onFileSelect={handleFileSelect}
                      preview={null}
                      onClearPreview={handleClearPreview}
                      accept=".vsd,.vsdx"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-4">
                      <div className="relative p-8 bg-gradient-to-br from-red-50 to-orange-50 rounded-lg border-2 border-red-200 w-full">
                        <div className="flex flex-col items-center gap-3">
                          <div className="p-4 bg-red-100 rounded-lg">
                            <FileText className="w-12 h-12 text-red-600" />
                          </div>
                          <div className="text-center">
                            <p className="text-sm text-gray-600">Selected File</p>
                            <p className="font-semibold text-gray-900 break-all">{file.name}</p>
                            <p className="text-xs text-gray-500 mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                          </div>
                        </div>
                        <button
                          onClick={handleClearPreview}
                          className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {/* Industry Info */}
                  <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <h4 className="font-semibold text-blue-900 mb-2">⚡ Fast Conversion</h4>
                      <p className="text-sm text-blue-800">Industry-standard LibreOffice engine for accurate rendering</p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <h4 className="font-semibold text-green-900 mb-2">🎯 Accurate Layout</h4>
                      <p className="text-sm text-green-800">Preserves all diagrams, shapes, and formatting from source</p>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                      <h4 className="font-semibold text-purple-900 mb-2">📄 Print Ready</h4>
                      <p className="text-sm text-purple-800">Fully formatted PDFs ready for printing and sharing</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Controls - Right (sticky sidebar) */}
              <div className="lg:col-span-1">
                <div className="sticky top-4 space-y-4">
                  {/* Options */}
                  <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <h3 className="font-semibold text-gray-900 mb-4">Conversion Settings</h3>
                    
                    {/* Page Size */}
                    <div className="mb-6">
                      <label className="text-sm font-medium text-gray-700 block mb-2">
                        Page Size
                      </label>
                      <select
                        value={pageSize}
                        onChange={(e) => setPageSize(e.target.value)}
                        disabled={processing}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent disabled:bg-gray-100"
                      >
                        <option value="A0">A0 (841 × 1189 mm)</option>
                        <option value="A1">A1 (594 × 841 mm)</option>
                        <option value="A2">A2 (420 × 594 mm)</option>
                        <option value="A3">A3 (297 × 420 mm)</option>
                        <option value="A4">A4 (210 × 297 mm) - Recommended</option>
                        <option value="A5">A5 (148 × 210 mm)</option>
                        <option value="Letter">Letter (8.5 × 11 in)</option>
                        <option value="Tabloid">Tabloid (11 × 17 in)</option>
                      </select>
                      <p className="text-xs text-gray-500 mt-1">Choose standard paper size</p>
                    </div>

                    {/* Orientation */}
                    <div className="mb-6">
                      <label className="text-sm font-medium text-gray-700 block mb-2">
                        Orientation
                      </label>
                      <div className="flex gap-3">
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="orientation"
                            value="portrait"
                            checked={orientation === 'portrait'}
                            onChange={(e) => setOrientation(e.target.value)}
                            disabled={processing}
                            className="w-4 h-4 text-red-500 cursor-pointer"
                          />
                          <span className="ml-2 text-sm text-gray-700 cursor-pointer">Portrait</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="orientation"
                            value="landscape"
                            checked={orientation === 'landscape'}
                            onChange={(e) => setOrientation(e.target.value)}
                            disabled={processing}
                            className="w-4 h-4 text-red-500 cursor-pointer"
                          />
                          <span className="ml-2 text-sm text-gray-700 cursor-pointer">Landscape</span>
                        </label>
                      </div>
                    </div>

                    {/* Convert Button */}
                    <button
                      onClick={handleConvert}
                      disabled={!file || processing}
                      className="w-full bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2"
                    >
                      {processing ? (
                        <>
                          <Loader size={18} className="animate-spin" />
                          Converting...
                        </>
                      ) : (
                        'Convert to PDF'
                      )}
                    </button>
                  </div>

                  {/* Result */}
                  {result && (
                    <div className="bg-white rounded-lg border border-green-200 bg-green-50 p-4">
                      <h3 className="font-semibold text-green-900 mb-3">✓ Conversion Complete</h3>
                      <button
                        onClick={handleDownload}
                        className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 rounded-lg transition flex items-center justify-center gap-2"
                      >
                        <Download size={18} />
                        Download PDF
                      </button>
                    </div>
                  )}

                  {/* Error */}
                  {error && (
                    <div className="bg-white rounded-lg border border-red-200 bg-red-50 p-4">
                      <h3 className="font-semibold text-red-900 mb-2">✗ Error</h3>
                      <p className="text-sm text-red-800 break-words">{error}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

