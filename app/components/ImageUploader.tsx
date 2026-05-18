'use client';

import React, { useRef, useState, useCallback } from 'react';
import { Upload, X, AlertCircle } from 'lucide-react';
import {
  validateImageNotEmpty,
  validateImageExtension,
  validateImageMimeType,
  validateImageFileSize,
} from '@/app/utils/validation/image-validation';

interface ImageUploaderProps {
  onFileSelect: (file: File) => void;
  preview: string | null;
  onClearPreview: () => void;
  accept?: string;
  toolId?: string;
  onValidationError?: (error: string) => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  onFileSelect,
  preview,
  onClearPreview,
  accept = 'image/*',
  toolId,
  onValidationError,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const validateAndProcessFile = useCallback((file: File) => {
    setValidationError(null);

    // Check if file is empty
    const emptyCheck = validateImageNotEmpty(file);
    if (!emptyCheck.valid) {
      const error = emptyCheck.error || 'File appears to be empty';
      setValidationError(error);
      onValidationError?.(error);
      return false;
    }

    // Check extension
    const extensionCheck = validateImageExtension(file.name);
    if (!extensionCheck.valid) {
      const error = extensionCheck.error || 'Unsupported image format';
      setValidationError(error);
      onValidationError?.(error);
      return false;
    }

    // Check MIME type
    const mimeCheck = validateImageMimeType(file);
    if (!mimeCheck.valid) {
      const error = mimeCheck.error || 'Invalid image type';
      setValidationError(error);
      onValidationError?.(error);
      return false;
    }

    // Check file size with tool-specific limits
    const sizeCheck = validateImageFileSize(file, toolId);
    if (!sizeCheck.valid) {
      const error = sizeCheck.error || 'File size exceeds limit';
      setValidationError(error);
      onValidationError?.(error);
      return false;
    }

    // All validations passed
    setValidationError(null);
    onValidationError?.(null as any);
    onFileSelect(file);
    return true;
  }, [onFileSelect, toolId, onValidationError]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      validateAndProcessFile(files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndProcessFile(e.target.files[0]);
    }
  };

  if (preview) {
    return (
      <div className="relative inline-block overflow-hidden rounded-lg">
        <img 
          src={preview} 
          alt="Preview" 
          className="max-w-full max-h-96 rounded-lg border-2 border-blue-500 block"
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
    <div className="space-y-4">
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

      {/* Show validation error if present */}
      {validationError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-900">Validation Error</p>
            <p className="text-sm text-red-700">{validationError}</p>
          </div>
        </div>
      )}
    </div>
  );
};



