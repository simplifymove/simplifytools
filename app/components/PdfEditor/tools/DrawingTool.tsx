'use client';

import React, { useState } from 'react';
import { PenTool, Highlighter, Underline, Trash2 } from 'lucide-react';

interface Props {
  isActive: boolean;
  currentDrawingType?: string;
  currentStrokeColor?: string;
  currentStrokeWidth?: number;
  onDrawingTypeChange?: (type: string) => void;
  onStrokeColorChange?: (color: string) => void;
  onStrokeWidthChange?: (width: number) => void;
}

const DRAWING_MODES = [
  { id: 'pen', label: 'Pen', icon: PenTool },
  { id: 'highlighter', label: 'Highlighter', icon: Highlighter },
  { id: 'underline', label: 'Underline', icon: Underline },
  { id: 'strikethrough', label: 'Strikethrough', icon: Trash2 },
];

export default function DrawingTool({
  isActive,
  currentDrawingType = 'pen',
  currentStrokeColor = '#000000',
  currentStrokeWidth = 2,
  onDrawingTypeChange,
  onStrokeColorChange,
  onStrokeWidthChange,
}: Props) {
  const [showOptions, setShowOptions] = useState(true);

  if (!isActive) return null;

  return (
    <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 bg-gray-900 border-2 border-blue-500 rounded-lg p-4 text-white text-sm">
      <p className="mb-3">Click and drag to draw on the PDF</p>

      {showOptions && (
        <div className="space-y-3 bg-gray-800 p-3 rounded border border-gray-600">
          {/* Drawing Mode */}
          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase mb-2 block">
              Tool
            </label>
            <div className="grid grid-cols-2 gap-2">
              {DRAWING_MODES.map((mode) => {
                const Icon = mode.icon;
                return (
                  <button
                    key={mode.id}
                    onClick={() => onDrawingTypeChange?.(mode.id)}
                    className={`px-3 py-2 rounded border transition text-xs flex items-center justify-center gap-1 ${
                      currentDrawingType === mode.id
                        ? 'bg-blue-600 border-blue-400 text-white'
                        : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    <Icon className="w-3 h-3" />
                    {mode.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Stroke Color */}
          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase mb-2 block">
              Color
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
              Brush Size
            </label>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="1"
                max="20"
                value={currentStrokeWidth}
                onChange={(e) => onStrokeWidthChange?.(parseInt(e.target.value))}
                className="flex-1"
              />
              <span className="w-8 text-right">{currentStrokeWidth}px</span>
            </div>
          </div>

          {/* Tip */}
          <div className="bg-blue-900/30 border border-blue-500 rounded p-2 text-xs text-blue-200">
            <p>💡 Drawing tools can be edited later. Use properties panel to modify.</p>
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
