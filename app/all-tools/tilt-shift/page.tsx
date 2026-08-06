'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { Download, ChevronRight, Loader, Eye } from 'lucide-react';
import { HomeHeader } from '../../components/HomeHeader';
import { Footer } from '../../components/Footer';
import { useRouter } from 'next/navigation';
import { uploadBrowserDownloadResult } from '@/app/lib/download-result-client';

export default function TiltShiftPage() {
    const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [focusArea, setFocusArea] = useState(50);
  const [blurAmount, setBlurAmount] = useState(10);
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

  const applyTiltShift = async () => {
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

          const focusY = (focusArea / 100) * canvas.height;
          const band = canvas.height * 0.15;

          for (let y = 0; y < canvas.height; y++) {
            const distance = Math.abs(y - focusY);
            let blurStrength = 0;

            if (distance > band) {
              blurStrength = Math.min(1, (distance - band) / (canvas.height * 0.2)) * (blurAmount / 10);
            }

            if (blurStrength > 0) {
              for (let x = 0; x < canvas.width; x++) {
                const idx = (y * canvas.width + x) * 4;

                let r = 0, g = 0, b = 0, a = 0;
                const samples = Math.ceil(blurStrength * 5) + 1;

                for (let i = -samples; i <= samples; i++) {
                  const sampleX = Math.min(Math.max(x + i, 0), canvas.width - 1);
                  const sampleIdx = (y * canvas.width + sampleX) * 4;
                  r += data[sampleIdx];
                  g += data[sampleIdx + 1];
                  b += data[sampleIdx + 2];
                  a += data[sampleIdx + 3];
                }

                const count = samples * 2 + 1;
                data[idx] = Math.floor(r / count);
                data[idx + 1] = Math.floor(g / count);
                data[idx + 2] = Math.floor(b / count);
                data[idx + 3] = Math.floor(a / count);
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
      console.error('Error applying tilt shift:', error);
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
            toolSlug: 'tilt-shift',
            originalName: `tilt-shift-${Date.now()}.jpg`,
            outputName: `tilt-shift-${Date.now()}.jpg`,
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
        <div className="bg-gradient-to-r from-green-500 via-emerald-500 to-green-600 py-16 px-4 md:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-2 text-white/80 text-sm mb-6">
              <Link href="/" className="hover:text-white transition">Home</Link>
              <ChevronRight size={16} />
              <Link href="/all-tools" className="hover:text-white transition">All Tools</Link>
              <ChevronRight size={16} />
              <span>Tilt Shift Effect</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">🎯 Tilt Shift Effect</h1>
            <p className="text-lg text-white/90 max-w-2xl">
              Create miniature effect with selective focus. Transform photos into miniature-like images with depth-of-field blur.
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 py-12 px-4 md:px-8">
          <div className="max-w-4xl mx-auto">
            {/* Upload Section */}
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Create Tilt Shift Effect</h2>

              <div className="mb-6">
                <label className="block text-gray-700 font-semibold mb-3">Upload Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-green-400 transition"
                />
              </div>

              {preview && (
                <>
                  <div className="grid grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className="block text-gray-700 font-semibold mb-3">
                        Focus Area: {focusArea}%
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={focusArea}
                        onChange={(e) => setFocusArea(Number(e.target.value))}
                        className="w-full"
                      />
                      <p className="text-xs text-gray-600 mt-1">Position of sharp focus band</p>
                    </div>
                    <div>
                      <label className="block text-gray-700 font-semibold mb-3">
                        Blur Amount: {blurAmount}
                      </label>
                      <input
                        type="range"
                        min="1"
                        max="20"
                        value={blurAmount}
                        onChange={(e) => setBlurAmount(Number(e.target.value))}
                        className="w-full"
                      />
                      <p className="text-xs text-gray-600 mt-1">Blur strength (1-20)</p>
                    </div>
                  </div>

                  <button
                    onClick={applyTiltShift}
                    disabled={processing}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition flex items-center justify-center gap-2"
                  >
                    {processing ? <Loader className="animate-spin" size={20} /> : <Eye size={20} />}
                    {processing ? 'Processing...' : 'Apply Tilt Shift'}
                  </button>
                </>
              )}

              {result && (
                <button
                  onClick={handleDownload}
                  className="w-full mt-4 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition flex items-center justify-center gap-2"
                >
                  <Download size={20} />
                  Download Miniature Image
                </button>
              )}
            </div>

            {/* How To Section */}
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">How to Create Tilt Shift</h2>
              <ol className="space-y-4 text-gray-700">
                <li><strong>1. Upload Photo:</strong> Select a JPG, PNG, or WebP image.</li>
                <li><strong>2. Set Focus Area:</strong> Choose where to keep sharp (0-100%).</li>
                <li><strong>3. Adjust Blur:</strong> Control blur strength for effect.</li>
                <li><strong>4. Download:</strong> Save your miniature-style image.</li>
              </ol>
            </div>

            {/* Benefits Section */}
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Tilt Shift Benefits</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-bold text-lg text-green-600 mb-2">Miniature Effect</h3>
                  <p className="text-gray-700">Create realistic miniature-like appearance.</p>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-green-600 mb-2">Selective Focus</h3>
                  <p className="text-gray-700">Focus on specific area while blurring rest.</p>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-green-600 mb-2">Customizable</h3>
                  <p className="text-gray-700">Adjust focus position and blur amount.</p>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-green-600 mb-2">100% Free</h3>
                  <p className="text-gray-700">No registration or payment needed.</p>
                </div>
              </div>
            </div>

            {/* FAQ Section */}
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Frequently Asked Questions</h2>
              <div className="space-y-4">
                <details className="border-l-4 border-green-500 pl-4 py-2">
                  <summary className="font-bold text-gray-800 cursor-pointer">What focus area should I use?</summary>
                  <p className="text-gray-700 mt-2">Place focus on main subject. 50% focuses on middle.</p>
                </details>
                <details className="border-l-4 border-green-500 pl-4 py-2">
                  <summary className="font-bold text-gray-800 cursor-pointer">How much blur should I apply?</summary>
                  <p className="text-gray-700 mt-2">Start at 10 for subtle. Higher for stronger miniature effect.</p>
                </details>
                <details className="border-l-4 border-green-500 pl-4 py-2">
                  <summary className="font-bold text-gray-800 cursor-pointer">Works on all photos?</summary>
                  <p className="text-gray-700 mt-2">Yes, works best on landscape/cityscape photos.</p>
                </details>
                <details className="border-l-4 border-green-500 pl-4 py-2">
                  <summary className="font-bold text-gray-800 cursor-pointer">Can I use commercially?</summary>
                  <p className="text-gray-700 mt-2">Yes, tilt-shift images can be used commercially.</p>
                </details>
                <details className="border-l-4 border-green-500 pl-4 py-2">
                  <summary className="font-bold text-gray-800 cursor-pointer">Is data private?</summary>
                  <p className="text-gray-700 mt-2">Yes, all processing happens locally in browser.</p>
                </details>
                <details className="border-l-4 border-green-500 pl-4 py-2">
                  <summary className="font-bold text-gray-800 cursor-pointer">Output quality?</summary>
                  <p className="text-gray-700 mt-2">High-quality JPEG with excellent effect.</p>
                </details>
              </div>
            </div>

            {/* Related Tools */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Related Effect Tools</h2>
              <div className="grid md:grid-cols-3 gap-4">
                <Link href="/all-tools/blur-image" className="p-4 border-2 border-green-200 rounded-lg hover:bg-green-50 transition">
                  <h3 className="font-bold text-gray-800">Blur Image</h3>
                  <p className="text-sm text-gray-600">Gaussian blur effects</p>
                </Link>
                <Link href="/all-tools/motion-blur" className="p-4 border-2 border-green-200 rounded-lg hover:bg-green-50 transition">
                  <h3 className="font-bold text-gray-800">Motion Blur</h3>
                  <p className="text-sm text-gray-600">Dynamic motion blur</p>
                </Link>
                <Link href="/all-tools/vignette-effect" className="p-4 border-2 border-green-200 rounded-lg hover:bg-green-50 transition">
                  <h3 className="font-bold text-gray-800">Vignette Effect</h3>
                  <p className="text-sm text-gray-600">Edge darkening</p>
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
                How the Tilt-Shift Effect works
              </h2>
              <p className="text-gray-600 leading-7">
The tilt-shift effect keeps a selected region comparatively
                sharper while applying stronger blur to surrounding portions
                of the image. This can create a stylized shallow-focus look.
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
                  This is a simulated selective-blur effect; it does not recreate optical depth data or true camera tilt-shift behavior.
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
                the Tilt-Shift Effect works FAQ
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
          name: 'Tilt Shift Effect',
          description: 'Free online tilt shift effect and miniature image converter',
          url: 'https://simplifyconvert.com/all-tools/tilt-shift',
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
