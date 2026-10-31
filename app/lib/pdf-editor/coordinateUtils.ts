/**
 * Coordinate Conversion Utilities
 * Converts between browser screen coordinates and PDF document coordinates
 */

import { Point, Rect, ViewportData } from '@/app/types/pdf-editor';

/**
 * Convert screen/canvas coordinates to PDF document coordinates
 * Accounts for: scale, offset, rotation, zoom, scroll
 */
export function screenToPdfCoords(
  screenX: number,
  screenY: number,
  viewport: ViewportData,
  zoom: number = 1
): Point {
  // viewport.scale already contains the PDF.js render zoom.
  // Do not divide by zoom again or pointer coordinates are scaled twice.
  const pdfX = (screenX - viewport.offsetX) / viewport.scale;
  const pdfY = (screenY - viewport.offsetY) / viewport.scale;
  
  // Handle rotation if present
  if (viewport.rotation && viewport.rotation !== 0) {
    return rotatePoint({ x: pdfX, y: pdfY }, viewport.rotation, {
      x: viewport.pageWidth / 2,
      y: viewport.pageHeight / 2,
    });
  }
  
  return { x: pdfX, y: pdfY };
}

/**
 * Convert PDF coordinates to screen/canvas coordinates
 */
export function pdfToScreenCoords(
  pdfX: number,
  pdfY: number,
  viewport: ViewportData,
  zoom: number = 1
): Point {
  // Handle rotation if present
  let x = pdfX;
  let y = pdfY;
  
  if (viewport.rotation && viewport.rotation !== 0) {
    const rotated = rotatePoint(
      { x, y },
      -viewport.rotation, // Reverse rotation
      { x: viewport.pageWidth / 2, y: viewport.pageHeight / 2 }
    );
    x = rotated.x;
    y = rotated.y;
  }
  
  // viewport.scale already contains the PDF.js render zoom.
  // Do not multiply by zoom again or edit overlays are scaled twice.
  const screenX = x * viewport.scale + viewport.offsetX;
  const screenY = y * viewport.scale + viewport.offsetY;
  
  return { x: screenX, y: screenY };
}

/**
 * Convert DOMRect to normalized coordinates
 */
export function normalizeRect(rect: DOMRect): Rect {
  return {
    x: rect.left,
    y: rect.top,
    width: rect.width,
    height: rect.height,
  };
}

/**
 * Normalize a rectangle to ensure positive dimensions
 */
export function normalizeBox(x1: number, y1: number, x2: number, y2: number): Rect {
  const minX = Math.min(x1, x2);
  const minY = Math.min(y1, y2);
  const maxX = Math.max(x1, x2);
  const maxY = Math.max(y1, y2);
  
  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  };
}

/**
 * Check if a point is inside a rectangle
 */
export function isPointInRect(point: Point, rect: Rect): boolean {
  return (
    point.x >= rect.x &&
    point.x <= rect.x + rect.width &&
    point.y >= rect.y &&
    point.y <= rect.y + rect.height
  );
}

/**
 * Get the distance between two points
 */
export function getDistance(p1: Point, p2: Point): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Rotate a point around a center point
 * @param point Point to rotate
 * @param angle Angle in degrees
 * @param center Center point to rotate around
 */
export function rotatePoint(point: Point, angle: number, center: Point): Point {
  const rad = (angle * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  
  // Translate to origin
  const x = point.x - center.x;
  const y = point.y - center.y;
  
  // Rotate
  const rotatedX = x * cos - y * sin;
  const rotatedY = x * sin + y * cos;
  
  // Translate back
  return {
    x: rotatedX + center.x,
    y: rotatedY + center.y,
  };
}

/**
 * Snap a coordinate to a grid
 */
export function snapToGrid(value: number, gridSize: number = 10): number {
  return Math.round(value / gridSize) * gridSize;
}

/**
 * Constrain a rectangle within bounds
 */
export function constrainRectInBounds(rect: Rect, bounds: Rect): Rect {
  return {
    x: Math.max(bounds.x, Math.min(rect.x, bounds.x + bounds.width - rect.width)),
    y: Math.max(bounds.y, Math.min(rect.y, bounds.y + bounds.height - rect.height)),
    width: Math.min(rect.width, bounds.width),
    height: Math.min(rect.height, bounds.height),
  };
}

/**
 * Check if two rectangles overlap
 */
export function rectsOverlap(rect1: Rect, rect2: Rect): boolean {
  return !(
    rect1.x + rect1.width < rect2.x ||
    rect2.x + rect2.width < rect1.x ||
    rect1.y + rect1.height < rect2.y ||
    rect2.y + rect2.height < rect1.y
  );
}

/**
 * Get the center point of a rectangle
 */
export function getRectCenter(rect: Rect): Point {
  return {
    x: rect.x + rect.width / 2,
    y: rect.y + rect.height / 2,
  };
}

/**
 * Resize a rectangle from a handle
 * @param rect Original rectangle
 * @param handle Corner/edge being dragged (e.g., 'nw', 'se', 'e', etc.)
 * @param delta Change in x and y
 */
export function resizeRectFromHandle(
  rect: Rect,
  handle: string,
  delta: Point
): Rect {
  let { x, y, width, height } = rect;
  
  if (handle.includes('n')) y += delta.y; // Top edge
  if (handle.includes('s')) height += delta.y; // Bottom edge
  if (handle.includes('w')) x += delta.x; // Left edge
  if (handle.includes('e')) width += delta.x; // Right edge
  
  // Ensure minimum size
  if (width < 10) width = 10;
  if (height < 10) height = 10;
  
  return { x, y, width, height };
}
