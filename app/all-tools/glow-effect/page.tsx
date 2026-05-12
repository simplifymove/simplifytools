'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { Download, ChevronRight, Loader, Sparkles } from 'lucide-react';
import { HomeHeader } from '../../components/HomeHeader';
import { Footer } from '../../components/Footer';

export default function GlowEffectPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [intensity, setIntensity] = useState(20);
  const [blur, setBlur] = useState(15);
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

  const applyGlowEffect = async () => {
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

          // Draw original image
          ctx.drawImage(img, 0, 0);
          
          // Create glow by brightening and blurring
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imageData.data;

          // Brighten image for glow effect
          for (let i = 0; i < data.length; i += 4) {
            const add = intensity;
            data[i] = Math.min(255, data[i] + add);
            data[i + 1] = Math.min(255, data[i + 1] + add);
            data[i + 2] = Math.min(255, data[i + 2] + add);
          }

          // Apply multiple blur passes for glow effect
          for (let pass = 0; pass < 2; pass++) {
            for (let y = 1; y < canvas.height - 1; y++) {
              for (let x = 1; x < canvas.width - 1; x++) {
                const idx = (y * canvas.width + x) * 4;
                let sumR = 0, sumG = 0, sumB = 0, count = 0;

                for (let dy = -blur / 10; dy <= blur / 10; dy++) {
                  for (let dx = -blur / 10; dx <= blur / 10; dx++) {
                    const ny = Math.min(canvas.height - 1, Math.max(0, y + Math.round(dy)));
                    const nx = Math.min(canvas.width - 1, Math.max(0, x + Math.round(dx)));
                    const nIdx = (ny * canvas.width + nx) * 4;
                    
                    sumR += data[nIdx];
                    sumG += data[nIdx + 1];
                    sumB += data[nIdx + 2];
                    count++;
                  }
                }

                data[idx] = Math.min(255, sumR / count);
                data[idx + 1] = Math.min(255, sumG / count);
                data[idx + 2] = Math.min(255, sumB / count);
              }
            }
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
      console.error('Error applying glow effect:', error);
      setProcessing(false);
    }
  };

  const handleDownload = () => {
    if (result) {
      const url = URL.createObjectURL(result);
      const a = document.createElement('a');
      a.href = url;
      a.download = `glow-${Date.now()}.jpg`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <>
      <HomeHeader />
      <main className="min-h-screen bg-slate-50 flex flex-col">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-pink-400 via-purple-400 to-pink-500 py-16 px-4 md:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-2 text-white/80 text-sm mb-6">
              <Link href="/" className="hover:text-white transition">Home</Link>
              <ChevronRight size={16} />
              <Link href="/all-tools" className="hover:text-white transition">All Tools</Link>
              <ChevronRight size={16} />
              <span>Glow Effect</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">✨ Glow Effect</h1>
            <p className="text-lg text-white/90 max-w-2xl">
              Add luminous glow and bloom effects to images. Create stunning glowing photos with custom intensity.
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 py-12 px-4 md:px-8">
          <div className="max-w-4xl mx-auto">
            {/* Upload Section */}
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Apply Glow Effect</h2>
              
              <div className="mb-6">
                <label className="block text-gray-700 font-semibold mb-3">Upload Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-pink-400 transition"
                />
              </div>

              {preview && (
                <>
                  <div className="mb-6">
                    <label className="block text-gray-700 font-semibold mb-3">
                      Glow Intensity: {intensity}
                    </label>
                    <input
                      type="range"
                      min="5"
                      max="50"
                      value={intensity}
                      onChange={(e) => setIntensity(Number(e.target.value))}
                      className="w-full"
                    />
                  </div>

                  <div className="mb-6">
                    <label className="block text-gray-700 font-semibold mb-3">
                      Blur Radius: {blur}
                    </label>
                    <input
                      type="range"
                      min="5"
                      max="50"
                      value={blur}
                      onChange={(e) => setBlur(Number(e.target.value))}
                      className="w-full"
                    />
                  </div>

                  <button
                    onClick={applyGlowEffect}
                    disabled={processing}
                    className="w-full bg-pink-600 hover:bg-pink-700 text-white font-bold py-3 px-6 rounded-lg transition flex items-center justify-center gap-2"
                  >
                    {processing ? <Loader className="animate-spin" size={20} /> : <Sparkles size={20} />}
                    {processing ? 'Processing...' : 'Apply Glow Effect'}
                  </button>
                </>
              )}

              {result && (
                <button
                  onClick={handleDownload}
                  className="w-full mt-4 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition flex items-center justify-center gap-2"
                >
                  <Download size={20} />
                  Download Glowing Image
                </button>
              )}
            </div>

            {/* How To Section */}
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">How to Apply Glow Effect</h2>
              <ol className="space-y-4 text-gray-700">
                <li><strong>1. Upload Image:</strong> Select a JPG, PNG, or WebP photo.</li>
                <li><strong>2. Set Intensity:</strong> Adjust glow brightness (5-50).</li>
                <li><strong>3. Set Blur:</strong> Control glow spread and softness (5-50).</li>
                <li><strong>4. Apply & Download:</strong> Click "Apply Glow Effect" then download.</li>
              </ol>
            </div>

            {/* Benefits Section */}
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Glow Effect Benefits</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-bold text-lg text-pink-600 mb-2">Modern Look</h3>
                  <p className="text-gray-700">Create stunning contemporary glow effects.</p>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-pink-600 mb-2">Professional Quality</h3>
                  <p className="text-gray-700">Studio-quality luminous glow effects.</p>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-pink-600 mb-2">Customizable</h3>
                  <p className="text-gray-700">Full control over intensity and blur.</p>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-pink-600 mb-2">100% Free</h3>
                  <p className="text-gray-700">No registration or payment required.</p>
                </div>
              </div>
            </div>

            {/* FAQ Section */}
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Frequently Asked Questions</h2>
              <div className="space-y-4">
                <details className="border-l-4 border-pink-500 pl-4 py-2">
                  <summary className="font-bold text-gray-800 cursor-pointer">What settings work best?</summary>
                  <p className="text-gray-700 mt-2">Start with Intensity: 20-30 and Blur: 15-25 for balanced glow.</p>
                </details>
                <details className="border-l-4 border-pink-500 pl-4 py-2">
                  <summary className="font-bold text-gray-800 cursor-pointer">Can I make the glow stronger?</summary>
                  <p className="text-gray-700 mt-2">Yes! Increase Intensity for brighter glow and Blur for softer spread.</p>
                </details>
                <details className="border-l-4 border-pink-500 pl-4 py-2">
                  <summary className="font-bold text-gray-800 cursor-pointer">Best photo types for glow?</summary>
                  <p className="text-gray-700 mt-2">Works great on portraits, landscapes, and any bright subjects.</p>
                </details>
                <details className="border-l-4 border-pink-500 pl-4 py-2">
                  <summary className="font-bold text-gray-800 cursor-pointer">What format is the output?</summary>
                  <p className="text-gray-700 mt-2">High-quality JPEG format with excellent glow quality.</p>
                </details>
                <details className="border-l-4 border-pink-500 pl-4 py-2">
                  <summary className="font-bold text-gray-800 cursor-pointer">Is my image private?</summary>
                  <p className="text-gray-700 mt-2">Yes, all processing happens locally in your browser.</p>
                </details>
                <details className="border-l-4 border-pink-500 pl-4 py-2">
                  <summary className="font-bold text-gray-800 cursor-pointer">Can I undo and retry?</summary>
                  <p className="text-gray-700 mt-2">Yes, upload again to start fresh with different settings.</p>
                </details>
              </div>
            </div>

            {/* Related Tools */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Related Effect Tools</h2>
              <div className="grid md:grid-cols-3 gap-4">
                <Link href="/all-tools/cartoon-effect" className="p-4 border-2 border-pink-200 rounded-lg hover:bg-pink-50 transition">
                  <h3 className="font-bold text-gray-800">Cartoon Effect</h3>
                  <p className="text-sm text-gray-600">Comic style effects</p>
                </Link>
                <Link href="/all-tools/sketch-effect" className="p-4 border-2 border-pink-200 rounded-lg hover:bg-pink-50 transition">
                  <h3 className="font-bold text-gray-800">Sketch Effect</h3>
                  <p className="text-sm text-gray-600">Pencil sketch filter</p>
                </Link>
                <Link href="/all-tools/vintage-filter" className="p-4 border-2 border-pink-200 rounded-lg hover:bg-pink-50 transition">
                  <h3 className="font-bold text-gray-800">Vintage Filter</h3>
                  <p className="text-sm text-gray-600">Retro effects</p>
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
          name: 'Glow Effect',
          description: 'Free online glow effect and luminous bloom tool',
          url: 'https://simplifyconvert.com/all-tools/glow-effect',
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
