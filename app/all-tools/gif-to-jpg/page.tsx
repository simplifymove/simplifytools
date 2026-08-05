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
export default function GifToJpgPage() {
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
      const result = await convertImageFormat(file, 'image/jpeg', {
        quality: quality,
      });
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
        toolSlug: 'gif-to-jpg',
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
        <div className="relative bg-orange-500 py-16 px-4 md:px-8 overflow-hidden">
          <div className="max-w-6xl mx-auto relative z-10">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-white/90 text-sm mb-6">
              <Link href="/" className="hover:text-white transition">Home</Link>
              <ChevronRight size={16} />
              <Link href="/all-tools" className="hover:text-white transition">All Tools</Link>
              <ChevronRight size={16} />
              <span>GIF to JPG</span>
            </div>

            {/* Title Section */}
            <div className="flex items-start gap-4">
              <div className="p-3 bg-white/20 rounded-lg">
                <FileUp size={32} className="text-white" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">GIF to JPG Converter</h1>
                <p className="text-lg text-white/90">Convert GIF images to JPG format with high quality. First frame of animated GIFs will be used.</p>
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
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Step 1: Upload GIF File</h2>
                  <ImageUploader
                    onFileSelect={handleFileSelect}
                    preview={preview}
                    onClearPreview={handleClearPreview}
                    accept=".gif"
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
                      'Convert to JPG'
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
                    <h3 className="font-semibold text-blue-900 mb-2">About</h3>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Instant conversion in your browser</li>
                      <li>• Uses first frame of animated GIFs</li>
                      <li>• Adjustable quality settings</li>
                      <li>• Conversion happens in your browser</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

          {/* Supporting Content */}
          <section className="max-w-6xl mx-auto w-full px-4 md:px-8 pb-16 space-y-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-5">
                How to Convert GIF to JPG
              </h2>
              <p className="text-gray-700 leading-7 mb-4">
                Use the GIF to JPG converter when you need a static JPEG image
                from a GIF file. Upload your GIF, choose the JPG quality level,
                and select Convert to JPG. The conversion takes place directly
                in your browser using the browser&apos;s image and Canvas
                capabilities.
              </p>
              <p className="text-gray-700 leading-7">
                After conversion, continue to the download page to retrieve the
                generated JPG. The converted JPG is prepared for the download
                flow only after you choose to continue.
              </p>
            </div>

            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-5">
                What Happens to Animated GIFs?
              </h2>
              <p className="text-gray-700 leading-7 mb-4">
                JPG is a static image format and cannot preserve GIF animation.
                When an animated GIF is converted, the browser-decoded first
                frame is rendered to a Canvas and encoded as a JPG image. The
                remaining animation frames are not included in the JPG output.
              </p>
              <p className="text-gray-700 leading-7">
                This makes the tool useful when you want a still image from the
                beginning of an animated GIF for documents, thumbnails,
                previews, uploads, or other places where a JPG file is more
                convenient than an animation.
              </p>
            </div>

            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-5">
                Choosing JPG Quality
              </h2>
              <p className="text-gray-700 leading-7 mb-4">
                The quality control lets you choose a JPEG output quality from
                60% to 95%. Higher settings generally retain more visual detail
                but can produce a larger file. Lower settings can reduce the
                output size by applying stronger JPEG compression.
              </p>
              <p className="text-gray-700 leading-7">
                The default 85% setting provides a practical starting point for
                many images. If fine details or text look too compressed, try a
                higher value. If reducing file size matters more, try a lower
                setting and compare the result.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  When GIF to JPG Is Useful
                </h2>
                <ul className="space-y-3 text-gray-700 leading-6">
                  <li>• Create a static JPG from an animated GIF.</li>
                  <li>• Use a GIF frame in documents or presentations.</li>
                  <li>• Prepare a JPEG for services that require JPG uploads.</li>
                  <li>• Adjust JPEG quality to balance detail and file size.</li>
                  <li>• Convert without installing desktop image software.</li>
                </ul>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Conversion and Download
                </h2>
                <ul className="space-y-3 text-gray-700 leading-6">
                  <li>• The GIF is read and converted in your browser.</li>
                  <li>• Animated GIF output becomes a single static JPG.</li>
                  <li>• Your selected quality is used for JPEG encoding.</li>
                  <li>• The generated JPG is uploaded when you continue to the download page.</li>
                </ul>
              </div>
            </div>

            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-5">
                GIF to JPG FAQ
              </h2>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Will the JPG remain animated?
                  </h3>
                  <p className="text-gray-700 leading-7">
                    No. JPG does not support animation. The converter creates a
                    static JPG from the browser-decoded first frame of the GIF.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Can I choose a different GIF frame?
                  </h3>
                  <p className="text-gray-700 leading-7">
                    No. This converter does not currently provide manual frame
                    selection. It creates the JPG from the first frame used by
                    the browser image decoder.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Does the quality setting affect the JPG?
                  </h3>
                  <p className="text-gray-700 leading-7">
                    Yes. The selected quality value is used when the browser
                    encodes the Canvas image as JPEG. Higher quality can retain
                    more detail while typically increasing file size.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Is my GIF uploaded for conversion?
                  </h3>
                  <p className="text-gray-700 leading-7">
                    The GIF-to-JPG conversion itself happens in your browser.
                    When you continue to the download page, the generated JPG
                    is uploaded so the download result can be prepared.
                  </p>
                </div>
              </div>
            </div>
          </section>

</main>
      <Footer />
    </>
  );
}







