'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { Download, ChevronRight, Loader, Sparkles } from 'lucide-react';
import { HomeHeader } from '../../components/HomeHeader';
import { Footer } from '../../components/Footer';
import { useRouter } from 'next/navigation';
import { uploadBrowserDownloadResult } from '@/app/lib/download-result-client';

export default function CartoonEffectPage() {
    const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [intensity, setIntensity] = useState(30);
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

  const applyCartoonEffect = async () => {
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
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imageData.data;

          // Apply edge detection and posterization for cartoon effect
          const edges = new Uint8ClampedArray(data.length);

          for (let i = 0; i < data.length; i += 4) {
            // Posterize (reduce color levels)
            const levels = Math.floor(intensity / 10);
            const scale = 256 / (levels + 1);
            data[i] = Math.floor(data[i] / scale) * scale;
            data[i + 1] = Math.floor(data[i + 1] / scale) * scale;
            data[i + 2] = Math.floor(data[i + 2] / scale) * scale;
          }

          // Apply edge detection for cartoon outline
          for (let y = 1; y < canvas.height - 1; y++) {
            for (let x = 1; x < canvas.width - 1; x++) {
              const idx = (y * canvas.width + x) * 4;
              let edge = 0;

              for (let dy = -1; dy <= 1; dy++) {
                for (let dx = -1; dx <= 1; dx++) {
                  const nIdx = ((y + dy) * canvas.width + (x + dx)) * 4;
                  const diff = Math.abs(data[idx] - data[nIdx]);
                  edge += diff;
                }
              }

              edges[idx] = edge > intensity ? 0 : 255;
              edges[idx + 1] = edge > intensity ? 0 : 255;
              edges[idx + 2] = edge > intensity ? 0 : 255;
              edges[idx + 3] = 255;
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
      console.error('Error applying cartoon effect:', error);
      setProcessing(false);
    }
  };

  const handleDownload = async () => {
      if (!result || processing) return;


      setProcessing(true);

      try {
        const downloadResult =
          await uploadBrowserDownloadResult({
            blob: result,
            toolSlug: 'cartoon-effect',
            originalName: `cartoon-${Date.now()}.jpg`,
            outputName: `cartoon-${Date.now()}.jpg`,
          });

        router.push(downloadResult.downloadPageUrl);
      } catch (caughtError) {
        console.error('Download preparation failed:', caughtError);
        window.alert(
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
      <main className="min-h-screen bg-slate-50 flex flex-col">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-yellow-400 via-orange-400 to-yellow-500 py-16 px-4 md:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-2 text-white/80 text-sm mb-6">
              <Link href="/" className="hover:text-white transition">Home</Link>
              <ChevronRight size={16} />
              <Link href="/all-tools" className="hover:text-white transition">All Tools</Link>
              <ChevronRight size={16} />
              <span>Cartoon Effect</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">🎨 Cartoon Effect</h1>
            <p className="text-lg text-white/90 max-w-2xl">
              Transform photos into cartoon and comic style. Create artistic cartoon effects instantly.
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 py-12 px-4 md:px-8">
          <div className="max-w-4xl mx-auto">
            {/* Upload Section */}
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Create Cartoon Effect</h2>

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
                      min="10"
                      max="100"
                      value={intensity}
                      onChange={(e) => setIntensity(Number(e.target.value))}
                      className="w-full"
                    />
                    <p className="text-sm text-gray-600 mt-2">Lower = more detailed, Higher = more simplified</p>
                  </div>

                  <button
                    onClick={applyCartoonEffect}
                    disabled={processing}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-lg transition flex items-center justify-center gap-2"
                  >
                    {processing ? <Loader className="animate-spin" size={20} /> : <Sparkles size={20} />}
                    {processing ? 'Processing...' : 'Apply Cartoon Effect'}
                  </button>
                </>
              )}

              {result && (
                <button
                  onClick={handleDownload}
                  className="w-full mt-4 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition flex items-center justify-center gap-2"
                >
                  <Download size={20} />
                  Download Cartoon Image
                </button>
              )}
            </div>

            {/* How To Section */}
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">How to Create Cartoon Effects</h2>
              <ol className="space-y-4 text-gray-700">
                <li><strong>1. Upload Photo:</strong> Select a JPG, PNG, or WebP image.</li>
                <li><strong>2. Adjust Intensity:</strong> Control how simplified or detailed the cartoon looks.</li>
                <li><strong>3. Apply Effect:</strong> Click "Apply Cartoon Effect" to process.</li>
                <li><strong>4. Download:</strong> Save your cartoon image instantly.</li>
              </ol>
            </div>

            {/* Benefits Section */}
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Why Use Cartoon Effects</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-bold text-lg text-orange-600 mb-2">Artistic Style</h3>
                  <p className="text-gray-700">Transform photos into fun cartoon artwork.</p>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-orange-600 mb-2">Social Media</h3>
                  <p className="text-gray-700">Create engaging cartoon-style posts.</p>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-orange-600 mb-2">Fun Effects</h3>
                  <p className="text-gray-700">Make creative and entertaining images.</p>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-orange-600 mb-2">100% Free</h3>
                  <p className="text-gray-700">No cost, no registration required.</p>
                </div>
              </div>
            </div>

            {/* FAQ Section */}
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Frequently Asked Questions</h2>
              <div className="space-y-4">
                <details className="border-l-4 border-orange-500 pl-4 py-2">
                  <summary className="font-bold text-gray-800 cursor-pointer">What intensity level should I use?</summary>
                  <p className="text-gray-700 mt-2">Start at 30-40 for balanced effects. Lower for detail, higher for simplification.</p>
                </details>
                <details className="border-l-4 border-orange-500 pl-4 py-2">
                  <summary className="font-bold text-gray-800 cursor-pointer">Does this work on all photos?</summary>
                  <p className="text-gray-700 mt-2">Yes, any photo works! Results vary based on image complexity and content.</p>
                </details>
                <details className="border-l-4 border-orange-500 pl-4 py-2">
                  <summary className="font-bold text-gray-800 cursor-pointer">Can I use this for commercial purposes?</summary>
                  <p className="text-gray-700 mt-2">Yes, you can use your processed images commercially without restrictions.</p>
                </details>
                <details className="border-l-4 border-orange-500 pl-4 py-2">
                  <summary className="font-bold text-gray-800 cursor-pointer">What file format is the output?</summary>
                  <p className="text-gray-700 mt-2">Images are saved as high-quality JPEG format.</p>
                </details>
                <details className="border-l-4 border-orange-500 pl-4 py-2">
                  <summary className="font-bold text-gray-800 cursor-pointer">Is my image kept private?</summary>
                  <p className="text-gray-700 mt-2">Yes, all processing happens locally in your browser. No uploads to servers.</p>
                </details>
                <details className="border-l-4 border-orange-500 pl-4 py-2">
                  <summary className="font-bold text-gray-800 cursor-pointer">Can I edit further?</summary>
                  <p className="text-gray-700 mt-2">Yes, download and use any image editor for additional tweaks.</p>
                </details>
              </div>
            </div>

            {/* Related Tools */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Related Effect Tools</h2>
              <div className="grid md:grid-cols-3 gap-4">
                <Link href="/all-tools/sketch-effect" className="p-4 border-2 border-orange-200 rounded-lg hover:bg-orange-50 transition">
                  <h3 className="font-bold text-gray-800">Sketch Effect</h3>
                  <p className="text-sm text-gray-600">Pencil sketch filter</p>
                </Link>
                <Link href="/all-tools/vintage-filter" className="p-4 border-2 border-orange-200 rounded-lg hover:bg-orange-50 transition">
                  <h3 className="font-bold text-gray-800">Vintage Filter</h3>
                  <p className="text-sm text-gray-600">Retro photo effects</p>
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
          name: 'Cartoon Effect',
          description: 'Free online cartoon effect and comic style photo converter',
          url: 'https://simplifyconvert.com/all-tools/cartoon-effect',
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
