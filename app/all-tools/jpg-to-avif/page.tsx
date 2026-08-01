'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Download, ChevronRight, Loader, FileUp } from 'lucide-react';
import { ImageUploader } from '../../components/ImageUploader';
import { HomeHeader } from '../../components/HomeHeader';
import { Footer } from '../../components/Footer';
import { useRouter } from 'next/navigation';
import { uploadBrowserDownloadResult } from '@/app/lib/download-result-client';

export default function JpgToAvifPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [quality, setQuality] = useState(85);

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
        from_format: 'jpg',
        to_format: 'avif',
        options: { quality },
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
      setError((err as Error).message || 'Error converting file');
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
          toolSlug: 'jpg-to-avif',
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
              <span>JPG to AVIF</span>
            </div>

            {/* Title Section */}
            <div className="flex items-start gap-4">
              <div className="p-3 bg-white/20 rounded-lg">
                <FileUp size={32} className="text-white" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">JPG to AVIF Converter</h1>
                <p className="text-lg text-white/90">Convert JPG images to AVIF format for next-generation compression and superior quality with faster web delivery.</p>
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
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Step 1: Upload JPG File</h2>
                  <ImageUploader
                    onFileSelect={handleFileSelect}
                    preview={preview}
                    onClearPreview={handleClearPreview}
                    accept=".jpg,.jpeg"
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
                  {/* Options */}
                  <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <h3 className="font-semibold text-gray-900 mb-4">Conversion Options</h3>

                    {/* Quality */}
                    <div>
                      <label className="text-sm font-medium text-gray-700 block mb-2">
                        Output Quality: {quality}%
                      </label>
                      <input
                        type="range"
                        min="60"
                        max="95"
                        step="5"
                        value={quality}
                        onChange={(e) => setQuality(parseInt(e.target.value))}
                        className="w-full"
                      />
                      <p className="text-xs text-gray-500 mt-1">Higher quality = larger file size</p>
                    </div>
                  </div>

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
                      <li>• Superior compression ratio</li>
                      <li>• Next-gen image format</li>
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
            <h2 className="text-3xl font-bold text-gray-900 mb-8">How to Convert JPG to AVIF</h2>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-10 w-10 rounded-md bg-orange-500 text-white font-bold">1</div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Upload Your JPG File</h3>
                  <p className="text-gray-600 mt-2">Select or drag and drop your JPG image to begin the conversion to AVIF format.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-10 w-10 rounded-md bg-orange-500 text-white font-bold">2</div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Select Quality Level</h3>
                  <p className="text-gray-600 mt-2">Adjust the quality setting (60-95%) to balance file size and image quality for your needs.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-10 w-10 rounded-md bg-orange-500 text-white font-bold">3</div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Convert to AVIF</h3>
                  <p className="text-gray-600 mt-2">Click "Convert to AVIF" to instantly process your image using advanced compression algorithms.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-10 w-10 rounded-md bg-orange-500 text-white font-bold">4</div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Download Your AVIF</h3>
                  <p className="text-gray-600 mt-2">Download your optimized AVIF file instantly. No signup required for this conversion.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-12 px-4 bg-gray-50">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Why Convert to AVIF Format?</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 text-orange-500 pt-1">✓</div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Superior Compression</h3>
                  <p className="text-gray-600 text-sm">AVIF provides 50-80% better compression than JPG, resulting in much smaller file sizes at equal or better quality levels.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 text-orange-500 pt-1">✓</div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Next-Generation Standard</h3>
                  <p className="text-gray-600 text-sm">AVIF is the modern image format for the future web, offering the best compression and quality of any current format.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 text-orange-500 pt-1">✓</div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Faster Web Performance</h3>
                  <p className="text-gray-600 text-sm">Significantly smaller files mean faster page loads, better SEO rankings, and improved user experience across all devices.</p>
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
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Is AVIF supported by all browsers?</h3>
                <p className="text-gray-700">AVIF is supported by modern browsers including Chrome 85+, Firefox 93+, and Safari 16+. For older browsers, serve JPG as a fallback using HTML picture tags.</p>
              </div>
              <div className="border-b border-gray-200 pb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">How much smaller is AVIF than JPG?</h3>
                <p className="text-gray-700">AVIF files are typically 50-80% smaller than equivalent JPG files while maintaining superior image quality, depending on image content and quality settings.</p>
              </div>
              <div className="border-b border-gray-200 pb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Will quality be compromised?</h3>
                <p className="text-gray-700">No. AVIF uses advanced compression that maintains excellent quality at much smaller file sizes. You can adjust the quality setting to optimize for your specific needs.</p>
              </div>
              <div className="border-b border-gray-200 pb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Can AVIF replace JPG on my website?</h3>
                <p className="text-gray-700">Yes, AVIF can replace JPG for modern browsers. Use HTML picture tags to serve AVIF to supported browsers with JPG fallback for maximum compatibility.</p>
              </div>
              <div className="border-b border-gray-200 pb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Is the conversion process secure?</h3>
                <p className="text-gray-700">The JPG file is uploaded for server-assisted AVIF conversion. Temporary processing and generated download files are handled according to the SimplifyConvert Privacy Policy.</p>
              </div>
              <div className="pb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Can I convert multiple JPG files?</h3>
                <p className="text-gray-700">Currently our converter handles one file at a time. However, conversion is instant, so you can quickly process multiple files sequentially.</p>
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
                "name": "Is AVIF supported by all browsers?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "AVIF is supported by modern browsers including Chrome 85+, Firefox 93+, and Safari 16+. For older browsers, serve JPG as a fallback using HTML picture tags."
                }
              },
              {
                "@type": "Question",
                "name": "How much smaller is AVIF than JPG?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "AVIF files are typically 50-80% smaller than equivalent JPG files while maintaining superior image quality, depending on image content and quality settings."
                }
              },
              {
                "@type": "Question",
                "name": "Will quality be compromised?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "No. AVIF uses advanced compression that maintains excellent quality at much smaller file sizes. You can adjust the quality setting to optimize for your specific needs."
                }
              },
              {
                "@type": "Question",
                "name": "Can AVIF replace JPG on my website?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes, AVIF can replace JPG for modern browsers. Use HTML picture tags to serve AVIF to supported browsers with JPG fallback for maximum compatibility."
                }
              },
              {
                "@type": "Question",
                "name": "Is the conversion process secure?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "The JPG file is uploaded for server-assisted AVIF conversion. Temporary processing and generated download files are handled according to the SimplifyConvert Privacy Policy."
                }
              },
              {
                "@type": "Question",
                "name": "Can I convert multiple JPG files?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Currently our converter handles one file at a time. However, conversion is instant, so you can quickly process multiple files sequentially."
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
              <Link href="/all-tools/png-to-avif" className="group bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all">
                <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600">PNG to AVIF Converter</h3>
                <p className="text-gray-600 text-sm mt-2">Convert PNG to next-generation AVIF format</p>
              </Link>
              <Link href="/all-tools/jpg-to-webp" className="group bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all">
                <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600">JPG to WebP Converter</h3>
                <p className="text-gray-600 text-sm mt-2">Convert JPG to modern WebP format</p>
              </Link>
              <Link href="/all-tools/compress-image" className="group bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all">
                <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600">Image Compressor</h3>
                <p className="text-gray-600 text-sm mt-2">Reduce image file size without quality loss</p>
              </Link>
              <Link href="/all-tools/jpg-to-png" className="group bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all">
                <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600">JPG to PNG Converter</h3>
                <p className="text-gray-600 text-sm mt-2">Convert JPG to PNG with transparency</p>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
