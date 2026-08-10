'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Download, Loader, ChevronRight, Image, CheckCircle } from 'lucide-react';
import { ImageUploader } from '../../components/ImageUploader';
import { HomeHeader } from '../../components/HomeHeader';
import { Footer } from '../../components/Footer';

import { uploadBrowserDownloadResult } from '@/app/lib/download-result-client';
export default function HeicToJpgPage() {
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
          to_format: 'jpg',
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

      if (blob.type !== 'image/jpeg') {
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
        toolSlug: 'heic-to-jpg',
        originalName: file.name,
        outputName: `${baseName}.jpg`,
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
      <main className="min-h-screen bg-gradient-to-br from-cyan-50 to-blue-100 flex flex-col">
        {/* Hero Section */}
        <div className="relative bg-gradient-to-r from-cyan-600 via-blue-600 to-cyan-700 py-16 px-4 md:px-8 overflow-hidden">
          <div className="max-w-6xl mx-auto relative z-10 w-full">
            <div className="flex items-center gap-2 text-white/80 text-sm mb-6">
              <Link href="/" className="hover:text-white transition">Home</Link>
              <ChevronRight size={16} />
              <Link href="/all-tools" className="hover:text-white transition">All Tools</Link>
              <ChevronRight size={16} />
              <span>HEIC to JPG</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              🖼️ HEIC to JPG Converter
            </h1>
            <p className="text-lg text-white/90 max-w-2xl">
              Convert HEIC images from your iPhone to JPG format with reliable server-assisted processing.
            </p>
          </div>
        </div>

        {/* Upload Section */}
        <section className="py-12 px-4 md:px-8 flex-1">
          <div className="max-w-2xl mx-auto">
            <ImageUploader onFileSelect={handleFileSelect} accept=".heic,.heif,image/heic,image/heif" preview={preview} onClearPreview={handleClearPreview} />

            {preview && (
              <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
                <div className="space-y-4">
                  <div className="relative inline-block w-full">
                    <img src={preview} alt="Preview" className="w-full rounded-lg max-h-96 object-contain" />
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <p className="text-red-700 text-sm">{error}</p>
                    </div>
                  )}

                  <div className="flex gap-4">
                    <button
                      onClick={handleConvert}
                      disabled={processing}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition flex items-center justify-center gap-2"
                    >
                      {processing ? (
                        <>
                          <Loader size={20} className="animate-spin" />
                          Converting...
                        </>
                      ) : (
                        <>
                          <CheckCircle size={20} />
                          Convert to JPG
                        </>
                      )}
                    </button>
                    <button
                      onClick={handleClearPreview}
                      className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 px-6 rounded-lg transition"
                    >
                      Clear
                    </button>
                  </div>

                  {result && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-green-700 font-semibold">✓ Conversion complete!</span>
                        <button
                          onClick={handleDownload}
                          className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-lg transition flex items-center gap-2"
                      disabled={processing}>
                          <Download size={20} />
                          {processing ? 'Preparing Download...' : 'Continue to Download'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* How To Guide */}
        <section className="py-12 px-4 bg-white">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">How to Convert HEIC to JPG</h2>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">1</div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Upload Your HEIC File</h3>
                  <p className="text-gray-600 mt-2">Click the upload area or drag your HEIC image file from your device. HEIC is Apple's modern image format commonly used on iPhones.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">2</div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Preview Your Image</h3>
                  <p className="text-gray-600 mt-2">Once uploaded, you'll see a preview of your image. Make sure it's the correct file before proceeding to conversion.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">3</div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Click Convert to JPG</h3>
                  <p className="text-gray-600 mt-2">Press the "Convert to JPG" button. Your HEIC file is securely processed to create a compatible JPG image.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">4</div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Download Your JPG</h3>
                  <p className="text-gray-600 mt-2">Once converted, click "Download JPG" to save your image. JPG is widely supported across browsers, devices, image editors, document tools, and publishing workflows.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">5</div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Share or Use Your JPG</h3>
                  <p className="text-gray-600 mt-2">Your converted JPG image is ready to use. Share it anywhere, upload to websites, or edit it with any image editor.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-12 px-4 bg-gray-50">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Why Convert HEIC to JPG?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Image className="text-blue-600" size={24} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Universal Compatibility</h3>
                <p className="text-gray-600">JPG has broad support across browsers, devices, and applications, while HEIC support varies by platform and software.</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <CheckCircle className="text-blue-600" size={24} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Easy Sharing</h3>
                <p className="text-gray-600">Share your photos on social media, email, or upload to websites without compatibility issues. JPG works everywhere.</p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-12 px-4 bg-white">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Frequently Asked Questions</h2>
            <div className="space-y-4">
              <details className="bg-gray-50 rounded-lg border border-gray-200 p-6 cursor-pointer group">
                <summary className="flex items-center justify-between font-semibold text-gray-900 select-none">
                  <span>What is HEIC format?</span>
                  <span className="group-open:rotate-180 transition">▼</span>
                </summary>
                <p className="text-gray-600 mt-4">HEIC (High Efficiency Image Container) is Apple's modern image format used by iPhones and iPads. It provides better compression than JPG while maintaining quality, but it's not universally supported like JPG.</p>
              </details>
              <details className="bg-gray-50 rounded-lg border border-gray-200 p-6 cursor-pointer group">
                <summary className="flex items-center justify-between font-semibold text-gray-900 select-none">
                  <span>Why does my iPhone use HEIC?</span>
                  <span className="group-open:rotate-180 transition">▼</span>
                </summary>
                <p className="text-gray-600 mt-4">HEIC is designed for efficient image storage and is commonly used by Apple devices. File-size differences compared with JPG depend on the image and encoding settings, while HEIC compatibility can vary across platforms and applications.</p>
              </details>
              <details className="bg-gray-50 rounded-lg border border-gray-200 p-6 cursor-pointer group">
                <summary className="flex items-center justify-between font-semibold text-gray-900 select-none">
                  <span>Will the image quality decrease?</span>
                  <span className="group-open:rotate-180 transition">▼</span>
                </summary>
                <p className="text-gray-600 mt-4">JPG uses lossy compression, so some image information can change during conversion. The visible difference depends on the source HEIC image and the JPEG encoding used for the output.</p>
              </details>
              <details className="bg-gray-50 rounded-lg border border-gray-200 p-6 cursor-pointer group">
                <summary className="flex items-center justify-between font-semibold text-gray-900 select-none">
                  <span>Can I convert multiple HEIC files at once?</span>
                  <span className="group-open:rotate-180 transition">▼</span>
                </summary>
                <p className="text-gray-600 mt-4">The converter processes one file at a time. To convert multiple HEIC files, upload and process them individually.</p>
              </details>
              <details className="bg-gray-50 rounded-lg border border-gray-200 p-6 cursor-pointer group">
                <summary className="flex items-center justify-between font-semibold text-gray-900 select-none">
                  <span>Is my image data secure?</span>
                  <span className="group-open:rotate-180 transition">▼</span>
                </summary>
                <p className="text-gray-600 mt-4">Your HEIC file is uploaded for server-assisted conversion and processed only as needed to create the JPG output.</p>
              </details>
              <details className="bg-gray-50 rounded-lg border border-gray-200 p-6 cursor-pointer group">
                <summary className="flex items-center justify-between font-semibold text-gray-900 select-none">
                  <span>What's the file size limit?</span>
                  <span className="group-open:rotate-180 transition">▼</span>
                </summary>
                <p className="text-gray-600 mt-4">Files around 50MB or larger may exceed practical upload or processing constraints. Compress or resize very large images before converting them to JPG.</p>
              </details>
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
                  "text": "HEIC (High Efficiency Image Container) is Apple's modern image format used by iPhones and iPads. It provides better compression than JPG while maintaining quality, but it's not universally supported like JPG."
                }
              },
              {
                "@type": "Question",
                "name": "Why does my iPhone use HEIC?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "HEIC is designed for efficient image storage and is commonly used by Apple devices. File-size differences compared with JPG depend on the image and encoding settings, while HEIC compatibility can vary across platforms and applications."
                }
              },
              {
                "@type": "Question",
                "name": "Will the image quality decrease?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "JPG uses lossy compression, so some image information can change during conversion. The visible difference depends on the source HEIC image and the JPEG encoding used for the output."
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
              <Link href="/all-tools/jpg-to-png" className="group bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all">
                <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600">JPG to PNG Converter</h3>
                <p className="text-gray-600 text-sm mt-2">Convert JPG to PNG with transparency</p>
              </Link>
              <Link href="/all-tools/png-to-jpg" className="group bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all">
                <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600">PNG to JPG Converter</h3>
                <p className="text-gray-600 text-sm mt-2">Convert PNG to JPG format</p>
              </Link>
              <Link href="/all-tools/jpg-to-webp" className="group bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all">
                <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600">JPG to WebP Converter</h3>
                <p className="text-gray-600 text-sm mt-2">Convert JPG to modern WebP format</p>
              </Link>
              <Link href="/all-tools/compress-image" className="group bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all">
                <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600">Image Compressor</h3>
                <p className="text-gray-600 text-sm mt-2">Reduce image file size</p>
              </Link>
            </div>
          </div>
        </section>

        <Footer />
      </main>
    </>
  );
}
