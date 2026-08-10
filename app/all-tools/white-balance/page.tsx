'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { Download, ChevronRight, Loader, Palette } from 'lucide-react';
import { HomeHeader } from '../../components/HomeHeader';
import { Footer } from '../../components/Footer';
import { useRouter } from 'next/navigation';
import { uploadBrowserDownloadResult } from '@/app/lib/download-result-client';

export default function WhiteBalancePage() {
    const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [temperature, setTemperature] = useState(0);
  const [tint, setTint] = useState(0);
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

  const applyWhiteBalance = async () => {
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

          // Apply white balance
          const tempFactor = 1 + temperature / 100;
          const tintFactor = 1 + tint / 100;

          for (let i = 0; i < data.length; i += 4) {
            // Apply temperature shift (warm/cool)
            data[i] = Math.max(0, Math.min(255, data[i] * tempFactor));

            // Apply tint shift (green/magenta)
            data[i + 1] = Math.max(0, Math.min(255, data[i + 1] * tintFactor));

            // Blue channel inverse to temperature
            data[i + 2] = Math.max(0, Math.min(255, data[i + 2] / tempFactor));
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
      console.error('Error applying white balance:', error);
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
            toolSlug: 'white-balance',
            originalName: `white-balance-${Date.now()}.jpg`,
            outputName: `white-balance-${Date.now()}.jpg`,
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
        <div className="bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 py-16 px-4 md:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-2 text-white/80 text-sm mb-6">
              <Link href="/" className="hover:text-white transition">Home</Link>
              <ChevronRight size={16} />
              <Link href="/all-tools" className="hover:text-white transition">All Tools</Link>
              <ChevronRight size={16} />
              <span>White Balance</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">🌡️ White Balance Tool</h1>
            <p className="text-lg text-white/90 max-w-2xl">
              Adjust image color temperature and tint to reduce or change warm and cool color casts.
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 py-12 px-4 md:px-8">
          <div className="max-w-4xl mx-auto">
            {/* Upload Section */}
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Adjust White Balance</h2>

              <div className="mb-6">
                <label className="block text-gray-700 font-semibold mb-3">Upload Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 transition"
                />
              </div>

              {preview && (
                <>
                  <div className="grid grid-cols-1 gap-6 mb-6">
                    <div>
                      <label className="block text-gray-700 font-semibold mb-3">
                        Temperature: {temperature > 0 ? '+' : ''}{temperature} (Warm/Cool)
                      </label>
                      <input
                        type="range"
                        min="-50"
                        max="50"
                        value={temperature}
                        onChange={(e) => setTemperature(Number(e.target.value))}
                        className="w-full"
                      />
                      <p className="text-sm text-gray-600 mt-2">Negative = cooler (blue), Positive = warmer (red)</p>
                    </div>
                    <div>
                      <label className="block text-gray-700 font-semibold mb-3">
                        Tint: {tint > 0 ? '+' : ''}{tint} (Green/Magenta)
                      </label>
                      <input
                        type="range"
                        min="-50"
                        max="50"
                        value={tint}
                        onChange={(e) => setTint(Number(e.target.value))}
                        className="w-full"
                      />
                      <p className="text-sm text-gray-600 mt-2">Negative = green, Positive = magenta</p>
                    </div>
                  </div>

                  <button
                    onClick={applyWhiteBalance}
                    disabled={processing}
                    className="w-full bg-blue-400 hover:bg-blue-500 text-white font-bold py-3 px-6 rounded-lg transition flex items-center justify-center gap-2"
                  >
                    {processing ? <Loader className="animate-spin" size={20} /> : <Palette size={20} />}
                    {processing ? 'Processing...' : 'Apply White Balance'}
                  </button>
                </>
              )}

              {result && (
                <button
                  onClick={handleDownload}
                  className="w-full mt-4 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition flex items-center justify-center gap-2"
                >
                  <Download size={20} />
                  Download Balanced Image
                </button>
              )}
            </div>

            {/* How To Section */}
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">How to Adjust White Balance</h2>
              <ol className="space-y-4 text-gray-700">
                <li><strong>1. Upload Photo:</strong> Select a JPG, PNG, or WebP image.</li>
                <li><strong>2. Set Temperature:</strong> Adjust warm/cool balance (-50 to +50).</li>
                <li><strong>3. Set Tint:</strong> Adjust green/magenta balance independently.</li>
                <li><strong>4. Apply:</strong> Click "Apply White Balance".</li>
                <li><strong>5. Download:</strong> Save your color-corrected image.</li>
              </ol>
            </div>

            {/* Benefits Section */}
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">White Balance Benefits</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-bold text-lg text-blue-600 mb-2">Fix Color Casts</h3>
                  <p className="text-gray-700">Correct warm or cool lighting issues.</p>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-blue-600 mb-2">Natural Colors</h3>
                  <p className="text-gray-700">Achieve accurate color reproduction.</p>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-blue-600 mb-2">Fine Control</h3>
                  <p className="text-gray-700">Adjust temperature and tint independently.</p>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-blue-600 mb-2">No Account Required</h3>
                  <p className="text-gray-700">No registration or payment needed.</p>
                </div>
              </div>
            </div>

            {/* FAQ Section */}
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Frequently Asked Questions</h2>
              <div className="space-y-4">
                <details className="border-l-4 border-blue-400 pl-4 py-2">
                  <summary className="font-bold text-gray-800 cursor-pointer">What is white balance?</summary>
                  <p className="text-gray-700 mt-2">Adjusting the visible color temperature of images affected by different lighting conditions.</p>
                </details>
                <details className="border-l-4 border-blue-400 pl-4 py-2">
                  <summary className="font-bold text-gray-800 cursor-pointer">When to adjust temperature?</summary>
                  <p className="text-gray-700 mt-2">Indoor lights (warm) use positive. Outdoor cloudy (cool) use negative.</p>
                </details>
                <details className="border-l-4 border-blue-400 pl-4 py-2">
                  <summary className="font-bold text-gray-800 cursor-pointer">What is tint?</summary>
                  <p className="text-gray-700 mt-2">Green/magenta balance to correct fluorescent light shifts.</p>
                </details>
                <details className="border-l-4 border-blue-400 pl-4 py-2">
                  <summary className="font-bold text-gray-800 cursor-pointer">Works on all images?</summary>
                  <p className="text-gray-700 mt-2">Yes, works on any photo format.</p>
                </details>
                <details className="border-l-4 border-blue-400 pl-4 py-2">
                  <summary className="font-bold text-gray-800 cursor-pointer">Can I use commercially?</summary>
                  <p className="text-gray-700 mt-2">Yes, corrected images can be used commercially.</p>
                </details>
                <details className="border-l-4 border-blue-400 pl-4 py-2">
                  <summary className="font-bold text-gray-800 cursor-pointer">Is data private?</summary>
                  <p className="text-gray-700 mt-2">The color adjustment is performed locally in the browser. When you choose Download, the generated image is sent through the download-result service so the download page can be prepared.</p>
                </details>
              </div>
            </div>

            {/* Related Tools */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Related Color Tools</h2>
              <div className="grid md:grid-cols-3 gap-4">
                <Link href="/all-tools/color-balance" className="p-4 border-2 border-blue-200 rounded-lg hover:bg-blue-50 transition">
                  <h3 className="font-bold text-gray-800">Color Balance</h3>
                  <p className="text-sm text-gray-600">RGB adjustments</p>
                </Link>
                <Link href="/all-tools/hue-saturation" className="p-4 border-2 border-blue-200 rounded-lg hover:bg-blue-50 transition">
                  <h3 className="font-bold text-gray-800">Hue Saturation</h3>
                  <p className="text-sm text-gray-600">Color intensity</p>
                </Link>
                <Link href="/all-tools/brightness-contrast" className="p-4 border-2 border-blue-200 rounded-lg hover:bg-blue-50 transition">
                  <h3 className="font-bold text-gray-800">Brightness Contrast</h3>
                  <p className="text-sm text-gray-600">Tone adjustments</p>
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
          name: 'White Balance Tool',
          description: 'Free online white balance and color temperature adjustment tool',
          url: 'https://simplifyconvert.com/all-tools/white-balance',
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
