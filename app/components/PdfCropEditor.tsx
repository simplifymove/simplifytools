'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Copy, Check, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';

interface CropEditorProps {
  onCropChange: (cropBox: [number, number, number, number]) => void;
  pdfFile?: File;
  pdfDimensions?: { width: number; height: number };
}

interface CropBox {
  left: number;
  bottom: number;
  right: number;
  top: number;
}

const MIN_CROP_SPAN = 10;

function clampCropBoxToPage(cropBox: CropBox, pageWidth: number, pageHeight: number): CropBox {
  const maxRight = Math.max(Number.EPSILON, Math.floor(pageWidth));
  const maxTop = Math.max(Number.EPSILON, Math.floor(pageHeight));
  const minWidth = Math.min(MIN_CROP_SPAN, maxRight);
  const minHeight = Math.min(MIN_CROP_SPAN, maxTop);
  const left = Math.min(Math.max(0, cropBox.left), maxRight - minWidth);
  const bottom = Math.min(Math.max(0, cropBox.bottom), maxTop - minHeight);

  return {
    left,
    bottom,
    right: Math.min(maxRight, Math.max(left + minWidth, cropBox.right)),
    top: Math.min(maxTop, Math.max(bottom + minHeight, cropBox.top)),
  };
}

function cropBoxesEqual(left: CropBox, right: CropBox): boolean {
  return left.left === right.left
    && left.bottom === right.bottom
    && left.right === right.right
    && left.top === right.top;
}

// Lazy load pdfjs-dist only in browser
let pdfjsLib: any = null;
const initPdfJs = async () => {
  if (!pdfjsLib && typeof window !== 'undefined') {
    try {
      pdfjsLib = await import('pdfjs-dist');
      pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.js';
    } catch (error) {
      console.error('Failed to load pdfjs-dist:', error);
    }
  }
  return pdfjsLib;
};

