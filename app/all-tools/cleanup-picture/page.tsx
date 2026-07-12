'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { HomeHeader } from '@/app/components/HomeHeader';
import { ImageUploader } from '@/app/components/ImageUploader';
import { Download, ChevronRight, Eraser } from 'lucide-react';
import { Footer } from '@/app/components/Footer';

export default function CleanupPicturePage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [denoise, setDenoise] = useState(false);
  const [denoiseStrength, setDenoiseStrength] = useState(3);
  const [smoothBlur, setSmoothBlur] = useState(false);
  const [blurRadius, setBlurRadius] = useState(1);
  const [enhance, setEnhance] = useState(false);
  const [enhanceAmount, setEnhanceAmount] = useState(1.2);

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

    const imageData = ctx.getImageData(0, 0, displayWidth, displayHeight);
    applyCleanupEffects(imageData, displayWidth, displayHeight);
    ctx.putImageData(imageData, 0, 0);
  };

  const applyCleanupEffects = (imageData: ImageData, width: number, height: number) => {
    let data = imageData.data;

    if (smoothBlur) {
      data = applyBlur(data, width, height, blurRadius);
    }

    if (denoise) {
      data = applyDenoise(data, width, height, denoiseStrength);
    }

    if (enhance) {
      data = enhanceImage(data, enhanceAmount);
    }

    for (let i = 0; i < data.length; i += 4) {
      imageData.data[i] = data[i];
      imageData.data[i + 1] = data[i + 1];
      imageData.data[i + 2] = data[i + 2];
      imageData.data[i + 3] = data[i + 3];
    }
  };

  const applyBlur = (data: Uint8ClampedArray, width: number, height: number, radius: number) => {
    const result = new Uint8ClampedArray(data.length);
    const kernel = [];
    let sum = 0;

    for (let i = -radius; i <= radius; i++) {
      for (let j = -radius; j <= radius; j++) {
        const value = Math.exp(-(i * i + j * j) / (2 * radius * radius));
        kernel.push(value);
        sum += value;
      }
    }

    for (let i = 0; i < data.length; i += 4) {
      const pixelIndex = i / 4;
      const y = Math.floor(pixelIndex / width);
      const x = pixelIndex % width;

      let r = 0, g = 0, b = 0;
      let totalWeight = 0;
      let kernelIndex = 0;

      for (let ky = -radius; ky <= radius; ky++) {
        for (let kx = -radius; kx <= radius; kx++) {
          const nx = x + kx;
          const ny = y + ky;

          if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
            const neighborIndex = (ny * width + nx) * 4;
            const weight = kernel[kernelIndex];
            r += data[neighborIndex] * weight;
            g += data[neighborIndex + 1] * weight;
            b += data[neighborIndex + 2] * weight;
            totalWeight += weight;
          }
          kernelIndex++;
        }
      }

      result[i] = Math.round(r / totalWeight);
      result[i + 1] = Math.round(g / totalWeight);
      result[i + 2] = Math.round(b / totalWeight);
      result[i + 3] = data[i + 3];
    }

    return result;
  };

  const applyDenoise = (data: Uint8ClampedArray, width: number, height: number, strength: number) => {
    const result = new Uint8ClampedArray(data);

    for (let i = 0; i < data.length; i += 4) {
      const pixelIndex = i / 4;
      const y = Math.floor(pixelIndex / width);
      const x = pixelIndex % width;

      const neighbors: { r: number; g: number; b: number }[] = [];

      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          if (dx === 0 && dy === 0) continue;
          const nx = x + dx;
          const ny = y + dy;

          if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
            const neighborIndex = (ny * width + nx) * 4;
            neighbors.push({
              r: data[neighborIndex],
              g: data[neighborIndex + 1],
              b: data[neighborIndex + 2],
            });
          }
        }
      }

      if (neighbors.length > 0) {
        neighbors.sort((a, b) => (a.r + a.g + a.b) - (b.r + b.g + b.b));
        const medianIndex = Math.floor(neighbors.length / 2);
        const median = neighbors[medianIndex];

        const factor = strength / 10;
        result[i] = Math.round(data[i] * (1 - factor) + median.r * factor);
        result[i + 1] = Math.round(data[i + 1] * (1 - factor) + median.g * factor);
        result[i + 2] = Math.round(data[i + 2] * (1 - factor) + median.b * factor);
      }
    }

    return result;
  };

  const enhanceImage = (data: Uint8ClampedArray, amount: number) => {
    const result = new Uint8ClampedArray(data);

    for (let i = 0; i < data.length; i += 4) {
      const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
      const mid = 128;

      result[i] = Math.min(255, Math.max(0, Math.round(mid + (data[i] - mid) * amount)));
      result[i + 1] = Math.min(255, Math.max(0, Math.round(mid + (data[i + 1] - mid) * amount)));
      result[i + 2] = Math.min(255, Math.max(0, Math.round(mid + (data[i + 2] - mid) * amount)));
    }

    return result;
  };

  const cleanupImage = async () => {
    if (!preview) {
      setError('Please upload an image first');
      return;
    }

    if (!denoise && !smoothBlur && !enhance) {
      setError('Please enable at least one cleanup option');
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

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        applyCleanupEffects(imageData, canvas.width, canvas.height);
        ctx.putImageData(imageData, 0, 0);

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
    link.download = 'cleanup-picture.png';
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
              All Tools
            </Link>
            <ChevronRight size={16} />
            <span>Cleanup Picture</span>
          </div>

          <div className="flex items-center gap-4 mb-4">
            <div className="bg-white bg-opacity-20 p-3 rounded-lg">
              <Eraser size={32} />
            </div>
            <div>
              <h1 className="text-4xl font-bold mb-2">Cleanup Picture</h1>
              <p className="text-lg text-orange-50">
                Clean up and enhance your images with noise reduction and smoothing
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
                  onClick={cleanupImage}
                  disabled={processing || (!denoise && !smoothBlur && !enhance)}
                  className="w-full bg-orange-500 text-white py-2 px-4 rounded-lg hover:bg-orange-600 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
                >
                  {processing ? 'Processing...' : 'Apply Cleanup'}
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
                      Download Cleaned Image
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column - Controls */}
          <div className="lg:sticky lg:top-4">
            <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Cleanup Options</h3>

              {/* Noise Reduction */}
              <div className="mb-6">
                <label className="flex items-center gap-3 cursor-pointer mb-3">
                  <input
                    type="checkbox"
                    checked={denoise}
                    onChange={(e) => {
                      setDenoise(e.target.checked);
                      if (preview) {
                        const img = new Image();
                        img.onload = () => updatePreview(img);
                        img.src = preview;
                      }
                    }}
                    className="w-4 h-4 accent-orange-500 cursor-pointer"
                  />
                  <span className="text-sm font-medium text-gray-700">Noise Reduction</span>
                </label>
                <p className="text-xs text-gray-600 mb-2">Remove graininess and speckles</p>
                {denoise && (
                  <div>
                    <label className="block text-sm text-gray-600 mb-2">
                      Strength: {denoiseStrength}
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={denoiseStrength}
                      onChange={(e) => {
                        setDenoiseStrength(Number(e.target.value));
                        if (preview) {
                          const img = new Image();
                          img.onload = () => updatePreview(img);
                          img.src = preview;
                        }
                      }}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
                    />
                  </div>
                )}
              </div>

              {/* Smooth Blur */}
              <div className="mb-6">
                <label className="flex items-center gap-3 cursor-pointer mb-3">
                  <input
                    type="checkbox"
                    checked={smoothBlur}
                    onChange={(e) => {
                      setSmoothBlur(e.target.checked);
                      if (preview) {
                        const img = new Image();
                        img.onload = () => updatePreview(img);
                        img.src = preview;
                      }
                    }}
                    className="w-4 h-4 accent-orange-500 cursor-pointer"
                  />
                  <span className="text-sm font-medium text-gray-700">Smooth Blur</span>
                </label>
                <p className="text-xs text-gray-600 mb-2">Gentle smoothing for cleaner look</p>
                {smoothBlur && (
                  <div>
                    <label className="block text-sm text-gray-600 mb-2">
                      Radius: {blurRadius}
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      value={blurRadius}
                      onChange={(e) => {
                        setBlurRadius(Number(e.target.value));
                        if (preview) {
                          const img = new Image();
                          img.onload = () => updatePreview(img);
                          img.src = preview;
                        }
                      }}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
                    />
                  </div>
                )}
              </div>

              {/* Enhancement */}
              <div className="mb-6">
                <label className="flex items-center gap-3 cursor-pointer mb-3">
                  <input
                    type="checkbox"
                    checked={enhance}
                    onChange={(e) => {
                      setEnhance(e.target.checked);
                      if (preview) {
                        const img = new Image();
                        img.onload = () => updatePreview(img);
                        img.src = preview;
                      }
                    }}
                    className="w-4 h-4 accent-orange-500 cursor-pointer"
                  />
                  <span className="text-sm font-medium text-gray-700">Enhance Clarity</span>
                </label>
                <p className="text-xs text-gray-600 mb-2">Boost contrast and vibrancy</p>
                {enhance && (
                  <div>
                    <label className="block text-sm text-gray-600 mb-2">
                      Amount: {enhanceAmount.toFixed(1)}x
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="2"
                      step="0.1"
                      value={enhanceAmount}
                      onChange={(e) => {
                        setEnhanceAmount(Number(e.target.value));
                        if (preview) {
                          const img = new Image();
                          img.onload = () => updatePreview(img);
                          img.src = preview;
                        }
                      }}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
                    />
                  </div>
                )}
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
                <li>• Upload your image</li>
                <li>• Enable cleanup options</li>
                <li>• Adjust parameters in preview</li>
                <li>• See changes in real-time</li>
                <li>• Download cleaned image</li>
              </ul>
            </div>

            {/* Tips Box */}
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h4 className="font-semibold text-purple-900 mb-2">Tips</h4>
              <ul className="text-sm text-purple-800 space-y-1">
                <li>• Use noise reduction for grainy photos</li>
                <li>• Smooth blur gently cleans edges</li>
                <li>• Combine all three for best results</li>
                <li>• Adjust strength for subtle effects</li>
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
      </main>

      <Footer />
    </div>
  );
}







