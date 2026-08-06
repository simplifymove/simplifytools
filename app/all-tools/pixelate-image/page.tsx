'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { Download, ChevronRight, Loader, Grid } from 'lucide-react';
import { HomeHeader } from '../../components/HomeHeader';
import { Footer } from '../../components/Footer';
import { useRouter } from 'next/navigation';
import { uploadBrowserDownloadResult } from '@/app/lib/download-result-client';

export default function PixelateImagePage() {
    const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [pixelSize, setPixelSize] = useState(10);
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

  const applyPixelate = async () => {
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

          for (let i = 0; i < canvas.height; i += pixelSize) {
            for (let j = 0; j < canvas.width; j += pixelSize) {
              const pixelIndex = (i * canvas.width + j) * 4;
              const r = data[pixelIndex];
              const g = data[pixelIndex + 1];
              const b = data[pixelIndex + 2];
              const a = data[pixelIndex + 3];

              for (let pi = 0; pi < pixelSize && i + pi < canvas.height; pi++) {
                for (let pj = 0; pj < pixelSize && j + pj < canvas.width; pj++) {
                  const idx = ((i + pi) * canvas.width + (j + pj)) * 4;
                  data[idx] = r;
                  data[idx + 1] = g;
                  data[idx + 2] = b;
                  data[idx + 3] = a;
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
      console.error('Error applying pixelate:', error);
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
            toolSlug: 'pixelate-image',
            originalName: `pixelated-${Date.now()}.jpg`,
            outputName: `pixelated-${Date.now()}.jpg`,
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
        <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 py-16 px-4 md:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-2 text-white/80 text-sm mb-6">
              <Link href="/" className="hover:text-white transition">Home</Link>
              <ChevronRight size={16} />
              <Link href="/all-tools" className="hover:text-white transition">All Tools</Link>
              <ChevronRight size={16} />
              <span>Pixelate Image</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">🎨 Pixelate Image</h1>
            <p className="text-lg text-white/90 max-w-2xl">
              Create pixelated and mosaic effects on your photos. Perfect for privacy, artistic effects, or retro-style images.
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 py-12 px-4 md:px-8">
          <div className="max-w-4xl mx-auto">
            {/* Upload Section */}
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Pixelate Your Image</h2>

              <div className="mb-6">
                <label className="block text-gray-700 font-semibold mb-3">Upload Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-indigo-400 transition"
                />
              </div>

              {preview && (
                <>
                  <div className="mb-6">
                    <label className="block text-gray-700 font-semibold mb-3">
                      Pixel Size: {pixelSize}px
                    </label>
                    <input
                      type="range"
                      min="2"
                      max="50"
                      value={pixelSize}
                      onChange={(e) => setPixelSize(Number(e.target.value))}
                      className="w-full"
                    />
                    <p className="text-sm text-gray-600 mt-2">Smaller = more detailed pixelation, Larger = more blur</p>
                  </div>

                  <button
                    onClick={applyPixelate}
                    disabled={processing}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg transition flex items-center justify-center gap-2"
                  >
                    {processing ? <Loader className="animate-spin" size={20} /> : <Grid size={20} />}
                    {processing ? 'Processing...' : 'Apply Pixelate Effect'}
                  </button>
                </>
              )}

              {result && (
                <button
                  onClick={handleDownload}
                  className="w-full mt-4 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition flex items-center justify-center gap-2"
                >
                  <Download size={20} />
                  Download Pixelated Image
                </button>
              )}
            </div>

            {/* How To Section */}
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">How to Pixelate an Image</h2>
              <ol className="space-y-4 text-gray-700">
                <li><strong>1. Upload Your Image:</strong> Select a JPG, PNG, or WebP image from your device.</li>
                <li><strong>2. Adjust Pixel Size:</strong> Use the slider to control the pixelation level (2-50px).</li>
                <li><strong>3. Apply Effect:</strong> Click "Apply Pixelate Effect" to process your image.</li>
                <li><strong>4. Download:</strong> Save your pixelated image instantly.</li>
              </ol>
            </div>

            {/* Benefits Section */}
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Benefits of Pixelation</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-bold text-lg text-indigo-600 mb-2">Privacy Protection</h3>
                  <p className="text-gray-700">Blur faces and sensitive information in photos safely.</p>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-indigo-600 mb-2">Artistic Effects</h3>
                  <p className="text-gray-700">Create unique retro and modern art styles instantly.</p>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-indigo-600 mb-2">Mosaic Effects</h3>
                  <p className="text-gray-700">Transform photos into beautiful mosaic patterns.</p>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-indigo-600 mb-2">100% Free</h3>
                  <p className="text-gray-700">No registration or payment required, completely free.</p>
                </div>
              </div>
            </div>

            {/* FAQ Section */}
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Frequently Asked Questions</h2>
              <div className="space-y-4">
                <details className="border-l-4 border-indigo-500 pl-4 py-2">
                  <summary className="font-bold text-gray-800 cursor-pointer">What pixel sizes are available?</summary>
                  <p className="text-gray-700 mt-2">You can adjust pixel size from 2px to 50px. Smaller sizes create more detail, larger sizes create more blur.</p>
                </details>
                <details className="border-l-4 border-indigo-500 pl-4 py-2">
                  <summary className="font-bold text-gray-800 cursor-pointer">Is this good for hiding faces?</summary>
                  <p className="text-gray-700 mt-2">Yes! Pixelation is commonly used to anonymize faces and sensitive information in photos.</p>
                </details>
                <details className="border-l-4 border-indigo-500 pl-4 py-2">
                  <summary className="font-bold text-gray-800 cursor-pointer">Can I customize the effect?</summary>
                  <p className="text-gray-700 mt-2">Yes, the pixel size slider lets you adjust the effect from subtle to extreme.</p>
                </details>
                <details className="border-l-4 border-indigo-500 pl-4 py-2">
                  <summary className="font-bold text-gray-800 cursor-pointer">Is my image kept private?</summary>
                  <p className="text-gray-700 mt-2">The pixelation effect itself is produced with browser-based image processing.</p>
                </details>
                <details className="border-l-4 border-indigo-500 pl-4 py-2">
                  <summary className="font-bold text-gray-800 cursor-pointer">What formats are supported?</summary>
                  <p className="text-gray-700 mt-2">We support JPG, PNG, WebP, BMP, and TIFF formats.</p>
                </details>
                <details className="border-l-4 border-indigo-500 pl-4 py-2">
                  <summary className="font-bold text-gray-800 cursor-pointer">Does pixelation reduce file size?</summary>
                  <p className="text-gray-700 mt-2">Yes, heavily pixelated images often have smaller file sizes due to reduced color complexity.</p>
                </details>
              </div>
            </div>

            {/* Related Tools */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Related Image Tools</h2>
              <div className="grid md:grid-cols-3 gap-4">
                <Link href="/all-tools/blur-image" className="p-4 border-2 border-indigo-200 rounded-lg hover:bg-indigo-50 transition">
                  <h3 className="font-bold text-gray-800">Blur Image</h3>
                  <p className="text-sm text-gray-600">Blur effect with intensity</p>
                </Link>
                <Link href="/all-tools/black-white" className="p-4 border-2 border-indigo-200 rounded-lg hover:bg-indigo-50 transition">
                  <h3 className="font-bold text-gray-800">Black & White</h3>
                  <p className="text-sm text-gray-600">Convert to grayscale</p>
                </Link>
                <Link href="/all-tools/invert-colors" className="p-4 border-2 border-indigo-200 rounded-lg hover:bg-indigo-50 transition">
                  <h3 className="font-bold text-gray-800">Invert Colors</h3>
                  <p className="text-sm text-gray-600">Create negative effects</p>
                </Link>
              </div>
            </div>
          </div>
        </div>

        <Footer />

        <section className="bg-white border-t border-gray-200 px-4 md:px-8 py-14">
          <div className="max-w-6xl mx-auto space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                How to pixelate an image
              </h2>
              <p className="text-gray-600 leading-7">
Upload an image and adjust the pixel-size control to choose how
                coarse the effect should appear. The browser groups image
                detail into larger visual blocks, updates the preview, and
                prepares the processed result for download.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="border border-gray-200 rounded-xl p-6">
                <h3 className="font-semibold text-gray-900 mb-2">
                  Browser-based processing
                </h3>
                <p className="text-sm text-gray-600 leading-6">
                  The image effect is produced with browser image and Canvas
                  processing. The preview lets you inspect the result before
                  using the available download action.
                </p>
              </div>

              <div className="border border-gray-200 rounded-xl p-6">
                <h3 className="font-semibold text-gray-900 mb-2">
                  What the effect changes
                </h3>
                <p className="text-sm text-gray-600 leading-6">
                  Larger pixel blocks hide more fine detail, but pixelation should not be treated as a guaranteed method for permanently anonymizing sensitive information.
                </p>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Tips for better results
              </h2>
              <p className="text-gray-600 leading-7">
                Start with a clear source image and compare the preview with
                the original before downloading. Stronger effect settings can
                intentionally remove or alter visible detail, so choose the
                setting according to the result you need.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                to pixelate an image FAQ
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900">
                    Does the effect increase image resolution?
                  </h3>
                  <p className="text-sm text-gray-600 mt-1 leading-6">
                    No. The tool changes the appearance of existing image
                    pixels; it does not reconstruct missing source detail.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    Can I preview the result before downloading?
                  </h3>
                  <p className="text-sm text-gray-600 mt-1 leading-6">
                    Yes. Use the on-page preview and available controls to
                    inspect the processed image before downloading it.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

</main>

      {/* Hidden canvas for processing */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* JSON-LD Schema */}
      <script type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'WebApplication',
          name: 'Pixelate Image',
          description: 'Free online pixelate and mosaic image tool',
          url: 'https://simplifyconvert.com/all-tools/pixelate-image',
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
