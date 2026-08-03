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
                <p className="text-lg text-white/90">Convert PNG images to TIFF format with lossless compression. Perfect for archival, professional printing, and quality-sensitive applications.</p>
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
                      <li>• Professional quality for printing</li>
                      <li>• Support for multiple layers</li>
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
                  <p className="text-gray-600">TIFF provides lossless compression and is the industry standard for archival and professional printing. If you need maximum compatibility with professional design and printing workflows, TIFF is the ideal choice.</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Will my image lose quality?</h3>
                  <p className="text-gray-600">The TIFF output uses lossless compression. Image data supported by both formats is preserved without introducing lossy TIFF compression, although metadata or format-specific features may differ.</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">What size files can I convert?</h3>
                  <p className="text-gray-600">You can convert files up to 500MB in size. For best performance, we recommend keeping files under 100MB.</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">How is PNG to TIFF different from other conversions?</h3>
                  <p className="text-gray-600">PNG images with transparency can be represented in TIFF when supported by the source image mode and conversion pipeline. Format-specific metadata or features may not transfer identically.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

