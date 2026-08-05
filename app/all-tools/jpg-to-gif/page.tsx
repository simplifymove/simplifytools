'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Download, ChevronRight, Loader, FileUp } from 'lucide-react';
import { ImageUploader } from '../../components/ImageUploader';
import { HomeHeader } from '../../components/HomeHeader';
import { Footer } from '../../components/Footer';
import { useRouter } from 'next/navigation';
import { uploadBrowserDownloadResult } from '@/app/lib/download-result-client';

export default function JpgToGifPage() {
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
          from_format: 'jpg',
          to_format: 'gif',
          options: {},
        }),
      );

      const response = await fetch('/api/convert', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || 'GIF conversion failed');
      }

      const blob = await response.blob();

      if (blob.type !== 'image/gif') {
        throw new Error(
          `Expected GIF output but received ${blob.type || 'unknown'}`,
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
      if (!result || processing) return;

      setError(null);
      setProcessing(true);

      try {
        const downloadResult =
          await uploadBrowserDownloadResult({
            blob: result,
            toolSlug: 'jpg-to-gif',
            originalName: 'converted.gif',
            outputName: 'converted.gif',
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
              <span>JPG to GIF</span>
            </div>

            {/* Title Section */}
            <div className="flex items-start gap-4">
              <div className="p-3 bg-white/20 rounded-lg">
                <FileUp size={32} className="text-white" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">JPG to GIF Converter</h1>
                <p className="text-lg text-white/90">Convert a JPG image to static GIF format.</p>
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
                      'Convert to GIF'
                    )}
                  </button>

                  {/* Download Button */}
                  {result && (
                    <button
                      onClick={handleDownload}
                      className="w-full py-3 px-6 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2"
                    >
                      <Download size={20} />
                      Download GIF
                    </button>
                  )}

                  {/* Info Box */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-900 mb-2">About</h3>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Server-assisted GIF conversion</li>
                      <li>• Creates a static GIF image</li>
                      <li>• Supports JPG and JPEG formats</li>
                      <li>• Files are temporarily processed for conversion</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <section className="bg-white border-t border-gray-200 px-4 md:px-8 py-14">
          <div className="max-w-6xl mx-auto space-y-10">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                How to convert JPG to GIF online
              </h2>
              <p className="text-gray-600 leading-7">
                Upload one JPG or JPEG image, click Convert to GIF, preview the
                converted result, and download the GIF. One uploaded JPG
                produces one static GIF image.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="border border-gray-200 rounded-xl p-6">
                <h3 className="font-bold text-gray-900 mb-2">
                  JPG vs GIF
                </h3>
                <p className="text-sm text-gray-600 leading-6">
                  JPG is widely used for photographs and images containing many
                  colors. GIF uses a limited color palette and is often used
                  where GIF compatibility is specifically required.
                </p>
              </div>

              <div className="border border-gray-200 rounded-xl p-6">
                <h3 className="font-bold text-gray-900 mb-2">
                  This tool does not create animations
                </h3>
                <p className="text-sm text-gray-600 leading-6">
                  The converter accepts one JPG or JPEG and creates one static
                  GIF. It does not combine a sequence of JPG files into an
                  animated GIF.
                </p>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Why can the converted image look different?
              </h2>
              <p className="text-gray-600 leading-7">
                JPG can represent photographic color detail differently from
                GIF. Because GIF uses a restricted palette, photographs,
                gradients, and detailed color transitions may change after
                conversion.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Tips before downloading
              </h2>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li>Preview the GIF and compare important colors.</li>
                <li>Keep the original JPG if image fidelity matters.</li>
                <li>Use GIF when the target system specifically needs GIF.</li>
                <li>For photographs, compare the result before replacing the original.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                JPG to GIF FAQ
              </h2>
              <div className="space-y-4">
                {[
                  ['Does this make an animated GIF?', 'No. A single JPG or JPEG is converted into a single static GIF image.'],
                  ['Can I upload JPEG files?', 'Yes. The uploader supports JPG and JPEG image files.'],
                  ['Why might a photo lose some color detail?', 'GIF uses a limited color palette, so photographic images can look different after conversion.'],
                  ['Can I preview the GIF?', 'Yes. The result is displayed after conversion so you can review it before downloading.'],
                ].map(([q, a]) => (
                  <div key={q} className="border border-gray-200 rounded-xl p-5">
                    <h3 className="font-semibold text-gray-900 mb-2">{q}</h3>
                    <p className="text-sm text-gray-600">{a}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
