/**
 * Example Image Tool Integration: Compress Image
 * Demonstrates complete validation, error handling, and SMTP error reporting
 * 
 * This is a template for integrating all image tools with the validation system
 */

'use client';

import { useState } from 'react';
import { useImageToolErrors } from '@/app/hooks/useImageToolErrors';
import {
  validateImageNotEmpty,
  validateImageExtension,
  validateImageMimeType,
  validateImageDimensions,
  validateImageFileSize,
  validateCompressionQuality,
  ImageMetadata,
} from '@/app/utils/validation/image-validation';
import { ImageToolErrorType } from '@/app/utils/types/errors';
import { ErrorAlert, ValidationErrors } from '@/app/components/error-components';

/**
 * Example: Compress Image Tool Component
 * Shows how to:
 * 1. Validate file uploads
 * 2. Handle validation errors
 * 3. Manage processing state
 * 4. Display errors to users
 * 5. Report errors to server
 */
export default function CompressImageTool() {
  const { error, clearError, createError, handleApiError } = useImageToolErrors();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [quality, setQuality] = useState(80);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  /**
   * Validate selected file and quality settings
   */
  async function validateInput(): Promise<boolean> {
    const errors: string[] = [];
    clearError();

    // Check if file is selected
    if (!selectedFile) {
      setValidationErrors(['Please select an image to compress']);
      return false;
    }

    // Validate file is not empty
    const emptyCheck = validateImageNotEmpty(selectedFile);
    if (!emptyCheck.valid) {
      createError(
        ImageToolErrorType.EMPTY_FILE,
        'compress-image',
        'Compress Image',
        { file: selectedFile },
        {
          filename: selectedFile.name,
          size: selectedFile.size,
          mimeType: selectedFile.type,
        }
      );
      return false;
    }

    // Validate file extension
    const extensionCheck = validateImageExtension(selectedFile.name);
    if (!extensionCheck.valid) {
      createError(
        ImageToolErrorType.UNSUPPORTED_FORMAT,
        'compress-image',
        'Compress Image',
        { file: selectedFile },
        {
          filename: selectedFile.name,
          size: selectedFile.size,
          mimeType: selectedFile.type,
        }
      );
      return false;
    }

    // Validate MIME type
    const mimeTypeCheck = validateImageMimeType(selectedFile);
    if (!mimeTypeCheck.valid) {
      createError(
        ImageToolErrorType.INVALID_MIME_TYPE,
        'compress-image',
        'Compress Image'
      );
      return false;
    }

    // Validate file size
    const sizeCheck = validateImageFileSize(selectedFile, 'compress-image');
    if (!sizeCheck.valid) {
      createError(
        ImageToolErrorType.FILE_TOO_LARGE,
        'compress-image',
        'Compress Image',
        { maxSize: sizeCheck.error },
        {
          filename: selectedFile.name,
          size: selectedFile.size,
          mimeType: selectedFile.type,
        }
      );
      return false;
    }

    // Validate quality setting
    const qualityCheck = validateCompressionQuality(quality);
    if (!qualityCheck.valid) {
      errors.push(qualityCheck.error || 'Invalid quality value');
    }

    if (errors.length > 0) {
      setValidationErrors(errors);
      return false;
    }

    return true;
  }

  /**
   * Get image metadata (width, height, etc.)
   */
  async function getImageMetadata(file: File): Promise<ImageMetadata | null> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          resolve({
            width: img.width,
            height: img.height,
            mimeType: file.type,
            hasAlpha: false, // Simplified - would need canvas inspection
            isAnimated: file.type === 'image/gif', // Simplified
          });
        };
        img.onerror = () => {
          resolve(null);
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  }

  /**
   * Handle form submission
   */
  async function handleCompress(e: React.FormEvent) {
    e.preventDefault();

    // Validate inputs
    const isValid = await validateInput();
    if (!isValid) return;

    if (!selectedFile) return;

    setIsProcessing(true);
    setValidationErrors([]);
    clearError();

    try {
      // Get image metadata
      const metadata = await getImageMetadata(selectedFile);

      // Validate dimensions if available
      if (metadata) {
        const dimensionCheck = validateImageDimensions(metadata);
        if (!dimensionCheck.valid) {
          throw createError(
            ImageToolErrorType.INVALID_DIMENSIONS,
            'compress-image',
            'Compress Image',
            { metadata },
            {
              filename: selectedFile.name,
              size: selectedFile.size,
              mimeType: selectedFile.type,
              width: metadata.width,
              height: metadata.height,
            }
          );
        }
      }

      // Create FormData for upload
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('quality', quality.toString());

      // Send to API
      const response = await fetch('/api/image-tools/compress', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        handleApiError(errorData);
        return;
      }

      // Success
      const result = await response.blob();
      downloadFile(result, `compressed-${selectedFile.name}`);

      // Clear form on success
      setSelectedFile(null);
      setQuality(80);
    } catch (err) {
      if (err instanceof Error) {
        handleApiError({ message: err.message });
      }
    } finally {
      setIsProcessing(false);
    }
  }

  /**
   * Download processed file
   */
  function downloadFile(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg">
      <h1 className="text-3xl font-bold mb-6">Compress Image</h1>

      {/* Error Alert - shown at top */}
      <ErrorAlert error={error} onDismiss={clearError} />

      {/* Validation Messages */}
      {validationErrors.length > 0 && (
        <ValidationErrors errors={validationErrors} onDismiss={() => setValidationErrors([])} className="mb-6" />
      )}

      <form onSubmit={handleCompress} className="space-y-6">
        {/* File Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Image
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              setSelectedFile(e.target.files?.[0] || null);
              setValidationErrors([]);
            }}
            disabled={isProcessing}
            className="block w-full text-sm border border-gray-300 rounded-lg p-2"
          />
          {selectedFile && (
            <p className="mt-2 text-sm text-gray-600">
              Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)}MB)
            </p>
          )}
        </div>

        {/* Quality Slider */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Quality: {quality}%
          </label>
          <input
            type="range"
            min="1"
            max="100"
            value={quality}
            onChange={(e) => setQuality(parseInt(e.target.value))}
            disabled={isProcessing}
            className="w-full"
          />
          <p className="mt-2 text-xs text-gray-500">
            Lower values = smaller file, higher values = better quality
          </p>
        </div>

        {/* Processing Status */}
        {isProcessing && (
          <div className="flex items-center gap-3 text-blue-600" role="status">
            <div
              className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent"
              aria-hidden="true"
            />
            <span className="text-sm">Compressing image...</span>
          </div>
        )}

        {error && (
          <ErrorAlert error={error} onDismiss={clearError} />
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isProcessing || !selectedFile}
          className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {isProcessing ? 'Compressing...' : 'Compress Image'}
        </button>
      </form>

      {/* Help Info */}
      <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h3 className="font-semibold text-blue-900 mb-2">How it works:</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>✓ Validates file format and size</li>
          <li>✓ Checks image dimensions</li>
          <li>✓ Processes with your quality setting</li>
          <li>✓ Returns compressed image</li>
          <li>✓ Reports any errors for monitoring</li>
        </ul>
      </div>
    </div>
  );
}
