'use client';

import React, { useEffect, useRef, useState, useCallback, memo } from 'react';
import { PdfEdit, ViewportData } from '@/app/types/pdf-editor';
import {
  screenToPdfCoords,
  pdfToScreenCoords,
  isPointInRect,
  normalizeBox,
  getRectCenter,
  getDistance,
} from '@/app/lib/pdf-editor/coordinateUtils';

interface Props {
  pdfDoc: any;
  currentPage: number;
  zoom: number;
  edits: PdfEdit[];
  selectedEditId?: string;
  activeTool: string;
  shapeType?: string;
  drawingType?: string;
  strokeColor?: string;
  strokeWidth?: number;
  highlightColor?: string;
  currentImageData?: string;
  extractedText?: any[]; // ExtractedText[]
  editedTexts?: Record<string, string>;
  editingTextId?: string | null;
  onSelectEdit?: (id: string | undefined) => void;
  onUpdateEdit?: (id: string, updates: Partial<PdfEdit>) => void;
  onAddEdit?: (edit: PdfEdit) => void;
  onDeleteEdit?: (id: string) => void;
  onPan?: (x: number, y: number) => void;
  onTextClick?: (textId: string) => void;
  onTextEditChange?: (textId: string, newText: string) => void;
}

interface MouseState {
  isDown: boolean;
  startX: number;
  startY: number;
  isDragging: boolean;
  draggedEditId?: string;
  dragHandle?: string; // 'nw', 'ne', 'se', 'sw', 'n', 's', 'e', 'w', 'move'
  dragInitialX?: number; // Initial position of edit being dragged
  dragInitialY?: number;
}

const HANDLE_SIZE = 8;
const MIN_EDIT_SIZE = 20;

