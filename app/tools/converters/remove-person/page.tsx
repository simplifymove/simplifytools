'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { HomeHeader } from '@/app/components/HomeHeader';
import { Download, ChevronRight, Package } from 'lucide-react';

export default function RemovePersonPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [brushSize, setBrushSize] = useState(20);
  const [brushColor, setBrushColor] = useState('#ff0000');
  const [isDrawing, setIsDrawing] = useState(false);
  const [removeStrength, setRemoveStrength] = useState(0.7);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const maskCanvasRef = useRef<HTMLCanvasElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (files && files[0]) {
      const selectedFile = files[0];
      setFile(selectedFile);
      setError(null);
      setResult(null);

      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          setPreview(img.src);
          drawPreview(img);
        };
        img.onerror = () => {
          setError('Failed to load image');
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const drawPreview = (img: HTMLImageElement) => {
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

    const maskData = maskCanvasRef.current?.getContext('2d')?.getImageData(0, 0, maskCanvasRef.current.width, maskCanvasRef.current.height);
    if (maskData) {
      const scaledMask = ctx.createImageData(displayWidth, displayHeight);
      for (let i = 0; i < scaledMask.data.length; i += 4) {
        scaledMask.data[i] = 255;
        scaledMask.data[i + 1] = 0;
        scaledMask.data[i + 2] = 0;
        scaledMask.data[i + 3] = 50;
      }
    }
  };

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!previewCanvasRef.current || !maskCanvasRef.current) return;

    setIsDrawing(true);
    const canvas = previewCanvasRef.current;
    const maskCanvas = maskCanvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const scaleX = maskCanvas.width / canvas.width;
    const scaleY = maskCanvas.height / canvas.height;

    drawBrushStroke(maskCanvas, x * scaleX, y * scaleY);
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !previewCanvasRef.current || !maskCanvasRef.current) return;

    const canvas = previewCanvasRef.current;
    const maskCanvas = maskCanvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const scaleX = maskCanvas.width / canvas.width;
    const scaleY = maskCanvas.height / canvas.height;

    drawBrushStroke(maskCanvas, x * scaleX, y * scaleY);
  };

  const handleCanvasMouseUp = () => {
    setIsDrawing(false);
  };

  const drawBrushStroke = (maskCanvas: HTMLCanvasElement, x: number, y: number) => {
    const ctx = maskCanvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(x, y, brushSize, 0, Math.PI * 2);
    ctx.fill();
  };

  const removePerson = async () => {
    if (!preview || !maskCanvasRef.current) {
      setError('Please upload an image and mark the person to remove');
      return;
    }

    const maskCtx = maskCanvasRef.current.getContext('2d');
    const maskData = maskCtx?.getImageData(0, 0, maskCanvasRef.current.width, maskCanvasRef.current.height);

    let hasMarking = false;
    if (maskData) {
      for (let i = 0; i < maskData.data.length; i += 4) {
        if (maskData.data[i] > 128) {
          hasMarking = true;
          break;
        }
      }
    }

    if (!hasMarking) {
      setError('Please draw on the image to mark the person to remove');
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
        const data = imageData.data;

        // Scale mask to match full resolution image
        const fullMask = ctx.createImageData(canvas.width, canvas.height);
        const scaleX = canvas.width / maskCanvasRef.current!.width;
        const scaleY = canvas.height / maskCanvasRef.current!.height;

        const maskCtx = maskCanvasRef.current!.getContext('2d');
        const maskImageData = maskCtx!.getImageData(0, 0, maskCanvasRef.current!.width, maskCanvasRef.current!.height);

        for (let y = 0; y < canvas.height; y++) {
          for (let x = 0; x < canvas.width; x++) {
            const maskX = Math.floor(x / scaleX);
            const maskY = Math.floor(y / scaleY);
            const maskIdx = (maskY * maskCanvasRef.current!.width + maskX) * 4;
            const isMarked = maskImageData.data[maskIdx] > 128;

            const idx = (y * canvas.width + x) * 4;

            if (isMarked) {
              // Sample from surrounding pixels for inpainting
              let sampleR = 0, sampleG = 0, sampleB = 0, count = 0;

              for (let dy = -15; dy <= 15; dy += 5) {
                for (let dx = -15; dx <= 15; dx += 5) {
                  const ny = Math.min(canvas.height - 1, Math.max(0, y + dy));
                  const nx = Math.min(canvas.width - 1, Math.max(0, x + dx));
                  const neighborIdx = (ny * canvas.width + nx) * 4;

                  const neighborMaskX = Math.floor(nx / scaleX);
                  const neighborMaskY = Math.floor(ny / scaleY);
                  const neighborMaskIdx = (neighborMaskY * maskCanvasRef.current!.width + neighborMaskX) * 4;

                  if (maskImageData.data[neighborMaskIdx] <= 128) {
                    sampleR += data[neighborIdx];
                    sampleG += data[neighborIdx + 1];
                    sampleB += data[neighborIdx + 2];
                    count++;
                  }
                }
              }

              if (count > 0) {
                data[idx] = Math.round(sampleR / count * removeStrength + data[idx] * (1 - removeStrength));
                data[idx + 1] = Math.round(sampleG / count * removeStrength + data[idx + 1] * (1 - removeStrength));
                data[idx + 2] = Math.round(sampleB / count * removeStrength + data[idx + 2] * (1 - removeStrength));
              }
            }
          }
        }

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
    link.download = 'remove-person.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleClearCanvas = () => {
    if (!maskCanvasRef.current) return;
    const ctx = maskCanvasRef.current.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, maskCanvasRef.current.width, maskCanvasRef.current.height);
      if (preview) {
        const img = new Image();
        img.onload = () => drawPreview(img);
        img.src = preview;
      }
    }
  };

  const handleClear = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (maskCanvasRef.current) {
      const ctx = maskCanvasRef.current.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, maskCanvasRef.current.width, maskCanvasRef.current.height);
      }
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
            <Link href="/tools" className="hover:opacity-75 underline">
              Tools
            </Link>
            <ChevronRight size={16} />
            <span>Remove Person</span>
          </div>

          <div className="flex items-center gap-4 mb-4">
            <div className="bg-white bg-opacity-20 p-3 rounded-lg">
              <Package size={32} />
            </div>
            <div>
              <h1 className="text-4xl font-bold mb-2">Remove Person</h1>
              <p className="text-lg text-orange-50">
                Remove people from your photos with intelligent content-aware filling
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
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Upload Image</h2>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-orange-500 transition">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept="image/*"
                  className="hidden"
                  id="file-input"
                />
                <label htmlFor="file-input" className="cursor-pointer flex flex-col items-center gap-3">
                  <Package size={40} className="text-gray-400" />
                  <div>
                    <p className="text-gray-700 font-medium">Click to upload or drag and drop</p>
                    <p className="text-gray-500 text-sm">PNG, JPG, GIF up to 10MB</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Canvas */}
            {preview && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Mark Area to Remove</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Draw red lines over the person you want to remove. The tool will intelligently fill the area.
                </p>
                <div className="flex justify-center mb-4 bg-gray-100 p-4 rounded-lg">
                  <canvas
                    ref={previewCanvasRef}
                    onMouseDown={handleCanvasMouseDown}
                    onMouseMove={handleCanvasMouseMove}
                    onMouseUp={handleCanvasMouseUp}
                    onMouseLeave={handleCanvasMouseUp}
                    className="max-w-full h-auto rounded-lg border border-gray-300 cursor-crosshair"
                  />
                </div>
                <canvas ref={maskCanvasRef} className="hidden" width={512} height={512} />

                <button
                  onClick={removePerson}
                  disabled={processing}
                  className="w-full bg-orange-500 text-white py-2 px-4 rounded-lg hover:bg-orange-600 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium mb-3"
                >
                  {processing ? 'Processing...' : 'Remove Person'}
                </button>

                <button
                  onClick={handleClearCanvas}
                  className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 font-medium"
                >
                  Clear Marks
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
                      Download Result
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column - Controls */}
          <div className="lg:sticky lg:top-4">
            <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Brush Settings</h3>

              {preview && (
                <>
                  {/* Brush Size */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Brush Size: {brushSize}px
                    </label>
                    <input
                      type="range"
                      min="5"
                      max="100"
                      value={brushSize}
                      onChange={(e) => setBrushSize(Number(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
                    />
                    <p className="text-xs text-gray-600 mt-2">Larger for bigger areas, smaller for details</p>
                  </div>

                  {/* Remove Strength */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Removal Strength: {Math.round(removeStrength * 100)}%
                    </label>
                    <input
                      type="range"
                      min="0.3"
                      max="1"
                      step="0.1"
                      value={removeStrength}
                      onChange={(e) => setRemoveStrength(Number(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
                    />
                    <p className="text-xs text-gray-600 mt-2">Higher = stronger removal, Lower = blend naturally</p>
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
                <li>• Upload your photo</li>
                <li>• Use brush tool to mark person</li>
                <li>• Adjust brush size as needed</li>
                <li>• Click "Remove Person"</li>
                <li>• Download the result</li>
              </ul>
            </div>

            {/* Tips Box */}
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h4 className="font-semibold text-purple-900 mb-2">Tips</h4>
              <ul className="text-sm text-purple-800 space-y-1">
                <li>• Mark completely for best results</li>
                <li>• Start with medium brush size</li>
                <li>• Use 70-80% strength typically</li>
                <li>• Works best on uniform backgrounds</li>
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
