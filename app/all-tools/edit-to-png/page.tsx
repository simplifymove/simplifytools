'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Download, ChevronRight, Loader, FileUp } from 'lucide-react';
import { ImageUploader } from '../../components/ImageUploader';
import { convertImageFormat } from '../../lib/imageTools';
import { HomeHeader } from '../../components/HomeHeader';
import { Footer } from '../../components/Footer';

import { uploadBrowserDownloadResult } from '@/app/lib/download-result-client';
export default function EditToPngPage() {
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
      const result = await convertImageFormat(file, 'image/png');
      setResult(result.blob);
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
        toolSlug: 'edit-to-png',
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
              <span>Edit to PNG</span>
            </div>

            {/* Title Section */}
            <div className="flex items-start gap-4">
              <div className="p-3 bg-white/20 rounded-lg">
                <FileUp size={32} className="text-white" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">Convert to PNG</h1>
                <p className="text-lg text-white/90">Convert various image formats to PNG with support for JPG, BMP, GIF, TIFF, WebP, and more.</p>
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
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Step 1: Upload Image File</h2>
                  <ImageUploader
                    onFileSelect={handleFileSelect}
                    preview={preview}
                    onClearPreview={handleClearPreview}
                    accept="image/*"
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
                      'Convert to PNG'
                    )}
                  </button>

                  {/* Download Button */}
                  {result && (
                    <button
                      onClick={handleDownload}
                      className="w-full py-3 px-6 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2"
                      disabled={processing}>
                      <Download size={20} />
                      {processing ? 'Preparing Download...' : 'Continue to Download'}
                    </button>
                  )}

                  {/* Info Box */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-900 mb-2">Supported Formats</h3>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• JPG, JPEG</li>
                      <li>• BMP, GIF</li>
                      <li>• TIFF, WebP</li>
                      <li>• And more...</li>
                      <li>• Browser-based image conversion</li>
                    </ul>
                  </div>

                  {/* Additional Info */}
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <h3 className="font-semibold text-amber-900 mb-2">Why PNG?</h3>
                    <ul className="text-sm text-amber-800 space-y-1">
                      <li>• Lossless compression</li>
                      <li>• Supports transparency</li>
                      <li>• Best for web</li>
                      <li>• Lossless PNG output encoding</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <section className="px-4 md:px-8 pb-16">
          <div className="max-w-6xl mx-auto space-y-10">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                How to convert an image to PNG
              </h2>
              <p className="text-gray-600 leading-7 mb-5">
                This tool converts a supported image into PNG format. Select
                your source image, run the conversion, preview the result, and
                continue to the download page when the PNG is ready.
              </p>

              <div className="grid md:grid-cols-3 gap-4">
                {[
                  ['1', 'Upload image', 'Choose a supported image file from your device.'],
                  ['2', 'Convert to PNG', 'Select Convert to PNG and wait for the browser conversion to finish.'],
                  ['3', 'Download', 'Continue to the download page to save the resulting PNG.'],
                ].map(([number, title, description]) => (
                  <div key={number} className="bg-white border border-gray-200 rounded-xl p-5">
                    <div className="font-bold text-orange-500 mb-2">{number}</div>
                    <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
                    <p className="text-sm text-gray-600">{description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-3">
                  Why convert an image to PNG?
                </h2>
                <p className="text-gray-600 leading-7">
                  PNG is widely supported and uses lossless image encoding.
                  It is commonly used for graphics, screenshots, interface
                  assets, illustrations, and images that need a broadly
                  compatible PNG output.
                </p>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-3">
                  Is this an image editor?
                </h2>
                <p className="text-gray-600 leading-7">
                  No. Despite the legacy URL name, this page performs image
                  format conversion to PNG. It does not currently provide
                  cropping, drawing, filters, or other image-editing controls.
                </p>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Before converting to PNG
              </h2>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li>Start with the best-quality source image available.</li>
                <li>Check the preview to make sure the browser can decode the selected file.</li>
                <li>Remember that converting to PNG does not increase the original image resolution.</li>
                <li>PNG files can be larger than equivalent lossy image formats depending on the source image.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-5">
                Convert to PNG FAQ
              </h2>
              <div className="space-y-4">
                {[
                  ['What does this tool create?', 'It creates a PNG version of a supported source image.'],
                  ['Does PNG use lossless encoding?', 'Yes. PNG uses lossless image compression.'],
                  ['Will converting to PNG improve image quality?', 'No. Conversion can change the file format, but it cannot restore detail that is missing from the original image.'],
                  ['Can this tool crop or resize my image?', 'No. This page currently performs format conversion only. Use the dedicated crop or resize tools when you need those operations.'],
                ].map(([q, a]) => (
                  <div key={q} className="bg-white border border-gray-200 rounded-xl p-5">
                    <h3 className="font-semibold text-gray-900 mb-2">{q}</h3>
                    <p className="text-gray-600">{a}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Related image tools
              </h2>
              <div className="flex flex-wrap gap-3">
                <Link href="/all-tools/resize-image" className="text-orange-600 hover:underline">
                  Resize Image
                </Link>
                <Link href="/all-tools/crop-image" className="text-orange-600 hover:underline">
                  Crop Image
                </Link>
                <Link href="/all-tools/image-tools" className="text-orange-600 hover:underline">
                  More image tools
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







