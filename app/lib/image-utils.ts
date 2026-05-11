/**
 * Image Compression Utility
 * Compresses images before uploading to reduce file size and improve performance
 */

export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0-1, default 0.8
  format?: 'jpeg' | 'webp' | 'png';
}

/**
 * Compress an image file
 * @param file - Image file to compress
 * @param options - Compression options
 * @returns Promise<string> - Data URL of compressed image
 */
export async function compressImage(
  file: File,
  options: CompressionOptions = {}
): Promise<string> {
  const {
    maxWidth = 1024,
    maxHeight = 1024,
    quality = 0.8,
    format = 'jpeg',
  } = options;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const img = new Image();
        img.onload = () => {
          // Create canvas for compression
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Calculate new dimensions maintaining aspect ratio
          if (width > height) {
            if (width > maxWidth) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;

          // Draw and compress
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Failed to get canvas context'));
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);

          // Get compressed data URL
          const mimeType = format === 'webp' ? 'image/webp' : `image/${format}`;
          const dataUrl = canvas.toDataURL(mimeType, quality);

          resolve(dataUrl);
        };

        img.onerror = () => {
          reject(new Error('Failed to load image'));
        };

        img.src = event.target?.result as string;
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Get approximate data URL size in bytes
 * @param dataUrl - Data URL string
 * @returns Approximate size in bytes
 */
export function getDataUrlSize(dataUrl: string): number {
  // Data URL format: "data:[<mediatype>][;base64],<data>"
  // Base64 encoding increases size by 33% (4/3 ratio)
  const base64String = dataUrl.split(',')[1];
  if (!base64String) return 0;

  // Calculate size: (base64 length * 6) / 8 = base64 length * 0.75
  return Math.round((base64String.length * 3) / 4);
}

/**
 * Format bytes to human readable size
 * @param bytes - Size in bytes
 * @returns Formatted size string
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Validate image file
 * @param file - File to validate
 * @param maxSizeBytes - Max file size in bytes (default 5MB)
 * @returns { valid: boolean; error?: string }
 */
export function validateImageFile(
  file: File,
  maxSizeBytes: number = 5 * 1024 * 1024
): { valid: boolean; error?: string } {
  // Check file type
  if (!file.type.startsWith('image/')) {
    return { valid: false, error: 'File must be an image' };
  }

  // Check file size
  if (file.size > maxSizeBytes) {
    return {
      valid: false,
      error: `File is too large. Max size is ${formatBytes(maxSizeBytes)}`,
    };
  }

  return { valid: true };
}
