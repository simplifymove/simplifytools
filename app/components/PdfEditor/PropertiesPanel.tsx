'use client';

import React, { useState, useEffect } from 'react';
import { PdfEdit } from '@/app/types/pdf-editor';
import { ChevronDown } from 'lucide-react';

interface Props {
  edit?: PdfEdit;
  onUpdate?: (updates: Partial<PdfEdit>) => void;
}

export default function PropertiesPanel({ edit, onUpdate }: Props) {
  const [expanded, setExpanded] = useState(true);

  if (!edit) {
    return (
      <div className="w-64 bg-gray-800 border-l border-gray-700 p-4 flex items-center justify-center">
        <p className="text-sm text-gray-400 text-center">Select an edit to view properties</p>
      </div>
    );
  }

  const handleTextChange = (text: string) => {
    onUpdate?.({ text });
  };

  const handleFontSizeChange = (size: number) => {
    onUpdate?.({ fontSize: size });
  };

  const handleFontColorChange = (color: string) => {
    onUpdate?.({ fontColor: color });
  };

  const handleFontFamilyChange = (family: string) => {
    onUpdate?.({ fontFamily: family });
  };

  const handleOpacityChange = (opacity: number) => {
    onUpdate?.({ opacity });
  };

  const handleStrokeColorChange = (color: string) => {
    onUpdate?.({ strokeColor: color });
  };

  const handleFillColorChange = (color: string) => {
    onUpdate?.({ fillColor: color });
  };

  const handleStrokeWidthChange = (width: number) => {
    onUpdate?.({ strokeWidth: width });
  };

  return (
    <div className="w-64 bg-gray-800 border-l border-gray-700 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center gap-2 text-sm font-semibold text-gray-300 hover:text-white transition"
        >
          <ChevronDown
            className={`w-4 h-4 transition ${expanded ? '' : '-rotate-90'}`}
          />
          Properties
        </button>
      </div>

      {/* Properties */}
      {expanded && (
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Edit Type */}
          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase mb-2 block">
              Type
            </label>
            <p className="text-sm text-gray-300 bg-gray-700 p-2 rounded">
              {edit.type.charAt(0).toUpperCase() + edit.type.slice(1)}
            </p>
          </div>

          {/* Position & Size */}
          <div className="border-t border-gray-700 pt-4">
            <label className="text-xs font-semibold text-gray-400 uppercase mb-2 block">
              Position & Size
            </label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-xs text-gray-400 mb-1">X</p>
                <input
                  type="number"
                  value={Math.round(edit.x)}
                  onChange={(e) => onUpdate?.({ x: parseFloat(e.target.value) })}
                  className="w-full px-2 py-1 text-sm bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Y</p>
                <input
                  type="number"
                  value={Math.round(edit.y)}
                  onChange={(e) => onUpdate?.({ y: parseFloat(e.target.value) })}
                  className="w-full px-2 py-1 text-sm bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Width</p>
                <input
                  type="number"
                  value={Math.round(edit.width)}
                  onChange={(e) => onUpdate?.({ width: parseFloat(e.target.value) })}
                  className="w-full px-2 py-1 text-sm bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Height</p>
                <input
                  type="number"
                  value={Math.round(edit.height)}
                  onChange={(e) => onUpdate?.({ height: parseFloat(e.target.value) })}
                  className="w-full px-2 py-1 text-sm bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Text Properties */}
          {edit.type === 'text' && (
            <div className="border-t border-gray-700 pt-4">
              <label className="text-xs font-semibold text-gray-400 uppercase mb-2 block">
                Text
              </label>
              <textarea
                value={edit.text || ''}
                onChange={(e) => handleTextChange(e.target.value)}
                className="w-full px-2 py-2 text-sm bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none resize-none"
                rows={3}
                placeholder="Enter text..."
              />

              <div className="grid grid-cols-2 gap-2 mt-3">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Font Size</label>
                  <input
                    type="number"
                    value={edit.fontSize || 12}
                    onChange={(e) => handleFontSizeChange(parseFloat(e.target.value))}
                    className="w-full px-2 py-1 text-sm bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                    min="8"
                    max="72"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Color</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={edit.fontColor || '#000000'}
                      onChange={(e) => handleFontColorChange(e.target.value)}
                      className="w-10 h-8 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={edit.fontColor || '#000000'}
                      onChange={(e) => handleFontColorChange(e.target.value)}
                      className="flex-1 px-2 py-1 text-xs bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-400 mb-1 block mt-3">Font Family</label>
                <select
                  value={edit.fontFamily || 'Arial'}
                  onChange={(e) => handleFontFamilyChange(e.target.value)}
                  className="w-full px-2 py-1 text-sm bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                >
                  <option>Arial</option>
                  <option>Times New Roman</option>
                  <option>Courier New</option>
                  <option>Georgia</option>
                  <option>Verdana</option>
                  <option>Comic Sans MS</option>
                </select>
              </div>
            </div>
          )}

          {/* Shape Properties */}
          {edit.type === 'shape' && (
            <div className="border-t border-gray-700 pt-4">
              <label className="text-xs font-semibold text-gray-400 uppercase mb-2 block">
                Shape
              </label>
              <div className="space-y-2">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Type</label>
                  <select
                    value={edit.shapeType || 'rectangle'}
                    onChange={(e) => onUpdate?.({ shapeType: e.target.value as any })}
                    className="w-full px-2 py-1 text-sm bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                  >
                    <option value="rectangle">Rectangle</option>
                    <option value="circle">Circle</option>
                    <option value="line">Line</option>
                    <option value="arrow">Arrow</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Stroke Color</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={edit.strokeColor || '#000000'}
                      onChange={(e) => handleStrokeColorChange(e.target.value)}
                      className="w-10 h-8 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={edit.strokeColor || '#000000'}
                      onChange={(e) => handleStrokeColorChange(e.target.value)}
                      className="flex-1 px-2 py-1 text-xs bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Stroke Width</label>
                  <input
                    type="number"
                    value={edit.strokeWidth || 2}
                    onChange={(e) => handleStrokeWidthChange(parseFloat(e.target.value))}
                    className="w-full px-2 py-1 text-sm bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                    min="1"
                    max="10"
                  />
                </div>

                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Fill Color</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={edit.fillColor || '#ffffff'}
                      onChange={(e) => handleFillColorChange(e.target.value)}
                      className="w-10 h-8 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={edit.fillColor || '#ffffff'}
                      onChange={(e) => handleFillColorChange(e.target.value)}
                      className="flex-1 px-2 py-1 text-xs bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Highlight Properties */}
          {edit.type === 'highlight' && (
            <div className="border-t border-gray-700 pt-4">
              <label className="text-xs font-semibold text-gray-400 uppercase mb-2 block">
                Highlight
              </label>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Color</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={edit.fillColor || '#ffff00'}
                    onChange={(e) => handleFillColorChange(e.target.value)}
                    className="w-10 h-8 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={edit.fillColor || '#ffff00'}
                    onChange={(e) => handleFillColorChange(e.target.value)}
                    className="flex-1 px-2 py-1 text-xs bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Drawing Properties */}
          {edit.type === 'drawing' && (
            <div className="border-t border-gray-700 pt-4">
              <label className="text-xs font-semibold text-gray-400 uppercase mb-2 block">
                Drawing
              </label>
              <div className="space-y-2">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Tool Type</label>
                  <select
                    value={edit.drawingType || 'pen'}
                    onChange={(e) => onUpdate?.({ drawingType: e.target.value as any })}
                    className="w-full px-2 py-1 text-sm bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                  >
                    <option value="pen">Pen</option>
                    <option value="highlighter">Highlighter</option>
                    <option value="strikethrough">Strikethrough</option>
                    <option value="underline">Underline</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Color</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={edit.strokeColor || '#000000'}
                      onChange={(e) => handleStrokeColorChange(e.target.value)}
                      className="w-10 h-8 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={edit.strokeColor || '#000000'}
                      onChange={(e) => handleStrokeColorChange(e.target.value)}
                      className="flex-1 px-2 py-1 text-xs bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Brush Size</label>
                  <input
                    type="number"
                    value={edit.strokeWidth || 2}
                    onChange={(e) => handleStrokeWidthChange(parseFloat(e.target.value))}
                    className="w-full px-2 py-1 text-sm bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                    min="1"
                    max="20"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Image Properties */}
          {edit.type === 'image' && (
            <div className="border-t border-gray-700 pt-4">
              <label className="text-xs font-semibold text-gray-400 uppercase mb-2 block">
                Image
              </label>
              {edit.imageData && (
                <img
                  src={edit.imageData}
                  alt="Preview"
                  className="w-full max-h-32 object-contain rounded mb-2 border border-gray-600"
                />
              )}
              <p className="text-xs text-gray-400">Aspect Ratio: Original (resize from corners to change)</p>
            </div>
          )}

          {/* Signature Properties */}
          {edit.type === 'signature' && (
            <div className="border-t border-gray-700 pt-4">
              <label className="text-xs font-semibold text-gray-400 uppercase mb-2 block">
                Signature
              </label>
              {edit.imageData && (
                <img
                  src={edit.imageData}
                  alt="Signature"
                  className="w-full max-h-24 object-contain rounded mb-2 border border-gray-600"
                />
              )}
              <p className="text-xs text-gray-400">Resize and position as needed</p>
            </div>
          )}

          {/* Link Properties */}
          {edit.type === 'link' && (
            <div className="border-t border-gray-700 pt-4">
              <label className="text-xs font-semibold text-gray-400 uppercase mb-2 block">
                Link
              </label>
              <div className="space-y-2">
                <div>
                  <p className="text-xs text-gray-400 mb-1">URL</p>
                  <input
                    type="text"
                    value={edit.linkTarget || ''}
                    onChange={(e) => onUpdate?.(({ linkTarget: e.target.value }))}
                    placeholder="https://example.com"
                    className="w-full px-2 py-1 text-sm bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Type</p>
                  <select
                    value={edit.linkType || 'external'}
                    onChange={(e) => onUpdate?.({ linkType: e.target.value as any })}
                    className="w-full px-2 py-1 text-sm bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                  >
                    <option value="external">External URL</option>
                    <option value="internal">Internal Page</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Opacity */}
          <div className="border-t border-gray-700 pt-4">
            <label className="text-xs font-semibold text-gray-400 uppercase mb-2 block">
              Opacity
            </label>
            <div className="flex items-center gap-2">
              <input
                type="range"
                value={(edit.opacity ?? 1) * 100}
                onChange={(e) => handleOpacityChange(parseFloat(e.target.value) / 100)}
                className="flex-1"
                min="0"
                max="100"
              />
              <span className="text-sm text-gray-300 w-10 text-right">
                {Math.round((edit.opacity ?? 1) * 100)}%
              </span>
            </div>
          </div>

          {/* Z-Index */}
          <div className="border-t border-gray-700 pt-4">
            <label className="text-xs font-semibold text-gray-400 uppercase mb-2 block">
              Z-Index
            </label>
            <input
              type="number"
              value={edit.zIndex}
              onChange={(e) => onUpdate?.({ zIndex: parseInt(e.target.value) })}
              className="w-full px-2 py-1 text-sm bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>
      )}
    </div>
  );
}
