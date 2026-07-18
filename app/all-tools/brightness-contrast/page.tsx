'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { Download, ChevronRight, Loader, Palette } from 'lucide-react';
import { HomeHeader } from '../../components/HomeHeader';
import { Footer } from '../../components/Footer';
import { useRouter } from 'next/navigation';
import { uploadBrowserDownloadResult } from '@/app/lib/download-result-client';

export default function BrightnessContrastPage() {
    const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [brightness, setBrightness] = useState(0);
  const [contrast, setContrast] = useState(0);
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

  const applyBrightnessContrast = async () => {
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

          // Apply brightness and contrast
          const brightnessValue = brightness;
          const contrastValue = (contrast / 100 + 1);

          for (let i = 0; i < data.length; i += 4) {
            // Apply contrast (scale around 128)
            data[i] = Math.max(0, Math.min(255, (data[i] - 128) * contrastValue + 128));
            data[i + 1] = Math.max(0, Math.min(255, (data[i + 1] - 128) * contrastValue + 128));
            data[i + 2] = Math.max(0, Math.min(255, (data[i + 2] - 128) * contrastValue + 128));

            // Apply brightness
            data[i] = Math.max(0, Math.min(255, data[i] + brightnessValue));
            data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + brightnessValue));
            data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + brightnessValue));
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
      console.error('Error applying brightness contrast:', error);
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
            toolSlug: 'brightness-contrast',
            originalName: `brightness-contrast-${Date.now()}.jpg`,
            outputName: `brightness-contrast-${Date.now()}.jpg`,
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
        <div className="bg-gradient-to-r from-yellow-500 via-orange-500 to-yellow-600 py-16 px-4 md:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-2 text-white/80 text-sm mb-6">
              <Link href="/" className="hover:text-white transition">Home</Link>
              <ChevronRight size={16} />
              <Link href="/all-tools" className="hover:text-white transition">All Tools</Link>
              <ChevronRight size={16} />
              <span>Brightness Contrast</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">☀️ Brightness Contrast Adjuster</h1>
            <p className="text-lg text-white/90 max-w-2xl">
              Adjust brightness and contrast levels precisely. Enhance image visibility and improve photo quality.
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 py-12 px-4 md:px-8">
          <div className="max-w-4xl mx-auto">
            {/* Upload Section */}
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Adjust Brightness & Contrast</h2>

              <div className="mb-6">
                <label className="block text-gray-700 font-semibold mb-3">Upload Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-yellow-400 transition"
                />
              </div>

              {preview && (
                <>
                  <div className="grid grid-cols-1 gap-6 mb-6">
                    <div>
                      <label className="block text-gray-700 font-semibold mb-3">
                        Brightness: {brightness > 0 ? '+' : ''}{brightness}
                      </label>
                      <input
                        type="range"
                        min="-100"
                        max="100"
                        value={brightness}
                        onChange={(e) => setBrightness(Number(e.target.value))}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-semibold mb-3">
                        Contrast: {contrast > 0 ? '+' : ''}{contrast}%
                      </label>
                      <input
                        type="range"
                        min="-100"
                        max="100"
                        value={contrast}
                        onChange={(e) => setContrast(Number(e.target.value))}
                        className="w-full"
                      />
                    </div>
                  </div>

                  <button
                    onClick={applyBrightnessContrast}
                    disabled={processing}
                    className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 px-6 rounded-lg transition flex items-center justify-center gap-2"
                  >
                    {processing ? <Loader className="animate-spin" size={20} /> : <Palette size={20} />}
                    {processing ? 'Processing...' : 'Apply Adjustment'}
                  </button>
                </>
              )}

              {result && (
                <button
                  onClick={handleDownload}
                  className="w-full mt-4 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition flex items-center justify-center gap-2"
                >
                  <Download size={20} />
                  Download Adjusted Image
                </button>
              )}
            </div>

            {/* How To Section */}
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">How to Adjust Brightness & Contrast</h2>
              <ol className="space-y-4 text-gray-700">
                <li><strong>1. Upload Photo:</strong> Select a JPG, PNG, or WebP image.</li>
                <li><strong>2. Set Brightness:</strong> Adjust brightness from -100 to +100.</li>
                <li><strong>3. Set Contrast:</strong> Adjust contrast from -100% to +100%.</li>
                <li><strong>4. Apply:</strong> Click "Apply Adjustment".</li>
                <li><strong>5. Download:</strong> Save your adjusted image.</li>
              </ol>
            </div>

            {/* Benefits Section */}
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Brightness Contrast Benefits</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-bold text-lg text-yellow-600 mb-2">Precise Control</h3>
                  <p className="text-gray-700">Fine-tune brightness and contrast independently.</p>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-yellow-600 mb-2">Real-time Preview</h3>
                  <p className="text-gray-700">See changes instantly with adjustment sliders.</p>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-yellow-600 mb-2">Photo Enhancement</h3>
                  <p className="text-gray-700">Improve visibility and detail in any photo.</p>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-yellow-600 mb-2">100% Free</h3>
                  <p className="text-gray-700">No registration or payment needed.</p>
                </div>
              </div>
            </div>

            {/* FAQ Section */}
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Frequently Asked Questions</h2>
              <div className="space-y-4">
                <details className="border-l-4 border-yellow-500 pl-4 py-2">
                  <summary className="font-bold text-gray-800 cursor-pointer">What's the difference between brightness and contrast?</summary>
                  <p className="text-gray-700 mt-2">Brightness adds or removes light overall. Contrast adjusts the difference between light and dark areas.</p>
                </details>
                <details className="border-l-4 border-yellow-500 pl-4 py-2">
                  <summary className="font-bold text-gray-800 cursor-pointer">When should I adjust these?</summary>
                  <p className="text-gray-700 mt-2">Use brightness for overexposed/underexposed photos. Use contrast for flat or dull images.</p>
                </details>
                <details className="border-l-4 border-yellow-500 pl-4 py-2">
                  <summary className="font-bold text-gray-800 cursor-pointer">Works on all images?</summary>
                  <p className="text-gray-700 mt-2">Yes, works on any photo format.</p>
                </details>
                <details className="border-l-4 border-yellow-500 pl-4 py-2">
                  <summary className="font-bold text-gray-800 cursor-pointer">Can I use commercially?</summary>
                  <p className="text-gray-700 mt-2">Yes, adjusted images can be used commercially.</p>
                </details>
                <details className="border-l-4 border-yellow-500 pl-4 py-2">
                  <summary className="font-bold text-gray-800 cursor-pointer">Is data private?</summary>
                  <p className="text-gray-700 mt-2">Yes, local browser processing only.</p>
                </details>
                <details className="border-l-4 border-yellow-500 pl-4 py-2">
                  <summary className="font-bold text-gray-800 cursor-pointer">Output quality?</summary>
                  <p className="text-gray-700 mt-2">High-quality JPEG with maximum detail preservation.</p>
                </details>
              </div>
            </div>

            {/* Related Tools */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Related Adjustment Tools</h2>
              <div className="grid md:grid-cols-3 gap-4">
                <Link href="/all-tools/hue-saturation" className="p-4 border-2 border-yellow-200 rounded-lg hover:bg-yellow-50 transition">
                  <h3 className="font-bold text-gray-800">Hue Saturation</h3>
                  <p className="text-sm text-gray-600">Color adjustments</p>
                </Link>
                <Link href="/all-tools/color-balance" className="p-4 border-2 border-yellow-200 rounded-lg hover:bg-yellow-50 transition">
                  <h3 className="font-bold text-gray-800">Color Balance</h3>
                  <p className="text-sm text-gray-600">RGB balance</p>
                </Link>
                <Link href="/all-tools/histogram-equalize" className="p-4 border-2 border-yellow-200 rounded-lg hover:bg-yellow-50 transition">
                  <h3 className="font-bold text-gray-800">Histogram Equalize</h3>
                  <p className="text-sm text-gray-600">Auto enhance</p>
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
          name: 'Brightness Contrast Adjuster',
          description: 'Free online brightness and contrast adjustment tool',
          url: 'https://simplifyconvert.com/all-tools/brightness-contrast',
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
