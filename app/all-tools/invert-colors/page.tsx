'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { Download, ChevronRight, Loader, Sparkles } from 'lucide-react';
import { HomeHeader } from '../../components/HomeHeader';
import { Footer } from '../../components/Footer';

export default function InvertColorsPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
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

  const applyInvertColors = async () => {
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

          for (let i = 0; i < data.length; i += 4) {
            data[i] = 255 - data[i];       // Red
            data[i + 1] = 255 - data[i + 1]; // Green
            data[i + 2] = 255 - data[i + 2]; // Blue
            // Alpha channel (i+3) remains unchanged
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
      console.error('Error applying invert colors:', error);
      setProcessing(false);
    }
  };

  const handleDownload = () => {
    if (result) {
      const url = URL.createObjectURL(result);
      const a = document.createElement('a');
      a.href = url;
      a.download = `inverted-${Date.now()}.jpg`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <>
      <HomeHeader />
      <main className="min-h-screen bg-slate-50 flex flex-col">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 py-16 px-4 md:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-2 text-white/80 text-sm mb-6">
              <Link href="/" className="hover:text-white transition">Home</Link>
              <ChevronRight size={16} />
              <Link href="/all-tools" className="hover:text-white transition">All Tools</Link>
              <ChevronRight size={16} />
              <span>Invert Colors</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">🎨 Invert Colors</h1>
            <p className="text-lg text-white/90 max-w-2xl">
              Create stunning negative color effects. Transform your photos with inverted RGB values.
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 py-12 px-4 md:px-8">
          <div className="max-w-4xl mx-auto">
            {/* Upload Section */}
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Invert Image Colors</h2>
              
              <div className="mb-6">
                <label className="block text-gray-700 font-semibold mb-3">Upload Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-rose-400 transition"
                />
              </div>

              {preview && (
                <>
                  <button
                    onClick={applyInvertColors}
                    disabled={processing}
                    className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-3 px-6 rounded-lg transition flex items-center justify-center gap-2"
                  >
                    {processing ? <Loader className="animate-spin" size={20} /> : <Sparkles size={20} />}
                    {processing ? 'Processing...' : 'Invert Colors'}
                  </button>
                </>
              )}

              {result && (
                <button
                  onClick={handleDownload}
                  className="w-full mt-4 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition flex items-center justify-center gap-2"
                >
                  <Download size={20} />
                  Download Inverted Image
                </button>
              )}
            </div>

            {/* How To Section */}
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">How to Invert Image Colors</h2>
              <ol className="space-y-4 text-gray-700">
                <li><strong>1. Upload Your Image:</strong> Select a JPG, PNG, or WebP image file.</li>
                <li><strong>2. Click Invert:</strong> Press "Invert Colors" to process your image.</li>
                <li><strong>3. Instant Effect:</strong> View the negative color transformation instantly.</li>
                <li><strong>4. Download:</strong> Save your inverted image as JPG.</li>
              </ol>
            </div>

            {/* Benefits Section */}
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Creative Uses for Color Inversion</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-bold text-lg text-rose-600 mb-2">Artistic Effects</h3>
                  <p className="text-gray-700">Create unique and surreal visual styles for creative projects.</p>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-rose-600 mb-2">Photo Negatives</h3>
                  <p className="text-gray-700">Replicate the classic film negative look digitally.</p>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-rose-600 mb-2">Design Experimentation</h3>
                  <p className="text-gray-700">Explore color palettes and visual compositions.</p>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-rose-600 mb-2">100% Free Tool</h3>
                  <p className="text-gray-700">No subscription, registration, or hidden fees required.</p>
                </div>
              </div>
            </div>

            {/* FAQ Section */}
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Frequently Asked Questions</h2>
              <div className="space-y-4">
                <details className="border-l-4 border-rose-500 pl-4 py-2">
                  <summary className="font-bold text-gray-800 cursor-pointer">What does inverting colors mean?</summary>
                  <p className="text-gray-700 mt-2">It converts each RGB color value to 255 minus that value, creating a negative image effect.</p>
                </details>
                <details className="border-l-4 border-rose-500 pl-4 py-2">
                  <summary className="font-bold text-gray-800 cursor-pointer">Is this like photo negative?</summary>
                  <p className="text-gray-700 mt-2">Yes! It simulates the classic film negative appearance you'd see on old film slides.</p>
                </details>
                <details className="border-l-4 border-rose-500 pl-4 py-2">
                  <summary className="font-bold text-gray-800 cursor-pointer">Can I invert twice to restore original?</summary>
                  <p className="text-gray-700 mt-2">Yes! Inverting an inverted image returns it to the original colors.</p>
                </details>
                <details className="border-l-4 border-rose-500 pl-4 py-2">
                  <summary className="font-bold text-gray-800 cursor-pointer">What formats are supported?</summary>
                  <p className="text-gray-700 mt-2">We support JPG, PNG, WebP, BMP, TIFF, and most standard image formats.</p>
                </details>
                <details className="border-l-4 border-rose-500 pl-4 py-2">
                  <summary className="font-bold text-gray-800 cursor-pointer">Is my image private?</summary>
                  <p className="text-gray-700 mt-2">Absolutely. Processing happens in your browser, images never reach our servers.</p>
                </details>
                <details className="border-l-4 border-rose-500 pl-4 py-2">
                  <summary className="font-bold text-gray-800 cursor-pointer">Does it preserve image quality?</summary>
                  <p className="text-gray-700 mt-2">Yes, we save at 95% JPEG quality to maintain excellent image fidelity.</p>
                </details>
              </div>
            </div>

            {/* Related Tools */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Related Image Tools</h2>
              <div className="grid md:grid-cols-3 gap-4">
                <Link href="/all-tools/black-white-filter" className="p-4 border-2 border-rose-200 rounded-lg hover:bg-rose-50 transition">
                  <h3 className="font-bold text-gray-800">Black & White</h3>
                  <p className="text-sm text-gray-600">Convert to grayscale</p>
                </Link>
                <Link href="/all-tools/color-grader" className="p-4 border-2 border-rose-200 rounded-lg hover:bg-rose-50 transition">
                  <h3 className="font-bold text-gray-800">Color Grader</h3>
                  <p className="text-sm text-gray-600">Professional color adjustment</p>
                </Link>
                <Link href="/all-tools/vintage-filter" className="p-4 border-2 border-rose-200 rounded-lg hover:bg-rose-50 transition">
                  <h3 className="font-bold text-gray-800">Vintage Filter</h3>
                  <p className="text-sm text-gray-600">Retro color effects</p>
                </Link>
              </div>
            </div>
          </div>
        </div>

        <Footer />
      </main>

      {/* Hidden canvas for processing */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* JSON-LD Schema */}
      <script type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'WebApplication',
          name: 'Invert Colors',
          description: 'Free online color inversion tool for creative effects',
          url: 'https://simplifyconvert.com/all-tools/invert-colors',
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
