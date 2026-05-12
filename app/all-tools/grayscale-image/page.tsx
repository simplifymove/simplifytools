'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Download, Loader, ChevronRight, Palette } from 'lucide-react';
import { HomeHeader } from '@/app/components/HomeHeader';
import { Footer } from '@/app/components/Footer';
import { ImageUploader } from '../../components/ImageUploader';
import { applyGrayscale } from '../../lib/imageTools';

export default function GrayscaleImagePage() {
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

  const handleDownload = () => {
    if (!result) return;
    const url = URL.createObjectURL(result);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'grayscale.jpg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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
              <p className="text-lg text-white/90">Transform any colored image into a beautiful black and white grayscale image. Perfect for artistic photography and vintage effects.</p>
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
                    <p className="text-sm text-gray-600">Perfect for professional photography, portfolios, and artistic projects.</p>
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
            <div><p className="text-gray-700"><strong>Click Convert to Grayscale:</strong> Instantly convert to black and white</p></div>
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
            <p className="text-gray-700 mt-3 text-sm">All formats: JPG, PNG, WebP, GIF, BMP. Output is JPG format for optimal compatibility.</p>
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
            <p className="text-gray-700 mt-3 text-sm">No, it preserves image quality and detail. Only color information is removed, brightness and contrast remain intact.</p>
          </details>

          <details className="p-4 bg-white border border-gray-200 rounded-lg cursor-pointer group">
            <summary className="font-semibold text-gray-900 flex justify-between items-center">
              Is grayscale conversion completely free?
              <span className="text-gray-500 group-open:hidden">+</span>
              <span className="text-gray-500 hidden group-open:inline">−</span>
            </summary>
            <p className="text-gray-700 mt-3 text-sm">Yes, 100% free with no limits. Convert unlimited images with no signup or hidden costs.</p>
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
        { "@type": "Question", "name": "What image formats are supported?", "acceptedAnswer": { "@type": "Answer", "text": "All formats: JPG, PNG, WebP, GIF, BMP. Output is JPG." } },
        { "@type": "Question", "name": "Can I convert back from grayscale to color?", "acceptedAnswer": { "@type": "Answer", "text": "Not automatically. Use your original image to revert, or use colorization tools." } },
        { "@type": "Question", "name": "Does grayscale reduce image quality?", "acceptedAnswer": { "@type": "Answer", "text": "No, it preserves quality. Only color information is removed." } },
        { "@type": "Question", "name": "Is grayscale conversion completely free?", "acceptedAnswer": { "@type": "Answer", "text": "Yes, 100% free with no limits." } }
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







