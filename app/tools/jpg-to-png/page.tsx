'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Download, ChevronRight, Zap, Shield, CheckCircle, Loader } from 'lucide-react';
import { ImageUploader } from '../../components/ImageUploader';
import { convertImageFormat } from '../../lib/imageTools';

export default function JpgToPngPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    setError(null);
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
    setError(null);
  };

  const handleConvert = async () => {
    if (!file) return;
    
    setProcessing(true);
    setError(null);
    try {
      const result = await convertImageFormat(file, 'image/png');
      setResult(result.blob);
    } catch (error) {
      setError((error as Error).message || 'Error converting image');
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!result) return;
    const url = URL.createObjectURL(result);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'converted.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Premium Header */}
      <div className="relative bg-gradient-to-r from-orange-500 via-orange-600 to-amber-600 py-12 px-4 md:px-8 overflow-hidden">
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
            <Link href="/tools" className="hover:text-white transition">Tools</Link>
            <ChevronRight size={16} />
            <Link href="/tools?category=Image" className="hover:text-white transition">Image Tools</Link>
            <ChevronRight size={16} />
            <span className="text-white">JPG to PNG</span>
          </div>

          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
              JPG to PNG Converter
            </h1>
            <p className="text-lg text-white/90 max-w-2xl">
              Convert JPG/JPEG images to PNG format with transparency support. High-quality conversion with lossless output.
            </p>
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
          {/* Upload Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 hover:shadow-2xl transition-all sticky top-4">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <span className="w-8 h-8 bg-gradient-to-br from-orange-500 to-amber-600 rounded-lg flex items-center justify-center text-white font-bold">📤</span>
                Upload JPG
              </h2>

              <div className="space-y-6">
                {/* Upload Component */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  <ImageUploader
                    onFileSelect={handleFileSelect}
                    preview={preview}
                    onClearPreview={handleClearPreview}
                    accept="image/jpeg"
                  />
                </motion.div>

                {/* Info Box */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl border-2 border-orange-200"
                >
                  <p className="text-sm text-orange-900">
                    <strong>PNG Advantages:</strong> Lossless compression, transparency support, perfect for graphics and web images
                  </p>
                </motion.div>

                {/* Error Message */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-4 bg-red-50 border-2 border-red-200 rounded-xl"
                  >
                    <p className="text-sm text-red-700">❌ {error}</p>
                  </motion.div>
                )}

                {/* Convert Button */}
                <motion.button
                  onClick={handleConvert}
                  disabled={!file || processing}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-orange-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                >
                  {processing ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      Converting...
                    </>
                  ) : (
                    '✨ Convert to PNG'
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* Preview Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 hover:shadow-2xl transition-all">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <span className="w-8 h-8 bg-gradient-to-br from-orange-500 to-amber-600 rounded-lg flex items-center justify-center text-white font-bold">📥</span>
                Download
              </h2>

              {result ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-4"
                >
                  <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border-2 border-green-200">
                    <div className="flex items-center gap-3 text-green-700 mb-3">
                      <CheckCircle className="w-6 h-6" />
                      <span className="font-semibold">Conversion Complete!</span>
                    </div>
                    <p className="text-sm text-green-600">Your PNG file is ready to download</p>
                  </div>

                  <motion.button
                    onClick={handleDownload}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-green-500/30 flex items-center justify-center gap-2 transition-all"
                  >
                    <Download className="w-5 h-5" />
                    Download PNG
                  </motion.button>
                </motion.div>
              ) : (
                <div className="h-64 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl flex items-center justify-center border-2 border-dashed border-gray-300">
                  <div className="text-center">
                    <div className="text-4xl mb-3">📷</div>
                    <p className="text-gray-500 font-medium">Upload a JPG image to convert</p>
                    <p className="text-gray-400 text-sm mt-1">The preview will appear here</p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Footer Features */}
      <motion.div
        className="mt-12 grid md:grid-cols-3 gap-6 max-w-6xl mx-auto px-4 md:px-8 pb-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <motion.div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-l-orange-500 hover:shadow-xl transition-all" whileHover={{ y: -4 }}>
          <h3 className="font-bold text-gray-900 mb-3 text-lg flex items-center gap-2">
            <Zap className="w-5 h-5 text-orange-500" />
            Instant Conversion
          </h3>
          <p className="text-sm text-gray-600">
            Convert your JPG images to PNG in seconds. Fast processing without quality loss.
          </p>
        </motion.div>

        <motion.div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-l-amber-500 hover:shadow-xl transition-all" whileHover={{ y: -4 }}>
          <h3 className="font-bold text-gray-900 mb-3 text-lg flex items-center gap-2">
            <Shield className="w-5 h-5 text-amber-500" />
            Privacy Protected
          </h3>
          <p className="text-sm text-gray-600">
            Your files are processed securely and automatically deleted after conversion.
          </p>
        </motion.div>

        <motion.div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-l-orange-600 hover:shadow-xl transition-all" whileHover={{ y: -4 }}>
          <h3 className="font-bold text-gray-900 mb-3 text-lg flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-orange-600" />
            Lossless Quality
          </h3>
          <p className="text-sm text-gray-600">
            PNG format preserves image quality with transparency and lossless compression.
          </p>
        </motion.div>
      </motion.div>
    </main>
  );
}
