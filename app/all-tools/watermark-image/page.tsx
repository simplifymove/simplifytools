'use client';

import React, { useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { Download, ChevronRight, Loader, Type } from 'lucide-react';
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
import { useRouter } from 'next/navigation';
import { uploadBrowserDownloadResult } from '@/app/lib/download-result-client';

const TOOL_ID = 'watermark-image';
const TOOL_NAME = 'Watermark Image';

export default function WatermarkImagePage() {
    const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [watermarkText, setWatermarkText] = useState('© 2024');
  const [fontSize, setFontSize] = useState(40);
  const [opacity, setOpacity] = useState(0.7);
  const [position, setPosition] = useState('bottom-right');
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<Blob | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { error, clearError, createError } = useImageToolErrors();

  // Validate watermark parameters
  const validateWatermarkParams = useCallback((): boolean => {
    const errors: string[] = [];

    if (!watermarkText.trim()) {
      errors.push('Watermark text cannot be empty');
    } else if (watermarkText.length > 100) {
      errors.push('Watermark text must be 100 characters or less');
    }

    if (fontSize < 10 || fontSize > 200) {
      errors.push('Font size must be between 10px and 200px');
    }

    if (opacity < 0.1 || opacity > 1) {
      errors.push('Opacity must be between 10% and 100%');
    }

    if (!['top-left', 'top-right', 'bottom-left', 'bottom-right', 'center'].includes(position)) {
      errors.push('Invalid position selected');
    }

    setValidationErrors(errors);
    return errors.length === 0;
  }, [watermarkText, fontSize, opacity, position]);

  const handleFileSelect = useCallback((selectedFile: File) => {
    clearError();
    setValidationErrors([]);

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
    reader.onload = (event) => {
      setPreview(event.target?.result as string);
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
  }, [clearError, createError]);

  const applyWatermark = (): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      if (!preview || !canvasRef.current) {
        reject(new Error('No image loaded'));
        return;
      }

      if (!validateWatermarkParams()) {
        reject(new Error('Watermark validation failed'));
        return;
      }

      try {
        const img = new Image();
        img.onload = () => {
          const canvas = canvasRef.current!;

          // Validate canvas dimensions
          if (img.width > 16384 || img.height > 16384) {
            reject(new Error('Image dimensions exceed maximum allowed size (16384x16384px)'));
            return;
          }

          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Cannot get canvas context'));
            return;
          }

          ctx.drawImage(img, 0, 0);

          // Set watermark text properties
          ctx.font = `${fontSize}px Arial`;
          ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
          ctx.strokeStyle = `rgba(0, 0, 0, ${opacity * 0.5})`;
          ctx.lineWidth = 2;

          // Get text metrics for positioning
          const metrics = ctx.measureText(watermarkText);
          const textWidth = metrics.width;
          const textHeight = fontSize;

          // Calculate position
          let x = 10;
          let y = canvas.height - 20;

          if (position === 'top-left') {
            x = 10;
            y = textHeight + 10;
          } else if (position === 'top-right') {
            x = canvas.width - textWidth - 10;
            y = textHeight + 10;
          } else if (position === 'bottom-left') {
            x = 10;
            y = canvas.height - 10;
          } else if (position === 'bottom-right') {
            x = canvas.width - textWidth - 10;
            y = canvas.height - 10;
          } else if (position === 'center') {
            x = (canvas.width - textWidth) / 2;
            y = canvas.height / 2;
          }

          // Draw watermark
          ctx.strokeText(watermarkText, x, y);
          ctx.fillText(watermarkText, x, y);

          canvas.toBlob((blob) => {
            if (!blob) {
              reject(new Error('Failed to create blob'));
              return;
            }
            resolve(blob);
          }, 'image/jpeg', 0.9);
        };

        img.onerror = () => {
          reject(new Error('Failed to load image'));
        };

        img.src = preview;
      } catch (err) {
        reject(err instanceof Error ? err : new Error('Unknown error during watermark processing'));
      }
    });
  };

  const handleWatermark = async () => {
    if (!file) {
      createError(
        ImageToolErrorType.EMPTY_FILE,
        TOOL_ID,
        TOOL_NAME
      );
      return;
    }

    if (!watermarkText.trim()) {
      setValidationErrors(['Watermark text cannot be empty']);
      return;
    }

    clearError();
    setValidationErrors([]);
    setProcessing(true);

    try {
      const watermarked = await applyWatermark();
      setResult(watermarked);
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
      if (!result || processing) return;


      setProcessing(true);

      try {
        const downloadResult =
          await uploadBrowserDownloadResult({
            blob: result,
            toolSlug: 'watermark-image',
            originalName: 'watermarked.jpg',
            outputName: 'watermarked.jpg',
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

  const handleClearPreview = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setValidationErrors([]);
    clearError();
  };

  return (
    <>
      <HomeHeader />
      <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex flex-col">
        {/* Hero Section */}
        <div className="relative bg-gradient-to-r from-indigo-600 via-indigo-700 to-indigo-800 py-16 px-4 md:px-8 overflow-hidden">
          <div className="max-w-6xl mx-auto relative z-10">
            <div className="flex items-center gap-2 text-white/90 text-sm mb-6">
              <Link href="/" className="hover:text-white transition">Home</Link>
              <ChevronRight size={16} />
              <Link href="/all-tools" className="hover:text-white transition">All Tools</Link>
              <ChevronRight size={16} />
              <span>Watermark Image</span>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 bg-white/20 rounded-lg">
                <Type size={32} className="text-white" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">Watermark Image</h1>
                <p className="text-lg text-white/90">Add text watermarks to protect your images and add branding. Perfect for photos, artwork, and digital content.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 py-12 px-4 md:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Upload Section */}
              <div className="lg:col-span-2">
                {error && <ErrorAlert error={error} onDismiss={clearError} />}

                {validationErrors.length > 0 && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    {validationErrors.map((err, idx) => (
                      <p key={idx} className="text-red-700 text-sm">{err}</p>
                    ))}
                  </div>
                )}

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Step 1: Upload Image</h2>

                  <ImageUploader
                    onFileSelect={handleFileSelect}
                    preview={preview}
                    onClearPreview={handleClearPreview}
                    toolId={TOOL_ID}
                    onValidationError={() => {}}
                  />

                  {preview && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-4 mt-6">Preview</h3>
                      <img src={preview} alt="Preview" className="w-full rounded-lg mb-4" style={{ maxHeight: '400px' }} />
                    </div>
                  )}

                  <canvas ref={canvasRef} className="hidden" />
                </div>
              </div>

              {/* Controls */}
              <div className="lg:col-span-1">
                <div className="sticky top-4 space-y-4">
                  {/* Watermark Settings */}
                  <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <h3 className="font-semibold text-gray-900 mb-4">Watermark Settings</h3>

                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700 block mb-2">Text</label>
                        <input
                          type="text"
                          value={watermarkText}
                          onChange={(e) => setWatermarkText(e.target.value)}
                          maxLength={50}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          placeholder="© 2024"
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-700 block mb-2">
                          Font Size: {fontSize}px
                        </label>
                        <input
                          type="range"
                          min="10"
                          max="100"
                          step="5"
                          value={fontSize}
                          onChange={(e) => setFontSize(parseInt(e.target.value))}
                          className="w-full"
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-700 block mb-2">
                          Opacity: {Math.round(opacity * 100)}%
                        </label>
                        <input
                          type="range"
                          min="0.1"
                          max="1"
                          step="0.1"
                          value={opacity}
                          onChange={(e) => setOpacity(parseFloat(e.target.value))}
                          className="w-full"
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-700 block mb-2">Position</label>
                        <select
                          value={position}
                          onChange={(e) => setPosition(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        >
                          <option value="top-left">Top Left</option>
                          <option value="top-right">Top Right</option>
                          <option value="bottom-left">Bottom Left</option>
                          <option value="bottom-right">Bottom Right</option>
                          <option value="center">Center</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Watermark Button */}
                  <button
                    onClick={handleWatermark}
                    disabled={!file || !watermarkText || processing}
                    className="w-full py-3 px-6 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2"
                  >
                    {processing ? (
                      <>
                        <Loader size={20} className="animate-spin" />
                        Adding Watermark...
                      </>
                    ) : (
                      'Add Watermark'
                    )}
                  </button>

                  {(preview || result) && (
                    <button
                      onClick={handleClearPreview}
                      className="w-full py-2 px-4 bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium rounded-lg transition text-sm"
                    >
                      Clear
                    </button>
                  )}

                  {result && (
                    <button
                      onClick={handleDownload}
                      className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition text-sm flex items-center justify-center gap-2"
                    >
                      <Download size={16} />
                      Download
                    </button>
                  )}

                  {/* Info Box */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-900 mb-2">Tips</h3>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Add copyright text</li>
                      <li>• Adjust opacity</li>
                      <li>• Choose position</li>
                      <li>• Instant processing</li>
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
          <h2 className="text-3xl font-bold text-gray-900 mb-6">How to Watermark an Image</h2>
          <div className="space-y-4">
            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">1</div>
              <div><p className="text-gray-700"><strong>Upload your image:</strong> Click upload or drag and drop your image file</p></div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">2</div>
              <div><p className="text-gray-700"><strong>Enter watermark text:</strong> Type your copyright or branding text</p></div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">3</div>
              <div><p className="text-gray-700"><strong>Customize settings:</strong> Adjust font size, opacity, and position as needed</p></div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">4</div>
              <div><p className="text-gray-700"><strong>Download watermarked image:</strong> Prepare the watermarked image for download</p></div>
            </div>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="py-12 px-4 md:px-8 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Benefits of Image Watermarking</h2>
          <ul className="space-y-3 text-gray-700">
            <li className="flex gap-2"><span className="text-indigo-600 font-bold">•</span> Copyright protection - mark images with your name or brand</li>
            <li className="flex gap-2"><span className="text-indigo-600 font-bold">•</span> Prevent theft - discourage unauthorized use of your images</li>
            <li className="flex gap-2"><span className="text-indigo-600 font-bold">•</span> Brand consistency - add logos or company name to all images</li>
            <li className="flex gap-2"><span className="text-indigo-600 font-bold">•</span> Professional appearance - mark images as official or authentic</li>
            <li className="flex gap-2"><span className="text-indigo-600 font-bold">•</span> Social media branding - add watermarks to content for recognition</li>
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
                What text can I use for a watermark?
                <span className="text-gray-500 group-open:hidden">+</span>
                <span className="text-gray-500 hidden group-open:inline">−</span>
              </summary>
              <p className="text-gray-700 mt-3 text-sm">Any text up to 50 characters. Common options: © Year Name, Your Brand, Company Name, Photo Credit, or custom messages.</p>
            </details>

            <details className="p-4 bg-white border border-gray-200 rounded-lg cursor-pointer group">
              <summary className="font-semibold text-gray-900 flex justify-between items-center">
                Can I watermark multiple images at once?
                <span className="text-gray-500 group-open:hidden">+</span>
                <span className="text-gray-500 hidden group-open:inline">−</span>
              </summary>
              <p className="text-gray-700 mt-3 text-sm">Currently this tool watermarks one image at a time. For batch watermarking, repeat the process for each image or use Batch Watermark tool.</p>
            </details>

            <details className="p-4 bg-white border border-gray-200 rounded-lg cursor-pointer group">
              <summary className="font-semibold text-gray-900 flex justify-between items-center">
                Will watermarking affect image quality?
                <span className="text-gray-500 group-open:hidden">+</span>
                <span className="text-gray-500 hidden group-open:inline">−</span>
              </summary>
              <p className="text-gray-700 mt-3 text-sm">The watermark is applied to the image and the result is encoded as JPG at 90% quality, so some JPEG compression can occur.</p>
            </details>

            <details className="p-4 bg-white border border-gray-200 rounded-lg cursor-pointer group">
              <summary className="font-semibold text-gray-900 flex justify-between items-center">
                Can I remove a watermark I added?
                <span className="text-gray-500 group-open:hidden">+</span>
                <span className="text-gray-500 hidden group-open:inline">−</span>
              </summary>
              <p className="text-gray-700 mt-3 text-sm">Once applied, watermarks are permanent in the output image. Always keep your original unwatermarked image.</p>
            </details>

            <details className="p-4 bg-white border border-gray-200 rounded-lg cursor-pointer group">
              <summary className="font-semibold text-gray-900 flex justify-between items-center">
                What position is best for watermarks?
                <span className="text-gray-500 group-open:hidden">+</span>
                <span className="text-gray-500 hidden group-open:inline">−</span>
              </summary>
              <p className="text-gray-700 mt-3 text-sm">Bottom-right is most common and least intrusive. Use center for full protection. Position depends on your image composition.</p>
            </details>

            <details className="p-4 bg-white border border-gray-200 rounded-lg cursor-pointer group">
              <summary className="font-semibold text-gray-900 flex justify-between items-center">
                Is the watermark tool really free?
                <span className="text-gray-500 group-open:hidden">+</span>
                <span className="text-gray-500 hidden group-open:inline">−</span>
              </summary>
              <p className="text-gray-700 mt-3 text-sm">You can add a text watermark using the available controls without creating an account.</p>
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
            "name": "What text can I use for a watermark?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Any text up to 50 characters like © Year Name, Brand, Company Name, or custom messages."
            }
          },
          {
            "@type": "Question",
            "name": "Can I watermark multiple images at once?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Currently one at a time. For batch watermarking, repeat the process or use batch watermark tool."
            }
          },
          {
            "@type": "Question",
            "name": "Will watermarking affect image quality?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "The result is encoded as JPG at 90% quality, so some JPEG compression can occur."
            }
          },
          {
            "@type": "Question",
            "name": "Can I remove a watermark I added?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "No, once applied watermarks are permanent. Always keep your original unwatermarked image."
            }
          },
          {
            "@type": "Question",
            "name": "What position is best for watermarks?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Bottom-right is most common. Use center for full protection. Position depends on your image composition."
            }
          },
          {
            "@type": "Question",
            "name": "Is the watermark tool really free?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "You can add a text watermark using the available controls without creating an account."
            }
          }
        ]
      })}</script>

      {/* Related Tools */}
      <div className="py-12 px-4 md:px-8 bg-gray-50 border-t border-gray-200">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Related Tools</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link href="/all-tools/remove-watermark" className="p-4 bg-white rounded-lg border border-gray-200 hover:border-indigo-400 hover:shadow-md transition">
              <p className="font-semibold text-gray-900">Remove Watermark</p>
              <p className="text-sm text-gray-600">Remove watermarks from images</p>
            </Link>
            <Link href="/all-tools/crop-image" className="p-4 bg-white rounded-lg border border-gray-200 hover:border-indigo-400 hover:shadow-md transition">
              <p className="font-semibold text-gray-900">Crop Image</p>
              <p className="text-sm text-gray-600">Remove unwanted areas</p>
            </Link>
            <Link href="/all-tools/blur-image" className="p-4 bg-white rounded-lg border border-gray-200 hover:border-indigo-400 hover:shadow-md transition">
              <p className="font-semibold text-gray-900">Blur Image</p>
              <p className="text-sm text-gray-600">Add blur effects</p>
            </Link>
            <Link href="/all-tools/compress-image" className="p-4 bg-white rounded-lg border border-gray-200 hover:border-indigo-400 hover:shadow-md transition">
              <p className="font-semibold text-gray-900">Compress Image</p>
              <p className="text-sm text-gray-600">Reduce file size</p>
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}

