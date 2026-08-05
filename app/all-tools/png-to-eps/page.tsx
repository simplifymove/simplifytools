'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Download, ChevronRight, Loader, FileUp } from 'lucide-react';
import { ImageUploader } from '../../components/ImageUploader';
import { HomeHeader } from '../../components/HomeHeader';
import { Footer } from '../../components/Footer';
import { useRouter } from 'next/navigation';
import { uploadBrowserDownloadResult } from '@/app/lib/download-result-client';

export default function PngToEpsPage() {
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
          from_format: 'png',
          to_format: 'eps',
          options: {},
        }),
      );

      const response = await fetch('/api/convert', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error((await response.text()) || 'EPS conversion failed');
      }

      const blob = await response.blob();

      if (blob.type !== 'application/postscript') {
        throw new Error(
          `Expected EPS output but received ${blob.type || 'unknown'}`,
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
            toolSlug: 'png-to-eps',
            originalName: 'converted.eps',
            outputName: 'converted.eps',
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
              <Link href="/all-tools" className="hover:text-white transition">All Tools</Link>
              <ChevronRight size={16} />
              <span>PNG to EPS</span>
            </div>

            {/* Title Section */}
            <div className="flex items-start gap-4">
              <div className="p-3 bg-white/20 rounded-lg">
                <FileUp size={32} className="text-white" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">PNG to EPS Converter</h1>
                <p className="text-lg text-white/90">Trace PNG artwork into EPS vector paths. Best results come from simple, high-contrast graphics.</p>
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
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Step 1: Upload PNG File</h2>
                  <ImageUploader
                    onFileSelect={handleFileSelect}
                    preview={preview}
                    onClearPreview={handleClearPreview}
                    accept=".png"
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
                      'Convert to EPS'
                    )}
                  </button>

                  {/* Download Button */}
                  {result && (
                    <button
                      onClick={handleDownload}
                      className="w-full py-3 px-6 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2"
                    >
                      <Download size={20} />
                      Download EPS
                    </button>
                  )}

                  {/* Info Box */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-900 mb-2">About</h3>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Server-assisted vector tracing</li>
                      <li>• Creates EPS vector paths from raster shapes</li>
                      <li>• Best suited to logos, icons, and high-contrast artwork</li>
                      <li>• Complex photographs may not trace cleanly</li>
                      <li>• Files are temporarily processed for conversion</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Supporting Content */}
        <section className="px-4 md:px-8 pb-16">
          <div className="max-w-6xl mx-auto space-y-8">

            <div className="bg-white rounded-xl border border-gray-200 p-6 md:p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                How to convert PNG to EPS online
              </h2>
              <p className="text-gray-600 mb-6">
                This PNG to EPS converter traces raster shapes from a PNG image
                and creates EPS vector paths. It is best suited to simple
                graphics such as logos, icons, symbols, and other artwork with
                clear edges and strong contrast.
              </p>

              <div className="grid md:grid-cols-3 gap-4">
                {[
                  ['1', 'Upload a PNG', 'Choose the PNG artwork you want to trace into EPS format.'],
                  ['2', 'Convert to EPS', 'Start the conversion and allow the server to trace the raster shapes into vector paths.'],
                  ['3', 'Download the EPS', 'Review the completed conversion and download the resulting EPS file.'],
                ].map(([number, title, description]) => (
                  <div key={number} className="border border-gray-200 rounded-lg p-5">
                    <div className="text-orange-500 font-bold text-lg mb-2">{number}</div>
                    <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
                    <p className="text-sm text-gray-600">{description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-3">
                  What happens during PNG to EPS conversion?
                </h2>
                <p className="text-gray-600">
                  PNG is a raster image format made from pixels. This tool does
                  not simply rename the file extension. It sends the image for
                  processing and traces visible raster shapes into paths that
                  can be stored in an EPS file.
                </p>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-3">
                  Which PNG images work best?
                </h2>
                <p className="text-gray-600">
                  Simple artwork with distinct shapes, limited colors, clean
                  boundaries, and strong contrast generally traces more cleanly.
                  Logos, icons, symbols, and flat illustrations are usually
                  better candidates than detailed photographs.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6 md:p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                PNG vs EPS
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">PNG</h3>
                  <p className="text-gray-600">
                    PNG stores an image as pixels. It is commonly used for web
                    graphics, screenshots, logos, and images that may require
                    transparency.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">EPS</h3>
                  <p className="text-gray-600">
                    EPS can store vector paths that describe shapes
                    mathematically. The EPS produced by this tool is generated
                    by tracing shapes from the uploaded raster image.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6 md:p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Raster tracing has limitations
              </h2>
              <p className="text-gray-600 mb-4">
                Converting a raster PNG to EPS cannot recover original vector
                information that was lost when artwork was rasterized. The
                converter traces the visible image instead.
              </p>
              <p className="text-gray-600">
                Photographs, gradients, shadows, textures, tiny details, and
                soft edges can produce more complex or less accurate tracing.
                For those images, inspect the resulting EPS before using it in
                print or design work.
              </p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6 md:p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Tips for better PNG to EPS results
              </h2>
              <ul className="space-y-3 text-gray-600">
                <li>• Start with the highest-quality PNG available.</li>
                <li>• Prefer graphics with clear boundaries and strong contrast.</li>
                <li>• Avoid unnecessary noise or very small details when possible.</li>
                <li>• Inspect curves, corners, text-like shapes, and fine details after conversion.</li>
                <li>• Keep the original PNG in case you need to compare it with the traced result.</li>
              </ul>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6 md:p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-5">
                PNG to EPS FAQ
              </h2>

              <div className="space-y-5">
                {[
                  ['Does this create real vector paths?', 'The converter traces raster shapes from the PNG and creates EPS vector paths from that tracing process.'],
                  ['Will the EPS look exactly like my PNG?', 'Not necessarily. Simple, high-contrast graphics generally trace better, while photographs and complex artwork can produce less accurate results.'],
                  ['Can this restore the original vector artwork?', 'No. If the PNG was originally exported from a vector design, the original paths are no longer present in the raster image. The converter creates new paths by tracing the visible pixels.'],
                  ['Is PNG to EPS suitable for photographs?', 'The conversion can be attempted, but detailed photographs are not ideal for vector tracing and may create complicated results.'],
                  ['Where is the conversion performed?', 'The PNG is sent to the SimplifyConvert conversion service for processing, and the resulting EPS is then prepared for download.'],
                ].map(([question, answer]) => (
                  <div key={question}>
                    <h3 className="font-semibold text-gray-900 mb-1">{question}</h3>
                    <p className="text-gray-600">{answer}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-orange-50 border border-orange-200 rounded-xl p-6 md:p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Related image tools
              </h2>
              <div className="flex flex-wrap gap-4">
                <Link href="/all-tools/png-to-jpg" className="text-orange-700 font-semibold hover:underline">
                  PNG to JPG
                </Link>
                <Link href="/all-tools/png-to-webp" className="text-orange-700 font-semibold hover:underline">
                  PNG to WebP
                </Link>
                <Link href="/all-tools/eps-to-png" className="text-orange-700 font-semibold hover:underline">
                  EPS to PNG
                </Link>
                <Link href="/all-tools/image-tools" className="text-orange-700 font-semibold hover:underline">
                  All Image Tools
                </Link>
              </div>
            </div>

          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}







