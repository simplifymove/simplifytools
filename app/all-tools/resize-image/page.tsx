'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Download, ChevronRight, Loader, Maximize2 } from 'lucide-react';
import { ImageUploader } from '../../components/ImageUploader';
import { resizeImage } from '../../lib/imageTools';
import { HomeHeader } from '../../components/HomeHeader';
import { useImageToolErrors } from '@/app/hooks/useImageToolErrors';
import {
  validateImageNotEmpty,
  validateImageExtension,
  validateImageMimeType,
  validateImageFileSize,
  validateResizeDimensions,
} from '@/app/utils/validation/image-validation';
import { ImageToolErrorType } from '@/app/utils/types/errors';
import { ErrorAlert } from '@/app/components/error-components';
import { useRouter } from 'next/navigation';
import { uploadBrowserDownloadResult } from '@/app/lib/download-result-client';
import { PriorityToolGuide } from '@/app/components/PriorityToolGuide';
import { Footer } from '@/app/components/Footer';

const TOOL_ID = 'resize-image';
const TOOL_NAME = 'Resize Image';

export default function ResizeImagePage() {
    const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [originalDimensions, setOriginalDimensions] = useState({ width: 0, height: 0 });
  const [width, setWidth] = useState(800);
  const [height, setHeight] = useState(600);
  const [maintainAspect, setMaintainAspect] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<Blob | null>(null);
  const { error, clearError, createError } = useImageToolErrors();
  const generationRef = useRef(0);
  const resizeInProgressRef = useRef(false);
  const previewUrlRef = useRef<string | null>(null);
  const [outputMime, setOutputMime] = useState('image/png');

  const invalidateResult = () => {
    generationRef.current += 1;
    setResult(null);
  };

  useEffect(() => {
    return () => {
      generationRef.current += 1;
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    };
  }, []);

  const handleFileSelect = (selectedFile: File) => {
    const generation = ++generationRef.current;
    clearError();
    setResult(null);
    setFile(null);
    setPreview(null);
    setOriginalDimensions({ width: 0, height: 0 });

    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    previewUrlRef.current = null;

    const emptyCheck = validateImageNotEmpty(selectedFile);
    const extensionCheck = validateImageExtension(selectedFile.name);
    const sizeCheck = validateImageFileSize(selectedFile, TOOL_ID);

    if (!emptyCheck.valid || !extensionCheck.valid || !sizeCheck.valid) {
      createError(
        !emptyCheck.valid
          ? ImageToolErrorType.EMPTY_FILE
          : !extensionCheck.valid
            ? ImageToolErrorType.UNSUPPORTED_FORMAT
            : ImageToolErrorType.FILE_TOO_LARGE,
        TOOL_ID,
        TOOL_NAME
      );
      return;
    }

    const url = URL.createObjectURL(selectedFile);
    previewUrlRef.current = url;
    const img = new Image();

    img.onload = () => {
      if (generation !== generationRef.current) return;

      const dimensions = {
        width: img.naturalWidth,
        height: img.naturalHeight,
      };

      if (!dimensions.width || !dimensions.height) {
        createError(ImageToolErrorType.INVALID_DIMENSIONS, TOOL_ID, TOOL_NAME);
        URL.revokeObjectURL(url);
        previewUrlRef.current = null;
        return;
      }

      setOriginalDimensions(dimensions);
      setWidth(dimensions.width);
      setHeight(dimensions.height);
      setFile(selectedFile);
      setPreview(url);
    };

    img.onerror = () => {
      if (generation !== generationRef.current) return;
      createError(ImageToolErrorType.UNSUPPORTED_FORMAT, TOOL_ID, TOOL_NAME);
      URL.revokeObjectURL(url);
      previewUrlRef.current = null;
    };

    img.src = url;
  };

  const handleClearPreview = () => {
    invalidateResult();
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    previewUrlRef.current = null;
    setFile(null);
    setPreview(null);
    setOriginalDimensions({ width: 0, height: 0 });
    setWidth(800);
    setHeight(600);
    clearError();
  };

  const handleWidthChange = (newWidth: number) => {
    invalidateResult();
    setWidth(newWidth);
    if (maintainAspect && originalDimensions.width > 0) {
      setHeight(newWidth > 0 ? Math.max(1, Math.round(
        newWidth * originalDimensions.height / originalDimensions.width
      )) : 0);
    }
  };

  const handleHeightChange = (newHeight: number) => {
    invalidateResult();
    setHeight(newHeight);
    if (maintainAspect && originalDimensions.height > 0) {
      setWidth(newHeight > 0 ? Math.max(1, Math.round(
        newHeight * originalDimensions.width / originalDimensions.height
      )) : 0);
    }
  };

  const handleResize = async () => {
    if (resizeInProgressRef.current) return;
    if (!file) {
      createError(
        ImageToolErrorType.EMPTY_FILE,
        TOOL_ID,
        TOOL_NAME
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

    const dimensionCheck = Number.isSafeInteger(width) && Number.isSafeInteger(height)
      ? validateResizeDimensions(width, height)
      : { valid: false, errorType: ImageToolErrorType.INVALID_RESIZE_DIMENSIONS };
    if (!dimensionCheck.valid) {
      createError(
        dimensionCheck.errorType || ImageToolErrorType.INVALID_RESIZE_DIMENSIONS,
        TOOL_ID,
        TOOL_NAME,
        { width, height }
      );
      return;
    }

    const generation = ++generationRef.current;
    resizeInProgressRef.current = true;
    setResult(null);
    setProcessing(true);
    try {
      const resized = await resizeImage(file, width, height, false);
      if (generation !== generationRef.current) return;
      setOutputMime(resized.blob.type || 'image/png');
      setResult(resized.blob);
    } catch (err) {
      if (generation !== generationRef.current) return;
      const errorMsg = err instanceof Error ? err.message : 'Unknown error occurred';
      createError(
        ImageToolErrorType.SHARP_FAILED,
        TOOL_ID,
        TOOL_NAME,
        { error: errorMsg },
        {
          filename: file.name,
          size: file.size,
          mimeType: file.type,
          width: originalDimensions.width,
          height: originalDimensions.height,
        }
      );
    } finally {
      resizeInProgressRef.current = false;
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
            toolSlug: 'resize-image',
            originalName: `resized-${width}x${height}.${outputMime === 'image/jpeg' ? 'jpg' : outputMime === 'image/webp' ? 'webp' : 'png'}`,
            outputName: `resized-${width}x${height}.${outputMime === 'image/jpeg' ? 'jpg' : outputMime === 'image/webp' ? 'webp' : 'png'}`,
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

  const resizePercentage = originalDimensions.width > 0
    ? ((width / originalDimensions.width) * 100).toFixed(0)
    : null;

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
              <span>Image Resizer</span>
            </div>

            {/* Title Section */}
            <div className="flex items-start gap-4">
              <div className="p-3 bg-white/20 rounded-lg">
                <Maximize2 size={32} className="text-white" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">Image Resizer</h1>
                <p className="text-lg text-white/90">Resize your images with custom dimensions and optional aspect ratio preservation.</p>
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
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Step 1: Upload Image</h2>
                  <ImageUploader
                    onFileSelect={handleFileSelect}
                     toolId="resize-image"
                    preview={preview}
                    onClearPreview={handleClearPreview}
                  />
                  {originalDimensions.width > 0 && (
                    <p className="mt-4 text-sm text-gray-600">
                      Original size: <span className="font-semibold text-gray-900">{originalDimensions.width} × {originalDimensions.height} px</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Controls - Right (sticky sidebar) */}
              <div className="lg:col-span-1">
                <div className="sticky top-4 space-y-4">
                  {/* Options */}
                  <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <h3 className="font-semibold text-gray-900 mb-4">Resize Settings</h3>

                    {/* Width Input */}
                    <div className="mb-4">
                      <label className="text-sm font-medium text-gray-700 block mb-2">
                        Width (px)
                      </label>
                      <input
                        type="number"
                        value={width}
                        onChange={(e) => handleWidthChange(parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                    </div>

                    {/* Height Input */}
                    <div className="mb-4">
                      <label className="text-sm font-medium text-gray-700 block mb-2">
                        Height (px)
                      </label>
                      <input
                        type="number"
                        value={height}
                        onChange={(e) => handleHeightChange(parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                    </div>

                    {/* Aspect Ratio Checkbox */}
                    <label className="flex items-center gap-2 cursor-pointer mb-4">
                      <input
                        type="checkbox"
                        checked={maintainAspect}
                        onChange={(e) => { invalidateResult(); setMaintainAspect(e.target.checked); }}
                        className="w-4 h-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                      />
                      <span className="text-sm font-medium text-gray-700">Maintain aspect ratio</span>
                    </label>
                  </div>

                  {/* Resize Button */}
                  <button
                    onClick={handleResize}
                    disabled={!file || processing || width < 1 || height < 1}
                    className="w-full py-3 px-6 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2"
                  >
                    {processing ? (
                      <>
                        <Loader size={20} className="animate-spin" />
                        Resizing...
                      </>
                    ) : (
                      'Resize Image'
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

                  {/* Preview Size Box */}
                  {resizePercentage && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-sm text-blue-800">
                        New size: <span className="font-semibold text-blue-900">{width} × {height} px</span>
                      </p>
                      <p className="text-xs text-blue-700 mt-1">
                        {resizePercentage}% of original
                      </p>
                    </div>
                  )}

                  {/* Success Box */}
                  {result && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <h4 className="font-semibold text-green-900 mb-2">✓ Resize Complete!</h4>
                      <p className="text-sm text-green-800">Your image has been successfully resized.</p>
                    </div>
                  )}

                  {/* Info Box */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-900 mb-2">About</h3>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Custom width & height</li>
                      <li>• Aspect ratio preservation</li>
                      <li>• Browser-decodable image formats</li>
                      <li>• Canvas-based resizing</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <PriorityToolGuide toolId="resize-image" />
      <Footer />

    </>
  );
}





