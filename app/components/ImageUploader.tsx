'use client';

import React, { useRef } from 'react';
import { Upload, X } from 'lucide-react';

interface ImageUploaderProps {
  onFileSelect: (file: File) => void;
  preview: string | null;
  onClearPreview: () => void;
  accept?: string;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  onFileSelect,
  preview,
  onClearPreview,
  accept = 'image/*',
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = e.dataTransfer.files;
    if (files.length > 0 && files[0].type.startsWith('image/')) {
      onFileSelect(files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileSelect(e.target.files[0]);
    }
  };

  if (preview) {
    return (
      <div className="relative inline-block">
        <img 
          src={preview} 
          alt="Preview" 
          className="max-w-md max-h-96 rounded-lg border-2 border-blue-500"
        />
        <button
          onClick={onClearPreview}
          className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    );
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className="border-2 border-dashed border-blue-300 rounded-lg p-12 text-center hover:border-blue-500 transition-colors cursor-pointer bg-blue-50"
      onClick={() => fileInputRef.current?.click()}
    >
      <Upload className="w-12 h-12 text-blue-500 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Upload Image</h3>
      <p className="text-gray-600 mb-2">Drag and drop your image here, or click to select</p>
      <p className="text-sm text-gray-500">Supports JPG, PNG, WebP, and more</p>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
};
