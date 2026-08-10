'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { Download, ChevronRight, Loader, Sparkles } from 'lucide-react';
import { HomeHeader } from '../../components/HomeHeader';
import { Footer } from '../../components/Footer';
import { useRouter } from 'next/navigation';
import { uploadBrowserDownloadResult } from '@/app/lib/download-result-client';

export default function SketchEffectPage() {
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

  const applySketchEffect = async () => {
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

          // Convert to grayscale
          for (let i = 0; i < data.length; i += 4) {
            const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
            data[i] = gray;
            data[i + 1] = gray;
            data[i + 2] = gray;
          }

          ctx.putImageData(imageData, 0, 0);

          // Apply edge detection for sketch outline
          const outlineData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const outline = outlineData.data;

          for (let y = 1; y < canvas.height - 1; y++) {
            for (let x = 1; x < canvas.width - 1; x++) {
              const idx = (y * canvas.width + x) * 4;
              let edgeStrength = 0;

              for (let dy = -1; dy <= 1; dy++) {
                for (let dx = -1; dx <= 1; dx++) {
                  const nIdx = ((y + dy) * canvas.width + (x + dx)) * 4;
                  edgeStrength += Math.abs(data[idx] - data[nIdx]);
                }
              }

              const inverted = 255 - Math.min(255, edgeStrength * intensity / 50);
              outline[idx] = inverted;
              outline[idx + 1] = inverted;
              outline[idx + 2] = inverted;
            }
          }

          ctx.putImageData(outlineData, 0, 0);
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
      console.error('Error applying sketch effect:', error);
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
            toolSlug: 'sketch-effect',
            originalName: `sketch-${Date.now()}.jpg`,
            outputName: `sketch-${Date.now()}.jpg`,
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
        <div className="bg-gradient-to-r from-gray-400 via-slate-400 to-gray-500 py-16 px-4 md:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-2 text-white/80 text-sm mb-6">
              <Link href="/" className="hover:text-white transition">Home</Link>
              <ChevronRight size={16} />
              <Link href="/all-tools" className="hover:text-white transition">All Tools</Link>
              <ChevronRight size={16} />
              <span>Sketch Effect</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">✏️ Sketch Effect</h1>
            <p className="text-lg text-white/90 max-w-2xl">
              Apply a pencil-sketch-style transformation to photos using the available effect controls.
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 py-12 px-4 md:px-8">
          <div className="max-w-4xl mx-auto">
            {/* Upload Section */}
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Create Sketch Effect</h2>

              <div className="mb-6">
                <label className="block text-gray-700 font-semibold mb-3">Upload Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-slate-400 transition"
                />
              </div>

              {preview && (
                <>
                  <div className="mb-6">
                    <label className="block text-gray-700 font-semibold mb-3">
                      Intensity: {intensity}
                    </label>
                    <input
                      type="range"
                      min="10"
                      max="100"
                      value={intensity}
                      onChange={(e) => setIntensity(Number(e.target.value))}
                      className="w-full"
                    />
                    <p className="text-sm text-gray-600 mt-2">Adjust sketch line prominence</p>
                  </div>

                  <button
                    onClick={applySketchEffect}
                    disabled={processing}
                    className="w-full bg-slate-600 hover:bg-slate-700 text-white font-bold py-3 px-6 rounded-lg transition flex items-center justify-center gap-2"
                  >
                    {processing ? <Loader className="animate-spin" size={20} /> : <Sparkles size={20} />}
                    {processing ? 'Processing...' : 'Apply Sketch Effect'}
                  </button>
                </>
              )}

              {result && (
                <button
                  onClick={handleDownload}
                  className="w-full mt-4 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition flex items-center justify-center gap-2"
                >
                  <Download size={20} />
                  Download Sketch Image
                </button>
              )}
            </div>

            {/* How To Section */}
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">How to Create Sketch Effects</h2>
              <ol className="space-y-4 text-gray-700">
                <li><strong>1. Upload Photo:</strong> Select a JPG, PNG, or WebP image.</li>
                <li><strong>2. Adjust Intensity:</strong> Control line prominence and detail.</li>
                <li><strong>3. Apply Effect:</strong> Click "Apply Sketch Effect" to process.</li>
                <li><strong>4. Download:</strong> Save your pencil sketch image.</li>
              </ol>
            </div>

            {/* Benefits Section */}
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Sketch Effect Benefits</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-bold text-lg text-slate-600 mb-2">Artistic Look</h3>
                  <p className="text-gray-700">Convert photos into beautiful hand-drawn sketches.</p>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-600 mb-2">Portfolio Ready</h3>
                  <p className="text-gray-700">Great for artists and creative portfolios.</p>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-600 mb-2">Social Media</h3>
                  <p className="text-gray-700">Create engaging sketch-style artwork.</p>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-600 mb-2">100% Free</h3>
                  <p className="text-gray-700">No cost, no registration needed.</p>
                </div>
              </div>
            </div>

            {/* FAQ Section */}
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Frequently Asked Questions</h2>
              <div className="space-y-4">
                <details className="border-l-4 border-slate-500 pl-4 py-2">
                  <summary className="font-bold text-gray-800 cursor-pointer">What's the best intensity for sketches?</summary>
                  <p className="text-gray-700 mt-2">Start at 50. Lower for subtle sketches, higher for bold outlines.</p>
                </details>
                <details className="border-l-4 border-slate-500 pl-4 py-2">
                  <summary className="font-bold text-gray-800 cursor-pointer">Does this work on all photos?</summary>
                  <p className="text-gray-700 mt-2">Yes! Works best on photos with clear subjects and good contrast.</p>
                </details>
                <details className="border-l-4 border-slate-500 pl-4 py-2">
                  <summary className="font-bold text-gray-800 cursor-pointer">Can I use sketches commercially?</summary>
                  <p className="text-gray-700 mt-2">Yes, all processed images can be used commercially without restrictions.</p>
                </details>
                <details className="border-l-4 border-slate-500 pl-4 py-2">
                  <summary className="font-bold text-gray-800 cursor-pointer">Is quality preserved?</summary>
                  <p className="text-gray-700 mt-2">Yes, high-quality JPEG output maintains excellent detail.</p>
                </details>
                <details className="border-l-4 border-slate-500 pl-4 py-2">
                  <summary className="font-bold text-gray-800 cursor-pointer">Is my data private?</summary>
                  <p className="text-gray-700 mt-2">Yes, processing happens locally. No server uploads.</p>
                </details>
                <details className="border-l-4 border-slate-500 pl-4 py-2">
                  <summary className="font-bold text-gray-800 cursor-pointer">Can I edit further?</summary>
                  <p className="text-gray-700 mt-2">Yes, download and use any image editor for additional edits.</p>
                </details>
              </div>
            </div>

            {/* Related Tools */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Related Effect Tools</h2>
              <div className="grid md:grid-cols-3 gap-4">
                <Link href="/all-tools/cartoon-effect" className="p-4 border-2 border-slate-200 rounded-lg hover:bg-slate-50 transition">
                  <h3 className="font-bold text-gray-800">Cartoon Effect</h3>
                  <p className="text-sm text-gray-600">Comic style effects</p>
                </Link>
                <Link href="/all-tools/glow-effect" className="p-4 border-2 border-slate-200 rounded-lg hover:bg-slate-50 transition">
                  <h3 className="font-bold text-gray-800">Glow Effect</h3>
                  <p className="text-sm text-gray-600">Luminous glow</p>
                </Link>
                <Link href="/all-tools/black-white" className="p-4 border-2 border-slate-200 rounded-lg hover:bg-slate-50 transition">
                  <h3 className="font-bold text-gray-800">Black & White</h3>
                  <p className="text-sm text-gray-600">Grayscale conversion</p>
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
                How the Sketch Effect works
              </h2>
              <p className="text-gray-600 leading-7">
The sketch effect processes image pixels to reduce normal
                photographic color and emphasize outlines and tonal structure.
                The resulting image is a stylized sketch-like rendering rather
                than a hand-drawn reconstruction.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="border border-gray-200 rounded-xl p-6">
                <h3 className="font-semibold text-gray-900 mb-2">
                  Browser-based processing
                </h3>
                <p className="text-sm text-gray-600 leading-6">
                  The visual effect is generated with browser image and
                  Canvas processing. The source image is rendered, pixel
                  values are adjusted, and the result is prepared for
                  download through the existing image workflow.
                </p>
              </div>

              <div className="border border-gray-200 rounded-xl p-6">
                <h3 className="font-semibold text-gray-900 mb-2">
                  What the effect changes
                </h3>
                <p className="text-sm text-gray-600 leading-6">
                  The effect derives its lines and shading from existing image pixels, so results depend on source contrast and visible edges.
                </p>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Tips for better results
              </h2>
              <p className="text-gray-600 leading-7">
                Use a clear source image and compare the processed preview
                with the original. Strong effect settings can intentionally
                remove subtle detail or exaggerate edges and tonal changes.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                the Sketch Effect works FAQ
              </h2>

              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900">
                    Does this effect increase image resolution?
                  </h3>
                  <p className="text-sm text-gray-600 mt-1 leading-6">
                    No. It changes existing pixel values and does not recreate
                    missing detail or increase the source resolution.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900">
                    Can I preview the effect first?
                  </h3>
                  <p className="text-sm text-gray-600 mt-1 leading-6">
                    Yes. Review the available preview before downloading the
                    processed result.
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
          name: 'Sketch Effect',
          description: 'Free online sketch effect and pencil drawing converter',
          url: 'https://simplifyconvert.com/all-tools/sketch-effect',
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
