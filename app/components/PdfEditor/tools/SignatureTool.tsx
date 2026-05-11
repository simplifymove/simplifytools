'use client';

import React, { useRef, useState, useEffect } from 'react';
import { PdfEdit } from '@/app/types/pdf-editor';
import { Pen, Trash2, RotateCcw, X } from 'lucide-react';

interface Props {
  isActive: boolean;
  edit?: PdfEdit;
  onSignatureCreate?: (signatureData: string) => void;
  onUpdate?: (updates: Partial<PdfEdit>) => void;
  onClose?: () => void;
}

export default function SignatureTool({ isActive, edit, onSignatureCreate, onUpdate, onClose }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [showCanvas, setShowCanvas] = useState(false);
  const [isEditingProperties, setIsEditingProperties] = useState(false);

  // Initialize canvas
  useEffect(() => {
    if (showCanvas && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
      }
    }
  }, [showCanvas]);

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    setIsDrawing(true);

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ctx = canvasRef.current.getContext('2d');
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(x, y);
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ctx = canvasRef.current.getContext('2d');
    if (ctx) {
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  };

  const handleCanvasMouseUp = () => {
    setIsDrawing(false);
  };

  const handleClearCanvas = () => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
    }
  };

  const handleSaveSignature = () => {
    if (canvasRef.current) {
      const signatureData = canvasRef.current.toDataURL('image/png');
      onSignatureCreate?.(signatureData);
      setShowCanvas(false);
      handleClearCanvas();
      // Deselect signature after save to auto-close modal
      onClose?.();
    }
  };

  // When signature tool is active but no edit selected, show helper
  if (isActive && !edit) {
    return (
      <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 bg-gray-900 border-2 border-blue-500 rounded-lg p-4 text-white text-sm max-w-md">
        <div className="flex items-center gap-2 mb-3">
          <Pen className="w-4 h-4" />
          <p>Click and drag to place a signature</p>
        </div>

        {!showCanvas ? (
          <div>
            <button
              onClick={() => setShowCanvas(true)}
              className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded transition flex items-center justify-center gap-2"
            >
              <Pen className="w-4 h-4" />
              Draw Signature
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-xs font-semibold mb-2">Draw your signature:</p>
            <canvas
              ref={canvasRef}
              width={300}
              height={120}
              onMouseDown={handleCanvasMouseDown}
              onMouseMove={handleCanvasMouseMove}
              onMouseUp={handleCanvasMouseUp}
              onMouseLeave={handleCanvasMouseUp}
              className="border-2 border-gray-600 rounded w-full cursor-crosshair"
            />

            <div className="flex gap-2">
              <button
                onClick={handleClearCanvas}
                className="flex-1 px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded transition text-xs flex items-center justify-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                Clear
              </button>
              <button
                onClick={handleSaveSignature}
                className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded transition text-xs"
              >
                Save
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // When editing an existing signature (only show modal if explicitly editing properties)
  if (isActive && isEditingProperties && edit && edit.type === 'signature') {
    return (
      <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 bg-gray-900 border-2 border-blue-500 rounded-lg p-4 text-white text-sm max-w-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold">Signature Properties</h3>
          <button
            onClick={() => {
              setIsEditingProperties(false);
              onClose?.();
            }}
            className="p-1 hover:bg-gray-700 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {edit.imageData && (
          <div className="mb-3 p-2 bg-gray-800 rounded border border-gray-600">
            <img
              src={edit.imageData}
              alt="Signature"
              className="w-full max-h-24 object-contain rounded"
            />
          </div>
        )}

        <div className="flex gap-2">
          <div className="flex-1">
            <p className="text-xs text-gray-400 mb-1">Opacity</p>
            <input
              type="range"
              min="0"
              max="100"
              value={(edit.opacity ?? 1) * 100}
              onChange={(e) => onUpdate?.({ opacity: parseFloat(e.target.value) / 100 })}
              className="w-full"
            />
          </div>
          <span className="text-xs text-gray-300 mt-5">{Math.round((edit.opacity ?? 1) * 100)}%</span>
        </div>
      </div>
    );
  }

  // Show edit button when signature is selected (but modal not open)
  if (isActive && !isEditingProperties && edit && edit.type === 'signature') {
    return (
      <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 bg-gray-900 border-2 border-blue-500 rounded-lg p-2 text-white text-xs z-50">
        <button
          onClick={() => setIsEditingProperties(true)}
          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded transition"
        >
          Edit Signature
        </button>
      </div>
    );
  }

  return null;
}
