'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Download, Loader, ChevronRight, Image } from 'lucide-react';
import { ImageUploader } from '../../components/ImageUploader';
import { HomeHeader } from '../../components/HomeHeader';
import { Footer } from '../../components/Footer';

import { uploadBrowserDownloadResult } from '@/app/lib/download-result-client';
export default function HeicToPngPage() {
  const router = useRouter();
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
      const formData = new FormData();
      formData.append('image', file);
      formData.append(
        'config',
        JSON.stringify({
          from_format: 'heic',
          to_format: 'png',
          options: {},
        }),
      );

      const response = await fetch('/api/convert', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const blob = await response.blob();

      if (blob.type !== 'image/png') {
        throw new Error(
          `Unexpected output type: ${blob.type || 'unknown'}`,
        );
      }

      setResult(blob);
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
        toolSlug: 'heic-to-png',
        originalName: file.name,
        outputName: `${baseName}.png`,
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
            <span>HEIC to PNG</span>
          </div>

          {/* Title Section */}
          <div className="flex items-start gap-4">
            <div className="p-3 bg-white/20 rounded-lg">
              <Image size={32} className="text-white" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">HEIC to PNG Converter</h1>
              <p className="text-lg text-white/90">Convert HEIC images to PNG format with server-assisted processing.</p>
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
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Step 1: Upload HEIC Image</h2>
                <ImageUploader
                  onFileSelect={handleFileSelect}
                  preview={preview}
                  onClearPreview={handleClearPreview}
                  accept="image/heic,image/heif"
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
                      disabled={processing}>
                          <Download size={18} />
                          {processing ? 'Preparing Download...' : 'Continue to Download'}
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

      {/* How To Section */}
      <section className="py-12 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">How to Convert HEIC to PNG</h2>
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-10 w-10 rounded-md bg-orange-500 text-white font-bold">1</div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Upload Your HEIC Image</h3>
                <p className="text-gray-600 mt-2">Select or drag and drop your HEIC file captured from an Apple device.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-10 w-10 rounded-md bg-orange-500 text-white font-bold">2</div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Click Convert Button</h3>
                <p className="text-gray-600 mt-2">Press "Convert to PNG" to start the conversion to PNG format.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-10 w-10 rounded-md bg-orange-500 text-white font-bold">3</div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Download PNG File</h3>
                <p className="text-gray-600 mt-2">Download the converted PNG after processing is complete.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-12 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Why Convert HEIC to PNG?</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 text-orange-500 pt-1">✓</div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Universal Compatibility</h3>
                <p className="text-gray-600 text-sm">PNG is supported by all browsers, devices, and applications. HEIC is limited to Apple devices, making PNG the better choice for sharing.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 text-orange-500 pt-1">✓</div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">PNG Output</h3>
                <p className="text-gray-600 text-sm">PNG uses lossless compression for the generated output, although converting from HEIC does not restore information already absent from the source.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 text-orange-500 pt-1">✓</div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Easy Sharing</h3>
                <p className="text-gray-600 text-sm">Share PNG files effortlessly with anyone. No compatibility issues or need for special apps. Works everywhere.</p>
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
              <h3 className="text-lg font-semibold text-gray-900 mb-3">What is HEIC format?</h3>
              <p className="text-gray-700">HEIC (High Efficiency Image Container) is a modern image format used by Apple devices (iPhone, iPad, Mac) that provides excellent compression and quality.</p>
            </div>
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Why is PNG better than HEIC?</h3>
              <p className="text-gray-700">PNG is universally supported across all platforms and devices, while HEIC is primarily limited to Apple ecosystem. PNG is ideal for sharing and web use.</p>
            </div>
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Will PNG be larger than HEIC?</h3>
              <p className="text-gray-700">PNG files may be slightly larger than HEIC files. However, PNG's universal compatibility makes this worthwhile for sharing and cross-platform use.</p>
            </div>
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Can I batch convert multiple HEIC files?</h3>
              <p className="text-gray-700">Currently our converter handles one file at a time. However, conversion is instant, so you can quickly process multiple HEIC files sequentially.</p>
            </div>
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Is the conversion secure?</h3>
              <p className="text-gray-700">Your HEIC file is uploaded for server-assisted conversion and processed only as needed to create the PNG output.</p>
            </div>
            <div className="pb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Can I edit the PNG after conversion?</h3>
              <p className="text-gray-700">PNG files are supported by many image editors, and PNG uses lossless compression for subsequent storage.</p>
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
              "name": "What is HEIC format?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "HEIC (High Efficiency Image Container) is a modern image format used by Apple devices (iPhone, iPad, Mac) that provides excellent compression and quality."
              }
            },
            {
              "@type": "Question",
              "name": "Why is PNG better than HEIC?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "PNG is universally supported across all platforms and devices, while HEIC is primarily limited to Apple ecosystem. PNG is ideal for sharing and web use."
              }
            },
            {
              "@type": "Question",
              "name": "Will PNG be larger than HEIC?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "PNG files may be slightly larger than HEIC files. However, PNG's universal compatibility makes this worthwhile for sharing and cross-platform use."
              }
            },
            {
              "@type": "Question",
              "name": "Can I batch convert multiple HEIC files?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Currently our converter handles one file at a time. However, conversion is instant, so you can quickly process multiple HEIC files sequentially."
              }
            },
            {
              "@type": "Question",
              "name": "Is the conversion secure?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Your HEIC file is uploaded for server-assisted conversion and processed only as needed to create the PNG output."
              }
            },
            {
              "@type": "Question",
              "name": "Can I edit the PNG after conversion?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "PNG files are supported by many image editors, and PNG uses lossless compression for subsequent storage."
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
            <Link href="/all-tools/heic-to-jpg" className="group bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all">
              <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600">HEIC to JPG Converter</h3>
              <p className="text-gray-600 text-sm mt-2">Convert HEIC to universally compatible JPG</p>
            </Link>
            <Link href="/all-tools/jpg-to-png" className="group bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all">
              <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600">JPG to PNG Converter</h3>
              <p className="text-gray-600 text-sm mt-2">Convert JPG to PNG with transparency</p>
            </Link>
            <Link href="/all-tools/compress-image" className="group bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all">
              <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600">Image Compressor</h3>
              <p className="text-gray-600 text-sm mt-2">Reduce image file size with adjustable compression</p>
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







