'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { HomeHeader } from '@/app/components/HomeHeader';
import { Footer } from '@/app/components/Footer';
import { Download, ChevronRight, Combine, Trash2, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { uploadBrowserDownloadResult } from '@/app/lib/download-result-client';

export default function CombineImagesPage() {
  const router = useRouter();
  const [images, setImages] = useState<{ file: File; src: string }[]>([]);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [layout, setLayout] = useState<'horizontal' | 'vertical' | 'grid'>('horizontal');
  const [spacing, setSpacing] = useState(10);
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [gridColumns, setGridColumns] = useState(2);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (files) {
      Array.from(files).forEach((file) => {
        if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onload = (event) => {
            setImages((prev) => [...prev, { file, src: event.target?.result as string }]);
          };
          reader.readAsDataURL(file);
        } else {
          setError('Please select image files only');
        }
      });
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const updatePreview = () => {
    if (images.length === 0 || !previewCanvasRef.current) return;

    const canvas = previewCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    previewImages(canvas, ctx, 0.3);
  };

  const previewImages = (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, scale: number) => {
    const loadedImages: HTMLImageElement[] = [];
    let loadedCount = 0;

    images.forEach((imgData) => {
      const img = new Image();
      img.onload = () => {
        loadedImages.push(img);
        loadedCount++;
        if (loadedCount === images.length) {
          drawImages(canvas, ctx, loadedImages, scale);
        }
      };
      img.src = imgData.src;
    });
  };

  const drawImages = (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, imgs: HTMLImageElement[], scale: number) => {
    ctx.fillStyle = backgroundColor;

    let totalWidth = 0;
    let totalHeight = 0;

    if (layout === 'horizontal') {
      const imgHeights = imgs.map((img) => Math.round(img.height * scale));
      const maxHeight = Math.max(...imgHeights);
      totalHeight = maxHeight + spacing * 2;
      totalWidth = imgs.reduce((sum, img) => sum + Math.round(img.width * scale) + spacing, spacing);
    } else if (layout === 'vertical') {
      const imgWidths = imgs.map((img) => Math.round(img.width * scale));
      const maxWidth = Math.max(...imgWidths);
      totalWidth = maxWidth + spacing * 2;
      totalHeight = imgs.reduce((sum, img) => sum + Math.round(img.height * scale) + spacing, spacing);
    } else {
      const cols = Math.ceil(imgs.length / Math.ceil(imgs.length / gridColumns));
      const rows = Math.ceil(imgs.length / cols);
      const maxImgWidth = Math.max(...imgs.map((img) => Math.round(img.width * scale)));
      const maxImgHeight = Math.max(...imgs.map((img) => Math.round(img.height * scale)));
      totalWidth = maxImgWidth * cols + spacing * (cols + 1);
      totalHeight = maxImgHeight * rows + spacing * (rows + 1);
    }

    canvas.width = totalWidth;
    canvas.height = totalHeight;
    ctx.fillRect(0, 0, totalWidth, totalHeight);

    let x = spacing;
    let y = spacing;
    let colCount = 0;
    const maxImgWidth = Math.max(...imgs.map((img) => Math.round(img.width * scale)));
    const maxImgHeight = Math.max(...imgs.map((img) => Math.round(img.height * scale)));

    imgs.forEach((img, index) => {
      const imgWidth = Math.round(img.width * scale);
      const imgHeight = Math.round(img.height * scale);

      if (layout === 'horizontal') {
        ctx.drawImage(img, x, (totalHeight - imgHeight) / 2, imgWidth, imgHeight);
        x += imgWidth + spacing;
      } else if (layout === 'vertical') {
        ctx.drawImage(img, (totalWidth - imgWidth) / 2, y, imgWidth, imgHeight);
        y += imgHeight + spacing;
      } else {
        ctx.drawImage(img, x, y, imgWidth, imgHeight);
        colCount++;
        if (colCount >= gridColumns) {
          colCount = 0;
          x = spacing;
          y += maxImgHeight + spacing;
        } else {
          x += maxImgWidth + spacing;
        }
      }
    });
  };

  const combineImages = async () => {
    if (images.length < 2) {
      setError('Please upload at least 2 images');
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      if (!canvasRef.current) return;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const loadedImages: HTMLImageElement[] = [];
      let loadedCount = 0;

      images.forEach((imgData) => {
        const img = new Image();
        img.onload = () => {
          loadedImages.push(img);
          loadedCount++;
          if (loadedCount === images.length) {
            drawImages(canvas, ctx, loadedImages, 1);
            canvas.toBlob((blob) => {
              if (blob) {
                setResult(blob);
              }
              setProcessing(false);
            }, 'image/png');
          }
        };
        img.src = imgData.src;
      });
    } catch (err) {
      setError('Error processing images');
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
          toolSlug: 'combine-images',
          originalName: 'combined-images.png',
          outputName: 'combined-images.png',
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

  const handleClear = () => {
    setImages([]);
    setResult(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
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
            <span>Combine Images</span>
          </div>

          <div className="flex items-center gap-4 mb-4">
            <div className="bg-white bg-opacity-20 p-3 rounded-lg">
              <Combine size={32} />
            </div>
            <div>
              <h1 className="text-4xl font-bold mb-2">Combine Images</h1>
              <p className="text-lg text-orange-50">
                Merge multiple images into one with flexible layout options
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
              {/* Upload Section */}
              <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Upload Images</h2>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-orange-500 transition">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    accept="image/*"
                    multiple
                    className="hidden"
                    id="file-input"
                  />
                  <label htmlFor="file-input" className="cursor-pointer flex flex-col items-center gap-3">
                    <Plus size={40} className="text-gray-400" />
                    <div>
                      <p className="text-gray-700 font-medium">Click to upload or drag and drop</p>
                      <p className="text-gray-500 text-sm">Multiple images supported</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Image List */}
              {images.length > 0 && (
                <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Uploaded Images ({images.length})</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {images.map((img, index) => (
                      <div key={index} className="relative">
                        <img
                          src={img.src}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg border border-gray-300"
                        />
                        <button
                          onClick={() => removeImage(index)}
                          className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded hover:bg-red-600"
                        >
                          <Trash2 size={16} />
                        </button>
                        <p className="text-xs text-gray-600 mt-1 text-center">#{index + 1}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Preview */}
              {images.length > 0 && (
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Preview</h3>
                  <div className="flex justify-center mb-4 bg-gray-100 p-4 rounded-lg">
                    <canvas ref={previewCanvasRef} className="max-w-full h-auto rounded-lg border border-gray-300" />
                  </div>

                  <button
                    onClick={() => {
                      updatePreview();
                      combineImages();
                    }}
                    disabled={processing || images.length < 2}
                    className="w-full bg-orange-500 text-white py-2 px-4 rounded-lg hover:bg-orange-600 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
                  >
                    {processing ? 'Processing...' : 'Combine Images'}
                  </button>

                  {result && (
                    <div className="mt-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Result</h3>
                      <div className="flex justify-center mb-4">
                        <img
                          src={URL.createObjectURL(result)}
                          alt="Result"
                          className="max-w-full h-auto rounded-lg border border-gray-300"
                          style={{ maxHeight: '400px' }}
                        />
                      </div>
                      <button
                        onClick={handleDownload}
                        className="w-full bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 font-medium flex items-center justify-center gap-2"
                      >
                        <Download size={20} />
                        Download Combined Image
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right Column - Controls */}
            <div className="lg:sticky lg:top-4">
              <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Settings</h3>

                {images.length > 0 && (
                  <>
                    {/* Layout Selection */}
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-3">Layout</label>
                      <div className="space-y-2">
                        {['horizontal', 'vertical', 'grid'].map((l) => (
                          <label key={l} className="flex items-center gap-3 cursor-pointer">
                            <input
                              type="radio"
                              name="layout"
                              value={l}
                              checked={layout === l}
                              onChange={(e) => {
                                setLayout(e.target.value as 'horizontal' | 'vertical' | 'grid');
                                updatePreview();
                              }}
                              className="w-4 h-4 accent-orange-500"
                            />
                            <span className="text-sm text-gray-700 capitalize">{l}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Grid Columns */}
                    {layout === 'grid' && (
                      <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Grid Columns: {gridColumns}
                        </label>
                        <input
                          type="range"
                          min="1"
                          max="4"
                          value={gridColumns}
                          onChange={(e) => {
                            setGridColumns(Number(e.target.value));
                            updatePreview();
                          }}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
                        />
                      </div>
                    )}

                    {/* Spacing */}
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Spacing: {spacing}px
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="50"
                        value={spacing}
                        onChange={(e) => {
                          setSpacing(Number(e.target.value));
                          updatePreview();
                        }}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
                      />
                    </div>

                    {/* Background Color */}
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Background Color
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          value={backgroundColor}
                          onChange={(e) => {
                            setBackgroundColor(e.target.value);
                            updatePreview();
                          }}
                          className="w-16 h-10 rounded cursor-pointer border border-gray-300"
                        />
                        <input
                          type="text"
                          value={backgroundColor}
                          readOnly
                          className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm bg-gray-50"
                        />
                      </div>
                    </div>

                    <button
                      onClick={handleClear}
                      className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 font-medium"
                    >
                      Clear All
                    </button>
                  </>
                )}
              </div>

              {/* Info Box */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h4 className="font-semibold text-blue-900 mb-2">How to Use</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Upload 2+ images</li>
                  <li>• Choose layout style</li>
                  <li>• Adjust spacing & colors</li>
                  <li>• Preview the result</li>
                  <li>• Download combined image</li>
                </ul>
              </div>

              {/* Tips Box */}
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h4 className="font-semibold text-purple-900 mb-2">Tips</h4>
                <ul className="text-sm text-purple-800 space-y-1">
                  <li>• Grid layout auto-centers</li>
                  <li>• Images maintain aspect ratios</li>
                  <li>• Customize spacing & background</li>
                  <li>• PNG format preserves quality</li>
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

        {/* Hidden Canvas */}
        <canvas ref={canvasRef} className="hidden" />

        {/* How to Use Section */}
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
          <div className="bg-white rounded-lg border border-gray-200 p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">How to Combine Images</h2>
            <ol className="space-y-4 text-gray-700">
              <li className="flex gap-4">
                <span className="text-orange-500 font-bold min-w-8">1.</span>
                <span><strong>Upload Images:</strong> Click the upload area or drag & drop multiple images. Supports JPG, PNG, WebP and more.</span>
              </li>
              <li className="flex gap-4">
                <span className="text-orange-500 font-bold min-w-8">2.</span>
                <span><strong>Choose Layout:</strong> Select horizontal, vertical, or grid layout from the settings panel.</span>
              </li>
              <li className="flex gap-4">
                <span className="text-orange-500 font-bold min-w-8">3.</span>
                <span><strong>Customize Settings:</strong> Adjust spacing, background color, and grid columns to your preference.</span>
              </li>
              <li className="flex gap-4">
                <span className="text-orange-500 font-bold min-w-8">4.</span>
                <span><strong>Preview:</strong> View the preview to see how your combined image will look.</span>
              </li>
              <li className="flex gap-4">
                <span className="text-orange-500 font-bold min-w-8">5.</span>
                <span><strong>Combine & Download:</strong> Click "Combine Images" and download your result as a PNG file.</span>
              </li>
            </ol>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
          <div className="bg-white rounded-lg border border-gray-200 p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Benefits of Our Combine Images Tool</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-bold text-orange-500 mb-2">✓ Multiple Layout Options</h3>
                <p className="text-gray-700">Arrange images horizontally, vertically, or in a grid layout. Perfect for creating collages and compositions.</p>
              </div>
              <div>
                <h3 className="text-lg font-bold text-orange-500 mb-2">✓ Flexible Customization</h3>
                <p className="text-gray-700">Adjust spacing, background color, and grid columns. Fine-tune every aspect of your image.</p>
              </div>
              <div>
                <h3 className="text-lg font-bold text-orange-500 mb-2">✓ Preview Before Download</h3>
                <p className="text-gray-700">See exactly how your combined image will look before exporting. Make changes instantly.</p>
              </div>
              <div>
                <h3 className="text-lg font-bold text-orange-500 mb-2">✓ High Quality Output</h3>
                <p className="text-gray-700">Exports as PNG with full quality preservation. No compression or loss of detail.</p>
              </div>
              <div>
                <h3 className="text-lg font-bold text-orange-500 mb-2">✓ 100% Free & Private</h3>
                <p className="text-gray-700">No sign-up required. All processing happens locally in your browser. Your data stays private.</p>
              </div>
              <div>
                <h3 className="text-lg font-bold text-orange-500 mb-2">✓ Batch Processing</h3>
                <p className="text-gray-700">Combine unlimited images in one session. Perfect for creating multi-image collages and compositions.</p>
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
                <summary className="font-bold text-gray-800 cursor-pointer">How many images can I combine?</summary>
                <p className="text-gray-700 mt-2">You can combine as many images as you want. Upload 2 or 100+ images - the tool handles any number. Just note that very large numbers may take longer to process.</p>
              </details>
              <details className="border-l-4 border-orange-500 pl-4 py-2">
                <summary className="font-bold text-gray-800 cursor-pointer">Can I change the layout after uploading?</summary>
                <p className="text-gray-700 mt-2">Yes! Switch between horizontal, vertical, and grid layouts at any time. The preview updates instantly so you can see the changes in real-time.</p>
              </details>
              <details className="border-l-4 border-orange-500 pl-4 py-2">
                <summary className="font-bold text-gray-800 cursor-pointer">Is my data safe and private?</summary>
                <p className="text-gray-700 mt-2">Absolutely. All processing happens locally in your browser. Your images are never uploaded to any server. They are completely private and secure.</p>
              </details>
              <details className="border-l-4 border-orange-500 pl-4 py-2">
                <summary className="font-bold text-gray-800 cursor-pointer">What size images does it support?</summary>
                <p className="text-gray-700 mt-2">The tool can handle images up to your browser's memory limit. Typically this allows files up to several hundred megapixels combined. For very large images, consider resizing first.</p>
              </details>
              <details className="border-l-4 border-orange-500 pl-4 py-2">
                <summary className="font-bold text-gray-800 cursor-pointer">Can I reorder images?</summary>
                <p className="text-gray-700 mt-2">Currently, images are arranged in the order you upload them. You can remove an image using the delete button and re-upload it in a different position.</p>
              </details>
            </div>
          </div>
        </div>

        {/* Related Tools Section */}
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
          <div className="bg-white rounded-lg border border-gray-200 p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Related Image Tools</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <Link href="/all-tools/crop-image" className="p-4 border-2 border-orange-200 rounded-lg hover:bg-orange-50 transition">
                <h3 className="font-bold text-gray-800 mb-1">Crop Image</h3>
                <p className="text-sm text-gray-600">Resize and crop images</p>
              </Link>
              <Link href="/all-tools/resize-image" className="p-4 border-2 border-orange-200 rounded-lg hover:bg-orange-50 transition">
                <h3 className="font-bold text-gray-800 mb-1">Resize Image</h3>
                <p className="text-sm text-gray-600">Change image dimensions</p>
              </Link>
              <Link href="/all-tools/add-opacity" className="p-4 border-2 border-orange-200 rounded-lg hover:bg-orange-50 transition">
                <h3 className="font-bold text-gray-800 mb-1">Add Opacity</h3>
                <p className="text-sm text-gray-600">Make images transparent</p>
              </Link>
            </div>
          </div>
        </div>

      </main>

      <Footer />

      <script type="application/ld+json" dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'WebApplication',
          name: 'Combine Images - Free Online Image Merger & Collage Maker',
          description: 'Combine multiple images into one with flexible layout options. Create stunning collages and image compositions.',
          url: 'https://simplifyconvert.com/all-tools/combine-images',
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
            'Horizontal, vertical, and grid layout options',
            'Customizable spacing and background color',
            'Real-time preview',
            'PNG export with full quality',
            'Support for multiple image formats',
            'No sign-up required',
            'Privacy-focused local processing',
          ],
        })
      }} />
    </div>
  );
}








