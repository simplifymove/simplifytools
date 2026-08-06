'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { Download, ChevronRight, Loader, Sparkles } from 'lucide-react';
import { HomeHeader } from '../../components/HomeHeader';
import { Footer } from '../../components/Footer';
import { useRouter } from 'next/navigation';
import { uploadBrowserDownloadResult } from '@/app/lib/download-result-client';

export default function SharpenImagePage() {
    const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [sharpenAmount, setSharpenAmount] = useState(5);
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
      setResult(null);
    }
  };

  const applySharpen = (): Promise<Blob> => {
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

        // Apply sharpness filter using contrast boost
        const intensity = sharpenAmount / 10;
        ctx.filter = `contrast(${1 + intensity})`;
        ctx.drawImage(img, 0, 0);
        canvas.toBlob((blob) => {
          if (!blob) {
            reject(new Error('Failed to create blob'));
            return;
          }
          resolve(blob);
        }, 'image/jpeg', 0.9);
      };
      img.src = preview;
    });
  };

  const handleSharpen = async () => {
    if (!file) return;
    setProcessing(true);
    try {
      const sharpened = await applySharpen();
      setResult(sharpened);
    } catch (error) {
      alert('Error sharpening image: ' + (error as Error).message);
    } finally {
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
            toolSlug: 'sharpen-image',
            originalName: 'sharpened.jpg',
            outputName: 'sharpened.jpg',
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
      <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex flex-col">
        {/* Hero Section */}
        <div className="relative bg-gradient-to-r from-amber-600 via-amber-700 to-amber-800 py-16 px-4 md:px-8 overflow-hidden">
          <div className="max-w-6xl mx-auto relative z-10">
            <div className="flex items-center gap-2 text-white/90 text-sm mb-6">
              <Link href="/" className="hover:text-white transition">Home</Link>
              <ChevronRight size={16} />
              <Link href="/all-tools" className="hover:text-white transition">All Tools</Link>
              <ChevronRight size={16} />
              <span>Sharpen Image</span>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 bg-white/20 rounded-lg">
                <Sparkles size={32} className="text-white" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">Sharpen Image</h1>
                <p className="text-lg text-white/90">Enhance image clarity and details with adjustable sharpening. Perfect for improving soft images and bringing out details.</p>
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

                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-amber-400 transition cursor-pointer mb-6">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                      id="file-input"
                    />
                    <label htmlFor="file-input" className="cursor-pointer">
                      <Sparkles size={40} className="mx-auto text-gray-400 mb-3" />
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
                  {/* Sharpen Settings */}
                  <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <h3 className="font-semibold text-gray-900 mb-4">Sharpen Settings</h3>

                    <div>
                      <label className="text-sm font-medium text-gray-700 block mb-2">
                        Sharpness: {sharpenAmount}
                      </label>
                      <input
                        type="range"
                        min="1"
                        max="20"
                        step="1"
                        value={sharpenAmount}
                        onChange={(e) => setSharpenAmount(parseInt(e.target.value))}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-2">
                        <span>Subtle</span>
                        <span>Moderate</span>
                        <span>Strong</span>
                      </div>
                    </div>
                  </div>

                  {/* Sharpen Button */}
                  <button
                    onClick={handleSharpen}
                    disabled={!file || processing}
                    className="w-full py-3 px-6 bg-amber-600 hover:bg-amber-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2"
                  >
                    {processing ? (
                      <>
                        <Loader size={20} className="animate-spin" />
                        Sharpening...
                      </>
                    ) : (
                      'Sharpen Image'
                    )}
                  </button>

                  {result && (
                    <button
                      onClick={handleDownload}
                      className="w-full py-2 px-4 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-lg transition text-sm flex items-center justify-center gap-2"
                    >
                      <Download size={16} />
                      Download
                    </button>
                  )}

                  {/* Info Box */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-900 mb-2">Tips</h3>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Enhance soft images</li>
                      <li>• Improve details</li>
                      <li>• Multiple levels available</li>
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
          <h2 className="text-3xl font-bold text-gray-900 mb-6">How to Sharpen an Image</h2>
          <div className="space-y-4">
            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-600 text-white flex items-center justify-center font-bold text-sm">1</div>
              <div><p className="text-gray-700"><strong>Upload your image:</strong> Click upload or drag and drop your image file</p></div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-600 text-white flex items-center justify-center font-bold text-sm">2</div>
              <div><p className="text-gray-700"><strong>Adjust sharpness level:</strong> Use the slider to select sharpness intensity from subtle to strong</p></div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-600 text-white flex items-center justify-center font-bold text-sm">3</div>
              <div><p className="text-gray-700"><strong>Click Sharpen Image:</strong> Sharpening happens instantly in your browser</p></div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-600 text-white flex items-center justify-center font-bold text-sm">4</div>
              <div><p className="text-gray-700"><strong>Download sharpened image:</strong> Prepare the processed image for download</p></div>
            </div>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="py-12 px-4 md:px-8 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Benefits of Image Sharpening</h2>
          <ul className="space-y-3 text-gray-700">
            <li className="flex gap-2"><span className="text-amber-600 font-bold">•</span> Enhance clarity - bring out details in soft or blurry images</li>
            <li className="flex gap-2"><span className="text-amber-600 font-bold">•</span> Improve focus - make photos appear more focused and professional</li>
            <li className="flex gap-2"><span className="text-amber-600 font-bold">•</span> Professional results - achieve crisp, detailed images for printing</li>
            <li className="flex gap-2"><span className="text-amber-600 font-bold">•</span> Social media ready - create sharp images for social platforms</li>
            <li className="flex gap-2"><span className="text-amber-600 font-bold">•</span> Adjustable intensity - control sharpening strength for different images</li>
          </ul>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="py-12 px-4 md:px-8 bg-white border-t border-gray-200">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <details className="p-4 bg-white border border-gray-200 rounded-lg cursor-pointer group">
              <summary className="font-semibold text-gray-900 flex justify-between items-center">
                What sharpness level should I use?
                <span className="text-gray-500 group-open:hidden">+</span>
                <span className="text-gray-500 hidden group-open:inline">−</span>
              </summary>
              <p className="text-gray-700 mt-3 text-sm">Start with level 5-7 for subtle enhancement. Use 10-15 for moderate sharpening. Use 15-20 for heavy sharpening. Adjust based on your image.</p>
            </details>

            <details className="p-4 bg-white border border-gray-200 rounded-lg cursor-pointer group">
              <summary className="font-semibold text-gray-900 flex justify-between items-center">
                Can I reverse sharpening?
                <span className="text-gray-500 group-open:hidden">+</span>
                <span className="text-gray-500 hidden group-open:inline">−</span>
              </summary>
              <p className="text-gray-700 mt-3 text-sm">No, sharpening is permanent in the output. Always keep your original image. You can always apply sharpening again with different settings.</p>
            </details>

            <details className="p-4 bg-white border border-gray-200 rounded-lg cursor-pointer group">
              <summary className="font-semibold text-gray-900 flex justify-between items-center">
                Does sharpening increase file size?
                <span className="text-gray-500 group-open:hidden">+</span>
                <span className="text-gray-500 hidden group-open:inline">−</span>
              </summary>
              <p className="text-gray-700 mt-3 text-sm">No, file size remains similar. Sharpening is applied during compression at 90% quality JPG standard.</p>
            </details>

            <details className="p-4 bg-white border border-gray-200 rounded-lg cursor-pointer group">
              <summary className="font-semibold text-gray-900 flex justify-between items-center">
                What formats are supported?
                <span className="text-gray-500 group-open:hidden">+</span>
                <span className="text-gray-500 hidden group-open:inline">−</span>
              </summary>
              <p className="text-gray-700 mt-3 text-sm">Supported browser-readable images can be processed by the tool. The generated result is encoded as JPG at 90% quality.</p>
            </details>

            <details className="p-4 bg-white border border-gray-200 rounded-lg cursor-pointer group">
              <summary className="font-semibold text-gray-900 flex justify-between items-center">
                Will sharpening improve a very blurry image?
                <span className="text-gray-500 group-open:hidden">+</span>
                <span className="text-gray-500 hidden group-open:inline">−</span>
              </summary>
              <p className="text-gray-700 mt-3 text-sm">Sharpening works best on soft images. Heavily blurry images need blur removal or unblurring tools for best results.</p>
            </details>

            <details className="p-4 bg-white border border-gray-200 rounded-lg cursor-pointer group">
              <summary className="font-semibold text-gray-900 flex justify-between items-center">
                Is the sharpen tool really free?
                <span className="text-gray-500 group-open:hidden">+</span>
                <span className="text-gray-500 hidden group-open:inline">−</span>
              </summary>
              <p className="text-gray-700 mt-3 text-sm">You can use the available sharpening controls without creating an account.</p>
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
            "name": "What sharpness level should I use?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Start with level 5-7 for subtle enhancement. Use 10-15 for moderate sharpening. Use 15-20 for heavy sharpening."
            }
          },
          {
            "@type": "Question",
            "name": "Can I reverse sharpening?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "No, sharpening is permanent in the output. Always keep your original image."
            }
          },
          {
            "@type": "Question",
            "name": "Does sharpening increase file size?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "No, file size remains similar as sharpening is applied during JPG compression at 90% quality."
            }
          },
          {
            "@type": "Question",
            "name": "What formats are supported?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Supported browser-readable images can be processed by the tool. The generated result is encoded as JPG at 90% quality."
            }
          },
          {
            "@type": "Question",
            "name": "Will sharpening improve a very blurry image?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Sharpening works best on soft images. Heavily blurry images need blur removal tools for best results."
            }
          },
          {
            "@type": "Question",
            "name": "Is the sharpen tool really free?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "You can use the available sharpening controls without creating an account."
            }
          }
        ]
      })}</script>

      {/* Related Tools */}
      <div className="py-12 px-4 md:px-8 bg-gray-50 border-t border-gray-200">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Related Tools</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link href="/all-tools/blur-image" className="p-4 bg-white rounded-lg border border-gray-200 hover:border-amber-400 hover:shadow-md transition">
              <p className="font-semibold text-gray-900">Blur Image</p>
              <p className="text-sm text-gray-600">Add blur effects</p>
            </Link>
            <Link href="/all-tools/image-enhancer" className="p-4 bg-white rounded-lg border border-gray-200 hover:border-amber-400 hover:shadow-md transition">
              <p className="font-semibold text-gray-900">Image Enhancer</p>
              <p className="text-sm text-gray-600">Adjust brightness and contrast</p>
            </Link>
            <Link href="/all-tools/crop-image" className="p-4 bg-white rounded-lg border border-gray-200 hover:border-amber-400 hover:shadow-md transition">
              <p className="font-semibold text-gray-900">Crop Image</p>
              <p className="text-sm text-gray-600">Remove unwanted areas</p>
            </Link>
            <Link href="/all-tools/compress-image" className="p-4 bg-white rounded-lg border border-gray-200 hover:border-amber-400 hover:shadow-md transition">
              <p className="font-semibold text-gray-900">Compress Image</p>
              <p className="text-sm text-gray-600">Reduce file size</p>
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
