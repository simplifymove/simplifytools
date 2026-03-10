'use client';

import React, { useState } from 'react';
import { ArrowLeft, Download, Loader, Info } from 'lucide-react';
import Link from 'next/link';
import { ImageUploader } from '../../components/ImageUploader';

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

  const getFormatLabel = () => {
    return outputFormat === 'jpg' ? 'JPEG' : outputFormat.toUpperCase();
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 py-8 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          <Link href="/" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4">
            <ArrowLeft className="w-4 h-4" /> Back
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Upscale Image</h1>
          <p className="text-gray-600 mt-2">Enlarge your images with high-quality results</p>
        </div>
      </div>

      <div className="py-12 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: Upload & Controls */}
            <div className="lg:col-span-1">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Upload & Settings</h2>
              <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-5 sticky top-4">
                {/* Upload */}
                <ImageUploader 
                  onFileSelect={handleFileSelect}
                  preview={preview}
                  onClearPreview={handleClearPreview}
                />

                {/* Scale Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Upscale Factor
                  </label>
                  <div className="flex gap-2">
                    {[2, 4].map((s) => (
                      <button
                        key={s}
                        onClick={() => setScale(s as 2 | 4)}
                        className={`flex-1 px-3 py-2 rounded-lg font-medium transition-colors ${
                          scale === s
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {s}×
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-gray-600 mt-2">
                    {scale === 2 ? '2× = faster, good for web' : '4× = best quality, larger file'}
                  </p>
                </div>

                {/* Image Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Image Type
                  </label>
                  <select
                    value={mode}
                    onChange={(e) => setMode(e.target.value as 'auto' | 'photo' | 'anime')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="auto">Auto Detect</option>
                    <option value="photo">Photo / Real Image</option>
                    <option value="anime">Anime / Illustration</option>
                  </select>
                  <p className="text-xs text-gray-600 mt-2">
                    Auto detects your image type for best results
                  </p>
                </div>

                {/* Output Format */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Output Format
                  </label>
                  <div className="flex gap-2">
                    {(['png', 'jpg', 'webp'] as const).map((fmt) => (
                      <button
                        key={fmt}
                        onClick={() => setOutputFormat(fmt)}
                        className={`flex-1 px-3 py-2 rounded-lg font-medium text-sm transition-colors ${
                          outputFormat === fmt
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {fmt === 'jpg' ? 'JPEG' : fmt.toUpperCase()}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-gray-600 mt-2">
                    PNG: best quality | JPG: smaller size | WebP: balanced
                  </p>
                </div>

                {/* Face Enhancement */}
                <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                  <input
                    type="checkbox"
                    id="faceEnhance"
                    checked={faceEnhance}
                    onChange={(e) => setFaceEnhance(e.target.checked)}
                    className="w-4 h-4 cursor-pointer mt-0.5"
                  />
                  <label htmlFor="faceEnhance" className="flex-1 cursor-pointer">
                    <div className="text-sm font-medium text-gray-900">Enhance Faces</div>
                    <div className="text-xs text-gray-600">Sharp details (may alter identity)</div>
                  </label>
                </div>

                {/* Upscale Button */}
                <button
                  onClick={upscaleImage}
                  disabled={!file || processing}
                  className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 transition-colors flex items-center justify-center gap-2"
                >
                  {processing ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Upscale Image'
                  )}
                </button>

                {/* Processing Time */}
                {processingTime !== null && (
                  <div className="text-xs text-gray-600 text-center bg-gray-50 p-2 rounded">
                    Processed in {processingTime}ms
                  </div>
                )}

                {/* Error Message */}
                {error && (
                  <div className="text-sm text-red-700 bg-red-50 p-3 rounded-lg border border-red-200">
                    {error}
                  </div>
                )}
              </div>
            </div>

            {/* Right: Preview & Result */}
            <div className="lg:col-span-2">
              <div className="space-y-6">
                {/* Original Preview */}
                {preview && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-3">Original</h3>
                    <div className="bg-white rounded-lg border border-gray-200 p-4 overflow-auto" style={{ maxHeight: '400px' }}>
                      <img
                        src={preview}
                        alt="original"
                        className="w-full h-auto rounded"
                      />
                    </div>
                  </div>
                )}

                {/* Result */}
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-3">
                    {result ? `Upscaled (${scale}×)` : 'Upscaled Result'}
                  </h3>
                  <div className="bg-white rounded-lg border border-gray-200 p-4">
                    {result ? (
                      <div className="space-y-4">
                        <div className="overflow-auto rounded" style={{ maxHeight: '600px' }}>
                          <img
                            src={result}
                            alt="upscaled"
                            className="w-full h-auto"
                          />
                        </div>
                        <button
                          onClick={handleDownload}
                          className="w-full px-4 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 flex items-center justify-center gap-2"
                        >
                          <Download className="w-4 h-4" />
                          Download {getFormatLabel()} ({scale}×)
                        </button>
                      </div>
                    ) : (
                      <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                        <div className="text-center">
                          <p className="text-gray-500 text-sm">Upload and process to see result</p>
                          <p className="text-gray-400 text-xs mt-2">Supports JPEG, PNG, WebP</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Info Box */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex gap-3">
                    <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-800">
                      <p className="font-medium mb-1">Pro Tips:</p>
                      <ul className="text-xs space-y-1 text-blue-700">
                        <li>• 2× scale: Better for web, faster processing</li>
                        <li>• 4× scale: Maximum quality, best for printing</li>
                        <li>• Auto mode: Automatically detects photo vs. illustration</li>
                        <li>• PNG: Best quality, larger file size</li>
                        <li>• WebP: New format, excellent compression</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
