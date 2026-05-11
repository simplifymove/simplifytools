/**
 * PDF Editor Tool Hook
 * Provides common functionality for all PDF editing tools
 */

import { useCallback, useRef } from 'react';
import { PdfEdit, ToolContext, ViewportData } from '@/app/types/pdf-editor';

export interface UsePdfEditorToolOptions {
  onAddEdit?: (edit: PdfEdit) => void;
  onUpdateEdit?: (id: string, updates: Partial<PdfEdit>) => void;
  onDeleteEdit?: (id: string) => void;
  onSelectEdit?: (id: string | undefined) => void;
  getViewportData?: () => ViewportData;
}

export function usePdfEditorTool(options: UsePdfEditorToolOptions = {}) {
  const contextRef = useRef<any>(null);

  /**
   * Create a new edit object with default values
   */
  const createEdit = useCallback(
    (
      type: PdfEdit['type'],
      pageNumber: number,
      x: number,
      y: number,
      width: number = 100,
      height: number = 100
    ): PdfEdit => {
      return {
        id: `edit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type,
        pageNumber,
        x,
        y,
        width,
        height,
        zIndex: 1000,
        opacity: 1,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
    },
    []
  );

  /**
   * Add a new edit
   */
  const addEdit = useCallback(
    (edit: PdfEdit) => {
      options.onAddEdit?.(edit);
    },
    [options]
  );

  /**
   * Update an existing edit
   */
  const updateEdit = useCallback(
    (id: string, updates: Partial<PdfEdit>) => {
      const updated = {
        ...updates,
        updatedAt: Date.now(),
      };
      options.onUpdateEdit?.(id, updated);
    },
    [options]
  );

  /**
   * Delete an edit
   */
  const deleteEdit = useCallback(
    (id: string) => {
      options.onDeleteEdit?.(id);
    },
    [options]
  );

  /**
   * Select an edit or deselect if undefined
   */
  const selectEdit = useCallback(
    (id: string | undefined) => {
      options.onSelectEdit?.(id);
    },
    [options]
  );

  /**
   * Get current viewport data
   */
  const getViewportData = useCallback((): ViewportData => {
    return (
      options.getViewportData?.() || {
        scale: 1,
        offsetX: 0,
        offsetY: 0,
        pageWidth: 612,
        pageHeight: 792,
      }
    );
  }, [options]);

  return {
    createEdit,
    addEdit,
    updateEdit,
    deleteEdit,
    selectEdit,
    getViewportData,
  };
}

/**
 * Hook for handling drawing operations on canvas
 */
export function useCanvasDrawing() {
  /**
   * Draw a filled rectangle
   */
  const drawRect = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      x: number,
      y: number,
      width: number,
      height: number,
      fillColor: string,
      strokeColor?: string,
      strokeWidth?: number
    ) => {
      ctx.fillStyle = fillColor;
      ctx.fillRect(x, y, width, height);

      if (strokeColor && strokeWidth) {
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = strokeWidth;
        ctx.strokeRect(x, y, width, height);
      }
    },
    []
  );

  /**
   * Draw a circle/ellipse
   */
  const drawCircle = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      x: number,
      y: number,
      radiusX: number,
      radiusY: number,
      fillColor: string,
      strokeColor?: string,
      strokeWidth?: number
    ) => {
      ctx.beginPath();
      ctx.ellipse(x, y, radiusX, radiusY, 0, 0, Math.PI * 2);
      ctx.fillStyle = fillColor;
      ctx.fill();

      if (strokeColor && strokeWidth) {
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = strokeWidth;
        ctx.stroke();
      }

      ctx.closePath();
    },
    []
  );

  /**
   * Draw a line
   */
  const drawLine = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      x1: number,
      y1: number,
      x2: number,
      y2: number,
      strokeColor: string,
      strokeWidth: number
    ) => {
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = strokeWidth;
      ctx.stroke();
      ctx.closePath();
    },
    []
  );

  /**
   * Draw text
   */
  const drawText = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      text: string,
      x: number,
      y: number,
      fontSize: number,
      fontColor: string,
      fontFamily: string = 'Arial'
    ) => {
      ctx.font = `${fontSize}px ${fontFamily}`;
      ctx.fillStyle = fontColor;
      ctx.fillText(text, x, y);
    },
    []
  );

  /**
   * Draw a bounding box for selection
   */
  const drawSelectionBox = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      x: number,
      y: number,
      width: number,
      height: number,
      color: string = '#007bff'
    ) => {
      const dashWidth = 5;
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.setLineDash([dashWidth, dashWidth]);
      ctx.strokeRect(x, y, width, height);
      ctx.setLineDash([]);

      // Draw corner handles
      const handleSize = 6;
      ctx.fillStyle = color;
      const handles = [
        { x: x - handleSize / 2, y: y - handleSize / 2 }, // top-left
        { x: x + width - handleSize / 2, y: y - handleSize / 2 }, // top-right
        { x: x - handleSize / 2, y: y + height - handleSize / 2 }, // bottom-left
        { x: x + width - handleSize / 2, y: y + height - handleSize / 2 }, // bottom-right
      ];

      handles.forEach((handle) => {
        ctx.fillRect(handle.x, handle.y, handleSize, handleSize);
      });
    },
    []
  );

  return {
    drawRect,
    drawCircle,
    drawLine,
    drawText,
    drawSelectionBox,
  };
}
