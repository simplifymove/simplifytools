'use client';
import { FAQAnswer, FAQDisclosure, FAQHeading, FAQList, FAQPanel, FAQQuestion } from '@/app/components/FAQDesign';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Download, ChevronRight, Loader, Upload } from 'lucide-react';
import { HomeHeader } from '../../components/HomeHeader';
import { Footer } from '../../components/Footer';

import { useImageToolErrors } from '@/app/hooks/useImageToolErrors';
import { ErrorAlert } from '@/app/components/error-components';
import { ImageToolErrorType } from '@/app/utils/types/errors';
import { uploadBrowserDownloadResult } from '@/app/lib/download-result-client';

const TOOL_ID = 'batch-compress-images';
const TOOL_NAME = 'Batch Compress Images';

export default function BatchCompressImagesPage() {
  const router = useRouter();
  const [files, setFiles] = useState<File[]>([]);
  const [quality, setQuality] = useState(0.75);
  const [processing, setProcessing] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [results, setResults] = useState<Array<{ name: string; original: number; compressed: number; blob: Blob }>>([]);
  const { error, clearError, createError } = useImageToolErrors();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (processing) return;
    const selectedFiles = Array.from(e.target.files || []);
    setFiles(prev => [...prev, ...selectedFiles].slice(0, 100));
    setCompleted(false);
    setResults([]);
  };

  const handleRemoveFile = (index: number) => {
    if (processing) return;
    setFiles(prev => prev.filter((_, i) => i !== index));
    setCompleted(false);
    setResults([]);
  };

  const handleClearAll = () => {
    if (processing) return;
    setFiles([]);
    setCompleted(false);
    setResults([]);
  };

  const compressToJpeg = async (file: File): Promise<Blob> => {
    const bitmap = await createImageBitmap(file);
    try {
      const canvas = document.createElement('canvas');
      canvas.width = bitmap.width;
      canvas.height = bitmap.height;

      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not create canvas context');

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(bitmap, 0, 0);

      return await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          blob => blob ? resolve(blob) : reject(new Error('JPEG compression failed')),
          'image/jpeg',
          quality
        );
      });
    } finally {
      bitmap.close();
    }
  };

  const handleCompress = async () => {
    if (files.length === 0 || processing) return;

    setProcessing(true);
    setCompleted(false);
    setResults([]);
    clearError();

    try {
      const compressionResults = [];

      for (const file of files) {
        const blob = await compressToJpeg(file);
        compressionResults.push({
          name: file.name,
          original: file.size,
          compressed: blob.size,
          blob,
        });
      }

      setResults(compressionResults);
      setCompleted(true);
    } catch (error) {
      createError(
        ImageToolErrorType.COMPRESSION_FAILED,
        TOOL_ID,
        TOOL_NAME,
        { error: (error as Error).message },
        undefined
      );
    } finally {
      setProcessing(false);
    }
  };

  const handleDownloadAll = async () => {
    if (!completed || results.length === 0 || processing) return;

    setProcessing(true);
    clearError();
    const additionalResultWindows = results.slice(1).map(() =>
      window.open('about:blank', '_blank'),
    );
    let primaryDownloadPageUrl: string | null = null;

    for (let i = 0; i < results.length; i++) {
      const result = results[i];
      const file = files[i];
      try {
        const newName = file.name.replace(/\.[^/.]+$/, '') + `-compressed-${Date.now()}.jpg`;
        const downloadResult = await uploadBrowserDownloadResult({
          blob: result.blob,
          toolSlug: TOOL_ID,
          originalName: file.name,
          outputName: newName,
        });

        if (!primaryDownloadPageUrl) {
          primaryDownloadPageUrl = downloadResult.downloadPageUrl;
        } else {
          const resultWindow = additionalResultWindows.shift();
          if (resultWindow) {
            resultWindow.location.href = downloadResult.downloadPageUrl;
          }
        }
      } catch (error) {
        additionalResultWindows.shift()?.close();
        createError(
          ImageToolErrorType.COMPRESSION_FAILED,
          TOOL_ID,
          TOOL_NAME,
          { error: (error as Error).message, filename: file.name },
          { filename: file.name, size: file.size, mimeType: file.type }
        );
      }

      await new Promise(resolve => setTimeout(resolve, 150));
    }

    additionalResultWindows.forEach((resultWindow) => resultWindow?.close());
    setProcessing(false);

    if (primaryDownloadPageUrl) {
      router.push(primaryDownloadPageUrl);
    }
  };

  const totalOriginal = files.reduce((sum, f) => sum + f.size, 0);
  const totalCompressed = results.reduce((sum, r) => sum + r.compressed, 0);
  const sizeChangePercent = totalOriginal > 0
    ? Math.abs((totalOriginal - totalCompressed) / totalOriginal * 100).toFixed(1)
    : '0.0';
  const sizeReduced = totalCompressed <= totalOriginal;
  const savingsPercent = totalOriginal > 0
    ? Math.max(0, Math.min(100, (totalOriginal - totalCompressed) / totalOriginal * 100))
    : 0;

  return (
    <>
      <HomeHeader />
      <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex flex-col">
        {/* Error Display */}
        {error && <ErrorAlert error={error} onDismiss={clearError} />}

        {/* Hero Section */}
        <div className="relative bg-gradient-to-r from-green-600 via-green-700 to-green-800 py-16 px-4 md:px-8 overflow-hidden">
          <div className="max-w-6xl mx-auto relative z-10">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-white/90 text-sm mb-6">
              <Link href="/" className="hover:text-white transition">Home</Link>
              <ChevronRight size={16} />
              <Link href="/all-tools" className="hover:text-white transition">All Tools</Link>
              <ChevronRight size={16} />
              <span>Batch Compress Images</span>
            </div>

            {/* Title Section */}
            <div className="flex items-start gap-4">
              <div className="p-3 bg-white/20 rounded-lg">
                <Upload size={32} className="text-white" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">Batch Compress Images</h1>
                <p className="text-lg text-white/90">Compress multiple supported images in one workflow with an adjustable quality setting. No signup is required.</p>
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
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Step 1: Upload Images</h2>

                  {/* File Upload Area */}
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-green-400 transition cursor-pointer mb-6">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                      id="file-input"
                    />
                    <label htmlFor="file-input" className="cursor-pointer">
                      <Upload size={40} className="mx-auto text-gray-400 mb-3" />
                      <p className="text-lg font-semibold text-gray-700 mb-1">Click to upload or drag and drop</p>
                      <p className="text-sm text-gray-500">Choose up to 100 browser-supported images. All outputs are JPEG files.</p>
                    </label>
                  </div>

                  {/* Files List */}
                  {files.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-4">Selected Files ({files.length})</h3>
                      <div className="bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto">
                        <ul className="space-y-2">
                          {files.map((file, index) => (
                            <li key={index} className="flex items-center justify-between p-2 bg-white rounded border border-gray-200">
                              <div className="flex-1">
                                <span className="text-sm text-gray-700 truncate">{file.name}</span>
                                <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
                              </div>
                              <button
                                onClick={() => handleRemoveFile(index)}
                                className="text-red-500 hover:text-red-700 text-sm font-medium ml-2"
                              >
                                Remove
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <p className="mt-4 text-sm text-gray-600">
                        Total original size: <span className="font-semibold text-gray-900">{(totalOriginal / 1024).toFixed(2)} KB</span>
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Settings - Right (sticky sidebar) */}
              <div className="lg:col-span-1">
                <div className="sticky top-4 space-y-4">
                  {/* Compression Settings */}
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
                        disabled={processing}
                        onChange={(e) => {
                          if (processing) return;
                          setQuality(parseFloat(e.target.value));
                          setCompleted(false);
                          setResults([]);
                        }}
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
                    disabled={files.length === 0 || processing}
                    className="w-full py-3 px-6 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2"
                  >
                    {processing ? (
                      <>
                        <Loader size={20} className="animate-spin" />
                        Processing...
                      </>
                    ) : (
                      `Compress ${files.length} Image${files.length !== 1 ? 's' : ''}`
                    )}
                  </button>

                  {/* Results Summary */}
                  {completed && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <h4 className="font-semibold text-green-900 mb-3">✓ Compression Complete!</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-700">Original:</span>
                          <span className="font-medium text-gray-900">{(totalOriginal / 1024).toFixed(2)} KB</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-700">Compressed:</span>
                          <span className="font-medium text-green-600">{(totalCompressed / 1024).toFixed(2)} KB</span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden mt-2">
                          <div
                            className="h-full bg-green-500"
                            style={{ width: `${savingsPercent}%` }}
                          />
                        </div>
                        <div className="text-center font-semibold text-green-600 text-xs">
                          {sizeReduced ? 'Reduced by' : 'Increased by'} {sizeChangePercent}%
                        </div>
                      </div>
                      <button
                        onClick={handleDownloadAll}
                        className="w-full mt-3 py-2 px-4 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition text-sm flex items-center justify-center gap-2"
                      >
                        <Download size={16} />
                        Download All
                      </button>
                    </div>
                  )}

                  {/* Info Box */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-900 mb-2">About</h3>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Compress up to 100 images</li>
                      <li>• Compress images in your browser</li>
                      <li>• Adjustable quality settings</li>
                      <li>• JPEG output; download preparation uploads the results</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* How To Section */}
      <div className="py-12 px-4 md:px-8 bg-white border-t border-gray-200">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">How to Batch Compress Images</h2>
          <div className="space-y-4">
            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center font-bold text-sm">1</div>
              <div><p className="text-gray-700"><strong>Select multiple images:</strong> Click the upload area or drag and drop up to 100 images at once</p></div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center font-bold text-sm">2</div>
              <div><p className="text-gray-700"><strong>Adjust quality slider:</strong> Choose the compression quality setting from 10% to 100%. File size and visible quality depend on the source image and selected setting.</p></div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center font-bold text-sm">3</div>
              <div><p className="text-gray-700"><strong>Click Compress:</strong> Compress the selected images using the chosen quality setting</p></div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center font-bold text-sm">4</div>
              <div><p className="text-gray-700"><strong>Download results:</strong> Prepare the compressed images for download</p></div>
            </div>
          </div>
        </div>
      </div>

      {/* Use Cases Section */}
      <div className="py-12 px-4 md:px-8 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Benefits of Batch Image Compression</h2>
          <ul className="space-y-3 text-gray-700">
            <li className="flex gap-2"><span className="text-green-600 font-bold">•</span> Prepare website images - smaller JPEG files may reduce transfer sizes when suitable for the page</li>
            <li className="flex gap-2"><span className="text-green-600 font-bold">•</span> Compare file sizes - check original and processed totals before deciding which files to keep</li>
            <li className="flex gap-2"><span className="text-green-600 font-bold">•</span> Prepare social media photos - create JPEG copies while checking each platform's format and size requirements</li>
            <li className="flex gap-2"><span className="text-green-600 font-bold">•</span> Prepare email attachments - smaller files may be easier to share, but attachment limits still apply</li>
            <li className="flex gap-2"><span className="text-green-600 font-bold">•</span> Create JPEG copies - keep originals when transparency, animation, or maximum image quality matters</li>
          </ul>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="py-12 px-4 md:px-8 bg-white border-t border-gray-200">
        <FAQPanel>
          <FAQHeading>Frequently Asked Questions</FAQHeading>
          <FAQList>
            <FAQDisclosure>
              <FAQQuestion>
                How many images can I compress at once?


              </FAQQuestion>
              <FAQAnswer>You can compress up to 100 images in a single batch operation. Processing time depends on the number, dimensions, and sizes of the selected images.</FAQAnswer>
            </FAQDisclosure>

            <FAQDisclosure>
              <FAQQuestion>
                What quality setting should I use for batch compression?


              </FAQQuestion>
              <FAQAnswer>There is no single quality setting that is best for every image. Lower settings generally favor smaller files, while higher settings generally retain more visual detail. Review the output and adjust the setting for your needs.</FAQAnswer>
            </FAQDisclosure>

            <FAQDisclosure>
              <FAQQuestion>
                What file formats are supported for batch compression?


              </FAQQuestion>
              <FAQAnswer>The tool accepts images supported by your browser's image decoder and exports JPEG files. Transparent areas become white, and animations are not preserved. JPEG output can sometimes be larger than the original.</FAQAnswer>
            </FAQDisclosure>

            <FAQDisclosure>
              <FAQQuestion>
                How much space can I save with batch compression?


              </FAQQuestion>
              <FAQAnswer>File-size reduction varies with the source image, dimensions, format, and selected quality setting. Review the displayed before-and-after sizes after processing.</FAQAnswer>
            </FAQDisclosure>

            <FAQDisclosure>
              <FAQQuestion>
                Can I download all compressed images at once?


              </FAQQuestion>
              <FAQAnswer>Click "Download All" to upload generated JPEG files to the download-result service and open a result page for each image. Your browser may block additional tabs, so allow pop-ups if needed.</FAQAnswer>
            </FAQDisclosure>

            <FAQDisclosure>
              <FAQQuestion>
                Is batch image compression really free?


              </FAQQuestion>
              <FAQAnswer>You can compress multiple supported images using the available batch controls without creating an account.</FAQAnswer>
            </FAQDisclosure>
          </FAQList>
        </FAQPanel>
      </div>

      {/* FAQ Schema */}
      <script type="application/ld+json">{JSON.stringify({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "How many images can I compress at once?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "You can compress up to 100 images in a single batch operation."
            }
          },
          {
            "@type": "Question",
            "name": "What quality setting should I use for batch compression?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "There is no single quality setting that is best for every image. Lower settings generally favor smaller files, while higher settings generally retain more visual detail."
            }
          },
          {
            "@type": "Question",
            "name": "What file formats are supported for batch compression?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "The tool accepts images supported by your browser decoder and exports JPEG files. Transparency becomes white, and animation is not preserved."
            }
          },
          {
            "@type": "Question",
            "name": "How much space can I save with batch compression?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "File-size reduction varies with the source image, dimensions, format, and selected quality setting."
            }
          },
          {
            "@type": "Question",
            "name": "Can I download all compressed images at once?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Click Download All to upload generated JPEG files to the download-result service and open a result page for each image. Additional tabs may be blocked by your browser."
            }
          },
          {
            "@type": "Question",
            "name": "Is batch image compression really free?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "You can compress multiple supported images using the available batch controls without creating an account."
            }
          }
        ]
      })}</script>

      {/* Related Tools */}
      <div className="py-12 px-4 md:px-8 bg-gray-50 border-t border-gray-200">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Related Image Tools</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <Link href="/all-tools/compress-image" className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-200 hover:border-green-500 hover:shadow-md transition">
              <span className="text-green-600 font-bold">→</span>
              <div><span className="text-gray-900 font-medium hover:text-green-600">Image Compressor</span><p className="text-xs text-gray-600">Single image compression</p></div>
            </Link>
            <Link href="/all-tools/batch-resize-images" className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-200 hover:border-green-500 hover:shadow-md transition">
              <span className="text-green-600 font-bold">→</span>
              <div><span className="text-gray-900 font-medium hover:text-green-600">Batch Resize Images</span><p className="text-xs text-gray-600">Resize multiple files</p></div>
            </Link>
            <Link href="/all-tools/crop-image" className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-200 hover:border-green-500 hover:shadow-md transition">
              <span className="text-green-600 font-bold">→</span>
              <div><span className="text-gray-900 font-medium hover:text-green-600">Crop Image</span><p className="text-xs text-gray-600">Remove unwanted areas</p></div>
            </Link>
            <Link href="/all-tools/jpg-to-png" className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-200 hover:border-green-500 hover:shadow-md transition">
              <span className="text-green-600 font-bold">→</span>
              <div><span className="text-gray-900 font-medium hover:text-green-600">JPG to PNG Converter</span><p className="text-xs text-gray-600">Format conversion</p></div>
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
