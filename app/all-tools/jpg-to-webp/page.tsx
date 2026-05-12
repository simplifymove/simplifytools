'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Download, Loader, ChevronRight, Image } from 'lucide-react';
import { ImageUploader } from '../../components/ImageUploader';
import { convertImageFormat } from '../../lib/imageTools';
import { HomeHeader } from '../../components/HomeHeader';
import { Footer } from '../../components/Footer';

export default function JpgToWebpPage() {
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
      const result = await convertImageFormat(file, 'image/webp');
      setResult(result.blob);
    } catch (err) {
      setError((err as Error).message || 'Error converting image');
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!result) return;
    const url = URL.createObjectURL(result);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'converted.webp';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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
            <span>JPG to WebP</span>
          </div>

          {/* Title Section */}
          <div className="flex items-start gap-4">
            <div className="p-3 bg-white/20 rounded-lg">
              <Image size={32} className="text-white" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">JPG to WebP Converter</h1>
              <p className="text-lg text-white/90">Convert JPG images to WebP format for smaller file sizes without losing quality. Perfect for web optimization.</p>
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
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Step 1: Upload JPG Image</h2>
                <ImageUploader
                  onFileSelect={handleFileSelect}
                  preview={preview}
                  onClearPreview={handleClearPreview}
                  accept="image/jpeg"
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
                      <img
                        src={result as any}
                        alt="Converted"
                        className="w-full rounded-lg border border-gray-200 object-cover"
                      />
                      <button
                        onClick={handleDownload}
                        className="w-full px-4 py-3 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-all flex items-center justify-center gap-2"
                      >
                        <Download size={18} />
                        Download
                      </button>
                    </div>
                  ) : (
                    <div className="h-48 bg-orange-50 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                      <div className="text-center">
                        <p className="text-gray-500 text-sm">Preview will appear here</p>
                        <p className="text-gray-400 text-xs mt-1">Click "Convert" to process</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Convert Button */}
                <button
                  onClick={handleConvert}
                  disabled={!file || processing}
                  className="w-full px-6 py-3 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                >
                  {processing ? (
                    <>
                      <Loader size={18} className="animate-spin" />
                      Converting...
                    </>
                  ) : (
                    <>
                      <Image size={18} />
                      Convert to WebP
                    </>
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
          <h2 className="text-3xl font-bold text-gray-900 mb-8">How to Convert JPG to WebP</h2>
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-10 w-10 rounded-md bg-orange-500 text-white font-bold">1</div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Upload Your JPG File</h3>
                <p className="text-gray-600 mt-2">Select or drag and drop your JPG image to begin the conversion process.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-10 w-10 rounded-md bg-orange-500 text-white font-bold">2</div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Adjust Quality Settings</h3>
                <p className="text-gray-600 mt-2">Use the quality slider to balance between file size and image quality. 80-90% is recommended for web use.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-10 w-10 rounded-md bg-orange-500 text-white font-bold">3</div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Convert to WebP</h3>
                <p className="text-gray-600 mt-2">Click the "Convert to WebP" button to start the conversion. Processing happens in your browser instantly.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-10 w-10 rounded-md bg-orange-500 text-white font-bold">4</div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Download WebP File</h3>
                <p className="text-gray-600 mt-2">Once complete, download your optimized WebP file. No signup required - completely free and secure.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-12 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Why Use WebP Format?</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 text-orange-500 pt-1">✓</div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Significantly Smaller File Size</h3>
                <p className="text-gray-600 text-sm">WebP provides 25-35% better compression than JPG, reducing file sizes and improving website load times.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 text-orange-500 pt-1">✓</div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Superior Image Quality</h3>
                <p className="text-gray-600 text-sm">WebP delivers better image quality at the same file size compared to JPG, with support for both lossless and lossy compression.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 text-orange-500 pt-1">✓</div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Modern Web Standard</h3>
                <p className="text-gray-600 text-sm">WebP is supported by all modern browsers (Chrome, Firefox, Safari, Edge). Perfect for contemporary web development.</p>
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
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Is WebP supported by all browsers?</h3>
              <p className="text-gray-700">WebP is supported by all modern browsers including Chrome, Firefox, Safari (iOS 14+), and Edge. For older browsers, you can serve JPG as a fallback using HTML picture tags.</p>
            </div>
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">How much smaller is WebP compared to JPG?</h3>
              <p className="text-gray-700">WebP files are typically 25-35% smaller than equivalent JPG files while maintaining the same visual quality. This varies depending on image content and quality settings.</p>
            </div>
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Will I lose quality when converting to WebP?</h3>
              <p className="text-gray-700">No. WebP uses advanced compression algorithms that maintain excellent quality at smaller file sizes. Our converter allows you to adjust quality settings to find the perfect balance.</p>
            </div>
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Can WebP replace JPG on my website?</h3>
              <p className="text-gray-700">Yes, WebP can replace JPG for modern browsers. Use HTML picture tags to serve WebP to supported browsers and JPG as a fallback for older browsers for maximum compatibility.</p>
            </div>
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Is conversion secure and private?</h3>
              <p className="text-gray-700">Yes, all conversions happen entirely in your browser. Your JPG files are never uploaded to any server and remain completely private. No data is stored after conversion.</p>
            </div>
            <div className="pb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Can I batch convert multiple JPG files?</h3>
              <p className="text-gray-700">Currently our converter handles one file at a time. However, conversion is fast, so you can quickly process multiple files by uploading them sequentially.</p>
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
              "name": "Is WebP supported by all browsers?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "WebP is supported by all modern browsers including Chrome, Firefox, Safari (iOS 14+), and Edge. For older browsers, you can serve JPG as a fallback using HTML picture tags."
              }
            },
            {
              "@type": "Question",
              "name": "How much smaller is WebP compared to JPG?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "WebP files are typically 25-35% smaller than equivalent JPG files while maintaining the same visual quality. This varies depending on image content and quality settings."
              }
            },
            {
              "@type": "Question",
              "name": "Will I lose quality when converting to WebP?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "No. WebP uses advanced compression algorithms that maintain excellent quality at smaller file sizes. Our converter allows you to adjust quality settings to find the perfect balance."
              }
            },
            {
              "@type": "Question",
              "name": "Can WebP replace JPG on my website?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes, WebP can replace JPG for modern browsers. Use HTML picture tags to serve WebP to supported browsers and JPG as a fallback for older browsers for maximum compatibility."
              }
            },
            {
              "@type": "Question",
              "name": "Is conversion secure and private?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes, all conversions happen entirely in your browser. Your JPG files are never uploaded to any server and remain completely private. No data is stored after conversion."
              }
            },
            {
              "@type": "Question",
              "name": "Can I batch convert multiple JPG files?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Currently our converter handles one file at a time. However, conversion is fast, so you can quickly process multiple files by uploading them sequentially."
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
            <Link href="/all-tools/png-to-webp" className="group bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all">
              <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600">PNG to WebP Converter</h3>
              <p className="text-gray-600 text-sm mt-2">Convert PNG images to modern WebP format</p>
            </Link>
            <Link href="/all-tools/jpg-to-png" className="group bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all">
              <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600">JPG to PNG Converter</h3>
              <p className="text-gray-600 text-sm mt-2">Convert JPG to PNG with transparency</p>
            </Link>
            <Link href="/all-tools/compress-image" className="group bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all">
              <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600">Image Compressor</h3>
              <p className="text-gray-600 text-sm mt-2">Reduce image file size without quality loss</p>
            </Link>
            <Link href="/all-tools/png-to-jpg" className="group bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all">
              <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600">PNG to JPG Converter</h3>
              <p className="text-gray-600 text-sm mt-2">Convert PNG to JPG with quality control</p>
            </Link>
          </div>
        </div>
      </section>
    </main>
    <Footer />
    </>
  );
}







