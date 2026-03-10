/**
 * Converter routing table - maps format pairs to engine information
 * Used by frontend to configure converter tools
 */

export interface ConverterConfig {
  id: string;
  from: string;
  to: string;
  engine: string;
  defaultOptions?: Record<string, any>;
  supportedOptions?: string[];
  maxFileSize?: number; // in MB
  description?: string;
}

export const CONVERTER_ROUTES: ConverterConfig[] = [
  // Raster conversions (Pillow)
  {
    id: 'jpg-to-png',
    from: 'jpg',
    to: 'png',
    engine: 'raster',
    defaultOptions: { quality: 90 },
    supportedOptions: ['quality', 'resize'],
    maxFileSize: 100,
    description: 'JPG to PNG with transparency support',
  },
  {
    id: 'jpg-to-webp',
    from: 'jpg',
    to: 'webp',
    engine: 'raster',
    defaultOptions: { quality: 85 },
    supportedOptions: ['quality', 'resize'],
    maxFileSize: 100,
  },
  {
    id: 'png-to-jpg',
    from: 'png',
    to: 'jpg',
    engine: 'raster',
    defaultOptions: { quality: 85, bg_color: '#FFFFFF' },
    supportedOptions: ['quality', 'resize', 'bg_color'],
    maxFileSize: 100,
  },
  {
    id: 'png-to-webp',
    from: 'png',
    to: 'webp',
    engine: 'raster',
    defaultOptions: { quality: 85 },
    supportedOptions: ['quality', 'resize'],
    maxFileSize: 100,
  },
  {
    id: 'webp-to-jpg',
    from: 'webp',
    to: 'jpg',
    engine: 'raster',
    defaultOptions: { quality: 85 },
    supportedOptions: ['quality', 'resize'],
    maxFileSize: 100,
  },
  {
    id: 'webp-to-png',
    from: 'webp',
    to: 'png',
    engine: 'raster',
    defaultOptions: { quality: 90 },
    supportedOptions: ['quality', 'resize'],
    maxFileSize: 100,
  },
  {
    id: 'heic-to-jpg',
    from: 'heic',
    to: 'jpg',
    engine: 'raster',
    defaultOptions: { quality: 85 },
    supportedOptions: ['quality'],
    maxFileSize: 100,
  },
  {
    id: 'bmp-to-jpg',
    from: 'bmp',
    to: 'jpg',
    engine: 'raster',
    defaultOptions: { quality: 85 },
    supportedOptions: ['quality'],
    maxFileSize: 100,
  },

  // Vector/Document to Raster (Poppler/Ghostscript)
  {
    id: 'pdf-to-jpg',
    from: 'pdf',
    to: 'jpg',
    engine: 'vector_render',
    defaultOptions: { dpi: 300 },
    supportedOptions: ['dpi', 'quality'],
    maxFileSize: 500,
    description: 'PDF pages to JPG images',
  },
  {
    id: 'pdf-to-png',
    from: 'pdf',
    to: 'png',
    engine: 'vector_render',
    defaultOptions: { dpi: 300 },
    supportedOptions: ['dpi'],
    maxFileSize: 500,
  },
  {
    id: 'eps-to-jpg',
    from: 'eps',
    to: 'jpg',
    engine: 'vector_render',
    defaultOptions: { dpi: 300 },
    supportedOptions: ['dpi'],
    maxFileSize: 100,
  },

  // Animation (FFmpeg)
  {
    id: 'gif-to-mp4',
    from: 'gif',
    to: 'mp4',
    engine: 'animation',
    defaultOptions: { fps: 30, quality: 85 },
    supportedOptions: ['fps', 'quality'],
    maxFileSize: 500,
  },
  {
    id: 'mp4-to-gif',
    from: 'mp4',
    to: 'gif',
    engine: 'animation',
    defaultOptions: { fps: 10, scale: 512 },
    supportedOptions: ['fps', 'scale'],
    maxFileSize: 500,
  },

  // Vector Trace (Potrace) - Future
  {
    id: 'png-to-svg',
    from: 'png',
    to: 'svg',
    engine: 'vector_trace',
    defaultOptions: {},
    supportedOptions: [],
    maxFileSize: 50,
  },

  // OCR (Tesseract) - Future
  {
    id: 'image-to-text',
    from: 'jpg',
    to: 'txt',
    engine: 'ocr',
    defaultOptions: { lang: 'eng' },
    supportedOptions: ['lang'],
    maxFileSize: 50,
  },

  // Document (LibreOffice) - Future
  {
    id: 'vsdx-to-pdf',
    from: 'vsdx',
    to: 'pdf',
    engine: 'document',
    defaultOptions: {},
    supportedOptions: [],
    maxFileSize: 100,
  },
];

/**
 * Get converter config by ID
 */
export function getConverter(id: string): ConverterConfig | undefined {
  return CONVERTER_ROUTES.find((c) => c.id === id);
}

/**
 * Get converter by format pair
 */
export function getConverterByFormats(
  from: string,
  to: string
): ConverterConfig | undefined {
  return CONVERTER_ROUTES.find(
    (c) => c.from === from.toLowerCase() && c.to === to.toLowerCase()
  );
}

/**
 * List all supported "from" formats
 */
export function getSupportedFormats(): Set<string> {
  return new Set(CONVERTER_ROUTES.map((c) => c.from));
}

/**
 * List all converters that can convert FROM a specific format
 */
export function getConvertersFrom(format: string): ConverterConfig[] {
  return CONVERTER_ROUTES.filter((c) => c.from === format.toLowerCase());
}

/**
 * List all converters that can convert TO a specific format
 */
export function getConvertersTo(format: string): ConverterConfig[] {
  return CONVERTER_ROUTES.filter((c) => c.to === format.toLowerCase());
}
