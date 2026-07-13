'use client';

import React, { useRef, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Download } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { readDownloadResultResponse } from '@/app/lib/download-result-client';

// Type definitions
type PDFLib = any;

const loadPdfJs = async (): Promise<PDFLib> => {
  return new Promise((resolve, reject) => {
    // Check if already loaded
    if ((window as any).pdfjsLib) {
      console.log('✓ PDF.js already loaded in pdfjsLib');
      return resolve((window as any).pdfjsLib);
    }

    // Try multiple CDNs as fallback
    // Using version 3.11.174 which is stable and widely supported
    const cdnUrls = [
      'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js',
      'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.min.js',
      'https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.min.js',
    ];
    
    let currentCdnIndex = 0;
    const loadFromCdn = () => {
      if (currentCdnIndex >= cdnUrls.length) {
        console.error('❌ All CDNs exhausted. Available window props:', Object.keys((window as any)).filter(k => k.toLowerCase().includes('pdf')));
        reject(new Error('Failed to load PDF.js from all available CDNs'));
        return;
      }
      
      const url = cdnUrls[currentCdnIndex];
      console.log(`📡 [${currentCdnIndex + 1}/${cdnUrls.length}] Attempting: ${url}`);
      
      const script = document.createElement('script');
      script.src = url;
      script.async = true;
      script.crossOrigin = 'anonymous';
      
      // Track network timing
      const startTime = performance.now();
      
      const timeout = setTimeout(() => {
        const elapsed = performance.now() - startTime;
        console.warn(`⏱️ Timeout after ${elapsed.toFixed(0)}ms for ${url}`);
        if (document.head.contains(script)) {
          document.head.removeChild(script);
        }
        currentCdnIndex++;
        loadFromCdn();
      }, 8000); // Increased to 8s
      
      script.onload = () => {
        const elapsed = performance.now() - startTime;
        clearTimeout(timeout);
        
        console.log(`📦 Script loaded in ${elapsed.toFixed(0)}ms. Checking for PDF.js...`);
        
        // Check multiple possible global variable names
        // jsdelivr uses pdfjsLib, other CDNs use pdfjs
        const possibleNames = ['pdfjsLib', 'pdfjs', 'pdfjsWorker', 'PDFWorker', 'pdfjs-dist', 'pdfjs_dist'];
        let pdfjs = null;
        let foundName = '';
        
        for (const name of possibleNames) {
          if ((window as any)[name]) {
            console.log(`  Found: window.${name}`);
            pdfjs = (window as any)[name];
            foundName = name;
            break;
          }
        }
        
        // Also try the library directly
        if (!pdfjs && (window as any).pdf) {
          console.log(`  Found: window.pdf`);
          pdfjs = (window as any).pdf;
        }
        
        if (!pdfjs) {
          console.warn(`❌ PDF.js not found in window. Available keys with 'pdf':`);
          const pdfKeys = Object.keys((window as any)).filter(k => k.toLowerCase().includes('pdf'));
          console.warn(pdfKeys.length > 0 ? pdfKeys : 'None');
          
          if (document.head.contains(script)) {
            document.head.removeChild(script);
          }
          currentCdnIndex++;
          loadFromCdn();
          return;
        }
        
        // Check if getDocument method exists
        if (!pdfjs.getDocument) {
          console.warn(`⚠️ PDF.js loaded but no getDocument method. Available methods:`, Object.keys(pdfjs).slice(0, 10));
          if (document.head.contains(script)) {
            document.head.removeChild(script);
          }
          currentCdnIndex++;
          loadFromCdn();
          return;
        }
        
        console.log(`✅ PDF.js loaded successfully (${foundName}) with getDocument method`);
        
        // Set worker to use CDN from the same source (avoids import.meta issues in local files)
        // Try minified version first, fall back to regular version
        const workerUrl = url.replace('pdf.min.js', 'pdf.worker.min.js');
        console.log(`🔧 Setting worker URL (minified): ${workerUrl}`);
        
        if (pdfjs.GlobalWorkerOptions) {
          pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;
          console.log(`✅ Worker URL configured`);
        } else {
          console.warn('⚠️ GlobalWorkerOptions not available - worker may fail');
        }
        
        (window as any).pdfjsLib = pdfjs;
        resolve(pdfjs);
      };
      
      script.onerror = (error) => {
        const elapsed = performance.now() - startTime;
        clearTimeout(timeout);
        console.error(`❌ Script error after ${elapsed.toFixed(0)}ms:`, error, `URL: ${url}`);
        if (document.head.contains(script)) {
          document.head.removeChild(script);
        }
        currentCdnIndex++;
        loadFromCdn();
      };
      
      document.head.appendChild(script);
    };
    
    loadFromCdn();
  });
};