export function PdfCropEditor({ onCropChange, pdfFile, pdfDimensions }: CropEditorProps) {
  const LETTER_WIDTH = 612;
  const LETTER_HEIGHT = 792;
  const PREVIEW_WIDTH = 400;
  const PREVIEW_HEIGHT = 600;

  const [pdfDocument, setPdfDocument] = useState<{ numPages: number; getPage: (num: number) => Promise<any> } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pdfImage, setPdfImage] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [pageWidth, setPageWidth] = useState(LETTER_WIDTH);
  const [pageHeight, setPageHeight] = useState(LETTER_HEIGHT);
  const loadingTaskRef = useRef<any>(null);
  const renderTaskRef = useRef<any>(null);
  const renderGenerationRef = useRef(0);

  const width = pdfDimensions?.width || pageWidth;
  const height = pdfDimensions?.height || pageHeight;

  const [cropBox, setCropBox] = useState<CropBox>({
    left: 0,
    bottom: 0,
    right: width,
    top: height,
  });
  const cropBoxRef = useRef(cropBox);

  const [isDragging, setIsDragging] = useState(false);
  const [dragType, setDragType] = useState<string>('');
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const previewRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  const scaleX = PREVIEW_WIDTH / width;
  const scaleY = PREVIEW_HEIGHT / height;

  // Load and render PDF
  useEffect(() => {
    if (!pdfFile) return;
    let cancelled = false;
    setPdfImage('');

    const loadPdf = async () => {
      try {
        setLoading(true);
        const pdfjs = await initPdfJs();
        if (!pdfjs) {
          throw new Error('Failed to initialize PDF.js');
        }
        const arrayBuffer = await pdfFile.arrayBuffer();
        if (cancelled) return;
        const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
        loadingTaskRef.current = loadingTask;
        const pdf = await loadingTask.promise;
        if (cancelled) {
          await loadingTask.destroy();
          return;
        }

        setPdfDocument(pdf);
        setTotalPages(pdf.numPages);
        setCurrentPage(1);
        await renderPage(pdf, 1);
      } catch (error) {
        if (!cancelled) {
          console.error('Error loading PDF:', error);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadPdf();
    return () => {
      cancelled = true;
      renderGenerationRef.current += 1;
      renderTaskRef.current?.cancel();
      renderTaskRef.current = null;
      const loadingTask = loadingTaskRef.current;
      loadingTaskRef.current = null;
      if (loadingTask) {
        void loadingTask.destroy().catch(() => undefined);
      }
    };
  }, [pdfFile]);

  const renderPage = async (pdf: { getPage: (num: number) => Promise<any> }, pageNum: number) => {
    const generation = ++renderGenerationRef.current;
    renderTaskRef.current?.cancel();
    renderTaskRef.current = null;

    try {
      const page = await pdf.getPage(pageNum);
      if (generation !== renderGenerationRef.current) return;
      const actualViewport = page.getViewport({ scale: 1 });
      const synchronizedCropBox = clampCropBoxToPage(
        cropBoxRef.current,
        actualViewport.width,
        actualViewport.height,
      );
      cropBoxRef.current = synchronizedCropBox;
      if (!cropBoxesEqual(cropBox, synchronizedCropBox)) {
        setCropBox(synchronizedCropBox);
      }
      onCropChange([
        synchronizedCropBox.left,
        synchronizedCropBox.bottom,
        synchronizedCropBox.right,
        synchronizedCropBox.top,
      ]);
      setPageWidth(actualViewport.width);
      setPageHeight(actualViewport.height);

      const viewport = page.getViewport({ scale: PREVIEW_WIDTH / actualViewport.width });
      
      const canvas = document.createElement('canvas');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      
      const context = canvas.getContext('2d');
      if (!context) return;

      const renderTask = page.render({ canvasContext: context, viewport });
      renderTaskRef.current = renderTask;
      await renderTask.promise;
      if (generation !== renderGenerationRef.current) return;
      
      // Convert to data URL for display
      setPdfImage(canvas.toDataURL('image/png'));
    } catch (error) {
      if (generation === renderGenerationRef.current && (error as { name?: string })?.name !== 'RenderingCancelledException') {
        console.error('Error rendering page:', error);
      }
    } finally {
      if (generation === renderGenerationRef.current) {
        renderTaskRef.current = null;
      }
    }
  };

  const handlePageChange = async (newPage: number) => {
    if (pdfDocument && newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      await renderPage(pdfDocument, newPage);
    }
  };

  // Convert PDF coordinates (origin at bottom-left) to canvas coordinates (origin at top-left)
  const cropBoxInPreview = {
    left: cropBox.left * scaleX,
    top: (height - cropBox.top) * scaleY,
    width: (cropBox.right - cropBox.left) * scaleX,
    height: (cropBox.top - cropBox.bottom) * scaleY,
  };

  const handleMouseDown = (e: React.MouseEvent, type: string) => {
    setIsDragging(true);
    setDragType(type);
    setStartPos({ x: e.clientX, y: e.clientY });
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !previewRef.current) return;

      const deltaX = (e.clientX - startPos.x) / scaleX;
      const deltaY = -(e.clientY - startPos.y) / scaleY; // Invert for PDF coordinates

      const newCropBox = { ...cropBox };

      if (dragType === 'move') {
        newCropBox.left += deltaX;
        newCropBox.right += deltaX;
        newCropBox.bottom += deltaY;
        newCropBox.top += deltaY;
      } else if (dragType === 'left') {
        newCropBox.left = Math.max(0, Math.min(cropBox.right - 10, cropBox.left + deltaX));
      } else if (dragType === 'right') {
        newCropBox.right = Math.min(width, Math.max(cropBox.left + 10, cropBox.right + deltaX));
      } else if (dragType === 'top') {
        newCropBox.top = Math.min(height, Math.max(cropBox.bottom + 10, cropBox.top + deltaY));
      } else if (dragType === 'bottom') {
        newCropBox.bottom = Math.max(0, Math.min(cropBox.top - 10, cropBox.bottom + deltaY));
      }

      // Constrain bounds
      newCropBox.left = Math.max(0, Math.min(newCropBox.left, width));
      newCropBox.right = Math.max(0, Math.min(newCropBox.right, width));
      newCropBox.bottom = Math.max(0, Math.min(newCropBox.bottom, height));
      newCropBox.top = Math.max(0, Math.min(newCropBox.top, height));

      cropBoxRef.current = newCropBox;
      setCropBox(newCropBox);
      setStartPos({ x: e.clientX, y: e.clientY });
    };

    const handleMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
        onCropChange([cropBox.left, cropBox.bottom, cropBox.right, cropBox.top]);
      }
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragType, startPos, cropBox, scaleX, scaleY, onCropChange, width, height]);

  const handleInputChange = (key: keyof CropBox, value: number) => {
    const newCropBox = { ...cropBox, [key]: Math.max(0, value) };

    // Ensure valid bounds
    if (key === 'left') newCropBox.left = Math.min(newCropBox.left, newCropBox.right - 10);
    if (key === 'right') newCropBox.right = Math.max(newCropBox.right, newCropBox.left + 10);
    if (key === 'bottom') newCropBox.bottom = Math.min(newCropBox.bottom, newCropBox.top - 10);
    if (key === 'top') newCropBox.top = Math.max(newCropBox.top, newCropBox.bottom + 10);

    cropBoxRef.current = newCropBox;
    setCropBox(newCropBox);
    onCropChange([newCropBox.left, newCropBox.bottom, newCropBox.right, newCropBox.top]);
  };

  const resetCrop = () => {
    const reset = { left: 0, bottom: 0, right: width, top: height };
    cropBoxRef.current = reset;
    setCropBox(reset);
    onCropChange([reset.left, reset.bottom, reset.right, reset.top]);
  };

  const copyToClipboard = () => {
    const text = `[${cropBox.left}, ${cropBox.bottom}, ${cropBox.right}, ${cropBox.top}]`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Visual Editor */}
      <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-6 border border-slate-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <span className="w-6 h-6 bg-gradient-to-br from-blue-500 to-cyan-600 rounded text-white flex items-center justify-center text-xs font-bold">📐</span>
          Visual Crop Editor
        </h3>

        {/* Preview Container */}
        <div className="flex flex-col gap-4">
          {loading && (
            <div className="flex justify-center items-center h-96 bg-gray-100 rounded-lg">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-3"></div>
                <p className="text-gray-600">Loading PDF...</p>
              </div>
            </div>
          )}

          {!loading && pdfImage && (
            <>
              {/* Canvas with PDF and Crop Box */}
              <div className="flex justify-center relative">
                <div
                  ref={previewRef}
                  className="relative border-2 border-gray-300 rounded-lg overflow-hidden shadow-md bg-white"
                  style={{
                    width: PREVIEW_WIDTH,
                    height: PREVIEW_HEIGHT,
                  }}
                >
                  {/* PDF Image Background */}
                  <img
                    src={pdfImage}
                    alt="PDF page"
                    className="absolute inset-0 w-full h-full object-contain bg-gray-900"
                  />

                  {/* Dimmed Overlay for non-cropped area */}
                  <div className="absolute inset-0 pointer-events-none">
                    {/* Top overlay */}
                    <div
                      className="absolute left-0 top-0 right-0 bg-black/30"
                      style={{ height: `${cropBoxInPreview.top}px` }}
                    />
                    {/* Bottom overlay */}
                    <div
                      className="absolute left-0 bottom-0 right-0 bg-black/30"
                      style={{
                        height: `${PREVIEW_HEIGHT - cropBoxInPreview.top - cropBoxInPreview.height}px`,
                      }}
                    />
                    {/* Left overlay */}
                    <div
                      className="absolute top-0 left-0 bottom-0 bg-black/30"
                      style={{
                        width: `${cropBoxInPreview.left}px`,
                        top: `${cropBoxInPreview.top}px`,
                        height: `${cropBoxInPreview.height}px`,
                      }}
                    />
                    {/* Right overlay */}
                    <div
                      className="absolute top-0 right-0 bottom-0 bg-black/30"
                      style={{
                        width: `${PREVIEW_WIDTH - cropBoxInPreview.left - cropBoxInPreview.width}px`,
                        top: `${cropBoxInPreview.top}px`,
                        height: `${cropBoxInPreview.height}px`,
                      }}
                    />
                  </div>

                  {/* Crop Box */}
                  <div
                    className="absolute border-2 border-blue-500 shadow-lg cursor-move group"
                    style={{
                      left: `${cropBoxInPreview.left}px`,
                      top: `${cropBoxInPreview.top}px`,
                      width: `${cropBoxInPreview.width}px`,
                      height: `${cropBoxInPreview.height}px`,
                      pointerEvents: 'auto',
                    }}
                    onMouseDown={(e) => handleMouseDown(e, 'move')}
                  >
                    {/* Corner Handles */}
                    <div className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-blue-500 rounded-full cursor-nwse-resize border border-white shadow-md" />
                    <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-blue-500 rounded-full cursor-nesw-resize border border-white shadow-md" />
                    <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-blue-500 rounded-full cursor-nesw-resize border border-white shadow-md" />
                    <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-blue-500 rounded-full cursor-nwse-resize border border-white shadow-md" />

                    {/* Edge Handles */}
                    <div
                      className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-3 h-12 bg-blue-500 rounded-full cursor-ew-resize border border-white shadow-md"
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        handleMouseDown(e, 'left');
                      }}
                    />
                    <div
                      className="absolute -right-1.5 top-1/2 -translate-y-1/2 w-3 h-12 bg-blue-500 rounded-full cursor-ew-resize border border-white shadow-md"
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        handleMouseDown(e, 'right');
                      }}
                    />
                    <div
                      className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-12 h-3 bg-blue-500 rounded-full cursor-ns-resize border border-white shadow-md"
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        handleMouseDown(e, 'top');
                      }}
                    />
                    <div
                      className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-12 h-3 bg-blue-500 rounded-full cursor-ns-resize border border-white shadow-md"
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        handleMouseDown(e, 'bottom');
                      }}
                    />

                    {/* Center label */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <span className="text-xs font-semibold text-blue-600 bg-white/80 px-2 py-1 rounded">
                        {Math.round(cropBoxInPreview.width / scaleX)} × {Math.round(cropBoxInPreview.height / scaleY)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Page Navigation */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 p-3 bg-gray-100 rounded-lg">
                  <button
                    type="button"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 text-gray-600 disabled:text-gray-300 hover:bg-white rounded transition"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <span className="text-sm font-medium text-gray-700">
                    Page <input
                      type="number"
                      value={currentPage}
                      onChange={(e) => handlePageChange(parseInt(e.target.value) || 1)}
                      min="1"
                      max={totalPages}
                      className="w-12 px-2 py-1 border rounded text-center font-medium"
                    /> of {totalPages}
                  </span>
                  <button
                    type="button"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-2 text-gray-600 disabled:text-gray-300 hover:bg-white rounded transition"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              )}
            </>
          )}

          {!loading && !pdfImage && (
            <div className="flex justify-center items-center h-96 bg-gray-100 rounded-lg">
              <p className="text-gray-500">Upload a PDF to start cropping</p>
            </div>
          )}

          {/* Instructions */}
          <p className="text-xs text-gray-600 text-center">
            Drag the blue box or handles to set crop area. Drag inside to move.
          </p>
        </div>
      </div>

      {/* Numeric Inputs */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <span className="w-6 h-6 bg-gradient-to-br from-green-500 to-emerald-600 rounded text-white flex items-center justify-center text-xs font-bold">📊</span>
            Coordinates (pixels)
          </h3>
          <button
            type="button"
            onClick={resetCrop}
            className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
          >
            <RefreshCw size={14} />
            Reset
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase mb-2">Left</label>
            <input
              type="number"
              value={Math.round(cropBox.left)}
              onChange={(e) => handleInputChange('left', parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition font-mono text-sm"
              min="0"
              max={width}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase mb-2">Right</label>
            <input
              type="number"
              value={Math.round(cropBox.right)}
              onChange={(e) => handleInputChange('right', parseInt(e.target.value) || width)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition font-mono text-sm"
              min="0"
              max={width}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase mb-2">Bottom</label>
            <input
              type="number"
              value={Math.round(cropBox.bottom)}
              onChange={(e) => handleInputChange('bottom', parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition font-mono text-sm"
              min="0"
              max={height}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase mb-2">Top</label>
            <input
              type="number"
              value={Math.round(cropBox.top)}
              onChange={(e) => handleInputChange('top', parseInt(e.target.value) || height)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition font-mono text-sm"
              min="0"
              max={height}
            />
          </div>
        </div>

        {/* Copy button */}
        <button
          type="button"
          onClick={copyToClipboard}
          className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition font-mono text-sm border border-blue-200"
        >
          {copied ? (
            <>
              <Check size={16} />
              Copied!
            </>
          ) : (
            <>
              <Copy size={16} />
              Copy as Array: [{Math.round(cropBox.left)}, {Math.round(cropBox.bottom)}, {Math.round(cropBox.right)}, {Math.round(cropBox.top)}]
            </>
          )}
        </button>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-900">
          <span className="font-semibold">📌 Tip:</span> PDF coordinates use bottom-left origin. Format is [left, bottom, right, top].
          Document size: {Math.round(width)} × {Math.round(height)} pixels
        </p>
      </div>
    </div>
  );
}
