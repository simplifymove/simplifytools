'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Upload, Download, Trash2, Plus, Settings, X } from 'lucide-react';
import { HomeHeader } from '@/app/components/HomeHeader';
import { Footer } from '@/app/components/Footer';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

interface TextElement {
  id: string;
  page: number;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  color: string;
  fontFamily: string;
  bold: boolean;
  italic: boolean;
  underline: boolean;
  opacity: number;
  width?: number;
  hidden?: boolean; // Mark deleted extracted text
  isModified?: boolean; // Track if extracted text was edited
}

export default function AddTextToPdfPage() {
  // All hooks must be called BEFORE any conditional returns
  const [isClient, setIsClient] = useState(false);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfPages, setPdfPages] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [textElements, setTextElements] = useState<TextElement[]>([]);
  const [selectedTextId, setSelectedTextId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const [loading, setLoading] = useState(false);
  const [canvasScale, setCanvasScale] = useState(1);
  const [zoomLevel, setZoomLevel] = useState(70);
  const [isDragging, setIsDragging] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragStateRef = useRef<{ startX: number; startY: number; elementId: string } | null>(null);
  const lastClickRef = useRef<{ id: string; time: number } | null>(null);
  const lastExtractedPageRef = useRef<number>(-1);

  // Text formatting state
  const [textInput, setTextInput] = useState('');
  const [fontSize, setFontSize] = useState(16);
  const [textColor, setTextColor] = useState('#000000');
  const [fontFamily, setFontFamily] = useState('Helvetica');
  const [boldText, setBoldText] = useState(false);
  const [italicText, setItalicText] = useState(false);
  const [underlineText, setUnderlineText] = useState(false);
  const [textOpacity, setTextOpacity] = useState(1);

  // Extracted PDF text (existing text from the document)
  const [extractedText, setExtractedText] = useState<TextElement[]>([]);
  const [showExtractedText, setShowExtractedText] = useState(false);

  // Undo/Redo history
  const undoStackRef = useRef<Array<{ textElements: TextElement[]; extractedText: TextElement[] }>>([]);
  const redoStackRef = useRef<Array<{ textElements: TextElement[]; extractedText: TextElement[] }>>([]);

  // Save current state to undo stack
  const saveToUndoStack = () => {
    undoStackRef.current.push({ textElements, extractedText });
    // Limit history to 50 items
    if (undoStackRef.current.length > 50) {
      undoStackRef.current.shift();
    }
    redoStackRef.current = []; // Clear redo stack when new change is made
  };

  // Undo function
  const handleUndo = () => {
    if (undoStackRef.current.length === 0) return;
    
    const previousState = undoStackRef.current.pop();
    if (previousState) {
      // Save current state to redo stack
      redoStackRef.current.push({ textElements, extractedText });
      setTextElements(previousState.textElements);
      setExtractedText(previousState.extractedText);
    }
  };

  // Redo function
  const handleRedo = () => {
    if (redoStackRef.current.length === 0) return;
    
    const nextState = redoStackRef.current.pop();
    if (nextState) {
      // Save current state to undo stack
      undoStackRef.current.push({ textElements, extractedText });
      setTextElements(nextState.textElements);
      setExtractedText(nextState.extractedText);
    }
  };

  // Initialize client-side flag
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Keyboard shortcuts for undo/redo, delete, and copy/paste
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        handleUndo();
      } else if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.shiftKey && e.key === 'Z'))) {
        e.preventDefault();
        handleRedo();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'c' && selectedTextId && !editingId) {
        // Copy selected text to clipboard
        e.preventDefault();
        let textToCopy = '';
        
        const isExtractedText = selectedTextId.startsWith('extracted-');
        if (isExtractedText) {
          const element = extractedText.find((el) => el.id === selectedTextId);
          textToCopy = element?.text || '';
        } else {
          const element = textElements.find((el) => el.id === selectedTextId);
          textToCopy = element?.text || '';
        }
        
        if (textToCopy) {
          navigator.clipboard.writeText(textToCopy).then(() => {
            console.log('📋 Copied to clipboard:', textToCopy);
          }).catch(() => {
            console.error('Failed to copy to clipboard');
          });
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'v' && !editingId) {
        // Paste text from clipboard as new text element
        e.preventDefault();
        navigator.clipboard.readText().then((pastedText) => {
          if (!pastedText.trim()) return;
          
          console.log('📌 Pasting text:', pastedText);
          console.log('📌 Applied styles - Font Size:', fontSize, 'px, Color:', textColor, 'Font:', fontFamily, 'Bold:', boldText, 'Italic:', italicText, 'Underline:', underlineText, 'Opacity:', textOpacity);
          
          // Create new text element with current style settings
          // Position at center of visible area
          const newElement: TextElement = {
            id: `text-${Date.now()}`,
            page: currentPage,
            text: pastedText,
            x: 200, // Better default position
            y: 200,
            fontSize,
            color: textColor,
            fontFamily,
            bold: boldText,
            italic: italicText,
            underline: underlineText,
            opacity: textOpacity,
          };
          
          console.log('📌 Created new text element:', newElement);
          
          saveToUndoStack();
          setTextElements([...textElements, newElement]);
          setSelectedTextId(newElement.id);
          
          // Show detailed confirmation with styles
          const styleText = `Size: ${fontSize}px, Color: ${textColor}, Font: ${fontFamily}${boldText ? ' (Bold)' : ''}${italicText ? ' (Italic)' : ''}${underlineText ? ' (Underline)' : ''}`;
          alert('✅ Pasted with styles:\n' + styleText + '\n\nText: ' + pastedText.substring(0, 40) + (pastedText.length > 40 ? '...' : ''));
        }).catch((err) => {
          console.error('Failed to read clipboard:', err);
          alert('❌ Failed to paste from clipboard');
        });
      } else if ((e.key === 'Delete' || e.key === 'Backspace') && selectedTextId && !editingId) {
        // Delete selected text element (but not when editing text in input)
        e.preventDefault();
        console.log('🗑️ Deleting text:', selectedTextId);
        saveToUndoStack();
        
        const isExtractedText = selectedTextId.startsWith('extracted-');
        console.log('Is extracted text:', isExtractedText);
        
        if (isExtractedText) {
          setExtractedText((prev) => {
            const updated = prev.map((el) => (el.id === selectedTextId ? { ...el, hidden: true } : el));
            console.log('Updated extractedText:', updated);
            return updated;
          });
        } else {
          setTextElements((prev) => prev.filter((el) => el.id !== selectedTextId));
        }
        setSelectedTextId(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedTextId, editingId]);

  // Render current page - MUST BE BEFORE CONDITIONAL RETURN
  useEffect(() => {
    if (pdfPages.length === 0 || !canvasRef.current) return;

    const renderPage = async () => {
      try {
        const page = pdfPages[currentPage - 1];
        const scale = (zoomLevel / 100) * 1.5;
        const viewport = page.getViewport({ scale });

        const canvas = canvasRef.current!;
        const context = canvas.getContext('2d')!;

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await (page.render({ canvas, viewport }) as any).promise;
        
        // Cover deleted extracted text with white rectangles
        extractedText.forEach((el) => {
          if (el.page === currentPage && el.hidden) {
            const textWidth = el.text.length * (el.fontSize * 0.6);
            const padding = 10;
            
            context.fillStyle = 'white';
            context.fillRect(
              el.x - padding,
              el.y - el.fontSize - padding,
              textWidth + padding * 2,
              el.fontSize + padding * 2
            );
          }
        });
        
        setCanvasScale(scale);

        // Auto-extract text for this page (only once per page)
        if (lastExtractedPageRef.current !== currentPage) {
          const textContent = await page.getTextContent();
          const extractedItems: TextElement[] = [];
          let itemId = 0;

          textContent.items.forEach((item: any) => {
            if (item.str && item.str.trim()) {
              const x = (item.transform?.[4] || 0) * (viewport.scale || 1);
              const y = viewport.height - ((item.transform?.[5] || 0) * (viewport.scale || 1));
              const fontSize = Math.abs(item.transform?.[0] || 12) * (viewport.scale || 1);

              if (!isNaN(x) && !isNaN(y) && !isNaN(fontSize)) {
                extractedItems.push({
                  id: `extracted-${currentPage}-${itemId++}`,
                  page: currentPage,
                  text: item.str,
                  x,
                  y,
                  fontSize,
                  color: '#000000',
                  fontFamily: 'Arial',
                  bold: false,
                  italic: false,
                  underline: false,
                  opacity: 1,
                });
              }
            }
          });

          setExtractedText(extractedItems);
          setShowExtractedText(true);
          lastExtractedPageRef.current = currentPage;
        }
      } catch (error) {
        console.error('Error rendering page:', error);
      }
    };

    renderPage();
  }, [currentPage, pdfPages, zoomLevel]);

  // Redraw white rectangles for hidden text without re-rendering PDF
  useEffect(() => {
    if (!canvasRef.current || pdfPages.length === 0) return;

    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    if (!context) return;

    // Only redraw rectangles if there are hidden items on current page
    const hasHiddenItems = extractedText.some(el => el.page === currentPage && el.hidden);
    if (!hasHiddenItems) return;

    // Draw white rectangles for hidden extracted text
    extractedText.forEach((el) => {
      if (el.page === currentPage && el.hidden) {
        const textWidth = el.text.length * (el.fontSize * 0.6);
        const padding = 10;
        
        context.fillStyle = 'white';
        context.fillRect(
          el.x - padding,
          el.y - el.fontSize - padding,
          textWidth + padding * 2,
          el.fontSize + padding * 2
        );
      }
    });
  }, [extractedText, currentPage, pdfPages]);

  // Handle document-level mouse move for smooth dragging
  useEffect(() => {
    const handleWindowMouseMove = (e: MouseEvent) => {
      if (!dragStateRef.current || !canvasRef.current) return;

      const dragState = dragStateRef.current;
      const rect = canvasRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / canvasScale;
      const y = (e.clientY - rect.top) / canvasScale;

      const deltaX = x - dragState.startX;
      const deltaY = y - dragState.startY;

      // Update manual text elements
      setTextElements((prev) =>
        prev.map((el) =>
          el.id === dragState.elementId
            ? {
                ...el,
                x: el.x + Math.round(deltaX),
                y: el.y + Math.round(deltaY),
              }
            : el
        )
      );

      // Update extracted text elements
      setExtractedText((prev) =>
        prev.map((el) =>
          el.id === dragState.elementId
            ? {
                ...el,
                x: el.x + Math.round(deltaX),
                y: el.y + Math.round(deltaY),
              }
            : el
        )
      );

      dragState.startX = x;
      dragState.startY = y;
    };

    const handleWindowMouseUp = () => {
      dragStateRef.current = null;
      setIsDragging(false);
    };

    // Always listen for mouse move and up, not just when dragging
    window.addEventListener('mousemove', handleWindowMouseMove);
    window.addEventListener('mouseup', handleWindowMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleWindowMouseMove);
      window.removeEventListener('mouseup', handleWindowMouseUp);
    };
  }, [canvasScale]);

  // Note: Keyboard handling for editing is now done in inline input's onKeyDown handler
  // This prevents race conditions between global and local handlers

  if (!isClient) {
    return (
      <>
        <HomeHeader />
        <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100" />
        <Footer />
      </>
    );
  }

  // Handle PDF upload
  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    if (!file.type.includes('pdf')) {
      alert('Please upload a valid PDF file');
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      alert('PDF must be less than 50MB');
      return;
    }

    setPdfFile(file);
    setLoading(true);
    setTextElements([]);
    setCurrentPage(1);
    setExtractedText([]);
    lastExtractedPageRef.current = -1;

    try {
      // Import PDF.js library dynamically
      let pdfjs: any;
      
      try {
        // Try to use pdfjs-dist with proper initialization
        const pdfjsModule = await import('pdfjs-dist/legacy/build/pdf');
        pdfjs = pdfjsModule.default || pdfjsModule;
      } catch (error) {
        console.error('Failed to load pdfjs-dist:', error);
        throw new Error('Failed to load PDF library');
      }
      
      // Set worker from the same distribution
      if (pdfjs && pdfjs.GlobalWorkerOptions) {
        pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;
      }
      
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
      const pagePromises: any[] = [];

      for (let i = 1; i <= Math.min(pdf.numPages, 200); i++) {
        pagePromises.push(pdf.getPage(i));
      }

      const pages = await Promise.all(pagePromises);
      setPdfPages(pages);
      // Auto-extraction happens in render effect for all pages
    } catch (error) {
      console.error('Error loading PDF:', error);
      alert('Error loading PDF file');
    } finally {
      setLoading(false);
    }
  };

  // Extract existing text from PDF
  const extractTextFromPdf = async () => {
    if (pdfPages.length === 0) return;

    try {
      const pageIndex = currentPage - 1;
      const page = pdfPages[pageIndex];
      const textContent = await page.getTextContent();
      const viewport = page.getViewport({ scale: 1.5 });

      const extractedItems: TextElement[] = [];
      let itemId = 0;

      textContent.items.forEach((item: any) => {
        if (item.str && item.str.trim()) {
          // Extract x, y from transform matrix [scaleX, skewX, skewY, scaleY, x, y]
          const x = (item.transform?.[4] || 0) * (viewport.scale || 1);
          const y = viewport.height - ((item.transform?.[5] || 0) * (viewport.scale || 1));
          const fontSize = Math.abs(item.transform?.[0] || 12) * (viewport.scale || 1);

          // Only add if coordinates are valid numbers
          if (!isNaN(x) && !isNaN(y) && !isNaN(fontSize)) {
            extractedItems.push({
              id: `extracted-${currentPage}-${itemId++}`,
              page: currentPage,
              text: item.str,
              x,
              y,
              fontSize,
              color: '#000000',
              fontFamily: 'Arial',
              bold: false,
              italic: false,
              underline: false,
              opacity: 1,
            });
          }
        }
      });

      setExtractedText(extractedItems);
      setShowExtractedText(true);
    } catch (error) {
      console.error('Error extracting text:', error);
      alert('Could not extract text from PDF');
    }
  };

  // Add text element
  const addTextElement = () => {
    if (!textInput.trim()) {
      alert('Please enter text');
      return;
    }

    console.log('📝 Adding text element:', textInput);
    console.log('Current page:', currentPage, 'Canvas ref:', canvasRef.current);

    const newElement: TextElement = {
      id: `text-${Date.now()}`,
      page: currentPage,
      text: textInput,
      x: 100, // Better default position
      y: 150,
      fontSize,
      color: textColor,
      fontFamily,
      bold: boldText,
      italic: italicText,
      underline: underlineText,
      opacity: textOpacity,
    };

    console.log('✅ Created new element:', newElement);
    
    saveToUndoStack();
    setTextElements((prev) => {
      const updated = [...prev, newElement];
      console.log('📚 Updated textElements:', updated);
      return updated;
    });
    setTextInput('');
    setSelectedTextId(newElement.id);
    
    alert('✅ Text added! Drag it to reposition if needed.');
  };

  // Handle text element drag and selection
  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const x = (e.clientX - rect.left) / canvasScale;
    const y = (e.clientY - rect.top) / canvasScale;

    // Check if clicking on existing text element
    for (const element of textElements.filter((el) => el.page === currentPage)) {
      const textWidth = element.text.length * (element.fontSize * 0.6);
      // Large click area for easier selection
      const padding = 15;
      if (
        x >= element.x - padding &&
        x <= element.x + textWidth + padding &&
        y >= element.y - element.fontSize - padding &&
        y <= element.y + padding
      ) {
        setSelectedTextId(element.id);
        saveToUndoStack(); // Save state before dragging
        dragStateRef.current = { startX: x, startY: y, elementId: element.id };
        setIsDragging(true);
        e.preventDefault();
        return;
      }
    }

    // Don't create text on click - only use "Add Text" button
    setSelectedTextId(null);
  };

  // Handle direct SVG text click - start dragging on single click
  const handleSvgTextMouseDown = (e: React.MouseEvent<SVGSVGElement>, elementId: string) => {
    if (!canvasRef.current) return;
    
    // Single click - select and prepare for dragging
    setSelectedTextId(elementId);
    saveToUndoStack(); // Save state before dragging
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / canvasScale;
    const y = (e.clientY - rect.top) / canvasScale;
    
    dragStateRef.current = { startX: x, startY: y, elementId };
    setIsDragging(true);
    
    e.preventDefault();
    e.stopPropagation();
  };

  // Handle double-click to edit text
  const handleSvgTextDoubleClick = (e: React.MouseEvent<SVGSVGElement>, elementId: string) => {
    e.preventDefault();
    e.stopPropagation();
    startEditing(elementId);
  };

  // Handle mouse move for dragging
  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement | SVGSVGElement>) => {
    // Handled by document-level listeners when dragging
  };

  // Handle mouse up
  const handleCanvasMouseUp = (e: React.MouseEvent<HTMLCanvasElement | SVGSVGElement>) => {
    // Handled by document-level listeners
  };

  // Update selected text
  const updateSelectedText = (updates: Partial<TextElement>) => {
    if (!selectedTextId) return;
    saveToUndoStack();
    setTextElements((prev) =>
      prev.map((el) => (el.id === selectedTextId ? { ...el, ...updates } : el))
    );
  };

  // Delete text element
  const deleteSelectedText = () => {
    if (!selectedTextId) return;
    saveToUndoStack();
    
    // Check if it's extracted text or manual text
    const isExtractedText = selectedTextId.startsWith('extracted-');
    
    if (isExtractedText) {
      // Mark extracted text as hidden
      setExtractedText((prev) =>
        prev.map((el) => (el.id === selectedTextId ? { ...el, hidden: true } : el))
      );
    } else {
      // Delete manual text
      setTextElements((prev) => prev.filter((el) => el.id !== selectedTextId));
    }
    
    setSelectedTextId(null);
  };

  // Start editing text
  const startEditing = (elementId: string) => {
    const element = textElements.find((el) => el.id === elementId);
    if (element) {
      setEditingId(elementId);
      setEditingText(element.text);
      setSelectedTextId(elementId);
    }
  };

  // Save edited text with current styles
  const saveEdit = () => {
    if (!editingId) return;
    
    updateSelectedText({ 
      text: editingText,
      fontSize,
      color: textColor,
      fontFamily,
      bold: boldText,
      italic: italicText,
      underline: underlineText,
      opacity: textOpacity,
    });
    
    setEditingId(null);
    setEditingText('');
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditingId(null);
    setEditingText('');
  };

  // Export PDF with text
  const exportPdf = async () => {
    if (!pdfFile) return;

    setLoading(true);
    try {
      // Dynamically import pdf-lib
      const { PDFDocument, rgb } = await import('pdf-lib');
      
      const arrayBuffer = await pdfFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pages = pdfDoc.getPages();

      // Export only manually added text (extracted text editing is view-only)
      // To modify extracted text: delete it (covered with white) and add new text instead
      const allText = textElements;

      // Group text elements by page
      const elementsByPage: Record<number, TextElement[]> = {};
      allText.forEach((el) => {
        if (!elementsByPage[el.page]) elementsByPage[el.page] = [];
        elementsByPage[el.page].push(el);
      });

      // Add text to each page
      for (const pageNum in elementsByPage) {
        const pageIndex = parseInt(pageNum) - 1;
        if (pageIndex < 0 || pageIndex >= pages.length) continue;

        const page = pages[pageIndex];
        const { height } = page.getSize();

        elementsByPage[pageNum].forEach((textEl) => {
          const [r, g, b] = textEl.color.match(/\w\w/g)!.map((x) => parseInt(x, 16) / 255);

          page.drawText(textEl.text, {
            x: textEl.x,
            y: height - textEl.y,
            size: textEl.fontSize,
            color: rgb(r, g, b),
            opacity: textEl.opacity,
          });
        });
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([new Uint8Array(pdfBytes as any)], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${pdfFile.name.replace('.pdf', '')}_with_text.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert('Error exporting PDF');
    } finally {
      setLoading(false);
    }
  };

  const selectedElement = textElements.find((el) => el.id === selectedTextId);

  return (
    <>
      <HomeHeader />
      <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col">
        {/* Hero Section */}
        <div className="relative bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 py-16 px-4 md:px-8 overflow-hidden">
          <motion.div
            className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full mix-blend-multiply filter blur-3xl"
            animate={{ x: [0, 30, -20, 0], y: [0, -30, 20, 0] }}
            transition={{ duration: 10, repeat: Infinity }}
          />

          <div className="max-w-6xl mx-auto relative z-10 w-full">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center gap-2 text-white/80 text-sm mb-6">
                <Link href="/" className="hover:text-white transition">
                  Home
                </Link>
                <ChevronRight size={16} />
                <Link href="/all-tools" className="hover:text-white transition">
                  All Tools
                </Link>
                <ChevronRight size={16} />
                <Link href="/all-tools/pdf" className="hover:text-white transition">
                  PDF Tools
                </Link>
                <ChevronRight size={16} />
                <span>Add Text to PDF</span>
              </div>

              <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">✍️ Add Text to PDF</h1>
              <p className="text-lg text-white/90 max-w-2xl">
                Add custom text anywhere on your PDF. Click on text to edit inline, modify styles, and export with precision.
              </p>
            </motion.div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 py-8 px-4 md:px-8">
          <div className="max-w-7xl mx-auto">
            {!pdfFile ? (
              // Upload Section
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div
                  className="border-4 border-dashed border-blue-300 rounded-2xl bg-white p-12 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="mx-auto mb-4 text-blue-600" size={48} />
                  <h2 className="text-2xl font-bold mb-2 text-gray-800">Upload Your PDF</h2>
                  <p className="text-gray-600 mb-4">Drag and drop your PDF file or click to browse</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf"
                    onChange={handlePdfUpload}
                    className="hidden"
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-all"
                  >
                    Select PDF File
                  </button>
                </div>
              </motion.div>
            ) : (
              // Editor Section
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="grid grid-cols-1 lg:grid-cols-6 gap-4"
              >
                {/* Canvas Area */}
                <div className="lg:col-span-4">
                  <div className="bg-white rounded-lg shadow-lg p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-bold text-gray-800">Page {currentPage}</h3>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setZoomLevel(Math.max(50, zoomLevel - 10))}
                          className="px-3 py-1 bg-gray-200 rounded text-sm hover:bg-gray-300 transition"
                        >
                          -
                        </button>
                        <span className="px-3 py-1 bg-gray-100 rounded text-sm">{zoomLevel}%</span>
                        <button
                          onClick={() => setZoomLevel(Math.min(200, zoomLevel + 10))}
                          className="px-3 py-1 bg-gray-200 rounded text-sm hover:bg-gray-300 transition"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div className="border border-gray-300 rounded-lg overflow-hidden bg-gray-200 flex items-center justify-center" style={{ height: '100vh', maxHeight: 'calc(100vh - 100px)' }}>
                      <div style={{ position: 'relative', display: 'inline-block' }}>
                        <canvas
                          ref={canvasRef}
                          onMouseDown={handleCanvasMouseDown}
                          onMouseMove={handleCanvasMouseMove}
                          onMouseUp={handleCanvasMouseUp}
                          onMouseLeave={handleCanvasMouseUp}
                          className="cursor-pointer max-w-full max-h-full"
                          style={{
                            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                            display: 'block',
                          }}
                          title="Click on text to select and edit"
                        />

                        {/* Text Overlay */}
                        <svg
                          style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: canvasRef.current?.width,
                            height: canvasRef.current?.height,
                            pointerEvents: 'auto',
                          }}
                          onMouseMove={handleCanvasMouseMove}
                          onMouseUp={handleCanvasMouseUp}
                          onMouseLeave={handleCanvasMouseUp}
                        >
                          {textElements
                            .filter((el) => el.page === currentPage)
                            .map((el) => {
                              const textWidth = el.text.length * (el.fontSize * 0.6);
                              const padding = 15;
                              return (
                                <g key={el.id}>
                                  {/* Invisible hit detection rectangle - makes text easy to select, drag, and edit */}
                                  <rect
                                    x={el.x - padding}
                                    y={el.y - el.fontSize - padding}
                                    width={textWidth + padding * 2}
                                    height={el.fontSize + padding * 2}
                                    fill="transparent"
                                    onMouseDown={(e) => handleSvgTextMouseDown(e as any, el.id)}
                                    onDoubleClick={(e) => handleSvgTextDoubleClick(e as any, el.id)}
                                    onContextMenu={(e) => {
                                      // Right-click copy for manual text
                                      e.preventDefault();
                                      e.stopPropagation();
                                      navigator.clipboard.writeText(el.text).then(() => {
                                        console.log('📋 Copied to clipboard via right-click:', el.text);
                                        alert('✅ Copied: ' + el.text.substring(0, 30) + (el.text.length > 30 ? '...' : ''));
                                      }).catch(() => {
                                        console.error('Failed to copy to clipboard');
                                      });
                                    }}
                                    style={{ cursor: 'move', pointerEvents: 'auto' }}
                                  />
                                  {/* Selection box around selected text */}
                                  {selectedTextId === el.id && (
                                    <rect
                                      x={el.x - padding}
                                      y={el.y - el.fontSize - padding}
                                      width={textWidth + padding * 2}
                                      height={el.fontSize + padding * 2}
                                      fill="none"
                                      stroke="#3b82f6"
                                      strokeWidth="2"
                                      strokeDasharray="5,5"
                                      pointerEvents="none"
                                    />
                                  )}
                                  {/* Hover highlight for unselected text */}
                                  {selectedTextId !== el.id && (
                                    <rect
                                      x={el.x - padding}
                                      y={el.y - el.fontSize - padding}
                                      width={textWidth + padding * 2}
                                      height={el.fontSize + padding * 2}
                                      fill="rgba(59, 130, 246, 0.05)"
                                      opacity="0"
                                      style={{ transition: 'opacity 0.2s' }}
                                      onMouseEnter={(e) => {
                                        (e.target as SVGRectElement).style.opacity = '1';
                                      }}
                                      onMouseLeave={(e) => {
                                        (e.target as SVGRectElement).style.opacity = '0';
                                      }}
                                      pointerEvents="none"
                                    />
                                  )}
                                  {/* The text itself - only show if not editing */}
                                  {editingId !== el.id && (
                                    <text
                                      x={el.x}
                                      y={el.y}
                                      fontSize={el.fontSize}
                                      fill={el.color}
                                      opacity={el.opacity}
                                      fontWeight={el.bold ? 'bold' : 'normal'}
                                      fontStyle={el.italic ? 'italic' : 'normal'}
                                      textDecoration={el.underline ? 'underline' : 'none'}
                                      fontFamily={el.fontFamily}
                                      pointerEvents="none"
                                      style={{
                                        userSelect: 'text',
                                        cursor: 'text',
                                      }}
                                    >
                                      {el.text}
                                    </text>
                                  )}
                                </g>
                              );
                            })}

                          {/* Render extracted PDF text (skip hidden) */}
                          {showExtractedText && extractedText
                            .filter((el) => el.page === currentPage && !el.hidden)
                            .map((el) => {
                              const textWidth = el.text.length * (el.fontSize * 0.6);
                              const padding = 8;
                              
                              return (
                                <g key={el.id}>
                                  {/* Hit detection rectangle - transparent, clickable */}
                                  <rect
                                    x={el.x - padding}
                                    y={el.y - el.fontSize - padding}
                                    width={textWidth + padding * 2}
                                    height={el.fontSize + padding * 2}
                                    fill="transparent"
                                    onMouseDown={(e) => {
                                      setSelectedTextId(el.id);
                                      saveToUndoStack(); // Save state before dragging
                                      if (!canvasRef.current) return;
                                      const rect = canvasRef.current.getBoundingClientRect();
                                      const x = (e.clientX - rect.left) / canvasScale;
                                      const y = (e.clientY - rect.top) / canvasScale;
                                      dragStateRef.current = { startX: x, startY: y, elementId: el.id };
                                      setIsDragging(true);
                                      e.preventDefault();
                                      e.stopPropagation();
                                    }}
                                    onContextMenu={(e) => {
                                      // Right-click copy
                                      e.preventDefault();
                                      e.stopPropagation();
                                      navigator.clipboard.writeText(el.text).then(() => {
                                        console.log('📋 Copied to clipboard via right-click:', el.text);
                                        alert('✅ Copied: ' + el.text.substring(0, 30) + (el.text.length > 30 ? '...' : ''));
                                      }).catch(() => {
                                        console.error('Failed to copy to clipboard');
                                      });
                                    }}
                                    onDoubleClick={(e) => {
                                      setEditingId(el.id);
                                      setEditingText(el.text);
                                      setSelectedTextId(el.id);
                                      e.preventDefault();
                                      e.stopPropagation();
                                    }}
                                    style={{ cursor: 'move', pointerEvents: 'auto' }}
                                  />
                                  {/* Selection box for extracted text - ONLY when selected */}
                                  {selectedTextId === el.id && (
                                    <rect
                                      x={el.x - padding}
                                      y={el.y - el.fontSize - padding}
                                      width={textWidth + padding * 2}
                                      height={el.fontSize + padding * 2}
                                      fill="none"
                                      stroke="#f59e0b"
                                      strokeWidth="2"
                                      strokeDasharray="5,5"
                                      pointerEvents="none"
                                    />
                                  )}
                                  {/* Render extracted text on top - replaces canvas text */}
                                  {editingId !== el.id && (
                                    <text
                                      x={el.x}
                                      y={el.y}
                                      fontSize={el.fontSize}
                                      fill={el.color}
                                      opacity={el.opacity}
                                      fontWeight={el.bold ? 'bold' : 'normal'}
                                      fontStyle={el.italic ? 'italic' : 'normal'}
                                      textDecoration={el.underline ? 'underline' : 'none'}
                                      fontFamily={el.fontFamily}
                                      pointerEvents="none"
                                      style={{
                                        userSelect: 'text',
                                        cursor: 'text',
                                      }}
                                    >
                                      {el.text}
                                    </text>
                                  )}
                                </g>
                              );
                            })}
                        </svg>

                        {/* Inline Editing Input - appears directly on the text when editing */}
                        {editingId && canvasRef.current && (() => {
                          let editElement = textElements.find((el) => el.id === editingId);
                          // Also check extracted text
                          if (!editElement && showExtractedText) {
                            editElement = extractedText.find((el) => el.id === editingId);
                          }
                          if (!editElement) return null;

                          return (
                            <input
                              key={`edit-${editingId}`}
                              autoFocus
                              type="text"
                              value={editingText}
                              onChange={(e) => setEditingText(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Delete' || e.key === 'Backspace') {
                                  // Both Delete and Backspace delete the entire element immediately
                                  e.preventDefault();
                                  console.log('🗑️ Deleting element via', e.key, ':', editingId);
                                  saveToUndoStack();
                                  
                                  const isExtractedText = editingId.startsWith('extracted-');
                                  if (isExtractedText) {
                                    setExtractedText((prev) =>
                                      prev.map((el) => (el.id === editingId ? { ...el, hidden: true } : el))
                                    );
                                  } else {
                                    setTextElements((prev) => prev.filter((el) => el.id !== editingId));
                                  }
                                  
                                  setEditingId(null);
                                  setEditingText('');
                                  setSelectedTextId(null);
                                } else if (e.key === 'Enter') {
                                  e.preventDefault();
                                  saveToUndoStack();
                                  
                                  // Update extracted text OR manual text with the new text and styles
                                  const isExtractedText = editingId.startsWith('extracted-');
                                  
                                  if (isExtractedText) {
                                    setExtractedText((prev) => {
                                      return prev.map((el) =>
                                        el.id === editingId
                                          ? {
                                              ...el,
                                              text: editingText,
                                              fontSize,
                                              color: textColor,
                                              fontFamily,
                                              bold: boldText,
                                              italic: italicText,
                                              underline: underlineText,
                                              opacity: textOpacity,
                                              isModified: true,
                                            }
                                          : el
                                      );
                                    });
                                  } else {
                                    // Update manual text (including pasted text)
                                    setTextElements((prev) => {
                                      return prev.map((el) =>
                                        el.id === editingId
                                          ? {
                                              ...el,
                                              text: editingText,
                                              fontSize,
                                              color: textColor,
                                              fontFamily,
                                              bold: boldText,
                                              italic: italicText,
                                              underline: underlineText,
                                              opacity: textOpacity,
                                            }
                                          : el
                                      );
                                    });
                                  }
                                  
                                  setEditingId(null);
                                  setEditingText('');
                                } else if (e.key === 'Escape') {
                                  e.preventDefault();
                                  setEditingId(null);
                                  setEditingText('');
                                }
                              }}
                              style={{
                                position: 'absolute',
                                left: `${editElement.x}px`,
                                top: `${editElement.y - fontSize * 0.8}px`,
                                fontSize: `${fontSize}px`,
                                fontFamily: fontFamily,
                                fontWeight: boldText ? 'bold' : 'normal',
                                fontStyle: italicText ? 'italic' : 'normal',
                                textDecoration: underlineText ? 'underline' : 'none',
                                color: textColor,
                                opacity: textOpacity,
                                border: '2px solid #3b82f6',
                                backgroundColor: 'rgba(255,255,255,0.95)',
                                padding: '4px 8px',
                                borderRadius: '4px',
                                zIndex: 100,
                                minWidth: '100px',
                              }}
                            />
                          );
                        })()}
                      </div>
                    </div>

                    {/* Page Navigation */}
                    {pdfPages.length > 0 && (
                      <div className="flex justify-between items-center mt-4">
                        <button
                          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                          disabled={currentPage === 1}
                          className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50 hover:bg-gray-300 transition"
                        >
                          Previous
                        </button>
                        <span className="text-sm text-gray-600">
                          Page {currentPage} of {pdfPages.length}
                        </span>
                        <button
                          onClick={() => setCurrentPage(Math.min(pdfPages.length, currentPage + 1))}
                          disabled={currentPage === pdfPages.length}
                          className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50 hover:bg-gray-300 transition"
                        >
                          Next
                        </button>
                      </div>
                    )}

                    {/* Tips */}
                    <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4 text-sm text-green-700">
                      <p className="font-semibold mb-2">💡 How to use:</p>
                      <ol className="list-decimal list-inside space-y-1">
                        <li><strong>View extracted text:</strong> PDF text auto-extracts with amber boxes</li>
                        <li><strong>Delete extracted text:</strong> Select and click trash icon (covered with white, removed from export)</li>
                        <li><strong>To modify extracted text:</strong> Delete it first, then add new text with correct content</li>
                        <li><strong>Add new text:</strong> Set styles in left panel, enter text, click "Add Text"</li>
                        <li>Customize styles: font, color, size, bold, italic, underline, opacity</li>
                        <li>Drag any text to reposition it on the page</li>
                        <li>Export includes: original PDF + deleted text areas (white) + any manually added text</li>
                      </ol>
                    </div>
                  </div>
                </div>

                {/* Right Panel - Controls */}
                <div className="lg:col-span-2 space-y-4 overflow-y-auto" style={{ maxHeight: '750px' }}>
                  {/* Add Text Panel */}
                  <div className="bg-white rounded-lg shadow-lg p-6">
                    <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                      <Plus size={18} />
                      Add Text
                    </h3>

                    <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-4 text-sm text-blue-700">
                      📝 Add new text or delete extracted text. Tip: To modify extracted text, delete it first, then add new text.
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Text</label>
                        <textarea
                          value={textInput}
                          onChange={(e) => setTextInput(e.target.value)}
                          placeholder="Enter text..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          rows={3}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Font Size</label>
                        <input
                          type="number"
                          min="8"
                          max="72"
                          value={fontSize}
                          onChange={(e) => setFontSize(parseInt(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Color</label>
                        <input
                          type="color"
                          value={textColor}
                          onChange={(e) => setTextColor(e.target.value)}
                          className="w-full h-10 rounded-lg cursor-pointer"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Opacity</label>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.1"
                          value={textOpacity}
                          onChange={(e) => setTextOpacity(parseFloat(e.target.value))}
                          className="w-full"
                        />
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => setBoldText(!boldText)}
                          className={`flex-1 py-2 px-2 rounded font-bold text-sm transition ${
                            boldText ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                          }`}
                        >
                          B
                        </button>
                        <button
                          onClick={() => setItalicText(!italicText)}
                          className={`flex-1 py-2 px-2 rounded italic text-sm transition ${
                            italicText ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                          }`}
                        >
                          I
                        </button>
                        <button
                          onClick={() => setUnderlineText(!underlineText)}
                          className={`flex-1 py-2 px-2 rounded underline text-sm transition ${
                            underlineText ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                          }`}
                        >
                          U
                        </button>
                      </div>

                      <button
                        onClick={addTextElement}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition"
                      >
                        Add Text
                      </button>

                      {selectedTextId && (
                        <button
                          onClick={deleteSelectedText}
                          className="w-full mt-2 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 rounded-lg transition"
                        >
                          Delete Selected
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Export Section */}
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg shadow-lg p-6 border border-green-200">
                    <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                      <Download size={18} />
                      Export
                    </h3>

                    <p className="text-sm text-gray-600 mb-4">
                      {textElements.length > 0 && `${textElements.length} text element${textElements.length !== 1 ? 's' : ''} added • `}
                      {extractedText.filter(el => el.hidden).length > 0 && `${extractedText.filter(el => el.hidden).length} text element${extractedText.filter(el => el.hidden).length !== 1 ? 's' : ''} deleted • `}
                      {textElements.length === 0 && extractedText.filter(el => el.hidden).length === 0 ? 'Ready to download' : ''}
                    </p>

                    <button
                      onClick={exportPdf}
                      disabled={loading || !pdfFile}
                      className="w-full mt-3 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2"
                    >
                      {loading ? 'Exporting...' : 'Download PDF'}
                    </button>

                    <button
                      onClick={() => {
                        setPdfFile(null);
                        setPdfPages([]);
                        setTextElements([]);
                        setExtractedText([]);
                        setShowExtractedText(false);
                        setSelectedTextId(null);
                        setEditingId(null);
                        setCurrentPage(1);
                      }}
                      className="w-full mt-3 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 rounded-lg transition"
                    >
                      Start Over
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        <Footer />
      </main>
    </>
  );
}

