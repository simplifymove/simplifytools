'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Download, ChevronRight, Loader, Droplet } from 'lucide-react';
import { HomeHeader } from '../../components/HomeHeader';
import { Footer } from '../../components/Footer';
import { useImageToolErrors } from '@/app/hooks/useImageToolErrors';
import { ErrorAlert } from '@/app/components/error-components';
import { ImageToolErrorType } from '@/app/utils/types/errors';
import { RelatedToolsSection } from '@/app/components/RelatedToolsSection';
import { uploadBrowserDownloadResult } from '@/app/lib/download-result-client';

const TOOL_ID = 'blur-image';
const TOOL_NAME = 'Blur Image';

export default function BlurImagePage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [blurAmount, setBlurAmount] = useState(5);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<Blob | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { error, clearError, createError } = useImageToolErrors();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onload = (event) => {
        setPreview(event.target?.result as string);
      };
      reader.readAsDataURL(selectedFile);
      setResult(null);
    }
  };

  const applyBlur = (): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      if (!preview || !canvasRef.current) {
        reject(new Error('No image loaded'));
        return;
      }

      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current!;
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Cannot get canvas context'));
          return;
        }

        // Apply blur using canvas filter
        ctx.filter = `blur(${blurAmount}px)`;
        ctx.drawImage(img, 0, 0);
        canvas.toBlob((blob) => { if (blob) resolve(blob); else reject(new Error('Canvas toBlob failed')); }, 'image/jpeg', 0.9);
      };
      img.src = preview;
    });
  };

  const handleBlur = async () => {
    if (!file) return;
    setProcessing(true);
    try {
      const blurred = await applyBlur();
      setResult(blurred);
    } catch (error) {
      createError(
        ImageToolErrorType.SHARP_FAILED,
        TOOL_ID,
        TOOL_NAME,
        { error: (error as Error).message },
        { filename: file.name, size: file.size, mimeType: file.type }
      );
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = async () => {
    if (!result || !file) return;

    setProcessing(true);
    clearError();

    try {
      const downloadResult = await uploadBrowserDownloadResult({
        blob: result,
        toolSlug: TOOL_ID,
        originalName: file.name,
        outputName: 'blurred.jpg',
      });

      router.push(downloadResult.downloadPageUrl);
    } catch (error) {
      createError(
        ImageToolErrorType.NETWORK_ERROR,
        TOOL_ID,
        TOOL_NAME,
        { error: error instanceof Error ? error.message : 'Unknown error' },
        { filename: file.name, size: file.size, mimeType: file.type }
      );
    } finally {
      setProcessing(false);
    }
  };

  return (
    <>
      <HomeHeader />
      <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex flex-col">
        {/* Error Display */}
        {error && <ErrorAlert error={error} onDismiss={clearError} />}

        {/* Hero Section */}
        <div className="relative bg-gradient-to-r from-cyan-600 via-cyan-700 to-cyan-800 py-16 px-4 md:px-8 overflow-hidden">
          <div className="max-w-6xl mx-auto relative z-10">
            <div className="flex items-center gap-2 text-white/90 text-sm mb-6">
              <Link href="/" className="hover:text-white transition">Home</Link>
              <ChevronRight size={16} />
              <Link href="/all-tools" className="hover:text-white transition">All Tools</Link>
              <ChevronRight size={16} />
              <span>Blur Image</span>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 bg-white/20 rounded-lg">
                <Droplet size={32} className="text-white" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">Blur Image</h1>
                <p className="text-lg text-white/90">Add blur effects to images with adjustable intensity. Perfect for privacy, artistic effects, and background softening.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 py-12 px-4 md:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Upload Section */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Step 1: Upload Image</h2>

                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-cyan-400 transition cursor-pointer mb-6">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                      id="file-input"
                    />
                    <label htmlFor="file-input" className="cursor-pointer">
                      <Droplet size={40} className="mx-auto text-gray-400 mb-3" />
                      <p className="text-lg font-semibold text-gray-700 mb-1">Click to upload or drag and drop</p>
                      <p className="text-sm text-gray-500">PNG, JPG, WebP and other formats</p>
                    </label>
                  </div>

                  {preview && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-4">Preview</h3>
                      <img src={preview} alt="Preview" className="w-full rounded-lg mb-4" style={{ maxHeight: '400px' }} />
                    </div>
                  )}

                  <canvas ref={canvasRef} className="hidden" />
                </div>
              </div>

              {/* Controls */}
              <div className="lg:col-span-1">
                <div className="sticky top-4 space-y-4">
                  {/* Blur Settings */}
                  <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <h3 className="font-semibold text-gray-900 mb-4">Blur Settings</h3>

                    <div>
                      <label className="text-sm font-medium text-gray-700 block mb-2">
                        Blur Amount: {blurAmount}px
                      </label>
                      <input
                        type="range"
                        min="1"
                        max="50"
                        step="1"
                        value={blurAmount}
                        onChange={(e) => setBlurAmount(parseInt(e.target.value))}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-2">
                        <span>Subtle</span>
                        <span>Moderate</span>
                        <span>Heavy</span>
                      </div>
                    </div>
                  </div>

                  {/* Blur Button */}
                  <button
                    onClick={handleBlur}
                    disabled={!file || processing}
                    className="w-full py-3 px-6 bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2"
                  >
                    {processing ? (
                      <>
                        <Loader size={20} className="animate-spin" />
                        Blurring...
                      </>
                    ) : (
                      'Apply Blur'
                    )}
                  </button>

                  {result && (
                    <button
                      onClick={handleDownload}
                      disabled={processing}
                      className="w-full py-2 px-4 bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition text-sm flex items-center justify-center gap-2"
                    >
                      {processing ? (
                        <>
                          <Loader size={16} className="animate-spin" />
                          Preparing download...
                        </>
                      ) : (
                        <>
                          <Download size={16} />
                          Download
                        </>
                      )}
                    </button>
                  )}

                  {/* Info Box */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-900 mb-2">Tips</h3>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Higher blur = stronger effect</li>
                      <li>• Great for privacy</li>
                      <li>• Artistic effects</li>
                      <li>• Instant processing</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* How To Section */}
      <div className="py-12 px-4 md:px-8 bg-white border-t border-gray-200">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">How to Blur an Image</h2>
          <div className="space-y-4">
            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-cyan-600 text-white flex items-center justify-center font-bold text-sm">1</div>
              <div><p className="text-gray-700"><strong>Upload your image:</strong> Click the upload area or drag and drop an image file in any format</p></div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-cyan-600 text-white flex items-center justify-center font-bold text-sm">2</div>
              <div><p className="text-gray-700"><strong>Adjust blur intensity:</strong> Use the slider to select blur amount from 1px (subtle) to 50px (heavy)</p></div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-cyan-600 text-white flex items-center justify-center font-bold text-sm">3</div>
              <div><p className="text-gray-700"><strong>Click Apply Blur:</strong> Processing happens instantly in your browser with no uploads</p></div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-cyan-600 text-white flex items-center justify-center font-bold text-sm">4</div>
              <div><p className="text-gray-700"><strong>Download blurred image:</strong> Save your blurred image and use it wherever needed</p></div>
            </div>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="py-12 px-4 md:px-8 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Benefits of Image Blurring</h2>
          <ul className="space-y-3 text-gray-700">
            <li className="flex gap-2"><span className="text-cyan-600 font-bold">•</span> Privacy protection - blur sensitive information like license plates and faces</li>
            <li className="flex gap-2"><span className="text-cyan-600 font-bold">•</span> Artistic effects - create bokeh and depth of field effects professionally</li>
            <li className="flex gap-2"><span className="text-cyan-600 font-bold">•</span> Background softening - draw focus to main subject by blurring background</li>
            <li className="flex gap-2"><span className="text-cyan-600 font-bold">•</span> Social media ready - perfect blurred images for social posts and stories</li>
            <li className="flex gap-2"><span className="text-cyan-600 font-bold">•</span> Document redaction - blur confidential content before sharing documents</li>
          </ul>
        </div>
      </div>

      {/* SEO Content Section */}
      <div className="py-12 px-4 md:px-8 bg-white border-t border-gray-200">
        <div className="max-w-4xl mx-auto space-y-8">
          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">What This Blur Image Tool Does</h2>
            <p className="text-gray-700 leading-relaxed">
              The Blur Image tool applies a soft blur effect across your photo directly in the browser. Use it to reduce visible detail, soften busy backgrounds, create a gentle focus effect, or prepare images before sharing them online.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Common Use Cases</h2>
            <ul className="grid md:grid-cols-2 gap-3 text-gray-700">
              <li className="p-4 bg-gray-50 border border-gray-200 rounded-lg">Blur faces, plates, addresses, or private details before posting.</li>
              <li className="p-4 bg-gray-50 border border-gray-200 rounded-lg">Create soft backgrounds for banners, thumbnails, and presentations.</li>
              <li className="p-4 bg-gray-50 border border-gray-200 rounded-lg">Reduce visual noise behind text overlays or design elements.</li>
              <li className="p-4 bg-gray-50 border border-gray-200 rounded-lg">Add a subtle creative blur to portraits, product photos, or social images.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Example</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">Input</h3>
                <p className="text-gray-700 text-sm">A photo with a readable license plate or a busy background behind a subject.</p>
              </div>
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">Output</h3>
                <p className="text-gray-700 text-sm">A softened image where sensitive details are harder to read and the overall scene looks smoother.</p>
              </div>
            </div>
          </section>

          <section className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-blue-900 mb-3">Privacy Note</h2>
            <p className="text-blue-900 text-sm leading-relaxed">
              Blurring runs locally in your browser on this page. Your image is not uploaded for the blur operation, but you should still keep the original file private and review the final result before sharing.
            </p>
          </section>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="py-12 px-4 md:px-8 bg-white border-t border-gray-200">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <details className="p-4 bg-white border border-gray-200 rounded-lg cursor-pointer group">
              <summary className="font-semibold text-gray-900 flex justify-between items-center">
                What blur amount should I use?
                <span className="text-gray-500 group-open:hidden">+</span>
                <span className="text-gray-500 hidden group-open:inline">−</span>
              </summary>
              <p className="text-gray-700 mt-3 text-sm">For subtle effects use 1-10px. For moderate blur use 10-25px. For heavy privacy blur use 25-50px. Experiment to find your preferred level.</p>
            </details>

            <details className="p-4 bg-white border border-gray-200 rounded-lg cursor-pointer group">
              <summary className="font-semibold text-gray-900 flex justify-between items-center">
                Can I blur part of an image?
                <span className="text-gray-500 group-open:hidden">+</span>
                <span className="text-gray-500 hidden group-open:inline">−</span>
              </summary>
              <p className="text-gray-700 mt-3 text-sm">This tool blurs the entire image. For selective blurring, crop the specific area first using our Crop Image tool, blur it, then combine it back.</p>
            </details>

            <details className="p-4 bg-white border border-gray-200 rounded-lg cursor-pointer group">
              <summary className="font-semibold text-gray-900 flex justify-between items-center">
                Does blur reduce image quality?
                <span className="text-gray-500 group-open:hidden">+</span>
                <span className="text-gray-500 hidden group-open:inline">−</span>
              </summary>
              <p className="text-gray-700 mt-3 text-sm">Blur is applied non-destructively and maintains the original image quality. The blur effect is applied during export at 90% quality.</p>
            </details>

            <details className="p-4 bg-white border border-gray-200 rounded-lg cursor-pointer group">
              <summary className="font-semibold text-gray-900 flex justify-between items-center">
                What formats does blur support?
                <span className="text-gray-500 group-open:hidden">+</span>
                <span className="text-gray-500 hidden group-open:inline">−</span>
              </summary>
              <p className="text-gray-700 mt-3 text-sm">Supports all common image formats: JPG, PNG, WebP, GIF, BMP and more. Output is always JPG at 90% quality.</p>
            </details>

            <details className="p-4 bg-white border border-gray-200 rounded-lg cursor-pointer group">
              <summary className="font-semibold text-gray-900 flex justify-between items-center">
                Is blur effect reversible?
                <span className="text-gray-500 group-open:hidden">+</span>
                <span className="text-gray-500 hidden group-open:inline">−</span>
              </summary>
              <p className="text-gray-700 mt-3 text-sm">No, blur is permanent in the output image. Always keep your original unblurred image before applying blur effects.</p>
            </details>

            <details className="p-4 bg-white border border-gray-200 rounded-lg cursor-pointer group">
              <summary className="font-semibold text-gray-900 flex justify-between items-center">
                Is the blur tool really free?
                <span className="text-gray-500 group-open:hidden">+</span>
                <span className="text-gray-500 hidden group-open:inline">−</span>
              </summary>
              <p className="text-gray-700 mt-3 text-sm">You can use the available blur controls without creating an account.</p>
            </details>
          </div>
        </div>
      </div>

      {/* FAQ Schema */}
      <script type="application/ld+json">{JSON.stringify({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "What blur amount should I use?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "For subtle effects use 1-10px. For moderate blur use 10-25px. For heavy privacy blur use 25-50px."
            }
          },
          {
            "@type": "Question",
            "name": "Can I blur part of an image?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "This tool blurs the entire image. For selective blurring, crop the specific area first, blur it, then combine it back."
            }
          },
          {
            "@type": "Question",
            "name": "Does blur reduce image quality?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Blur is applied non-destructively and maintains original quality at 90% JPG compression."
            }
          },
          {
            "@type": "Question",
            "name": "What formats does blur support?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Supports all common image formats: JPG, PNG, WebP, GIF, BMP and more. Output is always JPG at 90% quality."
            }
          },
          {
            "@type": "Question",
            "name": "Is blur effect reversible?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "No, blur is permanent in the output image. Always keep your original unblurred image before applying blur."
            }
          },
          {
            "@type": "Question",
            "name": "Is the blur tool really free?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "You can use the available blur controls without creating an account."
            }
          }
        ]
      })}</script>

      <script type="application/ld+json">{JSON.stringify({
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "Blur Image",
        "description": "Blur images online with adjustable intensity for privacy, soft backgrounds, and creative photo effects.",
        "url": "https://simplifyconvert.com/all-tools/blur-image",
        "applicationCategory": "MultimediaApplication",
        "operatingSystem": "Web",
        "isAccessibleForFree": true,
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD"
        }
      })}</script>

      <script type="application/ld+json">{JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://simplifyconvert.com" },
          { "@type": "ListItem", "position": 2, "name": "All Tools", "item": "https://simplifyconvert.com/all-tools" },
          { "@type": "ListItem", "position": 3, "name": "Blur Image", "item": "https://simplifyconvert.com/all-tools/blur-image" }
        ]
      })}</script>

      {/* Related Tools */}
      <div className="py-12 px-4 md:px-8 bg-gray-50 border-t border-gray-200">
        <div className="max-w-4xl mx-auto">
          <RelatedToolsSection family="image" toolId="blur-image" limit={8} />
        </div>
      </div>

      <Footer />
    </>
  );
}
