// Image tools registry - maps slugs to tool metadata
export interface ImageTool {
  id: string;
  title: string;
  description: string;
  slug: string;
  type?: 'converter' | 'editor' | 'ai' | 'ocr' | 'filter' | 'batch';
  requiresValidation?: boolean;
  requiresErrorHandling?: boolean;
  timeout?: number; // milliseconds
  maxFileSizeMB?: number;
  supportsTransparency?: boolean;
  supportsAnimation?: boolean;
}

export const imageToolsRegistry: Record<string, ImageTool> = {
  'blur-background': {
    id: 'blur-background',
    title: 'Blur Background',
    description: 'Blur backgrounds in images easily',
    slug: 'blur-background',
    type: 'editor',
    requiresValidation: true,
    requiresErrorHandling: true,
    timeout: 30000,
  },
  'compress-image': {
    id: 'compress-image',
    title: 'Compress Image',
    description: 'Reduce image file size while maintaining quality',
    slug: 'compress-image',
    type: 'editor',
    requiresValidation: true,
    requiresErrorHandling: true,
    timeout: 30000,
  },
  'grayscale-image': {
    id: 'grayscale-image',
    title: 'Grayscale Image',
    description: 'Convert color images to grayscale',
    slug: 'grayscale-image',
    type: 'filter',
    requiresValidation: true,
    requiresErrorHandling: true,
    timeout: 20000,
  },
  'profile-photo-maker': {
    id: 'profile-photo-maker',
    title: 'Profile Photo Maker',
    description: 'Create perfect profile photos',
    slug: 'profile-photo-maker',
    type: 'ai',
    requiresValidation: true,
    requiresErrorHandling: true,
    timeout: 45000,
  },
  'remove-object': {
    id: 'remove-object',
    title: 'Remove Object',
    description: 'Remove unwanted objects from images',
    slug: 'remove-object',
    type: 'ai',
    requiresValidation: true,
    requiresErrorHandling: true,
    timeout: 45000,
  },
  'remove-watermark': {
    id: 'remove-watermark',
    title: 'Remove Watermark',
    description: 'Remove watermarks and text from images',
    slug: 'remove-watermark',
    type: 'ai',
    requiresValidation: true,
    requiresErrorHandling: true,
    timeout: 45000,
  },
  'resize-image': {
    id: 'resize-image',
    title: 'Resize Image',
    description: 'Resize images to custom dimensions',
    slug: 'resize-image',
    type: 'editor',
    requiresValidation: true,
    requiresErrorHandling: true,
    timeout: 30000,
  },
  'rotate-image': {
    id: 'rotate-image',
    title: 'Rotate Image',
    description: 'Rotate images to any angle',
    slug: 'rotate-image',
    type: 'editor',
    requiresValidation: true,
    requiresErrorHandling: true,
    timeout: 20000,
  },
  'upscale-image': {
    id: 'upscale-image',
    title: 'Upscale Image',
    description: 'Enhance and enlarge images without quality loss',
    slug: 'upscale-image',
    type: 'ai',
    requiresValidation: true,
    requiresErrorHandling: true,
    timeout: 60000,
  },
  'crop-image': {
    id: 'crop-image',
    title: 'Crop Image',
    description: 'Crop and trim images',
    slug: 'crop-image',
    type: 'editor',
    requiresValidation: true,
    requiresErrorHandling: true,
    timeout: 20000,
  },
  'jpg-to-png': {
    id: 'jpg-to-png',
    title: 'JPG to PNG',
    description: 'Convert JPG to PNG',
    slug: 'jpg-to-png',
    type: 'converter',
    requiresValidation: true,
    requiresErrorHandling: true,
    timeout: 30000,
    supportsTransparency: true,
  },
  'png-to-jpg': {
    id: 'png-to-jpg',
    title: 'PNG to JPG',
    description: 'Convert PNG to JPG',
    slug: 'png-to-jpg',
    type: 'converter',
    requiresValidation: true,
    requiresErrorHandling: true,
    timeout: 30000,
  },
  'jpg-to-webp': {
    id: 'jpg-to-webp',
    title: 'JPG to WebP',
    description: 'Convert JPG to WebP',
    slug: 'jpg-to-webp',
    type: 'converter',
    requiresValidation: true,
    requiresErrorHandling: true,
    timeout: 30000,
  },
  'webp-to-jpg': {
    id: 'webp-to-jpg',
    title: 'WebP to JPG',
    description: 'Convert WebP to JPG',
    slug: 'webp-to-jpg',
    type: 'converter',
    requiresValidation: true,
    requiresErrorHandling: true,
    timeout: 30000,
  },
  'remove-background': {
    id: 'remove-background',
    title: 'Remove Background',
    description: 'Remove backgrounds from images',
    slug: 'remove-background',
    type: 'ai',
    requiresValidation: true,
    requiresErrorHandling: true,
    timeout: 60000,
    supportsTransparency: true,
  },
  'image-to-text': {
    id: 'image-to-text',
    title: 'Image to Text',
    description: 'Extract text from images using OCR',
    slug: 'image-to-text',
    type: 'ocr',
    requiresValidation: true,
    requiresErrorHandling: true,
    timeout: 60000,
  },
  'watermark-image': {
    id: 'watermark-image',
    title: 'Watermark Image',
    description: 'Add watermarks to images',
    slug: 'watermark-image',
    type: 'editor',
    requiresValidation: true,
    requiresErrorHandling: true,
    timeout: 30000,
  },
  'flip-image': {
    id: 'flip-image',
    title: 'Flip Image',
    description: 'Flip images horizontally or vertically',
    slug: 'flip-image',
    type: 'editor',
    requiresValidation: true,
    requiresErrorHandling: true,
    timeout: 20000,
  },
  'make-background-transparent': {
    id: 'make-background-transparent',
    title: 'Make Background Transparent',
    description: 'Make image backgrounds transparent',
    slug: 'make-background-transparent',
    type: 'editor',
    requiresValidation: true,
    requiresErrorHandling: true,
    timeout: 45000,
    supportsTransparency: true,
  },
};

export function getImageToolById(id: string): ImageTool | undefined {
  return imageToolsRegistry[id.toLowerCase()];
}

export function getAllImageTools(): ImageTool[] {
  return Object.values(imageToolsRegistry);
}

/**
 * Get tools by type for filtered discovery
 */
export function getImageToolsByType(type: ImageTool['type']): ImageTool[] {
  return Object.values(imageToolsRegistry).filter(tool => tool.type === type);
}

/**
 * Get tools that require special manual integration (AI, OCR, etc)
 */
export function getManualIntegrationRequired(): ImageTool[] {
  return Object.values(imageToolsRegistry).filter(tool => 
    tool.type === 'ai' || tool.type === 'ocr'
  );
}

/**
 * Get tools that can use automatic integration (converters, filters, editors)
 */
export function getAutoIntegrationEligible(): ImageTool[] {
  return Object.values(imageToolsRegistry).filter(tool => 
    tool.type === 'converter' || tool.type === 'filter' || tool.type === 'editor'
  );
}