interface TextElement {
  id: string;
  page: number;
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize: number;
  fontFamily: string;
}

interface Props {
  file: File;
  onChanges?: (textElements: TextElement[]) => void;
}

export default function PdfTextEditor({ file, onChanges }: Props) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pdfDocRef = useRef<any>(null);
  const renderTaskRef = useRef<any | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [zoom, setZoom] = useState(1.2);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [textElements, setTextElements] = useState<TextElement[]>([]);
  const [editingElementId, setEditingElementId] = useState<string | null>(null);

  // Initialize PDF.js
  useEffect(() => {
    const initialize = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Load PDF.js from CDN
        console.log('🚀 Starting PDF.js initialization...');
        const pdfjs = await loadPdfJs();
        console.log('✅ PDF.js library loaded successfully');
        
        // Verify PDF.js is properly configured
        if (!pdfjs.getDocument) {
          throw new Error('PDF.js loaded but getDocument method is missing');
        }
        
        // Convert file to array buffer
        console.log('📖 Reading PDF file...');
        const arrayBuffer = await file.arrayBuffer();
        console.log(`✅ PDF file read: ${(arrayBuffer.byteLength / 1024 / 1024).toFixed(2)} MB`);
        
        // Load PDF document with timeout
        console.log('📄 Loading PDF document with PDF.js...');
        console.log(`   Worker URL: ${pdfjs.GlobalWorkerOptions?.workerSrc || 'not set'}`);
        
        // Use explicit data source with proper configuration
        const documentPromise = pdfjs.getDocument({
          data: arrayBuffer,
          disableAutoFetch: false,
          disableStream: false,
        }).promise;
        
        // Create a timeout promise
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('PDF document loading timed out after 10 seconds')), 10000)
        );
        
        // Race between document load and timeout
        const pdf = await Promise.race([documentPromise, timeoutPromise]);
        console.log(`✅ PDF document loaded: ${pdf.numPages} pages`);
        
        if (!pdf || !pdf.numPages) {
          throw new Error('PDF loaded but has no pages');
        }
        
        pdfDocRef.current = pdf;
        setTotalPages(pdf.numPages);
        setCurrentPage(1);
        setError(null);
        setLoading(false);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        console.error('❌ PDF initialization failed:', errorMsg, err);
        setError(`Failed to load PDF: ${errorMsg}`);
        setLoading(false);
      }
    };

    initialize();
  }, [file]);

  // Render PDF page
  useEffect(() => {
    const renderPage = async () => {
      if (!pdfDocRef.current) {
        console.warn('⚠️ Cannot render: PDF document not ready', {
          hasDoc: !!pdfDocRef.current,
          totalPages,
          currentPage,
        });
        return;
      }

      if (!canvasRef.current) {
        console.warn('⚠️ Cannot render: canvas ref not available');
        return;
      }

      try {
        console.log(`🎨 Rendering page ${currentPage}...`);
        
        if (renderTaskRef.current) {
          renderTaskRef.current.cancel();
        }

        const page = await pdfDocRef.current.getPage(currentPage);
        console.log(`✅ Got page ${currentPage}`);
        
        const viewport = page.getViewport({ scale: zoom });
        console.log(`✅ Viewport size: ${viewport.width}x${viewport.height}`);

        const canvas = canvasRef.current;
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        canvas.style.width = `${viewport.width}px`;
        canvas.style.height = `${viewport.height}px`;

        const context = canvas.getContext('2d');
        if (!context) {
          throw new Error('Failed to get canvas 2D context');
        }
        console.log('✅ Canvas context obtained');

        context.clearRect(0, 0, canvas.width, canvas.height);

        console.log('🎬 Starting render task...');
        const renderTask = page.render({
          canvasContext: context,
          viewport: viewport,
        });

        renderTaskRef.current = renderTask;
        await renderTask.promise;
        console.log(`✅ Page ${currentPage} rendered successfully`);

        // Extract text layer
        console.log('📝 Extracting text...');
        const textContent = await page.getTextContent();
        const textItems = textContent.items as any[];
        console.log(`✅ Extracted ${textItems.length} text items`);

        const extracted: TextElement[] = textItems.map((item, index) => ({
          id: `${currentPage}-${index}`,
          page: currentPage,
          text: item.str,
          x: item.transform[4],
          y: item.transform[5],
          width: item.width,
          height: item.height,
          fontSize: item.height,
          fontFamily: item.fontName || 'Arial',
        }));

        setTextElements(extracted);
      } catch (err) {
        if (err instanceof Error && err.message !== 'Rendering cancelled') {
          console.error('❌ Render error:', err);
          setError(`Failed to render page: ${err.message}`);
        }
      }
    };

    renderPage();
  }, [currentPage, zoom, totalPages]);

  // Handle text element change (inline editing)
  const handleTextChange = (elementId: string, newText: string) => {
    setTextElements(prev => {
      const updated = prev.map(el =>
        el.id === elementId ? { ...el, text: newText } : el
      );
      onChanges?.(updated);
      return updated;
    });
  };

  // Save changes to backend
  const handleSave = async () => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('textElements', JSON.stringify(textElements));
      formData.append('fileName', file.name.replace('.pdf', '-edited.pdf'));

      const response = await fetch('/api/pdf/edit-text', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Failed to save changes');
      }

      const result = await readDownloadResultResponse(response);
      router.push(result.downloadPageUrl);
    } catch (err) {
      setError(`Failed to save: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading PDF...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border-2 border-red-200 rounded-lg">
        <p className="text-red-700 font-medium">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="bg-white rounded-lg shadow p-4 flex flex-wrap items-center justify-between gap-4 border border-gray-200">
        <div className="flex items-center gap-4">
          {/* Navigation */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 hover:bg-gray-100 rounded disabled:opacity-50 transition"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="px-4 py-2 bg-gray-100 rounded font-medium text-sm whitespace-nowrap">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 hover:bg-gray-100 rounded disabled:opacity-50 transition"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Zoom */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setZoom(z => Math.max(0.5, z - 0.2))}
              className="p-2 hover:bg-gray-100 rounded transition"
            >
              <ZoomOut className="w-5 h-5" />
            </button>
            <span className="px-3 py-2 bg-gray-100 rounded text-sm font-medium min-w-[70px] text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => setZoom(z => Math.min(3, z + 0.2))}
              className="p-2 hover:bg-gray-100 rounded transition"
            >
              <ZoomIn className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition flex items-center gap-2 font-medium whitespace-nowrap"
        >
          <Download className="w-4 h-4" />
          Save & Download
        </button>
      </div>

      {/* PDF Preview with Inline Text Editing */}
      <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
        <div
          ref={containerRef}
          className="relative bg-gray-100 flex justify-center p-4"
          style={{ minHeight: '700px', overflowY: 'auto', overflowX: 'auto' }}
        >
          <div className="relative inline-block">
            {/* PDF Canvas */}
            <canvas
              ref={canvasRef}
              className="block shadow-lg"
            />
            
            {/* Editable Text Overlay */}
            <div
              ref={overlayRef}
              className="absolute top-0 left-0 pointer-events-auto"
              style={{
                width: canvasRef.current?.width ? `${canvasRef.current.width}px` : '100%',
                height: canvasRef.current?.height ? `${canvasRef.current.height}px` : '100%',
              }}
            >
              {textElements.map((element) => (
                <div
                  key={element.id}
                  className="absolute group"
                  style={{
                    left: `${element.x}px`,
                    top: `${element.y}px`,
                    width: `${element.width}px`,
                    height: `${element.height}px`,
                  }}
                >
                  {editingElementId === element.id ? (
                    // Editable input
                    <input
                      autoFocus
                      type="text"
                      value={element.text}
                      onChange={(e) => handleTextChange(element.id, e.target.value)}
                      onBlur={() => setEditingElementId(null)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') setEditingElementId(null);
                        if (e.key === 'Escape') setEditingElementId(null);
                      }}
                      className="absolute inset-0 w-full h-full px-1 py-0 text-xs bg-blue-100 border-2 border-blue-500 rounded font-medium outline-none text-black"
                      style={{
                        fontSize: `${Math.max(10, element.fontSize * zoom)}px`,
                      }}
                    />
                  ) : (
                    // Click to edit - invisible until clicked or hovered
                    <div
                      onClick={() => setEditingElementId(element.id)}
                      className="absolute inset-0 px-1 py-0 text-xs font-medium cursor-text hover:bg-yellow-200/80 hover:border-2 hover:border-yellow-400 rounded transition overflow-hidden text-ellipsis whitespace-nowrap text-black flex items-center opacity-0 hover:opacity-100"
                      title={`Click to edit: ${element.text}`}
                      style={{
                        fontSize: `${Math.max(10, element.fontSize * zoom)}px`,
                      }}
                    >
                      {element.text}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Info Bar */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-900">
          💡 <strong>Click on any text</strong> in the PDF to edit it. Press <kbd className="px-2 py-1 bg-blue-100 rounded text-xs font-mono">Enter</kbd> or click outside to save.
        </p>
      </div>
    </div>
  );
}
