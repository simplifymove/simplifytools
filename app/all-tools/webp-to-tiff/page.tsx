'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Download, ChevronRight, Loader, Image } from 'lucide-react';
import { ImageUploader } from '../../components/ImageUploader';
import { HomeHeader } from '../../components/HomeHeader';
import { Footer } from '../../components/Footer';
import { uploadBrowserDownloadResult } from "@/app/lib/download-result-client";
import { useRouter } from "next/navigation";

export default function WebpToTiffPage() {
    const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
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
    setDownloadUrl(null);
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
        to_format: 'tiff',
        options: {},
      }));

      const response = await fetch('/api/convert', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Conversion failed');
      }

      const blob = await response.blob();

      if (blob.type !== 'image/tiff') {
        throw new Error(
          `Unexpected TIFF output type: ${blob.type || 'unknown'}`,
        );
      }
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
    } catch (error) {
      setError((error as Error).message || 'Error converting image');
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = async () => {

      if (!downloadUrl) return;

      const blob = await fetch(downloadUrl).then((response) => response.blob());

      const downloadResult = await uploadBrowserDownloadResult({
        blob,
        toolSlug: "webp-to-tiff",
        originalName: "converted.tiff",
        outputName: "converted.tiff",
      });

      router.push(downloadResult.downloadPageUrl);
  };

  return (
    <>
      <HomeHeader />
      <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex flex-col">
        {/* Hero Header */}
        <div className="relative bg-green-500 py-16 px-4 md:px-8 overflow-hidden">
          <div className="max-w-6xl mx-auto relative z-10">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-white/90 text-sm mb-6">
              <Link href="/" className="hover:text-white transition">Home</Link>
              <ChevronRight size={16} />
              <Link href="/all-tools" className="hover:text-white transition">All Tools</Link>
              <ChevronRight size={16} />
              <span>WebP to TIFF</span>
            </div>

            {/* Title Section */}
            <div className="flex items-start gap-4 mb-6">
              <div className="p-3 bg-white/20 rounded-lg">
                <Image size={32} className="text-white" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">WebP to TIFF Converter</h1>
                <p className="text-lg text-white/90">Convert WebP images to TIFF using lossless TIFF compression for professional, archival, and compatibility-focused workflows.</p>
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
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Step 1: Upload WebP</h2>
                  <ImageUploader
                    onFileSelect={handleFileSelect}
                    preview={preview}
                    onClearPreview={handleClearPreview}
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
                  <h3 className="text-lg font-bold text-gray-900 mb-6">Preview & Convert</h3>

                  {/* Image Preview */}
                  <div className="mb-6">
                    {preview ? (
                      <div className="space-y-4">
                        <img
                          src={preview}
                          alt="WebP Preview"
                          className="w-full rounded-lg border border-gray-200 object-cover max-h-64"
                        />
                        <div className="text-sm text-gray-600">
                          <p><strong>Format:</strong> WebP</p>
                          <p><strong>Size:</strong> {file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : '-'}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="h-64 bg-green-50 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                        <div className="text-center">
                          <p className="text-gray-500 text-sm">No image selected</p>
                          <p className="text-gray-400 text-xs mt-1">Upload a WebP to begin</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Convert Button */}
                  <button
                    onClick={handleConvert}
                    disabled={!file || processing}
                    className="w-full px-6 py-3 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                  >
                    {processing ? (
                      <>
                        <Loader size={18} className="animate-spin" />
                        Converting...
                      </>
                    ) : (
                      <>
                        <Image size={18} />
                        Convert to TIFF
                      </>
                    )}
                  </button>

                  {/* Download Button */}
                  {downloadUrl && (
                    <button
                      onClick={handleDownload}
                      className="w-full mt-3 px-4 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-all flex items-center justify-center gap-2"
                    >
                      <Download size={18} />
                      Download TIFF
                    </button>
                  )}

                  {/* Info */}
                  <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-xs text-green-700 mb-2">
                      <strong>💡 TIFF Benefits:</strong>
                    </p>
                    <ul className="text-xs text-green-700 space-y-1">
                      <li>• Lossless compression for archival</li>
                      <li>• Professional quality for printing</li>
                      <li>• Lossless LZW compression for TIFF output</li>
                      <li>• Wide compatibility with design tools</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* FAQ Section */}
            <div className="mt-12 bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">What is TIFF format?</h3>
                  <p className="text-gray-600">TIFF (Tagged Image File Format) is a flexible image format that supports both lossless and lossy compression. It's widely used for high-quality image storage and professional applications.</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Why convert WebP to TIFF?</h3>
                  <p className="text-gray-600">TIFF supports lossless storage and is widely used in imaging, publishing, print, and archival workflows. Converting WebP to TIFF can be useful when a workflow or application specifically requires TIFF input.</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Will my image lose quality?</h3>
                  <p className="text-gray-600">The TIFF output uses lossless compression, so the conversion does not introduce additional lossy TIFF compression. If the source WebP was originally encoded with lossy compression, previously discarded detail cannot be restored.</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">What size files can I convert?</h3>
                  <p className="text-gray-600">Processing time and memory use depend on the WebP dimensions, file size, and image complexity. Larger images generally require more processing resources.</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">How is WebP to TIFF different from other conversions?</h3>
                  <p className="text-gray-600">WebP images with transparency can be represented in TIFF when supported by the source image mode and conversion pipeline. Format-specific metadata or features may not transfer identically.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <section className="bg-white border-t border-gray-200 px-4 md:px-8 py-14">
          <div className="max-w-6xl mx-auto space-y-10">

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                How to convert WebP to TIFF online
              </h2>
              <p className="text-gray-600 leading-7">
                Upload a WebP image and click Convert to TIFF. The image is sent
                to the server and decoded before being written as a TIFF image
                using lossless LZW compression. When conversion finishes, click
                Download TIFF to continue to the download page and save the
                converted file.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  What happens during WebP to TIFF conversion?
                </h3>
                <p className="text-gray-600 leading-7">
                  The server uses the raster conversion engine to decode the
                  WebP image and save the resulting pixels in TIFF format. The
                  TIFF writer uses LZW compression, which is lossless.
                </p>
              </div>

              <div className="rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Can converting to TIFF restore WebP quality?
                </h3>
                <p className="text-gray-600 leading-7">
                  No. Lossless TIFF compression avoids introducing another
                  lossy encoding stage, but it cannot reconstruct image detail
                  that was already discarded if the source WebP was encoded
                  using lossy compression.
                </p>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                WebP vs TIFF
              </h2>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="rounded-xl bg-green-50 border border-green-100 p-6">
                  <h3 className="font-semibold text-gray-900 mb-3">WebP</h3>
                  <ul className="space-y-2 text-gray-600">
                    <li>• Designed for efficient image delivery</li>
                    <li>• Can use lossy or lossless compression</li>
                    <li>• Can contain transparency</li>
                    <li>• Commonly used for web images</li>
                  </ul>
                </div>

                <div className="rounded-xl bg-slate-50 border border-slate-200 p-6">
                  <h3 className="font-semibold text-gray-900 mb-3">TIFF</h3>
                  <ul className="space-y-2 text-gray-600">
                    <li>• Common in imaging and publishing workflows</li>
                    <li>• Supports several compression methods</li>
                    <li>• This converter writes TIFF with LZW compression</li>
                    <li>• Useful when TIFF input is specifically required</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  What about WebP transparency?
                </h3>
                <p className="text-gray-600 leading-7">
                  WebP can contain an alpha channel for transparent pixels.
                  Whether transparency is present depends on the source image.
                  The raster conversion pipeline can carry compatible image
                  modes into TIFF, although format-specific features and
                  metadata should not be assumed to transfer identically.
                </p>
              </div>

              <div className="rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Why use LZW compression?
                </h3>
                <p className="text-gray-600 leading-7">
                  LZW reduces TIFF storage without intentionally discarding
                  pixel information. This makes it useful when you want TIFF
                  output without adding another lossy image-compression stage.
                </p>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                When is WebP to TIFF conversion useful?
              </h2>
              <p className="text-gray-600 leading-7 mb-4">
                WebP is efficient for browsers and websites, while some desktop,
                imaging, publishing, print, or document workflows may expect
                TIFF files. Conversion is useful when the receiving software or
                workflow specifically asks for TIFF rather than WebP.
              </p>

              <ul className="grid sm:grid-cols-2 gap-3 text-gray-600">
                {[
                  'Preparing a WebP image for software that expects TIFF',
                  'Moving a web image into an imaging or publishing workflow',
                  'Creating losslessly compressed TIFF output from decoded WebP pixels',
                  'Converting before importing into a TIFF-based workflow',
                ].map((item) => (
                  <li
                    key={item}
                    className="rounded-lg border border-gray-200 px-4 py-3"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-xl bg-amber-50 border border-amber-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-3">
                What the conversion does not guarantee
              </h2>
              <p className="text-gray-700 leading-7">
                Changing the container format does not increase the original
                image resolution or recreate detail lost through earlier lossy
                compression. File size may also increase because WebP and TIFF
                use different compression approaches. Format-specific metadata,
                animation, and other WebP features should not be assumed to
                transfer to a static TIFF output.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-5">
                WebP to TIFF FAQ
              </h2>

              <div className="space-y-4">
                {[
                  [
                    'Is the TIFF output lossless?',
                    'The TIFF writer uses LZW compression, which is lossless. This prevents an additional lossy TIFF compression stage after the WebP has been decoded.',
                  ],
                  [
                    'Will a lossy WebP become higher quality after conversion?',
                    'No. TIFF can store the decoded image without additional lossy compression, but it cannot restore information already removed from a lossy WebP source.',
                  ],
                  [
                    'Will the TIFF file be larger than the WebP?',
                    'It can be. WebP is designed for compact image delivery, while TIFF with LZW uses a different lossless compression approach. Final size depends on the source image and its pixel content.',
                  ],
                  [
                    'Does conversion resize my image?',
                    'The page does not provide resize controls. The conversion is intended to change the raster file format rather than deliberately change the image dimensions.',
                  ],
                  [
                    'How do I download the converted TIFF?',
                    'After conversion completes, click Download TIFF. The converted image is registered with the SimplifyConvert download-result flow and you are taken to its download page.',
                  ],
                ].map(([question, answer]) => (
                  <div
                    key={question}
                    className="rounded-xl border border-gray-200 p-5"
                  >
                    <h3 className="font-semibold text-gray-900 mb-2">
                      {question}
                    </h3>
                    <p className="text-gray-600 leading-7">{answer}</p>
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

