'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { HomeHeader } from '../../components/HomeHeader';
import { ImageUploader } from '../../components/ImageUploader';
import { Download, ChevronRight, RotateCcw } from 'lucide-react';
import { Footer } from '../../components/Footer';
import { uploadBrowserDownloadResult } from '@/app/lib/download-result-client';

export default function ReverseImagePage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [reverseType, setReverseType] = useState<'invert' | 'horizontalflip' | 'verticalflip'>('invert');
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<Blob | null>(null);
  const [error, setError] = useState<string>('');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    setError('');
    setResult(null);

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleClearPreview = () => {
    setFile(null);
    setPreview('');
    setResult(null);
  };

  const reverseImage = async () => {
    if (!file || !preview) {
      setError('Please upload an image first');
      return;
    }

    setProcessing(true);
    setError('');

    try {
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = img.width;
        canvas.height = img.height;

        if (reverseType === 'invert') {
          // Draw image normally first
          ctx.drawImage(img, 0, 0);

          // Get image data
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imageData.data;

          // Invert each pixel's RGB values
          for (let i = 0; i < data.length; i += 4) {
            data[i] = 255 - data[i];     // Red
            data[i + 1] = 255 - data[i + 1]; // Green
            data[i + 2] = 255 - data[i + 2]; // Blue
            // Alpha (i+3) remains unchanged
          }

          ctx.putImageData(imageData, 0, 0);
        } else if (reverseType === 'horizontalflip') {
          // Flip horizontally
          ctx.save();
          ctx.translate(canvas.width, 0);
          ctx.scale(-1, 1);
          ctx.drawImage(img, 0, 0);
          ctx.restore();
        } else if (reverseType === 'verticalflip') {
          // Flip vertically
          ctx.save();
          ctx.translate(0, canvas.height);
          ctx.scale(1, -1);
          ctx.drawImage(img, 0, 0);
          ctx.restore();
        }

        // Convert to blob
        canvas.toBlob(
          (blob) => {
            if (blob) {
              setResult(blob);
            }
            setProcessing(false);
          },
          'image/png',
          0.95
        );
      };
      img.onerror = () => {
        setError('Failed to load image');
        setProcessing(false);
      };
      img.src = preview;
    } catch (err) {
      setError('Error reversing image: ' + (err instanceof Error ? err.message : 'Unknown error'));
      setProcessing(false);
    }
  };

  const handleDownload = async () => {
    if (!result || !file) return;

    setProcessing(true);
    setError('');

    try {
      const downloadResult = await uploadBrowserDownloadResult({
        blob: result,
        toolSlug: 'reverse-image',
        originalName: file.name,
        outputName: 'reversed-image.png',
      });

      router.push(downloadResult.downloadPageUrl);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to prepare the download. Please try again.'
      );
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <HomeHeader />

      {/* Hero Header */}
      <div className="bg-orange-500 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-16">
          <div className="flex items-center gap-2 text-white/90 text-sm mb-6">
            <Link href="/" className="hover:text-white transition">Home</Link>
            <ChevronRight size={16} />
            <Link href="/all-tools" className="hover:text-white transition">All Tools</Link>
            <ChevronRight size={16} />
            <span>Reverse Image</span>
          </div>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">Reverse Image</h1>
              <p className="text-white/90 text-lg">
                Invert colors or flip images in any direction
              </p>
            </div>
            <div className="bg-white/20 rounded-2xl p-4 shadow-lg hidden md:block">
              <RotateCcw size={40} className="text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main>
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Section - Upload */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Upload Image</h2>
              <ImageUploader onFileSelect={handleFileSelect} preview={preview} onClearPreview={handleClearPreview} accept="image/*" />
              {file && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    📁 {file.name}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Center Section - Preview */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Preview</h2>
              <div className="flex items-center justify-center bg-gray-100 rounded-lg overflow-hidden min-h-64">
                {result ? (
                  <img
                    src={URL.createObjectURL(result)}
                    alt="Reversed preview"
                    className="max-h-64 max-w-full object-contain"
                  />
                ) : preview ? (
                  <img
                    src={preview}
                    alt="Original preview"
                    className="max-h-64 max-w-full object-contain"
                  />
                ) : (
                  <div className="text-gray-400 text-center">
                    <p className="text-sm">Upload an image to preview</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Section - Controls Sidebar */}
          <div className="lg:col-span-1 lg:sticky lg:top-6 lg:h-fit">
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Reverse Options</h2>

              {/* Reverse Type Selection */}
              <div className="space-y-3 mb-6">
                <label className="flex items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-orange-300 transition" onClick={() => setReverseType('invert')}>
                  <input
                    type="radio"
                    name="reverseType"
                    value="invert"
                    checked={reverseType === 'invert'}
                    onChange={(e) => setReverseType(e.target.value as 'invert' | 'horizontalflip' | 'verticalflip')}
                    className="w-4 h-4 accent-orange-500 cursor-pointer"
                  />
                  <div className="ml-3">
                    <span className="font-medium text-gray-700 block">Invert Colors</span>
                    <span className="text-xs text-gray-500">Create a negative effect</span>
                  </div>
                </label>

                <label className="flex items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-orange-300 transition" onClick={() => setReverseType('horizontalflip')}>
                  <input
                    type="radio"
                    name="reverseType"
                    value="horizontalflip"
                    checked={reverseType === 'horizontalflip'}
                    onChange={(e) => setReverseType(e.target.value as 'invert' | 'horizontalflip' | 'verticalflip')}
                    className="w-4 h-4 accent-orange-500 cursor-pointer"
                  />
                  <div className="ml-3">
                    <span className="font-medium text-gray-700 block">Flip Horizontally</span>
                    <span className="text-xs text-gray-500">Mirror left to right</span>
                  </div>
                </label>

                <label className="flex items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-orange-300 transition" onClick={() => setReverseType('verticalflip')}>
                  <input
                    type="radio"
                    name="reverseType"
                    value="verticalflip"
                    checked={reverseType === 'verticalflip'}
                    onChange={(e) => setReverseType(e.target.value as 'invert' | 'horizontalflip' | 'verticalflip')}
                    className="w-4 h-4 accent-orange-500 cursor-pointer"
                  />
                  <div className="ml-3">
                    <span className="font-medium text-gray-700 block">Flip Vertically</span>
                    <span className="text-xs text-gray-500">Mirror top to bottom</span>
                  </div>
                </label>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              {/* Reverse Button */}
              <button
                onClick={reverseImage}
                disabled={!file || processing}
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-3 px-4 rounded-lg transition mb-3 flex items-center justify-center gap-2"
              >
                <RotateCcw size={18} className={processing ? 'animate-spin' : ''} />
                {processing ? 'Processing...' : 'Reverse Image'}
              </button>

              {/* Download Button */}
              {result && (
                <button
                  onClick={handleDownload}
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-3 px-4 rounded-lg transition flex items-center justify-center gap-2"
                >
                  <Download size={18} />
                  Download PNG
                </button>
              )}
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mt-6">
              <h3 className="font-bold text-blue-900 mb-2">💡 About This Tool</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Invert colors for negative effect</li>
                <li>• Flip horizontally (mirror left-right)</li>
                <li>• Flip vertically (mirror up-down)</li>
                <li>• Works with common browser-supported image formats</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Hidden Canvas */}
      <canvas ref={canvasRef} className="hidden" />

        <section className="bg-white border-t border-gray-200 px-4 md:px-8 py-14">
          <div className="max-w-6xl mx-auto space-y-10">

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                How to reverse, invert, or flip an image online
              </h2>
              <p className="text-gray-600 leading-7">
                Upload an image, choose Invert Colors, Flip Horizontally, or
                Flip Vertically, and click Reverse Image. The selected effect
                is applied in your browser using an image canvas. Preview the
                result and use Download PNG to save the processed image.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="border border-gray-200 rounded-xl p-6">
                <h3 className="font-bold text-gray-900 mb-2">
                  Invert image colors
                </h3>
                <p className="text-sm text-gray-600 leading-6">
                  Invert Colors creates a negative-style effect by reversing
                  the red, green, and blue values of each pixel. Dark areas
                  become light, light areas become dark, and colors shift to
                  their inverted RGB values. Image transparency is preserved
                  during this operation.
                </p>
              </div>

              <div className="border border-gray-200 rounded-xl p-6">
                <h3 className="font-bold text-gray-900 mb-2">
                  Flip an image horizontally
                </h3>
                <p className="text-sm text-gray-600 leading-6">
                  A horizontal flip mirrors the image from left to right.
                  Objects originally on the left move to the right and objects
                  on the right move to the left. This is useful for creating a
                  mirror image or changing the direction a subject faces.
                </p>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Flip an image vertically
              </h2>
              <p className="text-gray-600 leading-7">
                A vertical flip mirrors the image from top to bottom. Content
                near the top moves to the bottom while content near the bottom
                moves to the top. Unlike rotation, the image is reflected
                across a horizontal axis without turning it 180 degrees.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="border border-gray-200 rounded-xl p-6">
                <h3 className="font-bold text-gray-900 mb-2">
                  Flip vs rotate: what is the difference?
                </h3>
                <p className="text-sm text-gray-600 leading-6">
                  Flipping reflects an image across an axis, while rotation
                  turns the entire image around a point. A horizontal flip
                  creates a left-to-right mirror. A vertical flip creates a
                  top-to-bottom mirror. Neither operation is the same as
                  rotating the image by 90 or 180 degrees.
                </p>
              </div>

              <div className="border border-gray-200 rounded-xl p-6">
                <h3 className="font-bold text-gray-900 mb-2">
                  What happens to the output format?
                </h3>
                <p className="text-sm text-gray-600 leading-6">
                  The processed result is exported as a PNG image. This means
                  an uploaded image may have a different file format from the
                  downloaded result. The canvas keeps the original image
                  dimensions while applying the selected reversal effect.
                </p>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Browser-based image processing
              </h2>
              <p className="text-gray-600 leading-7">
                The inversion and flip operations are performed with the
                browser&apos;s Canvas API. The uploaded image is loaded into a
                canvas, the selected transformation is applied, and the
                processed canvas is converted to a PNG result. Supported input
                formats therefore depend on formats your browser can decode.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Common uses for reversing and flipping images
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  'Create a left-to-right mirror image',
                  'Reverse the direction of a subject',
                  'Create a photographic negative-style effect',
                  'Flip scanned or captured images',
                  'Prepare mirrored graphics for design work',
                  'Correct images that appear reversed',
                ].map((item) => (
                  <div
                    key={item}
                    className="border border-gray-200 rounded-lg p-4 text-sm text-gray-600"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Reverse Image FAQ
              </h2>

              <div className="space-y-4">
                {[
                  [
                    'Can I mirror an image from left to right?',
                    'Yes. Choose Flip Horizontally to create a left-to-right mirror of the uploaded image.',
                  ],
                  [
                    'Can I flip an image upside down?',
                    'Choose Flip Vertically to reflect the image from top to bottom.',
                  ],
                  [
                    'What does Invert Colors do?',
                    'It reverses the RGB color values of the pixels to create a negative-style color effect while leaving the alpha channel unchanged.',
                  ],
                  [
                    'Does reversing an image change its dimensions?',
                    'No. The canvas uses the original image width and height, so the processed image keeps the same pixel dimensions.',
                  ],
                  [
                    'What format is the downloaded image?',
                    'The processed result is exported and downloaded as a PNG file.',
                  ],
                  [
                    'Are the image effects processed on the server?',
                    'The actual color inversion and flip transformations are performed in your browser using a canvas.',
                  ],
                ].map(([question, answer]) => (
                  <div
                    key={question}
                    className="border border-gray-200 rounded-xl p-5"
                  >
                    <h3 className="font-bold text-gray-900 mb-2">{question}</h3>
                    <p className="text-sm text-gray-600 leading-6">{answer}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </section>

</main>

      <Footer />
    </div>
  );
}







