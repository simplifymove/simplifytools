'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { Download, ChevronRight, Loader, Wand2 } from 'lucide-react';
import { HomeHeader } from '../../components/HomeHeader';
import { Footer } from '../../components/Footer';

export default function ChromaticAberrationPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [offset, setOffset] = useState(5);
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

  const applyChromaticAberration = async () => {
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

          const redShift = offset;
          const blueShift = -offset;

          for (let i = 0; i < data.length; i += 4) {
            const idx = i / 4;
            const x = idx % canvas.width;
            const y = Math.floor(idx / canvas.width);

            const redX = Math.min(Math.max(x + redShift, 0), canvas.width - 1);
            const blueX = Math.min(Math.max(x + blueShift, 0), canvas.width - 1);

            const redIdx = (y * canvas.width + redX) * 4;
            const blueIdx = (y * canvas.width + blueX) * 4;

            data[i] = data[redIdx];
            data[i + 1] = data[i + 1];
            data[i + 2] = data[blueIdx + 2];
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
      console.error('Error applying chromatic aberration:', error);
      setProcessing(false);
    }
  };

  const handleDownload = () => {
    if (result) {
      const url = URL.createObjectURL(result);
      const a = document.createElement('a');
      a.href = url;
      a.download = `chromatic-aberration-${Date.now()}.jpg`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <>
      <HomeHeader />
      <main className="min-h-screen bg-slate-50 flex flex-col">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-500 py-16 px-4 md:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-2 text-white/80 text-sm mb-6">
              <Link href="/" className="hover:text-white transition">Home</Link>
              <ChevronRight size={16} />
              <Link href="/all-tools" className="hover:text-white transition">All Tools</Link>
              <ChevronRight size={16} />
              <span>Chromatic Aberration</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">🌈 Chromatic Aberration</h1>
            <p className="text-lg text-white/90 max-w-2xl">
              Create RGB channel separation effects. Apply professional color-shift distortions to images.
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 py-12 px-4 md:px-8">
          <div className="max-w-4xl mx-auto">
            {/* Upload Section */}
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Apply Chromatic Aberration</h2>
              
              <div className="mb-6">
                <label className="block text-gray-700 font-semibold mb-3">Upload Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-purple-400 transition"
                />
              </div>

              {preview && (
                <>
                  <div className="mb-6">
                    <label className="block text-gray-700 font-semibold mb-3">
                      Channel Offset: {offset}px
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="20"
                      value={offset}
                      onChange={(e) => setOffset(Number(e.target.value))}
                      className="w-full"
                    />
                    <p className="text-sm text-gray-600 mt-2">1 = subtle, 20 = strong separation</p>
                  </div>

                  <button
                    onClick={applyChromaticAberration}
                    disabled={processing}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg transition flex items-center justify-center gap-2"
                  >
                    {processing ? <Loader className="animate-spin" size={20} /> : <Wand2 size={20} />}
                    {processing ? 'Processing...' : 'Apply Chromatic Aberration'}
                  </button>
                </>
              )}

              {result && (
                <button
                  onClick={handleDownload}
                  className="w-full mt-4 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition flex items-center justify-center gap-2"
                >
                  <Download size={20} />
                  Download Aberrated Image
                </button>
              )}
            </div>

            {/* How To Section */}
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">How to Apply Chromatic Aberration</h2>
              <ol className="space-y-4 text-gray-700">
                <li><strong>1. Upload Photo:</strong> Select a JPG, PNG, or WebP image.</li>
                <li><strong>2. Adjust Offset:</strong> Control channel separation amount (1-20px).</li>
                <li><strong>3. Apply Effect:</strong> Click "Apply Chromatic Aberration".</li>
                <li><strong>4. Download:</strong> Save your aberrated image.</li>
              </ol>
            </div>

            {/* Benefits Section */}
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Chromatic Aberration Benefits</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-bold text-lg text-purple-600 mb-2">RGB Separation</h3>
                  <p className="text-gray-700">Create color channel separation effects.</p>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-purple-600 mb-2">Customizable</h3>
                  <p className="text-gray-700">Control offset amount for desired effect.</p>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-purple-600 mb-2">Professional Look</h3>
                  <p className="text-gray-700">Create artistic color distortion effects.</p>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-purple-600 mb-2">100% Free</h3>
                  <p className="text-gray-700">No registration or payment needed.</p>
                </div>
              </div>
            </div>

            {/* FAQ Section */}
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Frequently Asked Questions</h2>
              <div className="space-y-4">
                <details className="border-l-4 border-purple-500 pl-4 py-2">
                  <summary className="font-bold text-gray-800 cursor-pointer">What offset should I use?</summary>
                  <p className="text-gray-700 mt-2">Start at 5 for subtle effect. Higher for stronger separation.</p>
                </details>
                <details className="border-l-4 border-purple-500 pl-4 py-2">
                  <summary className="font-bold text-gray-800 cursor-pointer">Works on all images?</summary>
                  <p className="text-gray-700 mt-2">Yes, works on any photo. Results vary by content.</p>
                </details>
                <details className="border-l-4 border-purple-500 pl-4 py-2">
                  <summary className="font-bold text-gray-800 cursor-pointer">Can I use commercially?</summary>
                  <p className="text-gray-700 mt-2">Yes, aberrated images can be used commercially.</p>
                </details>
                <details className="border-l-4 border-purple-500 pl-4 py-2">
                  <summary className="font-bold text-gray-800 cursor-pointer">What output quality?</summary>
                  <p className="text-gray-700 mt-2">High-quality JPEG with excellent effect.</p>
                </details>
                <details className="border-l-4 border-purple-500 pl-4 py-2">
                  <summary className="font-bold text-gray-800 cursor-pointer">Is data private?</summary>
                  <p className="text-gray-700 mt-2">Yes, local browser processing only.</p>
                </details>
                <details className="border-l-4 border-purple-500 pl-4 py-2">
                  <summary className="font-bold text-gray-800 cursor-pointer">Real chromatic aberration?</summary>
                  <p className="text-gray-700 mt-2">Simulates the optical effect with RGB separation.</p>
                </details>
              </div>
            </div>

            {/* Related Tools */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Related Effect Tools</h2>
              <div className="grid md:grid-cols-3 gap-4">
                <Link href="/all-tools/glitch-effect" className="p-4 border-2 border-purple-200 rounded-lg hover:bg-purple-50 transition">
                  <h3 className="font-bold text-gray-800">Glitch Effect</h3>
                  <p className="text-sm text-gray-600">Digital artifacts</p>
                </Link>
                <Link href="/all-tools/duotone-effect" className="p-4 border-2 border-purple-200 rounded-lg hover:bg-purple-50 transition">
                  <h3 className="font-bold text-gray-800">Duotone Effect</h3>
                  <p className="text-sm text-gray-600">Color conversion</p>
                </Link>
                <Link href="/all-tools/neon-glow" className="p-4 border-2 border-purple-200 rounded-lg hover:bg-purple-50 transition">
                  <h3 className="font-bold text-gray-800">Neon Glow</h3>
                  <p className="text-sm text-gray-600">Neon effects</p>
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
          name: 'Chromatic Aberration',
          description: 'Free online chromatic aberration and RGB channel separation tool',
          url: 'https://simplifyconvert.com/all-tools/chromatic-aberration',
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
