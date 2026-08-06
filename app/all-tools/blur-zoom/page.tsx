'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Download, ChevronRight, Loader, Zap } from 'lucide-react';
import { HomeHeader } from '../../components/HomeHeader';
import { Footer } from '../../components/Footer';
import { uploadBrowserDownloadResult } from '@/app/lib/download-result-client';

export default function BlurZoomPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [strength, setStrength] = useState(10);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<Blob | null>(null);
  const [downloadError, setDownloadError] = useState('');
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

  const applyBlurZoom = async () => {
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

          const centerX = canvas.width / 2;
          const centerY = canvas.height / 2;
          const maxDist = Math.sqrt(centerX * centerX + centerY * centerY);

          for (let i = 0; i < strength; i++) {
            const blurRadius = (i + 1) * 2;
            for (let y = 0; y < canvas.height; y++) {
              for (let x = 0; x < canvas.width; x++) {
                const dx = x - centerX;
                const dy = y - centerY;
                const dist = Math.sqrt(dx * dx + dy * dy);

                const sampleX = Math.floor(x + (dx / maxDist) * blurRadius);
                const sampleY = Math.floor(y + (dy / maxDist) * blurRadius);

                if (sampleX >= 0 && sampleX < canvas.width && sampleY >= 0 && sampleY < canvas.height) {
                  const idx = (y * canvas.width + x) * 4;
                  const sampleIdx = (sampleY * canvas.width + sampleX) * 4;

                  data[idx] = (data[idx] + data[sampleIdx]) / 2;
                  data[idx + 1] = (data[idx + 1] + data[sampleIdx + 1]) / 2;
                  data[idx + 2] = (data[idx + 2] + data[sampleIdx + 2]) / 2;
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
      console.error('Error applying blur zoom:', error);
      setProcessing(false);
    }
  };

  const handleDownload = async () => {
    if (!result || !file) return;

    setProcessing(true);
    setDownloadError('');

    try {
      const downloadResult = await uploadBrowserDownloadResult({
        blob: result,
        toolSlug: 'blur-zoom',
        originalName: file.name,
        outputName: 'blur-zoom.jpg',
      });

      router.push(downloadResult.downloadPageUrl);
    } catch (error) {
      console.error('Error preparing blur zoom download:', error);
      setDownloadError(
        error instanceof Error
          ? error.message
          : 'Failed to prepare the download. Please try again.'
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
        <div className="bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-600 py-16 px-4 md:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-2 text-white/80 text-sm mb-6">
              <Link href="/" className="hover:text-white transition">Home</Link>
              <ChevronRight size={16} />
              <Link href="/all-tools" className="hover:text-white transition">All Tools</Link>
              <ChevronRight size={16} />
              <span>Blur Zoom</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">⚡ Blur Zoom</h1>
            <p className="text-lg text-white/90 max-w-2xl">
              Apply radial zoom blur effects from center. Create dynamic motion blur and speed effects.
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 py-12 px-4 md:px-8">
          <div className="max-w-4xl mx-auto">
            {/* Upload Section */}
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Apply Blur Zoom Effect</h2>

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
                  <div className="mb-6">
                    <label className="block text-gray-700 font-semibold mb-3">
                      Zoom Strength: {strength}
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="20"
                      value={strength}
                      onChange={(e) => setStrength(Number(e.target.value))}
                      className="w-full"
                    />
                    <p className="text-sm text-gray-600 mt-2">1 = subtle, 20 = intense zoom blur</p>
                  </div>

                  <button
                    onClick={applyBlurZoom}
                    disabled={processing}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition flex items-center justify-center gap-2"
                  >
                    {processing ? <Loader className="animate-spin" size={20} /> : <Zap size={20} />}
                    {processing ? 'Processing...' : 'Apply Blur Zoom'}
                  </button>
                </>
              )}

              {downloadError && (
                <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  {downloadError}
                </div>
              )}

              {result && (
                <button
                  onClick={handleDownload}
                  disabled={processing}
                  className="w-full mt-4 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white font-bold py-3 px-6 rounded-lg transition flex items-center justify-center gap-2"
                >
                  {processing ? (
                    <>
                      <Loader className="animate-spin" size={20} />
                      Preparing download...
                    </>
                  ) : (
                    <>
                      <Download size={20} />
                      Download Zoomed Image
                    </>
                  )}
                </button>
              )}
            </div>

            {/* How To Section */}
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">How to Apply Blur Zoom</h2>
              <ol className="space-y-4 text-gray-700">
                <li><strong>1. Upload Photo:</strong> Select a JPG, PNG, or WebP image.</li>
                <li><strong>2. Adjust Strength:</strong> Control zoom blur intensity (1-20).</li>
                <li><strong>3. Apply Effect:</strong> Click "Apply Blur Zoom".</li>
                <li><strong>4. Download:</strong> Save your zoomed image.</li>
              </ol>
            </div>

            {/* Benefits Section */}
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Blur Zoom Benefits</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-bold text-lg text-blue-600 mb-2">Motion Effect</h3>
                  <p className="text-gray-700">Create dynamic speed and motion.</p>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-blue-600 mb-2">Customizable</h3>
                  <p className="text-gray-700">Control blur strength and intensity.</p>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-blue-600 mb-2">Radial Blur</h3>
                  <p className="text-gray-700">Blur from center outward effect.</p>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-blue-600 mb-2">100% Free</h3>
                  <p className="text-gray-700">No registration or payment needed.</p>
                </div>
              </div>
            </div>

            {/* FAQ Section */}
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Frequently Asked Questions</h2>
              <div className="space-y-4">
                <details className="border-l-4 border-blue-500 pl-4 py-2">
                  <summary className="font-bold text-gray-800 cursor-pointer">What strength should I use?</summary>
                  <p className="text-gray-700 mt-2">Start at 5-10 for balanced effect. Higher for more dramatic.</p>
                </details>
                <details className="border-l-4 border-blue-500 pl-4 py-2">
                  <summary className="font-bold text-gray-800 cursor-pointer">Works on all images?</summary>
                  <p className="text-gray-700 mt-2">Yes, works on any photo. Action photos work best.</p>
                </details>
                <details className="border-l-4 border-blue-500 pl-4 py-2">
                  <summary className="font-bold text-gray-800 cursor-pointer">Can I use commercially?</summary>
                  <p className="text-gray-700 mt-2">Yes, blur zoom images can be used commercially.</p>
                </details>
                <details className="border-l-4 border-blue-500 pl-4 py-2">
                  <summary className="font-bold text-gray-800 cursor-pointer">Output quality?</summary>
                  <p className="text-gray-700 mt-2">High-quality JPEG with excellent blur effect.</p>
                </details>
                <details className="border-l-4 border-blue-500 pl-4 py-2">
                  <summary className="font-bold text-gray-800 cursor-pointer">Is data private?</summary>
                  <p className="text-gray-700 mt-2">Yes, local browser processing only.</p>
                </details>
                <details className="border-l-4 border-blue-500 pl-4 py-2">
                  <summary className="font-bold text-gray-800 cursor-pointer">Real zoom blur?</summary>
                  <p className="text-gray-700 mt-2">Simulates radial zoom blur from image center.</p>
                </details>
              </div>
            </div>

            {/* Related Tools */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Related Effect Tools</h2>
              <div className="grid md:grid-cols-3 gap-4">
                <Link href="/all-tools/motion-blur" className="p-4 border-2 border-blue-200 rounded-lg hover:bg-blue-50 transition">
                  <h3 className="font-bold text-gray-800">Motion Blur</h3>
                  <p className="text-sm text-gray-600">Directional blur</p>
                </Link>
                <Link href="/all-tools/glow-effect" className="p-4 border-2 border-blue-200 rounded-lg hover:bg-blue-50 transition">
                  <h3 className="font-bold text-gray-800">Glow Effect</h3>
                  <p className="text-sm text-gray-600">Luminous effects</p>
                </Link>
                <Link href="/all-tools/lens-flare" className="p-4 border-2 border-blue-200 rounded-lg hover:bg-blue-50 transition">
                  <h3 className="font-bold text-gray-800">Lens Flare</h3>
                  <p className="text-sm text-gray-600">Optical effects</p>
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
                How the Zoom Blur effect works
              </h2>
              <p className="text-gray-600 leading-7">
The tool creates a radial blur by sampling and blending image
                information along paths extending from the center area. This
                produces a visual impression of movement toward or away from
                the center of the image.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="border border-gray-200 rounded-xl p-6">
                <h3 className="font-semibold text-gray-900 mb-2">
                  Browser-based processing
                </h3>
                <p className="text-sm text-gray-600 leading-6">
                  The effect is generated with browser image and Canvas
                  processing. No separate server conversion step is used for
                  the visual effect itself.
                </p>
              </div>

              <div className="border border-gray-200 rounded-xl p-6">
                <h3 className="font-semibold text-gray-900 mb-2">
                  What the effect changes
                </h3>
                <p className="text-sm text-gray-600 leading-6">
                  Zoom blur intentionally softens and stretches visible detail along radial directions; stronger settings produce a more pronounced effect.
                </p>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Tips for better results
              </h2>
              <p className="text-gray-600 leading-7">
                Start with a clear source image and use moderate settings
                before increasing the effect. Compare the preview with the
                original because stronger processing can intentionally reduce
                or exaggerate visible detail.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                the Zoom Blur effect works FAQ
              </h2>

              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900">
                    Does this effect increase image resolution?
                  </h3>
                  <p className="text-sm text-gray-600 mt-1 leading-6">
                    No. The tool changes or overlays existing image pixels and
                    does not reconstruct missing source detail.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900">
                    Can I preview the effect before downloading?
                  </h3>
                  <p className="text-sm text-gray-600 mt-1 leading-6">
                    Yes. Use the available controls and preview to inspect the
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
          name: 'Blur Zoom',
          description: 'Free online radial zoom blur and motion effect tool',
          url: 'https://simplifyconvert.com/all-tools/blur-zoom',
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
