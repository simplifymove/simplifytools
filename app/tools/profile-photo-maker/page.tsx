'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Download, ChevronRight, Loader, Upload, User } from 'lucide-react';
import { HomeHeader } from '../../components/HomeHeader';

export default function ProfilePhotoMakerPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [bgType, setBgType] = useState<'white' | 'blue' | 'gray' | 'gradient' | 'blur'>('white');
  const [gradientColor1, setGradientColor1] = useState('blue');
  const [gradientColor2, setGradientColor2] = useState('purple');
  const [outputSize, setOutputSize] = useState(1024);
  const [processingTime, setProcessingTime] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const gradientColors = ['blue', 'purple', 'pink', 'teal', 'white', 'black'];

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

  const handleClear = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setError(null);
    setProcessingTime(null);
  };

  const processPhoto = async () => {
    if (!file) {
      setError('Please select an image first');
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('bgType', bgType);
      formData.append('gradientColor1', gradientColor1);
      formData.append('gradientColor2', gradientColor2);
      formData.append('outputSize', outputSize.toString());

      const startTime = Date.now();
      const response = await fetch('/api/profile-photo-maker', {
        method: 'POST',
        body: formData,
      });

      const processingTimeMs = Date.now() - startTime;
      setProcessingTime(processingTimeMs);

      if (!response.ok) {
        let errorMessage = 'Failed to process image';
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
    link.download = `profile-${Date.now()}.png`;
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
              <span>Profile Photo Maker</span>
            </div>

            {/* Title Section */}
            <div className="flex items-start gap-4">
              <div className="p-3 bg-white/20 rounded-lg">
                <User size={32} className="text-white" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">Profile Photo Maker</h1>
                <p className="text-lg text-white/90">Create professional profile pictures for LinkedIn, Instagram, and social media with AI background removal.</p>
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
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Step 1: Upload Photo</h2>
                  
                  <div
                    className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition ${
                      preview ? 'border-orange-300 bg-orange-50' : 'border-gray-300 hover:border-orange-500 hover:bg-orange-50'
                    }`}
                    onClick={() => document.getElementById('imageInput')?.click()}
                  >
                    {preview ? (
                      <div>
                        <p className="text-xs text-orange-600 font-medium truncate mb-3">{file?.name}</p>
                        <img src={preview} alt="preview" className="w-full h-64 object-cover rounded-lg" />
                      </div>
                    ) : (
                      <div>
                        <Upload className="w-12 h-12 mx-auto text-orange-500 mb-3" />
                        <p className="text-sm font-medium text-gray-700">Click to upload photo</p>
                        <p className="text-xs text-gray-500 mt-1">JPG, PNG, WebP up to 10MB</p>
                      </div>
                    )}
                  </div>
                  <input
                    id="imageInput"
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                  />

                  {file && (
                    <button
                      onClick={handleClear}
                      className="w-full mt-4 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg font-medium hover:bg-gray-200"
                    >
                      Clear &amp; upload different photo
                    </button>
                  )}
                </div>

                {/* Result */}
                {result && (
                  <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Profile Photo</h2>
                    <div className="flex justify-center mb-6">
                      <img
                        src={result}
                        alt="result"
                        className="rounded-lg shadow-lg"
                        style={{ maxWidth: '400px', maxHeight: '400px' }}
                      />
                    </div>
                    {processingTime !== null && (
                      <p className="text-xs text-gray-600 text-center bg-gray-50 p-3 rounded-lg mb-4">
                        Created in {(processingTime / 1000).toFixed(1)}s • {outputSize}x{outputSize}px
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Controls - Right (sticky sidebar) */}
              <div className="lg:col-span-1">
                <div className="sticky top-4 space-y-4">
                  {/* Settings */}
                  {file && (
                    <div className="bg-white rounded-lg border border-gray-200 p-4">
                      <h3 className="font-semibold text-gray-900 mb-4">Photo Settings</h3>

                      {/* Background Type */}
                      <div className="mb-4">
                        <label className="text-sm font-medium text-gray-700 block mb-2">Background</label>
                        <select
                          value={bgType}
                          onChange={(e) => setBgType(e.target.value as any)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        >
                          <option value="white">White</option>
                          <option value="blue">LinkedIn Blue</option>
                          <option value="gray">Professional Gray</option>
                          <option value="gradient">Gradient</option>
                          <option value="blur">Blurred Background</option>
                        </select>
                      </div>

                      {/* Gradient Colors */}
                      {bgType === 'gradient' && (
                        <div className="mb-4">
                          <label className="text-sm font-medium text-gray-700 block mb-2">Gradient Colors</label>
                          <div className="grid grid-cols-2 gap-2">
                            <select
                              value={gradientColor1}
                              onChange={(e) => setGradientColor1(e.target.value)}
                              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            >
                              {gradientColors.map((color) => (
                                <option key={color} value={color}>
                                  {color.charAt(0).toUpperCase() + color.slice(1)}
                                </option>
                              ))}
                            </select>
                            <select
                              value={gradientColor2}
                              onChange={(e) => setGradientColor2(e.target.value)}
                              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            >
                              {gradientColors.map((color) => (
                                <option key={color} value={color}>
                                  {color.charAt(0).toUpperCase() + color.slice(1)}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      )}

                      {/* Output Size */}
                      <div className="mb-4">
                        <label className="text-sm font-medium text-gray-700 block mb-2">
                          Output Size: {outputSize}x{outputSize}
                        </label>
                        <select
                          value={outputSize}
                          onChange={(e) => setOutputSize(parseInt(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        >
                          <option value={512}>512x512 (Web)</option>
                          <option value={1024}>1024x1024 (HD)</option>
                          <option value={1536}>1536x1536 (Ultra HD)</option>
                        </select>
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
                  {file && (
                    <button
                      onClick={processPhoto}
                      disabled={processing}
                      className="w-full py-3 px-6 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2"
                    >
                      {processing ? (
                        <>
                          <Loader size={20} className="animate-spin" />
                          Creating...
                        </>
                      ) : (
                        'Create Profile Photo'
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
                      Download Photo
                    </button>
                  )}

                  {/* Info Box */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-900 mb-2">Features</h3>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• AI background removal</li>
                      <li>• Face detection & centering</li>
                      <li>• Multiple backgrounds</li>
                      <li>• 3 size options available</li>
                    </ul>
                  </div>

                  {/* Use Cases */}
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <h3 className="font-semibold text-amber-900 mb-2">Perfect for:</h3>
                    <ul className="text-sm text-amber-800 space-y-1">
                      <li>• LinkedIn profile</li>
                      <li>• Instagram account</li>
                      <li>• Professional portfolio</li>
                      <li>• Social media</li>
                    </ul>
                  </div>

                  {/* Getting Started */}
                  {!preview && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <h3 className="font-semibold text-green-900 mb-2">How it Works:</h3>
                      <ol className="text-sm text-green-800 space-y-1">
                        <li>1. Upload your photo</li>
                        <li>2. Choose background</li>
                        <li>3. Pick output size</li>
                        <li>4. Click Create</li>
                        <li>5. Download result</li>
                      </ol>
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
