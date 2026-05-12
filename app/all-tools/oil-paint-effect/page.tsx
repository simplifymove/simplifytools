'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { Download, ChevronRight, Loader, Wand2 } from 'lucide-react';
import { HomeHeader } from '../../components/HomeHeader';
import { Footer } from '../../components/Footer';

export default function OilPaintEffectPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [intensity, setIntensity] = useState(5);
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

  const applyOilPaintEffect = async () => {
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

          // Apply median filter for oil paint effect
          const radius = intensity;
          for (let y = radius; y < canvas.height - radius; y++) {
            for (let x = radius; x < canvas.width - radius; x++) {
              const idx = (y * canvas.width + x) * 4;
              const pixels = { r: [] as number[], g: [] as number[], b: [] as number[] };

              for (let dy = -radius; dy <= radius; dy++) {
                for (let dx = -radius; dx <= radius; dx++) {
                  const nIdx = ((y + dy) * canvas.width + (x + dx)) * 4;
                  pixels.r.push(data[nIdx]);
                  pixels.g.push(data[nIdx + 1]);
                  pixels.b.push(data[nIdx + 2]);
                }
              }

              pixels.r.sort((a, b) => a - b);
              pixels.g.sort((a, b) => a - b);
              pixels.b.sort((a, b) => a - b);

              const mid = Math.floor(pixels.r.length / 2);
              data[idx] = pixels.r[mid];
              data[idx + 1] = pixels.g[mid];
              data[idx + 2] = pixels.b[mid];
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
      console.error('Error applying oil paint effect:', error);
      setProcessing(false);
    }
  };

  const handleDownload = () => {
    if (result) {
      const url = URL.createObjectURL(result);
      const a = document.createElement('a');
      a.href = url;
      a.download = `oil-paint-${Date.now()}.jpg`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <>
      <HomeHeader />
      <main className="min-h-screen bg-slate-50 flex flex-col">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-orange-500 via-red-500 to-orange-600 py-16 px-4 md:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-2 text-white/80 text-sm mb-6">
              <Link href="/" className="hover:text-white transition">Home</Link>
              <ChevronRight size={16} />
              <Link href="/all-tools" className="hover:text-white transition">All Tools</Link>
              <ChevronRight size={16} />
              <span>Oil Paint Effect</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">🎨 Oil Paint Effect</h1>
            <p className="text-lg text-white/90 max-w-2xl">
              Convert photos into oil painting style artwork. Create beautiful artistic oil paintings from your images instantly.
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 py-12 px-4 md:px-8">
          <div className="max-w-4xl mx-auto">
            {/* Upload Section */}
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Apply Oil Paint Effect</h2>
              
              <div className="mb-6">
                <label className="block text-gray-700 font-semibold mb-3">Upload Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-orange-400 transition"
                />
              </div>

              {preview && (
                <>
                  <div className="mb-6">
                    <label className="block text-gray-700 font-semibold mb-3">
                      Intensity: {intensity}
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={intensity}
                      onChange={(e) => setIntensity(Number(e.target.value))}
                      className="w-full"
                    />
                    <p className="text-sm text-gray-600 mt-2">1 = subtle, 10 = strong oil painting effect</p>
                  </div>

                  <button
                    onClick={applyOilPaintEffect}
                    disabled={processing}
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-6 rounded-lg transition flex items-center justify-center gap-2"
                  >
                    {processing ? <Loader className="animate-spin" size={20} /> : <Wand2 size={20} />}
                    {processing ? 'Processing...' : 'Apply Oil Paint Effect'}
                  </button>
                </>
              )}

              {result && (
                <button
                  onClick={handleDownload}
                  className="w-full mt-4 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition flex items-center justify-center gap-2"
                >
                  <Download size={20} />
                  Download Painting
                </button>
              )}
            </div>

            {/* How To Section */}
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">How to Create Oil Paintings</h2>
              <ol className="space-y-4 text-gray-700">
                <li><strong>1. Upload Photo:</strong> Select a JPG, PNG, or WebP image.</li>
                <li><strong>2. Adjust Intensity:</strong> Control the oil painting effect strength.</li>
                <li><strong>3. Apply Effect:</strong> Click "Apply Oil Paint Effect".</li>
                <li><strong>4. Download:</strong> Save your oil painting artwork.</li>
              </ol>
            </div>

            {/* Benefits Section */}
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Oil Paint Effect Benefits</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-bold text-lg text-orange-600 mb-2">Artistic Transformation</h3>
                  <p className="text-gray-700">Convert photos into beautiful paintings.</p>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-orange-600 mb-2">Professional Quality</h3>
                  <p className="text-gray-700">High-quality oil painting effects.</p>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-orange-600 mb-2">Customizable</h3>
                  <p className="text-gray-700">Adjust intensity for desired effect.</p>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-orange-600 mb-2">100% Free</h3>
                  <p className="text-gray-700">No registration or payment needed.</p>
                </div>
              </div>
            </div>

            {/* FAQ Section */}
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Frequently Asked Questions</h2>
              <div className="space-y-4">
                <details className="border-l-4 border-orange-500 pl-4 py-2">
                  <summary className="font-bold text-gray-800 cursor-pointer">What intensity should I use?</summary>
                  <p className="text-gray-700 mt-2">Start at 5 for balanced effect. Lower for subtle, higher for strong painting style.</p>
                </details>
                <details className="border-l-4 border-orange-500 pl-4 py-2">
                  <summary className="font-bold text-gray-800 cursor-pointer">Does this work on all photos?</summary>
                  <p className="text-gray-700 mt-2">Yes, works on any photo. Results vary by image content and detail.</p>
                </details>
                <details className="border-l-4 border-orange-500 pl-4 py-2">
                  <summary className="font-bold text-gray-800 cursor-pointer">Can I use for commercial art?</summary>
                  <p className="text-gray-700 mt-2">Yes, all processed images can be used commercially.</p>
                </details>
                <details className="border-l-4 border-orange-500 pl-4 py-2">
                  <summary className="font-bold text-gray-800 cursor-pointer">What's the output quality?</summary>
                  <p className="text-gray-700 mt-2">High-quality JPEG with excellent detail preservation.</p>
                </details>
                <details className="border-l-4 border-orange-500 pl-4 py-2">
                  <summary className="font-bold text-gray-800 cursor-pointer">Is my image private?</summary>
                  <p className="text-gray-700 mt-2">Yes, processing happens locally in your browser only.</p>
                </details>
                <details className="border-l-4 border-orange-500 pl-4 py-2">
                  <summary className="font-bold text-gray-800 cursor-pointer">Can I edit further?</summary>
                  <p className="text-gray-700 mt-2">Yes, download and use image editors for additional modifications.</p>
                </details>
              </div>
            </div>

            {/* Related Tools */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Related Art Effect Tools</h2>
              <div className="grid md:grid-cols-3 gap-4">
                <Link href="/all-tools/cartoon-effect" className="p-4 border-2 border-orange-200 rounded-lg hover:bg-orange-50 transition">
                  <h3 className="font-bold text-gray-800">Cartoon Effect</h3>
                  <p className="text-sm text-gray-600">Comic style effects</p>
                </Link>
                <Link href="/all-tools/sketch-effect" className="p-4 border-2 border-orange-200 rounded-lg hover:bg-orange-50 transition">
                  <h3 className="font-bold text-gray-800">Sketch Effect</h3>
                  <p className="text-sm text-gray-600">Pencil sketch filter</p>
                </Link>
                <Link href="/all-tools/glow-effect" className="p-4 border-2 border-orange-200 rounded-lg hover:bg-orange-50 transition">
                  <h3 className="font-bold text-gray-800">Glow Effect</h3>
                  <p className="text-sm text-gray-600">Luminous glow effects</p>
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
          name: 'Oil Paint Effect',
          description: 'Free online oil paint effect and artistic painting converter',
          url: 'https://simplifyconvert.com/all-tools/oil-paint-effect',
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

