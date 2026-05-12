'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Download, Loader, ChevronRight, Image, CheckCircle } from 'lucide-react';
import { ImageUploader } from '../../components/ImageUploader';
import { convertImageFormat } from '../../lib/imageTools';
import { HomeHeader } from '../../components/HomeHeader';
import { Footer } from '../../components/Footer';

export default function BmpToPngPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<Blob | null>(null);
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
      const result = await convertImageFormat(file, 'image/png');
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
    link.download = 'converted.png';
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
            <span>BMP to PNG</span>
          </div>

          {/* Title Section */}
          <div className="flex items-start gap-4">
            <div className="p-3 bg-white/20 rounded-lg">
              <Image size={32} className="text-white" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">BMP to PNG Converter</h1>
              <p className="text-lg text-white/90">Convert BMP images to PNG format with transparency support and lossless quality.</p>
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
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Step 1: Upload BMP Image</h2>
                <ImageUploader
                  onFileSelect={handleFileSelect}
                  preview={preview}
                  onClearPreview={handleClearPreview}
                  accept="image/bmp"
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
                <h3 className="text-lg font-bold text-gray-900 mb-6">Conversion</h3>

                {/* Image Preview */}
                <div className="mb-6">
                  {result ? (
                    <div className="space-y-4">
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <p className="text-sm text-green-800 font-medium mb-3">✓ Conversion Complete!</p>
                        <button
                          onClick={handleDownload}
                          className="w-full px-4 py-3 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-all flex items-center justify-center gap-2"
                        >
                          <Download size={18} />
                          Download PNG
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 text-center">
                      <Image size={32} className="mx-auto text-orange-400 mb-3" />
                      <p className="text-sm text-orange-800">Preview will appear here</p>
                    </div>
                  )}
                </div>

                {/* Convert Button */}
                <button
                  onClick={handleConvert}
                  disabled={!file || processing}
                  className="w-full px-6 py-3 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white rounded-lg font-medium transition-all flex items-center justify-center gap-2"
                >
                  {processing ? (
                    <>
                      <Loader size={18} className="animate-spin" />
                      Converting...
                    </>
                  ) : (
                    'Convert to PNG'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <section className="py-12 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">What is BMP format?</h3>
              <p className="text-gray-700">BMP (Bitmap) is an uncompressed image format that stores image data without compression, resulting in large file sizes. It's commonly used in older Windows systems but is rarely used on the web due to its large file size.</p>
            </div>
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Why convert BMP to PNG?</h3>
              <p className="text-gray-700">PNG format offers several advantages over BMP: it supports transparency, provides lossless compression (reducing file size), and is universally supported by web browsers and modern applications. PNG is ideal for web use, graphics, and images requiring transparency.</p>
            </div>
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Will the converted image lose quality?</h3>
              <p className="text-gray-700">No. Our converter uses lossless conversion, meaning the image quality remains identical to the original. PNG's compression is lossless, so you retain all the original image data while reducing file size.</p>
            </div>
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Can I convert multiple BMP files at once?</h3>
              <p className="text-gray-700">Currently, our converter processes one image at a time. However, you can quickly convert multiple files by uploading and converting them individually. Each conversion is fast and takes just seconds.</p>
            </div>
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">What's the file size limit?</h3>
              <p className="text-gray-700">Most image files can be converted without issues. For very large files (over 50MB), we recommend compressing them first using our image compression tool, then converting to PNG format.</p>
            </div>
            <div className="pb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Is my image kept private and secure?</h3>
              <p className="text-gray-700">Yes, all conversions happen in your browser locally. Your images are never uploaded to our servers or stored anywhere. Your files remain completely private and secure.</p>
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
              "name": "What is BMP format?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "BMP (Bitmap) is an uncompressed image format that stores image data without compression, resulting in large file sizes. It's commonly used in older Windows systems but is rarely used on the web due to its large file size."
              }
            },
            {
              "@type": "Question",
              "name": "Why convert BMP to PNG?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "PNG format offers several advantages over BMP: it supports transparency, provides lossless compression (reducing file size), and is universally supported by web browsers and modern applications. PNG is ideal for web use, graphics, and images requiring transparency."
              }
            },
            {
              "@type": "Question",
              "name": "Will the converted image lose quality?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "No. Our converter uses lossless conversion, meaning the image quality remains identical to the original. PNG's compression is lossless, so you retain all the original image data while reducing file size."
              }
            },
            {
              "@type": "Question",
              "name": "Can I convert multiple BMP files at once?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Currently, our converter processes one image at a time. However, you can quickly convert multiple files by uploading and converting them individually. Each conversion is fast and takes just seconds."
              }
            },
            {
              "@type": "Question",
              "name": "What's the file size limit?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Most image files can be converted without issues. For very large files (over 50MB), we recommend compressing them first using our image compression tool, then converting to PNG format."
              }
            },
            {
              "@type": "Question",
              "name": "Is my image kept private and secure?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes, all conversions happen in your browser locally. Your images are never uploaded to our servers or stored anywhere. Your files remain completely private and secure."
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
            <Link href="/all-tools/png-to-jpg" className="group bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all">
              <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600">PNG to JPG Converter</h3>
              <p className="text-gray-600 text-sm mt-2">Convert PNG to JPG with quality control</p>
            </Link>
            <Link href="/all-tools/jpg-to-png" className="group bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all">
              <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600">JPG to PNG Converter</h3>
              <p className="text-gray-600 text-sm mt-2">Convert JPG to PNG with transparency</p>
            </Link>
            <Link href="/all-tools/compress-image" className="group bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all">
              <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600">Image Compressor</h3>
              <p className="text-gray-600 text-sm mt-2">Reduce image file size without quality loss</p>
            </Link>
            <Link href="/all-tools/webp-to-jpg" className="group bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all">
              <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600">WebP to JPG Converter</h3>
              <p className="text-gray-600 text-sm mt-2">Convert modern WebP format to JPG</p>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
    </>
  );
}







