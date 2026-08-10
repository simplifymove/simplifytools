'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Download, Loader, ChevronRight, Image } from 'lucide-react';
import { ImageUploader } from '../../components/ImageUploader';
import { convertImageFormat } from '../../lib/imageTools';
import { HomeHeader } from '../../components/HomeHeader';
import { Footer } from '../../components/Footer';

import { uploadBrowserDownloadResult } from '@/app/lib/download-result-client';
export default function PngToWebpPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<Blob | null>(null);
  const [quality, setQuality] = useState(90);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    setError(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleClearPreview = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setError(null);
  };

  const handleConvert = async () => {
    if (!file) return;

    setProcessing(true);
    setError(null);
    try {
      const result = await convertImageFormat(file, 'image/webp', {
        quality,
      });
      setResult(result.blob);
    } catch (err) {
      setError((err as Error).message || 'Error converting image');
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = async () => {
    if (!result || !file) return;

    setProcessing(true);
    setError(null);

    try {
      const baseName =
        file.name.replace(/\.[^.]+$/, '').trim() || 'converted-image';

      const downloadResult = await uploadBrowserDownloadResult({
        blob: result,
        toolSlug: 'png-to-webp',
        originalName: file.name,
        outputName: `${baseName}.webp`,
      });

      router.push(downloadResult.downloadPageUrl);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'Unable to prepare the download. Please try again.'
      );
    } finally {
      setProcessing(false);
    }
  };

  return (
    <>
      <HomeHeader />
      <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex flex-col">
      {/* Hero Header */}
      <div className="relative bg-orange-500 py-16 px-4 md:px-8 overflow-hidden">
        <div className="max-w-6xl mx-auto relative z-10">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-white/90 text-sm mb-6">
            <Link href="/" className="hover:text-white transition">Home</Link>
            <ChevronRight size={16} />
            <Link href="/all-tools" className="hover:text-white transition">All Tools</Link>
            <ChevronRight size={16} />
            <span>PNG to WebP</span>
          </div>

          {/* Title Section */}
          <div className="flex items-start gap-4">
            <div className="p-3 bg-white/20 rounded-lg">
              <Image size={32} className="text-white" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">PNG to WebP Converter</h1>
              <p className="text-lg text-white/90">Convert PNG images to WebP format with adjustable quality settings for web and image workflows.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 py-12 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Upload Section - Left (2 cols) */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Step 1: Upload PNG Image</h2>
                <ImageUploader
                  onFileSelect={handleFileSelect}
                  preview={preview}
                  onClearPreview={handleClearPreview}
                  accept="image/png"
                />
                {error && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Controls - Right (sticky sidebar) */}
            <div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-4">
                <h3 className="text-lg font-bold text-gray-900 mb-6">Conversion Settings</h3>

                {/* Quality Slider */}
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-3">
                    <label className="text-sm font-medium text-gray-700">Quality</label>
                    <span className="text-sm font-semibold text-orange-600">{quality}%</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={quality}
                    onChange={(e) => setQuality(parseInt(e.target.value))}
                    disabled={processing}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
                  />
                  <p className="text-xs text-gray-500 mt-2">Higher quality = larger file size</p>
                </div>

                {/* Image Preview */}
                <div className="mb-6">
                  {result ? (
                    <div className="space-y-4">
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <p className="text-sm text-green-800 font-medium mb-3">✓ Conversion Complete!</p>
                        <button
                          onClick={handleDownload}
                          className="w-full px-4 py-3 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-all flex items-center justify-center gap-2"
                      disabled={processing}>
                          <Download size={18} />
                          {processing ? 'Preparing Download...' : 'Continue to Download'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 text-center">
                      <Image size={32} className="mx-auto text-orange-400 mb-3" />
                      <p className="text-sm text-gray-600">Upload an image to preview</p>
                    </div>
                  )}
                </div>

                {/* Convert Button */}
                <button
                  onClick={handleConvert}
                  disabled={!file || processing}
                  className="w-full px-4 py-3 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                >
                  {processing ? (
                    <>
                      <Loader size={18} className="animate-spin" />
                      Converting...
                    </>
                  ) : (
                    'Convert to WebP'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* How To Section */}
      <section className="py-12 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">How to Convert PNG to WebP</h2>
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-10 w-10 rounded-md bg-orange-500 text-white font-bold">1</div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Upload Your PNG File</h3>
                <p className="text-gray-600 mt-2">Click the upload area or drag and drop your PNG image to get started.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-10 w-10 rounded-md bg-orange-500 text-white font-bold">2</div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Select Quality Level</h3>
                <p className="text-gray-600 mt-2">Adjust the quality slider to choose a balance between file size and image clarity.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-10 w-10 rounded-md bg-orange-500 text-white font-bold">3</div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Convert to WebP</h3>
                <p className="text-gray-600 mt-2">Click the "Convert to WebP" button to start the browser-based conversion.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-10 w-10 rounded-md bg-orange-500 text-white font-bold">4</div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Download Your WebP</h3>
                <p className="text-gray-600 mt-2">Prepare the converted WebP file for download. No signup is required to use the converter.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-12 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Benefits of PNG to WebP Conversion</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 text-orange-500 pt-1">✓</div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Better Compression for PNG</h3>
                <p className="text-gray-600 text-sm">WebP can produce smaller files than PNG for many images while supporting transparency.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 text-orange-500 pt-1">✓</div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Preserve Transparency</h3>
                <p className="text-gray-600 text-sm">WebP supports alpha transparency and can be useful for graphics, logos, and other images with transparent areas.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 text-orange-500 pt-1">✓</div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Faster Web Performance</h3>
                <p className="text-gray-600 text-sm">Smaller image files can help reduce transfer size and improve page-loading performance.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-12 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Does WebP preserve PNG transparency?</h3>
              <p className="text-gray-700">Yes, WebP supports alpha channel transparency, so transparent areas can be preserved during conversion.</p>
            </div>
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">How much smaller is WebP compared to PNG?</h3>
              <p className="text-gray-700">File-size differences vary by image content and encoding settings. You can compare the converted WebP result with the original PNG to see the difference.</p>
            </div>
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Will the image quality be affected?</h3>
              <p className="text-gray-700">WebP encoding can introduce compression depending on the selected quality. Use the slider to balance file size and visual quality.</p>
            </div>
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Is WebP suitable for web graphics and logos?</h3>
              <p className="text-gray-700">WebP supports transparency and can be useful for web graphics, logos, and other images where reducing file size is helpful.</p>
            </div>
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Is my conversion data kept private?</h3>
              <p className="text-gray-700">Image conversion is performed in the browser. When you continue to download, the generated WebP result is passed through the site's download-result flow.</p>
            </div>
            <div className="pb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Can I convert multiple PNG files at once?</h3>
              <p className="text-gray-700">This converter currently processes one PNG file at a time. To convert additional files, upload and process them individually.</p>
            </div>
          </div>
        </div>
      </section>

      {/* JSON-LD FAQ Schema */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": [
            {
              "@type": "Question",
              "name": "Does WebP preserve PNG transparency?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes, WebP supports alpha channel transparency, so transparent areas can be preserved during conversion."
              }
            },
            {
              "@type": "Question",
              "name": "How much smaller is WebP compared to PNG?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "File-size differences vary by image content and encoding settings. You can compare the converted WebP result with the original PNG to see the difference."
              }
            },
            {
              "@type": "Question",
              "name": "Will the image quality be affected?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "WebP encoding can introduce compression depending on the selected quality. Use the slider to balance file size and visual quality."
              }
            },
            {
              "@type": "Question",
              "name": "Is WebP suitable for web graphics and logos?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "WebP supports transparency and can be useful for web graphics, logos, and other images where reducing file size is helpful."
              }
            },
            {
              "@type": "Question",
              "name": "Is my conversion data kept private?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Image conversion is performed in the browser. When you continue to download, the generated WebP result is passed through the site's download-result flow."
              }
            },
            {
              "@type": "Question",
              "name": "Can I convert multiple PNG files at once?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "This converter currently processes one PNG file at a time. To convert additional files, upload and process them individually."
              }
            }
          ]
        })}
      </script>

      {/* Related Tools */}
      <section className="py-12 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Related Tools</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link href="/all-tools/jpg-to-webp" className="group bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all">
              <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600">JPG to WebP Converter</h3>
              <p className="text-gray-600 text-sm mt-2">Convert JPG to WebP format for better compression</p>
            </Link>
            <Link href="/all-tools/png-to-jpg" className="group bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all">
              <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600">PNG to JPG Converter</h3>
              <p className="text-gray-600 text-sm mt-2">Convert PNG to JPG with quality control</p>
            </Link>
            <Link href="/all-tools/compress-image" className="group bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all">
              <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600">Image Compressor</h3>
              <p className="text-gray-600 text-sm mt-2">Reduce image file size with efficient compression</p>
            </Link>
            <Link href="/all-tools/webp-to-jpg" className="group bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all">
              <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600">WebP to JPG Converter</h3>
              <p className="text-gray-600 text-sm mt-2">Convert modern WebP to JPG format</p>
            </Link>
          </div>
        </div>
      </section>
    </main>
    <Footer />
    </>
  );
}







