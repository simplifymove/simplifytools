'use client';

import React, { useState, ChangeEvent, FormEvent } from 'react';
import Link from 'next/link';
import { Download, ChevronRight, Loader, Upload, Sparkles } from 'lucide-react';
import { HomeHeader } from '../../components/HomeHeader';
import { Footer } from '../../components/Footer';

export default function BlurBackgroundPage() {
  const [image, setImage] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [blurStrength, setBlurStrength] = useState(35);
  const [featherRadius, setFeatherRadius] = useState(5);
  const [portraitMode, setPortraitMode] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setResult(null);

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
      formData.append('blurStrength', blurStrength.toString());
      formData.append('featherRadius', featherRadius.toString());
      formData.append('portraitMode', portraitMode.toString());

      const processResponse = await fetch('/api/blur-background', {
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

  const downloadResult = () => {
    if (!result) return;

    const link = document.createElement('a');
    link.href = result;
    link.download = `blur-background-${Date.now()}.jpg`;
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
              <Link href="/all-tools" className="hover:text-white transition">All Tools</Link>
              <ChevronRight size={16} />
              <span>Blur Background</span>
            </div>

            {/* Title Section */}
            <div className="flex items-start gap-4">
              <div className="p-3 bg-white/20 rounded-lg">
                <Sparkles size={32} className="text-white" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">Blur Background</h1>
                <p className="text-lg text-white/90">Professional portrait mode effect with sharp subject and blurred background. Create stunning depth effect photos.</p>
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
                      <p className="text-xs text-gray-500 mt-1">JPG, PNG, WebP up to 10MB</p>
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
                      <h3 className="text-sm font-semibold text-gray-700 mb-3">Blur Background Result</h3>
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
                  {/* Options */}
                  <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <h3 className="font-semibold text-gray-900 mb-4">Blur Settings</h3>
                    
                    {/* Blur Strength */}
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <label className="text-sm font-medium text-gray-700">Blur Strength</label>
                        <span className="text-sm font-semibold text-orange-600">{blurStrength}</span>
                      </div>
                      <input
                        type="range"
                        min="15"
                        max="51"
                        step="2"
                        value={blurStrength}
                        onChange={(e) => setBlurStrength(parseInt(e.target.value))}
                        disabled={processing}
                        className="w-full"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {blurStrength <= 25 ? 'Natural blur' : blurStrength <= 35 ? 'Balanced portrait' : 'Strong effect'}
                      </p>
                    </div>

                    {/* Feather Radius */}
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <label className="text-sm font-medium text-gray-700">Edge Feathering</label>
                        <span className="text-sm font-semibold text-orange-600">{featherRadius}px</span>
                      </div>
                      <input
                        type="range"
                        min="3"
                        max="7"
                        step="1"
                        value={featherRadius}
                        onChange={(e) => setFeatherRadius(parseInt(e.target.value))}
                        disabled={processing}
                        className="w-full"
                      />
                      <p className="text-xs text-gray-500 mt-1">Softer edges, smoother transitions</p>
                    </div>

                    {/* Portrait Mode */}
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={portraitMode}
                        onChange={(e) => setPortraitMode(e.target.checked)}
                        disabled={processing}
                        className="w-4 h-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                      />
                      <span className="text-sm font-medium text-gray-700">Portrait Mode</span>
                    </label>
                    <p className="text-xs text-gray-500 mt-2">Darkens background for depth effect</p>
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
                          Processing (30-60s)...
                        </>
                      ) : (
                        '✨ Apply Blur Background'
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
                    <h3 className="font-semibold text-blue-900 mb-2">About</h3>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Professional portrait mode</li>
                      <li>• Adjustable blur strength</li>
                      <li>• Edge feathering control</li>
                      <li>• Portrait mode option</li>
                    </ul>
                  </div>

                  {/* Speed Info */}
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <h3 className="font-semibold text-amber-900 mb-1">⚡ Processing Time</h3>
                    <p className="text-xs text-amber-800">First run: 30-60s. Subsequent runs: 10-20s.</p>
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







