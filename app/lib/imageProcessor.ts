import sharp from 'sharp';

export interface ImageProcessingOptions {
  maxSide?: number;
  refine?: boolean;
  format?: 'png' | 'webp';
  returnMask?: boolean;
}

export class ImageProcessor {
  /**
   * Load and validate image, respecting EXIF orientation
   */
  static async loadImage(buffer: Buffer): Promise<{
    image: sharp.Sharp;
    metadata: sharp.Metadata;
    originalSize: { width: number; height: number };
  }> {
    const metadata = await sharp(buffer).metadata();

    if (!metadata.width || !metadata.height) {
      throw new Error('Unable to determine image dimensions');
    }

    // Check max resolution
    if (metadata.width > 6000 || metadata.height > 6000) {
      throw new Error('Image exceeds max resolution of 6000×6000');
    }

    const image = sharp(buffer).rotate(); // Auto-rotates based on EXIF

    return {
      image,
      metadata,
      originalSize: { width: metadata.width, height: metadata.height },
    };
  }

  /**
   * Compute inference size preserving aspect ratio
   */
  static computeInferenceSize(
    width: number,
    height: number,
    maxSide: number
  ): { width: number; height: number } {
    const scale = maxSide / Math.max(width, height);
    return {
      width: Math.round(width * scale),
      height: Math.round(height * scale),
    };
  }

  /**
   * Preprocess image for model inference
   * - Resize to inference size
   * - Normalize to [0, 1]
   * - Convert to RGB tensor format
   */
  static async preprocessImage(
    imagePath: string | Buffer,
    inferenceSize: { width: number; height: number }
  ): Promise<{
    data: Float32Array;
    width: number;
    height: number;
  }> {
    const resized = await sharp(imagePath)
      .resize(inferenceSize.width, inferenceSize.height, {
        fit: 'fill',
        withoutEnlargement: false,
      })
      .raw()
      .toBuffer({ resolveWithObject: true });

    const { data, info } = resized;
    const { width, height, channels } = info;

    // Convert to Float32Array and normalize to [0, 1]
    // Handle both RGB (3 channels) and RGBA (4 channels)
    const tensorData = new Float32Array(width * height * 3);

    for (let i = 0; i < width * height; i++) {
      const srcIdx = i * channels;
      const dstIdx = i * 3;

      // Extract RGB and normalize
      tensorData[dstIdx] = data[srcIdx] / 255.0; // R
      tensorData[dstIdx + 1] = data[srcIdx + 1] / 255.0; // G
      tensorData[dstIdx + 2] = data[srcIdx + 2] / 255.0; // B
    }

    return { data: tensorData, width, height };
  }

  /**
   * Postprocess mask (refine edges, denoise, upsample)
   */
  static async postprocessMask(
    mask: Float32Array,
    maskWidth: number,
    maskHeight: number,
    originalWidth: number,
    originalHeight: number,
    options: ImageProcessingOptions = {}
  ): Promise<Buffer> {
    const { refine = true } = options;

    // Step 1: Normalize mask to [0, 1]
    let min = Math.min(...Array.from(mask));
    let max = Math.max(...Array.from(mask));
    const range = max - min || 1e-5;

    const normalized = new Float32Array(mask.length);
    for (let i = 0; i < mask.length; i++) {
      normalized[i] = Math.max(0, Math.min(1, (mask[i] - min) / range));
    }

    // Step 2: Apply refinement if requested
    let refined: Float32Array = normalized;
    if (refine) {
      refined = this.refineMask(normalized, maskWidth, maskHeight);
    }

    // Step 3: Upsample to original size (create PNG grayscale)
    const upsampled = await this.upsampleMask(
      refined,
      maskWidth,
      maskHeight,
      originalWidth,
      originalHeight
    );

    // Step 4: Convert to 0-255 and create PNG
    const uint8Mask = new Uint8ClampedArray(upsampled.length);
    for (let i = 0; i < upsampled.length; i++) {
      uint8Mask[i] = Math.round(upsampled[i] * 255);
    }

    // Create grayscale PNG
    const png = await sharp(
      Buffer.from(uint8Mask),
      {
        raw: {
          width: originalWidth,
          height: originalHeight,
          channels: 1,
        },
      }
    )
      .png()
      .toBuffer();

    return png;
  }

