'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { Download, ChevronRight, Loader, BarChart3 } from 'lucide-react';
import { HomeHeader } from '../../components/HomeHeader';
import { Footer } from '../../components/Footer';

export default function HistogramEqualizePage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [intensity, setIntensity] = useState(100);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<Blob | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onload = (event) => {
        setPreview(event.target?.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const applyHistogramEqualize = async () => {
    if (!file || !preview) return;
    setProcessing(true);

    try {
      const img = new Image();
      img.onload = async () => {
        try {
          const canvas = canvasRef.current;
          if (!canvas) {
            setProcessing(false);
            return;
          }
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            setProcessing(false);
            return;
          }

          ctx.drawImage(img, 0, 0);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imageData.data;

          // Build histogram
          const histogram = new Array(256).fill(0);
          for (let i = 0; i < data.length; i += 4) {
            const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
            histogram[Math.floor(brightness)]++;
          }

          // Calculate cumulative distribution
          const cdf = new Array(256);
          let sum = 0;
          const min = Math.min(...histogram.filter(v => v > 0));
          for (let i = 0; i < 256; i++) {
            sum += histogram[i];
            cdf[i] = sum;
          }

          // Normalize CDF
          const cdfMin = cdf.find(v => v > 0) || 1;
          const pixelCount = data.length / 4;
          for (let i = 0; i < 256; i++) {
            cdf[i] = Math.round(((cdf[i] - cdfMin) / (pixelCount - cdfMin)) * 255);
          }

          // Apply histogram equalization
          const factor = intensity / 100;
          for (let i = 0; i < data.length; i += 4) {
            const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
            const equalized = cdf[Math.floor(brightness)];

            data[i] = Math.floor(equalized * factor + data[i] * (1 - factor));
            data[i + 1] = Math.floor(equalized * factor + data[i + 1] * (1 - factor));
            data[i + 2] = Math.floor(equalized * factor + data[i + 2] * (1 - factor));
          }

          ctx.putImageData(imageData, 0, 0);
          canvas.toBlob((blob) => {
            if (!blob) {
              console.error('Failed to create blob');
              setProcessing(false);
              return;
            }
            setResult(blob);
            setProcessing(false);
          }, 'image/jpeg', 0.95);
        } catch (error) {
          console.error('Error in image onload:', error);
          setProcessing(false);
        }
      };
      img.onerror = () => {
        console.error('Error loading image');
        setProcessing(false);
      };
      img.src = preview;
    } catch (error) {
      console.error('Error applying histogram equalization:', error);
      setProcessing(false);
    }
  };

  const handleDownload = () => {
    if (result) {
      const url = URL.createObjectURL(result);
      const a = document.createElement('a');
      a.href = url;
      a.download = `histogram-equalize-${Date.now()}.jpg`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <>
      <HomeHeader />
      <main className="min-h-screen bg-slate-50 flex flex-col">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 py-16 px-4 md:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-2 text-white/80 text-sm mb-6">
              <Link href="/" className="hover:text-white transition">Home</Link>
              <ChevronRight size={16} />
              <Link href="/all-tools" className="hover:text-white transition">All Tools</Link>
              <ChevronRight size={16} />
              <span>Histogram Equalize</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">📊 Histogram Equalization</h1>
            <p className="text-lg text-white/90 max-w-2xl">
              Automatically enhance contrast using histogram equalization. Improve visibility in dark or overexposed photos.
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 py-12 px-4 md:px-8">
          <div className="max-w-4xl mx-auto">
            {/* Upload Section */}
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Enhance with Histogram Equalization</h2>
              
              <div className="mb-6">
                <label className="block text-gray-700 font-semibold mb-3">Upload Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-indigo-400 transition"
                />
              </div>

              {preview && (
                <>
                  <div className="mb-6">
                    <label className="block text-gray-700 font-semibold mb-3">
                      Enhancement Intensity: {intensity}%
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={intensity}
                      onChange={(e) => setIntensity(Number(e.target.value))}
                      className="w-full"
                    />
                    <p className="text-sm text-gray-600 mt-2">0 = original, 100 = full equalization</p>
                  </div>

                  <button
                    onClick={applyHistogramEqualize}
                    disabled={processing}
                    className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-3 px-6 rounded-lg transition flex items-center justify-center gap-2"
                  >
                    {processing ? <Loader className="animate-spin" size={20} /> : <BarChart3 size={20} />}
                    {processing ? 'Processing...' : 'Enhance Contrast'}
                  </button>
                </>
              )}

              {result && (
                <button
                  onClick={handleDownload}
                  className="w-full mt-4 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition flex items-center justify-center gap-2"
                >
                  <Download size={20} />
                  Download Enhanced Image
                </button>
              )}
            </div>

            {/* How To Section */}
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">How to Use Histogram Equalization</h2>
              <ol className="space-y-4 text-gray-700">
                <li><strong>1. Upload Photo:</strong> Select a JPG, PNG, or WebP image.</li>
                <li><strong>2. Set Intensity:</strong> Adjust enhancement strength (0-100%).</li>
                <li><strong>3. Enhance:</strong> Click "Enhance Contrast".</li>
                <li><strong>4. Download:</strong> Save your enhanced image.</li>
              </ol>
            </div>

            {/* Benefits Section */}
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Histogram Equalization Benefits</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-bold text-lg text-indigo-600 mb-2">Auto Enhancement</h3>
                  <p className="text-gray-700">Automatically improve image contrast.</p>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-indigo-600 mb-2">Better Visibility</h3>
                  <p className="text-gray-700">Enhance details in dark areas.</p>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-indigo-600 mb-2">Adjustable</h3>
                  <p className="text-gray-700">Control enhancement intensity.</p>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-indigo-600 mb-2">100% Free</h3>
                  <p className="text-gray-700">No registration or payment needed.</p>
                </div>
              </div>
            </div>

            {/* FAQ Section */}
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Frequently Asked Questions</h2>
              <div className="space-y-4">
                <details className="border-l-4 border-indigo-500 pl-4 py-2">
                  <summary className="font-bold text-gray-800 cursor-pointer">What is histogram equalization?</summary>
                  <p className="text-gray-700 mt-2">Method to enhance contrast by redistributing pixel intensities.</p>
                </details>
                <details className="border-l-4 border-indigo-500 pl-4 py-2">
                  <summary className="font-bold text-gray-800 cursor-pointer">When should I use this?</summary>
                  <p className="text-gray-700 mt-2">For underexposed, overexposed, or flat-looking images.</p>
                </details>
                <details className="border-l-4 border-indigo-500 pl-4 py-2">
                  <summary className="font-bold text-gray-800 cursor-pointer">Works on all images?</summary>
                  <p className="text-gray-700 mt-2">Yes, works on any photo format.</p>
                </details>
                <details className="border-l-4 border-indigo-500 pl-4 py-2">
                  <summary className="font-bold text-gray-800 cursor-pointer">Can I use commercially?</summary>
                  <p className="text-gray-700 mt-2">Yes, enhanced images can be used commercially.</p>
                </details>
                <details className="border-l-4 border-indigo-500 pl-4 py-2">
                  <summary className="font-bold text-gray-800 cursor-pointer">Is data private?</summary>
                  <p className="text-gray-700 mt-2">Yes, local browser processing only.</p>
                </details>
                <details className="border-l-4 border-indigo-500 pl-4 py-2">
                  <summary className="font-bold text-gray-800 cursor-pointer">Non-destructive?</summary>
                  <p className="text-gray-700 mt-2">Intensity slider allows partial enhancement.</p>
                </details>
              </div>
            </div>

            {/* Related Tools */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Related Enhancement Tools</h2>
              <div className="grid md:grid-cols-3 gap-4">
                <Link href="/all-tools/brightness-contrast" className="p-4 border-2 border-indigo-200 rounded-lg hover:bg-indigo-50 transition">
                  <h3 className="font-bold text-gray-800">Brightness Contrast</h3>
                  <p className="text-sm text-gray-600">Manual adjustments</p>
                </Link>
                <Link href="/all-tools/image-enhancer" className="p-4 border-2 border-indigo-200 rounded-lg hover:bg-indigo-50 transition">
                  <h3 className="font-bold text-gray-800">Image Enhancer</h3>
                  <p className="text-sm text-gray-600">Multi-param enhancement</p>
                </Link>
                <Link href="/all-tools/color-balance" className="p-4 border-2 border-indigo-200 rounded-lg hover:bg-indigo-50 transition">
                  <h3 className="font-bold text-gray-800">Color Balance</h3>
                  <p className="text-sm text-gray-600">Color adjustments</p>
                </Link>
              </div>
            </div>
          </div>
        </div>

        <Footer />
      </main>

      <canvas ref={canvasRef} style={{ display: 'none' }} />

      <script type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'WebApplication',
          name: 'Histogram Equalization',
          description: 'Free online histogram equalization and auto contrast enhancement tool',
          url: 'https://simplifyconvert.com/all-tools/histogram-equalize',
          applicationCategory: 'MultimediaApplication',
          offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD',
          },
        })}
      </script>
    </>
  );
}
