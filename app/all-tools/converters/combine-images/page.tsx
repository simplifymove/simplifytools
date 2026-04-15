'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { HomeHeader } from '@/app/components/HomeHeader';
import { Download, ChevronRight, Combine, Trash2, Plus } from 'lucide-react';

export default function CombineImagesPage() {
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

  const handleDownload = () => {
    if (!result) return;

    const url = URL.createObjectURL(result);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'combined-images.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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
              Tools
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

      {/* Footer */}
      <footer className="bg-slate-800 text-white py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <p className="text-center text-slate-400">
            © 2024 Image Tools. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}






