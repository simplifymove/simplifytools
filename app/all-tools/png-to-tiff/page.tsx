'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Download, ChevronRight, Loader, Image } from 'lucide-react';
import { ImageUploader } from '../../components/ImageUploader';
import { HomeHeader } from '../../components/HomeHeader';
import { Footer } from '../../components/Footer';
import { uploadBrowserDownloadResult } from "@/app/lib/download-result-client";
import { useRouter } from "next/navigation";

export default function PngToTiffPage() {
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
        from_format: 'png',
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
        toolSlug: "png-to-tiff",
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
              <span>PNG to TIFF</span>
            </div>

            {/* Title Section */}
            <div className="flex items-start gap-4 mb-6">
              <div className="p-3 bg-white/20 rounded-lg">
                <Image size={32} className="text-white" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">PNG to TIFF Converter</h1>
                <p className="text-lg text-white/90">Convert PNG images to TIFF format with lossless LZW compression for compatible image, archive, and print workflows.</p>
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
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Step 1: Upload PNG</h2>
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
                          alt="PNG Preview"
                          className="w-full rounded-lg border border-gray-200 object-cover max-h-64"
                        />
                        <div className="text-sm text-gray-600">
                          <p><strong>Format:</strong> PNG</p>
                          <p><strong>Size:</strong> {file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : '-'}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="h-64 bg-green-50 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                        <div className="text-center">
                          <p className="text-gray-500 text-sm">No image selected</p>
                          <p className="text-gray-400 text-xs mt-1">Upload a PNG to begin</p>
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
                      <li>• TIFF output for compatible print and image workflows</li>
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
                  <h3 className="font-semibold text-gray-900 mb-2">Why convert PNG to TIFF?</h3>
                  <p className="text-gray-600">TIFF supports lossless storage and is widely used in imaging, publishing, print, and archival workflows. Converting a PNG to TIFF can be useful when a workflow or application specifically requires TIFF input.</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Will my image lose quality?</h3>
                  <p className="text-gray-600">The TIFF output uses lossless compression. Image data supported by both formats is preserved without introducing lossy TIFF compression, although metadata or format-specific features may differ.</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">What size files can I convert?</h3>
                  <p className="text-gray-600">Image uploads are limited to 500MB by the current conversion API. Processing time and memory use can increase significantly with very large or high-resolution images.</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">How is PNG to TIFF different from other conversions?</h3>
                  <p className="text-gray-600">PNG images with transparency can be represented in TIFF when supported by the source image mode and conversion pipeline. Format-specific metadata or features may not transfer identically.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <section className="bg-white border-t border-gray-200 px-4 md:px-8 py-14">
          <div className="max-w-6xl mx-auto space-y-10">

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                How to convert PNG to TIFF online
              </h2>
              <p className="text-gray-600 leading-7">
                Upload a PNG image and click Convert to TIFF. The image is sent
                to the server and converted with the raster conversion engine.
                TIFF output is written using lossless LZW compression. When the
                conversion finishes, use Download TIFF to continue to the
                download page and save the converted file.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="border border-gray-200 rounded-xl p-6">
                <h3 className="font-bold text-gray-900 mb-2">
                  What happens during PNG to TIFF conversion?
                </h3>
                <p className="text-sm text-gray-600 leading-6">
                  The uploaded PNG is opened by the server-side raster
                  conversion engine and saved as a TIFF image. This converter
                  does not request resizing or lossy TIFF quality settings, and
                  the TIFF file is written with LZW compression.
                </p>
              </div>

              <div className="border border-gray-200 rounded-xl p-6">
                <h3 className="font-bold text-gray-900 mb-2">
                  Does PNG transparency remain available?
                </h3>
                <p className="text-sm text-gray-600 leading-6">
                  PNG images can contain an alpha channel for transparency.
                  The current PNG to TIFF conversion does not intentionally
                  flatten that alpha channel before saving the TIFF, allowing
                  compatible TIFF image modes to retain transparency.
                </p>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                PNG vs TIFF
              </h2>

              <div className="overflow-x-auto border border-gray-200 rounded-xl">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 text-gray-900">
                    <tr>
                      <th className="p-4 font-semibold">Feature</th>
                      <th className="p-4 font-semibold">PNG</th>
                      <th className="p-4 font-semibold">TIFF output</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 text-gray-600">
                    <tr>
                      <td className="p-4 font-medium text-gray-900">Compression</td>
                      <td className="p-4">Lossless PNG compression</td>
                      <td className="p-4">Lossless LZW compression</td>
                    </tr>
                    <tr>
                      <td className="p-4 font-medium text-gray-900">Transparency</td>
                      <td className="p-4">Alpha transparency supported</td>
                      <td className="p-4">Can retain compatible alpha data</td>
                    </tr>
                    <tr>
                      <td className="p-4 font-medium text-gray-900">Typical use</td>
                      <td className="p-4">Web graphics and general image use</td>
                      <td className="p-4">Imaging, print and archival workflows</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-slate-50 rounded-xl p-6">
                <h3 className="font-bold text-gray-900 mb-2">
                  Why use LZW compression?
                </h3>
                <p className="text-sm text-gray-600 leading-6">
                  LZW is a lossless TIFF compression method. It reduces stored
                  image data without intentionally introducing the compression
                  artifacts associated with lossy formats such as JPEG.
                </p>
              </div>

              <div className="bg-slate-50 rounded-xl p-6">
                <h3 className="font-bold text-gray-900 mb-2">
                  Will TIFF be smaller than PNG?
                </h3>
                <p className="text-sm text-gray-600 leading-6">
                  Not necessarily. PNG and TIFF LZW use different lossless
                  compression approaches, so the resulting TIFF may be larger
                  or smaller depending on the image content, dimensions and
                  source encoding.
                </p>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                When is PNG to TIFF conversion useful?
              </h2>
              <p className="text-gray-600 leading-7 mb-4">
                TIFF remains common in workflows that expect TIFF files rather
                than web-oriented image formats. Converting can be useful when
                preparing PNG artwork, scans, diagrams or other raster images
                for software and workflows that specifically request TIFF.
              </p>

              <ul className="grid sm:grid-cols-2 gap-3 text-sm text-gray-600">
                {[
                  'Preparing raster images for TIFF-based workflows',
                  'Using PNG artwork in publishing or print software',
                  'Creating a losslessly compressed TIFF copy',
                  'Converting transparent PNG images for compatible TIFF workflows',
                  'Supplying TIFF when an application requires the format',
                  'Moving raster images between different imaging workflows',
                ].map((item) => (
                  <li
                    key={item}
                    className="border border-gray-200 rounded-lg px-4 py-3"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                What the conversion does not change
              </h2>
              <p className="text-gray-600 leading-7">
                This tool changes the image container and compression used for
                the output. The page does not request resizing, sharpening,
                upscaling or other image enhancement. Converting to TIFF also
                does not create additional visual detail beyond the pixels
                already present in the PNG.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                PNG to TIFF FAQ
              </h2>

              <div className="space-y-4">
                {[
                  [
                    'Is PNG to TIFF conversion lossless?',
                    'The current TIFF output uses LZW, which is a lossless TIFF compression method. The converter does not intentionally apply lossy TIFF compression.',
                  ],
                  [
                    'Does converting PNG to TIFF improve image quality?',
                    'No. Conversion changes the file format but does not create new image detail or increase the source resolution.',
                  ],
                  [
                    'Can a transparent PNG be converted to TIFF?',
                    'Yes. The current raster conversion does not intentionally flatten PNG alpha data when TIFF is the target, although how transparency is displayed can depend on the software opening the TIFF.',
                  ],
                  [
                    'Does the converter resize my PNG?',
                    'No resize option is requested by this PNG to TIFF page, so the conversion is intended to retain the source image dimensions.',
                  ],
                  [
                    'Why can the TIFF file be larger?',
                    'Different lossless compression methods produce different file sizes. TIFF also has its own container structure, so a TIFF is not guaranteed to be smaller than its PNG source.',
                  ],
                  [
                    'What is the current upload limit?',
                    'The conversion API currently applies a 500MB limit to image uploads.',
                  ],
                ].map(([question, answer]) => (
                  <div
                    key={question}
                    className="border border-gray-200 rounded-xl p-5"
                  >
                    <h3 className="font-semibold text-gray-900 mb-2">
                      {question}
                    </h3>
                    <p className="text-sm text-gray-600 leading-6">
                      {answer}
                    </p>
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

