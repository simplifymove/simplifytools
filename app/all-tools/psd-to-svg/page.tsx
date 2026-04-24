'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Download, ChevronRight, Loader, Zap } from 'lucide-react';
import { ImageUploader } from '../../components/ImageUploader';
import { HomeHeader } from '../../components/HomeHeader';
import { Footer } from '../../components/Footer';

export default function PsdToSvgPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [quality, setQuality] = useState(85);
  const [colorReduce, setColorReduce] = useState(true);
  const [cornerThreshold, setCornerThreshold] = useState(100);
  const [curveOptimize, setCurveOptimize] = useState(2);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [resultFileName, setResultFileName] = useState('');
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
      const formData = new FormData();
      formData.append('image', file);
      formData.append('config', JSON.stringify({ 
        from_format: 'psd',
        to_format: 'svg',
        options: {
          quality,
          color_reduce: colorReduce,
          corner_threshold: cornerThreshold,
          curve_optimize: curveOptimize
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
      setResultFileName(`design.svg`);
    } catch (err) {
      setError((err as Error).message || 'Error converting file');
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!result) return;
    const link = document.createElement('a');
    link.href = result;
    link.download = resultFileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <HomeHeader />
      <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex flex-col">
        {/* Hero Header */}
        <div className="relative bg-gradient-to-r from-purple-600 to-pink-600 py-16 px-4 md:px-8 overflow-hidden">
          <div className="max-w-6xl mx-auto relative z-10">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-white/90 text-sm mb-6">
              <Link href="/" className="hover:text-white transition">Home</Link>
              <ChevronRight size={16} />
              <Link href="/all-tools" className="hover:text-white transition">All Tools</Link>
              <ChevronRight size={16} />
              <span>PSD to SVG</span>
            </div>

            {/* Title Section */}
            <div className="flex items-start gap-4">
              <div className="p-3 bg-white/20 rounded-lg">
                <Zap size={32} className="text-white" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">PSD to SVG Vectorizer</h1>
                <p className="text-lg text-white/90">Convert Photoshop PSD designs to scalable SVG vector format. Perfect for logos, icons, and graphics that need to scale without quality loss.</p>
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
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Step 1: Upload PSD File</h2>
                  <ImageUploader
                    onFileSelect={handleFileSelect}
                    preview={preview}
                    onClearPreview={handleClearPreview}
                    accept=".psd"
                  />
                  {file && (
                    <p className="mt-4 text-sm text-gray-600">
                      File: <span className="font-semibold text-gray-900">{file.name}</span>
                    </p>
                  )}
                  
                  {/* Industry Info */}
                  <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <h4 className="font-semibold text-blue-900 mb-2">Rasterization</h4>
                      <p className="text-sm text-blue-800">PSD is first rendered to PNG with adjustable quality</p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <h4 className="font-semibold text-green-900 mb-2">Vectorization</h4>
                      <p className="text-sm text-green-800">PNG is traced to SVG using Potrace algorithm</p>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                      <h4 className="font-semibold text-purple-900 mb-2">Optimization</h4>
                      <p className="text-sm text-purple-800">SVG output is optimized for clean curves and file size</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Controls - Right (sticky sidebar) */}
              <div className="lg:col-span-1">
                <div className="sticky top-4 space-y-4">
                  {/* Options */}
                  <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <h3 className="font-semibold text-gray-900 mb-4">Vectorization Settings</h3>
                    
                    {/* Rasterization Quality */}
                    <div className="mb-6">
                      <label className="text-sm font-medium text-gray-700 block mb-2">
                        Raster Quality: {quality}%
                      </label>
                      <input
                        type="range"
                        min="60"
                        max="100"
                        step="5"
                        value={quality}
                        onChange={(e) => setQuality(parseInt(e.target.value))}
                        className="w-full"
                      />
                      <p className="text-xs text-gray-500 mt-1">Controls detail in rasterization step</p>
                    </div>

                    {/* Color Reduce */}
                    <div className="mb-6 flex items-center">
                      <input
                        type="checkbox"
                        id="colorReduce"
                        checked={colorReduce}
                        onChange={(e) => setColorReduce(e.target.checked)}
                        className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500 cursor-pointer"
                      />
                      <label htmlFor="colorReduce" className="ml-2 text-sm font-medium text-gray-700 cursor-pointer">
                        Reduce Colors (Recommended)
                      </label>
                    </div>
                    <p className="text-xs text-gray-500 mb-4">Reduces to 256 colors for cleaner vectorization</p>

                    {/* Corner Threshold */}
                    <div className="mb-6">
                      <label className="text-sm font-medium text-gray-700 block mb-2">
                        Corner Threshold: {cornerThreshold}
                      </label>
                      <input
                        type="range"
                        min="50"
                        max="200"
                        step="10"
                        value={cornerThreshold}
                        onChange={(e) => setCornerThreshold(parseInt(e.target.value))}
                        className="w-full"
                      />
                      <p className="text-xs text-gray-500 mt-1">Higher = smoother curves, fewer nodes</p>
                    </div>

                    {/* Curve Optimization */}
                    <div className="mb-6">
                      <label className="text-sm font-medium text-gray-700 block mb-2">
                        Curve Optimization: {curveOptimize}
                      </label>
                      <select
                        value={curveOptimize}
                        onChange={(e) => setCurveOptimize(parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="0">Off</option>
                        <option value="1">Level 1 (Light)</option>
                        <option value="2">Level 2 (Standard)</option>
                        <option value="3">Level 3 (Aggressive)</option>
                      </select>
                      <p className="text-xs text-gray-500 mt-1">Simplifies curves, reduces file size</p>
                    </div>

                    {/* Convert Button */}
                    <button
                      onClick={handleConvert}
                      disabled={!file || processing}
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:bg-gray-400 text-white font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2"
                    >
                      {processing ? (
                        <>
                          <Loader size={18} className="animate-spin" />
                          Vectorizing...
                        </>
                      ) : (
                        'Convert to SVG'
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
                        Download SVG File
                      </button>
                    </div>
                  )}

                  {/* Error */}
                  {error && (
                    <div className="bg-white rounded-lg border border-red-200 bg-red-50 p-4">
                      <h3 className="font-semibold text-red-900 mb-2">✗ Error</h3>
                      <p className="text-sm text-red-800">{error}</p>
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

