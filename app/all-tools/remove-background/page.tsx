'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Download, ChevronRight, Loader, Upload, Eraser } from 'lucide-react';
import { ImageUploader } from '../../components/ImageUploader';
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
import { uploadBrowserDownloadResultFromUrl } from '@/app/lib/download-result-client';
import { PriorityToolGuide } from '@/app/components/PriorityToolGuide';

const TOOL_ID = 'remove-background';
const TOOL_NAME = 'Remove Background';

export default function RemoveBackgroundPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [hqMode, setHqMode] = useState(false);
  const [outputFormat, setOutputFormat] = useState<'png' | 'jpg' | 'webp'>('png');
  const [processingTime, setProcessingTime] = useState<number | null>(null);
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
    setResult(null);
  };

  const handleClearPreview = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setProcessingTime(null);
    clearError();
  };

  const removeBackground = async () => {
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
      const formData = new FormData();
      formData.append('file', file);
      formData.append('hq', hqMode ? 'true' : 'false');
      formData.append('format', outputFormat);

      const startTime = Date.now();

      const response = await fetch('/api/bg-remove', {
        method: 'POST',
        body: formData,
      });

      const processingTimeMs = Date.now() - startTime;
      setProcessingTime(processingTimeMs);

      if (!response.ok) {
        let errorMessage = 'Failed to remove background';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          errorMessage = `Server error (${response.status})`;
        }
        throw new Error(errorMessage);
      }

      const blob = await response.blob();
      if (blob.size === 0) {
        throw new Error('Empty response from server');
      }

      // Convert blob to data URL to avoid CSP issues with blob: URLs
      const reader = new FileReader();
      reader.onload = () => {
        setResult(reader.result as string);
      };
      reader.onerror = () => {
        throw new Error('Failed to read result image');
      };
      reader.readAsDataURL(blob);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      createError(
        ImageToolErrorType.SHARP_FAILED,
        TOOL_ID,
        TOOL_NAME,
        { file },
        { filename: file.name, size: file.size, mimeType: file.type }
      );
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = async () => {
    if (!result || !file || processing) return;

    setProcessing(true);
    clearError();

    try {
      const outputName = `no-background-${Date.now()}.${outputFormat}`;
      const downloadResult = await uploadBrowserDownloadResultFromUrl({
        url: result,
        toolSlug: TOOL_ID,
        originalName: file.name,
        outputName,
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
              <span>Remove Background</span>
            </div>

            {/* Title Section */}
            <div className="flex items-start gap-4">
              <div className="p-3 bg-white/20 rounded-lg">
                <Eraser size={32} className="text-white" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">Remove Background</h1>
                <p className="text-lg text-white/90">Automatically remove backgrounds from images with AI-powered technology.</p>
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
                {error && <ErrorAlert error={error} onDismiss={clearError} />}

                {/* Step 1: Upload */}
                {!preview && (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Step 1: Upload Image</h2>

                    <ImageUploader
                      onFileSelect={handleFileSelect}
                      preview={preview}
                      onClearPreview={handleClearPreview}
                      toolId={TOOL_ID}
                      onValidationError={() => {}}
                    />
                  </div>
                )}

                {/* Original Preview */}
                {preview && (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Original Image</h2>
                    <div className="flex justify-center items-center min-h-80">
                      {preview ? (
                        <img
                          src={preview}
                          alt="original"
                          className="rounded-lg shadow-lg"
                          style={{ maxHeight: '500px', maxWidth: '100%', objectFit: 'contain' }}
                        />
                      ) : (
                        <p className="text-gray-500">Loading preview...</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Result */}
                {result && (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Background Removed</h2>
                    <div className="flex justify-center items-center min-h-80">
                      <img
                        src={result}
                        alt="result"
                        className="rounded-lg shadow-lg"
                        style={{ maxHeight: '500px', maxWidth: '100%', objectFit: 'contain', backgroundColor: '#f3f4f6' }}
                      />
                    </div>
                    {processingTime !== null && (
                      <p className="text-xs text-gray-600 text-center bg-gray-50 p-3 rounded-lg mt-6">
                        Processed in {(processingTime / 1000).toFixed(1)}s • {outputFormat.toUpperCase()} format
                      </p>
                    )}
                  </div>
                )}

                {!preview && (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                    <h3 className="font-semibold text-green-900 mb-3">How it Works:</h3>
                    <ol className="text-sm text-green-800 space-y-2">
                      <li>1. Upload an image with a background</li>
                      <li>2. Our AI automatically detects and removes it</li>
                      <li>3. Choose your processing mode and output format</li>
                      <li>4. Use PNG or WebP for transparency, or JPEG for white</li>
                      <li>5. Use it in designs, websites, or other projects</li>
                    </ol>
                  </div>
                )}
              </div>

              {/* Settings Sidebar - Right (1 col sticky) */}
              <div className="lg:col-span-1">
                <div className="sticky top-4 space-y-4">
                  {!preview && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h3 className="font-semibold text-blue-900 mb-3">Features</h3>
                      <ul className="text-sm text-blue-800 space-y-1">
                        <li>• AI-powered detection</li>
                        <li>• Automatic background removal</li>
                        <li>• Multiple output formats</li>
                        <li>• Standard and HQ model modes</li>
                        <li>• Edge quality varies by subject</li>
                      </ul>
                    </div>
                  )}

                  {/* Settings */}
                  {preview && (
                    <div className="bg-white rounded-lg border border-gray-200 p-4">
                      <h3 className="font-semibold text-gray-900 mb-4">Export Settings</h3>

                      {/* Output Format */}
                      <div className="mb-4">
                        <label className="text-sm font-medium text-gray-700 block mb-2">Output Format</label>
                        <select
                          value={outputFormat}
                          onChange={(e) => setOutputFormat(e.target.value as 'png' | 'jpg' | 'webp')}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        >
                          <option value="png">PNG (transparent background)</option>
                          <option value="webp">WebP (modern)</option>
                          <option value="jpg">JPEG (opaque)</option>
                        </select>
                      </div>

                      {/* HQ Mode */}
                      <div className="flex items-start gap-2 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                        <input
                          type="checkbox"
                          id="hqMode"
                          checked={hqMode}
                          onChange={(e) => setHqMode(e.target.checked)}
                          className="w-4 h-4 cursor-pointer mt-0.5"
                        />
                        <label htmlFor="hqMode" className="flex-1 cursor-pointer">
                          <div className="text-sm font-medium text-gray-900">High Quality Mode</div>
                          <div className="text-xs text-gray-600">Uses a larger model and may take longer</div>
                        </label>
                      </div>
                    </div>
                  )}

                  {/* Error Message - Already shown above */}

                  {/* Process Button */}
                  {preview && (
                    <button
                      onClick={removeBackground}
                      disabled={processing}
                      className="w-full py-3 px-6 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2"
                    >
                      {processing ? (
                        <>
                          <Loader size={20} className="animate-spin" />
                          Processing...
                        </>
                      ) : (
                        'Remove Background'
                      )}
                    </button>
                  )}

                  {/* Download Button */}
                  {result && (
                    <button
                      onClick={handleDownload}
                      className="w-full py-3 px-6 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2"
                    >
                      <Download size={20} />
                      Download {outputFormat.toUpperCase()}
                    </button>
                  )}

                  {/* Clear Button */}
                  {preview && (
                    <button
                      onClick={handleClearPreview}
                      className="w-full py-2 px-6 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition"
                    >
                      Clear &amp; Upload New
                    </button>
                  )}

                  {/* Use Cases */}
                  {preview && (
                    <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                      <h3 className="font-semibold text-indigo-900 mb-2">Useful for:</h3>
                      <ul className="text-sm text-indigo-800 space-y-1">
                        <li>• e-Commerce product photos</li>
                        <li>• Profile pictures</li>
                        <li>• Design projects</li>
                        <li>• Website graphics</li>
                      </ul>
                    </div>
                  )}

                  {/* Format Info */}
                  {preview && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                      <h3 className="font-semibold text-amber-900 mb-2">Format Tips</h3>
                      <ul className="text-xs text-amber-800 space-y-1">
                        <li>• PNG: Transparent bg</li>
                        <li>• WebP: Modern, smaller</li>
                        <li>• JPEG: Solid background</li>
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <PriorityToolGuide toolId="remove-background" />
      <Footer />
      {false && (<>

      {/* How It Works Section */}
      <section className="py-12 px-4 md:px-8 bg-white border-t border-gray-200">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">How to Remove Background from Images</h2>
          <div className="space-y-4">
            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold text-sm">1</div>
              <div><p className="text-gray-700"><strong>Upload your image:</strong> Select any JPG, PNG, or WebP image from your computer</p></div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold text-sm">2</div>
              <div><p className="text-gray-700"><strong>Choose your output format:</strong> PNG for transparency, WebP for modern web, or JPEG for solid background</p></div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold text-sm">3</div>
              <div><p className="text-gray-700"><strong>Optional: Enable High Quality Mode</strong> for better edge detection and cleaner results</p></div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold text-sm">4</div>
              <div><p className="text-gray-700"><strong>Click Remove Background:</strong> The server model processes the image and generates a foreground cutout</p></div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold text-sm">5</div>
              <div><p className="text-gray-700"><strong>Download your result:</strong> Save your image with transparent or custom background</p></div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-12 px-4 md:px-8 bg-gray-50 border-t border-gray-200">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <details className="p-4 bg-white border border-gray-200 rounded-lg cursor-pointer group">
              <summary className="font-semibold text-gray-900 flex justify-between items-center">
                How accurate is the AI background removal?
                <span className="text-gray-500 group-open:hidden">+</span>
                <span className="text-gray-500 hidden group-open:inline">−</span>
              </summary>
              <p className="text-gray-700 mt-3 text-sm">Background removal works best when the subject is visually distinct from the background. Hair, fur, translucent areas, motion blur, and fine edges can be difficult to segment, so review the generated cutout before downloading.</p>
            </details>

            <details className="p-4 bg-white border border-gray-200 rounded-lg cursor-pointer group">
              <summary className="font-semibold text-gray-900 flex justify-between items-center">
                What image formats are supported?
                <span className="text-gray-500 group-open:hidden">+</span>
                <span className="text-gray-500 hidden group-open:inline">−</span>
              </summary>
              <p className="text-gray-700 mt-3 text-sm">The server accepts JPEG, PNG, and WebP images up to 20 MB. Images with clear lighting and stronger subject-background contrast usually give the segmentation model a clearer boundary.</p>
            </details>

            <details className="p-4 bg-white border border-gray-200 rounded-lg cursor-pointer group">
              <summary className="font-semibold text-gray-900 flex justify-between items-center">
                Can I edit the result after download?
                <span className="text-gray-500 group-open:hidden">+</span>
                <span className="text-gray-500 hidden group-open:inline">−</span>
              </summary>
              <p className="text-gray-700 mt-3 text-sm">Yes! Downloaded PNG files with transparent backgrounds can be edited in any image editor like Photoshop, GIMP, or even Paint. You can add custom backgrounds or make further adjustments.</p>
            </details>

            <details className="p-4 bg-white border border-gray-200 rounded-lg cursor-pointer group">
              <summary className="font-semibold text-gray-900 flex justify-between items-center">
                Are my images stored on your servers?
                <span className="text-gray-500 group-open:hidden">+</span>
                <span className="text-gray-500 hidden group-open:inline">−</span>
              </summary>
              <p className="text-gray-700 mt-3 text-sm">Processing happens on our servers for AI analysis. Uploaded images are used to perform the requested background-removal operation.</p>
            </details>

            <details className="p-4 bg-white border border-gray-200 rounded-lg cursor-pointer group">
              <summary className="font-semibold text-gray-900 flex justify-between items-center">
                How long does background removal take?
                <span className="text-gray-500 group-open:hidden">+</span>
                <span className="text-gray-500 hidden group-open:inline">−</span>
              </summary>
              <p className="text-gray-700 mt-3 text-sm">Processing time varies with image dimensions, complexity, selected mode, and current server workload. High Quality Mode can take longer than Standard mode. The page displays the measured processing time after the operation completes.</p>
            </details>

            <details className="p-4 bg-white border border-gray-200 rounded-lg cursor-pointer group">
              <summary className="font-semibold text-gray-900 flex justify-between items-center">
                Do I need to sign up or pay to use this tool?
                <span className="text-gray-500 group-open:hidden">+</span>
                <span className="text-gray-500 hidden group-open:inline">−</span>
              </summary>
              <p className="text-gray-700 mt-3 text-sm">No signup is required to use the available background-removal controls.</p>
            </details>
          </div>
        </div>
      </section>

      {/* FAQ Schema */}
      <script type="application/ld+json">{JSON.stringify({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "How accurate is the AI background removal?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Background removal works best when the subject is visually distinct from the background. Hair, fur, translucent areas, motion blur, and fine edges can be difficult to segment."
            }
          },
          {
            "@type": "Question",
            "name": "What image formats are supported?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "The server accepts JPEG, PNG, and WebP images up to 20 MB."
            }
          },
          {
            "@type": "Question",
            "name": "Can I edit the result after download?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes, downloaded PNG files can be edited in any image editor. You can add custom backgrounds or make further adjustments."
            }
          },
          {
            "@type": "Question",
            "name": "Are my images stored on your servers?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "The image is sent to the server for background-removal processing. Temporary model input, output, and script files are deleted in the request cleanup path."
            }
          },
          {
            "@type": "Question",
            "name": "How long does background removal take?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Processing time varies with image dimensions, complexity, selected mode, and current server workload. High Quality Mode can take longer than Standard mode."
            }
          },
          {
            "@type": "Question",
            "name": "Do I need to sign up or pay to use this tool?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "No signup is required to use the available background-removal controls."
            }
          }
        ]
      })}</script>

      {/* Related Tools */}
      <section className="py-12 px-4 md:px-8 bg-white border-t border-gray-200">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Related Image Tools</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <Link href="/all-tools/compress-image" className="flex items-center gap-3 p-4 bg-gradient-to-r from-orange-50 to-transparent rounded-lg border border-gray-200 hover:border-orange-500 hover:shadow-md transition">
              <span className="text-orange-600 font-bold">→</span>
              <div><span className="text-gray-900 font-medium hover:text-orange-600">Image Compressor</span><p className="text-xs text-gray-600">Reduce file size after removal</p></div>
            </Link>
            <Link href="/all-tools/resize-image" className="flex items-center gap-3 p-4 bg-gradient-to-r from-orange-50 to-transparent rounded-lg border border-gray-200 hover:border-orange-500 hover:shadow-md transition">
              <span className="text-orange-600 font-bold">→</span>
              <div><span className="text-gray-900 font-medium hover:text-orange-600">Image Resizer</span><p className="text-xs text-gray-600">Adjust image dimensions</p></div>
            </Link>
            <Link href="/all-tools/crop-image" className="flex items-center gap-3 p-4 bg-gradient-to-r from-orange-50 to-transparent rounded-lg border border-gray-200 hover:border-orange-500 hover:shadow-md transition">
              <span className="text-orange-600 font-bold">→</span>
              <div><span className="text-gray-900 font-medium hover:text-orange-600">Crop Image</span><p className="text-xs text-gray-600">Remove unwanted areas</p></div>
            </Link>
            <Link href="/all-tools/make-background-transparent" className="flex items-center gap-3 p-4 bg-gradient-to-r from-orange-50 to-transparent rounded-lg border border-gray-200 hover:border-orange-500 hover:shadow-md transition">
              <span className="text-orange-600 font-bold">→</span>
              <div><span className="text-gray-900 font-medium hover:text-orange-600">Make Background Transparent</span><p className="text-xs text-gray-600">Create transparent backgrounds</p></div>
            </Link>
          </div>
        </div>
      </section>

      <footer className="bg-slate-900 text-gray-300 px-4 md:px-8 py-16 md:py-24">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 font-bold text-xl text-white mb-4">
                <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-md shadow-orange-500/40">
                  SC
                </div>
                <span>SimplifyConvert</span>
              </div>
              <p className="text-sm text-gray-400">
                Free online tools for PDF, Image, Video, AI Write, Data, Code, and Text to Speech conversion.
              </p>
            </div>

            {/* Categories */}
            <div>
              <h4 className="font-semibold text-white mb-4">Categories</h4>
              <ul className="space-y-2 text-sm">
                {['PDF Tools', 'Image Tools', 'Video Tools', 'AI Write', 'Code Tools'].map((item) => (
                  <li key={item}>
                    <a href="#" className="hover:text-white transition-colors hover:translate-x-1 inline-block">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Popular Tools */}
            <div>
              <h4 className="font-semibold text-white mb-4">Popular</h4>
              <ul className="space-y-2 text-sm">
                {['PDF to JPG', 'Remove BG', 'Compress Image', 'JSON Formatter', 'CSV to Excel'].map((item) => (
                  <li key={item}>
                    <a href="#" className="hover:text-white transition-colors hover:translate-x-1 inline-block">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                {[
                  { label: 'About', href: '/about' },
                  { label: 'Privacy Policy', href: '/privacy' },
                  { label: 'Terms of Service', href: '/terms' },
                  { label: 'Contact', href: '/contact' },
                  { label: 'Blog', href: '/blog' }
                ].map((item) => (
                  <li key={item.label}>
                    <Link href={item.href} className="hover:text-white transition-colors hover:translate-x-1 inline-block">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8">
            <p className="text-center text-sm text-gray-400">
              © 2026 SimplifyConvert. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
      </>)}
    </>
  );
}



