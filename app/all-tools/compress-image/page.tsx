'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Download, ChevronRight, Loader, FileUp } from 'lucide-react';
import { ImageUploader } from '../../components/ImageUploader';
import { compressImage } from '../../lib/imageTools';
import { HomeHeader } from '../../components/HomeHeader';
import { Footer } from '../../components/Footer';
import { useImageToolErrors } from '@/app/hooks/useImageToolErrors';
import {
  validateImageNotEmpty,
  validateImageExtension,
  validateImageMimeType,
  validateImageFileSize,
  validateCompressionQuality,
} from '@/app/utils/validation/image-validation';
import { ImageToolErrorType } from '@/app/utils/types/errors';
import { ErrorAlert } from '@/app/components/error-components';
import { useRouter } from 'next/navigation';
import { uploadBrowserDownloadResult } from '@/app/lib/download-result-client';
import { PriorityToolGuide } from '@/app/components/PriorityToolGuide';

const TOOL_ID = 'compress-image';
const TOOL_NAME = 'Compress Image';

export default function CompressImagePage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [quality, setQuality] = useState(0.7);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<Blob | null>(null);
  const [originalSize, setOriginalSize] = useState(0);
  const [compressedSize, setCompressedSize] = useState(0);
  const { error, clearError, createError } = useImageToolErrors();

  const handleFileSelect = (selectedFile: File) => {
    clearError();
    setFile(selectedFile);
    setOriginalSize(selectedFile.size);
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
    setOriginalSize(0);
    setCompressedSize(0);
    clearError();
  };

  const handleCompress = async () => {
    if (!file) {
      createError(
        ImageToolErrorType.EMPTY_FILE,
        TOOL_ID,
        TOOL_NAME,
        { file: null }
      );
      return;
    }

    clearError();

    // Validate file
    const emptyCheck = validateImageNotEmpty(file);
    if (!emptyCheck.valid) {
      createError(
        ImageToolErrorType.EMPTY_FILE,
        TOOL_ID,
        TOOL_NAME,
        { file },
        {
          filename: file.name,
          size: file.size,
          mimeType: file.type,
        }
      );
      return;
    }

    const extensionCheck = validateImageExtension(file.name);
    if (!extensionCheck.valid) {
      createError(
        ImageToolErrorType.UNSUPPORTED_FORMAT,
        TOOL_ID,
        TOOL_NAME,
        { file },
        {
          filename: file.name,
          size: file.size,
          mimeType: file.type,
        }
      );
      return;
    }

    const mimeCheck = validateImageMimeType(file);
    if (!mimeCheck.valid) {
      createError(
        ImageToolErrorType.INVALID_MIME_TYPE,
        TOOL_ID,
        TOOL_NAME
      );
      return;
    }

    const sizeCheck = validateImageFileSize(file, TOOL_ID);
    if (!sizeCheck.valid) {
      createError(
        ImageToolErrorType.FILE_TOO_LARGE,
        TOOL_ID,
        TOOL_NAME,
        { maxSize: sizeCheck.error },
        {
          filename: file.name,
          size: file.size,
          mimeType: file.type,
        }
      );
      return;
    }

    const qualityCheck = validateCompressionQuality(quality);
    if (!qualityCheck.valid) {
      createError(
        ImageToolErrorType.INVALID_QUALITY,
        TOOL_ID,
        TOOL_NAME,
        { quality }
      );
      return;
    }

    setProcessing(true);
    try {
      const result = await compressImage(file, quality);
      setCompressedSize(result.blob.size);
      setResult(result.blob);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error occurred';
      createError(
        ImageToolErrorType.COMPRESSION_FAILED,
        TOOL_ID,
        TOOL_NAME,
        { error: errorMsg },
        {
          filename: file.name,
          size: file.size,
          mimeType: file.type,
        }
      );
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = async () => {
    if (!result || processing) return;


    setProcessing(true);

    try {
      const downloadResult =
        await uploadBrowserDownloadResult({
          blob: result,
          toolSlug: 'compress-image',
          originalName: 'compressed.jpg',
          outputName: 'compressed.jpg',
        });

      router.push(downloadResult.downloadPageUrl);
    } catch (caughtError) {
      console.error('Download preparation failed:', caughtError);
      window.alert(
        caughtError instanceof Error
          ? caughtError.message
          : 'Unable to prepare the download.',
      );
    } finally {
      setProcessing(false);
    }
  };

  const reduction = originalSize > 0 ? (((originalSize - compressedSize) / originalSize) * 100).toFixed(1) : 0;

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
              <span>Image Compressor</span>
            </div>

            {/* Title Section */}
            <div className="flex items-start gap-4">
              <div className="p-3 bg-white/20 rounded-lg">
                <FileUp size={32} className="text-white" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">Image Compressor</h1>
                <p className="text-lg text-white/90">Re-encode one image at its original dimensions with an adjustable browser quality setting.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 py-12 px-4 md:px-8">
          <div className="max-w-6xl mx-auto">
            {/* Error Alert */}
            {error && (
              <div className="mb-6">
                <ErrorAlert
                  error={error}
                  onDismiss={clearError}
                />
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Upload Section - Left (2 cols) */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Step 1: Upload Image</h2>
                  <ImageUploader
                    onFileSelect={handleFileSelect}
                    preview={preview}
                    onClearPreview={handleClearPreview}
                  />
                  {originalSize > 0 && (
                    <p className="mt-4 text-sm text-gray-600">
                      Original size: <span className="font-semibold text-gray-900">{(originalSize / 1024).toFixed(2)} KB</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Controls - Right (sticky sidebar) */}
              <div className="lg:col-span-1">
                <div className="sticky top-4 space-y-4">
                  {/* Options */}
                  <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <h3 className="font-semibold text-gray-900 mb-4">Compression Settings</h3>

                    {/* Quality Slider */}
                    <div>
                      <label className="text-sm font-medium text-gray-700 block mb-2">
                        Quality: {Math.round(quality * 100)}%
                      </label>
                      <input
                        type="range"
                        min="0.1"
                        max="1"
                        step="0.05"
                        value={quality}
                        onChange={(e) => setQuality(parseFloat(e.target.value))}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-2">
                        <span>Smallest</span>
                        <span>Balanced</span>
                        <span>Best</span>
                      </div>
                    </div>
                  </div>

                  {/* Compress Button */}
                  <button
                    onClick={handleCompress}
                    disabled={!file || processing}
                    className="w-full py-3 px-6 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2"
                  >
                    {processing ? (
                      <>
                        <Loader size={20} className="animate-spin" />
                        Compressing...
                      </>
                    ) : (
                      'Compress Image'
                    )}
                  </button>

                  {/* Download Button */}
                  {result && (
                    <button
                      onClick={handleDownload}
                      className="w-full py-3 px-6 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2"
                    >
                      <Download size={20} />
                      Download Image
                    </button>
                  )}

                  {/* Result Box */}
                  {result && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <h4 className="font-semibold text-green-900 mb-3">✓ Compression Complete!</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-700">Original:</span>
                          <span className="font-medium text-gray-900">{(originalSize / 1024).toFixed(2)} KB</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-700">Compressed:</span>
                          <span className="font-medium text-green-600">{(compressedSize / 1024).toFixed(2)} KB</span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden mt-2">
                          <div
                            className="h-full bg-green-500"
                            style={{ width: `${Math.max(20, ((originalSize - compressedSize) / originalSize) * 100)}%` }}
                          />
                        </div>
                        <div className="text-center font-semibold text-green-600 text-xs">
                          Reduced by {reduction}%
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Info Box */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-900 mb-2">About</h3>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Browser-based image compression</li>
                      <li>• Adjustable quality settings</li>
                      <li>• Compare output size and visible artifacts</li>
                      <li>• Compression runs with browser Canvas</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <PriorityToolGuide toolId="compress-image" />
      <Footer />
      {false && (<>

      {/* How To Section */}
      <div className="py-12 px-4 md:px-8 bg-white border-t border-gray-200">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">How to Compress Images</h2>
          <div className="space-y-4">
            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold text-sm">1</div>
              <div><p className="text-gray-700"><strong>Upload your image:</strong> Select any JPG, PNG, or WebP image</p></div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold text-sm">2</div>
              <div><p className="text-gray-700"><strong>Adjust quality slider:</strong> Choose compression level from 10% (smallest) to 100% (best quality)</p></div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold text-sm">3</div>
              <div><p className="text-gray-700"><strong>Click Compress Image:</strong> Apply the selected browser encoding settings</p></div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold text-sm">4</div>
              <div><p className="text-gray-700"><strong>Download your result:</strong> Save your compressed image and check the file size reduction</p></div>
            </div>
          </div>
        </div>
      </div>

      {/* Use Cases Section */}
      <div className="py-12 px-4 md:px-8 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Benefits of Image Compression</h2>
          <ul className="space-y-3 text-gray-700">
            <li className="flex gap-2"><span className="text-orange-500 font-bold">•</span> Faster website loading - compressed images load 50% faster</li>
            <li className="flex gap-2"><span className="text-orange-500 font-bold">•</span> Save storage space - reduce backup and cloud storage needs</li>
            <li className="flex gap-2"><span className="text-orange-500 font-bold">•</span> Better for email - smaller files can be easier to attach and send</li>
            <li className="flex gap-2"><span className="text-orange-500 font-bold">•</span> Social media optimization - upload faster on Instagram, Facebook, Twitter</li>
            <li className="flex gap-2"><span className="text-orange-500 font-bold">•</span> Mobile friendly - reduce data usage for users on limited connections</li>
          </ul>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="py-12 px-4 md:px-8 bg-white border-t border-gray-200">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <details className="p-4 bg-white border border-gray-200 rounded-lg cursor-pointer group">
              <summary className="font-semibold text-gray-900 flex justify-between items-center">
                Will compression reduce image quality?
                <span className="text-gray-500 group-open:hidden">+</span>
                <span className="text-gray-500 hidden group-open:inline">−</span>
              </summary>
              <p className="text-gray-700 mt-3 text-sm">Yes, but intelligently. Using quality settings 75-85%, you'll see minimal quality loss while achieving significant file size reduction. Our compression algorithm uses smart techniques to preserve important details.</p>
            </details>

            <details className="p-4 bg-white border border-gray-200 rounded-lg cursor-pointer group">
              <summary className="font-semibold text-gray-900 flex justify-between items-center">
                What quality setting should I use?
                <span className="text-gray-500 group-open:hidden">+</span>
                <span className="text-gray-500 hidden group-open:inline">−</span>
              </summary>
              <p className="text-gray-700 mt-3 text-sm">For web use and social media: 70-75%. For higher visual fidelity: consider a higher quality setting. For stronger compression with acceptable quality: 60-70%. Start with 75% and adjust based on your needs.</p>
            </details>

            <details className="p-4 bg-white border border-gray-200 rounded-lg cursor-pointer group">
              <summary className="font-semibold text-gray-900 flex justify-between items-center">
                What file formats are supported?
                <span className="text-gray-500 group-open:hidden">+</span>
                <span className="text-gray-500 hidden group-open:inline">−</span>
              </summary>
              <p className="text-gray-700 mt-3 text-sm">We support JPG, PNG, WebP, GIF, and most common image formats. Maximum file size is 50MB. All formats are compressed in your browser.</p>
            </details>

            <details className="p-4 bg-white border border-gray-200 rounded-lg cursor-pointer group">
              <summary className="font-semibold text-gray-900 flex justify-between items-center">
                Can I compress multiple images at once?
                <span className="text-gray-500 group-open:hidden">+</span>
                <span className="text-gray-500 hidden group-open:inline">−</span>
              </summary>
              <p className="text-gray-700 mt-3 text-sm">Currently, this tool processes one image at a time. For batch compression of multiple images, try our Batch Compress Images tool which handles hundreds of files simultaneously.</p>
            </details>

            <details className="p-4 bg-white border border-gray-200 rounded-lg cursor-pointer group">
              <summary className="font-semibold text-gray-900 flex justify-between items-center">
                Are my images stored on your servers?
                <span className="text-gray-500 group-open:hidden">+</span>
                <span className="text-gray-500 hidden group-open:inline">−</span>
              </summary>
              <p className="text-gray-700 mt-3 text-sm">The image compression step itself is performed with browser-based processing.</p>
            </details>

            <details className="p-4 bg-white border border-gray-200 rounded-lg cursor-pointer group">
              <summary className="font-semibold text-gray-900 flex justify-between items-center">
                Is image compression really free?
                <span className="text-gray-500 group-open:hidden">+</span>
                <span className="text-gray-500 hidden group-open:inline">−</span>
              </summary>
              <p className="text-gray-700 mt-3 text-sm">You can use the compression controls to process supported images and compare the resulting file size.</p>
            </details>
          </div>
        </div>
      </div>

      {/* FAQ Schema */}
      <script type="application/ld+json">{JSON.stringify({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "Will compression reduce image quality?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes, but intelligently using smart compression techniques to preserve important details. Quality settings 75-85% provide minimal visible loss."
            }
          },
          {
            "@type": "Question",
            "name": "What quality setting should I use?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Lower quality settings usually reduce file size more, while higher settings generally retain more visible detail."
            }
          },
          {
            "@type": "Question",
            "name": "What file formats are supported?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "We support JPG, PNG, WebP, GIF, and most common image formats up to 50MB."
            }
          },
          {
            "@type": "Question",
            "name": "Can I compress multiple images at once?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Currently one at a time. For batch compression, try our Batch Compress Images tool."
            }
          },
          {
            "@type": "Question",
            "name": "Are my images stored on your servers?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "The image compression step itself uses browser-based processing."
            }
          },
          {
            "@type": "Question",
            "name": "Is image compression really free?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "You can use the compression controls to process supported images and compare the resulting file size."
            }
          }
        ]
      })}</script>

      {/* Related Tools */}
      <div className="py-12 px-4 md:px-8 bg-gray-50 border-t border-gray-200">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Related Image Tools</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <Link href="/all-tools/resize-image" className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-200 hover:border-orange-500 hover:shadow-md transition">
              <span className="text-orange-600 font-bold">→</span>
              <div><span className="text-gray-900 font-medium hover:text-orange-600">Image Resizer</span><p className="text-xs text-gray-600">Change image dimensions</p></div>
            </Link>
            <Link href="/all-tools/jpg-to-png" className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-200 hover:border-orange-500 hover:shadow-md transition">
              <span className="text-orange-600 font-bold">→</span>
              <div><span className="text-gray-900 font-medium hover:text-orange-600">JPG to PNG Converter</span><p className="text-xs text-gray-600">Convert image formats</p></div>
            </Link>
            <Link href="/all-tools/crop-image" className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-200 hover:border-orange-500 hover:shadow-md transition">
              <span className="text-orange-600 font-bold">→</span>
              <div><span className="text-gray-900 font-medium hover:text-orange-600">Crop Image</span><p className="text-xs text-gray-600">Remove unwanted areas</p></div>
            </Link>
            <Link href="/all-tools/batch-compress-images" className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-200 hover:border-orange-500 hover:shadow-md transition">
              <span className="text-orange-600 font-bold">→</span>
              <div><span className="text-gray-900 font-medium hover:text-orange-600">Batch Compress Images</span><p className="text-xs text-gray-600">Compress multiple files</p></div>
            </Link>
          </div>
        </div>
      </div>
      </>)}
    </>
  );
}





