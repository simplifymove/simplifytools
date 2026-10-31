'use client';
import { FAQAnswer, FAQDisclosure, FAQHeading, FAQList, FAQPanel, FAQQuestion } from '@/app/components/FAQDesign';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { Download, ChevronRight, Loader, RotateCw } from 'lucide-react';
import { ImageUploader } from '../../components/ImageUploader';
import { rotateImage } from '../../lib/imageTools';
import { HomeHeader } from '../../components/HomeHeader';
import { Footer } from '../../components/Footer';
import { useImageToolErrors } from '@/app/hooks/useImageToolErrors';
import {
  validateImageNotEmpty,
  validateImageExtension,
  validateImageMimeType,
  validateImageFileSize,
} from '@/app/utils/validation/image-validation';
import { ImageToolErrorType } from '@/app/utils/types/errors';
import { ErrorAlert } from '@/app/components/error-components';
import { useRouter } from 'next/navigation';
import { uploadBrowserDownloadResult } from '@/app/lib/download-result-client';

const TOOL_ID = 'rotate-image';
const TOOL_NAME = 'Rotate Image';

export default function RotateImagePage() {
    const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [rotation, setRotation] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<Blob | null>(null);
  const operationId = useRef(0);
  const processingRef = useRef(false);

  const updateRotation = (angle: number) => {
    const normalized = ((angle % 360) + 360) % 360;
    operationId.current += 1;
    processingRef.current = false;
    setProcessing(false);
    setResult(null);
    setRotation(normalized);
  };
  const { error, clearError, createError } = useImageToolErrors();

  const handleFileSelect = (selectedFile: File) => {
    operationId.current += 1;
    processingRef.current = false;
    setProcessing(false);
    setResult(null);
    setPreview(null);
    clearError();
    setFile(selectedFile);
    setRotation(0);
    const reader = new FileReader();
    const currentOperation = operationId.current;
    reader.onload = (e) => {
      if (currentOperation !== operationId.current) return;
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleClearPreview = () => {
    operationId.current += 1;
    processingRef.current = false;
    setProcessing(false);
    setFile(null);
    setPreview(null);
    setResult(null);
    setRotation(0);
    clearError();
  };

  const quickRotate = (degrees: number) => {
    updateRotation(rotation + degrees);
  };

  const handleRotate = async () => {
    if (processingRef.current) return;

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

    const currentOperation = ++operationId.current;
    processingRef.current = true;
    setProcessing(true);
    setResult(null);

    try {
      const rotated = await rotateImage(file, rotation);
      if (currentOperation !== operationId.current) return;
      setResult(rotated.blob);
    } catch (err) {
      if (currentOperation !== operationId.current) return;
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
        }
      );
    } finally {
      if (currentOperation === operationId.current) {
        processingRef.current = false;
        setProcessing(false);
      }
    }
  };

  const handleDownload = async () => {
      if (!result || processing) return;


      setProcessing(true);

      try {
        const downloadResult =
          await uploadBrowserDownloadResult({
            blob: result,
            toolSlug: 'rotate-image',
            originalName: `rotated-${rotation}.png`,
            outputName: `rotated-${rotation}.png`,
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
              <span>Image Rotator</span>
            </div>

            {/* Title Section */}
            <div className="flex items-start gap-4">
              <div className="p-3 bg-white/20 rounded-lg">
                <RotateCw size={32} className="text-white" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">Image Rotator</h1>
                <p className="text-lg text-white/90">Rotate your images by any angle. Use quick buttons or enter custom degrees.</p>
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
                  {file && (
                    <p className="mt-4 text-sm text-gray-600">
                      File: <span className="font-semibold text-gray-900">{file.name}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Controls - Right (sticky sidebar) */}
              <div className="lg:col-span-1">
                <div className="sticky top-4 space-y-4">
                  {/* Options */}
                  <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <h3 className="font-semibold text-gray-900 mb-4">Rotation Settings</h3>

                    {/* Quick Rotate Buttons */}
                    <div className="mb-4">
                      <label className="text-sm font-medium text-gray-700 block mb-2">
                        Quick Rotate
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => quickRotate(90)}
                          className="px-3 py-2 bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100 transition-colors text-sm font-medium border border-orange-200"
                        >
                          +90°
                        </button>
                        <button
                          onClick={() => quickRotate(180)}
                          className="px-3 py-2 bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100 transition-colors text-sm font-medium border border-orange-200"
                        >
                          +180°
                        </button>
                        <button
                          onClick={() => quickRotate(270)}
                          className="px-3 py-2 bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100 transition-colors text-sm font-medium border border-orange-200"
                        >
                          +270°
                        </button>
                        <button
                          onClick={() => updateRotation(0)}
                          className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                        >
                          Reset
                        </button>
                      </div>
                    </div>

                    {/* Rotation Slider */}
                    <div className="mb-4">
                      <label className="text-sm font-medium text-gray-700 block mb-2">
                        Custom Angle: {rotation}°
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="360"
                        value={rotation}
                        onChange={(e) => updateRotation(parseInt(e.target.value, 10))}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-2">
                        <span>0°</span>
                        <span>180°</span>
                        <span>360°</span>
                      </div>
                    </div>

                    {/* Manual Degree Input */}
                    <div>
                      <label className="text-sm font-medium text-gray-700 block mb-2">
                        Enter Degrees
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="360"
                        value={rotation}
                        onChange={(e) => updateRotation(parseInt(e.target.value, 10) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Rotate Button */}
                  <button
                    onClick={handleRotate}
                    disabled={!file || processing}
                    className="w-full py-3 px-6 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2"
                  >
                    {processing ? (
                      <>
                        <Loader size={20} className="animate-spin" />
                        Rotating...
                      </>
                    ) : (
                      <>
                        <RotateCw size={20} />
                        Rotate Image
                      </>
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

                  {/* Success Box */}
                  {result && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <h4 className="font-semibold text-green-900 mb-2">✓ Rotation Complete!</h4>
                      <p className="text-sm text-green-800">Your image has been successfully rotated by {rotation}°.</p>
                    </div>
                  )}

                  {/* Info Box */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-900 mb-2">About</h3>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Quick rotate buttons (90°, 180°, 270°)</li>
                      <li>• Custom angle slider (0-360°)</li>
                      <li>• Manual degree input</li>
                      <li>• Instant processing</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <section className="bg-white border-t border-gray-200 px-4 md:px-8 py-14">
          <div className="max-w-6xl mx-auto space-y-9">

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                How to rotate an image
              </h2>
              <p className="text-gray-600 leading-7">

                Upload an image and choose the required rotation angle. The
                tool changes the orientation of the image and provides a
                preview so you can check the result before downloading it.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="border border-gray-200 rounded-xl p-6">
                <h3 className="font-semibold text-gray-900 mb-2">
                  What the tool changes
                </h3>
                <p className="text-sm text-gray-600 leading-6">
                  Rotation changes image orientation. Depending on the angle and output encoding, the processed file may differ from the original in dimensions, file size, or encoded pixel values.
                </p>
              </div>

              <div className="border border-gray-200 rounded-xl p-6">
                <h3 className="font-semibold text-gray-900 mb-2">
                  Check the preview
                </h3>
                <p className="text-sm text-gray-600 leading-6">
                  Review the processed image before downloading it. The final
                  appearance depends on the source image and the settings you
                  select.
                </p>
              </div>
            </div>



          </div>
        </section>

</main>

      {/* How To Section */}
      <div className="py-12 px-4 md:px-8 bg-white border-t border-gray-200">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">How to Rotate Images</h2>
          <div className="space-y-4">
            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-600 text-white flex items-center justify-center font-bold text-sm">1</div>
              <div><p className="text-gray-700"><strong>Upload your image:</strong> Select a photo from your device</p></div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-600 text-white flex items-center justify-center font-bold text-sm">2</div>
              <div><p className="text-gray-700"><strong>Choose rotation method:</strong> Use quick buttons (90°, 180°, 270°), slider, or enter custom degrees</p></div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-600 text-white flex items-center justify-center font-bold text-sm">3</div>
              <div><p className="text-gray-700"><strong>Click Rotate Image:</strong> Apply the selected rotation using the browser image-processing workflow</p></div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-600 text-white flex items-center justify-center font-bold text-sm">4</div>
              <div><p className="text-gray-700"><strong>Download your result:</strong> Save the rotated image to your device</p></div>
            </div>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="py-12 px-4 md:px-8 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Why Rotate Images?</h2>
          <ul className="space-y-3 text-gray-700">
            <li className="flex gap-2"><span className="text-orange-600 font-bold">•</span> Fix sideways photos - correct images taken in the wrong orientation</li>
            <li className="flex gap-2"><span className="text-orange-600 font-bold">•</span> Adjust composition - rotate by the required angle and review the resulting frame</li>
            <li className="flex gap-2"><span className="text-orange-600 font-bold">•</span> Prepare for printing - get images to the right orientation before printing</li>
            <li className="flex gap-2"><span className="text-orange-600 font-bold">•</span> Align graphics - rotate logos and designs to match your layout</li>
            <li className="flex gap-2"><span className="text-orange-600 font-bold">•</span> Rotation changes image orientation while retaining the visible source content</li>
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
                Can I rotate images by any angle?


              </FAQQuestion>
              <FAQAnswer>Yes, use the slider for 1° precision from 0-360° or enter custom degrees manually for exact control.</FAQAnswer>
            </FAQDisclosure>

            <FAQDisclosure>
              <FAQQuestion>
                What formats does the image rotator support?


              </FAQQuestion>
              <FAQAnswer>All common formats: JPG, PNG, WebP, GIF, BMP, and more. Output is saved as PNG.</FAQAnswer>
            </FAQDisclosure>

            <FAQDisclosure>
              <FAQQuestion>
                Will my image quality be affected by rotation?


              </FAQQuestion>
              <FAQAnswer>Rotation changes image orientation and the result is encoded again as PNG. Depending on the angle, canvas geometry and pixel mapping can differ from the source, so review the generated image before use.</FAQAnswer>
            </FAQDisclosure>

            <FAQDisclosure>
              <FAQQuestion>
                How do I rotate an image 45 degrees?


              </FAQQuestion>
              <FAQAnswer>Use the custom angle slider or enter "45" in the degree input field for precise rotation.</FAQAnswer>
            </FAQDisclosure>

            <FAQDisclosure>
              <FAQQuestion>
                Can I preview before downloading?


              </FAQQuestion>
              <FAQAnswer>Yes, after clicking Rotate Image, you'll see the success message and can download immediately.</FAQAnswer>
            </FAQDisclosure>

            <FAQDisclosure>
              <FAQQuestion>
                Is image rotation completely free?


              </FAQQuestion>
              <FAQAnswer>Yes, You can use the tool to rotate supported images to the required orientation.</FAQAnswer>
            </FAQDisclosure>
          </FAQList>
        </FAQPanel>
      </div>

      <script type="application/ld+json">{JSON.stringify({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
          { "@type": "Question", "name": "Can I rotate images by any angle?", "acceptedAnswer": { "@type": "Answer", "text": "Yes, use the slider for 1° precision from 0-360° or enter custom degrees." } },
          { "@type": "Question", "name": "What formats does the image rotator support?", "acceptedAnswer": { "@type": "Answer", "text": "All common formats including JPG, PNG, WebP, GIF, BMP." } },
          { "@type": "Question", "name": "Will my image quality be affected by rotation?", "acceptedAnswer": { "@type": "Answer", "text": "Rotation changes image orientation and the result is encoded again as PNG. Review the generated image because angle, canvas geometry, and pixel mapping can affect the output." } },
          { "@type": "Question", "name": "How do I rotate an image 45 degrees?", "acceptedAnswer": { "@type": "Answer", "text": "Use the custom angle slider or enter 45 in the degree input field." } },
          { "@type": "Question", "name": "Can I preview before downloading?", "acceptedAnswer": { "@type": "Answer", "text": "Yes, after clicking Rotate Image, you'll see the success message." } },
          { "@type": "Question", "name": "Is image rotation completely free?", "acceptedAnswer": { "@type": "Answer", "text": "You can use the tool to rotate supported images." } }
        ]
      })}</script>

      {/* Related Tools */}
      <div className="py-12 px-4 md:px-8 bg-gray-50 border-t border-gray-200">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Related Image Editors</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <Link href="/all-tools/crop-image" className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-200 hover:border-orange-500 hover:shadow-md transition">
              <span className="text-orange-600 font-bold">→</span>
              <div><span className="text-gray-900 font-medium hover:text-orange-600">Crop Image</span><p className="text-xs text-gray-600">Trim unwanted areas</p></div>
            </Link>
            <Link href="/all-tools/flip-image" className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-200 hover:border-orange-500 hover:shadow-md transition">
              <span className="text-orange-600 font-bold">→</span>
              <div><span className="text-gray-900 font-medium hover:text-orange-600">Flip Image</span><p className="text-xs text-gray-600">Mirror horizontally/vertically</p></div>
            </Link>
            <Link href="/all-tools/resize-image" className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-200 hover:border-orange-500 hover:shadow-md transition">
              <span className="text-orange-600 font-bold">→</span>
              <div><span className="text-gray-900 font-medium hover:text-orange-600">Resize Image</span><p className="text-xs text-gray-600">Change dimensions</p></div>
            </Link>
            <Link href="/all-tools/compress-image" className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-200 hover:border-orange-500 hover:shadow-md transition">
              <span className="text-orange-600 font-bold">→</span>
              <div><span className="text-gray-900 font-medium hover:text-orange-600">Image Compressor</span><p className="text-xs text-gray-600">Reduce file size</p></div>
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}








