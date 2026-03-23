// Image tools registry - maps slugs to tool metadata
export interface ImageTool {
  id: string;
  title: string;
  description: string;
  slug: string;
}

export const imageToolsRegistry: Record<string, ImageTool> = {
  'blur-background': {
    id: 'blur-background',
    title: 'Blur Background',
    description: 'Blur backgrounds in images easily',
    slug: 'blur-background',
  },
  'compress-image': {
    id: 'compress-image',
    title: 'Compress Image',
    description: 'Reduce image file size while maintaining quality',
    slug: 'compress-image',
  },
  'grayscale-image': {
    id: 'grayscale-image',
    title: 'Grayscale Image',
    description: 'Convert color images to grayscale',
    slug: 'grayscale-image',
  },
  'profile-photo-maker': {
    id: 'profile-photo-maker',
    title: 'Profile Photo Maker',
    description: 'Create perfect profile photos',
    slug: 'profile-photo-maker',
  },
  'remove-object': {
    id: 'remove-object',
    title: 'Remove Object',
    description: 'Remove unwanted objects from images',
    slug: 'remove-object',
  },
  'remove-watermark': {
    id: 'remove-watermark',
    title: 'Remove Watermark',
    description: 'Remove watermarks and text from images',
    slug: 'remove-watermark',
  },
  'resize-image': {
    id: 'resize-image',
    title: 'Resize Image',
    description: 'Resize images to custom dimensions',
    slug: 'resize-image',
  },
  'rotate-image': {
    id: 'rotate-image',
    title: 'Rotate Image',
    description: 'Rotate images to any angle',
    slug: 'rotate-image',
  },
  'upscale-image': {
    id: 'upscale-image',
    title: 'Upscale Image',
    description: 'Enhance and enlarge images without quality loss',
    slug: 'upscale-image',
  },
};

export function getImageToolById(id: string): ImageTool | undefined {
  return imageToolsRegistry[id.toLowerCase()];
}

export function getAllImageTools(): ImageTool[] {
  return Object.values(imageToolsRegistry);
}
