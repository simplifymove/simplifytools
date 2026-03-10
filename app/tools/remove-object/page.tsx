'use client';

import React, { useState } from 'react';
import { ArrowLeft, Download, Loader } from 'lucide-react';
import Link from 'next/link';
import { CanvasMask } from '../../components/CanvasMask';

export default function RemoveObjectPage() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [maskFile, setMaskFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [method, setMethod] = useState<'telea' | 'ns'>('ns'); // Default to Navier-Stokes for better quality
  const [radius, setRadius] = useState(5); // Increased default radius for better inpainting
  const [processingTime, setProcessingTime] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [brushSize, setBrushSize] = useState(10);

  const handleImageSelect = (selectedFile: File) => {
    setImageFile(selectedFile);
    const reader = new FileReader();
    reader.onload = (e) => {
      const imgUrl = e.target?.result as string;
      setImagePreview(imgUrl);
      
      // Get image dimensions
      const img = new Image();
      img.onload = () => {
        setImageDimensions({ width: img.width, height: img.height });
      };
      img.src = imgUrl;
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleMaskGenerated = (maskBlob: Blob) => {
    const file = new File([maskBlob], 'mask.png', { type: 'image/png' });
    setMaskFile(file);
    setError(null);
  };

  const handleClearImages = () => {
    setImageFile(null);
    setMaskFile(null);
    setImagePreview(null);
    setImageDimensions(null);
    setResult(null);
    setError(null);
  };

  const removeObject = async () => {
    if (!imageFile || !maskFile) {
      setError('Please select both image and mask');
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('image', imageFile);
      formData.append('mask', maskFile);
      formData.append('method', method);
      formData.append('radius', radius.toString());

      const startTime = Date.now();
      const response = await fetch('/api/remove-object', {
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
    link.download = `object-removed-${Date.now()}.jpg`;
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
          <h1 className="text-3xl font-bold text-gray-900">Remove Objects</h1>
          <p className="text-gray-600 mt-2">Remove unwanted objects from photos using inpainting</p>
        </div>
      </div>

      <div className="py-12 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Left: Settings */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4 sticky top-4">
                <h2 className="text-lg font-semibold text-gray-900">Inpaint Settings</h2>

                {/* Image Upload */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Image</label>
                  <div 
                    className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition ${
                      imagePreview ? 'border-blue-300 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
                    }`}
                    onClick={() => document.getElementById('imageInput')?.click()}
                  >
                    {imagePreview ? (
                      <div>
                        <div className="text-xs text-blue-600 font-medium truncate">{imageFile?.name}</div>
                        <img src={imagePreview} alt="preview" className="w-full h-20 object-cover rounded mt-2" />
                      </div>
                    ) : (
                      <div>
                        <p className="text-xs text-gray-600">Click to upload</p>
                      </div>
                    )}
                  </div>
                  <input 
                    id="imageInput" 
                    type="file" 
                    accept="image/*" 
                    hidden 
                    onChange={(e) => e.target.files?.[0] && handleImageSelect(e.target.files[0])}
                  />
                </div>

                {/* Method Selection */}
                {imageFile && (
                  <>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">Method</label>
                      <select
                        value={method}
                        onChange={(e) => setMethod(e.target.value as 'telea' | 'ns')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      >
                        <option value="telea">Telea (Fast)</option>
                        <option value="ns">Navier-Stokes (Smoother)</option>
                      </select>
                    </div>

                    {/* Radius Selection */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Inpaint Radius: {radius}px
                      </label>
                      <input
                        type="range"
                        min="1"
                        max="15"
                        value={radius}
                        onChange={(e) => setRadius(parseInt(e.target.value))}
                        className="w-full"
                      />
                      <p className="text-xs text-gray-500">Higher = smoother results (5-10 recommended)</p>
                    </div>

                    {/* Mask Status */}
                    <div className={`p-3 rounded-lg border ${maskFile ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
                      <p className="text-xs font-medium">
                        {maskFile ? (
                          <span className="text-green-700">✓ Mask ready</span>
                        ) : (
                          <span className="text-yellow-700">Paint mask in editor →</span>
                        )}
                      </p>
                    </div>

                    {/* Process Button */}
                    <button
                      onClick={removeObject}
                      disabled={!imageFile || !maskFile || processing}
                      className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 transition-colors flex items-center justify-center gap-2"
                    >
                      {processing ? (
                        <>
                          <Loader className="w-4 h-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        'Remove Object'
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

                    {/* Clear Button */}
                    {(imageFile || maskFile || result) && (
                      <button
                        onClick={handleClearImages}
                        className="w-full px-4 py-2 text-gray-700 bg-gray-100 rounded-lg font-medium hover:bg-gray-200"
                      >
                        Clear All
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Right: Canvas & Result */}
            <div className="lg:col-span-3 space-y-6">
              {/* Canvas Editor */}
              {imagePreview && imageDimensions && (
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Paint Mask</h2>
                  <CanvasMask
                    imageUrl={imagePreview}
                    imageWidth={imageDimensions.width}
                    imageHeight={imageDimensions.height}
                    onMaskGenerated={handleMaskGenerated}
                    brushSize={brushSize}
                    setBrushSize={setBrushSize}
                  />
                </div>
              )}

              {/* Result */}
              {result && (
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Result</h2>
                  <div className="space-y-4">
                    <img src={result} alt="result" className="w-full h-auto rounded-lg" />
                    <button
                      onClick={handleDownload}
                      className="w-full px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 flex items-center justify-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Download Result
                    </button>
                  </div>
                </div>
              )}

              {/* Initial Instructions */}
              {!imagePreview && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <h3 className="text-sm font-semibold text-blue-900 mb-2">Getting Started:</h3>
                  <ol className="text-sm text-blue-800 space-y-2 list-decimal list-inside">
                    <li>Click the image upload area to select a photo</li>
                    <li>Use the brush to paint areas you want to remove</li>
                    <li>Use the eraser to correct unwanted strokes</li>
                    <li>Click "Use This Mask" when done painting</li>
                    <li>Adjust inpainting settings if needed</li>
                    <li>Click "Remove Object" to process</li>
                  </ol>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
