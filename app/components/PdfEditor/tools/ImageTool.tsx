'use client';

import React, { useRef, useState } from 'react';
import { PdfEdit } from '@/app/types/pdf-editor';
import { Upload, X, Loader } from 'lucide-react';
import { compressImage, validateImageFile } from '@/app/lib/image-utils';

interface Props {
  isActive: boolean;
  edit?: PdfEdit;
  onImageUpload?: (imageData: string) => void;
  onUpdate?: (updates: Partial<PdfEdit>) => void;
  onClose?: () => void; // Add close callback
}

export default function ImageTool({ isActive, edit, onImageUpload, onUpdate, onClose }: Props) {
  const [preview, setPreview] = useState<string | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditingProperties, setIsEditingProperties] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setError(null);
      setIsCompressing(true);

      // Validate file
      const validation = validateImageFile(file, 5 * 1024 * 1024);
      if (!validation.valid) {
        setError(validation.error || 'Invalid image file');
        setIsCompressing(false);
        return;
      }

      // Compress image
      const compressedData = await compressImage(file, {
        maxWidth: 1024,
        maxHeight: 1024,
        quality: 0.8,
        format: 'jpeg',
      });

      setPreview(compressedData);
      onImageUpload?.(compressedData);
      // Reset form for next image
      setShowUpload(false);
      setIsEditingProperties(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      // Deselect image after upload to auto-close modal
      onClose?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process image');
    } finally {
      setIsCompressing(false);
    }
  };

  const handleClearImage = () => {
    setPreview(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // When image tool is active but no edit selected, show helper
  if (isActive && !edit) {
    return (
      <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 bg-gray-900 border-2 border-blue-500 rounded-lg p-4 text-white text-sm max-w-md z-50">
        <div className="flex items-center gap-2 mb-3">
          <Upload className="w-4 h-4" />
          <p>Click and drag to place an image, or upload below</p>
        </div>

        <button
          onClick={() => {
            setShowUpload(true);
            // Trigger file picker after state update
            setTimeout(() => {
              fileInputRef.current?.click();
            }, 50);
          }}
          className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded transition flex items-center justify-center gap-2"
        >
          <Upload className="w-4 h-4" />
          Upload Image
        </button>

        {showUpload && (
          <div className="mt-3 p-3 bg-gray-800 rounded border border-gray-600 z-50">
            {isCompressing && (
              <div className="flex items-center justify-center gap-2 py-2">
                <Loader className="w-4 h-4 animate-spin" />
                <span className="text-xs">Compressing image...</span>
              </div>
            )}
            {error && (
              <div className="mb-2 p-2 bg-red-900/30 border border-red-500 rounded text-red-200 text-xs">
                {error}
              </div>
            )}
            <label className="block w-full">
              <div className="px-3 py-2 bg-gray-700 rounded border border-gray-600 cursor-pointer hover:bg-gray-600 transition text-center text-xs font-medium">
                {isCompressing ? 'Compressing...' : 'Click to select image'}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                disabled={isCompressing}
                className="sr-only"
              />
            </label>
          </div>
        )}

        {preview && (
          <div className="mt-3 p-2 bg-gray-800 rounded border border-gray-600">
            <div className="flex items-center gap-2 mb-2">
              <p className="text-xs font-semibold">Preview:</p>
              <button
                onClick={handleClearImage}
                className="ml-auto p-1 hover:bg-gray-700 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <img
              src={preview}
              alt="Preview"
              className="w-full max-h-32 object-contain rounded"
            />
          </div>
        )}
      </div>
    );
  }

  // When editing an existing image edit (only show modal if explicitly editing properties)
  if (isActive && isEditingProperties && edit && edit.type === 'image') {
    return (
      <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 bg-gray-900 border-2 border-blue-500 rounded-lg p-4 text-white text-sm max-w-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold">Image Properties</h3>
          <button
            onClick={() => {
              setShowUpload(false);
              setPreview(null);
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
              alt="Current"
              className="w-full max-h-40 object-contain rounded"
            />
          </div>
        )}

        <div className="space-y-2">
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

          <button
            onClick={() => setShowUpload(!showUpload)}
            className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded transition text-xs flex items-center justify-center gap-2"
          >
            <Upload className="w-3 h-3" />
            Replace Image
          </button>

          {showUpload && (
            <div className="p-2 bg-gray-800 rounded border border-gray-600">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="w-full text-xs"
              />
            </div>
          )}
        </div>
      </div>
    );
  }

  // Show edit options button when image is selected (but modal not open)
  if (isActive && !isEditingProperties && edit && edit.type === 'image') {
    return (
      <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 bg-gray-900 border-2 border-blue-500 rounded-lg p-2 text-white text-xs z-50">
        <button
          onClick={() => setIsEditingProperties(true)}
          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded transition"
        >
          Edit Image
        </button>
      </div>
    );
  }

  return null;
}
