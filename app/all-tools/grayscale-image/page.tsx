'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Download, Loader, ChevronRight, Palette } from 'lucide-react';
import { HomeHeader } from '@/app/components/HomeHeader';
import { Footer } from '@/app/components/Footer';
import { ImageUploader } from '../../components/ImageUploader';
import { applyGrayscale } from '../../lib/imageTools';
import { useRouter } from 'next/navigation';
import { uploadBrowserDownloadResult } from '@/app/lib/download-result-client';

export default function GrayscaleImagePage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);

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

  const handleGrayscale = async () => {
    if (!file) return;

    setProcessing(true);
    setError(null);
    try {
      const result = await applyGrayscale(file);
      setResult(result.blob);
    } catch (err) {
      setError((err as Error).message || 'Error applying grayscale');
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = async () => {
    if (!result || processing) return;

    setError(null);
    setProcessing(true);

    try {
      const downloadResult =
        await uploadBrowserDownloadResult({
          blob: result,
          toolSlug: 'grayscale-image',
          originalName: 'grayscale.jpg',
          outputName: 'grayscale.jpg',
        });

      router.push(downloadResult.downloadPageUrl);
    } catch (caughtError) {
      setError(
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
              <span>Grayscale Converter</span>
            </div>

            {/* Title Section */}
            <div className="flex items-start gap-4 mb-6">
              <div className="p-3 bg-white/20 rounded-lg">
                <Palette size={32} className="text-white" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">Convert to Grayscale</h1>
                <p className="text-lg text-white/90">Convert a color image to grayscale for monochrome designs, photography, documents, and creative effects.</p>
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
                    preview={preview}
                    onClearPreview={handleClearPreview}
                  />
                  {error && (
                    <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-600">{error}</p>
                    </div>
                  )}
                </div>

                {/* Features */}
                <div className="mt-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Why Use Grayscale?</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
                      <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        🎨 Artistic Effect
                      </h4>
                      <p className="text-sm text-gray-600">Create stunning black and white images for a timeless, classic look.</p>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
                      <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        📝 Professional Look
                      </h4>
                      <p className="text-sm text-gray-600">Useful for photography, portfolios, documents, and creative projects.</p>
                    </div>
                  </div>
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
                          alt="Grayscale"
                          className="w-full rounded-lg border border-gray-200 object-cover"
                        />
                        <button
                          onClick={handleDownload}
                          className="w-full px-4 py-3 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-all flex items-center justify-center gap-2"
                        >
                          <Download size={18} />
                          Download
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
                    onClick={handleGrayscale}
                    disabled={!file || processing}
                    className="w-full px-6 py-3 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                  >
                    {processing ? (
                      <>
                        <Loader size={18} className="animate-spin" />
                        Converting...
                      </>
                    ) : (
                      <>
                        <Palette size={18} />
                        Convert to Grayscale
                      </>
                    )}
                  </button>

                  {/* Info */}
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-xs text-blue-700">
                      <strong>💡 Tip:</strong> Grayscale conversion works best with images that have good contrast and detail.
                    </p>
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
                How grayscale image conversion works
              </h2>
              <p className="text-gray-600 leading-7">

                Grayscale conversion removes visible color information and
                represents the image using shades ranging from dark to light.
                This creates a monochrome result while retaining the visible
                shapes, tones, and structure of the source image.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="border border-gray-200 rounded-xl p-6">
                <h3 className="font-semibold text-gray-900 mb-2">
                  What the tool changes
                </h3>
                <p className="text-sm text-gray-600 leading-6">
                  Grayscale conversion changes color representation; it does not increase source resolution or recover details that are missing from the original image.
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
                Grayscale Image FAQ
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

      {/* How To Section */}
      <div className="py-12 px-4 md:px-8 bg-white border-t border-gray-200">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">How to Convert Images to Grayscale</h2>
          <div className="space-y-4">
            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-600 text-white flex items-center justify-center font-bold text-sm">1</div>
              <div><p className="text-gray-700"><strong>Upload your image:</strong> Select any photo from your computer</p></div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-600 text-white flex items-center justify-center font-bold text-sm">2</div>
              <div><p className="text-gray-700"><strong>Preview the image:</strong> Your photo appears in the preview area</p></div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-600 text-white flex items-center justify-center font-bold text-sm">3</div>
              <div><p className="text-gray-700"><strong>Click Convert to Grayscale:</strong> Apply the grayscale conversion in your browser</p></div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-600 text-white flex items-center justify-center font-bold text-sm">4</div>
              <div><p className="text-gray-700"><strong>Download your result:</strong> Save the grayscale image</p></div>
            </div>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="py-12 px-4 md:px-8 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Why Use Grayscale Conversion?</h2>
          <ul className="space-y-3 text-gray-700">
            <li className="flex gap-2"><span className="text-gray-600 font-bold">•</span> Classic aesthetic - black and white photos have timeless elegance and emotional impact</li>
            <li className="flex gap-2"><span className="text-gray-600 font-bold">•</span> Professional printing - grayscale reduces printing costs and works on any printer</li>
            <li className="flex gap-2"><span className="text-gray-600 font-bold">•</span> Focus on details - remove color distractions to emphasize composition and texture</li>
            <li className="flex gap-2"><span className="text-gray-600 font-bold">•</span> Reduce file sizes - grayscale images are smaller for web and archival</li>
            <li className="flex gap-2"><span className="text-gray-600 font-bold">•</span> Artistic expression - create dramatic moods with black and white photography</li>
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
                What does grayscale conversion do exactly?
                <span className="text-gray-500 group-open:hidden">+</span>
                <span className="text-gray-500 hidden group-open:inline">−</span>
              </summary>
              <p className="text-gray-700 mt-3 text-sm">Grayscale conversion removes all color information, creating a black and white image with shades of gray based on brightness values.</p>
            </details>

            <details className="p-4 bg-white border border-gray-200 rounded-lg cursor-pointer group">
              <summary className="font-semibold text-gray-900 flex justify-between items-center">
                Is grayscale the same as black and white?
                <span className="text-gray-500 group-open:hidden">+</span>
                <span className="text-gray-500 hidden group-open:inline">−</span>
              </summary>
              <p className="text-gray-700 mt-3 text-sm">Grayscale includes shades of gray for smooth tones, while true black and white only has pure black and pure white. Our tool creates grayscale.</p>
            </details>

            <details className="p-4 bg-white border border-gray-200 rounded-lg cursor-pointer group">
              <summary className="font-semibold text-gray-900 flex justify-between items-center">
                What image formats are supported?
                <span className="text-gray-500 group-open:hidden">+</span>
                <span className="text-gray-500 hidden group-open:inline">−</span>
              </summary>
              <p className="text-gray-700 mt-3 text-sm">Supported browser-readable images can be processed by the tool. The generated result is downloaded as a JPG image.</p>
            </details>

            <details className="p-4 bg-white border border-gray-200 rounded-lg cursor-pointer group">
              <summary className="font-semibold text-gray-900 flex justify-between items-center">
                Can I convert back from grayscale to color?
                <span className="text-gray-500 group-open:hidden">+</span>
                <span className="text-gray-500 hidden group-open:inline">−</span>
              </summary>
              <p className="text-gray-700 mt-3 text-sm">Not automatically. Grayscale removes color data permanently. Use your original image to revert, or use colorization tools for artistic effects.</p>
            </details>

            <details className="p-4 bg-white border border-gray-200 rounded-lg cursor-pointer group">
              <summary className="font-semibold text-gray-900 flex justify-between items-center">
                Does grayscale reduce image quality?
                <span className="text-gray-500 group-open:hidden">+</span>
                <span className="text-gray-500 hidden group-open:inline">−</span>
              </summary>
              <p className="text-gray-700 mt-3 text-sm">Grayscale conversion changes the image pixels by removing color information, and the generated result is encoded again as JPG. Review the output if image fidelity is important.</p>
            </details>

            <details className="p-4 bg-white border border-gray-200 rounded-lg cursor-pointer group">
              <summary className="font-semibold text-gray-900 flex justify-between items-center">
                Is grayscale conversion completely free?
                <span className="text-gray-500 group-open:hidden">+</span>
                <span className="text-gray-500 hidden group-open:inline">−</span>
              </summary>
              <p className="text-gray-700 mt-3 text-sm">Yes, You can use the tool to convert supported images to grayscale.</p>
            </details>
          </div>
        </div>
      </div>

      <script type="application/ld+json">{JSON.stringify({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
          { "@type": "Question", "name": "What does grayscale conversion do exactly?", "acceptedAnswer": { "@type": "Answer", "text": "Grayscale conversion removes color and creates black and white with shades of gray." } },
          { "@type": "Question", "name": "Is grayscale the same as black and white?", "acceptedAnswer": { "@type": "Answer", "text": "Grayscale includes shades of gray, while black and white is only pure black and white." } },
          { "@type": "Question", "name": "What image formats are supported?", "acceptedAnswer": { "@type": "Answer", "text": "Supported browser-readable images can be processed by the tool. The generated result is downloaded as JPG." } },
          { "@type": "Question", "name": "Can I convert back from grayscale to color?", "acceptedAnswer": { "@type": "Answer", "text": "Not automatically. Use your original image to revert, or use colorization tools." } },
          { "@type": "Question", "name": "Does grayscale reduce image quality?", "acceptedAnswer": { "@type": "Answer", "text": "Grayscale conversion changes the image pixels and the generated result is encoded again as JPG, so review the output when image fidelity is important." } },
          { "@type": "Question", "name": "Is grayscale conversion completely free?", "acceptedAnswer": { "@type": "Answer", "text": "You can use the tool to convert supported images to grayscale." } }
        ]
      })}</script>

      {/* Related Tools */}
      <div className="py-12 px-4 md:px-8 bg-gray-50 border-t border-gray-200">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Related Image Effects</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <Link href="/all-tools/colorize-photo" className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-200 hover:border-gray-500 hover:shadow-md transition">
              <span className="text-gray-600 font-bold">→</span>
              <div><span className="text-gray-900 font-medium hover:text-gray-600">Colorize Photo</span><p className="text-xs text-gray-600">Add color to grayscale images</p></div>
            </Link>
            <Link href="/all-tools/compress-image" className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-200 hover:border-gray-500 hover:shadow-md transition">
              <span className="text-gray-600 font-bold">→</span>
              <div><span className="text-gray-900 font-medium hover:text-gray-600">Image Compressor</span><p className="text-xs text-gray-600">Reduce file size</p></div>
            </Link>
            <Link href="/all-tools/rotate-image" className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-200 hover:border-gray-500 hover:shadow-md transition">
              <span className="text-gray-600 font-bold">→</span>
              <div><span className="text-gray-900 font-medium hover:text-gray-600">Rotate Image</span><p className="text-xs text-gray-600">Rotate any angle</p></div>
            </Link>
            <Link href="/all-tools/crop-image" className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-200 hover:border-gray-500 hover:shadow-md transition">
              <span className="text-gray-600 font-bold">→</span>
              <div><span className="text-gray-900 font-medium hover:text-gray-600">Crop Image</span><p className="text-xs text-gray-600">Trim unwanted areas</p></div>
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}







