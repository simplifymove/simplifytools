'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Download, ChevronRight, RotateCcw, ZoomIn, ZoomOut, Scissors, Hand } from 'lucide-react';
import { HomeHeader } from '../../components/HomeHeader';
import { ImageUploader } from '../../components/ImageUploader';
import { Footer } from '../../components/Footer';
import { PriorityToolGuide } from '@/app/components/PriorityToolGuide';
import { useImageToolErrors } from '@/app/hooks/useImageToolErrors';
import { ErrorAlert } from '@/app/components/error-components';
import { ImageToolErrorType } from '@/app/utils/types/errors';
import { uploadBrowserDownloadResult } from '@/app/lib/download-result-client';

const TOOL_ID = 'crop-image';
const TOOL_NAME = 'Crop Image';

interface CropBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export default function CropImagePage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const { error, clearError, createError } = useImageToolErrors();

  // Canvas and image refs
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const hiddenCanvasRef = useRef<HTMLCanvasElement>(null);

  // Crop state
  const [cropBox, setCropBox] = useState<CropBox>({ x: 0, y: 0, width: 100, height: 100 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [aspectRatio, setAspectRatio] = useState<'free' | '1:1' | '4:3' | '16:9' | '3:2'>('free');
  const [outputFormat, setOutputFormat] = useState<'png' | 'jpg' | 'webp'>('png');

  // Dragging state
  const [isDragging, setIsDragging] = useState(false);
  const [draggedEdge, setDraggedEdge] = useState<string | null>(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    clearError();
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
      setResult(null);
      setCropBox({ x: 10, y: 10, width: 80, height: 80 });
      setZoom(1);
      setRotation(0);
    };
    reader.onerror = () => {
      createError(
        ImageToolErrorType.FILE_CORRUPTED,
        TOOL_ID,
        TOOL_NAME,
        { file: selectedFile }
      );
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleClearPreview = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    clearError();
    setCropBox({ x: 0, y: 0, width: 100, height: 100 });
  };

  // Real-time preview rendering
  useEffect(() => {
    if (!preview || !imageRef.current || !previewCanvasRef.current) return;

    const img = imageRef.current;
    const canvas = previewCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size based on container
    const container = containerRef.current;
    if (container) {
      canvas.width = container.offsetWidth;
      canvas.height = container.offsetHeight;
    }

    // Draw image with rotation
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(zoom, zoom);
    ctx.translate(-canvas.width / 2, -canvas.height / 2);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    ctx.restore();

    // Draw overlay and crop box
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const x = (cropBox.x / 100) * canvas.width;
    const y = (cropBox.y / 100) * canvas.height;
    const width = (cropBox.width / 100) * canvas.width;
    const height = (cropBox.height / 100) * canvas.height;

    // Clear crop area
    ctx.clearRect(x, y, width, height);

    // Draw crop box border
    ctx.strokeStyle = '#ff6b35';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, width, height);

    // Draw grid lines
    ctx.strokeStyle = 'rgba(255, 107, 53, 0.3)';
    ctx.lineWidth = 1;
    for (let i = 1; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(x + (width / 3) * i, y);
      ctx.lineTo(x + (width / 3) * i, y + height);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x, y + (height / 3) * i);
      ctx.lineTo(x + width, y + (height / 3) * i);
      ctx.stroke();
    }

    // Draw handles
    const handleSize = 8;
    const handles = [
      { x: x - handleSize / 2, y: y - handleSize / 2, edge: 'tl' },
      { x: x + width / 2 - handleSize / 2, y: y - handleSize / 2, edge: 't' },
      { x: x + width - handleSize / 2, y: y - handleSize / 2, edge: 'tr' },
      { x: x - handleSize / 2, y: y + height / 2 - handleSize / 2, edge: 'l' },
      { x: x + width - handleSize / 2, y: y + height / 2 - handleSize / 2, edge: 'r' },
      { x: x - handleSize / 2, y: y + height - handleSize / 2, edge: 'bl' },
      { x: x + width / 2 - handleSize / 2, y: y + height - handleSize / 2, edge: 'b' },
      { x: x + width - handleSize / 2, y: y + height - handleSize / 2, edge: 'br' },
    ];

    handles.forEach((handle) => {
      ctx.fillStyle = '#ff6b35';
      ctx.fillRect(handle.x, handle.y, handleSize, handleSize);
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1;
      ctx.strokeRect(handle.x, handle.y, handleSize, handleSize);
    });
  }, [preview, cropBox, zoom, rotation]);

  // Mouse down on canvas
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!previewCanvasRef.current || !imageRef.current) return;

    const canvas = previewCanvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const mouseX = ((e.clientX - rect.left) / rect.width) * 100;
    const mouseY = ((e.clientY - rect.top) / rect.height) * 100;

    const x = cropBox.x;
    const y = cropBox.y;
    const w = cropBox.width;
    const h = cropBox.height;

    // Detect which edge/handle was clicked
    const edge = 5; // Tolerance in percent
    let dragging = '';

    if (Math.abs(mouseX - x) < edge && Math.abs(mouseY - y) < edge) dragging = 'tl';
    else if (Math.abs(mouseX - (x + w / 2)) < edge && Math.abs(mouseY - y) < edge) dragging = 't';
    else if (Math.abs(mouseX - (x + w)) < edge && Math.abs(mouseY - y) < edge) dragging = 'tr';
    else if (Math.abs(mouseX - x) < edge && Math.abs(mouseY - (y + h / 2)) < edge) dragging = 'l';
    else if (Math.abs(mouseX - (x + w)) < edge && Math.abs(mouseY - (y + h / 2)) < edge) dragging = 'r';
    else if (Math.abs(mouseX - x) < edge && Math.abs(mouseY - (y + h)) < edge) dragging = 'bl';
    else if (Math.abs(mouseX - (x + w / 2)) < edge && Math.abs(mouseY - (y + h)) < edge) dragging = 'b';
    else if (Math.abs(mouseX - (x + w)) < edge && Math.abs(mouseY - (y + h)) < edge) dragging = 'br';
    else if (mouseX > x - edge && mouseX < x + w + edge && mouseY > y - edge && mouseY < y + h + edge) {
      dragging = 'move';
    }

    if (dragging) {
      setIsDragging(true);
      setDraggedEdge(dragging);
      setDragStart({ x: mouseX, y: mouseY });
    }
  };

  // Mouse move
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !previewCanvasRef.current) return;

    const canvas = previewCanvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const mouseX = ((e.clientX - rect.left) / rect.width) * 100;
    const mouseY = ((e.clientY - rect.top) / rect.height) * 100;

    const dx = mouseX - dragStart.x;
    const dy = mouseY - dragStart.y;

    const newBox = { ...cropBox };

    if (draggedEdge === 'move') {
      newBox.x = Math.max(0, Math.min(100 - newBox.width, newBox.x + dx));
      newBox.y = Math.max(0, Math.min(100 - newBox.height, newBox.y + dy));
    } else if (draggedEdge?.includes('t')) {
      newBox.y = Math.max(0, newBox.y + dy);
      newBox.height = Math.max(10, newBox.height - dy);
    } else if (draggedEdge?.includes('b')) {
      newBox.height = Math.max(10, newBox.height + dy);
    }

    if (draggedEdge?.includes('l')) {
      newBox.x = Math.max(0, newBox.x + dx);
      newBox.width = Math.max(10, newBox.width - dx);
    } else if (draggedEdge?.includes('r')) {
      newBox.width = Math.max(10, newBox.width + dx);
    }

    // Apply aspect ratio constraint
    if (aspectRatio !== 'free') {
      const ratios: Record<string, number> = { '1:1': 1, '4:3': 4 / 3, '16:9': 16 / 9, '3:2': 3 / 2 };
      const ratio = ratios[aspectRatio];
      const targetHeight = newBox.width / ratio;
      if (draggedEdge?.includes('b')) {
        newBox.height = Math.min(100 - newBox.y, targetHeight);
      } else if (draggedEdge?.includes('t')) {
        newBox.height = Math.min(100 - newBox.y, targetHeight);
      }
    }

    setCropBox(newBox);
    setDragStart({ x: mouseX, y: mouseY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDraggedEdge(null);
  };

  // Fast crop processing
  const cropImage = async () => {
    if (!preview || !imageRef.current || !file) {
      createError(
        ImageToolErrorType.EMPTY_FILE,
        TOOL_ID,
        TOOL_NAME
      );
      return;
    }

    setProcessing(true);
    clearError();

    try {
      const img = imageRef.current;
      const canvas = hiddenCanvasRef.current;
      if (!canvas) {
        throw new Error('Canvas not available');
      }

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('Cannot get canvas context');
      }

      // Calculate actual crop dimensions from percentage
      const x = (cropBox.x / 100) * img.width;
      const y = (cropBox.y / 100) * img.height;
      const width = (cropBox.width / 100) * img.width;
      const height = (cropBox.height / 100) * img.height;

      canvas.width = width;
      canvas.height = height;

      // Draw cropped image with rotation
      ctx.save();
      ctx.translate(width / 2, height / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.scale(zoom, zoom);
      ctx.translate(-width / 2, -height / 2);
      ctx.drawImage(img, x, y, width, height, 0, 0, width, height);
      ctx.restore();

      // Convert to blob (fast, no compression during this step)
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            createError(
              ImageToolErrorType.SHARP_FAILED,
              TOOL_ID,
              TOOL_NAME,
              { file }
            );
            setProcessing(false);
            return;
          }
          const url = URL.createObjectURL(blob);
          setResult(url);
          setProcessing(false);
        },
        outputFormat === 'jpg' ? 'image/jpeg' : `image/${outputFormat}`,
        outputFormat === 'jpg' ? 0.92 : 1
      );
    } catch (err) {
      createError(
        ImageToolErrorType.SHARP_FAILED,
        TOOL_ID,
        TOOL_NAME,
        { file }
      );
      setProcessing(false);
    }
  };

  const handleDownload = async () => {
    if (!result || !file) return;

    setProcessing(true);
    clearError();

    try {
      const response = await fetch(result);

      if (!response.ok) {
        throw new Error('Failed to read the cropped image');
      }

      const blob = await response.blob();

      const downloadResult = await uploadBrowserDownloadResult({
        blob,
        toolSlug: TOOL_ID,
        originalName: file.name,
        outputName: `cropped-image.${outputFormat}`,
      });

      router.push(downloadResult.downloadPageUrl);
    } catch (error) {
      createError(
        ImageToolErrorType.NETWORK_ERROR,
        TOOL_ID,
        TOOL_NAME,
        { error: error instanceof Error ? error.message : 'Unknown error' },
        { filename: file.name, size: file.size, mimeType: file.type }
      );
    } finally {
      setProcessing(false);
    }
  };

  return (
    <>
      <HomeHeader />
      <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex flex-col">
        {/* Hero Header */}
        <div className="relative bg-gradient-to-r from-orange-500 to-red-500 py-16 px-4 md:px-8 overflow-hidden">
          <div className="max-w-6xl mx-auto relative z-10">
            <div className="flex items-center gap-2 text-white/90 text-sm mb-6">
              <Link href="/" className="hover:text-white transition">Home</Link>
              <ChevronRight size={16} />
              <Link href="/all-tools" className="hover:text-white transition">All Tools</Link>
              <ChevronRight size={16} />
              <span>Crop Image</span>
            </div>
            <div className="flex items-start gap-4">
              <div className="p-3 bg-white/20 rounded-lg">
                <Scissors size={32} className="text-white" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">Crop Image</h1>
                <p className="text-lg text-white/90">Drag the crop area, adjust its handles, and review the browser preview before creating the result.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 py-12 px-4 md:px-8">
          <div className="max-w-6xl mx-auto">
            {error && <ErrorAlert error={error} onDismiss={clearError} />}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Upload Section */}
              {!preview ? (
                <div className="lg:col-span-2">
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Upload Image to Crop</h2>
                    <ImageUploader onFileSelect={handleFileSelect} preview={preview} onClearPreview={() => { setFile(null); setPreview(null); setResult(null); }} toolId={TOOL_ID} onValidationError={() => {}} />
                  </div>
                </div>
              ) : (
                <>
                  {/* Interactive Crop Preview */}
                  <div className="lg:col-span-2">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sticky top-4">
                      <h2 className="text-xl font-bold text-gray-900 mb-4">Drag to Crop (Real-time Preview)</h2>
                      <div
                        ref={containerRef}
                        className="relative bg-gray-900 rounded-lg overflow-hidden cursor-crosshair"
                        style={{ height: '500px' }}
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}
                      >
                        <img ref={imageRef} src={preview} alt="preview" style={{ display: 'none' }} />
                        <canvas ref={previewCanvasRef} className="w-full h-full" />
                        <div className="absolute top-4 left-4 bg-orange-500 text-white px-2 py-1 rounded text-xs font-semibold">
                          <Hand size={12} className="inline mr-1" /> Drag handles to adjust
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Settings Sidebar */}
                  <div className="space-y-4">
                    {/* Aspect Ratio */}
                    <div className="bg-white rounded-lg border border-gray-200 p-4">
                      <h3 className="font-semibold text-gray-900 mb-3">Aspect Ratio</h3>
                      <select
                        value={aspectRatio}
                        onChange={(e) => setAspectRatio(e.target.value as any)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                      >
                        <option value="free">Free</option>
                        <option value="1:1">Square (1:1)</option>
                        <option value="4:3">Standard (4:3)</option>
                        <option value="16:9">Widescreen (16:9)</option>
                        <option value="3:2">Classic (3:2)</option>
                      </select>
                    </div>

                    {/* Zoom */}
                    <div className="bg-white rounded-lg border border-gray-200 p-4">
                      <h3 className="font-semibold text-gray-900 mb-3">Zoom: {zoom.toFixed(2)}x</h3>
                      <div className="flex items-center gap-2">
                        <ZoomOut size={16} className="text-gray-600" />
                        <input
                          type="range"
                          min="0.5"
                          max="2"
                          step="0.1"
                          value={zoom}
                          onChange={(e) => setZoom(parseFloat(e.target.value))}
                          className="flex-1"
                        />
                        <ZoomIn size={16} className="text-gray-600" />
                      </div>
                    </div>

                    {/* Rotation */}
                    <div className="bg-white rounded-lg border border-gray-200 p-4">
                      <h3 className="font-semibold text-gray-900 mb-3">Rotate: {rotation}°</h3>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setRotation((r) => (r - 90 + 360) % 360)}
                          className="flex-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition"
                        >
                          ↻ -90°
                        </button>
                        <button
                          onClick={() => setRotation((r) => (r + 90) % 360)}
                          className="flex-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition"
                        >
                          ↻ +90°
                        </button>
                      </div>
                    </div>

                    {/* Format */}
                    <div className="bg-white rounded-lg border border-gray-200 p-4">
                      <h3 className="font-semibold text-gray-900 mb-3">Format</h3>
                      <div className="grid grid-cols-3 gap-2">
                        {(['png', 'jpg', 'webp'] as const).map((fmt) => (
                          <button
                            key={fmt}
                            onClick={() => setOutputFormat(fmt)}
                            className={`py-2 rounded-lg font-medium text-xs transition ${
                              outputFormat === fmt
                                ? 'bg-orange-500 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {fmt === 'jpg' ? 'JPG' : fmt.toUpperCase()}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Error */}
                    {error && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <p className="text-red-900 font-semibold text-sm">Error</p>
                        <p className="text-red-700 text-xs mt-1">{error.message}</p>
                      </div>
                    )}

                    {/* Crop Button */}
                    <button
                      onClick={cropImage}
                      disabled={processing}
                      className="w-full py-3 px-6 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2"
                    >
                      <Scissors size={20} />
                      {processing ? 'Processing...' : 'Crop Now'}
                    </button>

                    {/* Reset */}
                    <button
                      onClick={handleClearPreview}
                      className="w-full py-2 px-4 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-lg transition flex items-center justify-center gap-2"
                    >
                      <RotateCcw size={16} />
                      Start Over
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Result */}
            {result && (
              <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Cropped Result</h2>
                <div className="flex justify-center bg-gray-50 rounded-lg p-4 mb-6">
                  <img src={result} alt="cropped" className="rounded-lg shadow-lg max-h-96" />
                </div>
                <div className="flex gap-4">
                  <button
                    onClick={handleDownload}
                    disabled={processing}
                    className="flex-1 py-3 px-6 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2"
                  >
                    {processing ? (
                      'Preparing download...'
                    ) : (
                      <>
                        <Download size={20} />
                        Download {outputFormat.toUpperCase()}
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleClearPreview}
                    className="flex-1 py-3 px-6 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg transition flex items-center justify-center gap-2"
                  >
                    <RotateCcw size={20} />
                    Crop Another
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        <PriorityToolGuide toolId="crop-image" />
      </main>

      {false && (<>
      {/* How to Use Section */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        <div className="bg-white rounded-lg border border-gray-200 p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">How to Crop an Image</h2>
          <ol className="space-y-4 text-gray-700">
            <li className="flex gap-4">
              <span className="text-orange-500 font-bold min-w-8">1.</span>
              <span><strong>Upload Image:</strong> Select a JPG, PNG, or WebP image file.</span>
            </li>
            <li className="flex gap-4">
              <span className="text-orange-500 font-bold min-w-8">2.</span>
              <span><strong>Drag to Adjust:</strong> Click and drag the crop box handles to adjust the crop area. The preview updates in real-time.</span>
            </li>
            <li className="flex gap-4">
              <span className="text-orange-500 font-bold min-w-8">3.</span>
              <span><strong>Set Options:</strong> Choose aspect ratio, zoom, rotation, and output format from the sidebar.</span>
            </li>
            <li className="flex gap-4">
              <span className="text-orange-500 font-bold min-w-8">4.</span>
              <span><strong>Crop Now:</strong> Click the "Crop Now" button to process your image.</span>
            </li>
            <li className="flex gap-4">
              <span className="text-orange-500 font-bold min-w-8">5.</span>
              <span><strong>Download:</strong> Download the cropped image in your preferred format.</span>
            </li>
          </ol>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        <div className="bg-white rounded-lg border border-gray-200 p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Benefits of Our Crop Tool</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-bold text-orange-500 mb-2">✓ Interactive Dragging</h3>
              <p className="text-gray-700">Drag crop handles freely with your mouse. Intuitive interface for precise crop control.</p>
            </div>
            <div>
              <h3 className="text-lg font-bold text-orange-500 mb-2">✓ Real-Time Preview</h3>
              <p className="text-gray-700">The browser preview updates as you adjust the selection. The grid can help with composition and alignment.</p>
            </div>
            <div>
              <h3 className="text-lg font-bold text-orange-500 mb-2">✓ Multiple Aspect Ratios</h3>
              <p className="text-gray-700">Use free crop or choose 1:1, 4:3, 16:9, or 3:2 when the destination requires one of those proportions.</p>
            </div>
            <div>
              <h3 className="text-lg font-bold text-orange-500 mb-2">✓ Zoom & Rotate</h3>
              <p className="text-gray-700">Use the preview controls to inspect detail and adjust rotation while positioning the crop.</p>
            </div>
            <div>
              <h3 className="text-lg font-bold text-orange-500 mb-2">✓ Fast Processing</h3>
              <p className="text-gray-700">The crop tool updates the selected image region in the browser before the result is prepared for download.</p>
            </div>
            <div>
              <h3 className="text-lg font-bold text-orange-500 mb-2">✓ Browser-Based Editing</h3>
              <p className="text-gray-700">Cropping and preview generation are performed in the browser. The generated result is prepared for the site's download flow when you continue to download.</p>
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
              <summary className="font-bold text-gray-800 cursor-pointer">How do I drag the crop box?</summary>
              <p className="text-gray-700 mt-2">Click and drag any of the 8 handles around the crop box to resize it. Click inside the box to move it. The preview updates in real-time.</p>
            </details>
            <details className="border-l-4 border-orange-500 pl-4 py-2">
              <summary className="font-bold text-gray-800 cursor-pointer">What aspect ratios are available?</summary>
              <p className="text-gray-700 mt-2">We support free crop, square (1:1), standard (4:3), widescreen (16:9), and classic (3:2) aspect ratios.</p>
            </details>
            <details className="border-l-4 border-orange-500 pl-4 py-2">
              <summary className="font-bold text-gray-800 cursor-pointer">Can I undo a crop?</summary>
              <p className="text-gray-700 mt-2">Yes! Click "Start Over" to upload a new image or adjust your crop settings again.</p>
            </details>
            <details className="border-l-4 border-orange-500 pl-4 py-2">
              <summary className="font-bold text-gray-800 cursor-pointer">How fast is the processing?</summary>
              <p className="text-gray-700 mt-2">Processing time depends on the image and device. After cropping, the generated result can be prepared for download.</p>
            </details>
            <details className="border-l-4 border-orange-500 pl-4 py-2">
              <summary className="font-bold text-gray-800 cursor-pointer">What output formats are supported?</summary>
              <p className="text-gray-700 mt-2">We support PNG (lossless), JPG (compressed), and WebP (modern format) exports.</p>
            </details>
            <details className="border-l-4 border-orange-500 pl-4 py-2">
              <summary className="font-bold text-gray-800 cursor-pointer">Is my image data safe?</summary>
              <p className="text-gray-700 mt-2">The crop operation itself is performed in your browser. When you continue to download, the generated result is passed through the site's download-result flow.</p>
            </details>
          </div>
        </div>
      </div>

      {/* Related Tools Section */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        <div className="bg-white rounded-lg border border-gray-200 p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Related Image Tools</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Link href="/all-tools/resize-image" className="p-4 border-2 border-orange-200 rounded-lg hover:bg-orange-50 transition">
              <h3 className="font-bold text-gray-800 mb-1">Resize Image</h3>
              <p className="text-sm text-gray-600">Change image dimensions and scale</p>
            </Link>
            <Link href="/all-tools/rotate-image" className="p-4 border-2 border-orange-200 rounded-lg hover:bg-orange-50 transition">
              <h3 className="font-bold text-gray-800 mb-1">Rotate Image</h3>
              <p className="text-sm text-gray-600">Rotate images by any angle</p>
            </Link>
            <Link href="/all-tools/compress-image" className="p-4 border-2 border-orange-200 rounded-lg hover:bg-orange-50 transition">
              <h3 className="font-bold text-gray-800 mb-1">Compress Image</h3>
              <p className="text-sm text-gray-600">Reduce image dimensions or file size when appropriate</p>
            </Link>
          </div>
        </div>
      </div>

      </>)}
      <Footer />

      {/* Hidden canvas for final crop output */}
      <canvas ref={hiddenCanvasRef} style={{ display: 'none' }} />

      {false && <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Crop Image - Free Online Image Cropper & Resizer Tool',
        description: 'Crop and resize images with interactive dragging. Real-time preview with precision control.',
        url: 'https://simplifyconvert.com/all-tools/crop-image',
        applicationCategory: 'Multimedia',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD', availability: 'https://schema.org/InStock' },
        author: { '@type': 'Organization', name: 'SimplifyConvert', url: 'https://simplifyconvert.com' },
        datePublished: '2024-01-01',
        image: 'https://simplifyconvert.com/og-image.jpg',
        featureList: [
          'Interactive drag-to-crop with real-time preview',
          'Multiple aspect ratio presets',
          'Zoom and rotation controls',
          'Fast processing',
          'Multiple output formats',
          'No registration required',
          'Privacy-focused processing',
        ],
      })}} />}
    </>
  );
}
