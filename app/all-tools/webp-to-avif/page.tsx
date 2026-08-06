'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Download, ChevronRight, Loader, Image } from 'lucide-react';
import { ImageUploader } from '../../components/ImageUploader';
import { HomeHeader } from '../../components/HomeHeader';
import { Footer } from '../../components/Footer';
import { useRouter } from 'next/navigation';
import { uploadBrowserDownloadResult } from '@/app/lib/download-result-client';

export default function WebpToAvifPage() {
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
      formData.append('config', JSON.stringify({
        from_format: 'webp',
        to_format: 'avif',
        options: {},
      }));

      const response = await fetch('/api/convert', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error((await response.text()) || 'AVIF conversion failed');
      }

      const blob = await response.blob();
      if (blob.type !== 'image/avif') {
        throw new Error('Unexpected AVIF output type: ' + (blob.type || 'unknown'));
      }

      setResult(blob);
    } catch (err) {
      setError((err as Error).message || 'Error converting image');
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = async () => {
      if (!result || processing) return;

      setError(null);
      setProcessing(true);

      try {
        const downloadResult =
          await uploadBrowserDownloadResult({
            blob: result,
            toolSlug: 'webp-to-avif',
            originalName: 'converted.avif',
            outputName: 'converted.avif',
          });

        router.push(downloadResult.downloadPageUrl);
      } catch (caughtError) {
        setError(
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
        {/* Hero Header */}
        <div className="relative bg-orange-500 py-16 px-4 md:px-8 overflow-hidden">
          <div className="max-w-6xl mx-auto relative z-10">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-white/90 text-sm mb-6">
              <Link href="/" className="hover:text-white transition">Home</Link>
              <ChevronRight size={16} />
              <Link href="/all-tools" className="hover:text-white transition">Tools</Link>
              <ChevronRight size={16} />
              <span>WebP to AVIF</span>
            </div>

            {/* Title Section */}
            <div className="flex items-start gap-4">
              <div className="p-3 bg-white/20 rounded-lg">
                <Image size={32} className="text-white" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">WebP to AVIF Converter</h1>
                <p className="text-lg text-white/90">Convert WebP images to AVIF format with server-assisted processing and download the converted result.</p>
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
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Step 1: Upload WebP Image</h2>
                  <ImageUploader
                    onFileSelect={handleFileSelect}
                    preview={preview}
                    onClearPreview={handleClearPreview}
                    accept="image/webp"
                  />
                  {error && (
                    <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-600">{error}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Controls - Right (sticky sidebar) */}
              <div className="lg:col-span-1">
                <div className="sticky top-4 space-y-4">
                  {/* Convert Button */}
                  <button
                    onClick={handleConvert}
                    disabled={!file || processing}
                    className="w-full py-3 px-6 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2"
                  >
                    {processing ? (
                      <>
                        <Loader size={20} className="animate-spin" />
                        Converting...
                      </>
                    ) : (
                      'Convert to AVIF'
                    )}
                  </button>

                  {/* Download Button */}
                  {result && (
                    <button
                      onClick={handleDownload}
                      className="w-full py-3 px-6 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2"
                    >
                      <Download size={20} />
                      Download AVIF
                    </button>
                  )}

                  {/* Info Box */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-900 mb-2">About</h3>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Server-assisted AVIF conversion</li>
                      <li>• Maximum AVIF compression</li>
                      <li>• Smaller file sizes than WebP</li>
                      <li>• Files are temporarily processed for conversion</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      {/* How To Section */}
      <section className="py-12 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">How to Convert WebP to AVIF</h2>
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-10 w-10 rounded-md bg-orange-500 text-white font-bold">1</div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Upload Your WebP File</h3>
                <p className="text-gray-600 mt-2">Select or drag and drop your WebP image to begin conversion to the even more efficient AVIF format.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-10 w-10 rounded-md bg-orange-500 text-white font-bold">2</div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Click Convert Button</h3>
                <p className="text-gray-600 mt-2">Press "Convert to AVIF" to start the server-assisted conversion.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-10 w-10 rounded-md bg-orange-500 text-white font-bold">3</div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Download AVIF File</h3>
                <p className="text-gray-600 mt-2">Download the converted AVIF file after processing is complete.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-12 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Why Convert WebP to AVIF?</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 text-orange-500 pt-1">✓</div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Even Better Compression</h3>
                <p className="text-gray-600 text-sm">AVIF supports efficient image compression, although resulting file size and visual quality depend on the source image and conversion settings.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 text-orange-500 pt-1">✓</div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Future-Proof Format</h3>
                <p className="text-gray-600 text-sm">AVIF is a modern image format designed for efficient compression and web delivery.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 text-orange-500 pt-1">✓</div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Maximized Performance</h3>
                <p className="text-gray-600 text-sm">Significantly faster page loads, improved SEO, and better user experience across all modern devices and browsers.</p>
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
              <h3 className="text-lg font-semibold text-gray-900 mb-3">How much smaller is AVIF than WebP?</h3>
              <p className="text-gray-700">File-size differences between AVIF and WebP depend on the source image, encoder, and conversion settings.</p>
            </div>
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Is AVIF better than WebP?</h3>
              <p className="text-gray-700">AVIF is a modern image format that can provide efficient compression. Results vary depending on image content and encoding settings.</p>
            </div>
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Are both formats supported by browsers?</h3>
              <p className="text-gray-700">Both WebP and AVIF are supported by modern browsers. AVIF support is growing rapidly with Chrome 85+, Firefox 93+, and Safari 16+.</p>
            </div>
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Will quality be lost in conversion?</h3>
              <p className="text-gray-700">AVIF conversion can change image data because the source is decoded and encoded again. Visual quality depends on the source image and conversion settings.</p>
            </div>
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Is the conversion process secure?</h3>
              <p className="text-gray-700">The WebP file is uploaded for server-assisted AVIF conversion. Temporary processing and generated download files are handled according to the SimplifyConvert Privacy Policy.</p>
            </div>
            <div className="pb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Should I convert all WebP files to AVIF?</h3>
              <p className="text-gray-700">For web optimization, converting WebP to AVIF is beneficial for modern browsers. Use HTML picture tags with fallbacks for maximum compatibility.</p>
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
              "name": "How much smaller is AVIF than WebP?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "File-size differences between AVIF and WebP depend on the source image, encoder, and conversion settings."
              }
            },
            {
              "@type": "Question",
              "name": "Is AVIF better than WebP?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "AVIF is a modern image format that can provide efficient compression. Results vary depending on image content and encoding settings."
              }
            },
            {
              "@type": "Question",
              "name": "Are both formats supported by browsers?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Both WebP and AVIF are supported by modern browsers. AVIF support is growing rapidly with Chrome 85+, Firefox 93+, and Safari 16+."
              }
            },
            {
              "@type": "Question",
              "name": "Will quality be lost in conversion?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "AVIF conversion can change image data because the source is decoded and encoded again. Visual quality depends on the source image and conversion settings."
              }
            },
            {
              "@type": "Question",
              "name": "Is the conversion process secure?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "The WebP file is uploaded for server-assisted AVIF conversion. Temporary processing and generated download files are handled according to the SimplifyConvert Privacy Policy."
              }
            },
            {
              "@type": "Question",
              "name": "Should I convert all WebP files to AVIF?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "For web optimization, converting WebP to AVIF is beneficial for modern browsers. Use HTML picture tags with fallbacks for maximum compatibility."
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
            <Link href="/all-tools/jpg-to-avif" className="group bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all">
              <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600">JPG to AVIF Converter</h3>
              <p className="text-gray-600 text-sm mt-2">Convert JPG to next-generation AVIF format</p>
            </Link>
            <Link href="/all-tools/png-to-avif" className="group bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all">
              <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600">PNG to AVIF Converter</h3>
              <p className="text-gray-600 text-sm mt-2">Convert PNG to AVIF with transparency</p>
            </Link>
            <Link href="/all-tools/jpg-to-webp" className="group bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all">
              <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600">JPG to WebP Converter</h3>
              <p className="text-gray-600 text-sm mt-2">Convert JPG to modern WebP format</p>
            </Link>
            <Link href="/all-tools/webp-to-jpg" className="group bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all">
              <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600">WebP to JPG Converter</h3>
              <p className="text-gray-600 text-sm mt-2">Convert WebP to universally compatible JPG</p>
            </Link>
          </div>
        </div>
      </section>
      </main>
      <Footer />
    </>
  );
}
