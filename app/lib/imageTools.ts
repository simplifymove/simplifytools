/**
 * Image Processing Tools
 * All tools use Canvas API for browser-based image manipulation
 */

export interface ImageToolResult {
  blob: Blob;
  filename: string;
  mimeType: string;
}

// Convert image to different format
export async function convertImageFormat(
  file: File,
  targetFormat: 'image/png' | 'image/jpeg' | 'image/webp'
): Promise<ImageToolResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) reject(new Error('Could not get canvas context'));
        
        ctx?.drawImage(img, 0, 0);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const ext = targetFormat === 'image/png' ? 'png' : targetFormat === 'image/jpeg' ? 'jpg' : 'webp';
              resolve({
                blob,
                filename: `converted.${ext}`,
                mimeType: targetFormat,
              });
            }
          },
          targetFormat,
          0.9
        );
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

// Resize image
export async function resizeImage(
  file: File,
  width: number,
  height: number,
  maintainAspect: boolean = true
): Promise<ImageToolResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let finalWidth = width;
        let finalHeight = height;

        if (maintainAspect && height === 0) {
          const ratio = img.height / img.width;
          finalHeight = Math.round(width * ratio);
        } else if (maintainAspect && width === 0) {
          const ratio = img.width / img.height;
          finalWidth = Math.round(height * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = finalWidth;
        canvas.height = finalHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) reject(new Error('Could not get canvas context'));

        ctx?.drawImage(img, 0, 0, finalWidth, finalHeight);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const ext = file.name.split('.').pop() || 'jpg';
              resolve({
                blob,
                filename: `resized.${ext}`,
                mimeType: file.type,
              });
            }
          },
          file.type,
          0.9
        );
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

// Rotate image
export async function rotateImage(
  file: File,
  degrees: number
): Promise<ImageToolResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const radians = (degrees * Math.PI) / 180;
        const cos = Math.cos(radians);
        const sin = Math.sin(radians);

        const newWidth = Math.abs(img.width * cos) + Math.abs(img.height * sin);
        const newHeight = Math.abs(img.width * sin) + Math.abs(img.height * cos);

        const canvas = document.createElement('canvas');
        canvas.width = newWidth;
        canvas.height = newHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) reject(new Error('Could not get canvas context'));

        ctx?.translate(newWidth / 2, newHeight / 2);
        ctx?.rotate(radians);
        ctx?.drawImage(img, -img.width / 2, -img.height / 2);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const ext = file.name.split('.').pop() || 'jpg';
              resolve({
                blob,
                filename: `rotated.${ext}`,
                mimeType: file.type,
              });
            }
          },
          file.type,
          0.9
        );
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

// Apply grayscale filter
export async function applyGrayscale(file: File): Promise<ImageToolResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) reject(new Error('Could not get canvas context'));

        ctx?.drawImage(img, 0, 0);
        const imageData = ctx!.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
          const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
          data[i] = gray;
          data[i + 1] = gray;
          data[i + 2] = gray;
        }

        ctx!.putImageData(imageData, 0, 0);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const ext = file.name.split('.').pop() || 'jpg';
              resolve({
                blob,
                filename: `grayscale.${ext}`,
                mimeType: file.type,
              });
            }
          },
          file.type,
          0.9
        );
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

// Compress image by reducing quality
export async function compressImage(
  file: File,
  quality: number = 0.7
): Promise<ImageToolResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) reject(new Error('Could not get canvas context'));

        ctx?.drawImage(img, 0, 0);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const ext = file.name.split('.').pop() || 'jpg';
              resolve({
                blob,
                filename: `compressed.${ext}`,
                mimeType: file.type,
              });
            }
          },
          file.type,
          quality
        );
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

// Adjust brightness and contrast
export async function adjustBrightnessContrast(
  file: File,
  brightness: number = 0, // -100 to 100
  contrast: number = 0 // -100 to 100
): Promise<ImageToolResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) reject(new Error('Could not get canvas context'));

        ctx?.drawImage(img, 0, 0);
        const imageData = ctx!.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        const brightnessValue = brightness / 100;
        const contrastValue = (contrast / 100 + 1) * 255;

        for (let i = 0; i < data.length; i += 4) {
          data[i] = (data[i] - 128) * contrastValue + 128 + brightnessValue * 255;
          data[i + 1] = (data[i + 1] - 128) * contrastValue + 128 + brightnessValue * 255;
          data[i + 2] = (data[i + 2] - 128) * contrastValue + 128 + brightnessValue * 255;
        }

        ctx!.putImageData(imageData, 0, 0);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const ext = file.name.split('.').pop() || 'jpg';
              resolve({
                blob,
                filename: `adjusted.${ext}`,
                mimeType: file.type,
              });
            }
          },
          file.type,
          0.9
        );
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}
