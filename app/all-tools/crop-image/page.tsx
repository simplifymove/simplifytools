'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { HomeHeader } from '@/app/components/HomeHeader';
import { ImageUploader } from '@/app/components/ImageUploader';
import { Download, ChevronRight, Scissors } from 'lucide-react';
import { Footer } from '@/app/components/Footer';

export default function CropImagePage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [imageWidth, setImageWidth] = useState(0);
  const [imageHeight, setImageHeight] = useState(0);
  const [cropX, setCropX] = useState(0);
  const [cropY, setCropY] = useState(0);
  const [cropWidth, setCropWidth] = useState(250);
  const [cropHeight, setCropHeight] = useState(250);
  const [isDragging, setIsDragging] = useState(false);

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
        setImageWidth(img.width);
        setImageHeight(img.height);
        const defaultCropWidth = Math.min(250, img.width);
        const defaultCropHeight = Math.min(250, img.height);
        setCropWidth(defaultCropWidth);
        setCropHeight(defaultCropHeight);
        setCropX(0);
        setCropY(0);
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
    const displayWidth = img.width * scale;
    const displayHeight = img.height * scale;

    canvas.width = displayWidth;
    canvas.height = displayHeight;

    ctx.drawImage(img, 0, 0, displayWidth, displayHeight);

    const displayCropX = cropX * scale;
    const displayCropY = cropY * scale;
    const displayCropWidth = cropWidth * scale;
    const displayCropHeight = cropHeight * scale;

    ctx.strokeStyle = '#f97316';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.strokeRect(displayCropX, displayCropY, displayCropWidth, displayCropHeight);
    ctx.setLineDash([]);

    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(0, 0, displayWidth, displayHeight);
    ctx.clearRect(displayCropX, displayCropY, displayCropWidth, displayCropHeight);
    ctx.strokeStyle = '#f97316';
    ctx.lineWidth = 2;
    ctx.strokeRect(displayCropX, displayCropY, displayCropWidth, displayCropHeight);
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!previewCanvasRef.current || imageWidth === 0) return;

    const canvas = previewCanvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (imageWidth / canvas.width);
    const y = (e.clientY - rect.top) * (imageHeight / canvas.height);

    setCropX(Math.max(0, Math.min(x - cropWidth / 2, imageWidth - cropWidth)));
    setCropY(Math.max(0, Math.min(y - cropHeight / 2, imageHeight - cropHeight)));

    if (preview) {
      const img = new Image();
      img.onload = () => updatePreview(img);
      img.src = preview;
    }
  };

  const cropImage = async () => {
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

        const finalCropWidth = Math.min(cropWidth, imageWidth - cropX);
        const finalCropHeight = Math.min(cropHeight, imageHeight - cropY);

        canvas.width = finalCropWidth;
        canvas.height = finalCropHeight;

        ctx.drawImage(
          img,
          cropX,
          cropY,
          finalCropWidth,
          finalCropHeight,
          0,
          0,
          finalCropWidth,
          finalCropHeight
        );

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
    link.download = 'cropped-image.png';
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
    setCropX(0);
    setCropY(0);
    setCropWidth(250);
    setCropHeight(250);
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
            <span>Crop Image</span>
          </div>

          <div className="flex items-center gap-4 mb-4">
            <div className="bg-white bg-opacity-20 p-3 rounded-lg">
              <Scissors size={32} />
            </div>
            <div>
              <h1 className="text-4xl font-bold mb-2">Crop Image</h1>
              <p className="text-lg text-orange-50">
                Crop and resize your images with precise control
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
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Select Crop Area</h2>
                <p className="text-sm text-gray-600 mb-4">
                  Click on the canvas to set crop position, or use the controls on the right
                </p>
                <div className="flex justify-center mb-4 bg-gray-100 p-4 rounded-lg">
                  <canvas
                    ref={previewCanvasRef}
                    onClick={handleCanvasClick}
                    className="max-w-full h-auto rounded-lg border border-gray-300 cursor-crosshair"
                  />
                </div>

                <button
                  onClick={cropImage}
                  disabled={processing}
                  className="w-full bg-orange-500 text-white py-2 px-4 rounded-lg hover:bg-orange-600 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
                >
                  {processing ? 'Processing...' : 'Apply Crop'}
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
                      Download Cropped Image
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column - Controls */}
          <div className="lg:sticky lg:top-4">
            <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Crop Settings</h3>

              {preview && (
                <>
                  {/* X Position */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      X Position: {Math.round(cropX)}px
                    </label>
                    <input
                      type="range"
                      min="0"
                      max={Math.max(0, imageWidth - cropWidth)}
                      value={cropX}
                      onChange={(e) => {
                        setCropX(Number(e.target.value));
                        if (preview) {
                          const img = new Image();
                          img.onload = () => updatePreview(img);
                          img.src = preview;
                        }
                      }}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
                    />
                  </div>

                  {/* Y Position */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Y Position: {Math.round(cropY)}px
                    </label>
                    <input
                      type="range"
                      min="0"
                      max={Math.max(0, imageHeight - cropHeight)}
                      value={cropY}
                      onChange={(e) => {
                        setCropY(Number(e.target.value));
                        if (preview) {
                          const img = new Image();
                          img.onload = () => updatePreview(img);
                          img.src = preview;
                        }
                      }}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
                    />
                  </div>

                  {/* Crop Width */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Crop Width: {Math.round(cropWidth)}px
                    </label>
                    <input
                      type="range"
                      min="50"
                      max={imageWidth}
                      value={cropWidth}
                      onChange={(e) => {
                        const newWidth = Number(e.target.value);
                        setCropWidth(newWidth);
                        if (cropX + newWidth > imageWidth) {
                          setCropX(imageWidth - newWidth);
                        }
                        if (preview) {
                          const img = new Image();
                          img.onload = () => updatePreview(img);
                          img.src = preview;
                        }
                      }}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
                    />
                  </div>

                  {/* Crop Height */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Crop Height: {Math.round(cropHeight)}px
                    </label>
                    <input
                      type="range"
                      min="50"
                      max={imageHeight}
                      value={cropHeight}
                      onChange={(e) => {
                        const newHeight = Number(e.target.value);
                        setCropHeight(newHeight);
                        if (cropY + newHeight > imageHeight) {
                          setCropY(imageHeight - newHeight);
                        }
                        if (preview) {
                          const img = new Image();
                          img.onload = () => updatePreview(img);
                          img.src = preview;
                        }
                      }}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
                    />
                  </div>

                  {/* Quick Aspect Ratios */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Quick Presets
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => {
                          const size = Math.min(imageWidth, imageHeight);
                          setCropWidth(size);
                          setCropHeight(size);
                          setCropX(0);
                          setCropY(0);
                          if (preview) {
                            const img = new Image();
                            img.onload = () => updatePreview(img);
                            img.src = preview;
                          }
                        }}
                        className="px-3 py-2 text-xs font-medium bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                      >
                        Square
                      </button>
                      <button
                        onClick={() => {
                          setCropWidth(Math.round(imageWidth * 0.8));
                          setCropHeight(Math.round(imageHeight * 0.8));
                          setCropX(Math.round(imageWidth * 0.1));
                          setCropY(Math.round(imageHeight * 0.1));
                          if (preview) {
                            const img = new Image();
                            img.onload = () => updatePreview(img);
                            img.src = preview;
                          }
                        }}
                        className="px-3 py-2 text-xs font-medium bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                      >
                        80% Zoom
                      </button>
                      <button
                        onClick={() => {
                          const newWidth = Math.round(imageWidth * 1.5);
                          const newHeight = Math.round(imageHeight * 0.5);
                          setCropWidth(Math.min(newWidth, imageWidth));
                          setCropHeight(Math.min(newHeight, imageHeight));
                          if (preview) {
                            const img = new Image();
                            img.onload = () => updatePreview(img);
                            img.src = preview;
                          }
                        }}
                        className="px-3 py-2 text-xs font-medium bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                      >
                        Wide
                      </button>
                      <button
                        onClick={() => {
                          const newWidth = Math.round(imageWidth * 0.5);
                          const newHeight = Math.round(imageHeight * 1.5);
                          setCropWidth(Math.min(newWidth, imageWidth));
                          setCropHeight(Math.min(newHeight, imageHeight));
                          if (preview) {
                            const img = new Image();
                            img.onload = () => updatePreview(img);
                            img.src = preview;
                          }
                        }}
                        className="px-3 py-2 text-xs font-medium bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                      >
                        Tall
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={handleClearPreview}
                    className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 font-medium"
                  >
                    Clear
                  </button>
                </>
              )}
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h4 className="font-semibold text-blue-900 mb-2">How to Use</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Upload your image</li>
                <li>• Click on canvas or use sliders</li>
                <li>• Adjust crop position and size</li>
                <li>• Use quick presets if desired</li>
                <li>• Click "Apply Crop" to crop</li>
              </ul>
            </div>

            {/* Tips Box */}
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h4 className="font-semibold text-purple-900 mb-2">Tips</h4>
              <ul className="text-sm text-purple-800 space-y-1">
                <li>• Minimum crop size is 50x50px</li>
                <li>• Click on preview to center crop</li>
                <li>• Use presets for common ratios</li>
                <li>• PNG preserves transparency</li>
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
      <Footer />
    </div>
  );
}







