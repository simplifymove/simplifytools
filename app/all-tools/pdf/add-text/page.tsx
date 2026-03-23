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
}

export default function AddTextToPdfPage() {
  // All hooks must be called BEFORE any conditional returns
  const [isClient, setIsClient] = useState(false);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfPages, setPdfPages] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [textElements, setTextElements] = useState<TextElement[]>([]);
  const [selectedTextId, setSelectedTextId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [canvasScale, setCanvasScale] = useState(1);
  const [zoomLevel, setZoomLevel] = useState(100);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragStateRef = useRef<{ startX: number; startY: number; elementId: string } | null>(null);

  // Text formatting state
  const [textInput, setTextInput] = useState('');
  const [fontSize, setFontSize] = useState(16);
  const [textColor, setTextColor] = useState('#000000');
  const [fontFamily, setFontFamily] = useState('Helvetica');
  const [boldText, setBoldText] = useState(false);
  const [italicText, setItalicText] = useState(false);
  const [underlineText, setUnderlineText] = useState(false);
  const [textOpacity, setTextOpacity] = useState(1);

  // Initialize client-side flag
  useEffect(() => {
    setIsClient(true);
  }, []);

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

        await page.render({ canvasContext: context, viewport }).promise;
        setCanvasScale(scale);
      } catch (error) {
        console.error('Error rendering page:', error);
      }
    };

    renderPage();
  }, [currentPage, pdfPages, zoomLevel]);

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

    try {
      // Dynamically import pdf-js
      const pdfjsLib = await import('pdfjs-dist');
      pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
      
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const pages: any[] = [];

      for (let i = 1; i <= Math.min(pdf.numPages, 200); i++) {
        pages.push(pdf.getPage(i));
      }

      setPdfPages(pages);
    } catch (error) {
      console.error('Error loading PDF:', error);
      alert('Error loading PDF file');
    } finally {
      setLoading(false);
    }
  };

  // Add text element
  const addTextElement = () => {
    if (!textInput.trim()) {
      alert('Please enter text');
      return;
    }

    const newElement: TextElement = {
      id: Date.now().toString(),
      page: currentPage,
      text: textInput,
      x: 50,
      y: 50,
      fontSize,
      color: textColor,
      fontFamily,
      bold: boldText,
      italic: italicText,
      underline: underlineText,
      opacity: textOpacity,
    };

    setTextElements([...textElements, newElement]);
    setTextInput('');
    setSelectedTextId(newElement.id);
  };

  // Handle text element drag
  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const x = (e.clientX - rect.left) / canvasScale;
    const y = (e.clientY - rect.top) / canvasScale;

    // Check if clicking on existing text element
    for (const element of textElements.filter((el) => el.page === currentPage)) {
      const textWidth = element.text.length * (element.fontSize * 0.6);
      if (x >= element.x && x <= element.x + textWidth && y >= element.y - element.fontSize && y <= element.y + 5) {
        setSelectedTextId(element.id);
        dragStateRef.current = { startX: x, startY: y, elementId: element.id };
        return;
      }
    }

    // Click to add text
    const newElement: TextElement = {
      id: Date.now().toString(),
      page: currentPage,
      text: 'New Text',
      x: Math.round(x),
      y: Math.round(y),
      fontSize: 14,
      color: '#000000',
      fontFamily: 'Helvetica',
      bold: false,
      italic: false,
      underline: false,
      opacity: 1,
    };

    setTextElements([...textElements, newElement]);
    setSelectedTextId(newElement.id);
  };

  // Handle mouse move for dragging
  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!dragStateRef.current) return;

    const rect = canvasRef.current!.getBoundingClientRect();
    const x = (e.clientX - rect.left) / canvasScale;
    const y = (e.clientY - rect.top) / canvasScale;

    setTextElements((prev) =>
      prev.map((el) =>
        el.id === dragStateRef.current!.elementId
          ? {
              ...el,
              x: Math.round(el.x + (x - dragStateRef.current!.startX)),
              y: Math.round(el.y + (y - dragStateRef.current!.startY)),
            }
          : el
      )
    );

    dragStateRef.current.startX = x;
    dragStateRef.current.startY = y;
  };

  // Handle mouse up
  const handleCanvasMouseUp = () => {
    dragStateRef.current = null;
  };

  // Update selected text
  const updateSelectedText = (updates: Partial<TextElement>) => {
    if (!selectedTextId) return;
    setTextElements((prev) =>
      prev.map((el) => (el.id === selectedTextId ? { ...el, ...updates } : el))
    );
  };

  // Delete text element
  const deleteSelectedText = () => {
    if (!selectedTextId) return;
    setTextElements((prev) => prev.filter((el) => el.id !== selectedTextId));
    setSelectedTextId(null);
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

      // Group text elements by page
      const elementsByPage: Record<number, TextElement[]> = {};
      textElements.forEach((el) => {
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
                Add custom text anywhere on your PDF pages. Click to place, drag to adjust, and export with precision.
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
                className="grid grid-cols-1 lg:grid-cols-4 gap-6"
              >
                {/* Canvas Area */}
                <div className="lg:col-span-3">
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

                    <div className="border border-gray-300 rounded-lg overflow-auto bg-gray-200 flex items-center justify-center" style={{ height: '600px' }}>
                      <div style={{ position: 'relative', display: 'inline-block' }}>
                        <canvas
                          ref={canvasRef}
                          onMouseDown={handleCanvasMouseDown}
                          onMouseMove={handleCanvasMouseMove}
                          onMouseUp={handleCanvasMouseUp}
                          onMouseLeave={handleCanvasMouseUp}
                          className="cursor-crosshair max-w-full max-h-full"
                          style={{
                            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                            display: 'block',
                          }}
                        />

                        {/* Text Overlay */}
                        <svg
                          style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: canvasRef.current?.width,
                            height: canvasRef.current?.height,
                            pointerEvents: 'none',
                          }}
                        >
                          {textElements
                            .filter((el) => el.page === currentPage)
                            .map((el) => (
                              <text
                                key={el.id}
                                x={el.x}
                                y={el.y}
                                fontSize={el.fontSize}
                                fill={el.color}
                                opacity={el.opacity}
                                fontWeight={el.bold ? 'bold' : 'normal'}
                                fontStyle={el.italic ? 'italic' : 'normal'}
                                textDecoration={el.underline ? 'underline' : 'none'}
                                fontFamily={el.fontFamily}
                                style={{
                                  cursor: 'pointer',
                                  stroke: selectedTextId === el.id ? '#3b82f6' : 'none',
                                  strokeWidth: '1',
                                }}
                              >
                                {el.text}
                              </text>
                            ))}
                        </svg>
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
                  </div>
                </div>

                {/* Right Panel - Controls */}
                <div className="lg:col-span-1 space-y-6">
                  {/* Add Text Panel */}
                  <div className="bg-white rounded-lg shadow-lg p-6">
                    <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                      <Plus size={18} />
                      Add Text
                    </h3>

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
                    </div>
                  </div>

                  {/* Properties Panel */}
                  {selectedElement && (
                    <div className="bg-white rounded-lg shadow-lg p-6">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-gray-800 flex items-center gap-2">
                          <Settings size={18} />
                          Properties
                        </h3>
                        <button
                          onClick={deleteSelectedText}
                          className="text-red-600 hover:text-red-700 transition"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>

                      <div className="space-y-3 text-sm">
                        <div className="bg-gray-100 p-2 rounded">
                          <p className="text-gray-600 font-semibold">Text:</p>
                          <p className="text-gray-800">{selectedElement.text}</p>
                        </div>

                        <div>
                          <label className="block text-gray-600 font-semibold mb-1">Text Content</label>
                          <textarea
                            value={selectedElement.text}
                            onChange={(e) => updateSelectedText({ text: e.target.value })}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            rows={2}
                          />
                        </div>

                        <div>
                          <label className="block text-gray-600 font-semibold mb-1">Size</label>
                          <input
                            type="number"
                            min="8"
                            max="72"
                            value={selectedElement.fontSize}
                            onChange={(e) => updateSelectedText({ fontSize: parseInt(e.target.value) })}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block text-gray-600 font-semibold mb-1">X: {selectedElement.x}</label>
                          <input
                            type="range"
                            min="0"
                            max="800"
                            value={selectedElement.x}
                            onChange={(e) => updateSelectedText({ x: parseInt(e.target.value) })}
                            className="w-full"
                          />
                        </div>

                        <div>
                          <label className="block text-gray-600 font-semibold mb-1">Y: {selectedElement.y}</label>
                          <input
                            type="range"
                            min="0"
                            max="1000"
                            value={selectedElement.y}
                            onChange={(e) => updateSelectedText({ y: parseInt(e.target.value) })}
                            className="w-full"
                          />
                        </div>

                        <button
                          onClick={deleteSelectedText}
                          className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 rounded transition mt-4"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Export Section */}
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg shadow-lg p-6 border border-green-200">
                    <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                      <Download size={18} />
                      Export
                    </h3>

                    <p className="text-sm text-gray-600 mb-4">
                      {textElements.length} text element{textElements.length !== 1 ? 's' : ''} added
                    </p>

                    <button
                      onClick={exportPdf}
                      disabled={loading || textElements.length === 0}
                      className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2"
                    >
                      {loading ? 'Exporting...' : 'Download PDF'}
                    </button>

                    <button
                      onClick={() => {
                        setPdfFile(null);
                        setPdfPages([]);
                        setTextElements([]);
                        setSelectedTextId(null);
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
