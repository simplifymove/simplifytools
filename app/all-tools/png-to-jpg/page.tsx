'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Download, ChevronRight, Zap, Shield, CheckCircle, Loader } from 'lucide-react';
import { ImageUploader } from '../../components/ImageUploader';
import { convertImageFormat } from '../../lib/imageTools';
import { HomeHeader } from '@/app/components/HomeHeader';
import { Footer } from '@/app/components/Footer';
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
import { PriorityToolGuide } from '@/app/components/PriorityToolGuide';
import {
  normalizePngToJpgQuality,
  PNG_TO_JPG_DEFAULT_QUALITY,
  PNG_TO_JPG_MAX_QUALITY,
  PNG_TO_JPG_MIN_QUALITY,
} from '@/app/lib/png-to-jpg-quality';

const TOOL_ID = 'png-to-jpg';
const TOOL_NAME = 'PNG to JPG Converter';

export default function PngToJpgPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<Blob | null>(null);
  const [quality, setQuality] = useState(PNG_TO_JPG_DEFAULT_QUALITY);
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
      const result = await convertImageFormat(file, 'image/jpeg', {
        quality: normalizePngToJpgQuality(quality),
      });
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
        outputName: `${baseName}.jpg`,
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
      <main className="min-h-screen bg-slate-50 flex flex-col">
        <div className="flex-1">
      {/* Premium Header */}
      <div className="relative bg-gradient-to-r from-orange-500 via-orange-600 to-amber-600 py-12 px-4 md:px-8 overflow-hidden">
        {/* Animated background shapes */}
        <motion.div
          className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full mix-blend-multiply filter blur-3xl"
          animate={{ x: [0, 30, -20, 0], y: [0, -30, 20, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full mix-blend-multiply filter blur-3xl"
          animate={{ x: [0, -30, 20, 0], y: [0, 30, -20, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />

        <div className="max-w-6xl mx-auto relative z-10">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-white/80 text-sm mb-6">
            <Link href="/" className="hover:text-white transition">Home</Link>
            <ChevronRight size={16} />
            <Link href="/all-tools" className="hover:text-white transition">All Tools</Link>
            <ChevronRight size={16} />
            <span className="text-white">PNG to JPG</span>
          </div>

          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
              PNG to JPG Converter
            </h1>
            <p className="text-lg text-white/90 max-w-2xl">
              Convert PNG images to JPG format with quality control. Reduce file size while maintaining image quality.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-12">
        {error && <ErrorAlert error={error} onDismiss={clearError} />}

        <motion.div
          className="grid md:grid-cols-2 gap-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ staggerChildren: 0.1, delayChildren: 0.2 }}
        >
          {/* Upload Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 hover:shadow-2xl transition-all sticky top-4">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <span className="w-8 h-8 bg-gradient-to-br from-orange-500 to-amber-600 rounded-lg flex items-center justify-center text-white font-bold">📤</span>
                Upload PNG
              </h2>

              <div className="space-y-6">
                {/* Upload Component */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  <ImageUploader
                    onFileSelect={handleFileSelect}
                    preview={preview}
                    onClearPreview={handleClearPreview}
                    toolId={TOOL_ID}
                    onValidationError={() => {}}
                  />
                </motion.div>

                {/* Quality Slider */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl border-2 border-orange-200"
                >
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Quality: <span className="text-lg font-bold text-orange-600">{quality}%</span>
                  </label>
                  <input
                    type="range"
                    name="quality"
                    aria-label="JPEG quality"
                    min={PNG_TO_JPG_MIN_QUALITY}
                    max={PNG_TO_JPG_MAX_QUALITY}
                    value={quality}
                    onChange={(e) => setQuality(normalizePngToJpgQuality(e.target.valueAsNumber))}
                    className="w-full h-2 bg-orange-200 rounded-lg appearance-none cursor-pointer accent-orange-600"
                  />
                  <p className="text-xs text-orange-700 mt-2">
                    Higher = better quality, larger file • Lower = smaller file, less quality
                  </p>
                </motion.div>

                {/* Convert Button */}
                <motion.button
                  onClick={handleConvert}
                  disabled={!file || processing}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-orange-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                >
                  {processing ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      Converting...
                    </>
                  ) : (
                    '✨ Convert to JPG'
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* Preview Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 hover:shadow-2xl transition-all">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <span className="w-8 h-8 bg-gradient-to-br from-orange-500 to-amber-600 rounded-lg flex items-center justify-center text-white font-bold">📥</span>
                Download
              </h2>

              {result ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-4"
                >
                  <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border-2 border-green-200">
                    <div className="flex items-center gap-3 text-green-700 mb-3">
                      <CheckCircle className="w-6 h-6" />
                      <span className="font-semibold">Conversion Complete!</span>
                    </div>
                    <p className="text-sm text-green-600">Your JPG file is ready to download</p>
                  </div>

                  <motion.button
                    onClick={handleDownload}
                    disabled={processing}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-green-500/30 flex items-center justify-center gap-2 transition-all"
                  >
                    <Download className="w-5 h-5" />
                    {processing ? 'Preparing Download...' : 'Continue to Download'}
                  </motion.button>
                </motion.div>
              ) : (
                <div className="h-64 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl flex items-center justify-center border-2 border-dashed border-gray-300">
                  <div className="text-center">
                    <div className="text-4xl mb-3">📷</div>
                    <p className="text-gray-500 font-medium">Upload a PNG image to convert</p>
                    <p className="text-gray-400 text-sm mt-1">The preview will appear here</p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>

      <PriorityToolGuide toolId="png-to-jpg" />
      {false && (<>
      {/* Footer Features */}
      <motion.div
        className="mt-12 grid md:grid-cols-3 gap-6 max-w-6xl mx-auto px-4 md:px-8 pb-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <motion.div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-l-orange-500 hover:shadow-xl transition-all" whileHover={{ y: -4 }}>
          <h3 className="font-bold text-gray-900 mb-3 text-lg flex items-center gap-2">
            <Zap className="w-5 h-5 text-orange-500" />
            Smaller Files
          </h3>
          <p className="text-sm text-gray-600">
            Reduce file size significantly while maintaining acceptable image quality through compression.
          </p>
        </motion.div>

        <motion.div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-l-amber-500 hover:shadow-xl transition-all" whileHover={{ y: -4 }}>
          <h3 className="font-bold text-gray-900 mb-3 text-lg flex items-center gap-2">
            <Shield className="w-5 h-5 text-amber-500" />
            Quality Control
          </h3>
          <p className="text-sm text-gray-600">
            Adjust quality slider (10-100%) to find the perfect balance for your needs.
          </p>
        </motion.div>

        <motion.div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-l-orange-600 hover:shadow-xl transition-all" whileHover={{ y: -4 }}>
          <h3 className="font-bold text-gray-900 mb-3 text-lg flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-orange-600" />
            Wide Compatibility
          </h3>
          <p className="text-sm text-gray-600">
            JPG format works universally across all devices, browsers, and applications.
          </p>
        </motion.div>
      </motion.div>

    {/* How To Section */}
    <div className="py-12 px-4 md:px-8 bg-white border-t border-gray-200">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">How to Convert PNG to JPG</h2>
        <div className="space-y-4">
          <div className="flex gap-4 items-start">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold text-sm">1</div>
            <div><p className="text-gray-700"><strong>Upload your PNG file:</strong> Click the upload area and select your PNG image</p></div>
          </div>
          <div className="flex gap-4 items-start">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold text-sm">2</div>
            <div><p className="text-gray-700"><strong>Adjust quality slider (optional):</strong> Choose your desired quality level from 10% to 100%</p></div>
          </div>
          <div className="flex gap-4 items-start">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold text-sm">3</div>
            <div><p className="text-gray-700"><strong>Click Convert to JPG:</strong> The tool will process your image instantly</p></div>
          </div>
          <div className="flex gap-4 items-start">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold text-sm">4</div>
            <div><p className="text-gray-700"><strong>Download your JPG:</strong> Click the download button to save your file</p></div>
          </div>
        </div>
      </div>
    </div>

    {/* Use Cases Section */}
    <div className="py-12 px-4 md:px-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">When to Convert PNG to JPG</h2>
        <ul className="space-y-3 text-gray-700">
          <li className="flex gap-2"><span className="text-orange-500 font-bold">•</span> Compressing PNG images for faster website loading</li>
          <li className="flex gap-2"><span className="text-orange-500 font-bold">•</span> Reducing storage space for photo backups and archives</li>
          <li className="flex gap-2"><span className="text-orange-500 font-bold">•</span> Preparing images for universal compatibility across devices</li>
          <li className="flex gap-2"><span className="text-orange-500 font-bold">•</span> Removing transparency when not needed (solid background)</li>
          <li className="flex gap-2"><span className="text-orange-500 font-bold">•</span> Sharing photos on social media with smaller file sizes</li>
          <li className="flex gap-2"><span className="text-orange-500 font-bold">•</span> Converting graphics-based PNGs to photos for printing</li>
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
              What happens to transparency when converting PNG to JPG?
              <span className="text-gray-500 group-open:hidden">+</span>
              <span className="text-gray-500 hidden group-open:inline">−</span>
            </summary>
            <p className="text-gray-700 mt-3 text-sm">JPG does not support transparency. Transparent or partially transparent pixels must be flattened when the browser creates the JPEG output, so transparency is not preserved.</p>
          </details>

          <details className="p-4 bg-white border border-gray-200 rounded-lg cursor-pointer group">
            <summary className="font-semibold text-gray-900 flex justify-between items-center">
              What quality setting should I use?
              <span className="text-gray-500 group-open:hidden">+</span>
              <span className="text-gray-500 hidden group-open:inline">−</span>
            </summary>
            <p className="text-gray-700 mt-3 text-sm">For most use cases, 85-90% quality provides excellent results with good file size reduction. For web use, 75% is often sufficient. Increase to 95%+ only for professional printing.</p>
          </details>

          <details className="p-4 bg-white border border-gray-200 rounded-lg cursor-pointer group">
            <summary className="font-semibold text-gray-900 flex justify-between items-center">
              How much smaller will my file be?
              <span className="text-gray-500 group-open:hidden">+</span>
              <span className="text-gray-500 hidden group-open:inline">−</span>
            </summary>
            <p className="text-gray-700 mt-3 text-sm">File-size differences depend on the image content and selected JPG quality. Photographs and graphics can produce different results.</p>
          </details>

          <details className="p-4 bg-white border border-gray-200 rounded-lg cursor-pointer group">
            <summary className="font-semibold text-gray-900 flex justify-between items-center">
              Are my files stored or shared?
              <span className="text-gray-500 group-open:hidden">+</span>
              <span className="text-gray-500 hidden group-open:inline">−</span>
            </summary>
            <p className="text-gray-700 mt-3 text-sm">The image conversion itself happens in your browser. The converted result may be sent to SimplifyConvert when you choose the download flow so the download result can be prepared.</p>
          </details>

          <details className="p-4 bg-white border border-gray-200 rounded-lg cursor-pointer group">
            <summary className="font-semibold text-gray-900 flex justify-between items-center">
              Can I convert multiple PNG files at once?
              <span className="text-gray-500 group-open:hidden">+</span>
              <span className="text-gray-500 hidden group-open:inline">−</span>
            </summary>
            <p className="text-gray-700 mt-3 text-sm">Currently, this tool processes one image at a time. For batch conversion of multiple files, check out our Batch Convert Images tool.</p>
          </details>

          <details className="p-4 bg-white border border-gray-200 rounded-lg cursor-pointer group">
            <summary className="font-semibold text-gray-900 flex justify-between items-center">
              Is this converter really free?
              <span className="text-gray-500 group-open:hidden">+</span>
              <span className="text-gray-500 hidden group-open:inline">−</span>
            </summary>
            <p className="text-gray-700 mt-3 text-sm">You can use the available PNG-to-JPG conversion controls without creating an account.</p>
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
          "name": "What happens to transparency when converting PNG to JPG?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "JPG does not support transparency. Transparent or partially transparent pixels must be flattened when the browser creates the JPEG output, so transparency is not preserved."
          }
        },
        {
          "@type": "Question",
          "name": "What quality setting should I use?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "For most use cases, 85-90% quality provides excellent results with good file size reduction. For web use, 75% is often sufficient. Increase to 95%+ only for professional printing."
          }
        },
        {
          "@type": "Question",
          "name": "How much smaller will my file be?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "File-size differences depend on the image content and selected JPG quality. Photographs and graphics can produce different results."
          }
        },
        {
          "@type": "Question",
          "name": "Are my files stored or shared?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "The image conversion itself happens in your browser. The converted result may be sent to SimplifyConvert when you choose the download flow so the download result can be prepared."
          }
        },
        {
          "@type": "Question",
          "name": "Can I convert multiple PNG files at once?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Currently, this tool processes one image at a time. For batch conversion of multiple files, check out our Batch Convert Images tool."
          }
        },
        {
          "@type": "Question",
          "name": "Is this converter really free?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "You can use the available PNG-to-JPG conversion controls without creating an account."
          }
        }
      ]
    })}</script>

    {/* Related Tools */}
    <div className="py-12 px-4 md:px-8 bg-gray-50 border-t border-gray-200">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Related Image Tools</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <Link href="/all-tools/jpg-to-png" className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-200 hover:border-orange-500 hover:shadow-md transition">
            <span className="text-orange-600 font-bold">→</span>
            <div><span className="text-gray-900 font-medium hover:text-orange-600">JPG to PNG Converter</span><p className="text-xs text-gray-600">Convert JPG to PNG format</p></div>
          </Link>
          <Link href="/all-tools/compress-image" className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-200 hover:border-orange-500 hover:shadow-md transition">
            <span className="text-orange-600 font-bold">→</span>
            <div><span className="text-gray-900 font-medium hover:text-orange-600">Image Compressor</span><p className="text-xs text-gray-600">Reduce any image size</p></div>
          </Link>
          <Link href="/all-tools/webp-to-jpg" className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-200 hover:border-orange-500 hover:shadow-md transition">
            <span className="text-orange-600 font-bold">→</span>
            <div><span className="text-gray-900 font-medium hover:text-orange-600">WebP to JPG Converter</span><p className="text-xs text-gray-600">Convert modern WebP format</p></div>
          </Link>
          <Link href="/all-tools/resize-image" className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-200 hover:border-orange-500 hover:shadow-md transition">
            <span className="text-orange-600 font-bold">→</span>
            <div><span className="text-gray-900 font-medium hover:text-orange-600">Image Resizer</span><p className="text-xs text-gray-600">Change image dimensions</p></div>
          </Link>
        </div>
      </div>
    </div>
      </>)}
      </main>

      <Footer />
    </>
  );
}



