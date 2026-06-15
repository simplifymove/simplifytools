'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { Download, ChevronRight, Palette } from 'lucide-react';
import { ImageUploader } from '../../components/ImageUploader';
import { HomeHeader } from '../../components/HomeHeader';
import { Footer } from '../../components/Footer';
import { RelatedToolsSection } from '@/app/components/RelatedToolsSection';

type GrayscaleMethod = 'average' | 'lightness' | 'luminosity';

export default function BlackWhitePage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [method, setMethod] = useState<GrayscaleMethod>('luminosity');
  const [contrast, setContrast] = useState(100);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

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

  const convertToBlackWhite = async () => {
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

        canvas.width = img.width;
        canvas.height = img.height;

        ctx.drawImage(img, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        // Convert to grayscale based on selected method
        for (let i = 0; i < data.length; i += 4) {
          let gray = 0;

          if (method === 'average') {
            // Average method
            gray = (data[i] + data[i + 1] + data[i + 2]) / 3;
          } else if (method === 'lightness') {
            // Lightness method
            gray = (Math.max(data[i], data[i + 1], data[i + 2]) + Math.min(data[i], data[i + 1], data[i + 2])) / 2;
          } else {
            // Luminosity method (most natural)
            gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
          }

          // Apply contrast
          const contrastFactor = (contrast - 100) * 2.55;
          gray = Math.min(255, Math.max(0, gray + contrastFactor));

          data[i] = gray;     // Red
          data[i + 1] = gray; // Green
          data[i + 2] = gray; // Blue
          // Alpha remains unchanged
        }

        ctx.putImageData(imageData, 0, 0);

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
      setError((err as Error).message || 'Error converting image');
      setProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!result) return;
    const url = URL.createObjectURL(result);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'black-white.png';
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
              <span>Black & White</span>
            </div>

            {/* Title Section */}
            <div className="flex items-start gap-4">
              <div className="p-3 bg-white/20 rounded-lg">
                <Palette size={32} className="text-white" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">Black & White</h1>
                <p className="text-lg text-white/90">Convert your images to black and white with adjustable contrast.</p>
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
                <div className="min-h-64 bg-gray-100 rounded flex items-center justify-center overflow-auto">
                  {result ? (
                    <img
                      src={URL.createObjectURL(result)}
                      alt="Black & White preview"
                      className="max-h-64 max-w-full object-contain"
                    />
                  ) : preview ? (
                    <img
                      src={preview}
                      alt="Original"
                      className="max-h-64 max-w-full object-contain"
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
                <h2 className="text-xl font-bold text-gray-900 mb-6">Conversion Settings</h2>

                {/* Method Selection */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">Grayscale Method</label>
                  <div className="space-y-2">
                    <label className="flex items-center p-2 border border-gray-200 rounded cursor-pointer hover:bg-orange-50 transition">
                      <input
                        type="radio"
                        name="method"
                        value="luminosity"
                        checked={method === 'luminosity'}
                        onChange={(e) => setMethod(e.target.value as GrayscaleMethod)}
                        className="w-4 h-4 accent-orange-500"
                      />
                      <span className="ml-2 text-sm">
                        <span className="font-medium text-gray-700">Luminosity</span>
                        <span className="text-gray-500 text-xs block">Most natural looking</span>
                      </span>
                    </label>

                    <label className="flex items-center p-2 border border-gray-200 rounded cursor-pointer hover:bg-orange-50 transition">
                      <input
                        type="radio"
                        name="method"
                        value="average"
                        checked={method === 'average'}
                        onChange={(e) => setMethod(e.target.value as GrayscaleMethod)}
                        className="w-4 h-4 accent-orange-500"
                      />
                      <span className="ml-2 text-sm">
                        <span className="font-medium text-gray-700">Average</span>
                        <span className="text-gray-500 text-xs block">Simple RGB average</span>
                      </span>
                    </label>

                    <label className="flex items-center p-2 border border-gray-200 rounded cursor-pointer hover:bg-orange-50 transition">
                      <input
                        type="radio"
                        name="method"
                        value="lightness"
                        checked={method === 'lightness'}
                        onChange={(e) => setMethod(e.target.value as GrayscaleMethod)}
                        className="w-4 h-4 accent-orange-500"
                      />
                      <span className="ml-2 text-sm">
                        <span className="font-medium text-gray-700">Lightness</span>
                        <span className="text-gray-500 text-xs block">Max+Min brightness</span>
                      </span>
                    </label>
                  </div>
                </div>

                {/* Contrast Control */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contrast: {contrast}%
                  </label>
                  <input
                    type="range"
                    min="50"
                    max="150"
                    value={contrast}
                    onChange={(e) => setContrast(parseInt(e.target.value))}
                    className="w-full accent-orange-500"
                  />
                  <div className="text-xs text-gray-500 mt-1 flex justify-between">
                    <span>50%</span>
                    <span>100% (normal)</span>
                    <span>150%</span>
                  </div>
                </div>

                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                )}

                {/* Convert Button */}
                <button
                  onClick={convertToBlackWhite}
                  disabled={!file || processing}
                  className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-lg transition mb-3 flex items-center justify-center gap-2"
                >
                  <Palette size={18} className={processing ? 'animate-spin' : ''} />
                  {processing ? 'Converting...' : 'Convert'}
                </button>

                {result && (
                  <button
                    onClick={handleDownload}
                    className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-lg transition flex items-center justify-center gap-2"
                  >
                    <Download size={18} />
                    Download PNG
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
                  <li>Choose a grayscale conversion method</li>
                  <li>Adjust contrast if needed</li>
                  <li>Click "Convert" to preview changes</li>
                  <li>Download the result as PNG</li>
                </ol>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                <h3 className="font-bold text-purple-900 mb-3">🎨 Conversion Methods</h3>
                <ul className="text-sm text-purple-800 space-y-2">
                  <li>• <strong>Luminosity:</strong> Uses human eye sensitivity to colors (recommended)</li>
                  <li>• <strong>Average:</strong> Simple RGB channel average</li>
                  <li>• <strong>Lightness:</strong> Midpoint between min & max values</li>
                  <li>• <strong>Contrast:</strong> Adjust darkness and brightness</li>
                </ul>
              </div>
            </div>

            {/* SEO Content */}
            <div className="mt-12 space-y-8">
              <section className="bg-white rounded-lg border border-gray-200 p-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">What This Black and White Tool Does</h2>
                <p className="text-gray-700 leading-relaxed">
                  The Black and White tool converts color photos into monochrome images using adjustable grayscale methods and contrast control. It helps you create clean black-and-white portraits, product images, document-style scans, and artistic photo edits directly in your browser.
                </p>
              </section>

              <section className="bg-white rounded-lg border border-gray-200 p-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Use Cases</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    'Create classic black-and-white portraits for portfolios and social profiles.',
                    'Convert product photos into monochrome images for catalogs or design mockups.',
                    'Prepare simple grayscale images for print, documents, or low-color designs.',
                    'Experiment with luminosity, average, and lightness methods for different tonal results.',
                  ].map((item) => (
                    <div key={item} className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 text-sm">
                      {item}
                    </div>
                  ))}
                </div>
              </section>

              <section className="bg-white rounded-lg border border-gray-200 p-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Example</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-2">Input</h3>
                    <p className="text-gray-700 text-sm">A colorful portrait, landscape, product image, or scanned graphic.</p>
                  </div>
                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-2">Output</h3>
                    <p className="text-gray-700 text-sm">A PNG image converted to black and white with your chosen grayscale method and contrast level.</p>
                  </div>
                </div>
              </section>

              <section className="bg-blue-50 border border-blue-200 rounded-lg p-8">
                <h2 className="text-3xl font-bold text-blue-900 mb-4">Privacy Note</h2>
                <p className="text-blue-900 text-sm leading-relaxed">
                  Black-and-white conversion runs in your browser using canvas processing. Your uploaded image is not sent to a server for this effect, and you can download the result locally.
                </p>
              </section>

              <section className="bg-white rounded-lg border border-gray-200 p-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
                <div className="space-y-4">
                  {[
                    {
                      q: 'Which grayscale method should I use?',
                      a: 'Luminosity usually looks most natural because it follows how human vision perceives red, green, and blue. Average and lightness can create flatter or more stylized results.',
                    },
                    {
                      q: 'Can I adjust the contrast?',
                      a: 'Yes. Use the contrast slider to make the black-and-white result softer or more dramatic before downloading.',
                    },
                    {
                      q: 'What format is the output?',
                      a: 'The converted image downloads as a PNG file so the result stays clean and easy to reuse.',
                    },
                    {
                      q: 'Is this tool free?',
                      a: 'Yes. You can convert images to black and white for free without signing up.',
                    },
                  ].map((faq) => (
                    <details key={faq.q} className="p-4 border border-gray-200 rounded-lg">
                      <summary className="font-semibold text-gray-900 cursor-pointer">{faq.q}</summary>
                      <p className="text-gray-700 mt-3 text-sm">{faq.a}</p>
                    </details>
                  ))}
                </div>
              </section>

              <RelatedToolsSection family="image" toolId="black-white" limit={8} />
            </div>
          </div>
        </div>
      </main>

      <script type="application/ld+json">{JSON.stringify({
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "Black and White Image Converter",
        "description": "Convert color images to black and white online with grayscale methods and adjustable contrast.",
        "url": "https://simplifyconvert.com/all-tools/black-white",
        "applicationCategory": "MultimediaApplication",
        "operatingSystem": "Web",
        "isAccessibleForFree": true,
        "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" }
      })}</script>

      <script type="application/ld+json">{JSON.stringify({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "Which grayscale method should I use?",
            "acceptedAnswer": { "@type": "Answer", "text": "Luminosity usually looks most natural because it follows how human vision perceives red, green, and blue." }
          },
          {
            "@type": "Question",
            "name": "Can I adjust the contrast?",
            "acceptedAnswer": { "@type": "Answer", "text": "Yes. Use the contrast slider to make the black-and-white result softer or more dramatic before downloading." }
          },
          {
            "@type": "Question",
            "name": "What format is the output?",
            "acceptedAnswer": { "@type": "Answer", "text": "The converted image downloads as a PNG file." }
          },
          {
            "@type": "Question",
            "name": "Is this tool free?",
            "acceptedAnswer": { "@type": "Answer", "text": "Yes. You can convert images to black and white for free without signing up." }
          }
        ]
      })}</script>

      <script type="application/ld+json">{JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://simplifyconvert.com" },
          { "@type": "ListItem", "position": 2, "name": "All Tools", "item": "https://simplifyconvert.com/all-tools" },
          { "@type": "ListItem", "position": 3, "name": "Black and White", "item": "https://simplifyconvert.com/all-tools/black-white" }
        ]
      })}</script>
      <Footer />

      {/* Hidden Canvas */}
      <canvas ref={canvasRef} className="hidden" />
    </>
  );
}