  /**
   * Refine mask: morphological operations, edge feathering, hole filling
   */
  private static refineMask(
    mask: Float32Array,
    width: number,
    height: number
  ): Float32Array {
    const refined = new Float32Array(mask);

    // Step 1: Threshold for binary processing (0.5)
    const binary = new Uint8Array(refined.length);
    for (let i = 0; i < refined.length; i++) {
      binary[i] = refined[i] > 0.5 ? 255 : 0;
    }

    // Step 2: Morphological opening (erode then dilate) to remove small noise
    const opened = this.morphOpen(binary, width, height, 2);

    // Step 3: Fill small holes in foreground
    const filled = this.fillSmallHoles(opened, width, height, 50);

    // Step 4: Convert back to float and apply edge feathering
    const result = new Float32Array(refined.length);
    for (let i = 0; i < filled.length; i++) {
      result[i] = filled[i] / 255;
    }

    // Step 5: Edge feathering - smooth transition zone
    return this.featherEdges(result, width, height);
  }

  /**
   * Morphological opening: erode then dilate
   */
  private static morphOpen(
    binary: Uint8Array,
    width: number,
    height: number,
    radius: number
  ): Uint8Array {
    const eroded = this.erode(binary, width, height, radius);
    return this.dilate(eroded, width, height, radius);
  }

  /**
   * Erode operation
   */
  private static erode(
    binary: Uint8Array,
    width: number,
    height: number,
    radius: number
  ): Uint8Array {
    const result = new Uint8Array(binary);

    for (let y = radius; y < height - radius; y++) {
      for (let x = radius; x < width - radius; x++) {
        const idx = y * width + x;
        let hasZero = false;

        for (let dy = -radius; dy <= radius; dy++) {
          for (let dx = -radius; dx <= radius; dx++) {
            if (binary[(y + dy) * width + (x + dx)] === 0) {
              hasZero = true;
              break;
            }
          }
          if (hasZero) break;
        }

        result[idx] = hasZero ? 0 : 255;
      }
    }

    return result;
  }

  /**
   * Dilate operation
   */
  private static dilate(
    binary: Uint8Array,
    width: number,
    height: number,
    radius: number
  ): Uint8Array {
    const result = new Uint8Array(binary);

    for (let y = radius; y < height - radius; y++) {
      for (let x = radius; x < width - radius; x++) {
        const idx = y * width + x;
        let hasOne = false;

        for (let dy = -radius; dy <= radius; dy++) {
          for (let dx = -radius; dx <= radius; dx++) {
            if (binary[(y + dy) * width + (x + dx)] === 255) {
              hasOne = true;
              break;
            }
          }
          if (hasOne) break;
        }

        result[idx] = hasOne ? 255 : 0;
      }
    }

    return result;
  }

  /**
   * Fill small holes (connected components < threshold)
   */
  private static fillSmallHoles(
    binary: Uint8Array,
    width: number,
    height: number,
    minSize: number
  ): Uint8Array {
    const result = new Uint8Array(binary);
    const visited = new Set<number>();

    for (let i = 0; i < binary.length; i++) {
      if (binary[i] === 0 && !visited.has(i)) {
        // BFS to find connected component of background
        const component = this.bfsComponent(binary, i, width, height, visited);

        // If small hole, fill it
        if (component.size < minSize) {
          component.indices.forEach(idx => {
            result[idx] = 255;
          });
        }
      }
    }

    return result;
  }

  /**
   * BFS to find connected component
   */
  private static bfsComponent(
    binary: Uint8Array,
    startIdx: number,
    width: number,
    height: number,
    visited: Set<number>
  ): { size: number; indices: number[] } {
    const queue = [startIdx];
    const indices = [startIdx];
    visited.add(startIdx);

    while (queue.length > 0) {
      const idx = queue.shift()!;
      const x = idx % width;
      const y = Math.floor(idx / width);

      const neighbors = [
        y > 0 ? (y - 1) * width + x : -1,
        y < height - 1 ? (y + 1) * width + x : -1,
        x > 0 ? y * width + (x - 1) : -1,
        x < width - 1 ? y * width + (x + 1) : -1,
      ];

      for (const nIdx of neighbors) {
        if (nIdx >= 0 && !visited.has(nIdx) && binary[nIdx] === 0) {
          visited.add(nIdx);
          indices.push(nIdx);
          queue.push(nIdx);
        }
      }
    }

    return { size: indices.length, indices };
  }

