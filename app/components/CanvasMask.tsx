'use client';

import React, { useRef, useEffect, useState } from 'react';
import { RotateCcw, Download } from 'lucide-react';

export interface CanvasMaskProps {
  imageUrl: string;
  imageWidth: number;
  imageHeight: number;
  onMaskGenerated: (maskBlob: Blob) => void;
  brushSize?: number;
  setBrushSize?: (size: number) => void;
}

export const CanvasMask: React.FC<CanvasMaskProps> = ({
  imageUrl,
  imageWidth,
  imageHeight,
  onMaskGenerated,
  brushSize = 10,
  setBrushSize,
}) => {
  const displayCanvasRef = useRef<HTMLCanvasElement>(null);
  const maskCanvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [mode, setMode] = useState<'brush' | 'eraser'>('brush');
  const [dpr, setDpr] = useState(1);
  const [maskPreview, setMaskPreview] = useState<string | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  // Initialize canvases with proper DPR
  useEffect(() => {
    const displayCanvas = displayCanvasRef.current;
    const maskCanvas = maskCanvasRef.current;
    if (!displayCanvas || !maskCanvas || !containerRef.current) return;

    // Get device pixel ratio
    const devicePixelRatio = window.devicePixelRatio || 1;
    setDpr(devicePixelRatio);

    // Calculate display size
    const containerWidth = containerRef.current.offsetWidth || imageWidth;
    const maxWidth = Math.min(containerWidth, imageWidth);
    const scale = maxWidth / imageWidth;
    const displayWidth = imageWidth * scale;
    const displayHeight = imageHeight * scale;

    // Set display canvas: CSS size vs internal pixel size
    displayCanvas.style.width = `${displayWidth}px`;
    displayCanvas.style.height = `${displayHeight}px`;
    displayCanvas.width = displayWidth * devicePixelRatio;
    displayCanvas.height = displayHeight * devicePixelRatio;

    // Hidden mask canvas: full resolution
    maskCanvas.width = imageWidth;
    maskCanvas.height = imageHeight;

    // Draw initial image on display canvas
    const displayCtx = displayCanvas.getContext('2d');
    if (displayCtx) {
      displayCtx.scale(devicePixelRatio, devicePixelRatio);
      const img = new Image();
      img.onload = () => {
        imageRef.current = img;
        displayCtx.drawImage(img, 0, 0, displayWidth, displayHeight);
      };
      img.src = imageUrl;
    }

    // Initialize mask canvas to pure black (nothing masked)
    const maskCtx = maskCanvas.getContext('2d');
    if (maskCtx) {
      maskCtx.fillStyle = 'black';
      maskCtx.fillRect(0, 0, imageWidth, imageHeight);
    }
  }, [imageUrl, imageWidth, imageHeight]);

  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const displayCanvas = displayCanvasRef.current;
    if (!displayCanvas) return { x: 0, y: 0 };

    const rect = displayCanvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * dpr;
    const y = (e.clientY - rect.top) * dpr;

    return { x, y };
  };

  const getMaskCoords = (canvasX: number, canvasY: number) => {
    const displayCanvas = displayCanvasRef.current;
    if (!displayCanvas) return { x: 0, y: 0 };

    // Map from display canvas coords to full-resolution mask canvas coords
    const displayWidth = displayCanvas.offsetWidth;
    const scaleX = imageWidth / displayWidth;
    const scaleY = imageHeight / displayCanvas.offsetHeight;

    return {
      x: canvasX / dpr * scaleX,
      y: canvasY / dpr * scaleY,
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvasCoords = getCanvasCoords(e);
    const maskCoords = getMaskCoords(canvasCoords.x, canvasCoords.y);

    const maskCanvas = maskCanvasRef.current;
    const maskCtx = maskCanvas?.getContext('2d');
    if (!maskCtx) return;

    maskCtx.beginPath();
    maskCtx.moveTo(maskCoords.x, maskCoords.y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvasCoords = getCanvasCoords(e);
    const maskCoords = getMaskCoords(canvasCoords.x, canvasCoords.y);

    const maskCanvas = maskCanvasRef.current;
    const maskCtx = maskCanvas?.getContext('2d');
    if (!maskCtx) return;

    // Draw on mask canvas with solid color (white for brush, black for eraser)
    maskCtx.strokeStyle = mode === 'brush' ? 'white' : 'black';
    maskCtx.lineWidth = brushSize;
    maskCtx.lineCap = 'round';
    maskCtx.lineJoin = 'round';

    maskCtx.lineTo(maskCoords.x, maskCoords.y);
    maskCtx.stroke();

    // Also draw on display canvas for visual feedback
    const displayCanvas = displayCanvasRef.current;
    const displayCtx = displayCanvas?.getContext('2d');
    if (displayCtx && imageRef.current) {
      // Redraw image
      displayCtx.scale(dpr, dpr);
      displayCtx.drawImage(
        imageRef.current,
        0,
        0,
        displayCanvas!.offsetWidth,
        displayCanvas!.offsetHeight
      );

      // Overlay mask with transparency
      const maskData = maskCtx.getImageData(0, 0, imageWidth, imageHeight);
      const scaledCanvas = document.createElement('canvas');
      scaledCanvas.width = displayCanvas!.offsetWidth;
      scaledCanvas.height = displayCanvas!.offsetHeight;
      const scaledCtx = scaledCanvas.getContext('2d');
      if (scaledCtx) {
        scaledCtx.putImageData(maskData, 0, 0);
        displayCtx.globalAlpha = 0.3;
        displayCtx.drawImage(scaledCanvas, 0, 0);
        displayCtx.globalAlpha = 1.0;
      }
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const maskCanvas = maskCanvasRef.current;
    const maskCtx = maskCanvas?.getContext('2d');
    if (maskCtx && maskCanvas) {
      maskCtx.fillStyle = 'black';
      maskCtx.fillRect(0, 0, maskCanvas.width, maskCanvas.height);
      redrawDisplay();
    }
  };

  const resetCanvas = () => {
    const displayCanvas = displayCanvasRef.current;
    const displayCtx = displayCanvas?.getContext('2d');
    if (displayCtx && imageRef.current && displayCanvas) {
      displayCtx.scale(dpr, dpr);
      displayCtx.drawImage(
        imageRef.current,
        0,
        0,
        displayCanvas.offsetWidth,
        displayCanvas.offsetHeight
      );
    }
    clearCanvas();
  };

  const redrawDisplay = () => {
    const displayCanvas = displayCanvasRef.current;
    const maskCanvas = maskCanvasRef.current;
    const displayCtx = displayCanvas?.getContext('2d');
    const maskCtx = maskCanvas?.getContext('2d');

    if (!displayCtx || !maskCtx || !imageRef.current || !displayCanvas || !maskCanvas) return;

    displayCtx.scale(dpr, dpr);
    displayCtx.drawImage(
      imageRef.current,
      0,
      0,
      displayCanvas.offsetWidth,
      displayCanvas.offsetHeight
    );

    const maskData = maskCtx.getImageData(0, 0, maskCanvas.width, maskCanvas.height);
    const scaledCanvas = document.createElement('canvas');
    scaledCanvas.width = displayCanvas.offsetWidth;
    scaledCanvas.height = displayCanvas.offsetHeight;
    const scaledCtx = scaledCanvas.getContext('2d');
    if (scaledCtx) {
      scaledCtx.putImageData(maskData, 0, 0);
      displayCtx.globalAlpha = 0.3;
      displayCtx.drawImage(scaledCanvas, 0, 0);
      displayCtx.globalAlpha = 1.0;
    }
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

    // Export as PNG blob (no alpha channel, just RGB)
    maskCanvas.toBlob(
      (blob) => {
        if (blob) {
          onMaskGenerated(blob);
        }
      },
      'image/png'
    );
  };

  const downloadMask = () => {
    const maskCanvas = maskCanvasRef.current;
    if (!maskCanvas) return;

    const link = document.createElement('a');
    link.href = maskCanvas.toDataURL('image/png');
    link.download = `mask-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          className="w-full h-full cursor-crosshair"
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
