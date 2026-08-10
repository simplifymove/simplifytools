'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Download, ChevronRight, Square } from 'lucide-react';
import { ImageUploader } from '../../components/ImageUploader';
import { HomeHeader } from '../../components/HomeHeader';
import { Footer } from '../../components/Footer';
import { uploadBrowserDownloadResult } from '@/app/lib/download-result-client';

export default function AddBorderPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [borderWidth, setBorderWidth] = useState(20);
  const [borderColor, setBorderColor] = useState('#000000');
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    setError(null);
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
    setError(null);
  };

  const handleAddBorder = async () => {
    if (!file || !preview) {
      setError('Please upload an image first');
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Set canvas size to image + border
        canvas.width = img.width + borderWidth * 2;
        canvas.height = img.height + borderWidth * 2;

        // Draw border
        ctx.fillStyle = borderColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw image on top
        ctx.drawImage(img, borderWidth, borderWidth);

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
      setError((err as Error).message || 'Error adding border');
      setProcessing(false);
    }
  };

  const handleDownload = async () => {
    if (!result || !file) return;

    setProcessing(true);
    setError(null);

    try {
      const downloadResult = await uploadBrowserDownloadResult({
        blob: result,
        toolSlug: 'add-border',
        originalName: file.name,
        outputName: 'image-with-border.png',
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
    <>
      <HomeHeader />
      <main className="min-h-screen bg-linear-to-b from-slate-50 to-slate-100 flex flex-col">
        {/* Hero Header */}
        <div className="relative bg-orange-500 py-16 px-4 md:px-8 overflow-hidden">
          <div className="max-w-6xl mx-auto relative z-10">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-white/90 text-sm mb-6">
              <Link href="/" className="hover:text-white transition">Home</Link>
              <ChevronRight size={16} />
              <Link href="/all-tools" className="hover:text-white transition">All Tools</Link>
              <ChevronRight size={16} />
              <span>Add Border</span>
            </div>

            {/* Title Section */}
            <div className="flex items-start gap-4">
              <div className="p-3 bg-white/20 rounded-lg">
                <Square size={32} className="text-white" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">Add Border</h1>
                <p className="text-lg text-white/90">Add decorative borders to your images with custom width and color.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 py-12 px-4 md:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Upload Section */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Upload Image</h2>
                <ImageUploader
                  onFileSelect={handleFileSelect}
                  preview={preview}
                  onClearPreview={handleClearPreview}
                  accept="image/*"
                />
                {file && (
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
                    <p className="text-sm text-blue-800">📁 {file.name}</p>
                  </div>
                )}
              </div>

              {/* Preview Section */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Preview</h2>
                <div className="w-full h-80 bg-gray-100 rounded overflow-hidden flex items-center justify-center">
                  {result ? (
                    <img
                      src={URL.createObjectURL(result)}
                      alt="Border preview"
                      className="max-h-full max-w-full object-contain"
                    />
                  ) : preview ? (
                    <img
                      src={preview}
                      alt="Original"
                      className="max-h-full max-w-full object-contain"
                    />
                  ) : (
                    <div className="text-gray-400 text-center">
                      <p className="text-sm">Upload an image to preview</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Controls Section */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Border Settings</h2>

                {/* Border Width Control */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Border Width: {borderWidth}px
                  </label>
                  <input
                    type="range"
                    min="5"
                    max="100"
                    value={borderWidth}
                    onChange={(e) => setBorderWidth(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
                  />
                  <div className="text-xs text-gray-500 mt-1 flex justify-between">
                    <span>5px</span>
                    <span>100px</span>
                  </div>
                </div>

                {/* Border Color Control */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Border Color</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={borderColor}
                      onChange={(e) => setBorderColor(e.target.value)}
                      className="w-12 h-10 rounded cursor-pointer border border-gray-300"
                    />
                    <input
                      type="text"
                      value={borderColor}
                      readOnly
                      className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm font-mono"
                    />
                  </div>
                </div>

                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                )}

                {/* Action Buttons */}
                <button
                  onClick={handleAddBorder}
                  disabled={!file || processing}
                  className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-lg transition mb-3 flex items-center justify-center gap-2"
                >
                  <Square size={18} className={processing ? 'animate-spin' : ''} />
                  {processing ? 'Processing...' : 'Add Border'}
                </button>

                {result && (
                  <button
                    onClick={handleDownload}
                    disabled={processing}
                    className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition flex items-center justify-center gap-2"
                  >
                    <Download size={18} />
                    {processing ? 'Preparing Download...' : 'Continue to Download'}
                  </button>
                )}
              </div>
            </div>

            {/* Info Section */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="font-bold text-blue-900 mb-3">💡 How to Use</h3>
                <ol className="text-sm text-blue-800 space-y-2 list-decimal list-inside">
                  <li>Upload your image</li>
                  <li>Adjust the border width (5-100px)</li>
                  <li>Choose your desired border color</li>
                  <li>Click "Add Border" to preview</li>
                  <li>Download the result as PNG</li>
                </ol>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                <h3 className="font-bold text-purple-900 mb-3">🎨 Tips</h3>
                <ul className="text-sm text-purple-800 space-y-2">
                  <li>• Use contrasting colors for better visual impact</li>
                  <li>• Larger borders work best for small images</li>
                  <li>• Try white or black borders for classic look</li>
                  <li>• Works with supported image formats</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <section className="bg-white border-t border-gray-200 px-4 md:px-8 py-14">
          <div className="max-w-6xl mx-auto space-y-9">

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                How to add a border to an image
              </h2>
              <p className="text-gray-600 leading-7">

                Upload an image and configure the available border controls.
                The browser draws the source image and its border onto a
                Canvas, allowing you to preview the framed result before
                downloading it.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="border border-gray-200 rounded-xl p-6">
                <h3 className="font-semibold text-gray-900 mb-2">
                  What the tool changes
                </h3>
                <p className="text-sm text-gray-600 leading-6">
                  Adding a border increases the visual area around the source image. Border settings affect the generated composition rather than modifying objects inside the image.
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

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Add Border FAQ
              </h2>

              <div className="space-y-3">
                <details className="border border-gray-200 rounded-lg p-4">
                  <summary className="font-semibold text-gray-900 cursor-pointer">
                    Does processing improve the original image quality?
                  </summary>
                  <p className="text-sm text-gray-600 leading-6 mt-3">
                    The tool applies the selected transformation to the source
                    image. It does not recreate resolution or image detail
                    that is absent from the original file.
                  </p>
                </details>

                <details className="border border-gray-200 rounded-lg p-4">
                  <summary className="font-semibold text-gray-900 cursor-pointer">
                    Should I check the result before downloading?
                  </summary>
                  <p className="text-sm text-gray-600 leading-6 mt-3">
                    Yes. Previewing the result helps you confirm that the
                    selected settings are appropriate for the particular
                    image you uploaded.
                  </p>
                </details>
              </div>
            </div>

          </div>
        </section>

</main>

      {/* Benefits Section */}
      <div className="py-12 px-4 md:px-8 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Why Add Borders to Images?</h2>
          <ul className="space-y-3 text-gray-700">
            <li className="flex gap-2"><span className="text-orange-600 font-bold">•</span> Frame your photos - add elegant borders to highlight and separate images</li>
            <li className="flex gap-2"><span className="text-orange-600 font-bold">•</span> Presentation layouts - use borders to separate images from surrounding slide or portfolio content</li>
            <li className="flex gap-2"><span className="text-orange-600 font-bold">•</span> Social graphics - add visual separation around images used in posts and layouts</li>
            <li className="flex gap-2"><span className="text-orange-600 font-bold">•</span> Custom colors - match your brand with unlimited color choices</li>
            <li className="flex gap-2"><span className="text-orange-600 font-bold">•</span> Simple controls - choose the border width and color directly in the tool</li>
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
                What are the border width limits?
                <span className="text-gray-500 group-open:hidden">+</span>
                <span className="text-gray-500 hidden group-open:inline">−</span>
              </summary>
              <p className="text-gray-700 mt-3 text-sm">You can add borders from 5px to 100px. Choose based on your image size and preference.</p>
            </details>

            <details className="p-4 bg-white border border-gray-200 rounded-lg cursor-pointer group">
              <summary className="font-semibold text-gray-900 flex justify-between items-center">
                Can I use custom border colors?
                <span className="text-gray-500 group-open:hidden">+</span>
                <span className="text-gray-500 hidden group-open:inline">−</span>
              </summary>
              <p className="text-gray-700 mt-3 text-sm">Yes, use the color picker to choose any color you want. Supports full RGB spectrum.</p>
            </details>

            <details className="p-4 bg-white border border-gray-200 rounded-lg cursor-pointer group">
              <summary className="font-semibold text-gray-900 flex justify-between items-center">
                What file formats are supported?
                <span className="text-gray-500 group-open:hidden">+</span>
                <span className="text-gray-500 hidden group-open:inline">−</span>
              </summary>
              <p className="text-gray-700 mt-3 text-sm">Supported browser-readable images can be processed by the tool. The generated bordered result is downloaded as PNG.</p>
            </details>

            <details className="p-4 bg-white border border-gray-200 rounded-lg cursor-pointer group">
              <summary className="font-semibold text-gray-900 flex justify-between items-center">
                Can I add borders only on specific sides?
                <span className="text-gray-500 group-open:hidden">+</span>
                <span className="text-gray-500 hidden group-open:inline">−</span>
              </summary>
              <p className="text-gray-700 mt-3 text-sm">This tool adds borders on all sides equally. For partial borders, use advanced image editors.</p>
            </details>

            <details className="p-4 bg-white border border-gray-200 rounded-lg cursor-pointer group">
              <summary className="font-semibold text-gray-900 flex justify-between items-center">
                Does adding borders reduce image quality?
                <span className="text-gray-500 group-open:hidden">+</span>
                <span className="text-gray-500 hidden group-open:inline">−</span>
              </summary>
              <p className="text-gray-700 mt-3 text-sm">Adding a border creates a new image with a larger canvas around the source content. It does not add detail or improve the source image itself.</p>
            </details>

            <details className="p-4 bg-white border border-gray-200 rounded-lg cursor-pointer group">
              <summary className="font-semibold text-gray-900 flex justify-between items-center">
                Is this border tool completely free?
                <span className="text-gray-500 group-open:hidden">+</span>
                <span className="text-gray-500 hidden group-open:inline">−</span>
              </summary>
              <p className="text-gray-700 mt-3 text-sm">Yes, You can use the tool to add borders to supported images.</p>
            </details>
          </div>
        </div>
      </div>

      <script type="application/ld+json">{JSON.stringify({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
          { "@type": "Question", "name": "What are the border width limits?", "acceptedAnswer": { "@type": "Answer", "text": "You can add borders from 5px to 100px." } },
          { "@type": "Question", "name": "Can I use custom border colors?", "acceptedAnswer": { "@type": "Answer", "text": "Yes, use the color picker for any color in the RGB spectrum." } },
          { "@type": "Question", "name": "What file formats are supported?", "acceptedAnswer": { "@type": "Answer", "text": "Supported browser-readable images can be processed by the tool. The generated bordered result is downloaded as PNG." } },
          { "@type": "Question", "name": "Can I add borders only on specific sides?", "acceptedAnswer": { "@type": "Answer", "text": "This tool adds borders on all sides equally." } },
          { "@type": "Question", "name": "Does adding borders reduce image quality?", "acceptedAnswer": { "@type": "Answer", "text": "Adding a border creates a new image with a larger canvas around the source content. It does not add detail or improve the source image itself." } },
          { "@type": "Question", "name": "Is this border tool completely free?", "acceptedAnswer": { "@type": "Answer", "text": "You can use the tool to add borders to supported images." } }
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
            <Link href="/all-tools/resize-image" className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-200 hover:border-orange-500 hover:shadow-md transition">
              <span className="text-orange-600 font-bold">→</span>
              <div><span className="text-gray-900 font-medium hover:text-orange-600">Resize Image</span><p className="text-xs text-gray-600">Change dimensions</p></div>
            </Link>
            <Link href="/all-tools/rotate-image" className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-200 hover:border-orange-500 hover:shadow-md transition">
              <span className="text-orange-600 font-bold">→</span>
              <div><span className="text-gray-900 font-medium hover:text-orange-600">Rotate Image</span><p className="text-xs text-gray-600">Rotate any angle</p></div>
            </Link>
            <Link href="/all-tools/compress-image" className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-200 hover:border-orange-500 hover:shadow-md transition">
              <span className="text-orange-600 font-bold">→</span>
              <div><span className="text-gray-900 font-medium hover:text-orange-600">Image Compressor</span><p className="text-xs text-gray-600">Reduce file size</p></div>
            </Link>
          </div>
        </div>
      </div>

      <Footer />

      {/* Hidden Canvas */}
      <canvas ref={canvasRef} className="hidden" />
    </>
  );
}







