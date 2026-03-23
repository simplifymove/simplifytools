'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { HomeHeader } from '@/app/components/HomeHeader';
import { ImageUploader } from '@/app/components/ImageUploader';
import { Download, ChevronRight, Palette } from 'lucide-react';

export default function ColorizePhotoPage() {
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

  const handleDownload = () => {
    if (!result) return;

    const url = URL.createObjectURL(result);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'colorized-photo.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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
              Tools
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






