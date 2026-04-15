'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Download, ChevronRight, Loader, Zap } from 'lucide-react';
import { HomeHeader } from '../../components/HomeHeader';
import { ImageUploader } from '../../components/ImageUploader';
import { Footer } from '../../components/Footer';

export default function UpscaleImagePage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  
  // Upscale options
  const [scale, setScale] = useState<2 | 4>(4);
  const [mode, setMode] = useState<'auto' | 'photo' | 'anime'>('auto');
  const [faceEnhance, setFaceEnhance] = useState(false);
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
  };

  const handleClearPreview = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
  };

  const upscaleImage = async () => {
    if (!file) {
      setError('Please select an image first');
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const startTime = Date.now();
      const response = await fetch(
        `/api/upscale?scale=${scale}&mode=${mode}&face_enhance=${faceEnhance}&format=${outputFormat}`,
        {
          method: 'POST',
          body: formData,
        }
      );

      const processingTimeMs = Date.now() - startTime;
      setProcessingTime(processingTimeMs);

      if (!response.ok) {
        let errorMessage = 'Failed to upscale image';
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
    link.download = `upscaled-${scale}x-${Date.now()}.${outputFormat}`;
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
              <Link href="/all-tools" className="hover:text-white transition">Tools</Link>
              <ChevronRight size={16} />
              <span>Upscale Image</span>
            </div>

            {/* Title Section */}
            <div className="flex items-start gap-4">
              <div className="p-3 bg-white/20 rounded-lg">
                <Zap size={32} className="text-white" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">Upscale Image</h1>
                <p className="text-lg text-white/90">Enlarge your images up to 4x with AI-powered quality enhancement.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 py-12 px-4 md:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content - Left (2 cols) */}
              <div className="lg:col-span-2">
                {/* Step 1: Upload */}
                {!preview && (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Step 1: Upload Image</h2>
                    <ImageUploader 
                      onFileSelect={handleFileSelect}
                      preview={preview}
                      onClearPreview={handleClearPreview}
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
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Upscaled Result ({scale}×)</h2>
                    <div className="flex justify-center mb-6">
                      <img
                        src={result}
                        alt="upscaled"
                        className="rounded-lg shadow-lg max-w-full"
                        style={{ maxHeight: '600px', maxWidth: '100%' }}
                      />
                    </div>
                    {processingTime !== null && (
                      <p className="text-xs text-gray-600 text-center bg-gray-50 p-3 rounded-lg mb-4">
                        Processed in {(processingTime / 1000).toFixed(1)}s • {outputFormat.toUpperCase()} format
                      </p>
                    )}
                  </div>
                )}

                {!preview && (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                    <h3 className="font-semibold text-green-900 mb-3">How to Upscale:</h3>
                    <ol className="text-sm text-green-800 space-y-2">
                      <li>1. Upload an image you want to enlarge</li>
                      <li>2. Choose upscale factor (2× or 4×)</li>
                      <li>3. Select image type (auto-detect or specific)</li>
                      <li>4. Optional: Enable face enhancement</li>
                      <li>5. Pick output format (PNG/JPG/WebP)</li>
                      <li>6. Click "Upscale" and download result</li>
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
                        <li>• 2× or 4× upscaling</li>
                        <li>• AI-powered enhancement</li>
                        <li>• Multiple output formats</li>
                        <li>• Face enhancement mode</li>
                        <li>• Auto image detection</li>
                      </ul>
                    </div>
                  )}

                  {/* Settings */}
                  {preview && (
                    <div className="bg-white rounded-lg border border-gray-200 p-4">
                      <h3 className="font-semibold text-gray-900 mb-4">Upscale Settings</h3>

                      {/* Scale Selection */}
                      <div className="mb-4">
                        <label className="text-sm font-medium text-gray-700 block mb-2">Upscale Factor</label>
                        <div className="flex gap-2">
                          {[2, 4].map((s) => (
                            <button
                              key={s}
                              onClick={() => setScale(s as 2 | 4)}
                              className={`flex-1 px-3 py-2 rounded-lg font-medium text-sm transition ${
                                scale === s
                                  ? 'bg-orange-500 text-white'
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }`}
                            >
                              {s}×
                            </button>
                          ))}
                        </div>
                        <p className="text-xs text-gray-600 mt-1">
                          {scale === 2 ? 'Faster, good for web' : 'Maximum quality'}
                        </p>
                      </div>

                      {/* Image Type */}
                      <div className="mb-4">
                        <label className="text-sm font-medium text-gray-700 block mb-2">Image Type</label>
                        <select
                          value={mode}
                          onChange={(e) => setMode(e.target.value as 'auto' | 'photo' | 'anime')}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        >
                          <option value="auto">Auto Detect</option>
                          <option value="photo">Photo / Real Image</option>
                          <option value="anime">Anime / Illustration</option>
                        </select>
                      </div>

                      {/* Output Format */}
                      <div className="mb-4">
                        <label className="text-sm font-medium text-gray-700 block mb-2">Output Format</label>
                        <div className="flex gap-2">
                          {(['png', 'jpg', 'webp'] as const).map((fmt) => (
                            <button
                              key={fmt}
                              onClick={() => setOutputFormat(fmt)}
                              className={`flex-1 px-3 py-2 rounded-lg font-medium text-sm transition ${
                                outputFormat === fmt
                                  ? 'bg-orange-500 text-white'
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }`}
                            >
                              {fmt === 'jpg' ? 'JPG' : fmt.toUpperCase()}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Face Enhancement */}
                      <div className="flex items-start gap-2 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                        <input
                          type="checkbox"
                          id="faceEnhance"
                          checked={faceEnhance}
                          onChange={(e) => setFaceEnhance(e.target.checked)}
                          className="w-4 h-4 cursor-pointer mt-0.5"
                        />
                        <label htmlFor="faceEnhance" className="flex-1 cursor-pointer">
                          <div className="text-sm font-medium text-gray-900">Enhance Faces</div>
                          <div className="text-xs text-gray-600">Sharpen facial details</div>
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

                  {/* Upscale Button */}
                  {preview && (
                    <button
                      onClick={upscaleImage}
                      disabled={!file || processing}
                      className="w-full py-3 px-6 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2"
                    >
                      {processing ? (
                        <>
                          <Loader size={20} className="animate-spin" />
                          Upscaling...
                        </>
                      ) : (
                        'Upscale Image'
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

                  {/* Speed Comparison */}
                  {preview && (
                    <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                      <h3 className="font-semibold text-indigo-900 mb-2">Scale Comparison</h3>
                      <ul className="text-sm text-indigo-800 space-y-1">
                        <li>• <span className="font-medium">2×</span> Web-ready</li>
                        <li>• <span className="font-medium">4×</span> Best quality</li>
                      </ul>
                    </div>
                  )}

                  {/* Format Tips */}
                  {preview && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                      <h3 className="font-semibold text-amber-900 mb-2">Format Tips</h3>
                      <ul className="text-xs text-amber-800 space-y-1">
                        <li>• PNG: Best quality</li>
                        <li>• WebP: Balanced</li>
                        <li>• JPG: Smallest file</li>
                      </ul>
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







