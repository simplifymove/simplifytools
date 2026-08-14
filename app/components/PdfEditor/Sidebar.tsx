'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { PdfEdit } from '@/app/types/pdf-editor';
import { Trash2, Copy, Eye, EyeOff } from 'lucide-react';

interface Props {
  pdfDoc: any;
  currentPage: number;
  totalPages: number;
  edits: PdfEdit[];
  selectedEditId?: string;
  zoom: number;
  onPageChange?: (page: number) => void;
  onSelectEdit?: (id: string | undefined) => void;
  onDeleteEdit?: (id: string) => void;
  onDuplicateEdit?: (id: string) => void;
}

interface Thumbnail {
  page: number;
  canvas: HTMLCanvasElement;
}

export default function Sidebar({
  pdfDoc,
  currentPage,
  totalPages,
  edits,
  selectedEditId,
  zoom,
  onPageChange,
  onSelectEdit,
  onDeleteEdit,
  onDuplicateEdit,
}: Props) {
  const [thumbnails, setThumbnails] = useState<Map<number, HTMLCanvasElement>>(new Map());
  const [visibleEdits, setVisibleEdits] = useState<Set<string>>(new Set());
  const [scrollY, setScrollY] = useState(0);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const editsContainerRef = useRef<HTMLDivElement>(null);

  // Virtual scrolling constants
  const ITEM_HEIGHT = 70; // Height of each edit item in pixels
  const VISIBLE_ITEMS = 5; // Show approximately 5 items at a time

  // Calculate which items to render (virtual scrolling)
  const visibleRange = useMemo(() => {
    const startIndex = Math.floor(scrollY / ITEM_HEIGHT);
    const endIndex = Math.ceil((scrollY + VISIBLE_ITEMS * ITEM_HEIGHT) / ITEM_HEIGHT);
    return { startIndex, endIndex };
  }, [scrollY]);

  // Handle scroll for virtual scrolling
  const handleEditsScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    setScrollY(target.scrollTop);
  }, []);

  // Generate thumbnails
  useEffect(() => {
    const generateThumbnails = async () => {
      if (!pdfDoc) return;

      const newThumbnails = new Map<number, HTMLCanvasElement>();

      for (let i = 1; i <= Math.min(totalPages, 10); i++) {
        try {
          const page = await pdfDoc.getPage(i);
          const viewport = page.getViewport({ scale: 0.15 });

          const canvas = document.createElement('canvas');
          canvas.width = viewport.width;
          canvas.height = viewport.height;

          const context = canvas.getContext('2d');
          if (!context) continue;

          await page.render({
            canvasContext: context,
            viewport: viewport,
          }).promise;

          newThumbnails.set(i, canvas);
        } catch (err) {
          console.error(`Failed to generate thumbnail for page ${i}:`, err);
        }
      }

      setThumbnails(newThumbnails);
    };

    generateThumbnails();
  }, [pdfDoc, totalPages]);

  // Get edits for current page
  const currentPageEdits = edits.filter((e) => e.pageNumber === currentPage);

  // Toggle edit visibility
  const toggleEditVisibility = (editId: string) => {
    const newVisible = new Set(visibleEdits);
    if (newVisible.has(editId)) {
      newVisible.delete(editId);
    } else {
      newVisible.add(editId);
    }
    setVisibleEdits(newVisible);
  };

  // Get edit description
  const getEditDescription = (edit: PdfEdit) => {
    switch (edit.type) {
      case 'text':
        return `Text: "${(edit.text || '').substring(0, 20)}${(edit.text || '').length > 20 ? '...' : ''}"`;
      case 'whiteout':
        return 'Whiteout';
      case 'highlight':
        return 'Highlight';
      case 'shape':
        return `Shape: ${edit.shapeType}`;
      case 'image':
        return 'Image';
      case 'signature':
        return 'Signature';
      case 'drawing':
        return `Drawing: ${edit.drawingType}`;
      case 'link':
        return 'Link';
      case 'form':
        return 'Form Field';
      default:
        return 'Edit';
    }
  };

  return (
    <div
      ref={sidebarRef}
      className="w-48 bg-gray-800 border-r border-gray-700 flex flex-col overflow-hidden"
    >
      {/* Thumbnails Section */}
      <div className="flex-1 overflow-y-auto border-b border-gray-700 p-3">
        <h3 className="text-xs font-semibold text-gray-400 uppercase mb-3">Pages</h3>
        <div className="space-y-2">
          {Array.from({ length: totalPages }).map((_, i) => {
            const page = i + 1;
            const thumbnail = thumbnails.get(page);
            const isCurrentPage = page === currentPage;

            return (
              <button
                key={page}
                onClick={() => onPageChange?.(page)}
                className={`w-full p-2 rounded border-2 transition ${
                  isCurrentPage
                    ? 'border-blue-500 bg-blue-900/30'
                    : 'border-gray-600 hover:border-gray-500 bg-gray-700/50'
                }`}
                title={`Go to page ${page}`}
              >
                {thumbnail && (
                  <img
                    src={thumbnail.toDataURL()}
                    alt={`Page ${page}`}
                    className="w-full rounded"
                  />
                )}
                <p className="text-xs text-gray-300 text-center mt-1">Page {page}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Edits List Section */}
      <div 
        ref={editsContainerRef}
        className="flex-1 overflow-y-auto p-3 bg-gray-900"
        onScroll={handleEditsScroll}
      >
        <h3 className="text-xs font-semibold text-gray-400 uppercase mb-3 sticky top-0 bg-gray-900 z-10">
          Edits ({currentPageEdits.length})
        </h3>
        {currentPageEdits.length === 0 ? (
          <p className="text-xs text-gray-500">No edits on this page</p>
        ) : (
          <div
            style={{
              height: currentPageEdits.length * ITEM_HEIGHT,
              position: 'relative',
            }}
          >
            {/* Virtual scroll container */}
            <div
              style={{
                transform: `translateY(${visibleRange.startIndex * ITEM_HEIGHT}px)`,
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
              }}
            >
              {currentPageEdits
                .slice(visibleRange.startIndex, Math.min(visibleRange.endIndex + 1, currentPageEdits.length))
                .map((edit) => (
                  <div
                    key={edit.id}
                    style={{ height: ITEM_HEIGHT }}
                    className={`p-2 rounded border transition group mb-2 ${
                      edit.id === selectedEditId
                        ? 'border-blue-500 bg-blue-900/30'
                        : 'border-gray-600 hover:border-gray-500 bg-gray-700/50'
                    }`}
                  >
                    <div className="flex items-start gap-2 h-full">
                      <button
                        onClick={() => onSelectEdit?.(edit.id === selectedEditId ? undefined : edit.id)}
                        className="flex-1 text-left min-w-0"
                      >
                        <p className="text-xs font-medium text-gray-300 truncate">
                          {getEditDescription(edit)}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          #{edit.id.split('-')[0]}
                        </p>
                      </button>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                        <button
                          onClick={() => toggleEditVisibility(edit.id)}
                          className="p-1 text-gray-400 hover:text-white transition"
                          title={visibleEdits.has(edit.id) ? 'Hide' : 'Show'}
                        >
                          {visibleEdits.has(edit.id) ? (
                            <Eye className="w-3 h-3" />
                          ) : (
                            <EyeOff className="w-3 h-3" />
                          )}
                        </button>
                        <button
                          onClick={() => onDuplicateEdit?.(edit.id)}
                          className="p-1 text-gray-400 hover:text-white transition"
                          title="Duplicate"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => onDeleteEdit?.(edit.id)}
                          className="p-1 text-gray-400 hover:text-red-500 transition"
                          title="Delete"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
