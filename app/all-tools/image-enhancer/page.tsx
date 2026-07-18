'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { Download, ChevronRight, Loader, Wand2 } from 'lucide-react';
import { HomeHeader } from '../../components/HomeHeader';
import { Footer } from '../../components/Footer';
import { useRouter } from 'next/navigation';
import { uploadBrowserDownloadResult } from '@/app/lib/download-result-client';

export default function ImageEnhancerPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
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

  const enhanceImage = (): Promise<Blob> => {
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

        // Apply filters
        const brightnessPercent = brightness / 100;
        const contrastPercent = contrast / 100;
        const saturationPercent = saturation / 100;

        ctx.filter = `brightness(${brightnessPercent}) contrast(${contrastPercent}) saturate(${saturationPercent})`;
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

  const handleEnhance = async () => {
    if (!file) return;
    setProcessing(true);
    try {
      const enhanced = await enhanceImage();
      setResult(enhanced);
    } catch (error) {
      alert('Error enhancing image: ' + (error as Error).message);
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
          toolSlug: 'image-enhancer',
          originalName: 'enhanced.jpg',
          outputName: 'enhanced.jpg',
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

  const resetSliders = () => {
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
  };

  return (
    <>
      <HomeHeader />
      <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex flex-col">
        {/* Hero Section */}
        <div className="relative bg-gradient-to-r from-pink-600 via-pink-700 to-pink-800 py-16 px-4 md:px-8 overflow-hidden">
          <div className="max-w-6xl mx-auto relative z-10">
            <div className="flex items-center gap-2 text-white/90 text-sm mb-6">
              <Link href="/" className="hover:text-white transition">Home</Link>
              <ChevronRight size={16} />
              <Link href="/all-tools" className="hover:text-white transition">All Tools</Link>
              <ChevronRight size={16} />
              <span>Image Enhancer</span>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 bg-white/20 rounded-lg">
                <Wand2 size={32} className="text-white" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">Image Enhancer</h1>
                <p className="text-lg text-white/90">Adjust brightness, contrast, and color saturation to improve your images. Perfect for photo enhancement and professional editing.</p>
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

                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-pink-400 transition cursor-pointer mb-6">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                      id="file-input"
                    />
                    <label htmlFor="file-input" className="cursor-pointer">
                      <Wand2 size={40} className="mx-auto text-gray-400 mb-3" />
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
                  {/* Enhancement Settings */}
                  <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-gray-900">Enhancement</h3>
                      <button
                        onClick={resetSliders}
                        className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded transition"
                      >
                        Reset
                      </button>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700 block mb-2">
                          Brightness: {brightness}%
                        </label>
                        <input
                          type="range"
                          min="50"
                          max="150"
                          step="5"
                          value={brightness}
                          onChange={(e) => setBrightness(parseInt(e.target.value))}
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>Darker</span>
                          <span>Normal</span>
                          <span>Brighter</span>
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-700 block mb-2">
                          Contrast: {contrast}%
                        </label>
                        <input
                          type="range"
                          min="50"
                          max="150"
                          step="5"
                          value={contrast}
                          onChange={(e) => setContrast(parseInt(e.target.value))}
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>Low</span>
                          <span>Normal</span>
                          <span>High</span>
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-700 block mb-2">
                          Saturation: {saturation}%
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="200"
                          step="5"
                          value={saturation}
                          onChange={(e) => setSaturation(parseInt(e.target.value))}
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>B&W</span>
                          <span>Normal</span>
                          <span>Vivid</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Enhance Button */}
                  <button
                    onClick={handleEnhance}
                    disabled={!file || processing}
                    className="w-full py-3 px-6 bg-pink-600 hover:bg-pink-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2"
                  >
                    {processing ? (
                      <>
                        <Loader size={20} className="animate-spin" />
                        Enhancing...
                      </>
                    ) : (
                      'Enhance Image'
                    )}
                  </button>

                  {result && (
                    <button
                      onClick={handleDownload}
                      className="w-full py-2 px-4 bg-pink-600 hover:bg-pink-700 text-white font-medium rounded-lg transition text-sm flex items-center justify-center gap-2"
                    >
                      <Download size={16} />
                      Download
                    </button>
                  )}

                  {/* Info Box */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-900 mb-2">Tips</h3>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Adjust multiple at once</li>
                      <li>• Reset to defaults anytime</li>
                      <li>• Live preview support</li>
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
          <h2 className="text-3xl font-bold text-gray-900 mb-6">How to Enhance an Image</h2>
          <div className="space-y-4">
            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-pink-600 text-white flex items-center justify-center font-bold text-sm">1</div>
              <div><p className="text-gray-700"><strong>Upload your image:</strong> Click upload or drag and drop your image file</p></div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-pink-600 text-white flex items-center justify-center font-bold text-sm">2</div>
              <div><p className="text-gray-700"><strong>Adjust brightness:</strong> Move slider to make image lighter or darker as needed</p></div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-pink-600 text-white flex items-center justify-center font-bold text-sm">3</div>
              <div><p className="text-gray-700"><strong>Tweak contrast and saturation:</strong> Fine-tune contrast and color vibrancy to taste</p></div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-pink-600 text-white flex items-center justify-center font-bold text-sm">4</div>
              <div><p className="text-gray-700"><strong>Download enhanced image:</strong> Save your improved image instantly</p></div>
            </div>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="py-12 px-4 md:px-8 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Benefits of Image Enhancement</h2>
          <ul className="space-y-3 text-gray-700">
            <li className="flex gap-2"><span className="text-pink-600 font-bold">•</span> Fix underexposed images - brighten dark photos instantly</li>
            <li className="flex gap-2"><span className="text-pink-600 font-bold">•</span> Improve composition - enhance contrast for better visual impact</li>
            <li className="flex gap-2"><span className="text-pink-600 font-bold">•</span> Make colors pop - increase saturation for vibrant, vivid images</li>
            <li className="flex gap-2"><span className="text-pink-600 font-bold">•</span> Professional look - achieve polished results for social media</li>
            <li className="flex gap-2"><span className="text-pink-600 font-bold">•</span> Creative control - fine-tune every aspect with precise sliders</li>
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
                What's the difference between brightness and contrast?
                <span className="text-gray-500 group-open:hidden">+</span>
                <span className="text-gray-500 hidden group-open:inline">−</span>
              </summary>
              <p className="text-gray-700 mt-3 text-sm">Brightness affects overall lightness. Contrast affects the difference between light and dark areas. Use both together for best results.</p>
            </details>

            <details className="p-4 bg-white border border-gray-200 rounded-lg cursor-pointer group">
              <summary className="font-semibold text-gray-900 flex justify-between items-center">
                What is saturation?
                <span className="text-gray-500 group-open:hidden">+</span>
                <span className="text-gray-500 hidden group-open:inline">−</span>
              </summary>
              <p className="text-gray-700 mt-3 text-sm">Saturation controls color intensity. 0% makes image black and white. 100% is normal. Higher values make colors more vivid.</p>
            </details>

            <details className="p-4 bg-white border border-gray-200 rounded-lg cursor-pointer group">
              <summary className="font-semibold text-gray-900 flex justify-between items-center">
                Can I undo my changes?
                <span className="text-gray-500 group-open:hidden">+</span>
                <span className="text-gray-500 hidden group-open:inline">−</span>
              </summary>
              <p className="text-gray-700 mt-3 text-sm">Click the Reset button anytime to return all sliders to default values (100%).</p>
            </details>

            <details className="p-4 bg-white border border-gray-200 rounded-lg cursor-pointer group">
              <summary className="font-semibold text-gray-900 flex justify-between items-center">
                Will enhancement affect image quality?
                <span className="text-gray-500 group-open:hidden">+</span>
                <span className="text-gray-500 hidden group-open:inline">−</span>
              </summary>
              <p className="text-gray-700 mt-3 text-sm">Enhancement is applied non-destructively at 90% JPG quality. Extreme adjustments may introduce artifacts.</p>
            </details>

            <details className="p-4 bg-white border border-gray-200 rounded-lg cursor-pointer group">
              <summary className="font-semibold text-gray-900 flex justify-between items-center">
                What's the best way to enhance photos?
                <span className="text-gray-500 group-open:hidden">+</span>
                <span className="text-gray-500 hidden group-open:inline">−</span>
              </summary>
              <p className="text-gray-700 mt-3 text-sm">Start with brightness (fix exposure), then adjust contrast (add punch), finally adjust saturation (make colors pop). Use Reset button to start over if needed.</p>
            </details>

            <details className="p-4 bg-white border border-gray-200 rounded-lg cursor-pointer group">
              <summary className="font-semibold text-gray-900 flex justify-between items-center">
                Is the enhancer tool really free?
                <span className="text-gray-500 group-open:hidden">+</span>
                <span className="text-gray-500 hidden group-open:inline">−</span>
              </summary>
              <p className="text-gray-700 mt-3 text-sm">Yes, 100% free with no limits. Enhance as many images as you want, no signup required, no watermarks, no hidden costs.</p>
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
            "name": "What's the difference between brightness and contrast?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Brightness affects overall lightness. Contrast affects the difference between light and dark areas."
            }
          },
          {
            "@type": "Question",
            "name": "What is saturation?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Saturation controls color intensity. 0% is black and white. 100% is normal. Higher values make colors more vivid."
            }
          },
          {
            "@type": "Question",
            "name": "Can I undo my changes?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes, click the Reset button anytime to return all sliders to default values (100%)."
            }
          },
          {
            "@type": "Question",
            "name": "Will enhancement affect image quality?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Enhancement is applied non-destructively at 90% JPG quality. Extreme adjustments may introduce artifacts."
            }
          },
          {
            "@type": "Question",
            "name": "What's the best way to enhance photos?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Start with brightness (fix exposure), adjust contrast (add punch), then adjust saturation (make colors pop)."
            }
          },
          {
            "@type": "Question",
            "name": "Is the enhancer tool really free?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes, 100% free with no limits, no signup required, no watermarks, no hidden costs."
            }
          }
        ]
      })}</script>

      {/* Related Tools */}
      <div className="py-12 px-4 md:px-8 bg-gray-50 border-t border-gray-200">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Related Tools</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link href="/all-tools/sharpen-image" className="p-4 bg-white rounded-lg border border-gray-200 hover:border-pink-400 hover:shadow-md transition">
              <p className="font-semibold text-gray-900">Sharpen Image</p>
              <p className="text-sm text-gray-600">Enhance clarity and details</p>
            </Link>
            <Link href="/all-tools/blur-image" className="p-4 bg-white rounded-lg border border-gray-200 hover:border-pink-400 hover:shadow-md transition">
              <p className="font-semibold text-gray-900">Blur Image</p>
              <p className="text-sm text-gray-600">Add blur effects</p>
            </Link>
            <Link href="/all-tools/crop-image" className="p-4 bg-white rounded-lg border border-gray-200 hover:border-pink-400 hover:shadow-md transition">
              <p className="font-semibold text-gray-900">Crop Image</p>
              <p className="text-sm text-gray-600">Remove unwanted areas</p>
            </Link>
            <Link href="/all-tools/compress-image" className="p-4 bg-white rounded-lg border border-gray-200 hover:border-pink-400 hover:shadow-md transition">
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
