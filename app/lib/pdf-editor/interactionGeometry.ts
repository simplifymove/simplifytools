import type {
  PdfEdit,
  Point,
  Rect,
  ViewportData,
} from '@/app/types/pdf-editor';

export type ResizeHandle =
  | 'nw'
  | 'n'
  | 'ne'
  | 'e'
  | 'se'
  | 's'
  | 'sw'
  | 'w';

export interface ScreenRect extends Rect {}

export interface TransformResult {
  edit: PdfEdit;
}

const clamp = (value: number, min: number, max?: number) => {
  const lower = Math.max(min, value);

  return typeof max === 'number'
    ? Math.min(max, lower)
    : lower;
};

/**
 * Convert one PDF-space distance into rendered screen pixels.
 *
 * viewport.scale already contains the current PDF.js zoom.
 * Never multiply this result by editor zoom again.
 */
export function pdfLengthToScreen(
  value: number,
  viewport: ViewportData
): number {
  return value * viewport.scale;
}

/**
 * Convert one rendered screen distance back to PDF-space units.
 */
export function screenLengthToPdf(
  value: number,
  viewport: ViewportData
): number {
  if (!viewport.scale) {
    return value;
  }

  return value / viewport.scale;
}

/**
 * Convert an edit's PDF-space rectangle into screen coordinates.
 */
export function editToScreenRect(
  edit: PdfEdit,
  viewport: ViewportData
): ScreenRect {
  return {
    x: edit.x * viewport.scale + viewport.offsetX,
    y: edit.y * viewport.scale + viewport.offsetY,
    width: pdfLengthToScreen(edit.width, viewport),
    height: pdfLengthToScreen(edit.height, viewport),
  };
}

export function isPointInsideEdit(
  point: Point,
  edit: PdfEdit
): boolean {
  return (
    point.x >= edit.x &&
    point.x <= edit.x + edit.width &&
    point.y >= edit.y &&
    point.y <= edit.y + edit.height
  );
}

/**
 * Select the visually highest edit under the pointer.
 *
 * Reverse creation order is used as a tie breaker when zIndex values match.
 */
export function findTopmostEdit(
  edits: PdfEdit[],
  pageNumber: number,
  point: Point
): PdfEdit | undefined {
  return edits
    .map((edit, index) => ({ edit, index }))
    .filter(
      ({ edit }) =>
        edit.pageNumber === pageNumber &&
        !edit.locked &&
        isPointInsideEdit(point, edit)
    )
    .sort((a, b) => {
      const zDifference =
        (b.edit.zIndex ?? 0) - (a.edit.zIndex ?? 0);

      if (zDifference !== 0) {
        return zDifference;
      }

      return b.index - a.index;
    })[0]?.edit;
}

export function getResizeHandleAtPoint(
  screenPoint: Point,
  screenRect: ScreenRect,
  handleSize = 10
): ResizeHandle | null {
  const half = Math.max(5, handleSize / 2);
  const cx = screenRect.x + screenRect.width / 2;
  const cy = screenRect.y + screenRect.height / 2;

  const handles: Array<{
    name: ResizeHandle;
    x: number;
    y: number;
  }> = [
    { name: 'nw', x: screenRect.x, y: screenRect.y },
    { name: 'n', x: cx, y: screenRect.y },
    {
      name: 'ne',
      x: screenRect.x + screenRect.width,
      y: screenRect.y,
    },
    {
      name: 'e',
      x: screenRect.x + screenRect.width,
      y: cy,
    },
    {
      name: 'se',
      x: screenRect.x + screenRect.width,
      y: screenRect.y + screenRect.height,
    },
    {
      name: 's',
      x: cx,
      y: screenRect.y + screenRect.height,
    },
    {
      name: 'sw',
      x: screenRect.x,
      y: screenRect.y + screenRect.height,
    },
    { name: 'w', x: screenRect.x, y: cy },
  ];

  for (const handle of handles) {
    if (
      Math.abs(screenPoint.x - handle.x) <= half &&
      Math.abs(screenPoint.y - handle.y) <= half
    ) {
      return handle.name;
    }
  }

  return null;
}

