'use client';

import React, { useState } from 'react';
import { ArrowLeft, Download, Loader, Upload } from 'lucide-react';
import Link from 'next/link';

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
    <main className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 py-8 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          <Link href="/" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4">
            <ArrowLeft className="w-4 h-4" /> Back
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Profile Photo Maker</h1>
          <p className="text-gray-600 mt-2">Create professional profile pictures for LinkedIn, Instagram, and more</p>
        </div>
      </div>

      <div className="py-12 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: Controls */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4 sticky top-4">
                <h2 className="text-lg font-semibold text-gray-900">Settings</h2>

                {/* Image Upload */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Photo</label>
                  <div
                    className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition ${
                      preview ? 'border-blue-300 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
                    }`}
                    onClick={() => document.getElementById('imageInput')?.click()}
                  >
                    {preview ? (
                      <div>
                        <div className="text-xs text-blue-600 font-medium truncate">{file?.name}</div>
                        <img src={preview} alt="preview" className="w-full h-24 object-cover rounded mt-2" />
                      </div>
                    ) : (
                      <div>
                        <Upload className="w-6 h-6 mx-auto text-gray-400" />
                        <p className="text-xs text-gray-600 mt-2">Click to upload</p>
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
                </div>

                {file && (
                  <>
                    {/* Background Type */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">Background</label>
                      <select
                        value={bgType}
                        onChange={(e) => setBgType(e.target.value as any)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      >
                        <option value="white">White</option>
                        <option value="blue">LinkedIn Blue</option>
                        <option value="gray">Professional Gray</option>
                        <option value="gradient">Gradient</option>
                        <option value="blur">Blurred Background</option>
                      </select>
                    </div>

                    {/* Gradient Colors (only if gradient selected) */}
                    {bgType === 'gradient' && (
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Gradient Colors</label>
                        <div className="grid grid-cols-2 gap-2">
                          <select
                            value={gradientColor1}
                            onChange={(e) => setGradientColor1(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
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
                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
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
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Output Size: {outputSize}x{outputSize}
                      </label>
                      <select
                        value={outputSize}
                        onChange={(e) => setOutputSize(parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      >
                        <option value={512}>512x512 (Web)</option>
                        <option value={1024}>1024x1024 (HD)</option>
                        <option value={1536}>1536x1536 (Ultra HD)</option>
                      </select>
                    </div>

                    {/* Process Button */}
                    <button
                      onClick={processPhoto}
                      disabled={processing}
                      className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 transition-colors flex items-center justify-center gap-2"
                    >
                      {processing ? (
                        <>
                          <Loader className="w-4 h-4 animate-spin" />
                          Creating Profile...
                        </>
                      ) : (
                        'Create Profile Photo'
                      )}
                    </button>

                    {/* Processing Time */}
                    {processingTime !== null && (
                      <div className="text-xs text-gray-600 text-center bg-gray-50 p-2 rounded">
                        Processed in {(processingTime / 1000).toFixed(1)}s
                      </div>
                    )}

                    {/* Error Message */}
                    {error && (
                      <div className="text-sm text-red-700 bg-red-50 p-3 rounded-lg border border-red-200">
                        {error}
                      </div>
                    )}

                    {/* Clear Button */}
                    {(result || error) && (
                      <button
                        onClick={handleClear}
                        className="w-full px-4 py-2 text-gray-700 bg-gray-100 rounded-lg font-medium hover:bg-gray-200"
                      >
                        Clear
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Right: Preview & Result */}
            <div className="lg:col-span-2 space-y-6">
              {/* Original Preview */}
              {preview && (
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Original Photo</h2>
                  <img src={preview} alt="original" className="w-full h-auto rounded-lg max-h-96 object-cover" />
                </div>
              )}

              {/* Result */}
              {result && (
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Profile Photo</h2>
                  <div className="space-y-4">
                    <div className="flex justify-center">
                      <img
                        src={result}
                        alt="result"
                        className="rounded-lg shadow-lg"
                        style={{ maxWidth: '400px', maxHeight: '400px' }}
                      />
                    </div>
                    <button
                      onClick={handleDownload}
                      className="w-full px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 flex items-center justify-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Download Profile Photo
                    </button>
                  </div>
                </div>
              )}

              {/* Instructions */}
              {!result && !preview && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <h3 className="text-sm font-semibold text-blue-900 mb-2">How it works:</h3>
                  <ol className="text-sm text-blue-800 space-y-2 list-decimal list-inside">
                    <li>Upload a photo of yourself</li>
                    <li>Choose your preferred background</li>
                    <li>Select output size (512px for web, 1024px for HD)</li>
                    <li>Click "Create Profile Photo"</li>
                    <li>We'll remove the background, center your face, and create a professional profile picture</li>
                  </ol>
                </div>
              )}

              {/* Features */}
              {!preview && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">Features</h3>
                    <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                      <li>AI background removal</li>
                      <li>Automatic face detection</li>
                      <li>Smart cropping</li>
                      <li>Multiple background options</li>
                    </ul>
                  </div>
                  <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">Perfect for:</h3>
                    <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                      <li>LinkedIn profile</li>
                      <li>Instagram account</li>
                      <li>Professional portfolio</li>
                      <li>Social media accounts</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
