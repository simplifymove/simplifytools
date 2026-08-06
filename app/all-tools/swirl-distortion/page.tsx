'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { Download, ChevronRight, Loader, Wand2 } from 'lucide-react';
import { HomeHeader } from '../../components/HomeHeader';
import { Footer } from '../../components/Footer';
import { useRouter } from 'next/navigation';
import { uploadBrowserDownloadResult } from '@/app/lib/download-result-client';

export default function SwirlDistortionPage() {
    const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [angle, setAngle] = useState(45);
  const [radius, setRadius] = useState(50);
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

  const applySwirlDistortion = async () => {
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
          const maxRadius = (radius / 100) * Math.min(centerX, centerY);
          const radians = (angle * Math.PI) / 180;

          for (let y = 0; y < canvas.height; y++) {
            for (let x = 0; x < canvas.width; x++) {
              const dx = x - centerX;
              const dy = y - centerY;
              const distance = Math.sqrt(dx * dx + dy * dy);

              if (distance < maxRadius) {
                const strength = 1 - distance / maxRadius;
                const swirl = strength * radians;

                const cos = Math.cos(swirl);
                const sin = Math.sin(swirl);

                const sampleX = centerX + dx * cos - dy * sin;
                const sampleY = centerY + dx * sin + dy * cos;

                if (sampleX >= 0 && sampleX < canvas.width && sampleY >= 0 && sampleY < canvas.height) {
                  const idx = (y * canvas.width + x) * 4;
                  const sampleIdx = (Math.floor(sampleY) * canvas.width + Math.floor(sampleX)) * 4;

                  data[idx] = data[sampleIdx];
                  data[idx + 1] = data[sampleIdx + 1];
                  data[idx + 2] = data[sampleIdx + 2];
                  data[idx + 3] = data[sampleIdx + 3];
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
      console.error('Error applying swirl distortion:', error);
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
            toolSlug: 'swirl-distortion',
            originalName: `swirl-distortion-${Date.now()}.jpg`,
            outputName: `swirl-distortion-${Date.now()}.jpg`,
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
        <div className="bg-gradient-to-r from-teal-500 via-blue-500 to-teal-600 py-16 px-4 md:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-2 text-white/80 text-sm mb-6">
              <Link href="/" className="hover:text-white transition">Home</Link>
              <ChevronRight size={16} />
              <Link href="/all-tools" className="hover:text-white transition">All Tools</Link>
              <ChevronRight size={16} />
              <span>Swirl Distortion</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">🌀 Swirl Distortion</h1>
            <p className="text-lg text-white/90 max-w-2xl">
              Create twisting vortex effects. Apply dynamic swirling transformations to images.
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 py-12 px-4 md:px-8">
          <div className="max-w-4xl mx-auto">
            {/* Upload Section */}
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Apply Swirl Distortion</h2>

              <div className="mb-6">
                <label className="block text-gray-700 font-semibold mb-3">Upload Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-teal-400 transition"
                />
              </div>

              {preview && (
                <>
                  <div className="grid grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className="block text-gray-700 font-semibold mb-3">
                        Swirl Angle: {angle}°
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="360"
                        value={angle}
                        onChange={(e) => setAngle(Number(e.target.value))}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-semibold mb-3">
                        Radius: {radius}%
                      </label>
                      <input
                        type="range"
                        min="10"
                        max="100"
                        value={radius}
                        onChange={(e) => setRadius(Number(e.target.value))}
                        className="w-full"
                      />
                    </div>
                  </div>

                  <button
                    onClick={applySwirlDistortion}
                    disabled={processing}
                    className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 px-6 rounded-lg transition flex items-center justify-center gap-2"
                  >
                    {processing ? <Loader className="animate-spin" size={20} /> : <Wand2 size={20} />}
                    {processing ? 'Processing...' : 'Apply Swirl Distortion'}
                  </button>
                </>
              )}

              {result && (
                <button
                  onClick={handleDownload}
                  className="w-full mt-4 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition flex items-center justify-center gap-2"
                >
                  <Download size={20} />
                  Download Swirled Image
                </button>
              )}
            </div>

            {/* How To Section */}
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">How to Apply Swirl Distortion</h2>
              <ol className="space-y-4 text-gray-700">
                <li><strong>1. Upload Photo:</strong> Select a JPG, PNG, or WebP image.</li>
                <li><strong>2. Set Angle:</strong> Choose swirl rotation angle (0-360°).</li>
                <li><strong>3. Set Radius:</strong> Control swirl area size (10-100%).</li>
                <li><strong>4. Download:</strong> Save your swirled image.</li>
              </ol>
            </div>

            {/* Benefits Section */}
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Swirl Distortion Benefits</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-bold text-lg text-teal-600 mb-2">Vortex Effects</h3>
                  <p className="text-gray-700">Create dramatic twisting effects.</p>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-teal-600 mb-2">Customizable</h3>
                  <p className="text-gray-700">Control angle and radius separately.</p>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-teal-600 mb-2">Creative Effects</h3>
                  <p className="text-gray-700">Transform images artistically.</p>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-teal-600 mb-2">100% Free</h3>
                  <p className="text-gray-700">No registration or payment needed.</p>
                </div>
              </div>
            </div>

            {/* FAQ Section */}
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Frequently Asked Questions</h2>
              <div className="space-y-4">
                <details className="border-l-4 border-teal-500 pl-4 py-2">
                  <summary className="font-bold text-gray-800 cursor-pointer">What angle should I use?</summary>
                  <p className="text-gray-700 mt-2">45-90° for balanced swirl. Higher for more intense.</p>
                </details>
                <details className="border-l-4 border-teal-500 pl-4 py-2">
                  <summary className="font-bold text-gray-800 cursor-pointer">What radius works best?</summary>
                  <p className="text-gray-700 mt-2">50% covers center. Higher includes more area.</p>
                </details>
                <details className="border-l-4 border-teal-500 pl-4 py-2">
                  <summary className="font-bold text-gray-800 cursor-pointer">Works on all images?</summary>
                  <p className="text-gray-700 mt-2">The upload control supports JPG, PNG, and WebP images.</p>
                </details>
                <details className="border-l-4 border-teal-500 pl-4 py-2">
                  <summary className="font-bold text-gray-800 cursor-pointer">Can I use commercially?</summary>
                  <p className="text-gray-700 mt-2">Yes, swirl images can be used commercially.</p>
                </details>
                <details className="border-l-4 border-teal-500 pl-4 py-2">
                  <summary className="font-bold text-gray-800 cursor-pointer">Is data private?</summary>
                  <p className="text-gray-700 mt-2">The visual effect is processed in your browser. When you choose Download, the processed JPEG is sent through the download-result service so the download page can be prepared.</p>
                </details>
                <details className="border-l-4 border-teal-500 pl-4 py-2">
                  <summary className="font-bold text-gray-800 cursor-pointer">Smooth distortion?</summary>
                  <p className="text-gray-700 mt-2">Yes, smooth vortex transformation.</p>
                </details>
              </div>
            </div>

            {/* Related Tools */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Related Effect Tools</h2>
              <div className="grid md:grid-cols-3 gap-4">
                <Link href="/all-tools/dream-effect" className="p-4 border-2 border-teal-200 rounded-lg hover:bg-teal-50 transition">
                  <h3 className="font-bold text-gray-800">Dream Effect</h3>
                  <p className="text-sm text-gray-600">Psychedelic effects</p>
                </Link>
                <Link href="/all-tools/glitch-effect" className="p-4 border-2 border-teal-200 rounded-lg hover:bg-teal-50 transition">
                  <h3 className="font-bold text-gray-800">Glitch Effect</h3>
                  <p className="text-sm text-gray-600">Digital glitch</p>
                </Link>
                <Link href="/all-tools/kaleidoscope" className="p-4 border-2 border-teal-200 rounded-lg hover:bg-teal-50 transition">
                  <h3 className="font-bold text-gray-800">Kaleidoscope</h3>
                  <p className="text-sm text-gray-600">Pattern effects</p>
                </Link>
              </div>
            </div>
          </div>
        </div>

        <Footer />

        {/* Batch supporting content: swirl-distortion */}
        <section className="bg-white border-t border-gray-200 px-4 md:px-8 py-14">
          <div className="max-w-6xl mx-auto space-y-10">

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                How swirl distortion changes an image
              </h2>
              <p className="text-gray-600 leading-7">
                The Swirl Distortion tool remaps pixels around the center of the image. The angle controls the amount of rotation, while the radius determines how much of the image participates in the transformation. Pixels farther from the affected center receive progressively less distortion.
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
          name: 'Swirl Distortion',
          description: 'Free online swirl distortion and vortex effect tool',
          url: 'https://simplifyconvert.com/all-tools/swirl-distortion',
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
