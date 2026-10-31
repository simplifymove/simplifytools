'use client';

import React, { useRef, useState } from 'react';
import { Loader, Pen, RotateCcw, Upload } from 'lucide-react';
import { compressImage, validateImageFile } from '@/app/lib/image-utils';

interface Props {
  activeTool: string;
  shapeType: string;
  drawingType: string;
  strokeColor: string;
  strokeWidth: number;
  highlightColor: string;

  onShapeTypeChange: (value: string) => void;
  onDrawingTypeChange: (value: string) => void;
  onStrokeColorChange: (value: string) => void;
  onStrokeWidthChange: (value: number) => void;
  onHighlightColorChange: (value: string) => void;

  onImageCreate?: (data: string) => void;
  onSignatureCreate?: (data: string) => void;
}

const sectionClass = 'space-y-3';
const labelClass =
  'block text-xs font-medium uppercase tracking-wide text-gray-400';

export default function ToolSettingsPanel({
  activeTool,
  shapeType,
  drawingType,
  strokeColor,
  strokeWidth,
  highlightColor,
  onShapeTypeChange,
  onDrawingTypeChange,
  onStrokeColorChange,
  onStrokeWidthChange,
  onHighlightColorChange,
  onImageCreate,
  onSignatureCreate,
}: Props) {
  const imageInputRef = useRef<HTMLInputElement>(null);
  const signatureCanvasRef = useRef<HTMLCanvasElement>(null);

  const [isCompressingImage, setIsCompressingImage] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);

  const [isDrawingSignature, setIsDrawingSignature] = useState(false);
  const [signatureHasInk, setSignatureHasInk] = useState(false);

  const renderColorControl = (
    label: string,
    value: string,
    onChange: (value: string) => void
  ) => {
    const colorValue = value.startsWith('rgba') ? '#ffff00' : value;

    return (
      <div className={sectionClass}>
        <label className={labelClass}>{label}</label>

        <div className="flex items-center gap-3">
          <input
            type="color"
            value={colorValue}
            onChange={(event) => onChange(event.target.value)}
            className="h-9 w-12 cursor-pointer rounded-md border border-gray-700 bg-transparent p-1"
          />

          <span className="truncate text-xs text-gray-300">
            {value}
          </span>
        </div>
      </div>
    );
  };

  const handleImageFile = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    try {
      setImageError(null);
      setIsCompressingImage(true);

      const validation = validateImageFile(file, 5 * 1024 * 1024);

      if (!validation.valid) {
        setImageError(validation.error || 'Invalid image file');
        return;
      }

      const compressedData = await compressImage(file, {
        maxWidth: 1024,
        maxHeight: 1024,
        quality: 0.8,
        format: 'jpeg',
      });

      onImageCreate?.(compressedData);
    } catch (error) {
      setImageError(
        error instanceof Error
          ? error.message
          : 'Failed to process image'
      );
    } finally {
      setIsCompressingImage(false);

      if (imageInputRef.current) {
        imageInputRef.current.value = '';
      }
    }
  };

  const getSignaturePoint = (
    event: React.PointerEvent<HTMLCanvasElement>
  ) => {
    const canvas = signatureCanvasRef.current;

    if (!canvas) {
      return null;
    }

    const rect = canvas.getBoundingClientRect();

    return {
      x: ((event.clientX - rect.left) / rect.width) * canvas.width,
      y: ((event.clientY - rect.top) / rect.height) * canvas.height,
    };
  };

  const handleSignaturePointerDown = (
    event: React.PointerEvent<HTMLCanvasElement>
  ) => {
    const canvas = signatureCanvasRef.current;
    const point = getSignaturePoint(event);

    if (!canvas || !point) {
      return;
    }

    event.preventDefault();
    canvas.setPointerCapture(event.pointerId);

    const context = canvas.getContext('2d');

    if (!context) {
      return;
    }

    context.strokeStyle = '#000000';
    context.lineWidth = 2;
    context.lineCap = 'round';
    context.lineJoin = 'round';

    context.beginPath();
    context.moveTo(point.x, point.y);

    setIsDrawingSignature(true);
  };

  const handleSignaturePointerMove = (
    event: React.PointerEvent<HTMLCanvasElement>
  ) => {
    if (!isDrawingSignature) {
      return;
    }

    const canvas = signatureCanvasRef.current;
    const point = getSignaturePoint(event);

    if (!canvas || !point) {
      return;
    }

    event.preventDefault();

    const context = canvas.getContext('2d');

    if (!context) {
      return;
    }

    context.lineTo(point.x, point.y);
    context.stroke();

    setSignatureHasInk(true);
  };

  const finishSignatureStroke = (
    event: React.PointerEvent<HTMLCanvasElement>
  ) => {
    const canvas = signatureCanvasRef.current;

    if (canvas?.hasPointerCapture(event.pointerId)) {
      canvas.releasePointerCapture(event.pointerId);
    }

    setIsDrawingSignature(false);
  };

  const clearSignature = () => {
    const canvas = signatureCanvasRef.current;

    if (!canvas) {
      return;
    }

    const context = canvas.getContext('2d');

    if (!context) {
      return;
    }

    context.clearRect(0, 0, canvas.width, canvas.height);

    setSignatureHasInk(false);
    setIsDrawingSignature(false);
  };

  const saveSignature = () => {
    const canvas = signatureCanvasRef.current;

    if (!canvas || !signatureHasInk) {
      return;
    }

    onSignatureCreate?.(
      canvas.toDataURL('image/png')
    );

    clearSignature();
  };

  return (
    <div className="h-full overflow-y-auto border-l border-gray-800 bg-gray-900">
      <div className="border-b border-gray-800 px-4 py-4">
        <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
          Tool settings
        </p>

        <h2 className="mt-1 text-sm font-semibold capitalize text-white">
          {activeTool === 'drawing'
            ? 'Draw'
            : activeTool === 'signature'
              ? 'eSign'
              : activeTool}
        </h2>
      </div>

      <div className="space-y-6 p-4">
        {activeTool === 'select' && (
          <div className="rounded-lg border border-gray-800 bg-gray-950/50 p-4">
            <p className="text-sm font-medium text-gray-200">
              Select an object
            </p>
            <p className="mt-1 text-xs leading-5 text-gray-500">
              Click an edit on the document to change its properties.
            </p>
          </div>
        )}

        {activeTool === 'highlight' && (
          <>
            {renderColorControl(
              'Highlight color',
              highlightColor,
              onHighlightColorChange
            )}
            <p className="text-xs leading-5 text-gray-500">
              Drag directly across the document to create a highlight.
            </p>
          </>
        )}

        {activeTool === 'shape' && (
          <>
            <div className={sectionClass}>
              <label className={labelClass}>Shape</label>

              <select
                value={shapeType}
                onChange={(event) =>
                  onShapeTypeChange(event.target.value)
                }
                className="w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white outline-none focus:border-orange-500"
              >
                <option value="rectangle">Rectangle</option>
                <option value="circle">Circle</option>
                <option value="line">Line</option>
                <option value="arrow">Arrow</option>
              </select>
            </div>

            {renderColorControl(
              'Stroke color',
              strokeColor,
              onStrokeColorChange
            )}

            <div className={sectionClass}>
              <div className="flex items-center justify-between">
                <label className={labelClass}>Stroke width</label>
                <span className="text-xs text-gray-400">
                  {strokeWidth}px
                </span>
              </div>

              <input
                type="range"
                min="1"
                max="12"
                step="1"
                value={strokeWidth}
                onChange={(event) =>
                  onStrokeWidthChange(Number(event.target.value))
                }
                className="w-full accent-orange-500"
              />
            </div>
          </>
        )}

        {activeTool === 'drawing' && (
          <>
            <div className={sectionClass}>
              <label className={labelClass}>Drawing mode</label>

              <select
                value={drawingType}
                onChange={(event) =>
                  onDrawingTypeChange(event.target.value)
                }
                className="w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white outline-none focus:border-orange-500"
              >
                <option value="pen">Pen</option>
                <option value="line">Line</option>
              </select>
            </div>

            {renderColorControl(
              'Stroke color',
              strokeColor,
              onStrokeColorChange
            )}

            <div className={sectionClass}>
              <div className="flex items-center justify-between">
                <label className={labelClass}>Stroke width</label>
                <span className="text-xs text-gray-400">
                  {strokeWidth}px
                </span>
              </div>

              <input
                type="range"
                min="1"
                max="16"
                step="1"
                value={strokeWidth}
                onChange={(event) =>
                  onStrokeWidthChange(Number(event.target.value))
                }
                className="w-full accent-orange-500"
              />
            </div>

            <p className="text-xs leading-5 text-gray-500">
              Draw directly on the PDF. Select the object afterward to edit it.
            </p>
          </>
        )}

        {activeTool === 'image' && (
          <div className={sectionClass}>
            <p className="text-xs leading-5 text-gray-400">
              Upload an image and it will be placed on the current page.
            </p>

            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageFile}
              disabled={isCompressingImage}
              className="sr-only"
            />

            <button
              type="button"
              disabled={isCompressingImage}
              onClick={() => imageInputRef.current?.click()}
              className="flex w-full items-center justify-center gap-2 rounded-md bg-orange-500 px-3 py-2 text-sm font-medium text-white transition hover:bg-orange-600 disabled:opacity-60"
            >
              {isCompressingImage ? (
                <>
                  <Loader className="h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Upload image
                </>
              )}
            </button>

            {imageError && (
              <div className="rounded-md border border-red-800 bg-red-950/40 p-3 text-xs text-red-300">
                {imageError}
              </div>
            )}
          </div>
        )}

        {activeTool === 'signature' && (
          <div className={sectionClass}>
            <div>
              <label className={labelClass}>
                Draw signature
              </label>

              <p className="mt-1 text-xs leading-5 text-gray-500">
                Draw inside the box, then add it to the current page.
              </p>
            </div>

            <canvas
              ref={signatureCanvasRef}
              width={300}
              height={120}
              onPointerDown={handleSignaturePointerDown}
              onPointerMove={handleSignaturePointerMove}
              onPointerUp={finishSignatureStroke}
              onPointerCancel={finishSignatureStroke}
              className="w-full touch-none cursor-crosshair rounded-md border border-gray-600 bg-white"
            />

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={clearSignature}
                className="flex items-center justify-center gap-2 rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-gray-200 hover:bg-gray-700"
              >
                <RotateCcw className="h-4 w-4" />
                Clear
              </button>

              <button
                type="button"
                disabled={!signatureHasInk}
                onClick={saveSignature}
                className="flex items-center justify-center gap-2 rounded-md bg-orange-500 px-3 py-2 text-sm font-medium text-white hover:bg-orange-600 disabled:opacity-40"
              >
                <Pen className="h-4 w-4" />
                Add
              </button>
            </div>
          </div>
        )}

        {![
          'select',
          'highlight',
          'shape',
          'drawing',
          'image',
          'signature',
        ].includes(activeTool) && (
          <div className="rounded-lg border border-gray-800 bg-gray-950/50 p-4">
            <p className="text-sm font-medium capitalize text-gray-200">
              {activeTool}
            </p>

            <p className="mt-1 text-xs leading-5 text-gray-500">
              This tool will be integrated into this panel in the next rebuild phase.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
