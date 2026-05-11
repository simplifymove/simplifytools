'use client';

import React, { useState } from 'react';
import { PdfEdit } from '@/app/types/pdf-editor';

interface Props {
  isActive: boolean;
  edit?: PdfEdit;
  onUpdate?: (updates: Partial<PdfEdit>) => void;
  onShapeTypeChange?: (type: string) => void;
  currentShapeType?: string;
  currentStrokeColor?: string;
  currentStrokeWidth?: number;
  onStrokeColorChange?: (color: string) => void;
  onStrokeWidthChange?: (width: number) => void;
}

const SHAPE_TYPES = [
  { id: 'rectangle', label: 'Rectangle' },
  { id: 'circle', label: 'Circle' },
  { id: 'line', label: 'Line' },
  { id: 'arrow', label: 'Arrow' },
];

export default function ShapeTool({
  isActive,
  edit,
  onUpdate,
  onShapeTypeChange,
  currentShapeType = 'rectangle',
  currentStrokeColor = '#000000',
  currentStrokeWidth = 2,
  onStrokeColorChange,
  onStrokeWidthChange,
}: Props) {
  const [showOptions, setShowOptions] = useState(true);

  if (!isActive) return null;

  return (
    <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 bg-gray-900 border-2 border-blue-500 rounded-lg p-4 text-white text-sm">
      <p className="mb-3">Click and drag to draw a shape</p>

      {showOptions && (
        <div className="space-y-3 bg-gray-800 p-3 rounded border border-gray-600">
          {/* Shape Type */}
          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase mb-2 block">
              Shape Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              {SHAPE_TYPES.map((shape) => (
                <button
                  key={shape.id}
                  onClick={() => onShapeTypeChange?.(shape.id)}
                  className={`px-3 py-2 rounded border transition text-xs ${
                    currentShapeType === shape.id
                      ? 'bg-blue-600 border-blue-400 text-white'
                      : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {shape.label}
                </button>
              ))}
            </div>
          </div>

          {/* Stroke Color */}
          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase mb-2 block">
              Line Color
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={currentStrokeColor}
                onChange={(e) => onStrokeColorChange?.(e.target.value)}
                className="w-8 h-8 rounded cursor-pointer"
              />
              <input
                type="text"
                value={currentStrokeColor}
                onChange={(e) => onStrokeColorChange?.(e.target.value)}
                className="flex-1 px-2 py-1 text-xs bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Stroke Width */}
          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase mb-2 block">
              Line Width
            </label>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="1"
                max="10"
                value={currentStrokeWidth}
                onChange={(e) => onStrokeWidthChange?.(parseInt(e.target.value))}
                className="flex-1"
              />
              <span className="w-8 text-right">{currentStrokeWidth}px</span>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={() => setShowOptions(!showOptions)}
        className="mt-3 px-3 py-1 bg-gray-700 text-white rounded text-xs hover:bg-gray-600 transition"
      >
        {showOptions ? 'Hide' : 'Show'} Options
      </button>
    </div>
  );
}
