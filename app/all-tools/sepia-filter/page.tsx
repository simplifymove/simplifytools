'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { Download, ChevronRight, Loader, Sparkles } from 'lucide-react';
import { HomeHeader } from '../../components/HomeHeader';
import { Footer } from '../../components/Footer';
import { useRouter } from 'next/navigation';
import { uploadBrowserDownloadResult } from '@/app/lib/download-result-client';

export default function SepiaFilterPage() {
    const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [intensity, setIntensity] = useState(100);
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

  const applySepiaFilter = async () => {
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
          const intensityValue = intensity / 100;

          for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const gray = r * 0.299 + g * 0.587 + b * 0.114;

            data[i] = Math.min(255, gray + 100 * intensityValue);
            data[i + 1] = Math.min(255, gray + 50 * intensityValue);
            data[i + 2] = Math.max(0, gray - 50 * intensityValue);
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
      console.error('Error applying sepia filter:', error);
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
            toolSlug: 'sepia-filter',
            originalName: 'sepia-filtered-image.jpg',
            outputName: 'sepia-filtered-image.jpg',
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
        <div className="bg-gradient-to-r from-amber-600 via-orange-500 to-amber-600 py-16 px-4 md:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-2 text-white/80 text-sm mb-6">
              <Link href="/" className="hover:text-white transition">Home</Link>
              <ChevronRight size={16} />
              <Link href="/all-tools" className="hover:text-white transition">All Tools</Link>
              <ChevronRight size={16} />
              <span>Sepia Filter</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">🎂 Sepia Filter</h1>
            <p className="text-lg text-white/90 max-w-2xl mb-4">
              Convert your photos to warm sepia-style tones. Transform modern images into warm, vintage memories with authentic sepia color grading.
            </p>
            <p className="text-base text-white/80 max-w-2xl">
              Create a warm, vintage-style color treatment.
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 py-12 px-4 md:px-8">
          <div className="max-w-4xl mx-auto">
            {/* Upload Section */}
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Apply Sepia Filter</h2>

              <div className="mb-6">
                <label className="block text-gray-700 font-semibold mb-3">Upload Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-amber-600 transition"
                />
              </div>

              {preview && (
                <>
                  <div className="mb-6">
                    <label className="block text-gray-700 font-semibold mb-3">Sepia Intensity: {intensity}%</label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={intensity}
                      onChange={(e) => setIntensity(Number(e.target.value))}
                      className="w-full"
                    />
                  </div>

                  <button
                    onClick={applySepiaFilter}
                    disabled={processing}
                    className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 px-6 rounded-lg transition flex items-center justify-center gap-2"
                  >
                    {processing ? <Loader className="animate-spin" size={20} /> : <Sparkles size={20} />}
                    {processing ? 'Processing...' : 'Apply Sepia Effect'}
                  </button>
                </>
              )}

              {result && (
                <button
                  onClick={handleDownload}
                  className="w-full mt-4 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition flex items-center justify-center gap-2"
                >
                  <Download size={20} />
                  Download Sepia Image
                </button>
              )}
            </div>

            {/* How To Section */}
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">How to Use Sepia Filter</h2>
              <ol className="space-y-4 text-gray-700">
                <li><strong>1. Choose Your Photo:</strong> Click upload to select a JPG, PNG, or WebP image from your device.</li>
                <li><strong>2. Adjust Intensity:</strong> Use the slider to control how strong the sepia effect appears (0-100%).</li>
                <li><strong>3. Preview Effect:</strong> See the sepia tone applied before downloading.</li>
                <li><strong>4. Apply Filter:</strong> Click "Apply Sepia Effect" to process your image.</li>
                <li><strong>5. Save Result:</strong> Download your sepia-toned photo to your device.</li>
              </ol>
            </div>

            {/* Benefits Section */}
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Why Choose Sepia Filters</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-bold text-lg text-amber-700 mb-2">Authentic Vintage Look</h3>
                  <p className="text-gray-700">Create genuine sepia tones that look like classic old photographs.</p>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-amber-700 mb-2">Adjustable Warmth</h3>
                  <p className="text-gray-700">Control the intensity from subtle to bold sepia effects.</p>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-amber-700 mb-2">No Complex Setup</h3>
                  <p className="text-gray-700">One-click vintage conversion with no technical knowledge required.</p>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-amber-700 mb-2">Completely Free</h3>
                  <p className="text-gray-700">No watermarks, subscriptions, or hidden costs ever.</p>
                </div>
              </div>
            </div>

            {/* FAQ Section */}
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Frequently Asked Questions</h2>
              <div className="space-y-4">
                <details className="border-l-4 border-amber-600 pl-4 py-2">
                  <summary className="font-bold text-gray-800 cursor-pointer">What is sepia tone?</summary>
                  <p className="text-gray-700 mt-2">Sepia is a warm, brownish color tone originally used in old photographs from the 19th and early 20th centuries.</p>
                </details>
                <details className="border-l-4 border-amber-600 pl-4 py-2">
                  <summary className="font-bold text-gray-800 cursor-pointer">Why were old photos sepia-toned?</summary>
                  <p className="text-gray-700 mt-2">Early color photography used sepia tones naturally due to the photochemical processes used. It became the iconic vintage look.</p>
                </details>
                <details className="border-l-4 border-amber-600 pl-4 py-2">
                  <summary className="font-bold text-gray-800 cursor-pointer">What intensity should I use?</summary>
                  <p className="text-gray-700 mt-2">Start with 70-90% for a natural vintage look. Use 100% for bold sepia, or less than 50% for subtle toning.</p>
                </details>
                <details className="border-l-4 border-amber-600 pl-4 py-2">
                  <summary className="font-bold text-gray-800 cursor-pointer">Works on colored and B&W photos?</summary>
                  <p className="text-gray-700 mt-2">Yes! Sepia works beautifully on both color and black & white photos.</p>
                </details>
                <details className="border-l-4 border-amber-600 pl-4 py-2">
                  <summary className="font-bold text-gray-800 cursor-pointer">Is image quality affected?</summary>
                  <p className="text-gray-700 mt-2">Applying the filter changes the image pixels and creates a processed result. Review the output if preserving source detail is important.</p>
                </details>
                <details className="border-l-4 border-amber-600 pl-4 py-2">
                  <summary className="font-bold text-gray-800 cursor-pointer">Can I undo the sepia effect?</summary>
                  <p className="text-gray-700 mt-2">The original image is never modified. Simply reload to get the original, or adjust intensity before applying.</p>
                </details>
              </div>
            </div>

            {/* Related Tools */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">More Vintage & Filter Tools</h2>
              <div className="grid md:grid-cols-3 gap-4">
                <Link href="/all-tools/vintage-filter" className="p-4 border-2 border-amber-200 rounded-lg hover:bg-amber-50 transition">
                  <h3 className="font-bold text-gray-800">Vintage Filter</h3>
                  <p className="text-sm text-gray-600">Full retro photo effects</p>
                </Link>
                <Link href="/all-tools/vignette-effect" className="p-4 border-2 border-amber-200 rounded-lg hover:bg-amber-50 transition">
                  <h3 className="font-bold text-gray-800">Vignette Effect</h3>
                  <p className="text-sm text-gray-600">Add edge darkening</p>
                </Link>
                <Link href="/all-tools/color-grader" className="p-4 border-2 border-amber-200 rounded-lg hover:bg-amber-50 transition">
                  <h3 className="font-bold text-gray-800">Color Grader</h3>
                  <p className="text-sm text-gray-600">Color controls</p>
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
                How the Sepia Filter works
              </h2>
              <p className="text-gray-600 leading-7">
The sepia filter recalculates image color channels to produce
                warm brown and muted tonal values associated with a sepia-style
                photographic effect.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="border border-gray-200 rounded-xl p-6">
                <h3 className="font-semibold text-gray-900 mb-2">
                  Browser-based processing
                </h3>
                <p className="text-sm text-gray-600 leading-6">
                  The visual adjustment is produced with browser image and
                  Canvas processing. The preview lets you compare the result
                  before using the download action.
                </p>
              </div>

              <div className="border border-gray-200 rounded-xl p-6">
                <h3 className="font-semibold text-gray-900 mb-2">
                  What the adjustment changes
                </h3>
                <p className="text-sm text-gray-600 leading-6">
                  The effect changes existing pixel colors; it does not recreate historical film characteristics or add missing source detail.
                </p>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Tips for better results
              </h2>
              <p className="text-gray-600 leading-7">
                Start with moderate settings and compare the preview with the
                original. Strong adjustments can intentionally reduce subtle
                detail or produce a more stylized appearance.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                the Sepia Filter works FAQ
              </h2>

              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900">
                    Does this effect increase image resolution?
                  </h3>
                  <p className="text-sm text-gray-600 mt-1 leading-6">
                    No. It modifies the appearance of existing image pixels
                    and does not reconstruct missing source detail.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900">
                    Can I preview changes before downloading?
                  </h3>
                  <p className="text-sm text-gray-600 mt-1 leading-6">
                    Yes. Use the preview and available controls to review the
                    result before downloading it.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </section>

</main>

      <canvas ref={canvasRef} style={{ display: 'none' }} />

      <script type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'WebApplication',
          name: 'Sepia Filter',
          description: 'Free tool to apply classic sepia tone effects to photos',
          url: 'https://simplifyconvert.com/all-tools/sepia-filter',
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
