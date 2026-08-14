'use client';

import React, { useCallback, useEffect, useRef, useState, lazy, Suspense } from 'react';
import { PdfEdit, PdfEditorState } from '@/app/types/pdf-editor';
import { EditHistory } from '@/app/lib/pdf-editor/editHistory';
import Toolbar from './Toolbar';
import PDFCanvas from './PDFCanvasActive';
import Sidebar from './Sidebar';
import PropertiesPanel from './PropertiesPanel';
import ToolSettingsPanel from './ToolSettingsPanel';
import MobileToolMenu, { MobileSheet } from './MobileMenu';
import type { ExtractedText } from '@/app/lib/pdf-editor/textExtraction';
import { extractTextFromPdf } from '@/app/lib/pdf-editor/textExtraction';

// Lazy load tool components for better performance
const HighlightTool = lazy(() => import('./tools/HighlightTool'));
const ShapeTool = lazy(() => import('./tools/ShapeTool'));
const DrawingTool = lazy(() => import('./tools/DrawingTool'));
const ExportModal = lazy(() => import('./ExportModal'));

// Loading fallback component
const ToolLoadingFallback = () => (
  <div className="absolute inset-0 pointer-events-none" />
);

interface Props {
  file: File;
  onSave?: (edits: PdfEdit[]) => void;
}