export function moveEditFromSnapshot(
  snapshot: PdfEdit,
  deltaX: number,
  deltaY: number,
  pageWidth?: number,
  pageHeight?: number
): TransformResult {
  const maxX =
    typeof pageWidth === 'number'
      ? Math.max(0, pageWidth - snapshot.width)
      : undefined;

  const maxY =
    typeof pageHeight === 'number'
      ? Math.max(0, pageHeight - snapshot.height)
      : undefined;

  const newX = clamp(snapshot.x + deltaX, 0, maxX);
  const newY = clamp(snapshot.y + deltaY, 0, maxY);

  const appliedDeltaX = newX - snapshot.x;
  const appliedDeltaY = newY - snapshot.y;

  return {
    edit: {
      ...snapshot,
      x: newX,
      y: newY,
      updatedAt: Date.now(),

      // Drawing geometry must move with its bounding box.
      points: snapshot.points?.map((point) => ({
        x: point.x + appliedDeltaX,
        y: point.y + appliedDeltaY,
      })),
    },
  };
}

export function resizeEditFromSnapshot(
  snapshot: PdfEdit,
  handle: ResizeHandle,
  deltaX: number,
  deltaY: number,
  minimumSize = 8
): TransformResult {
  const originalLeft = snapshot.x;
  const originalTop = snapshot.y;
  const originalRight = snapshot.x + snapshot.width;
  const originalBottom = snapshot.y + snapshot.height;

  let left = originalLeft;
  let top = originalTop;
  let right = originalRight;
  let bottom = originalBottom;

  if (handle.includes('w')) {
    left = originalLeft + deltaX;
  }

  if (handle.includes('e')) {
    right = originalRight + deltaX;
  }

  if (handle.includes('n')) {
    top = originalTop + deltaY;
  }

  if (handle.includes('s')) {
    bottom = originalBottom + deltaY;
  }

  if (right - left < minimumSize) {
    if (handle.includes('w')) {
      left = right - minimumSize;
    } else {
      right = left + minimumSize;
    }
  }

  if (bottom - top < minimumSize) {
    if (handle.includes('n')) {
      top = bottom - minimumSize;
    } else {
      bottom = top + minimumSize;
    }
  }

  left = Math.max(0, left);
  top = Math.max(0, top);

  const newWidth = Math.max(minimumSize, right - left);
  const newHeight = Math.max(minimumSize, bottom - top);

  let points = snapshot.points;

  if (
    snapshot.points &&
    snapshot.points.length > 0 &&
    snapshot.width > 0 &&
    snapshot.height > 0
  ) {
    const scaleX = newWidth / snapshot.width;
    const scaleY = newHeight / snapshot.height;

    points = snapshot.points.map((point) => ({
      x: left + (point.x - snapshot.x) * scaleX,
      y: top + (point.y - snapshot.y) * scaleY,
    }));
  }

  return {
    edit: {
      ...snapshot,
      x: left,
      y: top,
      width: newWidth,
      height: newHeight,
      points,
      updatedAt: Date.now(),
    },
  };
}

/**
 * Exact drawing bounds.
 *
 * Padding is based on stroke width only instead of the previous
 * fixed +/- 5 PDF-unit expansion.
 */
export function getDrawingBounds(
  points: Point[],
  strokeWidth = 2
): Rect | null {
  if (points.length === 0) {
    return null;
  }

  let minX = points[0].x;
  let maxX = points[0].x;
  let minY = points[0].y;
  let maxY = points[0].y;

  for (const point of points) {
    minX = Math.min(minX, point.x);
    maxX = Math.max(maxX, point.x);
    minY = Math.min(minY, point.y);
    maxY = Math.max(maxY, point.y);
  }

  const padding = Math.max(1, strokeWidth / 2);

  return {
    x: Math.max(0, minX - padding),
    y: Math.max(0, minY - padding),
    width: Math.max(1, maxX - minX + padding * 2),
    height: Math.max(1, maxY - minY + padding * 2),
  };
}
