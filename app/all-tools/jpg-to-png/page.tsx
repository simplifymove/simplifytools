'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Download, ChevronRight, Loader, Image, CheckCircle } from 'lucide-react';
import { ImageUploader } from '../../components/ImageUploader';
import { convertImageFormat } from '../../lib/imageTools';
import { HomeHeader } from '../../components/HomeHeader';
import { Footer } from '../../components/Footer';
import { useImageToolErrors } from '@/app/hooks/useImageToolErrors';
import { ErrorAlert } from '@/app/components/error-components';
import {
  validateImageNotEmpty,
  validateImageExtension,
  validateImageMimeType,
  validateImageFileSize,
} from '@/app/utils/validation/image-validation';
import { ImageToolErrorType } from '@/app/utils/types/errors';
import { uploadBrowserDownloadResult } from '@/app/lib/download-result-client';

const TOOL_ID = 'jpg-to-png';
const TOOL_NAME = 'JPG to PNG Converter';

export default function JpgToPngPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<Blob | null>(null);
  const { error, clearError, createError } = useImageToolErrors();

  const handleFileSelect = (selectedFile: File) => {
    clearError();

    // Validate file
    const emptyCheck = validateImageNotEmpty(selectedFile);
    if (!emptyCheck.valid) {
      createError(
        ImageToolErrorType.EMPTY_FILE,
        TOOL_ID,
        TOOL_NAME,
        { file: selectedFile }
      );
      return;
    }

    const extensionCheck = validateImageExtension(selectedFile.name);
    if (!extensionCheck.valid) {
      createError(
        ImageToolErrorType.UNSUPPORTED_FORMAT,
        TOOL_ID,
        TOOL_NAME,
        { file: selectedFile }
      );
      return;
    }

    const mimeCheck = validateImageMimeType(selectedFile);
    if (!mimeCheck.valid) {
      createError(
        ImageToolErrorType.INVALID_MIME_TYPE,
        TOOL_ID,
        TOOL_NAME,
        { file: selectedFile }
      );
      return;
    }

    const sizeCheck = validateImageFileSize(selectedFile, TOOL_ID);
    if (!sizeCheck.valid) {
      createError(
        ImageToolErrorType.FILE_TOO_LARGE,
        TOOL_ID,
        TOOL_NAME,
        { file: selectedFile },
        { filename: selectedFile.name, size: selectedFile.size, mimeType: selectedFile.type }
      );
      return;
    }

    setFile(selectedFile);
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.onerror = () => {
      createError(
        ImageToolErrorType.FILE_CORRUPTED,
        TOOL_ID,
        TOOL_NAME,
        { file: selectedFile }
      );
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleClearPreview = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    clearError();
  };

  const handleConvert = async () => {
    if (!file) {
      createError(
        ImageToolErrorType.EMPTY_FILE,
        TOOL_ID,
        TOOL_NAME
      );
      return;
    }

    setProcessing(true);
    clearError();
    try {
      const result = await convertImageFormat(file, 'image/png');
      setResult(result.blob);
    } catch (err) {
      createError(
        ImageToolErrorType.SHARP_FAILED,
        TOOL_ID,
        TOOL_NAME,
        { file }
      );
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = async () => {
    if (!result || !file) return;

    setProcessing(true);
    clearError();

    try {
      const baseName =
        file.name.replace(/\.[^.]+$/, '').trim() || 'converted-image';

      const downloadResult = await uploadBrowserDownloadResult({
        blob: result,
        toolSlug: TOOL_ID,
        originalName: file.name,
        outputName: `${baseName}.png`,
      });

      router.push(downloadResult.downloadPageUrl);
    } catch {
      createError(
        ImageToolErrorType.SHARP_FAILED,
        TOOL_ID,
        TOOL_NAME,
        { file },
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
              <span>JPG to PNG</span>
            </div>

            {/* Title Section */}
            <div className="flex items-start gap-4 mb-6">
              <div className="p-3 bg-white/20 rounded-lg">
                <Image size={32} className="text-white" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">JPG to PNG Converter</h1>
                <p className="text-lg text-white/90">Convert JPG images to PNG with full transparency support. Perfect for graphics, logos, and images with transparent backgrounds. No signup required.</p>
              </div>
            </div>
          </div>
        </div>

      {/* Main Content */}
      <div className="flex-1 py-12 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          {error && <ErrorAlert error={error} onDismiss={clearError} />}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Upload Section - Left (2 cols) */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Step 1: Upload JPG</h2>
                <ImageUploader
                  onFileSelect={handleFileSelect}
                  preview={preview}
                  onClearPreview={handleClearPreview}
                  toolId={TOOL_ID}
                  onValidationError={() => {}}
                />
              </div>
            </div>

            {/* Controls - Right (sticky sidebar) */}
            <div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-4">
                <h3 className="text-lg font-bold text-gray-900 mb-6">Preview & Convert</h3>

                {/* Image Preview */}
                <div className="mb-6">
                  {result ? (
                    <div className="space-y-4">
                      <img
                        src={result as any}
                        alt="Converted PNG"
                        className="w-full rounded-lg border border-gray-200 object-cover"
                      />
                      <button
                        onClick={handleDownload}
                        disabled={processing}
                        className="w-full px-4 py-3 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                      >
                        {processing ? (
                          <>
                            <Loader size={18} className="animate-spin" />
                            Preparing Download...
                          </>
                        ) : (
                          <>
                            <Download size={18} />
                            Continue to Download
                          </>
                        )}
                      </button>
                    </div>
                  ) : (
                    <div className="h-64 bg-orange-50 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                      <div className="text-center">
                        <p className="text-gray-500 text-sm">Image preview will appear here</p>
                        <p className="text-gray-400 text-xs mt-1">Click "Convert" to process</p>
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
                      Convert to PNG
                    </>
                  )}
                </button>

                {/* Info */}
                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-xs text-blue-700">
                    <strong>💡 PNG Benefits:</strong> Lossless compression, transparency support, perfect for graphics.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* How To Section */}
      <div className="py-12 px-4 md:px-8 bg-white border-t border-gray-200">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">How to Convert JPG to PNG</h2>
          <div className="space-y-4">
            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold text-sm">1</div>
              <div><p className="text-gray-700"><strong>Upload your JPG file:</strong> Click the upload area and select your JPG image</p></div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold text-sm">2</div>
              <div><p className="text-gray-700"><strong>Click Convert to PNG:</strong> The tool will process your image instantly</p></div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold text-sm">3</div>
              <div><p className="text-gray-700"><strong>Download your PNG:</strong> Click the download button to save your file</p></div>
            </div>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="py-12 px-4 md:px-8 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Benefits of Converting to PNG</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex gap-3">
              <CheckCircle className="text-green-500 flex-shrink-0" size={24} />
              <div><h3 className="font-semibold text-gray-900">Transparency Support</h3><p className="text-gray-600 text-sm">PNG supports transparent backgrounds, perfect for overlays and graphics</p></div>
            </div>
            <div className="flex gap-3">
              <CheckCircle className="text-green-500 flex-shrink-0" size={24} />
              <div><h3 className="font-semibold text-gray-900">Lossless Compression</h3><p className="text-gray-600 text-sm">No quality loss when saving, ideal for archiving and editing</p></div>
            </div>
            <div className="flex gap-3">
              <CheckCircle className="text-green-500 flex-shrink-0" size={24} />
              <div><h3 className="font-semibold text-gray-900">Better for Graphics</h3><p className="text-gray-600 text-sm">Superior quality for logos, illustrations, and text-heavy images</p></div>
            </div>
            <div className="flex gap-3">
              <CheckCircle className="text-green-500 flex-shrink-0" size={24} />
              <div><h3 className="font-semibold text-gray-900">Universal Support</h3><p className="text-gray-600 text-sm">PNG is supported by all modern browsers and applications</p></div>
            </div>
          </div>
        </div>
      </div>

      {/* Use Cases */}
      <div className="py-12 px-4 md:px-8 bg-white border-t border-gray-200">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Common Use Cases for JPG to PNG Conversion</h2>
          <ul className="space-y-3 text-gray-700">
            <li className="flex gap-2"><span className="text-orange-500 font-bold">•</span> Converting logo files to transparent PNG for web design</li>
            <li className="flex gap-2"><span className="text-orange-500 font-bold">•</span> Creating stickers or graphics with transparent backgrounds</li>
            <li className="flex gap-2"><span className="text-orange-500 font-bold">•</span> Preparing product images for e-commerce with transparency</li>
            <li className="flex gap-2"><span className="text-orange-500 font-bold">•</span> Archiving images without quality loss</li>
            <li className="flex gap-2"><span className="text-orange-500 font-bold">•</span> Using images as overlays in photo editing software</li>
          </ul>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="py-12 px-4 md:px-8 bg-gray-50 border-t border-gray-200">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <details className="p-4 bg-white border border-gray-200 rounded-lg cursor-pointer group">
              <summary className="font-semibold text-gray-900 flex justify-between items-center">
                Will converting JPG to PNG reduce image quality?
                <span className="text-gray-500 group-open:hidden">+</span>
                <span className="text-gray-500 hidden group-open:inline">−</span>
              </summary>
              <p className="text-gray-700 mt-3 text-sm">No, PNG uses lossless compression. Your image quality will remain the same as the original JPG. The only change is the file format and transparency support.</p>
            </details>

            <details className="p-4 bg-white border border-gray-200 rounded-lg cursor-pointer group">
              <summary className="font-semibold text-gray-900 flex justify-between items-center">
                What file size limits exist for conversion?
                <span className="text-gray-500 group-open:hidden">+</span>
                <span className="text-gray-500 hidden group-open:inline">−</span>
              </summary>
              <p className="text-gray-700 mt-3 text-sm">Our tool supports images up to 50MB in size. For most common use cases, your files will be well below this limit.</p>
            </details>

            <details className="p-4 bg-white border border-gray-200 rounded-lg cursor-pointer group">
              <summary className="font-semibold text-gray-900 flex justify-between items-center">
                Are my files stored on your servers?
                <span className="text-gray-500 group-open:hidden">+</span>
                <span className="text-gray-500 hidden group-open:inline">−</span>
              </summary>
              <p className="text-gray-700 mt-3 text-sm">No, conversion happens in your browser. Files are not uploaded to our servers and are automatically deleted after download.</p>
            </details>

            <details className="p-4 bg-white border border-gray-200 rounded-lg cursor-pointer group">
              <summary className="font-semibold text-gray-900 flex justify-between items-center">
                Why would PNG files be larger than JPG files?
                <span className="text-gray-500 group-open:hidden">+</span>
                <span className="text-gray-500 hidden group-open:inline">−</span>
              </summary>
              <p className="text-gray-700 mt-3 text-sm">PNG uses lossless compression while JPG uses lossy compression. This means PNG may be larger, but preserves every pixel exactly. For photos, JPG is usually smaller; for graphics, PNG is better.</p>
            </details>

            <details className="p-4 bg-white border border-gray-200 rounded-lg cursor-pointer group">
              <summary className="font-semibold text-gray-900 flex justify-between items-center">
                Can I batch convert multiple JPG files at once?
                <span className="text-gray-500 group-open:hidden">+</span>
                <span className="text-gray-500 hidden group-open:inline">−</span>
              </summary>
              <p className="text-gray-700 mt-3 text-sm">Currently, our converter processes one image at a time. For batch conversions, check out our Batch Convert Images tool which handles multiple files simultaneously.</p>
            </details>

            <details className="p-4 bg-white border border-gray-200 rounded-lg cursor-pointer group">
              <summary className="font-semibold text-gray-900 flex justify-between items-center">
                Do I need to sign up to use this converter?
                <span className="text-gray-500 group-open:hidden">+</span>
                <span className="text-gray-500 hidden group-open:inline">−</span>
              </summary>
              <p className="text-gray-700 mt-3 text-sm">No signup required. Our JPG to PNG converter is completely free and accessible to everyone without registration.</p>
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
            "name": "Will converting JPG to PNG reduce image quality?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "No, PNG uses lossless compression. Your image quality will remain the same as the original JPG. The only change is the file format and transparency support."
            }
          },
          {
            "@type": "Question",
            "name": "What file size limits exist for conversion?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Our tool supports images up to 50MB in size. For most common use cases, your files will be well below this limit."
            }
          },
          {
            "@type": "Question",
            "name": "Are my files stored on your servers?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "No, conversion happens in your browser. Files are not uploaded to our servers and are automatically deleted after download."
            }
          },
          {
            "@type": "Question",
            "name": "Why would PNG files be larger than JPG files?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "PNG uses lossless compression while JPG uses lossy compression. This means PNG may be larger, but preserves every pixel exactly. For photos, JPG is usually smaller; for graphics, PNG is better."
            }
          },
          {
            "@type": "Question",
            "name": "Can I batch convert multiple JPG files at once?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Currently, our converter processes one image at a time. For batch conversions, check out our Batch Convert Images tool which handles multiple files simultaneously."
            }
          },
          {
            "@type": "Question",
            "name": "Do I need to sign up to use this converter?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "No signup required. Our JPG to PNG converter is completely free and accessible to everyone without registration."
            }
          }
        ]
      })}</script>

      {/* Related Tools */}
      <div className="py-12 px-4 md:px-8 bg-white border-t border-gray-200">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Related Image Tools</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <Link href="/all-tools/png-to-jpg" className="flex items-center gap-3 p-4 bg-gradient-to-r from-orange-50 to-transparent rounded-lg border border-gray-200 hover:border-orange-500 hover:shadow-md transition">
              <span className="text-orange-600 font-bold">→</span>
              <div><span className="text-gray-900 font-medium hover:text-orange-600">PNG to JPG Converter</span><p className="text-xs text-gray-600">Convert PNG to JPG format</p></div>
            </Link>
            <Link href="/all-tools/webp-to-jpg" className="flex items-center gap-3 p-4 bg-gradient-to-r from-orange-50 to-transparent rounded-lg border border-gray-200 hover:border-orange-500 hover:shadow-md transition">
              <span className="text-orange-600 font-bold">→</span>
              <div><span className="text-gray-900 font-medium hover:text-orange-600">WebP to JPG Converter</span><p className="text-xs text-gray-600">Convert modern WebP format</p></div>
            </Link>
            <Link href="/all-tools/image-compressor" className="flex items-center gap-3 p-4 bg-gradient-to-r from-orange-50 to-transparent rounded-lg border border-gray-200 hover:border-orange-500 hover:shadow-md transition">
              <span className="text-orange-600 font-bold">→</span>
              <div><span className="text-gray-900 font-medium hover:text-orange-600">Image Compressor</span><p className="text-xs text-gray-600">Reduce image file sizes</p></div>
            </Link>
            <Link href="/all-tools/resize-image" className="flex items-center gap-3 p-4 bg-gradient-to-r from-orange-50 to-transparent rounded-lg border border-gray-200 hover:border-orange-500 hover:shadow-md transition">
              <span className="text-orange-600 font-bold">→</span>
              <div><span className="text-gray-900 font-medium hover:text-orange-600">Image Resizer</span><p className="text-xs text-gray-600">Change image dimensions</p></div>
            </Link>
          </div>
        </div>
      </div>
    </main>

    <Footer />
  </>
);
}







