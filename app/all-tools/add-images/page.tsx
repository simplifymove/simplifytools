'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { Download, ChevronRight, Image as ImageIcon, X, Plus } from 'lucide-react';
import { HomeHeader } from '../../components/HomeHeader';
import { Footer } from '../../components/Footer';

interface CanvasImage {
  id: string;
  blob: Blob;
  preview: string;
  x: number;
  y: number;
}

export default function AddImagesPage() {
  const [images, setImages] = useState<CanvasImage[]>([]);
  const [canvasWidth, setCanvasWidth] = useState(800);
  const [canvasHeight, setCanvasHeight] = useState(600);
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (!files) return;

    for (let i = 0; i < Math.min(files.length, 10); i++) {
      const file = files[i];
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          const newImage: CanvasImage = {
            id: String(Date.now() + i),
            blob: file,
            preview: reader.result as string,
            x: 50 + images.length * 20,
            y: 50 + images.length * 20,
          };
          setImages((prev) => [...prev, newImage]);
        };
        reader.readAsDataURL(file);
      }
    }
    setError(null);
  };

  const removeImage = (id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
    if (selectedImageId === id) {
      setSelectedImageId(null);
    }
  };

  const updateImagePosition = (id: string, x: number, y: number) => {
    setImages((prev) =>
      prev.map((img) => (img.id === id ? { ...img, x, y } : img))
    );
  };

  const drawPreview = () => {
    const canvas = previewCanvasRef.current;
    if (!canvas) return;

    // Scale preview to fit container
    const maxWidth = 400;
    const scale = Math.min(1, maxWidth / canvasWidth);
    
    canvas.width = canvasWidth * scale;
    canvas.height = canvasHeight * scale;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw background
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw images
    images.forEach((img) => {
      const imgElement = new Image();
      imgElement.onload = () => {
        const size = 80 * scale;
        ctx.drawImage(
          imgElement,
          img.x * scale,
          img.y * scale,
          size,
          size
        );

        // Draw selection box if selected
        if (img.id === selectedImageId) {
          ctx.strokeStyle = '#ff6b6b';
          ctx.lineWidth = 2;
          ctx.strokeRect(
            img.x * scale,
            img.y * scale,
            size,
            size
          );
        }
      };
      imgElement.src = img.preview;
    });
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const canvas = previewCanvasRef.current;
    if (!canvas) return;

    const scale = Math.min(1, 400 / canvasWidth);
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / scale;
    const y = (e.clientY - rect.top) / scale;

    // Find if clicked on any image
    for (let i = images.length - 1; i >= 0; i--) {
      const img = images[i];
      if (x >= img.x && x <= img.x + 80 && y >= img.y && y <= img.y + 80) {
        setSelectedImageId(img.id);
        return;
      }
    }
    setSelectedImageId(null);
  };

  const generateImage = async () => {
    if (images.length === 0) {
      setError('Please add at least one image');
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = canvasWidth;
      canvas.height = canvasHeight;

      // Draw background
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw images
      let loadedCount = 0;
      images.forEach((img) => {
        const imgElement = new Image();
        imgElement.onload = () => {
          ctx.drawImage(imgElement, img.x, img.y, 80, 80);
          loadedCount++;

          // If all images loaded, convert to blob
          if (loadedCount === images.length) {
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
          }
        };
        imgElement.src = img.preview;
      });
    } catch (err) {
      setError((err as Error).message || 'Error generating image');
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

  // Update preview when images or settings change
  React.useEffect(() => {
    drawPreview();
  }, [images, selectedImageId, canvasWidth, canvasHeight, backgroundColor]);

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
              <Link href="/all-tools" className="hover:text-white transition">Tools</Link>
              <ChevronRight size={16} />
              <span>Add Images</span>
            </div>

            {/* Title Section */}
            <div className="flex items-start gap-4">
              <div className="p-3 bg-white/20 rounded-lg">
                <ImageIcon size={32} className="text-white" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">Add Images</h1>
                <p className="text-lg text-white/90">Combine multiple images on a single canvas.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 py-12 px-4 md:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Upload & List Section */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Upload Images</h2>

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-orange-400 transition cursor-pointer mb-4"
                >
                  <Plus size={32} className="text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Click to upload images</p>
                  <p className="text-xs text-gray-500 mt-1">Max 10 images</p>
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />

                {/* Images List */}
                {images.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      {images.length} / 10 images
                    </p>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {images.map((img, idx) => (
                        <div
                          key={img.id}
                          className={`flex items-center justify-between p-2 rounded border cursor-pointer ${
                            selectedImageId === img.id
                              ? 'bg-orange-100 border-orange-300'
                              : 'bg-gray-50 border-gray-200'
                          }`}
                          onClick={() => setSelectedImageId(img.id)}
                        >
                          <div className="flex items-center gap-2 flex-1">
                            <span className="text-xs font-medium text-gray-600">{idx + 1}</span>
                            <img src={img.preview} alt={`Img ${idx}`} className="w-6 h-6 rounded object-cover" />
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeImage(img.id);
                            }}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Preview Section */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Preview</h2>
                <div className="flex items-center justify-center bg-gray-100 rounded cursor-pointer" onClick={handleCanvasClick}>
                  {images.length > 0 ? (
                    <canvas ref={previewCanvasRef} />
                  ) : (
                    <div className="text-gray-400 text-center p-8">
                      <p className="text-sm">Add images to preview</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Settings Section */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Canvas Settings</h2>

                {/* Canvas Width */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Width: {canvasWidth}px
                  </label>
                  <input
                    type="range"
                    min="400"
                    max="1600"
                    step="100"
                    value={canvasWidth}
                    onChange={(e) => setCanvasWidth(parseInt(e.target.value))}
                    className="w-full accent-orange-500"
                  />
                </div>

                {/* Canvas Height */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Height: {canvasHeight}px
                  </label>
                  <input
                    type="range"
                    min="300"
                    max="1200"
                    step="100"
                    value={canvasHeight}
                    onChange={(e) => setCanvasHeight(parseInt(e.target.value))}
                    className="w-full accent-orange-500"
                  />
                </div>

                {/* Background Color */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Background Color</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={backgroundColor}
                      onChange={(e) => setBackgroundColor(e.target.value)}
                      className="w-12 h-10 rounded cursor-pointer border border-gray-300"
                    />
                    <input
                      type="text"
                      value={backgroundColor}
                      readOnly
                      className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm font-mono"
                    />
                  </div>
                </div>

                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                )}

                {/* Action Buttons */}
                <button
                  onClick={generateImage}
                  disabled={images.length === 0 || processing}
                  className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-lg transition mb-3 flex items-center justify-center gap-2"
                >
                  <ImageIcon size={18} className={processing ? 'animate-spin' : ''} />
                  {processing ? 'Processing...' : 'Generate'}
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
                  <li>Upload up to 10 images</li>
                  <li>Configure canvas size and background</li>
                  <li>Click preview to select and position images</li>
                  <li>Click "Generate" to create canvas</li>
                  <li>Download the result as PNG</li>
                </ol>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                <h3 className="font-bold text-purple-900 mb-3">🎨 Tips</h3>
                <ul className="text-sm text-purple-800 space-y-2">
                  <li>• Images are 80x80px on the canvas</li>
                  <li>• Click on preview to select images</li>
                  <li>• Use light background for better visibility</li>
                  <li>• Larger canvas sizes allow more positioning room</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />

      {/* Hidden Canvas */}
      <canvas ref={canvasRef} className="hidden" />
    </>
  );
}







