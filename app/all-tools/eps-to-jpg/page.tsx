'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Download, ChevronRight, Loader, FileUp } from 'lucide-react';
import { ImageUploader } from '../../components/ImageUploader';
import { HomeHeader } from '../../components/HomeHeader';
import { Footer } from '../../components/Footer';

import { uploadBrowserDownloadResult } from '@/app/lib/download-result-client';
export default function EpsToJpgPage() {
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
          from_format: 'eps',
          to_format: 'jpg',
          options: {
            dpi: 300,
          },
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
      setError((err as Error).message || 'Error converting file');
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
        toolSlug: 'eps-to-jpg',
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
      <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex flex-col">
        {/* Hero Header */}
        <div className="relative bg-blue-600 py-16 px-4 md:px-8 overflow-hidden">
          <div className="max-w-6xl mx-auto relative z-10">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-white/90 text-sm mb-6">
              <Link href="/" className="hover:text-white transition">Home</Link>
              <ChevronRight size={16} />
              <Link href="/all-tools" className="hover:text-white transition">All Tools</Link>
              <ChevronRight size={16} />
              <span>EPS to JPG</span>
            </div>

            {/* Title Section */}
            <div className="flex items-start gap-4">
              <div className="p-3 bg-white/20 rounded-lg">
                <FileUp size={32} className="text-white" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">EPS to JPG Converter</h1>
                <p className="text-lg text-white/90">Convert EPS vector graphics to JPG format with reliable server-assisted rendering for web and digital use.</p>
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
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Step 1: Upload EPS File</h2>
                  <ImageUploader
                    onFileSelect={handleFileSelect}
                    preview={preview}
                    onClearPreview={handleClearPreview}
                  />

                  {error && (
                    <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                      {error}
                    </div>
                  )}

                  {file && (
                    <div className="mt-6 flex gap-3">
                      <button
                        onClick={handleConvert}
                        disabled={processing}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2"
                      >
                        {processing ? (
                          <>
                            <Loader size={20} className="animate-spin" />
                            Converting...
                          </>
                        ) : (
                          'Convert to JPG'
                        )}
                      </button>
                    </div>
                  )}

                  {result && (
                    <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-green-700 font-semibold mb-3">✓ Conversion complete!</p>
                      <button
                        onClick={handleDownload}
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2"
                      disabled={processing}>
                        <Download size={20} />
                        {processing ? 'Preparing Download...' : 'Continue to Download'}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Features - Right (1 col) */}
              <div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Features</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <span className="text-blue-600 font-bold text-lg">✓</span>
                      <span className="text-gray-700">Server-assisted EPS rendering</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-blue-600 font-bold text-lg">✓</span>
                      <span className="text-gray-700">High-resolution 300 DPI rendering</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-blue-600 font-bold text-lg">✓</span>
                      <span className="text-gray-700">Creates standard JPG output</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-blue-600 font-bold text-lg">✓</span>
                      <span className="text-gray-700">Works on all devices</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-blue-600 font-bold text-lg">✓</span>
                      <span className="text-gray-700">No signup required</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Info Section */}
            <div className="mt-12 grid md:grid-cols-2 gap-8">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">About EPS Format</h3>
                <p className="text-gray-700 leading-relaxed">
                  EPS (Encapsulated PostScript) is a vector graphics format commonly used in professional design and printing. It is commonly used for logos, illustrations, and artwork that may need to be scaled or prepared for print.
                </p>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">About JPG Format</h3>
                <p className="text-gray-700 leading-relaxed">
                  JPG (JPEG) is a widely used raster image format commonly used for photographs and web images. It offers excellent compression, making files smaller while maintaining reasonable quality for digital viewing.
                </p>
              </div>
            </div>

            {/* FAQ Section */}
            <div className="mt-12 bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h3>
              <div className="space-y-4">
                <details className="border border-gray-200 rounded-lg p-4 cursor-pointer hover:bg-gray-50">
                  <summary className="font-semibold text-gray-900">What is an EPS file?</summary>
                  <p className="mt-2 text-gray-700">EPS (Encapsulated PostScript) is a vector graphics format used in professional design applications. It supports scalable graphics and is commonly used for logos and print materials.</p>
                </details>
                <details className="border border-gray-200 rounded-lg p-4 cursor-pointer hover:bg-gray-50">
                  <summary className="font-semibold text-gray-900">Why convert EPS to JPG?</summary>
                  <p className="mt-2 text-gray-700">JPG is more widely compatible with web browsers and digital devices. Converting EPS to JPG can make the artwork easier to view in software and browsers that support JPEG images.</p>
                </details>
                <details className="border border-gray-200 rounded-lg p-4 cursor-pointer hover:bg-gray-50">
                  <summary className="font-semibold text-gray-900">Does the conversion preserve quality?</summary>
                  <p className="mt-2 text-gray-700">EPS vector artwork is rasterized to create the JPG output. Because JPG is a raster format, the result no longer has the unlimited scalability of the original EPS file.</p>
                </details>
                <details className="border border-gray-200 rounded-lg p-4 cursor-pointer hover:bg-gray-50">
                  <summary className="font-semibold text-gray-900">Is my file secure?</summary>
                  <p className="mt-2 text-gray-700">Your EPS file is uploaded for server-assisted conversion and processed only as needed to create the JPG output.</p>
                </details>
              </div>
            </div>
          </div>
        </div>

        <Footer />
      </main>
    </>
  );
}