export default function PdfEditor({ file, onSave }: Props) {
  // State management
  const [state, setState] = useState<PdfEditorState>({
    edits: [],
    selectedEditId: undefined,
    currentPage: 1,
    totalPages: 0,
    zoom: 1,
    panX: 0,
    panY: 0,
    activeTool: 'select',
    isDirty: false,
  });

  // Tool-specific state
  const [shapeType, setShapeType] = useState<string>('rectangle');
  const [drawingType, setDrawingType] = useState<string>('pen');
  const [strokeColor, setStrokeColor] = useState<string>('#000000');
  const [strokeWidth, setStrokeWidth] = useState<number>(2);
  const [highlightColor, setHighlightColor] = useState<string>('rgba(255, 255, 0, 0.3)');
  const [currentImageData, setCurrentImageData] = useState<string>('');
  const [showExportModal, setShowExportModal] = useState(false);
  const [showMobileToolMenu, setShowMobileToolMenu] = useState(false);
  const [showMobileProperties, setShowMobileProperties] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

  // Text extraction state (for inline editing on canvas)
  const [extractedText, setExtractedText] = useState<ExtractedText[]>([]);
  const [editedTexts, setEditedTexts] = useState<Record<string, string>>({});
  const [isExtractingText, setIsExtractingText] = useState(false);
  const [textExtractionError, setTextExtractionError] = useState<string | null>(null);
  const [editingTextId, setEditingTextId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // References
  const pdfDocRef = useRef<any>(null);
  const historyRef = useRef<EditHistory>(new EditHistory());

  // Initialize PDF
  useEffect(() => {
    const initializePdf = async () => {
      try {
        const pdfjs = await import('pdfjs-dist');
        pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.js';
        (window as any).pdfjsLib = pdfjs;

        console.log('[PDF Init] Loading PDF file:', file.name, 'size:', file.size);
        const arrayBuffer = await file.arrayBuffer();
        
        if (!arrayBuffer) {
          console.error('[PDF Init] ArrayBuffer is null');
          return;
        }
        
        console.log('[PDF Init] ArrayBuffer loaded:', arrayBuffer.byteLength, 'bytes');
        
        const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
        
        console.log('[PDF Init] PDF loaded successfully. Pages:', pdf.numPages);
        
        pdfDocRef.current = pdf;
        setState((prev) => ({
          ...prev,
          totalPages: pdf.numPages,
          currentPage: 1,
        }));
      } catch (err) {
        console.error('[PDF Init] Failed to load PDF:', err);
      }
    };

    initializePdf();
  }, [file]);

  // Add edit
  const addEdit = useCallback((edit: PdfEdit) => {
    setState((prev) => {
      const newEdits = [...prev.edits, edit];
      historyRef.current.push(newEdits, `Add ${edit.type}`);
      return {
        ...prev,
        edits: newEdits,
        isDirty: true,
        selectedEditId: edit.id,
      };
    });
  }, []);

  // Update edit
  const updateEdit = useCallback((id: string, updates: Partial<PdfEdit>) => {
    setState((prev) => {
      const newEdits = prev.edits.map((e) => (e.id === id ? { ...e, ...updates } : e));
      historyRef.current.push(newEdits, `Update ${updates.type || 'edit'}`);
      return {
        ...prev,
        edits: newEdits,
        isDirty: true,
      };
    });
  }, []);

  // Delete edit
  const deleteEdit = useCallback((id: string) => {
    setState((prev) => {
      const newEdits = prev.edits.filter((e) => e.id !== id);
      historyRef.current.push(newEdits, 'Delete');
      return {
        ...prev,
        edits: newEdits,
        isDirty: true,
        selectedEditId: prev.selectedEditId === id ? undefined : prev.selectedEditId,
      };
    });
  }, []);

  // Duplicate edit
  const duplicateEdit = useCallback((id: string) => {
    setState((prev) => {
      const original = prev.edits.find((e) => e.id === id);
      if (!original) return prev;

      const duplicate: PdfEdit = {
        ...original,
        id: `edit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        x: original.x + 20,
        y: original.y + 20,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      const newEdits = [...prev.edits, duplicate];
      historyRef.current.push(newEdits, 'Duplicate');
      return {
        ...prev,
        edits: newEdits,
        isDirty: true,
        selectedEditId: duplicate.id,
      };
    });
  }, []);

  // Undo
  const handleUndo = useCallback(() => {
    const snapshot = historyRef.current.undo();
    if (snapshot) {
      setState((prev) => ({
        ...prev,
        edits: snapshot.edits,
        isDirty: true,
      }));
    }
  }, []);

  // Redo
  const handleRedo = useCallback(() => {
    const snapshot = historyRef.current.redo();
    if (snapshot) {
      setState((prev) => ({
        ...prev,
        edits: snapshot.edits,
        isDirty: true,
      }));
    }
  }, []);

  // Navigation
  const handlePrevPage = useCallback(() => {
    const newPage = Math.max(1, state.currentPage - 1);
    setState((prev) => ({ ...prev, currentPage: newPage }));
  }, [state.currentPage]);

  const handleNextPage = useCallback(() => {
    const newPage = Math.min(state.totalPages, state.currentPage + 1);
    setState((prev) => ({ ...prev, currentPage: newPage }));
  }, [state.currentPage, state.totalPages]);

  // Zoom
  const handleZoomIn = useCallback(() => {
    setState((prev) => ({ ...prev, zoom: Math.min(3, prev.zoom + 0.2) }));
  }, []);

  const handleZoomOut = useCallback(() => {
    setState((prev) => ({ ...prev, zoom: Math.max(0.5, prev.zoom - 0.2) }));
  }, []);

  const createImageEdit = useCallback(
    (data: string) => {
      const now = Date.now();

      const imageEdit: PdfEdit = {
        id: `edit-${now}-${Math.random().toString(36).substr(2, 9)}`,
        type: 'image',
        pageNumber: state.currentPage,
        x: 50,
        y: 50,
        width: 200,
        height: 200,
        zIndex: 1000,
        opacity: 1,
        imageData: data,
        preserveAspectRatio: true,
        createdAt: now,
        updatedAt: now,
      };

      addEdit(imageEdit);
      setCurrentImageData(data);

      setState((prev) => ({
        ...prev,
        activeTool: 'select',
        selectedEditId: imageEdit.id,
      }));
    },
    [addEdit, state.currentPage]
  );

  const createSignatureEdit = useCallback(
    (data: string) => {
      const now = Date.now();

      const signatureEdit: PdfEdit = {
        id: `edit-${now}-${Math.random().toString(36).substr(2, 9)}`,
        type: 'signature',
        pageNumber: state.currentPage,
        x: 50,
        y: 50,
        width: 200,
        height: 80,
        zIndex: 1000,
        opacity: 1,
        imageData: data,
        preserveAspectRatio: true,
        createdAt: now,
        updatedAt: now,
      };

      addEdit(signatureEdit);
      setCurrentImageData(data);

      setState((prev) => ({
        ...prev,
        activeTool: 'select',
        selectedEditId: signatureEdit.id,
      }));
    },
    [addEdit, state.currentPage]
  );
  // Save
  const handleSave = useCallback(async () => {
    setShowExportModal(true);
    onSave?.(state.edits);
  }, [state.edits, onSave]);

  // Extract text from PDF and enable inline editing
  const handleExtractText = useCallback(async () => {
    try {
      console.log('[Extract Text] Starting extraction...');
      setIsExtractingText(true);
      setTextExtractionError(null);
      
      const { textItems } = await extractTextFromPdf(file);
      console.log(`[Extract Text] Successfully extracted ${textItems.length} text items`);
      setExtractedText(textItems);
      // Don't show modal - text will be editable directly on canvas
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to extract text';
      console.error('[Extract Text] Error:', errorMsg);
      setTextExtractionError(errorMsg);
    } finally {
      setIsExtractingText(false);
    }
  }, [file]);

  // Handle text edit
  const handleTextEdit = useCallback((textId: string, newText: string) => {
    console.log('[Text Edit] handleTextEdit called with ID:', textId, 'Text:', newText);
    
    // Update the edited texts map
    setEditedTexts((prev) => ({
      ...prev,
      [textId]: newText,
    }));

    // Find the extracted text item to get its position
    const textItem = extractedText.find(t => t.id === textId);
    if (!textItem) return;

    // Check if we already have an edit for this text
    const existingEditIndex = state.edits.findIndex(e => e.id === textId);
    
    const now = Date.now();
    const textEdit: PdfEdit = {
      id: textId,
      type: 'text',
      pageNumber: textItem.pageNumber,
      x: textItem.x,
      y: textItem.y,
      width: textItem.width,
      height: textItem.height,
      text: newText,
      fontSize: textItem.fontSize,
      fontColor: textItem.color || '#000000',
      fontFamily: textItem.fontName || 'Arial',
      zIndex: 10,
      createdAt: existingEditIndex >= 0 ? state.edits[existingEditIndex].createdAt : now,
      updatedAt: now,
    };

    // Update or add the edit
    setState((prev) => {
      let newEdits: PdfEdit[];
      if (existingEditIndex >= 0) {
        // Update existing edit
        newEdits = prev.edits.map((e, i) => (i === existingEditIndex ? textEdit : e));
      } else {
        // Add new edit
        newEdits = [...prev.edits, textEdit];
      }
      
      historyRef.current.push(newEdits, `Edit text`);
      return {
        ...prev,
        edits: newEdits,
        isDirty: true,
      };
    });

    // Show success toast
    setToast({ message: `✓ Text updated: "${newText.substring(0, 30)}${newText.length > 30 ? '...' : ''}"`, type: 'success' });
    setTimeout(() => setToast(null), 3000);
  }, [extractedText, state.edits]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+Z / Cmd+Z - Undo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        handleUndo();
      }
      // Ctrl+Y / Cmd+Y - Redo
      if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        handleRedo();
      }
      // Ctrl+S / Cmd+S - Save
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
      // Delete - Delete selected edit
      if (e.key === 'Delete' && state.selectedEditId) {
        e.preventDefault();
        deleteEdit(state.selectedEditId);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo, handleSave, state.selectedEditId, deleteEdit]);

  // Get selected edit
  const selectedEdit = state.selectedEditId
    ? state.edits.find((e) => e.id === state.selectedEditId)
    : undefined;

  return (
    <div className="flex h-[calc(100vh-1rem)] min-h-[720px] w-full flex-col overflow-hidden bg-gray-900">
      {/* Toolbar */}
      <Toolbar
        currentPage={state.currentPage}
        totalPages={state.totalPages}
        zoom={state.zoom}
        activeTool={state.activeTool}
        canUndo={historyRef.current.canUndo()}
        canRedo={historyRef.current.canRedo()}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onPrevPage={handlePrevPage}
        onNextPage={handleNextPage}
        onToolSelect={(tool: any) =>
          setState((prev) => ({
            ...prev,
            activeTool: tool,
            selectedEditId:
              tool === 'select'
                ? prev.selectedEditId
                : undefined,
          }))
        }
        onSave={handleSave}
        onExtractText={handleExtractText}
        isExtractingText={isExtractingText}
        onMobileMenu={() => setShowMobileToolMenu(true)}
        onMobileProperties={() => setShowMobileProperties(true)}
      />

      {/* Main Content Area */}
      <div className="flex min-h-0 flex-1 overflow-hidden">
        {/* Sidebar (hidden on mobile) */}
        <div className="hidden md:block">
          <Sidebar
            pdfDoc={pdfDocRef.current}
            currentPage={state.currentPage}
            totalPages={state.totalPages}
            edits={state.edits}
            selectedEditId={state.selectedEditId}
            zoom={state.zoom}
            onPageChange={(page) => setState((prev) => ({ ...prev, currentPage: page }))}
            onSelectEdit={(id) => setState((prev) => ({ ...prev, selectedEditId: id }))}
            onDeleteEdit={deleteEdit}
            onDuplicateEdit={duplicateEdit}
          />
        </div>

        {/* PDF Canvas */}
        <main className="relative min-w-0 flex-1 overflow-hidden bg-gray-950">
          <PDFCanvas
            pdfDoc={pdfDocRef.current}
            currentPage={state.currentPage}
            zoom={state.zoom}
            edits={state.edits}
            selectedEditId={state.selectedEditId}
            activeTool={state.activeTool}
            shapeType={shapeType}
            drawingType={drawingType}
            strokeColor={strokeColor}
            strokeWidth={strokeWidth}
            highlightColor={highlightColor}
            currentImageData={currentImageData}
            extractedText={extractedText}
            editedTexts={editedTexts}
            editingTextId={editingTextId}
            onSelectEdit={(id) => setState((prev) => ({ ...prev, selectedEditId: id }))}
            onUpdateEdit={updateEdit}
            onAddEdit={addEdit}
            onToolChange={(tool: string) =>
              setState((prev) => ({
                ...prev,
                activeTool: tool as PdfEditorState['activeTool'],
              }))
            }
            onDeleteEdit={deleteEdit}
            onTextClick={setEditingTextId}
            onTextEditChange={handleTextEdit}
          />
          
          {/* Extraction Status */}
          {(extractedText.length > 0 || textExtractionError || isExtractingText) && (
            <div className="absolute bottom-4 left-4 bg-gray-900 border border-gray-700 rounded px-3 py-2 text-sm text-white">
              {isExtractingText && <div>Extracting text...</div>}
              {textExtractionError && <div className="text-red-400">Error: {textExtractionError}</div>}
              {extractedText.length > 0 && !isExtractingText && (
                <div className="text-green-400">{extractedText.length} text items extracted. Click text on PDF to edit.</div>
              )}
            </div>
          )}
        </main>

        {/* Persistent desktop inspector */}
        <aside className="hidden w-64 shrink-0 xl:block">
          {selectedEdit ? (
            <PropertiesPanel
              edit={selectedEdit}
              onUpdate={(updates) => {
                if (state.selectedEditId) {
                  updateEdit(state.selectedEditId, updates);
                }
              }}
              onDelete={() => {
                if (state.selectedEditId) {
                  deleteEdit(state.selectedEditId);
                }
              }}
            />
          ) : (
            <ToolSettingsPanel
              activeTool={state.activeTool}
              shapeType={shapeType}
              drawingType={drawingType}
              strokeColor={strokeColor}
              strokeWidth={strokeWidth}
              highlightColor={highlightColor}
              onShapeTypeChange={setShapeType}
              onDrawingTypeChange={setDrawingType}
              onStrokeColorChange={setStrokeColor}
              onStrokeWidthChange={setStrokeWidth}
              onHighlightColorChange={setHighlightColor}
              onImageCreate={createImageEdit}
              onSignatureCreate={createSignatureEdit}
            />
          )}
        </aside>
      </div>

      {/* Mobile Tool Menu */}
      <MobileSheet
        isOpen={showMobileToolMenu}
        onClose={() => setShowMobileToolMenu(false)}
        title="Tools"
      >
        <MobileToolMenu
          activeTool={state.activeTool}
          onToolChange={(tool) => setState((prev) => ({ ...prev, activeTool: tool }))}
          onClose={() => setShowMobileToolMenu(false)}
        />
      </MobileSheet>

      {/* Mobile Properties Panel */}
      <MobileSheet
        isOpen={showMobileProperties}
        onClose={() => setShowMobileProperties(false)}
        title="Properties"
      >
        {selectedEdit ? (
          <PropertiesPanel
            edit={selectedEdit}
            onUpdate={(updates) => {
              if (state.selectedEditId) {
                updateEdit(state.selectedEditId, updates);
              }
            }}
            onDelete={() => {
              if (state.selectedEditId) {
                deleteEdit(state.selectedEditId);
              }
            }}
          />
        ) : (
          <p className="text-sm text-gray-400 text-center py-4">
            Select an edit to view properties
          </p>
        )}
      </MobileSheet>

      {/* Mobile Sidebar */}
      <MobileSheet
        isOpen={showMobileSidebar}
        onClose={() => setShowMobileSidebar(false)}
        title="Pages & Edits"
      >
        <Sidebar
          pdfDoc={pdfDocRef.current}
          currentPage={state.currentPage}
          totalPages={state.totalPages}
          edits={state.edits}
          selectedEditId={state.selectedEditId}
          zoom={state.zoom}
          onPageChange={(page) => {
            setState((prev) => ({ ...prev, currentPage: page }));
            setShowMobileSidebar(false);
          }}
          onSelectEdit={(id) => {
            setState((prev) => ({ ...prev, selectedEditId: id }));
            setShowMobileSidebar(false);
          }}
          onDeleteEdit={deleteEdit}
          onDuplicateEdit={duplicateEdit}
        />
      </MobileSheet>

      {/* V2 tool controls are rendered in ToolSettingsPanel */}

      {/* Export Modal */}
      <Suspense fallback={<ToolLoadingFallback />}>
        <ExportModal
          file={file}
          edits={state.edits}
          isOpen={showExportModal}
          onClose={() => setShowExportModal(false)}
        />
      </Suspense>

      {/* Toast Notification for text edits */}
      {toast && (
        <div className={`fixed bottom-4 right-4 px-4 py-3 rounded text-sm z-50 animate-fade-in ${
          toast.type === 'success' 
            ? 'bg-green-600 text-white' 
            : 'bg-red-600 text-white'
        }`}>
          {toast.message}
        </div>
      )}

      {/* Inline text editing overlays rendered on canvas */}
      {extractedText.length > 0 && (
        <div className="fixed bottom-4 left-4 bg-blue-600 text-white px-3 py-2 rounded text-sm z-40">
          {extractedText.length} text items extracted. Click text on PDF to edit.
        </div>
      )}
      {textExtractionError && (
        <div className="fixed bottom-4 left-4 bg-red-600 text-white px-3 py-2 rounded text-sm z-40">
          {textExtractionError}
        </div>
      )}
    </div>
  );
}
