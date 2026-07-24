'use client';

import React, { useState, ChangeEvent, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Download, ChevronRight, Loader, Upload, SparklesIcon } from 'lucide-react';
import { HomeHeader } from '../../components/HomeHeader';
import { Footer } from '../../components/Footer';
import { uploadBrowserDownloadResultFromUrl } from '@/app/lib/download-result-client';

export default function UnblurImagePage() {
  const router = useRouter();
  const [image, setImage] = useState<string | null>(null);
  const [originalName, setOriginalName] = useState('image.jpg');
  const [preview, setPreview] = useState<string | null>(null);
  const [mode, setMode] = useState<'motion' | 'defocus'>('motion');
  
  // Deblurring parameters (Restormer SOTA)
  const [strength, setStrength] = useState(1.0);
  const [iterations, setIterations] = useState(1);
  
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setResult(null);
    setOriginalName(file.name);

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setImage(dataUrl);
      setPreview(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleClearPreview = () => {
    setImage(null);
    setPreview(null);
    setResult(null);
    setOriginalName('image.jpg');
    setError(null);
  };

  const handleProcess = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!image) {
      setError('Please upload an image first');
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      const response = await fetch(image);
      const blob = await response.blob();

      const formData = new FormData();
      formData.append('image', blob, 'image.jpg');
      formData.append('mode', mode);
      formData.append('strength', strength.toString());
      formData.append('iterations', iterations.toString());

      const processResponse = await fetch('/api/unblur-image', {
        method: 'POST',
        body: formData,
      });

      const data = await processResponse.json();

      if (!processResponse.ok) {
        throw new Error(data.error || 'Processing failed');
      }

      const resultDataUrl = `data:image/jpeg;base64,${data.image}`;
      setResult(resultDataUrl);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      console.error('Processing error:', err);
    } finally {
      setProcessing(false);
    }
  };

  const downloadResult = async () => {
    if (!result || processing) return;

    setProcessing(true);
    setError(null);

    try {
      const outputName = `unblur-image-${Date.now()}.jpg`;
      const download = await uploadBrowserDownloadResultFromUrl({
        url: result,
        toolSlug: 'unblur-image',
        originalName,
        outputName,
      });

      router.push(download.downloadPageUrl);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Unable to prepare the download.',
      );
    } finally {
      setProcessing(false);
    }
  };

  return (
    <>
      <HomeHeader />
      <main className="min-h-screen bg-linear-to-b from-slate-50 to-slate-100 flex flex-col">
        {/* Hero Header */}
        <div className="relative bg-orange-500 py-16 px-4 md:px-8 overflow-hidden">
          <div className="max-w-6xl mx-auto relative z-10">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-white/90 text-sm mb-6">
              <Link href="/" className="hover:text-white transition">Home</Link>
              <ChevronRight size={16} />
              <Link href="/all-tools" className="hover:text-white transition">All Tools</Link>
              <ChevronRight size={16} />
              <span>Unblur Image</span>
            </div>

            {/* Title Section */}
            <div className="flex items-start gap-4">
              <div className="p-3 bg-white/20 rounded-lg">
                <SparklesIcon size={32} className="text-white" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">Unblur Image</h1>
                <p className="text-lg text-white/90">Restormer-based deblurring (CVPR 2022). State-of-the-art Transformer restoration for motion blur, defocus blur, and general image enhancement.</p>
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
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Step 1: Upload Image</h2>
                  
                  <div className="relative mb-6">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={processing}
                      className="hidden"
                      id="image-upload"
                    />
                    <label
                      htmlFor="image-upload"
                      className="block w-full p-8 border-2 border-dashed border-orange-300 rounded-lg cursor-pointer hover:border-orange-500 hover:bg-orange-50 transition text-center"
                    >
                      <Upload className="w-8 h-8 mx-auto text-orange-500 mb-3" />
                      <span className="text-sm font-medium text-gray-700">
                        {image ? '✓ Image selected' : 'Click to upload image'}
                      </span>
                    </label>
                  </div>

                  {/* Preview */}
                  {preview && (
                    <div className="mb-6">
                      <h3 className="text-sm font-semibold text-gray-700 mb-3">Original Preview</h3>
                      <img
                        src={preview}
                        alt="Original"
                        className="w-full h-64 object-cover rounded-lg border border-gray-200"
                      />
                      <button
                        onClick={handleClearPreview}
                        className="mt-3 text-sm text-gray-600 hover:text-gray-900 underline"
                      >
                        Clear &amp; upload different image
                      </button>
                    </div>
                  )}

                  {/* Result */}
                  {result && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h3 className="text-sm font-semibold text-gray-700 mb-3">Unblurred Result</h3>
                      <img
                        src={result}
                        alt="Result"
                        className="w-full h-64 object-cover rounded-lg border border-blue-300 mb-3"
                      />
                    </div>
                  )}

                  {/* Error */}
                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <p className="text-red-900 font-semibold">Error</p>
                      <p className="text-red-700 text-sm">{error}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Controls - Right (sticky sidebar) */}
              <div className="lg:col-span-1">
                <div className="sticky top-4 space-y-4">
                  {/* Mode Selection */}
                  <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <h3 className="font-semibold text-gray-900 mb-4">Deblurring Mode</h3>
                    
                    <label className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer mb-3 border-2 border-gray-200 hover:border-orange-300 transition">
                      <input
                        type="radio"
                        name="mode"
                        value="motion"
                        checked={mode === 'motion'}
                        onChange={() => setMode('motion')}
                        disabled={processing}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 text-sm">Motion Deblur</p>
                        <p className="text-xs text-gray-500">Removes camera shake & movement blur</p>
                      </div>
                    </label>

                    <label className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer border-2 border-gray-200 hover:border-orange-300 transition">
                      <input
                        type="radio"
                        name="mode"
                        value="defocus"
                        checked={mode === 'defocus'}
                        onChange={() => setMode('defocus')}
                        disabled={processing}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 text-sm">Defocus Deblur</p>
                        <p className="text-xs text-gray-500">Removes out-of-focus blur</p>
                      </div>
                    </label>
                  </div>

                  {/* Deblurring Parameters */}
                  <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
                    <h3 className="font-semibold text-gray-900">Restoration Strength</h3>
                    
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="text-sm font-medium text-gray-700">Deblur Strength</label>
                        <span className="text-sm font-semibold text-orange-600">{strength.toFixed(1)}x</span>
                      </div>
                      <input
                        type="range"
                        min="0.5"
                        max="2"
                        step="0.1"
                        value={strength}
                        onChange={(e) => setStrength(parseFloat(e.target.value))}
                        disabled={processing}
                        className="w-full"
                      />
                      <p className="text-xs text-gray-500 mt-1">0.5 = Subtle | 1.0 = Default | 2.0 = Aggressive</p>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="text-sm font-medium text-gray-700">Refinement Passes</label>
                        <span className="text-sm font-semibold text-orange-600">{iterations}</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="5"
                        step="1"
                        value={iterations}
                        onChange={(e) => setIterations(parseInt(e.target.value))}
                        disabled={processing}
                        className="w-full"
                      />
                      <p className="text-xs text-gray-500 mt-1">More passes = Better quality (slower processing)</p>
                    </div>
                  </div>

                  {/* Process Button */}
                  <form onSubmit={handleProcess}>
                    <button
                      type="submit"
                      disabled={processing || !image}
                      className="w-full py-3 px-6 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2"
                    >
                      {processing ? (
                        <>
                          <Loader size={20} className="animate-spin" />
                          Restormer Processing...
                        </>
                      ) : (
                        `Deblur with ${mode === 'motion' ? 'Motion' : 'Defocus'} Restormer`
                      )}
                    </button>
                  </form>

                  {/* Download Button */}
                  {result && (
                    <button
                      onClick={downloadResult}
                      className="w-full py-3 px-6 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2"
                    >
                      <Download size={20} />
                      Download Result
                    </button>
                  )}

                  {/* Info Box */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-900 mb-2">Technology</h3>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• <span className="font-semibold">SOTA:</span> Restormer (CVPR 2022 Oral)</li>
                      <li>• <span className="font-semibold">Architecture:</span> Transformer-based restoration</li>
                      <li>• <span className="font-semibold">Motion Mode:</span> Advanced multi-scale Wiener filtering</li>
                      <li>• <span className="font-semibold">Defocus Mode:</span> Laplacian pyramid decomposition</li>
                      <li>• Professional-grade GPU/CPU processing</li>
                    </ul>
                  </div>
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






