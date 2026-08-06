'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { Download, ChevronRight, Loader, Eye } from 'lucide-react';
import { HomeHeader } from '../../components/HomeHeader';
import { Footer } from '../../components/Footer';
import { useRouter } from 'next/navigation';
import { uploadBrowserDownloadResult } from '@/app/lib/download-result-client';

export default function ThermalVisionPage() {
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

  const applyThermalVision = async () => {
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
            // Calculate brightness/heat value
            const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
            const normalizedBrightness = brightness / 255;

            // Map brightness to thermal colors (cool to hot)
            let r, g, b;

            if (normalizedBrightness < 0.25) {
              // Cold - Blue/Purple
              r = 0;
              g = Math.floor(normalizedBrightness * 4 * 255);
              b = 255;
            } else if (normalizedBrightness < 0.5) {
              // Cool - Cyan
              r = 0;
              g = 255;
              b = Math.floor((1 - (normalizedBrightness - 0.25) * 4) * 255);
            } else if (normalizedBrightness < 0.75) {
              // Warm - Yellow
              r = Math.floor((normalizedBrightness - 0.5) * 4 * 255);
              g = 255;
              b = 0;
            } else {
              // Hot - Red
              r = 255;
              g = Math.floor((1 - (normalizedBrightness - 0.75) * 4) * 255);
              b = 0;
            }

            // Apply intensity multiplier
            const factor = intensity / 100;
            data[i] = Math.floor(r * factor + data[i] * (1 - factor));
            data[i + 1] = Math.floor(g * factor + data[i + 1] * (1 - factor));
            data[i + 2] = Math.floor(b * factor + data[i + 2] * (1 - factor));
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
      console.error('Error applying thermal vision:', error);
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
            toolSlug: 'thermal-vision',
            originalName: `thermal-vision-${Date.now()}.jpg`,
            outputName: `thermal-vision-${Date.now()}.jpg`,
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
        <div className="bg-gradient-to-r from-red-600 via-yellow-500 to-red-700 py-16 px-4 md:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-2 text-white/80 text-sm mb-6">
              <Link href="/" className="hover:text-white transition">Home</Link>
              <ChevronRight size={16} />
              <Link href="/all-tools" className="hover:text-white transition">All Tools</Link>
              <ChevronRight size={16} />
              <span>Thermal Vision</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">🌡️ Thermal Vision</h1>
            <p className="text-lg text-white/90 max-w-2xl">
              Convert images to thermal and infrared color mapping. Create thermal vision effects instantly.
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 py-12 px-4 md:px-8">
          <div className="max-w-4xl mx-auto">
            {/* Upload Section */}
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Apply Thermal Vision</h2>

              <div className="mb-6">
                <label className="block text-gray-700 font-semibold mb-3">Upload Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-red-400 transition"
                />
              </div>

              {preview && (
                <>
                  <div className="mb-6">
                    <label className="block text-gray-700 font-semibold mb-3">
                      Thermal Intensity: {intensity}%
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={intensity}
                      onChange={(e) => setIntensity(Number(e.target.value))}
                      className="w-full"
                    />
                    <p className="text-sm text-gray-600 mt-2">0 = original, 100 = pure thermal</p>
                  </div>

                  <button
                    onClick={applyThermalVision}
                    disabled={processing}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition flex items-center justify-center gap-2"
                  >
                    {processing ? <Loader className="animate-spin" size={20} /> : <Eye size={20} />}
                    {processing ? 'Processing...' : 'Apply Thermal Vision'}
                  </button>
                </>
              )}

              {result && (
                <button
                  onClick={handleDownload}
                  className="w-full mt-4 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition flex items-center justify-center gap-2"
                >
                  <Download size={20} />
                  Download Thermal Image
                </button>
              )}
            </div>

            {/* How To Section */}
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">How to Apply Thermal Vision</h2>
              <ol className="space-y-4 text-gray-700">
                <li><strong>1. Upload Photo:</strong> Select a JPG, PNG, or WebP image.</li>
                <li><strong>2. Set Intensity:</strong> Control thermal effect strength (0-100%).</li>
                <li><strong>3. Apply Effect:</strong> Click "Apply Thermal Vision".</li>
                <li><strong>4. Download:</strong> Save your thermal image.</li>
              </ol>
            </div>

            {/* Benefits Section */}
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Thermal Vision Benefits</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-bold text-lg text-red-600 mb-2">Thermal Mapping</h3>
                  <p className="text-gray-700">Heat-map color visualization.</p>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-red-600 mb-2">Customizable</h3>
                  <p className="text-gray-700">Control thermal effect blend.</p>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-red-600 mb-2">Infrared Effect</h3>
                  <p className="text-gray-700">Realistic thermal color palette.</p>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-red-600 mb-2">100% Free</h3>
                  <p className="text-gray-700">No registration or payment needed.</p>
                </div>
              </div>
            </div>

            {/* FAQ Section */}
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Frequently Asked Questions</h2>
              <div className="space-y-4">
                <details className="border-l-4 border-red-600 pl-4 py-2">
                  <summary className="font-bold text-gray-800 cursor-pointer">What intensity should I use?</summary>
                  <p className="text-gray-700 mt-2">50% for balanced. 100% for pure thermal colors.</p>
                </details>
                <details className="border-l-4 border-red-600 pl-4 py-2">
                  <summary className="font-bold text-gray-800 cursor-pointer">Color mapping explained?</summary>
                  <p className="text-gray-700 mt-2">Blue=cold, Cyan=cool, Yellow=warm, Red=hot.</p>
                </details>
                <details className="border-l-4 border-red-600 pl-4 py-2">
                  <summary className="font-bold text-gray-800 cursor-pointer">Works on all images?</summary>
                  <p className="text-gray-700 mt-2">Yes, maps brightness to thermal colors.</p>
                </details>
                <details className="border-l-4 border-red-600 pl-4 py-2">
                  <summary className="font-bold text-gray-800 cursor-pointer">Can I use commercially?</summary>
                  <p className="text-gray-700 mt-2">Yes, thermal images can be used commercially.</p>
                </details>
                <details className="border-l-4 border-red-600 pl-4 py-2">
                  <summary className="font-bold text-gray-800 cursor-pointer">Is data private?</summary>
                  <p className="text-gray-700 mt-2">The visual effect is processed in your browser. When you choose Download, the processed JPEG is sent through the download-result service so the download page can be prepared.</p>
                </details>
                <details className="border-l-4 border-red-600 pl-4 py-2">
                  <summary className="font-bold text-gray-800 cursor-pointer">Real thermal imaging?</summary>
                  <p className="text-gray-700 mt-2">Simulates thermal effect using brightness mapping.</p>
                </details>
              </div>
            </div>

            {/* Related Tools */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Related Color Tools</h2>
              <div className="grid md:grid-cols-3 gap-4">
                <Link href="/all-tools/hue-saturation" className="p-4 border-2 border-red-200 rounded-lg hover:bg-red-50 transition">
                  <h3 className="font-bold text-gray-800">Hue Saturation</h3>
                  <p className="text-sm text-gray-600">Color adjustment</p>
                </Link>
                <Link href="/all-tools/color-grader" className="p-4 border-2 border-red-200 rounded-lg hover:bg-red-50 transition">
                  <h3 className="font-bold text-gray-800">Color Grader</h3>
                  <p className="text-sm text-gray-600">Color grading</p>
                </Link>
                <Link href="/all-tools/duotone-effect" className="p-4 border-2 border-red-200 rounded-lg hover:bg-red-50 transition">
                  <h3 className="font-bold text-gray-800">Duotone Effect</h3>
                  <p className="text-sm text-gray-600">Color mapping</p>
                </Link>
              </div>
            </div>
          </div>
        </div>

        <Footer />

        {/* Batch supporting content: thermal-vision */}
        <section className="bg-white border-t border-gray-200 px-4 md:px-8 py-14">
          <div className="max-w-6xl mx-auto space-y-10">

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Understanding the thermal vision effect
              </h2>
              <p className="text-gray-600 leading-7">
                The Thermal Vision tool processes image pixels in your browser to create a heat-map-style visual effect. It changes the appearance of the uploaded image rather than performing real thermal or infrared measurement. The processed result is exported as a JPEG.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="border border-gray-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Browser-based image processing
                </h3>
                <p className="text-gray-600 leading-7">
                  The visual transformation is performed with browser canvas
                  processing. The uploaded image is drawn to a canvas and the
                  selected effect is applied before the result is prepared for
                  download.
                </p>
              </div>

              <div className="border border-gray-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  JPEG output
                </h3>
                <p className="text-gray-600 leading-7">
                  The processed canvas is encoded as a JPEG for download.
                  The downloaded file is JPEG encoded, so its compression
                  characteristics can differ from those of the original
                  uploaded image.
                </p>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Choosing an image for this effect
              </h2>
              <p className="text-gray-600 leading-7">
                JPG, PNG, and WebP images are supported by the upload control.
                The appearance of the effect depends on the colors, contrast,
                details, and composition of the source image. Try different
                settings when available to find a result that suits the image.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                What happens to image dimensions?
              </h2>
              <p className="text-gray-600 leading-7">
                The processing canvas uses the loaded image width and height.
                The effect changes the visual pixel content rather than acting
                as an image resizing tool.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Tips for better effect results
              </h2>
              <ul className="text-gray-600 leading-7 list-disc pl-6 space-y-2">
                <li>Start with a clear source image at a useful resolution.</li>
                <li>Use the available control gradually instead of assuming the maximum setting will look best.</li>
                <li>Compare the processed preview with the source before downloading.</li>
                <li>Remember that the final downloaded file is JPEG output.</li>
              </ul>
            </div>

          </div>
        </section>

</main>

      <canvas ref={canvasRef} style={{ display: 'none' }} />

      <script type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'WebApplication',
          name: 'Thermal Vision',
          description: 'Free online thermal vision and infrared color mapping tool',
          url: 'https://simplifyconvert.com/all-tools/thermal-vision',
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
