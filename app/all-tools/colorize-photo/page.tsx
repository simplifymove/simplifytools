'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { HomeHeader } from '@/app/components/HomeHeader';
import { Footer } from '@/app/components/Footer';
import { ImageUploader } from '@/app/components/ImageUploader';
import { Download, ChevronRight, Palette } from 'lucide-react';
import { uploadBrowserDownloadResult } from '@/app/lib/download-result-client';

export default function ColorizePhotoPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [colorizeMethod, setColorizeMethod] = useState<'sepia' | 'warm' | 'cool' | 'custom'>('sepia');
  const [customColor, setCustomColor] = useState('#ff6347');
  const [intensity, setIntensity] = useState(50);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    setError(null);
    setResult(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        setPreview(img.src);
        updatePreview(img);
      };
      img.onerror = () => {
        setError('Failed to load image');
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(selectedFile);
  };

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16),
    } : { r: 255, g: 100, b: 0 };
  };

  const applySepia = (r: number, g: number, b: number, intensity: number) => {
    const gray = r * 0.299 + g * 0.587 + b * 0.114;
    const factor = intensity / 100;
    return {
      r: Math.min(255, gray + (112 * factor)),
      g: Math.min(255, gray + (66 * factor)),
      b: Math.min(255, gray + (-20 * factor)),
    };
  };

  const applyWarmTone = (r: number, g: number, b: number, intensity: number) => {
    const gray = r * 0.299 + g * 0.587 + b * 0.114;
    const factor = intensity / 100;
    return {
      r: Math.min(255, gray + (80 * factor)),
      g: Math.min(255, gray + (40 * factor)),
      b: Math.max(0, gray - (30 * factor)),
    };
  };

  const applyCoolTone = (r: number, g: number, b: number, intensity: number) => {
    const gray = r * 0.299 + g * 0.587 + b * 0.114;
    const factor = intensity / 100;
    return {
      r: Math.max(0, gray - (40 * factor)),
      g: Math.min(255, gray + (20 * factor)),
      b: Math.min(255, gray + (80 * factor)),
    };
  };

  const applyCustomColor = (r: number, g: number, b: number, intensity: number, colorHex: string) => {
    const gray = r * 0.299 + g * 0.587 + b * 0.114;
    const color = hexToRgb(colorHex);
    const factor = intensity / 100;
    return {
      r: Math.round(gray * (1 - factor * 0.7) + color.r * factor * 0.7),
      g: Math.round(gray * (1 - factor * 0.7) + color.g * factor * 0.7),
      b: Math.round(gray * (1 - factor * 0.7) + color.b * factor * 0.7),
    };
  };

  const colorizeImage = (imgCanvas: HTMLCanvasElement, method: string, color?: string) => {
    const ctx = imgCanvas.getContext('2d');
    if (!ctx) return;

    const imageData = ctx.getImageData(0, 0, imgCanvas.width, imgCanvas.height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const a = data[i + 3];

      let newColor: { r: number; g: number; b: number };

      if (method === 'sepia') {
        newColor = applySepia(r, g, b, intensity);
      } else if (method === 'warm') {
        newColor = applyWarmTone(r, g, b, intensity);
      } else if (method === 'cool') {
        newColor = applyCoolTone(r, g, b, intensity);
      } else {
        newColor = applyCustomColor(r, g, b, intensity, color || customColor);
      }

      data[i] = newColor.r;
      data[i + 1] = newColor.g;
      data[i + 2] = newColor.b;
      data[i + 3] = a;
    }

    ctx.putImageData(imageData, 0, 0);
  };

  const updatePreview = (img: HTMLImageElement) => {
    if (!previewCanvasRef.current) return;
    const canvas = previewCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const maxWidth = 400;
    const scale = Math.min(1, maxWidth / img.width);
    const displayWidth = Math.round(img.width * scale);
    const displayHeight = Math.round(img.height * scale);

    canvas.width = displayWidth;
    canvas.height = displayHeight;

    ctx.drawImage(img, 0, 0, displayWidth, displayHeight);
    colorizeImage(canvas, colorizeMethod);
  };

  const colorize = async () => {
    if (!preview) {
      setError('Please upload an image first');
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      const img = new Image();
      img.onload = () => {
        if (!canvasRef.current) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = img.width;
        canvas.height = img.height;

        ctx.drawImage(img, 0, 0);
        colorizeImage(canvas, colorizeMethod);

        canvas.toBlob((blob) => {
          if (blob) {
            setResult(blob);
          }
          setProcessing(false);
        }, 'image/png');
      };
      img.onerror = () => {
        setError('Failed to process image');
        setProcessing(false);
      };
      img.src = preview;
    } catch (err) {
      setError('Error processing image');
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
        toolSlug: 'colorize-photo',
        originalName: file.name,
        outputName: 'colorized-photo.png',
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

  const handleClearPreview = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <HomeHeader />

      {/* Hero Section with Breadcrumb */}
      <div className="bg-orange-500 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex items-center gap-2 text-sm mb-6 opacity-90">
            <Link href="/" className="hover:opacity-75 underline">
              Home
            </Link>
            <ChevronRight size={16} />
            <Link href="/all-tools" className="hover:opacity-75 underline">
              All Tools
            </Link>
            <ChevronRight size={16} />
            <span>Colorize Photo</span>
          </div>

          <div className="flex items-center gap-4 mb-4">
            <div className="bg-white bg-opacity-20 p-3 rounded-lg">
              <Palette size={32} />
            </div>
            <div>
              <h1 className="text-4xl font-bold mb-2">Colorize Photo</h1>
              <p className="text-lg text-orange-50">
                Add beautiful colors to black and white photos with multiple tone options
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main>
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Upload */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Upload Image</h2>
              <ImageUploader
                onFileSelect={handleFileSelect}
                preview={preview}
                onClearPreview={handleClearPreview}
              />
            </div>

            {/* Preview */}
            {preview && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Preview</h2>
                <div className="flex justify-center mb-4">
                  <canvas
                    ref={previewCanvasRef}
                    className="max-w-full h-auto rounded-lg border border-gray-300"
                  />
                </div>

                <button
                  onClick={colorize}
                  disabled={processing}
                  className="w-full bg-orange-500 text-white py-2 px-4 rounded-lg hover:bg-orange-600 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
                >
                  {processing ? 'Processing...' : 'Apply Colorize Effect'}
                </button>

                {result && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Result</h3>
                    <div className="flex justify-center mb-4">
                      <img
                        src={URL.createObjectURL(result)}
                        alt="Result"
                        className="max-w-full h-auto rounded-lg border border-gray-300"
                        style={{ maxHeight: '300px' }}
                      />
                    </div>
                    <button
                      onClick={handleDownload}
                      className="w-full bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 font-medium flex items-center justify-center gap-2"
                    >
                      <Download size={20} />
                      Download Colorized Photo
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column - Controls */}
          <div className="lg:sticky lg:top-4">
            <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Colorize Options</h3>

              {/* Colorize Method */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">Tone</label>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="method"
                      value="sepia"
                      checked={colorizeMethod === 'sepia'}
                      onChange={(e) => {
                        setColorizeMethod(e.target.value as 'sepia' | 'warm' | 'cool' | 'custom');
                        if (preview) {
                          const img = new Image();
                          img.onload = () => updatePreview(img);
                          img.src = preview;
                        }
                      }}
                      className="w-4 h-4 accent-orange-500"
                    />
                    <span className="text-sm text-gray-700">Sepia (Vintage Brown)</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="method"
                      value="warm"
                      checked={colorizeMethod === 'warm'}
                      onChange={(e) => {
                        setColorizeMethod(e.target.value as 'sepia' | 'warm' | 'cool' | 'custom');
                        if (preview) {
                          const img = new Image();
                          img.onload = () => updatePreview(img);
                          img.src = preview;
                        }
                      }}
                      className="w-4 h-4 accent-orange-500"
                    />
                    <span className="text-sm text-gray-700">Warm (Gold & Orange)</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="method"
                      value="cool"
                      checked={colorizeMethod === 'cool'}
                      onChange={(e) => {
                        setColorizeMethod(e.target.value as 'sepia' | 'warm' | 'cool' | 'custom');
                        if (preview) {
                          const img = new Image();
                          img.onload = () => updatePreview(img);
                          img.src = preview;
                        }
                      }}
                      className="w-4 h-4 accent-orange-500"
                    />
                    <span className="text-sm text-gray-700">Cool (Blue & Cyan)</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="method"
                      value="custom"
                      checked={colorizeMethod === 'custom'}
                      onChange={(e) => {
                        setColorizeMethod(e.target.value as 'sepia' | 'warm' | 'cool' | 'custom');
                        if (preview) {
                          const img = new Image();
                          img.onload = () => updatePreview(img);
                          img.src = preview;
                        }
                      }}
                      className="w-4 h-4 accent-orange-500"
                    />
                    <span className="text-sm text-gray-700">Custom Color</span>
                  </label>
                </div>
              </div>

              {/* Custom Color Picker */}
              {colorizeMethod === 'custom' && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Choose Color
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={customColor}
                      onChange={(e) => {
                        setCustomColor(e.target.value);
                        if (preview) {
                          const img = new Image();
                          img.onload = () => updatePreview(img);
                          img.src = preview;
                        }
                      }}
                      className="w-16 h-10 rounded cursor-pointer border border-gray-300"
                    />
                    <input
                      type="text"
                      value={customColor}
                      readOnly
                      className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm bg-gray-50"
                    />
                  </div>
                </div>
              )}

              {/* Intensity Slider */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Intensity: {intensity}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={intensity}
                  onChange={(e) => {
                    setIntensity(Number(e.target.value));
                    if (preview) {
                      const img = new Image();
                      img.onload = () => updatePreview(img);
                      img.src = preview;
                    }
                  }}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
                />
                <p className="text-xs text-gray-600 mt-2">
                  Lower = subtle | Higher = more vibrant
                </p>
              </div>

              {preview && (
                <button
                  onClick={handleClearPreview}
                  className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 font-medium"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h4 className="font-semibold text-blue-900 mb-2">How to Use</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Upload black & white photo</li>
                <li>• Select tone or custom color</li>
                <li>• Adjust intensity slider</li>
                <li>• Preview changes in real-time</li>
                <li>• Download colorized version</li>
              </ul>
            </div>

            {/* Tips Box */}
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h4 className="font-semibold text-purple-900 mb-2">Tips</h4>
              <ul className="text-sm text-purple-800 space-y-1">
                <li>• Sepia for vintage look</li>
                <li>• Warm for nostalgic feel</li>
                <li>• Cool for modern touch</li>
                <li>• Custom for unique colors</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="fixed bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* How to Use Section */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        <div className="bg-white rounded-lg border border-gray-200 p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">How to Colorize a Photo</h2>
          <ol className="space-y-4 text-gray-700">
            <li className="flex gap-4">
              <span className="text-orange-500 font-bold min-w-8">1.</span>
              <span><strong>Upload Photo:</strong> Select a black and white or grayscale image. Supports JPG, PNG, WebP and more.</span>
            </li>
            <li className="flex gap-4">
              <span className="text-orange-500 font-bold min-w-8">2.</span>
              <span><strong>Choose Tone:</strong> Select from preset tones (Sepia, Warm, Cool) or pick a custom color.</span>
            </li>
            <li className="flex gap-4">
              <span className="text-orange-500 font-bold min-w-8">3.</span>
              <span><strong>Adjust Intensity:</strong> Use the slider to control how vibrant or subtle the colorization appears.</span>
            </li>
            <li className="flex gap-4">
              <span className="text-orange-500 font-bold min-w-8">4.</span>
              <span><strong>Preview:</strong> See the colorized result in real-time before applying.</span>
            </li>
            <li className="flex gap-4">
              <span className="text-orange-500 font-bold min-w-8">5.</span>
              <span><strong>Download:</strong> Save your colorized photo as a PNG file.</span>
            </li>
          </ol>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        <div className="bg-white rounded-lg border border-gray-200 p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Benefits of Our Colorize Tool</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-bold text-orange-500 mb-2">✓ Multiple Tone Options</h3>
              <p className="text-gray-700">Choose from preset tones like sepia, warm, and cool, or use a custom color for unique effects.</p>
            </div>
            <div>
              <h3 className="text-lg font-bold text-orange-500 mb-2">✓ Real-Time Preview</h3>
              <p className="text-gray-700">See changes instantly as you adjust tone, color, and intensity without applying.</p>
            </div>
            <div>
              <h3 className="text-lg font-bold text-orange-500 mb-2">✓ Restore Vintage Photos</h3>
              <p className="text-gray-700">Bring old black and white photographs back to life with beautiful, natural-looking colors.</p>
            </div>
            <div>
              <h3 className="text-lg font-bold text-orange-500 mb-2">✓ Precise Control</h3>
              <p className="text-gray-700">Adjust intensity from subtle to vibrant to get exactly the look you want.</p>
            </div>
            <div>
              <h3 className="text-lg font-bold text-orange-500 mb-2">✓ High Quality Output</h3>
              <p className="text-gray-700">Exports as PNG with full quality preservation. No compression or loss of detail.</p>
            </div>
            <div>
              <h3 className="text-lg font-bold text-orange-500 mb-2">✓ 100% Free & Private</h3>
              <p className="text-gray-700">No sign-up required. All processing happens locally. Your photos stay completely private.</p>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        <div className="bg-white rounded-lg border border-gray-200 p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <details className="border-l-4 border-orange-500 pl-4 py-2">
              <summary className="font-bold text-gray-800 cursor-pointer">What image formats are supported?</summary>
              <p className="text-gray-700 mt-2">Our tool supports all common image formats including JPG, PNG, WebP, GIF, BMP, and TIFF. The output is always PNG format for maximum quality.</p>
            </details>
            <details className="border-l-4 border-orange-500 pl-4 py-2">
              <summary className="font-bold text-gray-800 cursor-pointer">Can I colorize a color photo?</summary>
              <p className="text-gray-700 mt-2">While designed for B&W photos, you can use this tool on color photos to apply tonal overlays. The grayscale values are calculated from existing RGB data.</p>
            </details>
            <details className="border-l-4 border-orange-500 pl-4 py-2">
              <summary className="font-bold text-gray-800 cursor-pointer">What's the difference between sepia, warm, and cool tones?</summary>
              <p className="text-gray-700 mt-2">Sepia adds a classic brown tone (vintage look), Warm adds orange/gold (nostalgic feel), and Cool adds blue/cyan (modern touch). Custom lets you pick any color.</p>
            </details>
            <details className="border-l-4 border-orange-500 pl-4 py-2">
              <summary className="font-bold text-gray-800 cursor-pointer">Does colorization affect photo quality?</summary>
              <p className="text-gray-700 mt-2">No, colorization preserves all original quality. The output PNG maintains the same resolution and detail as your input image.</p>
            </details>
            <details className="border-l-4 border-orange-500 pl-4 py-2">
              <summary className="font-bold text-gray-800 cursor-pointer">Is my photo data secure?</summary>
              <p className="text-gray-700 mt-2">Absolutely. All processing happens locally in your browser. Your photos are never uploaded to any server and remain completely private.</p>
            </details>
            <details className="border-l-4 border-orange-500 pl-4 py-2">
              <summary className="font-bold text-gray-800 cursor-pointer">Can I use colorized photos commercially?</summary>
              <p className="text-gray-700 mt-2">Yes, colorized photos can be used for personal or commercial purposes without any restrictions.</p>
            </details>
          </div>
        </div>
      </div>

      {/* Related Tools Section */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        <div className="bg-white rounded-lg border border-gray-200 p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Related Photo Tools</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Link href="/all-tools/image-enhancer" className="p-4 border-2 border-orange-200 rounded-lg hover:bg-orange-50 transition">
              <h3 className="font-bold text-gray-800 mb-1">Enhance Image</h3>
              <p className="text-sm text-gray-600">Improve photo quality and clarity</p>
            </Link>
            <Link href="/all-tools/grayscale-image" className="p-4 border-2 border-orange-200 rounded-lg hover:bg-orange-50 transition">
              <h3 className="font-bold text-gray-800 mb-1">Grayscale Image</h3>
              <p className="text-sm text-gray-600">Convert to black and white</p>
            </Link>
            <Link href="/all-tools/sepia-filter" className="p-4 border-2 border-orange-200 rounded-lg hover:bg-orange-50 transition">
              <h3 className="font-bold text-gray-800 mb-1">Sepia Effect</h3>
              <p className="text-sm text-gray-600">Apply classic vintage tone</p>
            </Link>
          </div>
        </div>
      </div>

      </main>

      <Footer />

      {/* Hidden Canvas */}
      <canvas ref={canvasRef} className="hidden" />

      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Colorize Photo - Free Online Photo Colorization Tool',
        description: 'Add colors to black and white photos. Restore vintage photographs with sepia, warm, cool, or custom color tones.',
        url: 'https://simplifyconvert.com/all-tools/colorize-photo',
        applicationCategory: 'Multimedia',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
          availability: 'https://schema.org/InStock',
        },
        author: {
          '@type': 'Organization',
          name: 'SimplifyConvert',
          url: 'https://simplifyconvert.com',
        },
        datePublished: '2024-01-01',
        image: 'https://simplifyconvert.com/og-image.jpg',
        featureList: [
          'Multiple tone options (sepia, warm, cool)',
          'Custom color selection',
          'Intensity control slider',
          'Real-time preview',
          'High quality PNG export',
          'No sign-up required',
          'Privacy-focused local processing',
        ],
      })}} />
    </div>
  );
}




