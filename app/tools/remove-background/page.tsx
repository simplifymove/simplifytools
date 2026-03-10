'use client';

import React, { useState } from 'react';
import { ArrowLeft, Download, Loader } from 'lucide-react';
import Link from 'next/link';
import { ImageUploader } from '../../components/ImageUploader';

export default function RemoveBackgroundPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [hqMode, setHqMode] = useState(false);
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

  const removeBackground = async () => {
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
      const response = await fetch(`/api/bg-remove?hq=${hqMode}`, {
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
    link.download = `background-removed-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 py-8 px-4 md:px-8">
        <div className="max-w-4xl mx-auto">
          <Link href="/" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4">
            <ArrowLeft className="w-4 h-4" /> Back
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Remove Background</h1>
          <p className="text-gray-600 mt-2">Automatic background removal - just upload and process</p>
        </div>
      </div>

      <div className="py-12 px-4 md:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left: Upload & Controls */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Upload Image</h2>
              <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4 sticky top-4">
                {/* Upload */}
                <ImageUploader 
                  onFileSelect={handleFileSelect}
                  preview={preview}
                  onClearPreview={handleClearPreview}
                />

                {/* HQ Mode Toggle */}
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <input
                    type="checkbox"
                    id="hqMode"
                    checked={hqMode}
                    onChange={(e) => setHqMode(e.target.checked)}
                    className="w-4 h-4 cursor-pointer"
                  />
                  <label htmlFor="hqMode" className="flex-1 cursor-pointer">
                    <div className="text-sm font-medium text-gray-900">High Quality Mode</div>
                    <div className="text-xs text-gray-600">Better results, slower (1536px)</div>
                  </label>
                </div>

                {/* Process Button */}
                <button
                  onClick={removeBackground}
                  disabled={!file || processing}
                  className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 transition-colors flex items-center justify-center gap-2"
                >
                  {processing ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Remove Background'
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

            {/* Right: Result */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Result</h2>
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                {result ? (
                  <div className="space-y-4">
                    {/* Checkerboard background to show transparency */}
                    <div 
                      className="rounded-lg p-4 overflow-hidden"
                      style={{
                        backgroundImage:
                          'linear-gradient(45deg, #e5e7eb 25%, transparent 25%, transparent 75%, #e5e7eb 75%, #e5e7eb), linear-gradient(45deg, #e5e7eb 25%, transparent 25%, transparent 75%, #e5e7eb 75%, #e5e7eb)',
                        backgroundSize: '20px 20px',
                        backgroundPosition: '0 0, 10px 10px',
                      }}
                    >
                      <img
                        src={result}
                        alt="result"
                        className="w-full h-auto rounded"
                      />
                    </div>
                    <button
                      onClick={handleDownload}
                      className="w-full px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 flex items-center justify-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Download PNG
                    </button>
                  </div>
                ) : (
                  <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                    <div className="text-center">
                      <p className="text-gray-500 text-sm">Upload and process to see result</p>
                      <p className="text-gray-400 text-xs mt-2">PNG with transparent background</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
