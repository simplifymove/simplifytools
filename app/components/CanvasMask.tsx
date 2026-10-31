'use client';

import React, { useRef, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { RotateCcw, Download } from 'lucide-react';
import { uploadBrowserDownloadResult } from '@/app/lib/download-result-client';

export interface CanvasMaskProps {
  imageUrl: string;
  imageWidth: number;
  imageHeight: number;
  onMaskGenerated: (maskBlob: Blob) => void;
  onMaskChanged?: () => void;
  brushSize?: number;
  setBrushSize?: (size: number) => void;
}

export const CanvasMask: React.FC<CanvasMaskProps> = ({
  imageUrl,
  imageWidth,
  imageHeight,
  onMaskGenerated,
  onMaskChanged,
  brushSize = 10,
  setBrushSize,
}) => {
  const router = useRouter();
  const displayCanvasRef = useRef<HTMLCanvasElement>(null);
  const maskCanvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const drawingRef = useRef(false);
  const maskRevisionRef = useRef(0);
  const [mode, setMode] = useState<'brush' | 'eraser'>('brush');
  const [maskPreview, setMaskPreview] = useState<string | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Keep the exported mask at the original image resolution.
  useEffect(() => {
    const displayCanvas = displayCanvasRef.current;
    const maskCanvas = maskCanvasRef.current;
    const container = containerRef.current;
    if (!displayCanvas || !maskCanvas || !container) return;

    let cancelled = false;
    imageRef.current = null;
    drawingRef.current = false;
    maskRevisionRef.current += 1;

    const displayWidth = Math.max(1, Math.min(container.clientWidth || imageWidth, imageWidth));
    const displayHeight = displayWidth * imageHeight / imageWidth;
    const ratio = window.devicePixelRatio || 1;

    displayCanvas.style.width = `${displayWidth}px`;
    displayCanvas.style.height = `${displayHeight}px`;
    displayCanvas.width = Math.max(1, Math.round(displayWidth * ratio));
    displayCanvas.height = Math.max(1, Math.round(displayHeight * ratio));

    maskCanvas.width = imageWidth;
    maskCanvas.height = imageHeight;

    const maskCtx = maskCanvas.getContext('2d');
    if (maskCtx) {
      maskCtx.fillStyle = 'black';
      maskCtx.fillRect(0, 0, imageWidth, imageHeight);
    }

    overlayCanvasRef.current = document.createElement('canvas');

    const image = new Image();
    image.onload = () => {
      if (cancelled) return;
      imageRef.current = image;
      const ctx = displayCanvas.getContext('2d');
      if (!ctx) return;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, displayCanvas.width, displayCanvas.height);
      ctx.drawImage(image, 0, 0, displayCanvas.width, displayCanvas.height);
    };
    image.src = imageUrl;

    return () => {
      cancelled = true;
      drawingRef.current = false;
      maskRevisionRef.current += 1;
      imageRef.current = null;
    };
  }, [imageUrl, imageWidth, imageHeight]);

  const redrawDisplay = () => {
    const displayCanvas = displayCanvasRef.current;
    const maskCanvas = maskCanvasRef.current;
    const image = imageRef.current;
    if (!displayCanvas || !maskCanvas || !image) return;

    const ctx = displayCanvas.getContext('2d');
    if (!ctx) return;

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, displayCanvas.width, displayCanvas.height);
    ctx.drawImage(image, 0, 0, displayCanvas.width, displayCanvas.height);

    // Use the mask as a luminance source at display resolution.
    // Black areas remain transparent; white painted areas become red.
    const overlay = overlayCanvasRef.current;
    if (!overlay) return;

    if (
      overlay.width !== displayCanvas.width ||
      overlay.height !== displayCanvas.height
    ) {
      overlay.width = displayCanvas.width;
      overlay.height = displayCanvas.height;
    }

    const overlayCtx = overlay.getContext('2d');
    if (!overlayCtx) return;

    overlayCtx.setTransform(1, 0, 0, 1, 0, 0);
    overlayCtx.clearRect(0, 0, overlay.width, overlay.height);
    overlayCtx.drawImage(maskCanvas, 0, 0, overlay.width, overlay.height);

    // Convert mask brightness to opacity at display resolution.
    const pixels = overlayCtx.getImageData(0, 0, overlay.width, overlay.height);
    const data = pixels.data;

    for (let i = 0; i < data.length; i += 4) {
      const coverage = data[i];
      data[i] = 255;
      data[i + 1] = 75;
      data[i + 2] = 75;
      data[i + 3] = Math.round(coverage * 0.4);
    }

    overlayCtx.putImageData(pixels, 0, 0);
    ctx.drawImage(overlay, 0, 0);
  };

  const getMaskCoords = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const displayCanvas = displayCanvasRef.current;
    if (!displayCanvas) return { x: 0, y: 0 };

    const rect = displayCanvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) * imageWidth / rect.width,
      y: (e.clientY - rect.top) * imageHeight / rect.height,
    };
  };

  const markChanged = () => {
    maskRevisionRef.current += 1;
    setMaskPreview(null);
    onMaskChanged?.();
  };

  const startDrawing = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;

    const maskCtx = maskCanvasRef.current?.getContext('2d');
    if (!maskCtx) return;

    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    drawingRef.current = true;

    const point = getMaskCoords(e);
    maskCtx.strokeStyle = mode === 'brush' ? 'white' : 'black';
    maskCtx.fillStyle = maskCtx.strokeStyle;
    maskCtx.lineWidth = brushSize;
    maskCtx.lineCap = 'round';
    maskCtx.lineJoin = 'round';

    // Paint a dot even if the user does not drag.
    maskCtx.beginPath();
    maskCtx.arc(point.x, point.y, brushSize / 2, 0, Math.PI * 2);
    maskCtx.fill();
    maskCtx.beginPath();
    maskCtx.moveTo(point.x, point.y);

    markChanged();
    redrawDisplay();
  };

  const draw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current) return;

    const maskCtx = maskCanvasRef.current?.getContext('2d');
    if (!maskCtx) return;

    e.preventDefault();
    const point = getMaskCoords(e);
    maskCtx.lineTo(point.x, point.y);
    maskCtx.stroke();
    maskCtx.beginPath();
    maskCtx.moveTo(point.x, point.y);

    markChanged();
    redrawDisplay();
  };

  const stopDrawing = (e: React.PointerEvent<HTMLCanvasElement>) => {
    drawingRef.current = false;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  };

  const clearCanvas = () => {
    const maskCanvas = maskCanvasRef.current;
    const ctx = maskCanvas?.getContext('2d');
    if (!ctx || !maskCanvas) return;

    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, maskCanvas.width, maskCanvas.height);
    markChanged();
    redrawDisplay();
  };

  const resetCanvas = () => {
    clearCanvas();
  };

  const generateMask = () => {
    const maskCanvas = maskCanvasRef.current;
    if (!maskCanvas) return;

    const maskCtx = maskCanvas.getContext('2d');
    if (!maskCtx) return;

    // Get mask data
    const imageData = maskCtx.getImageData(0, 0, maskCanvas.width, maskCanvas.height);
    const data = imageData.data;

    // Ensure binary: convert any gray to pure white or black
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      
      // If anything > 127, make it 255 (white), else 0 (black)
      const brightness = (r + g + b) / 3;
      const value = brightness > 127 ? 255 : 0;
      
      data[i] = value;     // R
      data[i + 1] = value; // G
      data[i + 2] = value; // B
      data[i + 3] = 255;   // A (fully opaque)
    }

    maskCtx.putImageData(imageData, 0, 0);

    // Create preview
    const previewUrl = maskCanvas.toDataURL('image/png');
    setMaskPreview(previewUrl);

    // Accept the exported mask only if no edits occurred meanwhile.
    const revision = maskRevisionRef.current;
    maskCanvas.toBlob(
      (blob) => {
        if (blob && revision === maskRevisionRef.current) {
          onMaskGenerated(blob);
        }
      },
      'image/png'
    );
  };

  const downloadMask = async () => {
    const maskCanvas = maskCanvasRef.current;
    if (!maskCanvas) return;

    try {
      const blob = await new Promise<Blob>((resolve, reject) => {
        maskCanvas.toBlob((generatedBlob) => {
          if (generatedBlob) resolve(generatedBlob);
          else reject(new Error('Unable to generate the mask image.'));
        }, 'image/png');
      });
      const outputName = `mask-${Date.now()}.png`;
      const download = await uploadBrowserDownloadResult({
        blob,
        toolSlug: 'remove-object',
        originalName: outputName,
        outputName,
      });

      router.push(download.downloadPageUrl);
    } catch (caughtError) {
      window.alert(
        caughtError instanceof Error
          ? caughtError.message
          : 'Unable to prepare the download.',
      );
    }
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Mode Selection */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Mode</label>
            <div className="flex gap-2">
              <button
                onClick={() => setMode('brush')}
                className={`flex-1 px-3 py-2 rounded-lg font-medium transition ${
                  mode === 'brush'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                🎨 Brush (Remove)
              </button>
              <button
                onClick={() => setMode('eraser')}
                className={`flex-1 px-3 py-2 rounded-lg font-medium transition ${
                  mode === 'eraser'
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                🗑️ Eraser (Keep)
              </button>
            </div>
          </div>

          {/* Brush Size */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Brush Size: {brushSize}px
            </label>
            <input
              type="range"
              min="1"
              max="50"
              value={brushSize}
              onChange={(e) => setBrushSize?.(parseInt(e.target.value))}
              className="w-full"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2 items-end">
            <button
              onClick={clearCanvas}
              className="flex-1 px-3 py-2 bg-yellow-600 text-white rounded-lg font-medium hover:bg-yellow-700 transition"
            >
              Clear All
            </button>
            <button
              onClick={resetCanvas}
              className="px-3 py-2 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition"
              title="Reset to original image"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={generateMask}
            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition"
          >
            ✓ Use This Mask
          </button>
          <button
            onClick={downloadMask}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition flex items-center gap-2"
            title="Download mask for backup"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Canvas Container */}
      <div
        ref={containerRef}
        className="bg-black rounded-lg border border-gray-200 overflow-hidden"
        style={{ maxHeight: '600px' }}
      >
        <canvas
          ref={displayCanvasRef}
          onPointerDown={startDrawing}
          onPointerMove={draw}
          onPointerUp={stopDrawing}
          onPointerCancel={stopDrawing}
          className="w-full h-full cursor-crosshair"
          style={{ touchAction: 'none' }}
        />
      </div>

      {/* Hidden mask canvas */}
      <canvas ref={maskCanvasRef} style={{ display: 'none' }} />

      {/* Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
        <p className="font-semibold mb-1">Tips:</p>
        <ul className="list-disc list-inside space-y-1 text-xs">
          <li><strong>Brush (white):</strong> Paint areas you want to remove</li>
          <li><strong>Eraser (black):</strong> Paint areas you want to keep</li>
          <li><strong>Adjust size:</strong> Use the slider for precise or broad strokes</li>
          <li><strong>Start over:</strong> Click Reset to reload the original image</li>
          <li><strong>Mask coverage:</strong> Keep masked area small (&lt;10-15%) for best results</li>
        </ul>
      </div>

      {/* Mask Preview */}
      {maskPreview && (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm font-medium text-gray-700 mb-3">Mask Preview (white = will be removed)</p>
          <img src={maskPreview} alt="mask preview" className="w-full h-auto rounded-lg border border-gray-300" />
        </div>
      )}
    </div>
  );
};


