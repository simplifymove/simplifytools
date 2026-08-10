'use client';

import React, { useState } from 'react';
import { Download, Loader2, CheckCircle, AlertCircle, Globe, FileText, Image as ImageIcon, Music, Archive, Video } from 'lucide-react';
import { motion } from 'framer-motion';
import { HomeHeader } from '@/app/components/HomeHeader';
import { Footer } from '@/app/components/Footer';
import { FAQ } from '@/app/components/FAQ';
import Link from 'next/link';

export default function SaveFromOnline() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingFormats, setFetchingFormats] = useState(false);
  const [status, setStatus] = useState('');
  const [downloadedFile, setDownloadedFile] = useState<any>(null);
  const [error, setError] = useState('');
  const [formats, setFormats] = useState<any[]>([]);
  const [selectedFormat, setSelectedFormat] = useState<string>('');
  const [showFormats, setShowFormats] = useState(false);

  // Handle URL input change
  const handleUrlChange = (value: string) => {
    setUrl(value);
    setShowFormats(false);
    setFormats([]);
    setSelectedFormat('');
  };

  const handleFetchFormats = async () => {
    if (!url.trim()) {
      setError('Please enter a URL');
      return;
    }

    // Fetch available formats dynamically
    setFetchingFormats(true);
    setError('');
    setFormats([]);
    setSelectedFormat('');

    try {
      const response = await fetch('/api/download/formats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch formats');
      }

      const data = await response.json();
      setFormats(data.formats || []);
      setShowFormats(data.formats && data.formats.length > 0);
      
      if (data.formats && data.formats.length > 0) {
        setSelectedFormat(data.formats[0].id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch available formats');
      setShowFormats(false);
    } finally {
      setFetchingFormats(false);
    }
  };

  const handleDownload = async () => {
    if (!url.trim()) {
      setError('Please enter a URL');
      return;
    }

    setLoading(true);
    setError('');
    setStatus('Starting download...');

    try {
      const downloadBody: any = { url: url.trim() };
      
      // Pass formatId if we have a selected format
      if (selectedFormat) {
        downloadBody.formatId = selectedFormat;
      }

      const response = await fetch('/api/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(downloadBody),
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
    { name: 'YouTube', icon: Video, color: 'text-red-600' },
    { name: 'TikTok', icon: Video, color: 'text-black' },
    { name: 'Instagram', icon: ImageIcon, color: 'text-pink-500' },
    { name: 'Facebook', icon: Video, color: 'text-blue-600' },
    { name: 'Twitter/X', icon: Globe, color: 'text-gray-900' },
    { name: 'Vimeo', icon: Video, color: 'text-blue-500' },
  ];

  const supportedFormatsData = [
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
              Download Files from Public URLs
            </h1>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
              Download supported files from direct public URLs. Additional public media sources may work when a compatible provider is available.
            </p>
          </motion.div>

          {/* SERVICE STATUS BANNER */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15 }}
            className="max-w-3xl mx-auto mb-8 p-5 bg-blue-50 border-l-4 border-blue-500 rounded-lg shadow-md"
          >
            <div className="flex items-start gap-4">
              <CheckCircle className="text-blue-600 shrink-0 mt-0.5" size={22} />
              <div>
                <h3 className="font-bold text-blue-900 mb-1">Availability varies by source</h3>
                <p className="text-blue-800 text-sm leading-relaxed">
                  Direct public file URLs are supported. Social and streaming sources depend on configured providers and may be unavailable or blocked. Only download content you own or have permission to access.
                </p>
              </div>
            </div>
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
                  onChange={(e) => handleUrlChange(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleDownload()}
                  placeholder="https://example.com/file.mp4 or public file URL"
                  className="w-full px-5 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all text-gray-900 placeholder-gray-500"
                />
                <p className="text-xs text-gray-600 mt-2">
                  ✓ Paste a public file URL and check available formats
                </p>
              </div>

              {!showFormats && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleFetchFormats}
                  disabled={fetchingFormats || !url.trim()}
                  className="w-full bg-linear-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-2 text-base shadow-lg"
                >
                  {fetchingFormats ? <Loader2 className="animate-spin" size={20} /> : <Globe size={20} />}
                  {fetchingFormats ? 'Checking available formats...' : 'Check Available Formats'}
                </motion.button>
              )}

              {showFormats && formats.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-2"
                >
                  <label htmlFor="quality-select" className="block text-sm font-semibold text-gray-900">
                    Select Quality/Resolution
                  </label>
                  <select
                    id="quality-select"
                    value={selectedFormat}
                    onChange={(e) => setSelectedFormat(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all text-gray-900 bg-white cursor-pointer font-medium"
                  >
                    {formats.map((format) => (
                      <option key={format.id} value={format.id}>
                        {format.displayLabel}
                      </option>
                    ))}
                  </select>
                </motion.div>
              )}
              
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
        <h2 className="text-3xl font-bold text-gray-900 mb-4 text-center">Provider-dependent sources</h2>
        <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">These public sources may work when a compatible provider is configured and the source permits access. Availability is not guaranteed.</p>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {platforms.map((platform, idx) => (
            <motion.div
              key={idx}
              whileHover={{ scale: 1.05 }}
              className="bg-linear-to-br from-gray-50 to-gray-100 rounded-xl p-4 text-center border-2 border-gray-200 hover:border-gray-300 transition-all"
            >
              <platform.icon className={`${platform.color} mx-auto mb-2`} size={24} aria-label={`Download from ${platform.name}`} role="img" />
              <p className="text-sm font-semibold text-gray-900">{platform.name}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* SEO CONTENT SECTION */}
      <section className="py-16 px-4 md:px-8 bg-white">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Download a File from a Public URL</h2>
            
            <p className="text-gray-700 mb-6 leading-relaxed">
              Paste a direct public URL for a supported video, image, document, audio file, or archive. Some additional public media pages may work through configured providers, but source restrictions and provider availability can change.
            </p>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="bg-green-50 p-6 rounded-lg border-l-4 border-green-500">
                <h3 className="font-bold text-green-900 mb-2">Direct URL Requests</h3>
                <p className="text-green-800 text-sm">Paste a direct public file URL and request the file without installing desktop software. Processing time depends on the source and file size.</p>
              </div>
              <div className="bg-blue-50 p-6 rounded-lg border-l-4 border-blue-500">
                <h3 className="font-bold text-blue-900 mb-2">🎬 Multiple Formats</h3>
                <p className="text-blue-800 text-sm">Recognized direct file extensions include common video, image, document, audio, and archive formats. The tool downloads the source file; it does not promise format conversion.</p>
              </div>
              <div className="bg-purple-50 p-6 rounded-lg border-l-4 border-purple-500">
                <h3 className="font-bold text-purple-900 mb-2">Provider-Dependent Sources</h3>
                <p className="text-purple-800 text-sm">Additional public sources may work through a compatible provider. A source can fail because of access controls, provider configuration, or platform changes.</p>
              </div>
              <div className="bg-orange-50 p-6 rounded-lg border-l-4 border-orange-500">
                <h3 className="font-bold text-orange-900 mb-2">No Signup Required</h3>
                <p className="text-orange-800 text-sm">No signup is required for the current downloader page. Download success still depends on the source, access rules, file availability, and any provider used for the request.</p>
              </div>
            </div>

            <h3 className="text-2xl font-bold text-gray-900 mb-4">How to Download From Online</h3>
            <ol className="space-y-3 text-gray-700 mb-8">
              <li className="flex gap-3"><span className="font-bold text-green-600">1.</span> <span>Copy a direct public file URL, or a public media URL supported by an available provider</span></li>
              <li className="flex gap-3"><span className="font-bold text-green-600">2.</span> <span>Paste it into our downloader above</span></li>
              <li className="flex gap-3"><span className="font-bold text-green-600">3.</span> <span>Choose your preferred quality or format (optional)</span></li>
              <li className="flex gap-3"><span className="font-bold text-green-600">4.</span> <span>Click "Download File"; the request may fail when the source blocks access or no compatible provider is available</span></li>
            </ol>

            <h3 className="text-2xl font-bold text-gray-900 mb-4">Common Uses for Online Downloading</h3>
            <ul className="space-y-2 text-gray-700 mb-8">
              <li>📹 <strong>Save Your Public Media:</strong> Request a public media URL when the source is supported and you have permission to download it</li>
              <li>🎵 <strong>Save Direct Audio Files:</strong> Download a public audio-file URL in its available source format</li>
              <li>📸 <strong>Save Your Images:</strong> Download a direct public image URL when you own the image or have permission to save it</li>
              <li>💼 <strong>Save Public Documents:</strong> Request a direct public PDF or document URL for later access</li>
              <li>🎬 <strong>Work with Authorized Media:</strong> Save media you own or are permitted to use before continuing with editing tools</li>
              <li>🔍 <strong>Keep Reference Files:</strong> Save authorized public files that you need to access offline</li>
            </ul>

            <div className="bg-blue-50 p-6 rounded-lg border-2 border-blue-200 mb-8">
              <p className="text-sm text-blue-800">
                <strong>Tip:</strong> Use our <Link href="/all-tools/video-tools" className="text-blue-600 font-semibold hover:underline">video tools</Link> to edit downloaded videos, or try our <Link href="/all-tools/image-tools" className="text-blue-600 font-semibold hover:underline">image tools</Link> to enhance downloaded photos. For document conversion, check our <Link href="/all-tools/pdf-tools" className="text-blue-600 font-semibold hover:underline">PDF tools</Link>.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* SUPPORTED FORMATS */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4 text-center">Supported Formats</h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">Recognized direct URLs can include common video, image, document, audio, and archive file types.</p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6">
            {supportedFormatsData.map((format, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className={`bg-linear-to-br ${format.color} rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow`}
              >
                <format.icon size={32} className="mb-3" aria-label={`${format.category} file formats`} role="img" />
                <h3 className="font-bold text-lg mb-2">{format.category}</h3>
                <p className="text-sm opacity-90">{format.types}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* PLATFORM-SPECIFIC DOWNLOADS - LONG-TAIL KEYWORDS */}
      <section className="py-16 px-4 md:px-8 bg-green-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-12">Direct Files and Conditional Provider Support</h2>
          
          <div className="space-y-12">
            {/* SOCIAL MEDIA VIDEOS SECTION */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Public media sources</h2>
              <p className="text-gray-700 mb-6">
                YouTube, Instagram, TikTok, Facebook, Twitter/X, Vimeo, and similar public sources require a compatible configured provider. Support can vary by URL, region, source restrictions, and provider availability.
              </p>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg border border-green-200">
                  <h3 className="text-lg font-bold text-green-600 mb-4">📱 Platform Support</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li>• Public sources only</li>
                    <li>• Provider configuration is required</li>
                    <li>• Private, restricted, or blocked content may fail</li>
                    <li>• Available formats depend on the source and provider</li>
                  </ul>
                </div>
                <div className="bg-white p-6 rounded-lg border border-green-200">
                  <h3 className="text-lg font-bold text-green-600 mb-4">⚙️ Features</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li>• Direct public file download</li>
                    <li>• Format choices may appear when discovery succeeds</li>
                    <li>• No watermark-removal or format-conversion guarantee</li>
                    <li>• No account is required for the downloader page</li>
                  </ul>
                </div>
              </div>
              <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
                <p className="text-gray-700">
                  Once you download your videos, use our <Link href="/all-tools/video-tools" className="text-green-600 font-semibold hover:text-green-700 underline">video editing tools</Link> to trim, merge, add effects, and create professional content.
                </p>
              </div>
            </div>

            {/* IMAGES & DOCUMENTS SECTION */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Download Images and Documents from URLs</h2>
              <p className="text-gray-700 mb-6">
                Direct public URLs ending in recognized image, PDF, office-document, audio, video, or archive extensions can be requested. This tool does not crawl web pages, extract galleries, or batch-download page assets.
              </p>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg border border-green-200">
                  <h3 className="text-lg font-bold text-green-600 mb-4">🖼️ Image Formats</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li>✓ Download JPEG, PNG, WebP images</li>
                    <li>✓ Download a direct public image URL</li>
                    <li>• No gallery extraction</li>
                    <li>• One URL per request</li>
                  </ul>
                </div>
                <div className="bg-white p-6 rounded-lg border border-green-200">
                  <h3 className="text-lg font-bold text-green-600 mb-4">📄 Document Types</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li>✓ Download PDF documents</li>
                    <li>✓ Download direct public presentation URLs</li>
                    <li>✓ Download direct public text-file URLs</li>
                    <li>• The source file is returned without a quality guarantee</li>
                  </ul>
                </div>
              </div>
              <div className="mt-6 space-y-4">
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-gray-700">
                    Need to enhance or edit your downloaded images? Check out our <Link href="/all-tools/image-tools" className="text-green-600 font-semibold hover:text-green-700 underline">image editing tools</Link> for resizing, filtering, and more.
                  </p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-gray-700">
                    Working with PDFs? Our <Link href="/all-tools/pdf-tools" className="text-green-600 font-semibold hover:text-green-700 underline">PDF tools</Link> help you merge, split, compress, and convert documents.
                  </p>
                </div>
              </div>
            </div>

            {/* WHY DOWNLOAD SECTION */}
            <div className="bg-white p-6 rounded-lg border border-green-200">
              <h3 className="text-lg font-bold text-gray-900 mb-3">Why Use Our Downloader?</h3>
              <p className="text-gray-700 mb-3">
                The reliable source-proven path is a direct public file URL with a recognized extension. Other public sources are attempted only through available compatible providers.
              </p>
              <p className="text-gray-700">
                No registration is required for this page. Format options appear only when discovery succeeds and are limited to what the source and provider report.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="py-16 px-4 md:px-8 bg-white border-t border-gray-200">
        <div className="max-w-4xl mx-auto">
          <FAQ
            items={[
              {
                name: 'How do I download from online safely?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Use only direct public URLs or public media URLs you have permission to access. Requests are made over HTTPS, but source availability and compatible provider availability can vary. Do not submit private or unauthorized links.'
                }
              },
              {
                name: 'Can I use a public social-media URL?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'A compatible configured provider may handle some public social-media URLs. Success is not guaranteed because platforms, regions, access rules, and provider availability can change.'
                }
              },
              {
                name: 'Which social media platforms are supported?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Direct public file URLs with recognized extensions are supported. YouTube, TikTok, Instagram, Facebook, Twitter/X, Vimeo, and similar sources are conditional on a compatible configured provider.'
                }
              },
              {
                name: 'What file formats can I download?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Recognized direct URL extensions include common video, image, document, audio, and archive formats. The source file is downloaded in its available format; conversion is not guaranteed.'
                }
              },
              {
                name: 'Do I need to create an account to download?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'No account is required for this downloader page. A request can still fail when a source blocks server access or no compatible provider is available.'
                }
              },
              {
                name: 'Does this tool convert a video to MP3?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'No MP3 conversion is guaranteed. Some providers may expose an audio-only source format when format discovery succeeds, but the available format depends on the source and provider.'
                }
              },
              {
                name: 'Is it legal to download from online?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Whether you may download or reuse content depends on the content, your rights or permission, applicable law, and the source platform\'s terms. Use the downloader only for content you own or are authorized to access and download.'
                }
              },
              {
                name: 'Can I choose the quality or format before downloading?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'When format discovery succeeds, the tool shows options reported by the source. Not every source or provider exposes multiple formats, and a selected option may become unavailable.'
                }
              }
            ]}
            colorClass="green"
          />
        </div>
      </section>

      {/* STRUCTURED DATA - FAQ SCHEMA & SOFTWARE APPLICATION */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'SoftwareApplication',
            name: 'Download From Online',
            description: 'Download supported files from direct public URLs. Additional public media sources depend on compatible provider availability.',
            applicationCategory: 'UtilityApplication',
            operatingSystem: 'Web',
            url: 'https://simplifyconvert.com/all-tools/save-from-online',
            offers: {
              '@type': 'Offer',
              price: '0',
              priceCurrency: 'USD',
            },
          }),
        }}
      />

      {/* BREADCRUMB SCHEMA */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              {
                '@type': 'ListItem',
                position: 1,
                name: 'Home',
                item: 'https://simplifyconvert.com',
              },
              {
                '@type': 'ListItem',
                position: 2,
                name: 'All Tools',
                item: 'https://simplifyconvert.com/all-tools',
              },
              {
                '@type': 'ListItem',
                position: 3,
                name: 'Download From Online',
                item: 'https://simplifyconvert.com/all-tools/save-from-online',
              },
            ],
          }),
        }}
      />

      {/* FOOTER */}
      <Footer />
    </div>
  );
}
