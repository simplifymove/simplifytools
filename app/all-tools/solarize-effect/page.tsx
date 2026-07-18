'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { Download, ChevronRight, Loader, Sparkles } from 'lucide-react';
import { HomeHeader } from '../../components/HomeHeader';
import { Footer } from '../../components/Footer';
import { useRouter } from 'next/navigation';
import { uploadBrowserDownloadResult } from '@/app/lib/download-result-client';

export default function SolarizeEffectPage() {
    const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [intensity, setIntensity] = useState(50);
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

  const applySolarizeEffect = async () => {
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

          const factor = intensity / 100;
          const threshold = 128;

          for (let i = 0; i < data.length; i += 4) {
            // Solarize: invert colors above threshold
            if (data[i] > threshold) {
              data[i] = Math.floor((255 - data[i]) * factor + data[i] * (1 - factor));
            }
            if (data[i + 1] > threshold) {
              data[i + 1] = Math.floor((255 - data[i + 1]) * factor + data[i + 1] * (1 - factor));
            }
            if (data[i + 2] > threshold) {
              data[i + 2] = Math.floor((255 - data[i + 2]) * factor + data[i + 2] * (1 - factor));
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
      console.error('Error applying solarize effect:', error);
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
            toolSlug: 'solarize-effect',
            originalName: `solarize-effect-${Date.now()}.jpg`,
            outputName: `solarize-effect-${Date.now()}.jpg`,
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
        <div className="bg-gradient-to-r from-orange-600 via-red-600 to-orange-700 py-16 px-4 md:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-2 text-white/80 text-sm mb-6">
              <Link href="/" className="hover:text-white transition">Home</Link>
              <ChevronRight size={16} />
              <Link href="/all-tools" className="hover:text-white transition">All Tools</Link>
              <ChevronRight size={16} />
              <span>Solarize Effect</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">✨ Solarize Effect</h1>
            <p className="text-lg text-white/90 max-w-2xl">
              Create photographic solarization effects. Apply artistic tone inversion for vintage aesthetic.
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 py-12 px-4 md:px-8">
          <div className="max-w-4xl mx-auto">
            {/* Upload Section */}
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Apply Solarize Effect</h2>
              
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
                      Solarize Intensity: {intensity}%
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={intensity}
                      onChange={(e) => setIntensity(Number(e.target.value))}
                      className="w-full"
                    />
                    <p className="text-sm text-gray-600 mt-2">0 = original, 100 = full solarization</p>
                  </div>

                  <button
                    onClick={applySolarizeEffect}
                    disabled={processing}
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-6 rounded-lg transition flex items-center justify-center gap-2"
                  >
                    {processing ? <Loader className="animate-spin" size={20} /> : <Sparkles size={20} />}
                    {processing ? 'Processing...' : 'Apply Solarize Effect'}
                  </button>
                </>
              )}

              {result && (
                <button
                  onClick={handleDownload}
                  className="w-full mt-4 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition flex items-center justify-center gap-2"
                >
                  <Download size={20} />
                  Download Solarized Image
                </button>
              )}
            </div>

            {/* How To Section */}
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">How to Apply Solarize Effect</h2>
              <ol className="space-y-4 text-gray-700">
                <li><strong>1. Upload Photo:</strong> Select a JPG, PNG, or WebP image.</li>
                <li><strong>2. Set Intensity:</strong> Control solarization strength (0-100%).</li>
                <li><strong>3. Apply Effect:</strong> Click "Apply Solarize Effect".</li>
                <li><strong>4. Download:</strong> Save your solarized image.</li>
              </ol>
            </div>

            {/* Benefits Section */}
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Solarize Effect Benefits</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-bold text-lg text-orange-600 mb-2">Artistic Effect</h3>
                  <p className="text-gray-700">Create unique solarized artwork.</p>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-orange-600 mb-2">Customizable</h3>
                  <p className="text-gray-700">Control solarization intensity level.</p>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-orange-600 mb-2">Vintage Look</h3>
                  <p className="text-gray-700">Achieve classic photographic aesthetic.</p>
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
                <details className="border-l-4 border-orange-600 pl-4 py-2">
                  <summary className="font-bold text-gray-800 cursor-pointer">What is solarization?</summary>
                  <p className="text-gray-700 mt-2">Solarization inverts tones above threshold for artistic effect.</p>
                </details>
                <details className="border-l-4 border-orange-600 pl-4 py-2">
                  <summary className="font-bold text-gray-800 cursor-pointer">What intensity to use?</summary>
                  <p className="text-gray-700 mt-2">50% for balanced. Higher for more dramatic effect.</p>
                </details>
                <details className="border-l-4 border-orange-600 pl-4 py-2">
                  <summary className="font-bold text-gray-800 cursor-pointer">Works on all images?</summary>
                  <p className="text-gray-700 mt-2">Yes, works on any photo format.</p>
                </details>
                <details className="border-l-4 border-orange-600 pl-4 py-2">
                  <summary className="font-bold text-gray-800 cursor-pointer">Can I use commercially?</summary>
                  <p className="text-gray-700 mt-2">Yes, solarized images can be used commercially.</p>
                </details>
                <details className="border-l-4 border-orange-600 pl-4 py-2">
                  <summary className="font-bold text-gray-800 cursor-pointer">Is data private?</summary>
                  <p className="text-gray-700 mt-2">Yes, local browser processing only.</p>
                </details>
                <details className="border-l-4 border-orange-600 pl-4 py-2">
                  <summary className="font-bold text-gray-800 cursor-pointer">Original photo look?</summary>
                  <p className="text-gray-700 mt-2">Can adjust intensity from 0% for original.</p>
                </details>
              </div>
            </div>

            {/* Related Tools */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Related Effect Tools</h2>
              <div className="grid md:grid-cols-3 gap-4">
                <Link href="/all-tools/duotone-effect" className="p-4 border-2 border-orange-200 rounded-lg hover:bg-orange-50 transition">
                  <h3 className="font-bold text-gray-800">Duotone Effect</h3>
                  <p className="text-sm text-gray-600">Color effects</p>
                </Link>
                <Link href="/all-tools/film-noir" className="p-4 border-2 border-orange-200 rounded-lg hover:bg-orange-50 transition">
                  <h3 className="font-bold text-gray-800">Film Noir</h3>
                  <p className="text-sm text-gray-600">B&W effects</p>
                </Link>
                <Link href="/all-tools/vintage-filter" className="p-4 border-2 border-orange-200 rounded-lg hover:bg-orange-50 transition">
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
          name: 'Solarize Effect',
          description: 'Free online photographic solarization effect tool',
          url: 'https://simplifyconvert.com/all-tools/solarize-effect',
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
