'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Download, ChevronRight, Loader, FileUp } from 'lucide-react';
import { ImageUploader } from '../../components/ImageUploader';
import { compressImage } from '../../lib/imageTools';
import { HomeHeader } from '../../components/HomeHeader';
import { Footer } from '../../components/Footer';

export default function CompressImagePage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [quality, setQuality] = useState(0.7);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<Blob | null>(null);
  const [originalSize, setOriginalSize] = useState(0);
  const [compressedSize, setCompressedSize] = useState(0);

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    setOriginalSize(selectedFile.size);
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleClearPreview = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setOriginalSize(0);
    setCompressedSize(0);
  };

  const handleCompress = async () => {
    if (!file) return;
    
    setProcessing(true);
    try {
      const result = await compressImage(file, quality);
      setCompressedSize(result.blob.size);
      setResult(result.blob);
    } catch (error) {
      alert('Error compressing image: ' + (error as Error).message);
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!result) return;
    const url = URL.createObjectURL(result);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'compressed.jpg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const reduction = originalSize > 0 ? (((originalSize - compressedSize) / originalSize) * 100).toFixed(1) : 0;

  return (
    <>
      <HomeHeader />
      <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex flex-col">
        {/* Hero Header */}
        <div className="relative bg-orange-500 py-16 px-4 md:px-8 overflow-hidden">
          <div className="max-w-6xl mx-auto relative z-10">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-white/90 text-sm mb-6">
              <Link href="/" className="hover:text-white transition">Home</Link>
              <ChevronRight size={16} />
              <Link href="/all-tools" className="hover:text-white transition">All Tools</Link>
              <ChevronRight size={16} />
              <span>Image Compressor</span>
            </div>

            {/* Title Section */}
            <div className="flex items-start gap-4">
              <div className="p-3 bg-white/20 rounded-lg">
                <FileUp size={32} className="text-white" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">Image Compressor</h1>
                <p className="text-lg text-white/90">Reduce image file size while maintaining visual quality with adjustable compression settings.</p>
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
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Step 1: Upload Image</h2>
                  <ImageUploader
                    onFileSelect={handleFileSelect}
                    preview={preview}
                    onClearPreview={handleClearPreview}
                  />
                  {originalSize > 0 && (
                    <p className="mt-4 text-sm text-gray-600">
                      Original size: <span className="font-semibold text-gray-900">{(originalSize / 1024).toFixed(2)} KB</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Controls - Right (sticky sidebar) */}
              <div className="lg:col-span-1">
                <div className="sticky top-4 space-y-4">
                  {/* Options */}
                  <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <h3 className="font-semibold text-gray-900 mb-4">Compression Settings</h3>
                    
                    {/* Quality Slider */}
                    <div>
                      <label className="text-sm font-medium text-gray-700 block mb-2">
                        Quality: {Math.round(quality * 100)}%
                      </label>
                      <input
                        type="range"
                        min="0.1"
                        max="1"
                        step="0.05"
                        value={quality}
                        onChange={(e) => setQuality(parseFloat(e.target.value))}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-2">
                        <span>Smallest</span>
                        <span>Balanced</span>
                        <span>Best</span>
                      </div>
                    </div>
                  </div>

                  {/* Compress Button */}
                  <button
                    onClick={handleCompress}
                    disabled={!file || processing}
                    className="w-full py-3 px-6 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2"
                  >
                    {processing ? (
                      <>
                        <Loader size={20} className="animate-spin" />
                        Compressing...
                      </>
                    ) : (
                      'Compress Image'
                    )}
                  </button>

                  {/* Download Button */}
                  {result && (
                    <button
                      onClick={handleDownload}
                      className="w-full py-3 px-6 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2"
                    >
                      <Download size={20} />
                      Download Image
                    </button>
                  )}

                  {/* Result Box */}
                  {result && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <h4 className="font-semibold text-green-900 mb-3">✓ Compression Complete!</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-700">Original:</span>
                          <span className="font-medium text-gray-900">{(originalSize / 1024).toFixed(2)} KB</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-700">Compressed:</span>
                          <span className="font-medium text-green-600">{(compressedSize / 1024).toFixed(2)} KB</span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden mt-2">
                          <div
                            className="h-full bg-green-500"
                            style={{ width: `${Math.max(20, ((originalSize - compressedSize) / originalSize) * 100)}%` }}
                          />
                        </div>
                        <div className="text-center font-semibold text-green-600 text-xs">
                          Reduced by {reduction}%
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Info Box */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-900 mb-2">About</h3>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Instant compression in your browser</li>
                      <li>• Adjustable quality settings</li>
                      <li>• Maintains visual quality</li>
                      <li>• Secure - files never uploaded</li>
                    </ul>
                  </div>
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







