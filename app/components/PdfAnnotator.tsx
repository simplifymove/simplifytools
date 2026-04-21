'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Highlighter, Type, Trash2, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';

// Lazy load pdfjs-dist only in browser
let pdfjsLib: any = null;
const initPdfJs = async () => {
  if (!pdfjsLib && typeof window !== 'undefined') {
    try {
      pdfjsLib = await import('pdfjs-dist');
      pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
    } catch (error) {
      console.error('Failed to load pdfjs-dist:', error);
    }
  }
  return pdfjsLib;
};

interface Annotation {
  id: string;
  type: 'highlight' | 'underline' | 'strikethrough' | 'freehand' | 'text' | 'comment';
  page: number;
  color: string;
  opacity: number;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  text?: string;
  points?: Array<{ x: number; y: number }>;
  createdAt: number;
}

interface Props {
  file: File;
  onAnnotationsChange?: (annotations: Annotation[]) => void;
}

export default function PdfAnnotator({ file, onAnnotationsChange }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pdfDocRef = useRef<any>(null);
  const renderTaskRef = useRef<any | null>(null);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [selectedTool, setSelectedTool] = useState<Annotation['type']>('highlight');
  const [selectedColor, setSelectedColor] = useState('#FFFF00');
  const [selectedOpacity, setSelectedOpacity] = useState(0.5);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [textInputValue, setTextInputValue] = useState('');
  const [showTextModal, setShowTextModal] = useState(false);
  const drawingPathRef = useRef<Array<{ x: number; y: number }>>([]);

  // Render canvas - simple, direct function
  const renderCanvas = async (pageNumber: number, zoomLevel: number): Promise<void> => {
    if (!pdfDocRef.current || !canvasRef.current) {
      throw new Error('PDF document or canvas not available');
    }

    console.log(`🖼️ renderCanvas called: page=${pageNumber}, zoom=${zoomLevel}`);

    // Cancel any pending render
    if (renderTaskRef.current) {
      try {
        renderTaskRef.current.cancel();
      } catch {
        // Ignore
      }
    }

    try {
      const page = await pdfDocRef.current.getPage(pageNumber);
      const viewport = page.getViewport({ scale: zoomLevel });
      const canvas = canvasRef.current;

      console.log(`📐 Viewport: width=${viewport.width}, height=${viewport.height}, scale=${zoomLevel}`);

      // Resize canvas internal resolution to match PDF page at current zoom
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      
      // Set display size to match internal resolution
      // This ensures the canvas displays at the correct size with the zoom applied
      canvas.style.width = `${viewport.width}px`;
      canvas.style.height = `${viewport.height}px`;

      const context = canvas.getContext('2d');
      if (!context) throw new Error('Failed to get 2D context');

      // Clear and render
      context.clearRect(0, 0, canvas.width, canvas.height);

      const renderTask = page.render({
        canvasContext: context,
        viewport: viewport,
      } as any);

      renderTaskRef.current = renderTask;
      await renderTask.promise;
      renderTaskRef.current = null;

      console.log(`✅ PDF rendered successfully at zoom ${zoomLevel}x`);

      // Redraw annotations on top of newly rendered page
      redrawAnnotations(pageNumber);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (!msg.includes('Rendering cancelled')) {
        console.error(`❌ renderCanvas error: ${msg}`);
        throw err;
      }
    }
  };

  // Load PDF and render - only runs when file changes
  useEffect(() => {
    if (!file) {
      setLoading(false);
      return;
    }

    let isMounted = true;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('1. Starting load for:', file.name);

        // Get file as buffer
        const arrayBuffer = await file.arrayBuffer();
        console.log('2. Got arrayBuffer, size:', arrayBuffer.byteLength);

        if (!isMounted) return;

        // Load PDF with pdfjs
        console.log('3. Loading PDF with pdfjsLib...');
        const pdfjs = await initPdfJs();
        if (!pdfjs) {
          throw new Error('Failed to initialize PDF.js');
        }
        const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
        console.log('4. PDF loaded, pages:', pdf.numPages);

        if (!isMounted) return;

        // Store PDF in ref
        pdfDocRef.current = pdf;
        console.log('5. PDF stored in ref');

        // Just set state - let the page/zoom effect render once canvas is mounted
        console.log('18. Setting state - totalPages:', pdf.numPages);
        setTotalPages(pdf.numPages);
        setCurrentPage(1);
        setLoading(false);
        console.log('19. SUCCESS - PDF loaded, canvas will render next');
      } catch (err) {
        console.error('ERROR:', err);
        if (err instanceof Error) {
          console.error('Message:', err.message);
        }
        if (isMounted) {
          setError((err instanceof Error ? err.message : 'Failed to load PDF'));
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      isMounted = false;
    };
  }, [file]);

  // Re-render when page/zoom changes
  useEffect(() => {
    if (pdfDocRef.current && !loading && totalPages > 0) {
      console.log(`🔄 Re-render effect triggered: page=${currentPage}, zoom=${zoom}`);
      renderCanvas(currentPage, zoom).catch((err) => {
        console.error('🔴 Canvas render failed:', err);
        setError('Failed to render page');
      });
    }
  }, [currentPage, zoom, loading, totalPages]);

  const redrawAnnotations = (pageNum: number, annotationsToRender?: Annotation[]) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Use passed annotations or fall back to state
      const annotationsToDisplay = annotationsToRender ?? annotations;
      const pageAnnotations = annotationsToDisplay.filter((ann) => ann.page === pageNum);

      pageAnnotations.forEach((ann) => {
        try {
          if (ann.type === 'highlight' && ann.x !== undefined && ann.y !== undefined && ann.width && ann.height) {
            ctx.fillStyle = ann.color + Math.round(ann.opacity * 255).toString(16).padStart(2, '0');
            ctx.fillRect(ann.x, ann.y, ann.width, ann.height);
          } else if (ann.type === 'underline' && ann.x !== undefined && ann.y !== undefined && ann.width) {
            ctx.strokeStyle = ann.color;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(ann.x, ann.y + (ann.height || 0));
            ctx.lineTo(ann.x + ann.width, ann.y + (ann.height || 0));
            ctx.stroke();
          } else if (ann.type === 'strikethrough' && ann.x !== undefined && ann.y !== undefined && ann.width) {
            ctx.strokeStyle = ann.color;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(ann.x, ann.y + (ann.height || 0) / 2);
            ctx.lineTo(ann.x + ann.width, ann.y + (ann.height || 0) / 2);
            ctx.stroke();
          } else if (ann.type === 'freehand' && ann.points) {
            ctx.strokeStyle = ann.color;
            ctx.lineWidth = 2;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.globalAlpha = ann.opacity;
            
            if (ann.points.length > 0) {
              ctx.beginPath();
              ctx.moveTo(ann.points[0].x, ann.points[0].y);
              for (let i = 1; i < ann.points.length; i++) {
                ctx.lineTo(ann.points[i].x, ann.points[i].y);
              }
              ctx.stroke();
            }
            ctx.globalAlpha = 1;
          } else if (ann.type === 'text' && ann.x !== undefined && ann.y !== undefined && ann.text) {
            ctx.fillStyle = ann.color;
            ctx.font = 'bold 14px Arial';
            ctx.fillText(ann.text, ann.x, ann.y);
          }
        } catch (err) {
          // Skip individual annotation rendering errors
          console.warn('Error drawing annotation:', err);
        }
      });
    } catch (error: unknown) {
      console.error('Error in redrawAnnotations:', error);
    }
  };

  // Helper to get consistent scale from canvas bounding rect
  const getCanvasScale = (): { scaleX: number; scaleY: number } => {
    if (!canvasRef.current) return { scaleX: 1, scaleY: 1 };
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    return {
      scaleX: canvas.width / rect.width,
      scaleY: canvas.height / rect.height,
    };
  };

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;

    const { scaleX, scaleY } = getCanvasScale();

    // offsetX/offsetY are relative to canvas, scale to internal coordinates
    const x = e.nativeEvent.offsetX * scaleX;
    const y = e.nativeEvent.offsetY * scaleY;

    setIsDrawing(true);
    setStartX(x);
    setStartY(y);
    drawingPathRef.current = [{ x, y }];
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !canvasRef.current) return;

    const { scaleX, scaleY } = getCanvasScale();
    
    const x = e.nativeEvent.offsetX * scaleX;
    const y = e.nativeEvent.offsetY * scaleY;

    if (selectedTool === 'freehand') {
      drawingPathRef.current.push({ x, y });
      
      // Redraw annotations without interfering with main render
      try {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (ctx && drawingPathRef.current.length > 1) {
          // Draw only the new line segment
          ctx.strokeStyle = selectedColor;
          ctx.lineWidth = 2;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          ctx.globalAlpha = selectedOpacity;
          ctx.beginPath();
          ctx.moveTo(drawingPathRef.current[drawingPathRef.current.length - 2].x, drawingPathRef.current[drawingPathRef.current.length - 2].y);
          ctx.lineTo(x, y);
          ctx.stroke();
          ctx.globalAlpha = 1;
        }
      } catch {
        // Ignore canvas errors during drawing
      }
    }
  };

  const handleCanvasMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !canvasRef.current) return;

    const { scaleX, scaleY } = getCanvasScale();
    
    const endX = e.nativeEvent.offsetX * scaleX;
    const endY = e.nativeEvent.offsetY * scaleY;

    const width = Math.abs(endX - startX);
    const height = Math.abs(endY - startY);
    const minX = Math.min(startX, endX);
    const minY = Math.min(startY, endY);

    if (width > 5 || height > 5) {
      try {
        const newAnnotation: Annotation = {
          id: Date.now().toString(),
          type: selectedTool,
          page: currentPage,
          color: selectedColor,
          opacity: selectedOpacity,
          x: minX,
          y: minY,
          width: width,
          height: height,
          points: selectedTool === 'freehand' ? drawingPathRef.current : undefined,
          createdAt: Date.now(),
        };

        const newAnnotations = [...annotations, newAnnotation];
        setAnnotations(newAnnotations);
        onAnnotationsChange?.(newAnnotations);
        
        // Immediately redraw with new annotations (don't wait for state update)
        redrawAnnotations(currentPage, newAnnotations);
      } catch (err: unknown) {
        console.error('Error creating annotation:', err);
      }
    }

    setIsDrawing(false);
  };

  const handleAddTextAnnotation = () => {
    setShowTextModal(true);
  };

  const handleTextModalConfirm = () => {
    if (textInputValue.trim()) {
      const newAnnotation: Annotation = {
        id: Date.now().toString(),
        type: 'text',
        page: currentPage,
        color: selectedColor,
        opacity: selectedOpacity,
        x: 50,
        y: 50,
        text: textInputValue,
        createdAt: Date.now(),
      };

      try {
        const newAnnotations = [...annotations, newAnnotation];
        setAnnotations(newAnnotations);
        onAnnotationsChange?.(newAnnotations);
        
        // Immediately redraw with new annotations (don't wait for state update)
        redrawAnnotations(currentPage, newAnnotations);
      } catch (err: unknown) {
        console.error('Error adding text annotation:', err);
      }
    }
    setShowTextModal(false);
    setTextInputValue('');
  };

  const handleTextModalCancel = () => {
    setShowTextModal(false);
    setTextInputValue('');
  };

  const handleDeleteAnnotation = (id: string) => {
    try {
      const newAnnotations = annotations.filter((ann) => ann.id !== id);
      setAnnotations(newAnnotations);
      onAnnotationsChange?.(newAnnotations);
      
      // Immediately redraw with new annotations (don't wait for state update)
      redrawAnnotations(currentPage, newAnnotations);
    } catch (err) {
      console.error('Error deleting annotation:', err);
    }
  };

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages, prev + 1));
  };

  const handleZoomIn = () => {
    setZoom((prev) => {
      const newZoom = Math.min(3, prev + 0.25);
      console.log(`🔍 Zoom in: ${prev} → ${newZoom}`);
      return newZoom;
    });
  };

  const handleZoomOut = () => {
    setZoom((prev) => {
      const newZoom = Math.max(0.5, prev - 0.25);
      console.log(`🔍 Zoom out: ${prev} → ${newZoom}`);
      return newZoom;
    });
  };

  return (
    <div className="w-full h-full flex flex-col bg-gray-100">
      {/* Toolbar */}
      <div className="bg-white border-b border-gray-300 p-4 flex gap-4 flex-wrap items-center">
        {/* Tool Selection */}
        <div className="flex gap-2">
          <button
            onClick={() => setSelectedTool('highlight')}
            className={`px-3 py-2 rounded flex items-center gap-2 ${
              selectedTool === 'highlight' ? 'bg-blue-500 text-white' : 'bg-gray-200'
            }`}
            title="Highlight"
          >
            <Highlighter size={18} />
            Highlight
          </button>
          <button
            onClick={() => setSelectedTool('underline')}
            className={`px-3 py-2 rounded ${selectedTool === 'underline' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            title="Underline"
          >
            Underline
          </button>
          <button
            onClick={() => setSelectedTool('strikethrough')}
            className={`px-3 py-2 rounded ${selectedTool === 'strikethrough' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            title="Strikethrough"
          >
            Strikethrough
          </button>
          <button
            onClick={() => setSelectedTool('freehand')}
            className={`px-3 py-2 rounded ${selectedTool === 'freehand' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            title="Freehand Drawing"
          >
            Draw
          </button>
          <button
            onClick={handleAddTextAnnotation}
            className="px-3 py-2 rounded bg-gray-200 hover:bg-gray-300 flex items-center gap-2"
            title="Add Text"
          >
            <Type size={18} />
            Text
          </button>
        </div>

        {/* Color & Opacity */}
        <div className="flex gap-4 items-center">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Color:</label>
            <input
              type="color"
              value={selectedColor}
              onChange={(e) => setSelectedColor(e.target.value)}
              className="w-10 h-10 rounded cursor-pointer"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Opacity:</label>
            <input
              type="range"
              min="0.1"
              max="1"
              step="0.1"
              value={selectedOpacity}
              onChange={(e) => setSelectedOpacity(parseFloat(e.target.value))}
              className="w-24"
            />
            <span className="text-sm">{Math.round(selectedOpacity * 100)}%</span>
          </div>
        </div>

        {/* Zoom & Navigation */}
        <div className="flex gap-2 ml-auto">
          <button
            onClick={handleZoomOut}
            className="px-3 py-2 rounded bg-gray-200 hover:bg-gray-300 flex items-center gap-2"
            title="Zoom Out"
          >
            <ZoomOut size={18} />
          </button>
          <span className="px-3 py-2 bg-gray-100 rounded">{Math.round(zoom * 100)}%</span>
          <button
            onClick={handleZoomIn}
            className="px-3 py-2 rounded bg-gray-200 hover:bg-gray-300 flex items-center gap-2"
            title="Zoom In"
          >
            <ZoomIn size={18} />
          </button>
        </div>
      </div>

      {/* Canvas Area */}
      <div className="flex-1 overflow-auto bg-gray-200 p-4">
        {error && (
          <div className="text-center">
            <div className="text-red-600 font-bold text-lg mb-2">❌ Error Loading PDF</div>
            <p className="text-red-500">{error}</p>
          </div>
        )}
        {loading && !error && (
          <div className="text-center">
            <div className="text-gray-600 font-bold text-lg mb-2">📄 Loading PDF...</div>
            <div className="w-12 h-12 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin mx-auto"></div>
          </div>
        )}
        {!loading && !error && (
          <canvas
            ref={canvasRef}
            onMouseDown={handleCanvasMouseDown}
            onMouseMove={handleCanvasMouseMove}
            onMouseUp={handleCanvasMouseUp}
            onMouseLeave={handleCanvasMouseUp}
            className="bg-white shadow-lg cursor-crosshair block mx-auto"
          />
        )}
      </div>

      {/* Bottom Controls */}
      <div className="bg-white border-t border-gray-300 p-4 flex gap-4 justify-between items-center">
        <div className="flex gap-4 items-center">
          <button
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
            className="px-3 py-2 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50 flex items-center gap-2"
          >
            <ChevronLeft size={18} />
            Previous
          </button>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="1"
              max={totalPages}
              value={currentPage}
              onChange={(e) => setCurrentPage(Math.min(totalPages, Math.max(1, parseInt(e.target.value) || 1)))}
              className="w-12 px-2 py-1 border rounded"
            />
            <span className="text-sm">/ {totalPages} pages</span>
          </div>
          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className="px-3 py-2 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50 flex items-center gap-2"
          >
            Next
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Annotations List */}
        <div className="flex gap-2 overflow-x-auto max-w-md">
          {annotations
            .filter((ann) => ann.page === currentPage)
            .map((ann) => (
              <div
                key={ann.id}
                className="px-3 py-2 bg-gray-100 rounded flex items-center gap-2 whitespace-nowrap"
              >
                <div className="w-4 h-4 rounded" style={{ backgroundColor: ann.color }}></div>
                <span className="text-sm">{ann.type}</span>
                <button
                  onClick={() => handleDeleteAnnotation(ann.id)}
                  className="ml-2 text-red-500 hover:text-red-700"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
        </div>
      </div>

      {/* Total Annotations Count */}
      <div className="bg-gray-50 border-t border-gray-300 px-4 py-2 text-sm text-gray-600">
        Total Annotations: {annotations.length}
      </div>

      {/* Text Input Modal */}
      {showTextModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-96 max-w-full">
            <h3 className="text-lg font-semibold mb-4">Add Text Annotation</h3>
            <input
              type="text"
              value={textInputValue}
              onChange={(e) => setTextInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleTextModalConfirm();
                if (e.key === 'Escape') handleTextModalCancel();
              }}
              placeholder="Enter annotation text..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
              autoFocus
            />
            <div className="flex gap-3 justify-end">
              <button
                onClick={handleTextModalCancel}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleTextModalConfirm}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
