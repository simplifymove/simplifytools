'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { Download, ChevronRight, Loader, Grid } from 'lucide-react';
import { HomeHeader } from '../../components/HomeHeader';
import { Footer } from '../../components/Footer';

export default function MosaicTilePage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [tileSize, setTileSize] = useState(10);
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

  const applyMosaicTile = async () => {
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

          // Create mosaic effect
          for (let y = 0; y < canvas.height; y += tileSize) {
            for (let x = 0; x < canvas.width; x += tileSize) {
              let r = 0, g = 0, b = 0, count = 0;

              // Calculate average color in tile
              for (let ty = 0; ty < tileSize && y + ty < canvas.height; ty++) {
                for (let tx = 0; tx < tileSize && x + tx < canvas.width; tx++) {
                  const idx = ((y + ty) * canvas.width + (x + tx)) * 4;
                  r += data[idx];
                  g += data[idx + 1];
                  b += data[idx + 2];
                  count++;
                }
              }

              r = Math.floor(r / count);
              g = Math.floor(g / count);
              b = Math.floor(b / count);

              // Apply average color to entire tile
              for (let ty = 0; ty < tileSize && y + ty < canvas.height; ty++) {
                for (let tx = 0; tx < tileSize && x + tx < canvas.width; tx++) {
                  const idx = ((y + ty) * canvas.width + (x + tx)) * 4;
                  data[idx] = r;
                  data[idx + 1] = g;
                  data[idx + 2] = b;
                }
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
      console.error('Error applying mosaic tile:', error);
      setProcessing(false);
    }
  };

  const handleDownload = () => {
    if (result) {
      const url = URL.createObjectURL(result);
      const a = document.createElement('a');
      a.href = url;
      a.download = `mosaic-tile-${Date.now()}.jpg`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <>
      <HomeHeader />
      <main className="min-h-screen bg-slate-50 flex flex-col">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-purple-500 via-indigo-500 to-purple-600 py-16 px-4 md:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-2 text-white/80 text-sm mb-6">
              <Link href="/" className="hover:text-white transition">Home</Link>
              <ChevronRight size={16} />
              <Link href="/all-tools" className="hover:text-white transition">All Tools</Link>
              <ChevronRight size={16} />
              <span>Mosaic Tile</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">🎨 Mosaic Tile</h1>
            <p className="text-lg text-white/90 max-w-2xl">
              Create mosaic and tile pattern effects. Generate beautiful mosaic artwork from photos.
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 py-12 px-4 md:px-8">
          <div className="max-w-4xl mx-auto">
            {/* Upload Section */}
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Create Mosaic Tile Effect</h2>
              
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
                      Tile Size: {tileSize}px
                    </label>
                    <input
                      type="range"
                      min="2"
                      max="50"
                      value={tileSize}
                      onChange={(e) => setTileSize(Number(e.target.value))}
                      className="w-full"
                    />
                    <p className="text-sm text-gray-600 mt-2">2 = fine detail, 50 = large tiles</p>
                  </div>

                  <button
                    onClick={applyMosaicTile}
                    disabled={processing}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg transition flex items-center justify-center gap-2"
                  >
                    {processing ? <Loader className="animate-spin" size={20} /> : <Grid size={20} />}
                    {processing ? 'Processing...' : 'Create Mosaic Tile'}
                  </button>
                </>
              )}

              {result && (
                <button
                  onClick={handleDownload}
                  className="w-full mt-4 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition flex items-center justify-center gap-2"
                >
                  <Download size={20} />
                  Download Mosaic Image
                </button>
              )}
            </div>

            {/* How To Section */}
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">How to Create Mosaic Tile</h2>
              <ol className="space-y-4 text-gray-700">
                <li><strong>1. Upload Photo:</strong> Select a JPG, PNG, or WebP image.</li>
                <li><strong>2. Set Tile Size:</strong> Choose mosaic tile size (2-50px).</li>
                <li><strong>3. Create Mosaic:</strong> Click "Create Mosaic Tile".</li>
                <li><strong>4. Download:</strong> Save your mosaic artwork.</li>
              </ol>
            </div>

            {/* Benefits Section */}
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Mosaic Tile Benefits</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-bold text-lg text-purple-600 mb-2">Artistic Effects</h3>
                  <p className="text-gray-700">Create beautiful mosaic artwork.</p>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-purple-600 mb-2">Adjustable</h3>
                  <p className="text-gray-700">Control tile size for desired look.</p>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-purple-600 mb-2">Privacy Tool</h3>
                  <p className="text-gray-700">Blur faces and sensitive areas.</p>
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
                  <summary className="font-bold text-gray-800 cursor-pointer">What tile size should I use?</summary>
                  <p className="text-gray-700 mt-2">2-5px for detail. 10-20px for abstract. 30-50px for strong effect.</p>
                </details>
                <details className="border-l-4 border-purple-500 pl-4 py-2">
                  <summary className="font-bold text-gray-800 cursor-pointer">Works on all images?</summary>
                  <p className="text-gray-700 mt-2">Yes, works on any photo. Colored images look better.</p>
                </details>
                <details className="border-l-4 border-purple-500 pl-4 py-2">
                  <summary className="font-bold text-gray-800 cursor-pointer">Can I use commercially?</summary>
                  <p className="text-gray-700 mt-2">Yes, mosaic images can be used commercially.</p>
                </details>
                <details className="border-l-4 border-purple-500 pl-4 py-2">
                  <summary className="font-bold text-gray-800 cursor-pointer">Output quality?</summary>
                  <p className="text-gray-700 mt-2">High-quality JPEG with mosaic effect.</p>
                </details>
                <details className="border-l-4 border-purple-500 pl-4 py-2">
                  <summary className="font-bold text-gray-800 cursor-pointer">Is data private?</summary>
                  <p className="text-gray-700 mt-2">Yes, local browser processing only.</p>
                </details>
                <details className="border-l-4 border-purple-500 pl-4 py-2">
                  <summary className="font-bold text-gray-800 cursor-pointer">Smooth blending?</summary>
                  <p className="text-gray-700 mt-2">Smooth mosaic with color averaging per tile.</p>
                </details>
              </div>
            </div>

            {/* Related Tools */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Related Effect Tools</h2>
              <div className="grid md:grid-cols-3 gap-4">
                <Link href="/all-tools/pixelate-image" className="p-4 border-2 border-purple-200 rounded-lg hover:bg-purple-50 transition">
                  <h3 className="font-bold text-gray-800">Pixelate Image</h3>
                  <p className="text-sm text-gray-600">Pixel blocks</p>
                </Link>
                <Link href="/all-tools/posterize-image" className="p-4 border-2 border-purple-200 rounded-lg hover:bg-purple-50 transition">
                  <h3 className="font-bold text-gray-800">Posterize Image</h3>
                  <p className="text-sm text-gray-600">Limited colors</p>
                </Link>
                <Link href="/all-tools/blur-image" className="p-4 border-2 border-purple-200 rounded-lg hover:bg-purple-50 transition">
                  <h3 className="font-bold text-gray-800">Blur Image</h3>
                  <p className="text-sm text-gray-600">Blur effects</p>
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
          name: 'Mosaic Tile',
          description: 'Free online mosaic and tile pattern effect creator',
          url: 'https://simplifyconvert.com/all-tools/mosaic-tile',
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
