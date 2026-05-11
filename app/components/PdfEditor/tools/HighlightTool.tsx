'use client';

import React, { useState } from 'react';

interface Props {
  isActive: boolean;
  currentColor?: string;
  onColorChange?: (color: string) => void;
}

const HIGHLIGHT_COLORS = [
  { name: 'Yellow', value: 'rgba(255, 255, 0, 0.3)' },
  { name: 'Green', value: 'rgba(0, 255, 0, 0.3)' },
  { name: 'Pink', value: 'rgba(255, 192, 203, 0.3)' },
  { name: 'Blue', value: 'rgba(0, 0, 255, 0.3)' },
  { name: 'Orange', value: 'rgba(255, 165, 0, 0.3)' },
];

export default function HighlightTool({ isActive, currentColor, onColorChange }: Props) {
  const [showColorPicker, setShowColorPicker] = useState(false);

  if (!isActive) return null;

  const currentColorName = HIGHLIGHT_COLORS.find((c) => c.value === currentColor)?.name || 'Yellow';

  return (
    <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 bg-gray-900 border-2 border-blue-500 rounded-lg p-4 text-white text-sm">
      <div className="flex items-center gap-3 mb-2">
        <p>Click and drag to highlight. Color:</p>
        <button
          onClick={() => setShowColorPicker(!showColorPicker)}
          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded transition"
        >
          {currentColorName}
        </button>
      </div>

      {showColorPicker && (
        <div className="grid grid-cols-5 gap-2 p-2 bg-gray-800 rounded border border-gray-600">
          {HIGHLIGHT_COLORS.map((color) => (
            <button
              key={color.name}
              onClick={() => {
                onColorChange?.(color.value);
                setShowColorPicker(false);
              }}
              className={`w-8 h-8 rounded border-2 transition ${
                currentColor === color.value ? 'border-white' : 'border-gray-600'
              }`}
              style={{ backgroundColor: color.value.replace('0.3', '1') }}
              title={color.name}
            />
          ))}
        </div>
      )}
    </div>
  );
}
