'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { Download, ChevronRight, Loader, Wand2 } from 'lucide-react';
import { HomeHeader } from '../../components/HomeHeader';
import { Footer } from '../../components/Footer';

export default function EdgeDetectPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [threshold, setThreshold] = useState(50);
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

  const applyEdgeDetect = async () => {
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
          const output = new Uint8ClampedArray(data);

          // Sobel edge detection
          const width = canvas.width;
          const height = canvas.height;
          const thresholdValue = threshold;

          for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
              let gx = 0, gy = 0;

              // Sobel X kernel
              for (let ky = -1; ky <= 1; ky++) {
                for (let kx = -1; kx <= 1; kx++) {
                  const idx = ((y + ky) * width + (x + kx)) * 4;
                  const gray = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
                  const sobX = [[-1, 0, 1], [-2, 0, 2], [-1, 0, 1]];
                  const sobY = [[-1, -2, -1], [0, 0, 0], [1, 2, 1]];
                  gx += gray * sobX[ky + 1][kx + 1];
                  gy += gray * sobY[ky + 1][kx + 1];
                }
              }

              const magnitude = Math.sqrt(gx * gx + gy * gy);
              const value = magnitude > thresholdValue ? 255 : 0;

              const idx = (y * width + x) * 4;
              output[idx] = value;
              output[idx + 1] = value;
              output[idx + 2] = value;
            }
          }

          ctx.putImageData(new ImageData(output, width, height), 0, 0);
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
      console.error('Error applying edge detection:', error);
      setProcessing(false);
    }
  };

  const handleDownload = () => {
    if (result) {
      const url = URL.createObjectURL(result);
      const a = document.createElement('a');
      a.href = url;
      a.download = `edge-detect-${Date.now()}.jpg`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <>
      <HomeHeader />
      <main className="min-h-screen bg-slate-50 flex flex-col">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-gray-600 via-slate-600 to-gray-700 py-16 px-4 md:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-2 text-white/80 text-sm mb-6">
              <Link href="/" className="hover:text-white transition">Home</Link>
              <ChevronRight size={16} />
              <Link href="/all-tools" className="hover:text-white transition">All Tools</Link>
              <ChevronRight size={16} />
              <span>Edge Detection</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">🔍 Edge Detection</h1>
            <p className="text-lg text-white/90 max-w-2xl">
              Detect and highlight edges in images. Find boundaries and contours automatically.
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 py-12 px-4 md:px-8">
          <div className="max-w-4xl mx-auto">
            {/* Upload Section */}
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Detect Image Edges</h2>
              
              <div className="mb-6">
                <label className="block text-gray-700 font-semibold mb-3">Upload Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition"
                />
              </div>

              {preview && (
                <>
                  <div className="mb-6">
                    <label className="block text-gray-700 font-semibold mb-3">
                      Edge Threshold: {threshold}
                    </label>
                    <input
                      type="range"
                      min="10"
                      max="200"
                      value={threshold}
                      onChange={(e) => setThreshold(Number(e.target.value))}
                      className="w-full"
                    />
                    <p className="text-sm text-gray-600 mt-2">Low = more edges, High = fewer edges</p>
                  </div>

                  <button
                    onClick={applyEdgeDetect}
                    disabled={processing}
                    className="w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg transition flex items-center justify-center gap-2"
                  >
                    {processing ? <Loader className="animate-spin" size={20} /> : <Wand2 size={20} />}
                    {processing ? 'Processing...' : 'Detect Edges'}
                  </button>
                </>
              )}

              {result && (
                <button
                  onClick={handleDownload}
                  className="w-full mt-4 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition flex items-center justify-center gap-2"
                >
                  <Download size={20} />
                  Download Edge Map
                </button>
              )}
            </div>

            {/* How To Section */}
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">How to Detect Edges</h2>
              <ol className="space-y-4 text-gray-700">
                <li><strong>1. Upload Photo:</strong> Select a JPG, PNG, or WebP image.</li>
                <li><strong>2. Set Threshold:</strong> Adjust edge sensitivity (10-200).</li>
                <li><strong>3. Detect:</strong> Click "Detect Edges".</li>
                <li><strong>4. Download:</strong> Save your edge detection map.</li>
              </ol>
            </div>

            {/* Benefits Section */}
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Edge Detection Benefits</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-bold text-lg text-gray-700 mb-2">Boundary Finding</h3>
                  <p className="text-gray-700">Detect object edges automatically.</p>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-700 mb-2">Adjustable Threshold</h3>
                  <p className="text-gray-700">Control edge sensitivity level.</p>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-700 mb-2">Sobel Algorithm</h3>
                  <p className="text-gray-700">Professional edge detection method.</p>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-700 mb-2">100% Free</h3>
                  <p className="text-gray-700">No registration or payment needed.</p>
                </div>
              </div>
            </div>

            {/* FAQ Section */}
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Frequently Asked Questions</h2>
              <div className="space-y-4">
                <details className="border-l-4 border-gray-600 pl-4 py-2">
                  <summary className="font-bold text-gray-800 cursor-pointer">What is edge detection?</summary>
                  <p className="text-gray-700 mt-2">Finding boundaries and transitions in images.</p>
                </details>
                <details className="border-l-4 border-gray-600 pl-4 py-2">
                  <summary className="font-bold text-gray-800 cursor-pointer">What threshold to use?</summary>
                  <p className="text-gray-700 mt-2">50-100 for balanced. Higher for fewer edges.</p>
                </details>
                <details className="border-l-4 border-gray-600 pl-4 py-2">
                  <summary className="font-bold text-gray-800 cursor-pointer">Works on all images?</summary>
                  <p className="text-gray-700 mt-2">Yes, works on any photo format.</p>
                </details>
                <details className="border-l-4 border-gray-600 pl-4 py-2">
                  <summary className="font-bold text-gray-800 cursor-pointer">Can I use commercially?</summary>
                  <p className="text-gray-700 mt-2">Yes, edge maps can be used commercially.</p>
                </details>
                <details className="border-l-4 border-gray-600 pl-4 py-2">
                  <summary className="font-bold text-gray-800 cursor-pointer">Is data private?</summary>
                  <p className="text-gray-700 mt-2">Yes, local browser processing only.</p>
                </details>
                <details className="border-l-4 border-gray-600 pl-4 py-2">
                  <summary className="font-bold text-gray-800 cursor-pointer">Sobel algorithm?</summary>
                  <p className="text-gray-700 mt-2">Professional edge detection algorithm.</p>
                </details>
              </div>
            </div>

            {/* Related Tools */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Related Processing Tools</h2>
              <div className="grid md:grid-cols-3 gap-4">
                <Link href="/all-tools/emboss-effect" className="p-4 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition">
                  <h3 className="font-bold text-gray-800">Emboss Effect</h3>
                  <p className="text-sm text-gray-600">3D effects</p>
                </Link>
                <Link href="/all-tools/blur-image" className="p-4 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition">
                  <h3 className="font-bold text-gray-800">Blur Image</h3>
                  <p className="text-sm text-gray-600">Blur effects</p>
                </Link>
                <Link href="/all-tools/sharpen-image" className="p-4 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition">
                  <h3 className="font-bold text-gray-800">Sharpen Image</h3>
                  <p className="text-sm text-gray-600">Enhance clarity</p>
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
          name: 'Edge Detection Tool',
          description: 'Free online edge detection and boundary finding tool',
          url: 'https://simplifyconvert.com/all-tools/edge-detect',
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
