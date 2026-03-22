'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Download, ChevronRight, Loader, Upload, Eraser } from 'lucide-react';
import { HomeHeader } from '../../components/HomeHeader';

export default function RemoveBackgroundPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [hqMode, setHqMode] = useState(false);
  const [outputFormat, setOutputFormat] = useState<'png' | 'jpg' | 'webp'>('png');
  const [processingTime, setProcessingTime] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(selectedFile);
    setError(null);
    setResult(null);
  };

  const handleClearPreview = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setError(null);
    setProcessingTime(null);
  };

  const removeBackground = async () => {
    if (!file) {
      setError('Please select an image first');
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('hq', hqMode ? 'true' : 'false');
      formData.append('format', outputFormat);

      const startTime = Date.now();
      const response = await fetch('/api/bg-remove', {
        method: 'POST',
        body: formData,
      });

      const processingTimeMs = Date.now() - startTime;
      setProcessingTime(processingTimeMs);

      if (!response.ok) {
        let errorMessage = 'Failed to remove background';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          errorMessage = `Server error (${response.status})`;
        }
        throw new Error(errorMessage);
      }

      const blob = await response.blob();
      if (blob.size === 0) {
        throw new Error('Empty response from server');
      }

      const url = URL.createObjectURL(blob);
      setResult(url);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('Error:', err);
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!result) return;
    const link = document.createElement('a');
    link.href = result;
    link.download = `no-background-${Date.now()}.${outputFormat}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
              <Link href="/tools" className="hover:text-white transition">Tools</Link>
              <ChevronRight size={16} />
              <span>Remove Background</span>
            </div>

            {/* Title Section */}
            <div className="flex items-start gap-4">
              <div className="p-3 bg-white/20 rounded-lg">
                <Eraser size={32} className="text-white" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">Remove Background</h1>
                <p className="text-lg text-white/90">Automatically remove backgrounds from images with AI-powered technology.</p>
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
                {/* Step 1: Upload */}
                {!preview && (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Step 1: Upload Image</h2>
                    
                    <div
                      className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition hover:border-orange-500 hover:bg-orange-50"
                      onClick={() => document.getElementById('imageInput')?.click()}
                    >
                      <Upload className="w-12 h-12 mx-auto text-orange-500 mb-3" />
                      <p className="text-sm font-medium text-gray-700">Click to upload image</p>
                      <p className="text-xs text-gray-500 mt-1">JPG, PNG, WebP up to 20MB</p>
                    </div>
                    <input
                      id="imageInput"
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                    />
                  </div>
                )}

                {/* Original Preview */}
                {preview && (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Original Image</h2>
                    <div className="flex justify-center">
                      <img
                        src={preview}
                        alt="original"
                        className="rounded-lg shadow-lg max-w-full"
                        style={{ maxHeight: '500px', maxWidth: '100%' }}
                      />
                    </div>
                  </div>
                )}

                {/* Result */}
                {result && (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Background Removed</h2>
                    <div className="flex justify-center mb-6">
                      <img
                        src={result}
                        alt="result"
                        className="rounded-lg shadow-lg max-w-full"
                        style={{ maxHeight: '500px', maxWidth: '100%' }}
                      />
                    </div>
                    {processingTime !== null && (
                      <p className="text-xs text-gray-600 text-center bg-gray-50 p-3 rounded-lg">
                        Processed in {(processingTime / 1000).toFixed(1)}s • {outputFormat.toUpperCase()} format
                      </p>
                    )}
                  </div>
                )}

                {!preview && (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                    <h3 className="font-semibold text-green-900 mb-3">How it Works:</h3>
                    <ol className="text-sm text-green-800 space-y-2">
                      <li>1. Upload an image with a background</li>
                      <li>2. Our AI automatically detects and removes it</li>
                      <li>3. Choose your processing mode and output format</li>
                      <li>4. Download the result with transparent background</li>
                      <li>5. Use it in designs, websites, or other projects</li>
                    </ol>
                  </div>
                )}
              </div>

              {/* Settings Sidebar - Right (1 col sticky) */}
              <div className="lg:col-span-1">
                <div className="sticky top-4 space-y-4">
                  {!preview && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h3 className="font-semibold text-blue-900 mb-3">Features</h3>
                      <ul className="text-sm text-blue-800 space-y-1">
                        <li>• AI-powered detection</li>
                        <li>• Automatic background removal</li>
                        <li>• Multiple output formats</li>
                        <li>• High quality mode</li>
                        <li>• Fast processing</li>
                      </ul>
                    </div>
                  )}

                  {/* Settings */}
                  {preview && (
                    <div className="bg-white rounded-lg border border-gray-200 p-4">
                      <h3 className="font-semibold text-gray-900 mb-4">Export Settings</h3>

                      {/* Output Format */}
                      <div className="mb-4">
                        <label className="text-sm font-medium text-gray-700 block mb-2">Output Format</label>
                        <select
                          value={outputFormat}
                          onChange={(e) => setOutputFormat(e.target.value as 'png' | 'jpg' | 'webp')}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        >
                          <option value="png">PNG (transparent background)</option>
                          <option value="webp">WebP (modern)</option>
                          <option value="jpg">JPEG (opaque)</option>
                        </select>
                      </div>

                      {/* HQ Mode */}
                      <div className="flex items-start gap-2 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                        <input
                          type="checkbox"
                          id="hqMode"
                          checked={hqMode}
                          onChange={(e) => setHqMode(e.target.checked)}
                          className="w-4 h-4 cursor-pointer mt-0.5"
                        />
                        <label htmlFor="hqMode" className="flex-1 cursor-pointer">
                          <div className="text-sm font-medium text-gray-900">High Quality Mode</div>
                          <div className="text-xs text-gray-600">Better results (slower)</div>
                        </label>
                      </div>
                    </div>
                  )}

                  {/* Error Message */}
                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <p className="text-red-900 font-semibold text-sm">Error</p>
                      <p className="text-red-700 text-xs mt-1">{error}</p>
                    </div>
                  )}

                  {/* Process Button */}
                  {preview && (
                    <button
                      onClick={removeBackground}
                      disabled={processing}
                      className="w-full py-3 px-6 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2"
                    >
                      {processing ? (
                        <>
                          <Loader size={20} className="animate-spin" />
                          Processing...
                        </>
                      ) : (
                        'Remove Background'
                      )}
                    </button>
                  )}

                  {/* Download Button */}
                  {result && (
                    <button
                      onClick={handleDownload}
                      className="w-full py-3 px-6 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2"
                    >
                      <Download size={20} />
                      Download {outputFormat.toUpperCase()}
                    </button>
                  )}

                  {/* Clear Button */}
                  {preview && (
                    <button
                      onClick={handleClearPreview}
                      className="w-full py-2 px-6 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition"
                    >
                      Clear &amp; Upload New
                    </button>
                  )}

                  {/* Use Cases */}
                  {preview && (
                    <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                      <h3 className="font-semibold text-indigo-900 mb-2">Perfect for:</h3>
                      <ul className="text-sm text-indigo-800 space-y-1">
                        <li>• e-Commerce product photos</li>
                        <li>• Profile pictures</li>
                        <li>• Design projects</li>
                        <li>• Website graphics</li>
                      </ul>
                    </div>
                  )}

                  {/* Format Info */}
                  {preview && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                      <h3 className="font-semibold text-amber-900 mb-2">Format Tips</h3>
                      <ul className="text-xs text-amber-800 space-y-1">
                        <li>• PNG: Transparent bg</li>
                        <li>• WebP: Modern, smaller</li>
                        <li>• JPEG: Solid background</li>
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      {/* FOOTER */}
      <footer className="bg-slate-900 text-gray-300 px-4 md:px-8 py-16 md:py-24">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 font-bold text-xl text-white mb-4">
                <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-md shadow-orange-500/40">
                  SC
                </div>
                <span>SimplifyConvert</span>
              </div>
              <p className="text-sm text-gray-400">
                Free online tools for PDF, Image, Video, AI Write, Data, Code, and Text to Speech conversion.
              </p>
            </div>

            {/* Categories */}
            <div>
              <h4 className="font-semibold text-white mb-4">Categories</h4>
              <ul className="space-y-2 text-sm">
                {['PDF Tools', 'Image Tools', 'Video Tools', 'AI Write', 'Code Tools'].map((item) => (
                  <li key={item}>
                    <a href="#" className="hover:text-white transition-colors hover:translate-x-1 inline-block">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Popular Tools */}
            <div>
              <h4 className="font-semibold text-white mb-4">Popular</h4>
              <ul className="space-y-2 text-sm">
                {['PDF to JPG', 'Remove BG', 'Compress Image', 'JSON Formatter', 'CSV to Excel'].map((item) => (
                  <li key={item}>
                    <a href="#" className="hover:text-white transition-colors hover:translate-x-1 inline-block">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                {[
                  { label: 'About', href: '/about' },
                  { label: 'Privacy Policy', href: '/privacy' },
                  { label: 'Terms of Service', href: '/tos' },
                  { label: 'Contact', href: '/contact' },
                  { label: 'Blog', href: '/blog' }
                ].map((item) => (
                  <li key={item.label}>
                    <Link href={item.href} className="hover:text-white transition-colors hover:translate-x-1 inline-block">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8">
            <p className="text-center text-sm text-gray-400">
              © 2026 SimplifyConvert. All rights reserved. All tools are free and work in your browser.
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}
