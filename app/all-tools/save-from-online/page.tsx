'use client';

import React, { useState } from 'react';
import { Download, Loader2, CheckCircle, AlertCircle, Globe, FileText, Image as ImageIcon, Music, Archive, Video } from 'lucide-react';
import { motion } from 'framer-motion';
import { HomeHeader } from '@/app/components/HomeHeader';
import { Footer } from '@/app/components/Footer';

export default function SaveFromOnline() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [downloadedFile, setDownloadedFile] = useState<any>(null);
  const [error, setError] = useState('');

  const handleDownload = async () => {
    if (!url.trim()) {
      setError('Please enter a URL');
      return;
    }

    setLoading(true);
    setError('');
    setStatus('Starting download...');

    try {
      const response = await fetch('/api/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Download failed');
      }

      // Get the blob from the response
      const blob = await response.blob();
      
      // Extract filename from Content-Disposition header
      const contentDisposition = response.headers.get('Content-Disposition');
      let fileName = 'download';
      if (contentDisposition) {
        const matches = contentDisposition.match(/filename="([^"]+)"/);
        if (matches && matches[1]) {
          fileName = matches[1];
        }
      }

      setStatus('Download complete!');
      setDownloadedFile({
        filename: fileName,
        size: blob.size > 0 ? `${(blob.size / 1024 / 1024).toFixed(2)} MB` : `${(blob.size / 1024).toFixed(2)} KB`,
        mimeType: blob.type,
      });

      // Create blob URL and trigger download
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setStatus('');
    } finally {
      setLoading(false);
    }
  };

  const platforms = [
    { name: 'YouTube', icon: Video, color: 'text-red-500' },
    { name: 'TikTok', icon: Video, color: 'text-black' },
    { name: 'Instagram', icon: ImageIcon, color: 'text-pink-500' },
    { name: 'Facebook', icon: Video, color: 'text-blue-600' },
    { name: 'Twitter/X', icon: Globe, color: 'text-gray-900' },
    { name: 'Vimeo', icon: Video, color: 'text-blue-500' },
  ];

  const formats = [
    { category: 'Videos', types: 'MP4, WebM, MKV, AVI', icon: Video, color: 'from-pink-500 to-rose-500' },
    { category: 'Images', types: 'JPG, PNG, GIF, WebP, SVG', icon: ImageIcon, color: 'from-orange-500 to-yellow-500' },
    { category: 'Documents', types: 'PDF, DOCX, PPTX, XLSX', icon: FileText, color: 'from-blue-500 to-purple-500' },
    { category: 'Audio', types: 'MP3, WAV, M4A, AAC', icon: Music, color: 'from-green-500 to-teal-500' },
    { category: 'Archives', types: 'ZIP, RAR, 7Z, TAR', icon: Archive, color: 'from-yellow-500 to-orange-500' },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* HEADER */}
      <HomeHeader />

      {/* HERO SECTION */}
      <section className="relative bg-linear-to-br from-green-50 via-emerald-50 to-teal-50 py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-green-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-teal-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 md:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h1 className="text-5xl md:text-6xl font-bold text-green-600 mb-4">
              Save From Online
            </h1>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
              Download any file from any URL - videos, images, PDFs, documents, and more. 
              <br className="hidden md:block" />
              Support for YouTube, TikTok, Instagram, Facebook, and 100+ other platforms.
            </p>
          </motion.div>

          {/* MAIN DOWNLOADER */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="bg-white rounded-2xl shadow-2xl p-8 md:p-10 max-w-3xl mx-auto mb-16"
          >
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">Enter URL to Download</label>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleDownload()}
                  placeholder="https://youtube.com/watch?v=... or any direct file URL"
                  className="w-full px-5 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all text-gray-900 placeholder-gray-500"
                />
                <p className="text-xs text-green-600 mt-2">
                  ✓ Supports YouTube, TikTok, Instagram, Facebook, Twitter, Vimeo, and direct file URLs
                </p>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleDownload}
                disabled={loading}
                className="w-full bg-linear-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-4 px-6 rounded-xl transition-all flex items-center justify-center gap-2 text-lg shadow-lg"
              >
                {loading ? <Loader2 className="animate-spin" size={24} /> : <Download size={24} />}
                {loading ? 'Downloading...' : 'Download File'}
              </motion.button>
            </div>

            {status && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 p-4 bg-green-50 border-2 border-green-200 rounded-xl flex items-center gap-3"
              >
                <CheckCircle className="text-green-600 shrink-0" size={24} />
                <span className="text-green-800 font-medium">{status}</span>
              </motion.div>
            )}

            {error && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl flex items-center gap-3"
              >
                <AlertCircle className="text-red-600 shrink-0" size={24} />
                <span className="text-red-800 font-medium">{error}</span>
              </motion.div>
            )}

            {downloadedFile && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 p-4 bg-blue-50 border-2 border-blue-200 rounded-xl"
              >
                <p className="text-sm font-bold text-blue-900 mb-3">✓ Downloaded Successfully!</p>
                <div className="space-y-2">
                  <p className="text-sm text-blue-800"><span className="font-semibold">Filename:</span> {downloadedFile.filename}</p>
                  <p className="text-sm text-blue-800"><span className="font-semibold">Size:</span> {downloadedFile.size}</p>
                  <p className="text-sm text-blue-800"><span className="font-semibold">Type:</span> {downloadedFile.mimeType}</p>
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </section>

      {/* SUPPORTED PLATFORMS */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-16">
        <h2 className="text-3xl font-bold text-gray-900 mb-4 text-center">Supported Platforms</h2>
        <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">Download from popular social media platforms and streaming services</p>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {platforms.map((platform, idx) => (
            <motion.div
              key={idx}
              whileHover={{ scale: 1.05 }}
              className="bg-linear-to-br from-gray-50 to-gray-100 rounded-xl p-4 text-center border-2 border-gray-200 hover:border-gray-300 transition-all"
            >
              <platform.icon className={`${platform.color} mx-auto mb-2`} size={24} />
              <p className="text-sm font-semibold text-gray-900">{platform.name}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* SUPPORTED FORMATS */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4 text-center">Supported Formats</h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">Download any file format you need</p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6">
            {formats.map((format, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className={`bg-linear-to-br ${format.color} rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow`}
              >
                <format.icon size={32} className="mb-3" />
                <h3 className="font-bold text-lg mb-2">{format.category}</h3>
                <p className="text-sm opacity-90">{format.types}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <Footer />
    </div>
  );
}

