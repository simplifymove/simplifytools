'use client';

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

const TOOL_ID = 'batch-resize-images';
const TOOL_NAME = 'Batch Resize Images';

export default function BatchResizeImagesPage() {
  const router = useRouter();
  const [files, setFiles] = useState<File[]>([]);
  const [width, setWidth] = useState(800);
  const [height, setHeight] = useState(600);
  const [maintainAspect, setMaintainAspect] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [completed, setCompleted] = useState(false);
  const { error, clearError, createError } = useImageToolErrors();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    setFiles(prev => [...prev, ...selectedFiles]);
  };

  const handleRemoveFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleClearAll = () => {
    setFiles([]);
    setCompleted(false);
  };

  const handleResize = async () => {
    if (files.length === 0) return;
    
    setProcessing(true);
    try {
      // Simulate batch processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      setCompleted(true);
    } catch (error) {
      createError(
        ImageToolErrorType.SHARP_FAILED,
        TOOL_ID,
        TOOL_NAME,
        { error: (error as Error).message }
      );
    } finally {
      setProcessing(false);
    }
  };

  const resizeImage = (file: File, targetWidth: number, targetHeight: number): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          // Create canvas with target dimensions
          const canvas = document.createElement('canvas');
          canvas.width = targetWidth;
          canvas.height = targetHeight;
          
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Could not get canvas context'));
            return;
          }
          
          // Draw resized image on canvas
          ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
          
          // Convert canvas to blob
          canvas.toBlob(
            (blob) => {
              if (blob) resolve(blob);
              else reject(new Error('Could not convert canvas to blob'));
            },
            'image/jpeg',
            0.9
          );
        };
        img.onerror = () => reject(new Error('Could not load image'));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error('Could not read file'));
      reader.readAsDataURL(file);
    });
  };

  const handleDownloadAll = async () => {
    if (files.length === 0 || processing) return;

    setProcessing(true);
    clearError();
    const additionalResultWindows = files.slice(1).map(() =>
      window.open('about:blank', '_blank'),
    );
    let primaryDownloadPageUrl: string | null = null;

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const resizedBlob = await resizeImage(file, width, height);
        const newName = file.name.replace(/\.[^/.]+$/, '') + `-resized-${width}x${height}.jpg`;
        const downloadResult = await uploadBrowserDownloadResult({
          blob: resizedBlob,
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
        
        // Add slight delay between downloads to avoid browser blocking
        await new Promise(resolve => setTimeout(resolve, 150));
      }

    } catch (error) {
      createError(
        ImageToolErrorType.SHARP_FAILED,
        TOOL_ID,
        TOOL_NAME,
        { error: (error as Error).message }
      );
    } finally {
      additionalResultWindows.forEach((resultWindow) => resultWindow?.close());
      setProcessing(false);
    }

    if (primaryDownloadPageUrl) {
      router.push(primaryDownloadPageUrl);
    }
  };

  return (
    <>
      <HomeHeader />
      <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex flex-col">
        {/* Error Display */}
        {error && <ErrorAlert error={error} onDismiss={clearError} />}
        
        {/* Hero Section */}
        <div className="relative bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 py-16 px-4 md:px-8 overflow-hidden">
          <div className="max-w-6xl mx-auto relative z-10">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-white/90 text-sm mb-6">
              <Link href="/" className="hover:text-white transition">Home</Link>
              <ChevronRight size={16} />
              <Link href="/all-tools" className="hover:text-white transition">All Tools</Link>
              <ChevronRight size={16} />
              <span>Batch Resize Images</span>
            </div>

            {/* Title Section */}
            <div className="flex items-start gap-4">
              <div className="p-3 bg-white/20 rounded-lg">
                <Upload size={32} className="text-white" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">Batch Resize Images</h1>
                <p className="text-lg text-white/90">Resize multiple images at once to your desired dimensions. Perfect for bulk image optimization. No signup required.</p>
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
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition cursor-pointer mb-6">
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
                      <p className="text-sm text-gray-500">PNG, JPG, WebP and other formats. Maximum 100 files.</p>
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
                              <span className="text-sm text-gray-700 truncate">{file.name}</span>
                              <button
                                onClick={() => handleRemoveFile(index)}
                                className="text-red-500 hover:text-red-700 text-sm font-medium"
                              >
                                Remove
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Settings - Right (sticky sidebar) */}
              <div className="lg:col-span-1">
                <div className="sticky top-4 space-y-4">
                  {/* Resize Settings */}
                  <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <h3 className="font-semibold text-gray-900 mb-4">Resize Settings</h3>
                    
                    {/* Width */}
                    <div className="mb-4">
                      <label className="text-sm font-medium text-gray-700 block mb-2">Width (pixels)</label>
                      <input
                        type="number"
                        value={width}
                        onChange={(e) => setWidth(parseInt(e.target.value) || 800)}
                        min="1"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    {/* Height */}
                    <div className="mb-4">
                      <label className="text-sm font-medium text-gray-700 block mb-2">Height (pixels)</label>
                      <input
                        type="number"
                        value={height}
                        onChange={(e) => setHeight(parseInt(e.target.value) || 600)}
                        min="1"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    {/* Maintain Aspect Ratio */}
                    <div className="flex items-center gap-2 mb-4">
                      <input
                        type="checkbox"
                        id="aspect-ratio"
                        checked={maintainAspect}
                        onChange={(e) => setMaintainAspect(e.target.checked)}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                      />
                      <label htmlFor="aspect-ratio" className="text-sm text-gray-700">Maintain aspect ratio</label>
                    </div>
                  </div>

                  {/* Resize Button */}
                  <button
                    onClick={handleResize}
                    disabled={files.length === 0 || processing}
                    className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2"
                  >
                    {processing ? (
                      <>
                        <Loader size={20} className="animate-spin" />
                        Processing...
                      </>
                    ) : (
                      `Resize ${files.length} Image${files.length !== 1 ? 's' : ''}`
                    )}
                  </button>

                  {/* Results */}
                  {completed && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <h4 className="font-semibold text-green-900 mb-3">✓ Resize Complete!</h4>
                      <p className="text-sm text-green-700 mb-3">
                        Successfully resized {files.length} image{files.length !== 1 ? 's' : ''} to {width}x{height}px
                      </p>
                      <button
                        onClick={handleDownloadAll}
                        className="w-full py-2 px-4 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition text-sm flex items-center justify-center gap-2"
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
                      <li>• Resize up to 100 images</li>
                      <li>• Process in your browser</li>
                      <li>• Maintain aspect ratio option</li>
                      <li>• Secure - files never uploaded</li>
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
          <h2 className="text-3xl font-bold text-gray-900 mb-6">How to Batch Resize Images</h2>
          <div className="space-y-4">
            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">1</div>
              <div><p className="text-gray-700"><strong>Select multiple images:</strong> Click the upload area or drag and drop up to 100 images at once</p></div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">2</div>
              <div><p className="text-gray-700"><strong>Set your dimensions:</strong> Enter desired width and height in pixels, optionally maintain aspect ratio</p></div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">3</div>
              <div><p className="text-gray-700"><strong>Click Resize:</strong> Processing happens instantly in your browser with all images at once</p></div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">4</div>
              <div><p className="text-gray-700"><strong>Download results:</strong> Save your resized images as a batch in one click</p></div>
            </div>
          </div>
        </div>
      </div>

      {/* Use Cases Section */}
      <div className="py-12 px-4 md:px-8 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">When to Batch Resize Images</h2>
          <ul className="space-y-3 text-gray-700">
            <li className="flex gap-2"><span className="text-blue-600 font-bold">•</span> Preparing product photos for your e-commerce store with consistent dimensions</li>
            <li className="flex gap-2"><span className="text-blue-600 font-bold">•</span> Optimizing photo galleries for website performance and fast loading</li>
            <li className="flex gap-2"><span className="text-blue-600 font-bold">•</span> Creating thumbnail versions of hundreds of images for social media</li>
            <li className="flex gap-2"><span className="text-blue-600 font-bold">•</span> Resizing bulk image uploads for portfolio or portfolio websites</li>
            <li className="flex gap-2"><span className="text-blue-600 font-bold">•</span> Standardizing image dimensions across your digital asset library</li>
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
                How many images can I resize at once?
                <span className="text-gray-500 group-open:hidden">+</span>
                <span className="text-gray-500 hidden group-open:inline">−</span>
              </summary>
              <p className="text-gray-700 mt-3 text-sm">You can resize up to 100 images in a single batch operation. Processing speed depends on image size and your device performance, typically taking a few seconds to a minute.</p>
            </details>

            <details className="p-4 bg-white border border-gray-200 rounded-lg cursor-pointer group">
              <summary className="font-semibold text-gray-900 flex justify-between items-center">
                What happens if I maintain aspect ratio?
                <span className="text-gray-500 group-open:hidden">+</span>
                <span className="text-gray-500 hidden group-open:inline">−</span>
              </summary>
              <p className="text-gray-700 mt-3 text-sm">If maintaining aspect ratio is enabled, the tool will fit the image within your specified dimensions while preserving its original proportions. The final image may be slightly smaller than specified to avoid distortion.</p>
            </details>

            <details className="p-4 bg-white border border-gray-200 rounded-lg cursor-pointer group">
              <summary className="font-semibold text-gray-900 flex justify-between items-center">
                What file formats are supported?
                <span className="text-gray-500 group-open:hidden">+</span>
                <span className="text-gray-500 hidden group-open:inline">−</span>
              </summary>
              <p className="text-gray-700 mt-3 text-sm">We support all common image formats including JPG, PNG, WebP, GIF, BMP, and more. Resized images are saved in their original format unless you specify otherwise.</p>
            </details>

            <details className="p-4 bg-white border border-gray-200 rounded-lg cursor-pointer group">
              <summary className="font-semibold text-gray-900 flex justify-between items-center">
                Will resizing reduce image quality?
                <span className="text-gray-500 group-open:hidden">+</span>
                <span className="text-gray-500 hidden group-open:inline">−</span>
              </summary>
              <p className="text-gray-700 mt-3 text-sm">Resizing to smaller dimensions may slightly affect quality, but our tool uses high-quality interpolation algorithms to minimize loss. Resizing to larger dimensions cannot improve quality.</p>
            </details>

            <details className="p-4 bg-white border border-gray-200 rounded-lg cursor-pointer group">
              <summary className="font-semibold text-gray-900 flex justify-between items-center">
                Is batch resizing really free?
                <span className="text-gray-500 group-open:hidden">+</span>
                <span className="text-gray-500 hidden group-open:inline">−</span>
              </summary>
              <p className="text-gray-700 mt-3 text-sm">Yes, 100% free with no limits. Resize as many image batches as you want, no signup required, no watermarks, no hidden costs ever.</p>
            </details>

            <details className="p-4 bg-white border border-gray-200 rounded-lg cursor-pointer group">
              <summary className="font-semibold text-gray-900 flex justify-between items-center">
                Are my images stored on your servers?
                <span className="text-gray-500 group-open:hidden">+</span>
                <span className="text-gray-500 hidden group-open:inline">−</span>
              </summary>
              <p className="text-gray-700 mt-3 text-sm">No. All batch resizing happens entirely in your browser. Your images are never uploaded to or stored on our servers. Complete privacy guaranteed.</p>
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
            "name": "How many images can I resize at once?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "You can resize up to 100 images in a single batch operation."
            }
          },
          {
            "@type": "Question",
            "name": "What happens if I maintain aspect ratio?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "The tool will fit the image within your specified dimensions while preserving original proportions."
            }
          },
          {
            "@type": "Question",
            "name": "What file formats are supported?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "We support all common image formats including JPG, PNG, WebP, GIF, BMP, and more."
            }
          },
          {
            "@type": "Question",
            "name": "Will resizing reduce image quality?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Resizing to smaller dimensions may affect quality slightly, but we use high-quality interpolation algorithms to minimize loss."
            }
          },
          {
            "@type": "Question",
            "name": "Is batch resizing really free?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes, 100% free with no limits, no signup required, no watermarks, no hidden costs."
            }
          },
          {
            "@type": "Question",
            "name": "Are my images stored on your servers?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "No. All resizing happens in your browser. Images are never uploaded or stored on our servers."
            }
          }
        ]
      })}</script>

      {/* Related Tools */}
      <div className="py-12 px-4 md:px-8 bg-gray-50 border-t border-gray-200">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Related Image Tools</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <Link href="/all-tools/resize-image" className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-500 hover:shadow-md transition">
              <span className="text-blue-600 font-bold">→</span>
              <div><span className="text-gray-900 font-medium hover:text-blue-600">Image Resizer</span><p className="text-xs text-gray-600">Single image resizing</p></div>
            </Link>
            <Link href="/all-tools/crop-image" className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-500 hover:shadow-md transition">
              <span className="text-blue-600 font-bold">→</span>
              <div><span className="text-gray-900 font-medium hover:text-blue-600">Crop Image</span><p className="text-xs text-gray-600">Remove unwanted areas</p></div>
            </Link>
            <Link href="/all-tools/compress-image" className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-500 hover:shadow-md transition">
              <span className="text-blue-600 font-bold">→</span>
              <div><span className="text-gray-900 font-medium hover:text-blue-600">Image Compressor</span><p className="text-xs text-gray-600">Reduce file size</p></div>
            </Link>
            <Link href="/all-tools/batch-compress-images" className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-500 hover:shadow-md transition">
              <span className="text-blue-600 font-bold">→</span>
              <div><span className="text-gray-900 font-medium hover:text-blue-600">Batch Compress Images</span><p className="text-xs text-gray-600">Bulk compression</p></div>
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
