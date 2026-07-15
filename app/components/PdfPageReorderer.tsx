'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronUp, ChevronDown, RotateCcw, AlertCircle, Loader } from 'lucide-react';

interface PageItem {
  index: number;
  preview: string; // base64 canvas image
}

interface PdfPageReordererProps {
  pdfFile?: File;
  onReorder: (pageOrder: number[]) => void;
  onTotalPagesChange: (total: number) => void;
}

export const PdfPageReorderer: React.FC<PdfPageReordererProps> = ({
  pdfFile,
  onReorder,
  onTotalPagesChange,
}) => {
  const [pages, setPages] = useState<PageItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const onReorderRef = useRef(onReorder);
  const onTotalPagesChangeRef = useRef(onTotalPagesChange);

  // Update refs when callbacks change
  useEffect(() => {
    onReorderRef.current = onReorder;
    onTotalPagesChangeRef.current = onTotalPagesChange;
  }, [onReorder, onTotalPagesChange]);

  // Extract PDF pages
  useEffect(() => {
    if (!pdfFile) return;

    const extractPages = async () => {
      setLoading(true);
      setError('');
      try {
        const pdfjsLib = await import('pdfjs-dist');
        pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.js';

        const arrayBuffer = await pdfFile.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        const pdf = await pdfjsLib.getDocument({ data: uint8Array }).promise;
        
        const totalPages = pdf.numPages;
        onTotalPagesChangeRef.current(totalPages);

        const extractedPages: PageItem[] = [];
        
        // Only extract first 5 pages for preview
        const pageLimit = Math.min(5, totalPages);
        
        for (let i = 1; i <= pageLimit; i++) {
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: 0.5 });
          
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          if (!context) throw new Error('Canvas context not available');
          
          canvas.height = viewport.height;
          canvas.width = viewport.width;
          
          await page.render({
            canvasContext: context,
            viewport: viewport,
          }).promise;
          
          const preview = canvas.toDataURL('image/jpeg', 0.7);
          extractedPages.push({
            index: i - 1, // 0-based
            preview,
          });
        }

        // Create initial page order (0, 1, 2, ...)
        const initialOrder = Array.from({ length: totalPages }, (_, i) => i);
        setPages(extractedPages);
        
        // Call onReorder with initial order
        onReorderRef.current(initialOrder);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to extract pages';
        setError(`Error extracting PDF: ${message}`);
        console.error('[PDF PageReorderer] Error:', err);
      } finally {
        setLoading(false);
      }
    };

    extractPages();
  }, [pdfFile]);

  // Get current page order based on visual order
  const getCurrentPageOrder = () => {
    return pages.map(p => p.index);
  };

  // Move page up
  const movePageUp = (displayIndex: number) => {
    if (displayIndex === 0) return;
    
    const newPages = [...pages];
    [newPages[displayIndex - 1], newPages[displayIndex]] = [
      newPages[displayIndex],
      newPages[displayIndex - 1],
    ];
    setPages(newPages);
    onReorderRef.current(newPages.map(p => p.index));
  };

  // Move page down
  const movePageDown = (displayIndex: number) => {
    if (displayIndex === pages.length - 1) return;
    
    const newPages = [...pages];
    [newPages[displayIndex], newPages[displayIndex + 1]] = [
      newPages[displayIndex + 1],
      newPages[displayIndex],
    ];
    setPages(newPages);
    onReorderRef.current(newPages.map(p => p.index));
  };

  // Handle drag and drop
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === dropIndex) return;

    const newPages = [...pages];
    const draggedPage = newPages[draggedIndex];
    newPages.splice(draggedIndex, 1);
    newPages.splice(dropIndex, 0, draggedPage);
    
    setPages(newPages);
    setDraggedIndex(null);
    onReorderRef.current(newPages.map(p => p.index));
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  // Reset to original order
  const resetOrder = () => {
    const newPages = pages.sort((a, b) => a.index - b.index);
    setPages([...newPages]);
    onReorderRef.current(newPages.map(p => p.index));
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-blue-50 rounded-xl border-2 border-blue-200">
        <Loader className="w-8 h-8 text-blue-600 mb-3 animate-spin" />
        <p className="text-sm font-medium text-blue-900">Extracting PDF pages...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl flex gap-3">
        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-medium text-red-900">Error</p>
          <p className="text-sm text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  if (pages.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700">
          Reorder Pages (Preview)
        </h3>
        <button
          type="button"
          onClick={resetOrder}
          className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
        >
          <RotateCcw size={14} />
          Reset
        </button>
      </div>

      <div
        ref={containerRef}
        className="space-y-2 bg-gray-50 p-4 rounded-xl border border-gray-200"
      >
        {pages.map((page, displayIndex) => (
          <div
            key={`${page.index}-${displayIndex}`}
            draggable
            onDragStart={(e) => handleDragStart(e, displayIndex)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, displayIndex)}
            onDragEnd={handleDragEnd}
            className={`flex items-center gap-3 p-3 bg-white rounded-lg border-2 transition cursor-move ${
              draggedIndex === displayIndex
                ? 'border-purple-500 opacity-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            {/* Preview */}
            <div className="flex-shrink-0">
              <img
                src={page.preview}
                alt={`Page ${page.index + 1}`}
                className="w-12 h-16 object-cover rounded border border-gray-300"
              />
            </div>

            {/* Page info */}
            <div className="flex-1 text-sm">
              <p className="font-medium text-gray-900">Page {page.index + 1}</p>
              <p className="text-xs text-gray-500">Position {displayIndex + 1}</p>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-1 flex-shrink-0">
              <button
                type="button"
                onClick={() => movePageUp(displayIndex)}
                disabled={displayIndex === 0}
                className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded disabled:opacity-30 disabled:cursor-not-allowed transition"
                title="Move up"
              >
                <ChevronUp size={18} />
              </button>
              <button
                type="button"
                onClick={() => movePageDown(displayIndex)}
                disabled={displayIndex === pages.length - 1}
                className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded disabled:opacity-30 disabled:cursor-not-allowed transition"
                title="Move down"
              >
                <ChevronDown size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {pages.length < 5 && pages.length > 0 && (
        <p className="text-xs text-gray-500 text-center">
          Showing first {pages.length} pages. All {pages.length} pages will be rearranged.
        </p>
      )}
    </div>
  );
};

export default PdfPageReorderer;