  /**
   * Feather edges with Gaussian-like smoothing
   */
  private static featherEdges(
    mask: Float32Array,
    width: number,
    height: number
  ): Float32Array {
    const result = new Float32Array(mask);
    const radius = 2;

    for (let y = radius; y < height - radius; y++) {
      for (let x = radius; x < width - radius; x++) {
        const idx = y * width + x;
        const center = mask[idx];

        // Check if on edge (value between 0 and 1, or near boundary)
        let isEdge = center > 0.1 && center < 0.9;

        if (!isEdge) {
          const neighbors = [
            mask[(y-1)*width + x], mask[(y+1)*width + x],
            mask[y*width + (x-1)], mask[y*width + (x+1)],
          ];
          const avgNeighbor = neighbors.reduce((a, b) => a + b, 0) / 4;
          isEdge = Math.abs(center - avgNeighbor) > 0.1;
        }

        if (isEdge) {
          // Apply Gaussian blur to edge
          let sum = 0;
          let weight = 0;
          for (let dy = -radius; dy <= radius; dy++) {
            for (let dx = -radius; dx <= radius; dx++) {
              const d = Math.sqrt(dx * dx + dy * dy);
              const g = Math.exp(-(d * d) / (2 * radius * radius));
              sum += mask[(y + dy) * width + (x + dx)] * g;
              weight += g;
            }
          }
          result[idx] = sum / weight;
        }
      }
    }

    return result;
  }

  /**
   * Upsample mask to original size using bilinear interpolation
   */
  private static async upsampleMask(
    mask: Float32Array,
    maskWidth: number,
    maskHeight: number,
    targetWidth: number,
    targetHeight: number
  ): Promise<Float32Array> {
    const upsampled = new Float32Array(targetWidth * targetHeight);
    const scaleX = (maskWidth - 1) / (targetWidth - 1);
    const scaleY = (maskHeight - 1) / (targetHeight - 1);

    for (let y = 0; y < targetHeight; y++) {
      for (let x = 0; x < targetWidth; x++) {
        const srcX = x * scaleX;
        const srcY = y * scaleY;
        const x0 = Math.floor(srcX);
        const y0 = Math.floor(srcY);
        const x1 = Math.min(x0 + 1, maskWidth - 1);
        const y1 = Math.min(y0 + 1, maskHeight - 1);

        const fx = srcX - x0;
        const fy = srcY - y0;

        const v00 = mask[y0 * maskWidth + x0];
        const v10 = mask[y0 * maskWidth + x1];
        const v01 = mask[y1 * maskWidth + x0];
        const v11 = mask[y1 * maskWidth + x1];

        const v0 = v00 * (1 - fx) + v10 * fx;
        const v1 = v01 * (1 - fx) + v11 * fx;
        const v = v0 * (1 - fy) + v1 * fy;

        upsampled[y * targetWidth + x] = v;
      }
    }

    return upsampled;
  }

  /**
   * Compose alpha with image to create RGBA
   */
  static async composeWithAlpha(
    imageBuffer: Buffer,
    alphaBuffer: Buffer,
    originalSize: { width: number; height: number },
    format: 'png' | 'webp' = 'png'
  ): Promise<Buffer> {
    const image = await sharp(imageBuffer)
      .resize(originalSize.width, originalSize.height)
      .toBuffer({ resolveWithObject: true });

    const alphaPng = await sharp(alphaBuffer)
      .raw()
      .toBuffer({ resolveWithObject: true });

    const { data: imageData, info: imageInfo } = image;
    const { data: alphaData } = alphaPng;

    // Create RGBA buffer
    const rgba = new Uint8ClampedArray(originalSize.width * originalSize.height * 4);
    for (let i = 0; i < originalSize.width * originalSize.height; i++) {
      const srcIdx = i * (imageInfo.channels || 3);
      const dstIdx = i * 4;

      rgba[dstIdx] = imageData[srcIdx];
      rgba[dstIdx + 1] = imageData[srcIdx + 1];
      rgba[dstIdx + 2] = imageData[srcIdx + 2];
      rgba[dstIdx + 3] = alphaData[i];
    }

    const result = await sharp(Buffer.from(rgba), {
      raw: {
        width: originalSize.width,
        height: originalSize.height,
        channels: 4,
      },
    })
      .toFormat(format)
      .toBuffer();

    return result;
  }

  /**
   * Validate file type using magic bytes
   */
  static validateImageType(buffer: Buffer): boolean {
    const magicBytes = buffer.slice(0, 12);

    // JPEG: FF D8 FF
    if (magicBytes[0] === 0xFF && magicBytes[1] === 0xD8 && magicBytes[2] === 0xFF) {
      return true;
    }

    // PNG: 89 50 4E 47
    if (
      magicBytes[0] === 0x89 &&
      magicBytes[1] === 0x50 &&
      magicBytes[2] === 0x4E &&
      magicBytes[3] === 0x47
    ) {
      return true;
    }

    // WebP: RIFF...WEBP
    if (
      magicBytes[0] === 0x52 &&
      magicBytes[1] === 0x49 &&
      magicBytes[2] === 0x46 &&
      magicBytes[3] === 0x46 &&
      magicBytes[8] === 0x57 &&
      magicBytes[9] === 0x45 &&
      magicBytes[10] === 0x42 &&
      magicBytes[11] === 0x50
    ) {
      return true;
    }

    return false;
  }
}
