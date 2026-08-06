'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { Download, ChevronRight, Loader, Sparkles } from 'lucide-react';
import { HomeHeader } from '../../components/HomeHeader';
import { Footer } from '../../components/Footer';
import { useRouter } from 'next/navigation';
import { uploadBrowserDownloadResult } from '@/app/lib/download-result-client';

export default function KaleidoscopePage() {
    const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [segments, setSegments] = useState(6);
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

  const applyKaleidoscope = async () => {
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

          ctx.fillStyle = '#000';
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          const centerX = canvas.width / 2;
          const centerY = canvas.height / 2;
          const radius = Math.sqrt(centerX * centerX + centerY * centerY);

          ctx.save();
          ctx.translate(centerX, centerY);

          for (let i = 0; i < segments; i++) {
            ctx.save();
            ctx.rotate((i * 2 * Math.PI) / segments);
            ctx.drawImage(img, -centerX, -centerY);
            ctx.restore();
          }

          ctx.restore();

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
      console.error('Error applying kaleidoscope:', error);
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
            toolSlug: 'kaleidoscope',
            originalName: `kaleidoscope-${Date.now()}.jpg`,
            outputName: `kaleidoscope-${Date.now()}.jpg`,
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
              <span>Kaleidoscope Effect</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">🔮 Kaleidoscope Effect</h1>
            <p className="text-lg text-white/90 max-w-2xl">
              Generate beautiful symmetrical patterns. Create stunning kaleidoscope artwork from your images.
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 py-12 px-4 md:px-8">
          <div className="max-w-4xl mx-auto">
            {/* Upload Section */}
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Create Kaleidoscope Pattern</h2>

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
                      Segments: {segments}
                    </label>
                    <input
                      type="range"
                      min="3"
                      max="12"
                      value={segments}
                      onChange={(e) => setSegments(Number(e.target.value))}
                      className="w-full"
                    />
                    <p className="text-sm text-gray-600 mt-2">3-12 pattern segments</p>
                  </div>

                  <button
                    onClick={applyKaleidoscope}
                    disabled={processing}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg transition flex items-center justify-center gap-2"
                  >
                    {processing ? <Loader className="animate-spin" size={20} /> : <Sparkles size={20} />}
                    {processing ? 'Processing...' : 'Create Kaleidoscope'}
                  </button>
                </>
              )}

              {result && (
                <button
                  onClick={handleDownload}
                  className="w-full mt-4 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition flex items-center justify-center gap-2"
                >
                  <Download size={20} />
                  Download Kaleidoscope Image
                </button>
              )}
            </div>

            {/* How To Section */}
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">How to Create Kaleidoscope</h2>
              <ol className="space-y-4 text-gray-700">
                <li><strong>1. Upload Photo:</strong> Select a JPG, PNG, or WebP image.</li>
                <li><strong>2. Choose Segments:</strong> Select number of pattern segments (3-12).</li>
                <li><strong>3. Create Pattern:</strong> Click "Create Kaleidoscope".</li>
                <li><strong>4. Download:</strong> Save your kaleidoscope artwork.</li>
              </ol>
            </div>

            {/* Benefits Section */}
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Kaleidoscope Benefits</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-bold text-lg text-indigo-600 mb-2">Symmetrical Patterns</h3>
                  <p className="text-gray-700">Create perfect symmetrical designs.</p>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-indigo-600 mb-2">Customizable Segments</h3>
                  <p className="text-gray-700">Choose pattern complexity (3-12 segments).</p>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-indigo-600 mb-2">Unique Artwork</h3>
                  <p className="text-gray-700">Generate beautiful abstract art.</p>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-indigo-600 mb-2">100% Free</h3>
                  <p className="text-gray-700">No registration or payment needed.</p>
                </div>
              </div>
            </div>

            {/* FAQ Section */}
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Frequently Asked Questions</h2>
              <div className="space-y-4">
                <details className="border-l-4 border-indigo-500 pl-4 py-2">
                  <summary className="font-bold text-gray-800 cursor-pointer">What segments should I use?</summary>
                  <p className="text-gray-700 mt-2">6 segments is classic. Lower for simple, higher for complex.</p>
                </details>
                <details className="border-l-4 border-indigo-500 pl-4 py-2">
                  <summary className="font-bold text-gray-800 cursor-pointer">Works on all images?</summary>
                  <p className="text-gray-700 mt-2">JPG, PNG, and WebP images are supported. Detailed images can create more intricate-looking patterns.</p>
                </details>
                <details className="border-l-4 border-indigo-500 pl-4 py-2">
                  <summary className="font-bold text-gray-800 cursor-pointer">Can I use commercially?</summary>
                  <p className="text-gray-700 mt-2">Yes, kaleidoscope images can be used commercially.</p>
                </details>
                <details className="border-l-4 border-indigo-500 pl-4 py-2">
                  <summary className="font-bold text-gray-800 cursor-pointer">Output quality?</summary>
                  <p className="text-gray-700 mt-2">The processed pattern is exported as a JPEG.</p>
                </details>
                <details className="border-l-4 border-indigo-500 pl-4 py-2">
                  <summary className="font-bold text-gray-800 cursor-pointer">Is data private?</summary>
                  <p className="text-gray-700 mt-2">The visual effect is processed in your browser. When you choose Download, the processed JPEG is sent through the download-result service so the download page can be prepared.</p>
                </details>
                <details className="border-l-4 border-indigo-500 pl-4 py-2">
                  <summary className="font-bold text-gray-800 cursor-pointer">Different each time?</summary>
                  <p className="text-gray-700 mt-2">Same image always generates same pattern.</p>
                </details>
              </div>
            </div>

            {/* Related Tools */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Related Pattern Tools</h2>
              <div className="grid md:grid-cols-3 gap-4">
                <Link href="/all-tools/pixelate-image" className="p-4 border-2 border-indigo-200 rounded-lg hover:bg-indigo-50 transition">
                  <h3 className="font-bold text-gray-800">Pixelate Image</h3>
                  <p className="text-sm text-gray-600">Pixel patterns</p>
                </Link>
                <Link href="/all-tools/dream-effect" className="p-4 border-2 border-indigo-200 rounded-lg hover:bg-indigo-50 transition">
                  <h3 className="font-bold text-gray-800">Dream Effect</h3>
                  <p className="text-sm text-gray-600">Psychedelic effects</p>
                </Link>
                <Link href="/all-tools/neon-glow" className="p-4 border-2 border-indigo-200 rounded-lg hover:bg-indigo-50 transition">
                  <h3 className="font-bold text-gray-800">Neon Glow</h3>
                  <p className="text-sm text-gray-600">Glow effects</p>
                </Link>
              </div>
            </div>
          </div>
        </div>

        <Footer />

        {/* Batch supporting content: kaleidoscope */}
        <section className="bg-white border-t border-gray-200 px-4 md:px-8 py-14">
          <div className="max-w-6xl mx-auto space-y-10">

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                How kaleidoscope patterns are created
              </h2>
              <p className="text-gray-600 leading-7">
                The Kaleidoscope tool uses repeated rotated sections of the uploaded image around its center to produce a radial pattern. Changing the segment setting changes the number of repeated sections and therefore the structure of the resulting design. The finished pattern is exported as JPEG.
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
          name: 'Kaleidoscope Effect',
          description: 'Free online kaleidoscope pattern and symmetrical design creator',
          url: 'https://simplifyconvert.com/all-tools/kaleidoscope',
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
