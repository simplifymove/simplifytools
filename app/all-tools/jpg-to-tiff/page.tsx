'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Download, ChevronRight, Loader, Image } from 'lucide-react';
import { HomeHeader } from '../../components/HomeHeader';
import { Footer } from '../../components/Footer';
import { ImageUploader } from '../../components/ImageUploader';
import { useImageToolErrors } from '@/app/hooks/useImageToolErrors';
import { ErrorAlert } from '@/app/components/error-components';
import { ImageToolErrorType } from '@/app/utils/types/errors';
import { uploadBrowserDownloadResult } from "@/app/lib/download-result-client";
import { useRouter } from "next/navigation";

const TOOL_ID = 'jpg-to-tiff';
const TOOL_NAME = 'JPG to TIFF';

export default function JpgToTiffPage() {
    const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const { error, clearError, createError } = useImageToolErrors();

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    clearError();
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
    clearError();
  };

  const handleConvert = async () => {
    if (!file) return;
    
    setProcessing(true);
    clearError();
    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('config', JSON.stringify({
        from_format: 'jpg',
        to_format: 'tiff',
        options: {
          quality: 100,
        },
      }));

      const response = await fetch('/api/convert', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        createError(
          ImageToolErrorType.SHARP_FAILED,
          TOOL_ID,
          TOOL_NAME,
          { error: errorData.error || 'Conversion failed' },
          { filename: file.name, size: file.size, mimeType: file.type }
        );
        return;
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
    } catch (error) {
      createError(
        ImageToolErrorType.SHARP_FAILED,
        TOOL_ID,
        TOOL_NAME,
        { error: error instanceof Error ? error.message : 'Error converting image' },
        { filename: file?.name, size: file?.size, mimeType: file?.type }
      );
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = async () => {

      if (!downloadUrl) return;

      const blob = await fetch(downloadUrl).then((response) => response.blob());

      const downloadResult = await uploadBrowserDownloadResult({
        blob,
        toolSlug: "jpg-to-tiff",
        originalName: "converted.tiff",
        outputName: "converted.tiff",
      });

      router.push(downloadResult.downloadPageUrl);
  };

  return (
    <>
      <HomeHeader />
      <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex flex-col">
      {/* Error Display */}
      {error && <ErrorAlert error={error} onDismiss={clearError} />}
      
      {/* Hero Header */}
      <div className="relative bg-orange-500 py-16 px-4 md:px-8 overflow-hidden">
        <div className="max-w-6xl mx-auto relative z-10">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-white/90 text-sm mb-6">
            <Link href="/" className="hover:text-white transition">Home</Link>
            <ChevronRight size={16} />
            <Link href="/all-tools" className="hover:text-white transition">All Tools</Link>
            <ChevronRight size={16} />
            <span>JPG to TIFF</span>
          </div>

          {/* Title Section */}
          <div className="flex items-start gap-4 mb-6">
            <div className="p-3 bg-white/20 rounded-lg">
              <Image size={32} className="text-white" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">JPG to TIFF Converter</h1>
              <p className="text-lg text-white/90">Convert JPG images to TIFF format with lossless compression. Perfect for archival and professional printing.</p>
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
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Step 1: Upload JPG</h2>
                <ImageUploader
                  onFileSelect={handleFileSelect}
                  preview={preview}
                  onClearPreview={handleClearPreview}
                />
                {error && <ErrorAlert error={error} onDismiss={clearError} />}
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
                        alt="JPG Preview"
                        className="w-full rounded-lg border border-gray-200 object-cover max-h-64"
                      />
                      <div className="text-sm text-gray-600">
                        <p><strong>Format:</strong> JPG</p>
                        <p><strong>Size:</strong> {file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : '-'}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="h-64 bg-orange-50 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                      <div className="text-center">
                        <p className="text-gray-500 text-sm">No image selected</p>
                        <p className="text-gray-400 text-xs mt-1">Upload a JPG to begin</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Convert Button */}
                <button
                  onClick={handleConvert}
                  disabled={!file || processing}
                  className="w-full px-6 py-3 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
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
                    className="w-full mt-3 px-4 py-3 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-all flex items-center justify-center gap-2"
                  >
                    <Download size={18} />
                    Download TIFF
                  </button>
                )}

                {/* Info */}
                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-xs text-blue-700 mb-2">
                    <strong>💡 TIFF Benefits:</strong>
                  </p>
                  <ul className="text-xs text-blue-700 space-y-1">
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
                <h3 className="font-semibold text-gray-900 mb-2">Why convert JPG to TIFF?</h3>
                <p className="text-gray-600">TIFF provides lossless compression, making it ideal for archival, professional printing, and quality-sensitive applications. JPG uses lossy compression which can degrade image quality.</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Will my image lose quality?</h3>
                <p className="text-gray-600">No! Our converter maintains 100% quality during conversion. TIFF supports lossless compression, so your image will retain all original details from the JPG source.</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">What size files can I convert?</h3>
                <p className="text-gray-600">You can convert files up to 500MB in size. For best performance, we recommend keeping files under 100MB.</p>
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