const PDFCanvasComponent = function PDFCanvas({
  pdfDoc,
  currentPage,
  zoom,
  edits,
  selectedEditId,
  activeTool,
  shapeType = 'rectangle',
  drawingType = 'pen',
  strokeColor = '#000000',
  strokeWidth = 2,
  highlightColor = 'rgba(255, 255, 0, 0.3)',
  currentImageData = '',
  extractedText = [],
  editedTexts = {},
  editingTextId = null,
  onSelectEdit,
  onUpdateEdit,
  onAddEdit,
  onDeleteEdit,
  onPan,
  onTextClick,
  onTextEditChange,
}: Props) {
  // Log when component receives props
  console.log('[PDFCanvas] Component props updated. extractedText length:', extractedText.length);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const textOverlayContainerRef = useRef<HTMLDivElement>(null);
  const textInputRef = useRef<HTMLInputElement>(null);
  const viewportDataRef = useRef<ViewportData>({
    scale: 1,
    offsetX: 0,
    offsetY: 0,
    pageWidth: 612,
    pageHeight: 792,
  });
  
  const mouseStateRef = useRef<MouseState>({
    isDown: false,
    startX: 0,
    startY: 0,
    isDragging: false,
  });
  
  // Track hover state for cursor feedback
  const [hoverState, setHoverState] = useState<{
    isHovering: boolean;
    handle?: string;
    editId?: string;
  }>({ isHovering: false });
  
  // Track drawing path for draw tool
  const drawingPathRef = useRef<Array<{x: number, y: number}>>([]);

  // Track in-flight render tasks to cancel them if needed
  const renderTaskRef = useRef<any>(null);

  // Image cache to preload images
  const imageCacheRef = useRef<Map<string, HTMLImageElement>>(new Map());

  // Preload images for faster rendering
  useEffect(() => {
    const imageEdits = edits.filter(e => e.type === 'image' || e.type === 'signature');
    
    imageEdits.forEach(edit => {
      if (edit.imageData && !imageCacheRef.current.has(edit.id)) {
        const img = new Image();
        img.onload = () => {
          console.log('[PDFCanvas] Image loaded and cached:', edit.id);
        };
        img.onerror = () => {
          console.log('[PDFCanvas] Failed to preload image:', edit.id);
        };
        img.src = edit.imageData;
        imageCacheRef.current.set(edit.id, img);
      }
    });
  }, [edits]);

  // Render PDF page
  useEffect(() => {
    let isMounted = true;
    let renderTask: any = null;

    const renderPDF = async () => {
      console.log('[PDFCanvas] renderPDF called. pdfDoc:', !!pdfDoc, 'canvasRef:', !!canvasRef.current, 'currentPage:', currentPage);
      
      if (!pdfDoc || !canvasRef.current || !isMounted) {
        console.log('[PDFCanvas] Skipping render - missing dependencies');
        return;
      }

      // Validate currentPage is within bounds (1-based indexing)
      if (currentPage < 1) {
        console.warn('[PDFCanvas] Invalid currentPage:', currentPage, '- must be >= 1. Skipping render.');
        return;
      }

      // Validate pdfDoc is a valid PDF object
      if (!pdfDoc.numPages || pdfDoc.numPages < 1) {
        console.warn('[PDFCanvas] Invalid PDF object - numPages:', pdfDoc.numPages, '. Skipping render.');
        return;
      }

      // Ensure currentPage doesn't exceed total pages
      if (currentPage > pdfDoc.numPages) {
        console.warn('[PDFCanvas] currentPage:', currentPage, 'exceeds total pages:', pdfDoc.numPages, '. Skipping render.');
        return;
      }

      try {
        console.log('[PDFCanvas] Getting page', currentPage);
        const page = await pdfDoc.getPage(currentPage);
        console.log('[PDFCanvas] Page retrieved');
        
        const viewport = page.getViewport({ scale: zoom });
        console.log('[PDFCanvas] Viewport:', viewport.width, 'x', viewport.height);

        if (!isMounted) return;

        viewportDataRef.current = {
          scale: zoom,
          offsetX: 0,
          offsetY: 0,
          pageWidth: viewport.width,
          pageHeight: viewport.height,
        };

        const canvas = canvasRef.current;
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        console.log('[PDFCanvas] Canvas size set:', canvas.width, 'x', canvas.height);

        const context = canvas.getContext('2d');
        if (!context || !isMounted) {
          console.error('[PDFCanvas] Cannot get canvas context');
          return;
        }

        console.log('[PDFCanvas] Starting page render...');
        renderTask = page.render({
          canvasContext: context,
          viewport: viewport,
        });
        
        renderTaskRef.current = renderTask;
        await renderTask.promise;
        
        console.log('[PDFCanvas] Page rendered successfully');
        
        if (isMounted) {
          renderTaskRef.current = null;
        }
      } catch (err) {
        if (isMounted) {
          const errMsg = err instanceof Error ? err.message : String(err);
          if (errMsg.includes('Invalid page request')) {
            console.error('[PDFCanvas] Invalid page request - currentPage:', currentPage, 'error:', err);
          } else if (!errMsg.includes('Rendering')) {
            console.error('[PDFCanvas] Failed to render PDF:', err);
          }
        }
      }
    };

    renderPDF();

    return () => {
      isMounted = false;
      // Cancel pending render task if it exists
      if (renderTask && renderTask.cancel) {
        try {
          renderTask.cancel();
        } catch (e) {
          // Ignore cancellation errors
        }
      }
      if (renderTaskRef.current && renderTaskRef.current.cancel) {
        try {
          renderTaskRef.current.cancel();
        } catch (e) {
          // Ignore cancellation errors
        }
      }
    };
  }, [pdfDoc, currentPage, zoom]);

  // Render edits overlay
  const renderEdits = useCallback(() => {
    console.log('[PDFCanvas] renderEdits called');
    
    if (!overlayCanvasRef.current || !canvasRef.current) {
      console.log('[PDFCanvas] renderEdits - missing refs. overlay:', !!overlayCanvasRef.current, 'main:', !!canvasRef.current);
      return;
    }

    const canvas = overlayCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.log('[PDFCanvas] Cannot get overlay canvas context');
      return;
    }

    const baseCanvas = canvasRef.current;
    canvas.width = baseCanvas.width;
    canvas.height = baseCanvas.height;
    
    console.log('[PDFCanvas] Overlay canvas size:', canvas.width, 'x', canvas.height);

    // Clear
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Get edits for current page
    const pageEdits = edits.filter((e) => e.pageNumber === currentPage);
    pageEdits.sort((a, b) => a.zIndex - b.zIndex);
    
    console.log('[PDFCanvas] Rendering', pageEdits.length, 'edits for page', currentPage);

    // Render each edit
    pageEdits.forEach((edit) => {
      const coords = pdfToScreenCoords(
        edit.x,
        edit.y,
        viewportDataRef.current,
        zoom
      );

      ctx.globalAlpha = edit.opacity ?? 1;

      switch (edit.type) {
        case 'text':
          renderTextEdit(ctx, edit, coords);
          break;
        case 'whiteout':
          renderWhiteoutEdit(ctx, edit, coords);
          break;
        case 'shape':
          renderShapeEdit(ctx, edit, coords);
          break;
        case 'highlight':
          renderHighlightEdit(ctx, edit, coords);
          break;
        case 'drawing':
          renderDrawingEdit(ctx, edit, coords);
          break;
        case 'image':
          renderImageEdit(ctx, edit, coords);
          break;
        case 'signature':
          renderImageEdit(ctx, edit, coords);
          break;
        case 'link':
          renderLinkEdit(ctx, edit, coords);
          break;
      }

      ctx.globalAlpha = 1;
    });

    // Draw selection box if something is selected
    if (selectedEditId) {
      const selected = edits.find((e) => e.id === selectedEditId);
      if (selected && selected.pageNumber === currentPage) {
        const coords = pdfToScreenCoords(
          selected.x,
          selected.y,
          viewportDataRef.current,
          zoom
        );
        drawSelectionBox(
          ctx,
          coords.x,
          coords.y,
          selected.width * zoom,
          selected.height * zoom
        );
      }
    }

    // Draw live preview of current drawing
    if (activeTool === 'drawing' && drawingPathRef.current.length > 1) {
      ctx.strokeStyle = strokeColor || '#000000';
      ctx.lineWidth = (strokeWidth || 2) * zoom;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.globalAlpha = 0.8;

      ctx.beginPath();
      for (let i = 0; i < drawingPathRef.current.length; i++) {
        const point = drawingPathRef.current[i];
        const screenPoint = pdfToScreenCoords(point.x, point.y, viewportDataRef.current, zoom);
        
        if (i === 0) {
          ctx.moveTo(screenPoint.x, screenPoint.y);
        } else {
          ctx.lineTo(screenPoint.x, screenPoint.y);
        }
      }
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
  }, [edits, currentPage, selectedEditId, zoom, activeTool, strokeColor, strokeWidth]);

  // Render extracted text overlays
  const renderExtractedTextOverlays = () => {
    if (!textOverlayContainerRef.current || !overlayCanvasRef.current) return;

    console.log('[Text Extraction] renderExtractedTextOverlays called');
    console.log('[Text Extraction] Container ref exists:', !!textOverlayContainerRef.current);
    console.log('[Text Extraction] Total extracted text items:', extractedText.length);
    
    // Clear previous overlays
    textOverlayContainerRef.current.innerHTML = '';

    // Filter text items for current page
    const pageTextItems = extractedText.filter((t) => t.pageNumber === currentPage);
    
    console.log(`[Text Extraction] Rendering ${pageTextItems.length} items for page ${currentPage}`);

    pageTextItems.forEach((textItem) => {
      // Check if text has been edited
      const isEdited = !!editedTexts[textItem.id];
      
      // Skip showing overlay if already edited (final state)
      if (isEdited && editingTextId !== textItem.id) {
        console.log(`[Text Extraction] Skipping overlay for edited text: "${textItem.text}"`);
        return;
      }

      // Convert PDF coordinates to screen coordinates
      const screenCoords = pdfToScreenCoords(
        textItem.x,
        textItem.y,
        viewportDataRef.current,
        zoom
      );

      const screenWidth = textItem.width * zoom;
      const screenHeight = textItem.height * zoom;

      // Create wrapper for overlay
      const wrapper = document.createElement('div');
      wrapper.style.position = 'absolute';
      wrapper.style.left = `${screenCoords.x}px`;
      wrapper.style.top = `${screenCoords.y}px`;
      wrapper.style.width = `${screenWidth}px`;
      wrapper.style.height = `${screenHeight}px`;
      wrapper.style.zIndex = '10';

      // Create overlay div for this text item
      const overlay = document.createElement('div');
      overlay.className = 'absolute border cursor-text transition-colors text-xs flex items-center justify-between px-2 py-1 overflow-hidden';
      overlay.style.width = '100%';
      overlay.style.height = '100%';
      overlay.style.top = '0';
      overlay.style.left = '0';
      overlay.style.borderWidth = '1px';
      overlay.style.borderColor = '#60A5FA';
      overlay.style.borderStyle = 'solid';
      overlay.title = 'Click to edit';

      console.log(`[Text Extraction] Created overlay for text: "${textItem.text}" at (${screenCoords.x}, ${screenCoords.y})`);

      // Set colors based on state
      if (editingTextId === textItem.id) {
        // Currently editing - green
        overlay.style.backgroundColor = 'rgba(134, 239, 172, 0.3)';
        overlay.style.borderColor = '#22C55E';
      } else {
        // Not edited - blue
        overlay.style.backgroundColor = 'rgba(191, 219, 254, 0.2)';
        overlay.style.borderColor = '#60A5FA';
      }

      // Add text preview only if currently editing
      if (editingTextId === textItem.id) {
        const contentDiv = document.createElement('div');
        contentDiv.style.flex = '1';
        contentDiv.style.fontSize = '11px';
        contentDiv.style.fontWeight = 'bold';
        contentDiv.style.color = '#1F2937';
        contentDiv.style.whiteSpace = 'nowrap';
        contentDiv.style.overflow = 'hidden';
        contentDiv.style.textOverflow = 'ellipsis';
        const currentText = editedTexts[textItem.id] || textItem.text;
        contentDiv.textContent = currentText.substring(0, 20);
        overlay.appendChild(contentDiv);
      }

      // Click handler
      overlay.addEventListener('click', (e) => {
        console.log('[Text Extraction] Overlay clicked, text ID:', textItem.id);
        e.stopPropagation();
        onTextClick?.(textItem.id);
      });

      wrapper.appendChild(overlay);
      textOverlayContainerRef.current?.appendChild(wrapper);
    });
  };

  // Re-render extracted text overlays when data changes
  useEffect(() => {
    console.log('[Text Extraction] useEffect triggered. extractedText.length =', extractedText.length);
    renderExtractedTextOverlays();
  }, [extractedText, editedTexts, editingTextId, currentPage, zoom]);

  // Sync overlay container dimensions with canvas
  useEffect(() => {
    if (!textOverlayContainerRef.current || !canvasRef.current) return;
    
    textOverlayContainerRef.current.style.width = `${canvasRef.current.width}px`;
    textOverlayContainerRef.current.style.height = `${canvasRef.current.height}px`;
  }, [zoom, currentPage]);

  // Handle text input focus when editing starts
  useEffect(() => {
    console.log('[Text Editing] editingTextId changed to:', editingTextId);
    if (editingTextId && textInputRef.current) {
      setTimeout(() => {
        console.log('[Text Editing] Focusing input field');
        textInputRef.current?.focus();
        textInputRef.current?.select();
      }, 0);
    }
  }, [editingTextId]);

  // Handle keyboard events for text editing
  const handleTextInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const newText = textInputRef.current?.value || '';
      console.log('[Text Editing] Enter pressed, saving text:', newText);
      onTextEditChange?.(editingTextId || '', newText);
      onTextClick?.(null as any); // Clear editing state
    } else if (e.key === 'Escape') {
      e.preventDefault();
      console.log('[Text Editing] Escape pressed, canceling edit');
      onTextClick?.(null as any); // Cancel editing without saving
    }
  };

  // Handle text input blur
  const handleTextInputBlur = () => {
    if (editingTextId && textInputRef.current) {
      const newText = textInputRef.current.value;
      console.log('[Text Editing] Blur, saving text:', newText);
      onTextEditChange?.(editingTextId, newText);
      onTextClick?.(null as any);
    }
  };

  // Render helpers
  const renderTextEdit = (ctx: CanvasRenderingContext2D, edit: PdfEdit, coords: any) => {
    // First draw white rectangle with extra padding to cover original text completely
    ctx.fillStyle = '#FFFFFF';
    const padding = 3; // Add padding to ensure full coverage
    ctx.fillRect(
      coords.x - padding,
      coords.y - padding,
      (edit.width * zoom) + (padding * 2),
      (edit.height * zoom) + (padding * 2)
    );
    
    // Then draw the new text on top
    ctx.font = `${edit.fontSize || 12}px ${edit.fontFamily || 'Arial'}`;
    ctx.fillStyle = edit.fontColor || '#000000';
    ctx.fillText(edit.text || '', coords.x, coords.y + (edit.fontSize || 12));
  };

  const renderWhiteoutEdit = (ctx: CanvasRenderingContext2D, edit: PdfEdit, coords: any) => {
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(coords.x, coords.y, edit.width * zoom, edit.height * zoom);
    ctx.strokeStyle = '#CCCCCC';
    ctx.lineWidth = 1;
    ctx.strokeRect(coords.x, coords.y, edit.width * zoom, edit.height * zoom);
  };

  const renderShapeEdit = (ctx: CanvasRenderingContext2D, edit: PdfEdit, coords: any) => {
    ctx.strokeStyle = edit.strokeColor || '#000000';
    ctx.lineWidth = edit.strokeWidth || 2;
    ctx.fillStyle = edit.fillColor || 'transparent';

    const w = edit.width * zoom;
    const h = edit.height * zoom;

    if (edit.shapeType === 'rectangle') {
      if (edit.fillColor && edit.fillColor !== 'transparent') {
        ctx.fillRect(coords.x, coords.y, w, h);
      }
      ctx.strokeRect(coords.x, coords.y, w, h);
    } else if (edit.shapeType === 'circle') {
      // Draw ellipse
      ctx.beginPath();
      ctx.ellipse(coords.x + w / 2, coords.y + h / 2, w / 2, h / 2, 0, 0, Math.PI * 2);
      if (edit.fillColor && edit.fillColor !== 'transparent') {
        ctx.fill();
      }
      ctx.stroke();
    } else if (edit.shapeType === 'line') {
      // Draw line
      ctx.beginPath();
      ctx.moveTo(coords.x, coords.y);
      ctx.lineTo(coords.x + w, coords.y + h);
      ctx.stroke();
    } else if (edit.shapeType === 'arrow') {
      // Draw arrow
      const headlen = 15;
      const angle = Math.atan2(coords.y + h - coords.y, coords.x + w - coords.x);

      // Line
      ctx.beginPath();
      ctx.moveTo(coords.x, coords.y);
      ctx.lineTo(coords.x + w, coords.y + h);
      ctx.stroke();

      // Arrow head
      ctx.beginPath();
      ctx.moveTo(coords.x + w, coords.y + h);
      ctx.lineTo(coords.x + w - headlen * Math.cos(angle - Math.PI / 6), coords.y + h - headlen * Math.sin(angle - Math.PI / 6));
      ctx.moveTo(coords.x + w, coords.y + h);
      ctx.lineTo(coords.x + w - headlen * Math.cos(angle + Math.PI / 6), coords.y + h - headlen * Math.sin(angle + Math.PI / 6));
      ctx.stroke();
    }
  };

  const renderHighlightEdit = (ctx: CanvasRenderingContext2D, edit: PdfEdit, coords: any) => {
    ctx.fillStyle = edit.fillColor || 'rgba(255, 255, 0, 0.3)';
    ctx.fillRect(coords.x, coords.y, edit.width * zoom, edit.height * zoom);
  };

  const renderDrawingEdit = (ctx: CanvasRenderingContext2D, edit: PdfEdit, coords: any) => {
    ctx.strokeStyle = edit.strokeColor || '#000000';
    ctx.lineWidth = (edit.strokeWidth || 2) * zoom;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // If we have a path, replay it
    if (edit.points && edit.points.length > 0) {
      ctx.beginPath();
      
      for (let i = 0; i < edit.points.length; i++) {
        const pathPoint = edit.points[i];
        const screenPoint = pdfToScreenCoords(pathPoint.x, pathPoint.y, viewportDataRef.current, zoom);
        
        if (i === 0) {
          ctx.moveTo(screenPoint.x, screenPoint.y);
        } else {
          ctx.lineTo(screenPoint.x, screenPoint.y);
        }
      }
      
      // Apply drawing type effects
      if (edit.drawingType === 'highlighter') {
        ctx.globalAlpha = 0.3;
        ctx.strokeStyle = edit.strokeColor || '#FFFF00';
      } else if (edit.drawingType === 'strikethrough') {
        // For strikethrough, just draw the path as-is
      } else if (edit.drawingType === 'underline') {
        // For underline, just draw the path as-is
      }
      
      ctx.stroke();
      ctx.globalAlpha = 1;
    } else {
      // Fallback if no path - show a visual indicator
      const w = edit.width * zoom;
      const h = edit.height * zoom;

      if (edit.drawingType === 'highlighter') {
        ctx.globalAlpha = 0.3;
        ctx.fillStyle = edit.strokeColor || '#FFFF00';
        ctx.fillRect(coords.x, coords.y, w, h);
        ctx.globalAlpha = 1;
      } else if (edit.drawingType === 'strikethrough') {
        ctx.beginPath();
        ctx.moveTo(coords.x, coords.y + h / 2);
        ctx.lineTo(coords.x + w, coords.y + h / 2);
        ctx.stroke();
      } else if (edit.drawingType === 'underline') {
        ctx.beginPath();
        ctx.moveTo(coords.x, coords.y + h);
        ctx.lineTo(coords.x + w, coords.y + h);
        ctx.stroke();
      } else {
        // pen - diagonal stroke as preview
        ctx.beginPath();
        ctx.moveTo(coords.x, coords.y);
        ctx.lineTo(coords.x + w, coords.y + h);
        ctx.stroke();
      }
    }
  };

  const renderImageEdit = (ctx: CanvasRenderingContext2D, edit: PdfEdit, coords: any) => {
    if (!edit.imageData) return;

    const cachedImg = imageCacheRef.current.get(edit.id);
    if (cachedImg && cachedImg.complete && cachedImg.naturalHeight > 0) {
      // Image is cached and loaded
      ctx.globalAlpha = edit.opacity ?? 1;
      try {
        ctx.drawImage(
          cachedImg,
          coords.x,
          coords.y,
          edit.width * zoom,
          edit.height * zoom
        );
      } catch (err) {
        console.log('[PDFCanvas] Error drawing cached image:', err);
      }
      ctx.globalAlpha = 1;
    } else {
      // Fallback: create and load image if not cached
      const img = new Image();
      
      img.onload = () => {
        ctx.globalAlpha = edit.opacity ?? 1;
        try {
          ctx.drawImage(
            img,
            coords.x,
            coords.y,
            edit.width * zoom,
            edit.height * zoom
          );
        } catch (err) {
          console.log('[PDFCanvas] Error drawing fallback image:', err);
        }
        ctx.globalAlpha = 1;
      };

      img.onerror = () => {
        console.log('[PDFCanvas] Failed to load image for edit:', edit.id);
        // Draw placeholder rectangle
        ctx.fillStyle = '#cccccc';
        ctx.fillRect(coords.x, coords.y, edit.width * zoom, edit.height * zoom);
        ctx.strokeStyle = '#999999';
        ctx.lineWidth = 1;
        ctx.strokeRect(coords.x, coords.y, edit.width * zoom, edit.height * zoom);
      };

      img.src = edit.imageData;
    }
  };

  const renderLinkEdit = (ctx: CanvasRenderingContext2D, edit: PdfEdit, coords: any) => {
    // Draw a subtle blue border to indicate it's a link
    ctx.strokeStyle = '#0066cc';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 3]);
    ctx.strokeRect(coords.x, coords.y, edit.width * zoom, edit.height * zoom);
    ctx.setLineDash([]);

    // Show a small link icon
    ctx.fillStyle = '#0066cc';
    ctx.font = 'bold 12px Arial';
    ctx.fillText('🔗', coords.x + 4, coords.y + 16);
  };

  const drawSelectionBox = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number
  ) => {
    // Dashed border
    ctx.strokeStyle = '#007bff';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.strokeRect(x, y, width, height);
    ctx.setLineDash([]);

    // Corner handles
    ctx.fillStyle = '#007bff';
    const handles = [
      { x: x - HANDLE_SIZE / 2, y: y - HANDLE_SIZE / 2 },
      { x: x + width - HANDLE_SIZE / 2, y: y - HANDLE_SIZE / 2 },
      { x: x - HANDLE_SIZE / 2, y: y + height - HANDLE_SIZE / 2 },
      { x: x + width - HANDLE_SIZE / 2, y: y + height - HANDLE_SIZE / 2 },
    ];
    handles.forEach((h) => {
      ctx.fillRect(h.x, h.y, HANDLE_SIZE, HANDLE_SIZE);
    });
  };

  // Get which handle was clicked
  const getHandleAtPoint = (x: number, y: number, rect: any): string | null => {
    const tolerance = HANDLE_SIZE;
    const checks = [
      { name: 'nw', x: rect.x, y: rect.y },
      { name: 'ne', x: rect.x + rect.width, y: rect.y },
      { name: 'sw', x: rect.x, y: rect.y + rect.height },
      { name: 'se', x: rect.x + rect.width, y: rect.y + rect.height },
    ];

    for (const check of checks) {
      if (
        Math.abs(x - check.x) < tolerance &&
        Math.abs(y - check.y) < tolerance
      ) {
        return check.name;
      }
    }
    return null;
  };

  // Mouse down
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!overlayCanvasRef.current) return;

    const rect = overlayCanvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    mouseStateRef.current.isDown = true;
    mouseStateRef.current.startX = x;
    mouseStateRef.current.startY = y;
    mouseStateRef.current.isDragging = false;

    // Check for selection
    const pdfCoords = screenToPdfCoords(x, y, viewportDataRef.current, zoom);
    const clicked = edits.find(
      (e) =>
        e.pageNumber === currentPage &&
        isPointInRect(pdfCoords, {
          x: e.x,
          y: e.y,
          width: e.width,
          height: e.height,
        })
    );

    if (clicked) {
      onSelectEdit?.(clicked.id);

      // Check if clicking on a handle
      const screenCoords = pdfToScreenCoords(clicked.x, clicked.y, viewportDataRef.current, zoom);
      const handle = getHandleAtPoint(x, y, {
        x: screenCoords.x,
        y: screenCoords.y,
        width: clicked.width * zoom,
        height: clicked.height * zoom,
      });

      if (handle) {
        mouseStateRef.current.dragHandle = handle;
      } else {
        // Allow dragging of existing edits regardless of active tool
        mouseStateRef.current.draggedEditId = clicked.id;
        // Store initial position for exact tracking during drag
        mouseStateRef.current.dragInitialX = clicked.x;
        mouseStateRef.current.dragInitialY = clicked.y;
      }
    } else {
      onSelectEdit?.(undefined);

      // Handle drawing tool specially - immediate freehand drawing
      if (activeTool === 'drawing') {
        drawingPathRef.current = [{ x: pdfCoords.x, y: pdfCoords.y }];
        mouseStateRef.current.draggedEditId = 'new';
        mouseStateRef.current.isDragging = true;
      }
      // Other tools require bounding box selection
      else if (['text', 'whiteout', 'shape', 'highlight', 'image', 'signature', 'link'].includes(activeTool)) {
        mouseStateRef.current.draggedEditId = 'new';
      }
    }
  };

  // Mouse move
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!overlayCanvasRef.current) return;

    const rect = overlayCanvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const pdfCoords = screenToPdfCoords(x, y, viewportDataRef.current, zoom);

    // Update hover state for cursor feedback
    if (!mouseStateRef.current.isDown) {
      let newHoverState: any = { isHovering: false };
      
      // Check if hovering over an edit
      const hoverEdit = edits.find(
        (e) =>
          e.pageNumber === currentPage &&
          isPointInRect(pdfCoords, {
            x: e.x,
            y: e.y,
            width: e.width,
            height: e.height,
          })
      );

      if (hoverEdit) {
        const screenCoords = pdfToScreenCoords(hoverEdit.x, hoverEdit.y, viewportDataRef.current, zoom);
        const handle = getHandleAtPoint(x, y, {
          x: screenCoords.x,
          y: screenCoords.y,
          width: hoverEdit.width * zoom,
          height: hoverEdit.height * zoom,
        });

        if (handle) {
          newHoverState = { isHovering: true, handle, editId: hoverEdit.id };
        } else {
          newHoverState = { isHovering: true, editId: hoverEdit.id };
        }
      }

      setHoverState(newHoverState);
    }

    // Only process dragging if mouse is down
    if (!mouseStateRef.current.isDown) return;

    // Handle drawing tool - track points as user draws
    if (activeTool === 'drawing' && mouseStateRef.current.draggedEditId === 'new') {
      drawingPathRef.current.push({ x: pdfCoords.x, y: pdfCoords.y });
      renderEdits();
      return;
    }

    const dx = x - mouseStateRef.current.startX;
    const dy = y - mouseStateRef.current.startY;

    // Check if we've started dragging
    if (!mouseStateRef.current.isDragging && (Math.abs(dx) > 3 || Math.abs(dy) > 3)) {
      mouseStateRef.current.isDragging = true;
    }

    if (!mouseStateRef.current.isDragging) return;

    const startPdfCoords = screenToPdfCoords(
      mouseStateRef.current.startX,
      mouseStateRef.current.startY,
      viewportDataRef.current,
      zoom
    );

    // Handle edit movement/resizing
    if (mouseStateRef.current.draggedEditId && mouseStateRef.current.draggedEditId !== 'new') {
      const edit = edits.find((e) => e.id === mouseStateRef.current.draggedEditId);
      if (!edit) return;

      if (mouseStateRef.current.dragHandle) {
        // Resizing from handle
        handleResizeEdit(edit, mouseStateRef.current.dragHandle, pdfCoords, startPdfCoords);
      } else {
        // Moving edit - calculate delta from initial position to current position
        // This ensures the element follows the mouse exactly without accumulation
        const deltaX = pdfCoords.x - startPdfCoords.x;
        const deltaY = pdfCoords.y - startPdfCoords.y;
        onUpdateEdit?.(edit.id, {
          x: Math.max(0, (mouseStateRef.current.dragInitialX || edit.x) + deltaX),
          y: Math.max(0, (mouseStateRef.current.dragInitialY || edit.y) + deltaY),
        });
      }
    } else if (mouseStateRef.current.draggedEditId === 'new') {
      // Create new edit box
      // This will be handled in mouse up
    }

    // Update canvas for visual feedback
    renderEdits();
  };

  // Mouse up
  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!overlayCanvasRef.current) return;

    const rect = overlayCanvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Handle new edit creation
    if (
      mouseStateRef.current.isDragging &&
      mouseStateRef.current.draggedEditId === 'new'
    ) {
      const pdfStart = screenToPdfCoords(
        mouseStateRef.current.startX,
        mouseStateRef.current.startY,
        viewportDataRef.current,
        zoom
      );
      const pdfEnd = screenToPdfCoords(x, y, viewportDataRef.current, zoom);

      const rect = normalizeBox(pdfStart.x, pdfStart.y, pdfEnd.x, pdfEnd.y);

      // Handle drawing tool - create edit with collected path points
      if (activeTool === 'drawing' && drawingPathRef.current.length > 5) {
        // Calculate bounds from path points
        const xCoords = drawingPathRef.current.map(p => p.x);
        const yCoords = drawingPathRef.current.map(p => p.y);
        const minX = Math.min(...xCoords);
        const maxX = Math.max(...xCoords);
        const minY = Math.min(...yCoords);
        const maxY = Math.max(...yCoords);
        const width = maxX - minX + 10;
        const height = maxY - minY + 10;

        const newEdit: PdfEdit = {
          id: `edit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          type: 'drawing',
          pageNumber: currentPage,
          x: minX - 5,
          y: minY - 5,
          width: width,
          height: height,
          zIndex: 1000,
          opacity: 1,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          drawingType: drawingType as any,
          strokeColor: strokeColor,
          strokeWidth: strokeWidth,
          points: drawingPathRef.current,
        };

        onAddEdit?.(newEdit);
        drawingPathRef.current = [];
      }
      // Handle other tools - create edit with bounding box
      else if (rect.width > MIN_EDIT_SIZE && rect.height > MIN_EDIT_SIZE) {
        console.log('[PDFCanvas] Creating new edit. activeTool:', activeTool, 'currentImageData length:', currentImageData?.length || 0);
        
        const newEdit: PdfEdit = {
          id: `edit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          type: (activeTool as any) || 'text',
          pageNumber: currentPage,
          x: rect.x,
          y: rect.y,
          width: rect.width,
          height: rect.height,
          zIndex: 1000,
          opacity: 1,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          ...(activeTool === 'text' && { text: '', fontSize: 12, fontColor: '#000000' }),
          ...(activeTool === 'whiteout' && {}),
          ...(activeTool === 'highlight' && { fillColor: highlightColor }),
          ...(activeTool === 'shape' && {
            shapeType: shapeType as any,
            strokeColor: strokeColor,
            strokeWidth: strokeWidth,
          }),
          ...(activeTool === 'image' && {
            imageData: currentImageData,
          }),
          ...(activeTool === 'signature' && {
            imageData: currentImageData,
          }),
          ...(activeTool === 'link' && {
            url: '',
            linkType: 'external',
          }),
        };

        console.log('[PDFCanvas] Calling onAddEdit with:', newEdit);
        onAddEdit?.(newEdit);
      }
    }

    mouseStateRef.current.isDown = false;
    mouseStateRef.current.isDragging = false;
    mouseStateRef.current.draggedEditId = undefined;
    mouseStateRef.current.dragHandle = undefined;
    mouseStateRef.current.dragInitialX = undefined;
    mouseStateRef.current.dragInitialY = undefined;
    mouseStateRef.current.startX = 0;
    mouseStateRef.current.startY = 0;
    
    // Clear hover state
    setHoverState({ isHovering: false });
  };

  // Handle resize from corner
  const handleResizeEdit = (
    edit: PdfEdit,
    handle: string,
    pdfCoords: any,
    startPdfCoords: any
  ) => {
    const deltaX = pdfCoords.x - startPdfCoords.x;
    const deltaY = pdfCoords.y - startPdfCoords.y;

    let newX = edit.x;
    let newY = edit.y;
    let newWidth = edit.width;
    let newHeight = edit.height;

    if (handle.includes('n')) {
      newY = edit.y + deltaY;
      newHeight = edit.height - deltaY;
    }
    if (handle.includes('s')) {
      newHeight = edit.height + deltaY;
    }
    if (handle.includes('w')) {
      newX = edit.x + deltaX;
      newWidth = edit.width - deltaX;
    }
    if (handle.includes('e')) {
      newWidth = edit.width + deltaX;
    }

    // Enforce minimum size
    if (newWidth < MIN_EDIT_SIZE) {
      newWidth = MIN_EDIT_SIZE;
      if (handle.includes('w')) {
        newX = edit.x + edit.width - newWidth;
      }
    }
    if (newHeight < MIN_EDIT_SIZE) {
      newHeight = MIN_EDIT_SIZE;
      if (handle.includes('n')) {
        newY = edit.y + edit.height - newHeight;
      }
    }

    onUpdateEdit?.(edit.id, {
      x: newX,
      y: newY,
      width: newWidth,
      height: newHeight,
    });
  };

  // Re-render when edits change
  useEffect(() => {
    console.log('[PDFCanvas] renderEdits useEffect triggered');
    renderEdits();
  }, [renderEdits]);

  return (
    <div ref={containerRef} className="relative flex-1 overflow-auto bg-gray-950 flex items-center justify-center">
      <div className="relative">
        <canvas
          ref={canvasRef}
          className="border border-gray-700 shadow-2xl"
          style={{ display: 'block' }}
        />
        <div
          ref={textOverlayContainerRef}
          className="absolute top-0 left-0 pointer-events-auto"
          style={{ pointerEvents: 'auto' }}
        />
        {/* Text input for inline editing */}
        {editingTextId && (
          <input
            ref={textInputRef}
            type="text"
            value={editedTexts[editingTextId] || extractedText.find(t => t.id === editingTextId)?.text || ''}
            onChange={(e) => onTextEditChange?.(editingTextId, e.target.value)}
            className="absolute z-20 px-2 py-1 border-2 border-blue-500 bg-white text-black focus:outline-none"
            style={{
              left: `${(() => {
                const item = extractedText.find(t => t.id === editingTextId);
                if (!item) return 0;
                const coords = pdfToScreenCoords(item.x, item.y, viewportDataRef.current, zoom);
                return coords.x;
              })()}px`,
              top: `${(() => {
                const item = extractedText.find(t => t.id === editingTextId);
                if (!item) return 0;
                const coords = pdfToScreenCoords(item.x, item.y, viewportDataRef.current, zoom);
                return coords.y;
              })()}px`,
              width: `${(() => {
                const item = extractedText.find(t => t.id === editingTextId);
                if (!item) return 100;
                return item.width * zoom;
              })()}px`,
              height: `${(() => {
                const item = extractedText.find(t => t.id === editingTextId);
                if (!item) return 20;
                return Math.max(item.height * zoom, 24);
              })()}px`,
            }}
            onKeyDown={handleTextInputKeyDown}
            onBlur={handleTextInputBlur}
            autoFocus
          />
        )}
        <canvas
          ref={overlayCanvasRef}
          className={`absolute top-0 left-0 ${
            mouseStateRef.current.isDragging 
              ? 'cursor-grabbing' 
              : hoverState.handle
              ? hoverState.handle.includes('n') && hoverState.handle.includes('w') ? 'cursor-nwse-resize'
                : hoverState.handle.includes('n') && hoverState.handle.includes('e') ? 'cursor-nesw-resize'
                : hoverState.handle.includes('s') && hoverState.handle.includes('w') ? 'cursor-nesw-resize'
                : hoverState.handle.includes('s') && hoverState.handle.includes('e') ? 'cursor-nwse-resize'
                : hoverState.handle.includes('n') || hoverState.handle.includes('s') ? 'cursor-ns-resize'
                : hoverState.handle.includes('e') || hoverState.handle.includes('w') ? 'cursor-ew-resize'
                : 'cursor-grab'
              : hoverState.isHovering 
              ? 'cursor-grab'
              : activeTool === 'drawing' ? 'cursor-crosshair'
              : activeTool === 'select' ? 'cursor-pointer'
              : 'cursor-crosshair'
          }`}
          style={{ display: 'block' }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        />
      </div>
    </div>
  );
};

// Memoize with custom comparison to prevent unnecessary re-renders
export default memo(PDFCanvasComponent, (prevProps, nextProps) => {
  // Re-render only if these specific props change
  const keysToCompare: (keyof Props)[] = [
    'pdfDoc',
    'currentPage',
    'zoom',
    'edits',
    'selectedEditId',
    'activeTool',
    'shapeType',
    'drawingType',
    'strokeColor',
    'strokeWidth',
    'highlightColor',
    'currentImageData',
    'extractedText',      // ADD THIS
    'editedTexts',        // ADD THIS
    'editingTextId',      // ADD THIS
  ];

  for (const key of keysToCompare) {
    if (prevProps[key] !== nextProps[key]) {
      return false; // Props changed, re-render
    }
  }

  return true; // Props unchanged, skip re-render
});
