'use client';

import React, { useState } from 'react';
import { ArrowLeft, Download, ChevronRight, Zap, Lock, ImageIcon } from 'lucide-react';
import Link from 'next/link';
import { ImageUploader } from '../../components/ImageUploader';
import { compressImage } from '../../lib/imageTools';

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
    <main className="min-h-screen bg-slate-50">
      <div className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-500 py-12 px-4 md:px-8 text-white">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-2 text-white text-sm mb-6">
            <Link href="/" className="hover:text-white transition">Home</Link>
            <ChevronRight size={16} />
            <Link href="/tools" className="hover:text-white transition">Tools</Link>
            <ChevronRight size={16} />
            <span className="text-white">Image Compressor</span>
          </div>
          <h1 className="text-4xl font-bold mb-2">Image Compressor</h1>
          <p className="text-lg text-white">Reduce image file size while maintaining quality</p>
        </div>
      </div>

      <div className="py-12 px-4 md:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Step 1: Upload Image</h2>
              <ImageUploader
                onFileSelect={handleFileSelect}
                preview={preview}
                onClearPreview={handleClearPreview}
              />
              {originalSize > 0 && (
                <p className="mt-4 text-sm text-gray-600">
                  Original size: {(originalSize / 1024).toFixed(2)} KB
                </p>
              )}
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Step 2: Compression Settings</h2>
              
              <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
                {/* Quality Slider */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Compression Quality: {Math.round(quality * 100)}%
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
                    <span>Highest Quality</span>
                  </div>
                </div>

                {/* Compress Button */}
                <button
                  onClick={handleCompress}
                  disabled={!file || processing}
                  className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {processing ? 'Compressing...' : 'Compress Image'}
                </button>

                {/* Result */}
                {result && (
                  <div className="space-y-4">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <p className="text-sm text-green-800 font-medium mb-3">✓ Compression Complete!</p>
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-700">Original:</span>
                          <span className="font-medium text-gray-900">{(originalSize / 1024).toFixed(2)} KB</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-700">Compressed:</span>
                          <span className="font-medium text-green-600">{(compressedSize / 1024).toFixed(2)} KB</span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-green-500"
                            style={{ width: `${Math.max(20, ((originalSize - compressedSize) / originalSize) * 100)}%` }}
                          />
                        </div>
                        <div className="text-center text-sm font-semibold text-green-600">
                          Size reduced by {reduction}%
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={handleDownload}
                      className="w-full px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 flex items-center justify-center gap-2 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      Download Compressed Image
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Features */}
      <div className="bg-white border-t border-gray-100 py-12 px-4 md:px-8">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-xl bg-blue-50 border border-blue-200 border-l-4 border-l-blue-600">
            <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
              <Zap className="w-5 h-5 text-blue-600" />
              Lightning Fast
            </h3>
            <p className="text-sm text-gray-600">Compress instantly without waiting</p>
          </div>

          <div className="p-6 rounded-xl bg-indigo-50 border border-indigo-200 border-l-4 border-l-indigo-600">
            <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
              <Lock className="w-5 h-5 text-indigo-600" />
              Fully Secure
            </h3>
            <p className="text-sm text-gray-600">All processing happens locally</p>
          </div>

          <div className="p-6 rounded-xl bg-blue-50 border border-blue-200 border-l-4 border-l-blue-700">
            <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-blue-700" />
              High Quality
            </h3>
            <p className="text-sm text-gray-600">Smart compression maintains quality</p>
          </div>
        </div>
      </div>
    </main>
  );
}
