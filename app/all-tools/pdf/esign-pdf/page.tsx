'use client';

import React, { useState, useRef, useEffect } from 'react';
import { FileUp, Download, X, ZoomIn, ZoomOut, ChevronRight } from 'lucide-react';
import SignaturePad from 'signature_pad';
import { Footer } from '@/app/components/Footer';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { HomeHeader } from '@/app/components/HomeHeader';
import { useRouter } from 'next/navigation';
import { readDownloadResultResponse } from '@/app/lib/download-result-client';

interface SignatureData {
  type: 'image';
  imageData: string;
  x: number;
  y: number;
  width: number;
  height: number;
  page: number;
}

export const dynamic = 'force-dynamic';

let pdfjsLib: any;

export default function EsignPdfPage() {
  const router = useRouter();
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [pdfPages, setPdfPages] = useState<HTMLCanvasElement[]>([]);
  const [signatures, setSignatures] = useState<SignatureData[]>([]);
  const [selectedSig, setSelectedSig] = useState<number | null>(null);
  const [copiedSig, setCopiedSig] = useState<SignatureData | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, sigX: 0, sigY: 0 });
  const [isProcessing, setIsProcessing] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(0.8);
  const [showSignaturePad, setShowSignaturePad] = useState(false);
  const [signingPageIdx, setSigningPageIdx] = useState<number | null>(null);
  const [signingPosition, setSigningPosition] = useState<{ x: number; y: number } | null>(null);
  const [signingSize, setSigningSize] = useState({ width: 150, height: 75 });
  const [showPasteMenu, setShowPasteMenu] = useState(false);

  const previewRef = useRef<HTMLDivElement>(null);
  const signaturePadRef = useRef<any>(null);
  const signaturePadCanvas = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loadPdfJs = async () => {
      try {
        pdfjsLib = await import('pdfjs-dist');
        pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.js';
      } catch (error) {
        console.error('Failed to load pdfjs:', error);
      }
    };
    loadPdfJs();
  }, []);

  useEffect(() => {
    if (showSignaturePad && signaturePadCanvas.current && !signaturePadRef.current) {
      const canvas = signaturePadCanvas.current;
      const ratio = Math.max(window.devicePixelRatio || 1, 1);
      canvas.width = canvas.offsetWidth * ratio;
      canvas.height = canvas.offsetHeight * ratio;
      
      // Clear with transparent background
      const ctx = canvas.getContext('2d')!;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.scale(ratio, ratio);

      // Create SignaturePad without background color (transparent)
      signaturePadRef.current = new SignaturePad(canvas, {
        penColor: 'rgb(0, 0, 0)',
      });
    }
  }, [showSignaturePad]);

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || file.type !== 'application/pdf' || !pdfjsLib) return;

    setPdfFile(file);
    setSignatures([]);
    setSelectedSig(null);
    setPdfPages([]);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      setPdfDoc(pdf);
      setTotalPages(pdf.numPages);

      const pages: HTMLCanvasElement[] = [];

      for (let i = 1; i <= Math.min(pdf.numPages, 10); i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 1.5 });
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const context = canvas.getContext('2d');
        if (context) {
          try {
            await page.render({ canvas: canvas, viewport: viewport }).promise;
          } catch (e) {
            await page.render({ canvasContext: context, viewport: viewport } as any).promise;
          }
          pages.push(canvas);
        }
      }

      setPdfPages(pages);
      console.log(`[ESIGN] PDF loaded: ${pdf.numPages} pages`);
    } catch (error) {
      alert('Error loading PDF: ' + (error as Error).message);
      setPdfPages([]);
    }
  };

  const handleSignaturePadComplete = () => {
    if (!signaturePadRef.current || signingPageIdx === null || !signingPosition) return;

    if (signaturePadRef.current.isEmpty()) {
      alert('Please sign before adding signature');
      return;
    }

    const imageData = signaturePadRef.current.toDataURL('image/png');
    console.log('[ESIGN] Signature captured from pad:', {
      dataUrlPrefix: imageData.substring(0, 50),
      length: imageData.length,
      page: signingPageIdx + 1,
      position: signingPosition,
    });

    // Use square size for drawn signature
    const newSig: SignatureData = {
      type: 'image',
      imageData: imageData,
      x: signingPosition.x,
      y: signingPosition.y,
      width: 120,
      height: 120,
      page: signingPageIdx + 1,
    };

    setSignatures([...signatures, newSig]);
    closeSignaturePad();
  };

  const closeSignaturePad = () => {
    setShowSignaturePad(false);
    setSigningPageIdx(null);
    setSigningPosition(null);
    if (signaturePadRef.current) {
      signaturePadRef.current.clear();
      signaturePadRef.current = null;
    }
  };

  const handleSignatureImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    console.log('[ESIGN] Image upload attempt:', {
      hasFile: !!file,
      signingPageIdx,
      signingPosition,
      fileName: file?.name,
      fileType: file?.type,
      fileSize: file?.size,
    });

    if (!file) {
      console.log('[ESIGN] No file selected');
      return;
    }

    if (signingPageIdx === null || !signingPosition) {
      alert('Please click on the PDF first to select where to place the signature');
      console.log('[ESIGN] Missing signing context:', { signingPageIdx, signingPosition });
      return;
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      alert('Invalid file type. Please upload: JPG, PNG, GIF, or WebP');
      console.log('[ESIGN] Invalid file type:', file.type);
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      alert('File too large. Please upload an image under 5MB');
      return;
    }

    const reader = new FileReader();
    
    reader.onerror = () => {
      alert('Error reading file. Please try again.');
      console.error('[ESIGN] FileReader error:', reader.error);
    };

    reader.onload = (event) => {
      const imageData = event.target?.result as string;
      
      if (!imageData) {
        alert('Error reading image data');
        console.error('[ESIGN] No image data from FileReader');
        return;
      }

      // Create an image element to get dimensions
      const img = new Image();
      img.onload = () => {
        console.log('[ESIGN] Image dimensions detected:', {
          naturalWidth: img.naturalWidth,
          naturalHeight: img.naturalHeight,
          aspectRatio: img.naturalWidth / img.naturalHeight,
        });

        // Calculate size maintaining aspect ratio
        // Max width: 150px, max height: 150px (square canvas)
        const maxSize = 150;
        let width = maxSize;
        let height = maxSize;
        
        const aspectRatio = img.naturalWidth / img.naturalHeight;
        if (aspectRatio > 1) {
          // Wider than tall
          height = Math.round(maxSize / aspectRatio);
        } else {
          // Taller than wide (or square)
          width = Math.round(maxSize * aspectRatio);
        }

        console.log('[ESIGN] Calculated signature size:', { width, height, aspectRatio });

        const newSig: SignatureData = {
          type: 'image',
          imageData: imageData,
          x: signingPosition.x,
          y: signingPosition.y,
          width: width,
          height: height,
          page: signingPageIdx + 1,
        };

        setSignatures([...signatures, newSig]);
        
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        
        closeSignaturePad();
      };

      img.onerror = () => {
        alert('Error loading image. Make sure it\'s a valid image file.');
        console.error('[ESIGN] Image load error');
      };

      img.src = imageData;

      console.log('[ESIGN] Signature image uploaded successfully:', {
        dataUrlPrefix: imageData.substring(0, 50),
        length: imageData.length,
        page: signingPageIdx + 1,
        position: signingPosition,
      });
    };

    reader.readAsDataURL(file);
  };

  const openSignaturePadAt = (pageIdx: number, x: number, y: number) => {
    setSigningPageIdx(pageIdx);
    setSigningPosition({ x, y });
    setShowSignaturePad(true);
  };

  const handleCanvasClick = (e: React.MouseEvent, pageIdx: number) => {
    const rect = (e.currentTarget as HTMLCanvasElement).getBoundingClientRect();
    // Canvas is rendered at 1.5x scale, and zoom level is applied on top
    // So we need to divide by both zoom level AND the render scale
    const RENDER_SCALE = 1.5;
    const x = (e.clientX - rect.left) / zoomLevel / RENDER_SCALE;
    const y = (e.clientY - rect.top) / zoomLevel / RENDER_SCALE;
    console.log(`[ESIGN] Canvas click: screen(${e.clientX}, ${e.clientY}) -> pdf(${x}, ${y}) zoomLevel=${zoomLevel} scale=${RENDER_SCALE}`);
    openSignaturePadAt(pageIdx, x, y);
  };

  const handleMouseDown = (e: React.MouseEvent, index: number) => {
    if (e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();

    const sig = signatures[index];

    setSelectedSig(index);
    setIsDragging(true);
    setDragStart({
      x: e.clientX,
      y: e.clientY,
      sigX: sig.x,
      sigY: sig.y,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || selectedSig === null) return;

    const RENDER_SCALE = 1.5;
    const pixelDeltaX = e.clientX - dragStart.x;
    const pixelDeltaY = e.clientY - dragStart.y;

    // Account for both zoom level and the 1.5x rendering scale
    const canvasDeltaX = pixelDeltaX / zoomLevel / RENDER_SCALE;
    const canvasDeltaY = pixelDeltaY / zoomLevel / RENDER_SCALE;

    const updated = [...signatures];
    const sig = updated[selectedSig];

    sig.x = dragStart.sigX + canvasDeltaX;
    sig.y = dragStart.sigY + canvasDeltaY;

    const pageIdx = sig.page - 1;
    if (pageIdx >= 0 && pageIdx < pdfPages.length) {
      const canvasWidth = pdfPages[pageIdx].width / RENDER_SCALE;
      const canvasHeight = pdfPages[pageIdx].height / RENDER_SCALE;

      sig.x = Math.max(0, Math.min(sig.x, canvasWidth - sig.width));
      sig.y = Math.max(0, Math.min(sig.y, canvasHeight - sig.height));
    }

    setSignatures(updated);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const removeSignature = (index: number) => {
    setSignatures(signatures.filter((_, i) => i !== index));
    setSelectedSig(null);
  };

  const copySignature = (index: number) => {
    const sig = signatures[index];
    if (sig) {
      setCopiedSig(sig);
      console.log('[ESIGN] Signature copied:', { page: sig.page, x: sig.x, y: sig.y });
    }
  };

  const pasteSignatureOnPage = (pageNum: number) => {
    if (!copiedSig) {
      alert('No signature copied. Select a signature and click Copy.');
      return;
    }

    const newSig: SignatureData = {
      ...copiedSig,
      page: pageNum,
    };

    setSignatures([...signatures, newSig]);
    setShowPasteMenu(false);
    console.log('[ESIGN] Signature pasted on page:', pageNum);
  };

  const pasteOnAllPages = () => {
    if (!copiedSig) {
      alert('No signature copied. Select a signature and click Copy.');
      return;
    }

    const newSignatures: SignatureData[] = [];
    for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
      newSignatures.push({
        ...copiedSig,
        page: pageNum,
      });
    }

    setSignatures([...signatures, ...newSignatures]);
    setShowPasteMenu(false);
    console.log('[ESIGN] Signature pasted on all pages');
  };

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.2, 2));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.2, 0.5));
  };

  const handleResetZoom = () => {
    setZoomLevel(0.8);
  };

  const downloadSignedPdf = async () => {
    if (!pdfFile || signatures.length === 0) {
      alert('Please add at least one signature before downloading');
      return;
    }

    setIsProcessing(true);
    try {
      const formData = new FormData();
      formData.append('tool', 'esign-pdf');
      formData.append('file', pdfFile);

      const signaturesToSend = signatures.map((sig, idx) => {
        // Extract base64 from dataURL - handle edge cases
        let base64 = '';
        if (sig.imageData.includes(',')) {
          // Split at first comma to get base64 part
          const commaIndex = sig.imageData.indexOf(',');
          base64 = sig.imageData.substring(commaIndex + 1);
        } else {
          base64 = sig.imageData;
        }
        
        if (!base64 || base64.length === 0) {
          console.error('[ESIGN] Invalid signature data for signature', idx);
          throw new Error(`Invalid signature data format for signature ${idx + 1}`);
        }
        
        console.log(`[ESIGN] Signature ${idx + 1} extraction:`, {
          page: sig.page,
          originalDataUrlLength: sig.imageData.length,
          extractedBase64Length: base64.length,
          base64Prefix: base64.substring(0, 50),
          base64Suffix: base64.substring(base64.length - 20),
          position: { x: Math.round(sig.x), y: Math.round(sig.y) },
          size: { width: Math.round(sig.width), height: Math.round(sig.height) },
        });

        return {
          type: 'image',
          imageData: base64,
          x: Math.round(sig.x),
          y: Math.round(sig.y),
          width: Math.round(sig.width),
          height: Math.round(sig.height),
          page: sig.page,
        };
      });

      const options = {
        signatures: JSON.stringify(signaturesToSend),
      };
      formData.append('options', JSON.stringify(options));

      console.log('[ESIGN] Sending to backend:', {
        pdfName: pdfFile.name,
        signatureCount: signaturesToSend.length,
        optionsLength: JSON.stringify(options).length,
      });

      const response = await fetch('/api/pdf', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[ESIGN] Backend error:', errorText);
        throw new Error(errorText || 'Failed to sign PDF');
      }

      const downloadResult = await readDownloadResultResponse(response);
      router.push(downloadResult.downloadPageUrl);
    } catch (error) {
      alert('Error signing PDF: ' + (error as Error).message);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!pdfFile) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <HomeHeader />

        <main className="flex-1 flex flex-col">
        {/* Premium Hero Section */}
        <div className="relative bg-gradient-to-r from-purple-600 via-purple-700 to-purple-800 py-16 px-4 md:px-8 overflow-hidden">
          {/* Animated background shapes */}
          <motion.div
            className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full mix-blend-multiply filter blur-3xl"
            animate={{ x: [0, 30, -20, 0], y: [0, -30, 20, 0] }}
            transition={{ duration: 10, repeat: Infinity }}
          />

          <div className="max-w-7xl mx-auto relative z-10">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-white/80 text-sm mb-6">
              <Link href="/" className="hover:text-white transition">Home</Link>
              <ChevronRight size={16} />
              <Link href="/all-tools/pdf-tools" className="hover:text-white transition">PDF Tools</Link>
              <ChevronRight size={16} />
              <span>E-Sign PDF</span>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">✍️ E-Sign PDF</h1>
              <p className="text-lg text-white/90 max-w-2xl">
                Add an electronic signature to your PDF and download the signed document
              </p>
            </motion.div>
          </div>
        </div>

        {/* Main Upload Area */}
        <div className="flex-1 flex items-center justify-center px-4 py-16 bg-gradient-to-br from-gray-50 to-gray-100">
          <div className="bg-white rounded-xl shadow-xl p-12 max-w-md w-full text-center border border-gray-200">
            <div className="flex justify-center mb-6">
              <div className="bg-purple-100 p-6 rounded-full">
                <FileUp className="w-12 h-12 text-purple-600" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Upload PDF</h2>
            <p className="text-gray-600 mb-6">Select a PDF file to add your signature</p>

            <label className="block cursor-pointer">
              <input type="file" accept=".pdf" onChange={handlePdfUpload} className="hidden" />
              <div className="border-2 border-dashed border-purple-300 rounded-lg p-8 hover:border-purple-500 hover:bg-purple-50 transition">
                <FileUp className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                <p className="text-gray-700 font-medium">Click to upload PDF</p>
                <p className="text-gray-500 text-sm">or drag and drop</p>
              </div>
            </label>
          </div>
        </div>
        </main>

        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <HomeHeader />
      
      {/* Subheader - Consistent styling */}
      <div className="bg-gradient-to-r from-purple-100 via-purple-50 to-purple-100 border-b-2 border-purple-300 px-6 py-5 shadow-md">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 text-purple-800 text-sm mb-2">
            <span>PDF Tools</span>
            <ChevronRight size={16} />
            <span className="font-semibold">E-Sign PDF</span>
          </div>
          <h2 className="text-3xl font-bold text-purple-900">✍️ E-Sign PDF</h2>
          <p className="text-purple-700 text-sm mt-2">Click on PDF to add signature, drag to reposition</p>
        </div>
      </div>
      
      <main className="flex-1 flex flex-col">
        <div className="flex h-[calc(100vh-180px)] gap-4 p-4">
          <div className="flex-1 bg-white rounded-lg shadow-md overflow-hidden flex flex-col">
            {totalPages > 0 && (
            <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 bg-gray-50">
              <span className="text-sm font-medium">All Pages ({totalPages})</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleZoomOut}
                  disabled={zoomLevel <= 0.5}
                  className="p-1 hover:bg-gray-200 disabled:opacity-50 rounded"
                >
                  <ZoomOut className="w-5 h-5" />
                </button>
                <span className="text-sm font-medium min-w-[50px] text-center">{Math.round(zoomLevel * 100)}%</span>
                <button
                  onClick={handleZoomIn}
                  disabled={zoomLevel >= 2}
                  className="p-1 hover:bg-gray-200 disabled:opacity-50 rounded"
                >
                  <ZoomIn className="w-5 h-5" />
                </button>
                <button onClick={handleResetZoom} className="px-2 py-1 text-xs font-medium hover:bg-gray-200 rounded">
                  Reset
                </button>
              </div>
            </div>
          )}

          <div
            ref={previewRef}
            className="flex-1 relative bg-gray-100 overflow-auto"
            style={{ cursor: isDragging ? 'grabbing' : 'default' }}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onClick={() => setSelectedSig(null)}
          >
            {pdfPages.length > 0 ? (
              <div className="inline-block p-4 space-y-6" style={{ minWidth: '100%', textAlign: 'center' }}>
                {pdfPages.map((pageCanvas, pageIdx) => {
                  const pageNum = pageIdx + 1;
                  return (
                    <div key={pageIdx} className="relative inline-block mx-auto">
                      <div className="text-xs font-medium text-gray-600 mb-2">Page {pageNum}</div>

                      <div
                        style={{
                          transform: `scale(${zoomLevel})`,
                          transformOrigin: 'top center',
                          position: 'relative',
                          display: 'inline-block',
                        }}
                      >
                        <div className="relative inline-block bg-white shadow-lg">
                          <canvas
                            width={pageCanvas.width}
                            height={pageCanvas.height}
                            style={{
                              display: 'block',
                              cursor: 'crosshair',
                            }}
                            onClick={(e) => handleCanvasClick(e, pageIdx)}
                            ref={(canvas) => {
                              if (canvas && canvas.getContext('2d')) {
                                const ctx = canvas.getContext('2d');
                                if (ctx) {
                                  ctx.drawImage(pageCanvas, 0, 0);
                                }
                              }
                            }}
                          />

                          {signatures
                            .filter((sig) => sig.page === pageNum)
                            .map((sig, idx) => {
                              const globalIdx = signatures.indexOf(sig);
                              const RENDER_SCALE = 1.5;
                              // Display coordinates need to be scaled back to match the 1.5x rendered canvas
                              const displayX = sig.x * RENDER_SCALE;
                              const displayY = sig.y * RENDER_SCALE;
                              const displayWidth = sig.width * RENDER_SCALE;
                              const displayHeight = sig.height * RENDER_SCALE;
                              return (
                                <div
                                  key={globalIdx}
                                  className={`absolute ${isDragging && selectedSig === globalIdx ? '' : 'transition-all'} ${
                                    selectedSig === globalIdx
                                      ? 'border-2 border-blue-500 shadow-lg z-20 cursor-grabbing'
                                      : 'border-2 border-gray-400 z-10 cursor-grab hover:border-blue-300'
                                  }`}
                                  style={{
                                    transform: `translate(${displayX}px, ${displayY}px)`,
                                    width: `${displayWidth}px`,
                                    height: `${displayHeight}px`,
                                    backgroundColor: selectedSig === globalIdx ? 'rgba(59, 130, 246, 0.15)' : 'rgba(255, 255, 255, 0.5)',
                                    userSelect: 'none',
                                    willChange: isDragging && selectedSig === globalIdx ? 'transform' : 'auto',
                                    top: 0,
                                    left: 0,
                                  }}
                                  onMouseDown={(e) => handleMouseDown(e, globalIdx)}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedSig(globalIdx);
                                  }}
                                >
                                  <div className="w-full h-full flex items-center justify-center p-1 overflow-hidden pointer-events-none">
                                    <img src={sig.imageData} alt="signature" className="w-full h-full object-contain" />
                                  </div>
                                  {selectedSig === globalIdx && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        removeSignature(globalIdx);
                                      }}
                                      className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 z-30 shadow-md pointer-events-auto"
                                    >
                                      <X className="w-4 h-4" />
                                    </button>
                                  )}
                                </div>
                              );
                            })}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-gray-400 text-center py-12">
                <p className="font-semibold">PDF Preview</p>
                <p className="text-sm mt-2">Upload a PDF to get started</p>
              </div>
            )}
          </div>
        </div>

        <div className="w-80 bg-white rounded-lg shadow-md flex flex-col overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <label className="block cursor-pointer">
              <input type="file" accept=".pdf" onChange={handlePdfUpload} className="hidden" />
              <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-sm font-medium">
                <FileUp className="w-5 h-5" />
                Change PDF
              </button>
            </label>
          </div>

          <div className="p-4 border-b border-gray-200">
            <h3 className="font-bold text-gray-800 mb-2 text-sm">Instructions</h3>
            <p className="text-xs text-gray-600">
              1. Click anywhere on the PDF to open signature pad<br />
              2. Draw your signature<br />
              3. Click "Add Signature"<br />
              4. Drag signatures to reposition<br />
              5. Download the signed PDF
            </p>
          </div>

          <div className="p-4 border-b border-gray-200 flex-1 overflow-y-auto">
            <h3 className="font-bold text-gray-800 mb-2 text-sm">Signatures ({signatures.length})</h3>
            {signatures.length === 0 ? (
              <p className="text-gray-500 text-xs">Click on PDF to add signatures</p>
            ) : (
              <div className="space-y-2">
                {signatures.map((sig, idx) => (
                  <div
                    key={idx}
                    className={`p-2 border rounded cursor-pointer transition text-xs ${
                      selectedSig === idx
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 bg-gray-50 hover:border-blue-300'
                    }`}
                    onClick={() => setSelectedSig(idx)}
                  >
                    <div>
                      Signature {idx + 1}
                      <br />
                      <span className="text-gray-600">Page {sig.page}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {selectedSig !== null && (
            <div className="p-4 border-t border-gray-200 space-y-2">
              <button
                onClick={() => copySignature(selectedSig)}
                className="w-full px-3 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 text-xs font-medium"
              >
                📋 Copy Signature
              </button>
              {copiedSig && (
                <>
                  <button
                    onClick={() => setShowPasteMenu(!showPasteMenu)}
                    className="w-full px-3 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 text-xs font-medium"
                  >
                    📌 Paste On Page...
                  </button>
                  {showPasteMenu && (
                    <div className="bg-gray-50 rounded-lg p-2 border border-purple-200 space-y-1 max-h-32 overflow-y-auto">
                      <button
                        onClick={pasteOnAllPages}
                        className="w-full text-left px-2 py-1 hover:bg-purple-100 rounded text-xs font-medium text-purple-700"
                      >
                        ✓ All Pages
                      </button>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                        <button
                          key={pageNum}
                          onClick={() => pasteSignatureOnPage(pageNum)}
                          className="w-full text-left px-2 py-1 hover:bg-purple-100 rounded text-xs text-purple-700"
                        >
                          Page {pageNum}
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}
              <button
                onClick={() => removeSignature(selectedSig)}
                className="w-full px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 text-xs font-medium"
              >
                🗑️ Delete
              </button>
            </div>
          )}

          <div className="p-4 border-t border-gray-200">
            <button
              onClick={downloadSignedPdf}
              disabled={signatures.length === 0 || isProcessing}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium"
            >
              <Download className="w-5 h-5" />
              {isProcessing ? 'Processing...' : 'Download PDF'}
            </button>
          </div>
        </div>
      </div>

      {showSignaturePad && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
            <div className="border-b border-gray-200 p-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-800">Add Signature</h2>
              <button
                onClick={closeSignaturePad}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="border-b border-gray-200 p-2 flex gap-2">
              <button
                onClick={() => {
                  if (signaturePadRef.current) signaturePadRef.current.clear();
                }}
                className="flex-1 px-3 py-2 text-sm font-medium rounded-t-lg bg-purple-100 text-purple-700 hover:bg-purple-200"
              >
                ✏️ Draw Signature
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 px-3 py-2 text-sm font-medium rounded-t-lg bg-purple-100 text-purple-700 hover:bg-purple-200 cursor-pointer"
              >
                📤 Upload Image
              </button>
              <input 
                ref={fileInputRef}
                type="file" 
                accept=".jpg,.jpeg,.png,.gif,.webp" 
                onChange={handleSignatureImageUpload} 
                className="hidden" 
              />
            </div>

            <div className="p-4">
              <p className="text-xs text-gray-600 mb-3">Draw your signature or upload a signature image (JPG, PNG, GIF, WebP)</p>
              <div className="flex justify-center">
                <canvas
                  ref={signaturePadCanvas}
                  className="border-2 border-gray-300 rounded-lg bg-gray-50"
                  style={{ width: '300px', height: '300px', touchAction: 'none' }}
                />
              </div>
            </div>

            <div className="border-t border-gray-200 p-4 flex gap-2 justify-end">
              <button
                onClick={() => {
                  if (signaturePadRef.current) {
                    signaturePadRef.current.clear();
                  }
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium"
              >
                Clear
              </button>
              <button
                onClick={closeSignaturePad}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSignaturePadComplete}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
              >
                Add Signature
              </button>
            </div>
          </div>
        </div>
      )}
      <section className="bg-white border-t border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-16 space-y-14">

          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              How to sign a PDF online
            </h2>
            <p className="text-gray-600 leading-7 mb-6">
              Use the E-Sign PDF tool to place a handwritten or image-based
              electronic signature onto a PDF document. You can preview the
              document, choose the page and position, move the signature, and
              download the completed PDF.
            </p>

            <ol className="grid md:grid-cols-5 gap-4">
              {[
                ['1', 'Upload PDF', 'Choose the PDF document you want to sign.'],
                ['2', 'Choose position', 'Click the location on the PDF where the signature should appear.'],
                ['3', 'Add signature', 'Draw your signature or upload an existing signature image.'],
                ['4', 'Position it', 'Drag the signature to place it accurately on the page.'],
                ['5', 'Download', 'Create and download the signed PDF when you are finished.'],
              ].map(([number, title, description]) => (
                <li key={number} className="border border-gray-200 rounded-xl p-5">
                  <div className="w-9 h-9 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold mb-3">
                    {number}
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
                  <p className="text-sm text-gray-600 leading-6">{description}</p>
                </li>
              ))}
            </ol>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="border border-gray-200 rounded-xl p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-3">
                Draw your signature
              </h2>
              <p className="text-gray-600 leading-7">
                Click the PDF where you want to sign and use the signature pad
                to draw your signature. After adding it, you can move the
                signature to improve its placement before creating the final
                PDF.
              </p>
            </div>

            <div className="border border-gray-200 rounded-xl p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-3">
                Upload a signature image
              </h2>
              <p className="text-gray-600 leading-7">
                If you already have an image of your signature, upload a JPG,
                PNG, GIF, or WebP file. The image is placed on the selected PDF
                page while preserving its proportions.
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Sign multiple PDF pages
            </h2>
            <p className="text-gray-600 leading-7">
              A signature can be copied and reused on another page when the
              same document requires signatures in several locations. You can
              also paste a copied signature onto all pages, then review the
              placement before downloading the finished PDF.
            </p>
          </div>

          <div className="bg-purple-50 border border-purple-100 rounded-xl p-7">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Electronic signature vs digital signature
            </h2>
            <p className="text-gray-700 leading-7">
              This tool places a drawn or image-based electronic signature on
              a PDF. It does not create a certificate-based cryptographic
              digital signature. If a document requires identity verification,
              certificate validation, or a specific legally regulated signing
              process, confirm the recipient&apos;s requirements before using
              an image-based signature.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-5">
              Tips for signing PDFs accurately
            </h2>

            <div className="grid md:grid-cols-2 gap-4">
              {[
                'Review the document before adding your signature.',
                'Zoom the PDF when you need more precise placement.',
                'Use a clear signature image with minimal unnecessary background.',
                'Check the correct page before copying a signature to other pages.',
                'Review every signature position before downloading the final PDF.',
                'Keep the original unsigned PDF when you may need it later.',
              ].map((tip) => (
                <div
                  key={tip}
                  className="flex gap-3 border border-gray-200 rounded-lg p-4"
                >
                  <span className="text-purple-600 font-bold">✓</span>
                  <p className="text-gray-600">{tip}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              E-Sign PDF FAQ
            </h2>

            <div className="space-y-4">
              {[
                {
                  q: 'Can I draw my signature directly on the PDF?',
                  a: 'Yes. Click the desired position on the PDF to open the signature pad, draw your signature, and add it to the page.',
                },
                {
                  q: 'Can I upload an existing signature image?',
                  a: 'Yes. The signature uploader accepts JPG, PNG, GIF, and WebP images up to the supported upload limit.',
                },
                {
                  q: 'Can I move the signature after adding it?',
                  a: 'Yes. Select and drag the signature to reposition it before downloading the PDF.',
                },
                {
                  q: 'Can I use the same signature on several pages?',
                  a: 'Yes. Copy an existing signature and paste it onto a selected page or across all pages when appropriate.',
                },
                {
                  q: 'Does this create a certificate-based digital signature?',
                  a: 'No. The tool adds a visual electronic signature. It does not create a certificate-backed cryptographic PDF signature.',
                },
                {
                  q: 'Should I review the PDF before sending it?',
                  a: 'Yes. Check the document, signature placement, page selection, names, dates, and other important information before sharing the completed PDF.',
                },
              ].map((item) => (
                <div key={item.q} className="border border-gray-200 rounded-xl p-5">
                  <h3 className="font-semibold text-gray-900 mb-2">{item.q}</h3>
                  <p className="text-gray-600 leading-7">{item.a}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-5">
              Related PDF tools
            </h2>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link
                href="/all-tools/pdf/edit-pdf"
                className="border border-gray-200 rounded-xl p-5 hover:border-purple-300 hover:shadow-sm transition"
              >
                <h3 className="font-semibold text-gray-900 mb-2">Edit PDF</h3>
                <p className="text-sm text-gray-600">
                  Make changes to your PDF document.
                </p>
              </Link>

              <Link
                href="/all-tools/pdf/annotate-pdf"
                className="border border-gray-200 rounded-xl p-5 hover:border-purple-300 hover:shadow-sm transition"
              >
                <h3 className="font-semibold text-gray-900 mb-2">Annotate PDF</h3>
                <p className="text-sm text-gray-600">
                  Add annotations and notes to PDF pages.
                </p>
              </Link>

              <Link
                href="/all-tools/pdf/merge-pdf"
                className="border border-gray-200 rounded-xl p-5 hover:border-purple-300 hover:shadow-sm transition"
              >
                <h3 className="font-semibold text-gray-900 mb-2">Merge PDF</h3>
                <p className="text-sm text-gray-600">
                  Combine multiple PDF files into one document.
                </p>
              </Link>

              <Link
                href="/all-tools/pdf/compress-pdf"
                className="border border-gray-200 rounded-xl p-5 hover:border-purple-300 hover:shadow-sm transition"
              >
                <h3 className="font-semibold text-gray-900 mb-2">Compress PDF</h3>
                <p className="text-sm text-gray-600">
                  Reduce PDF file size for easier sharing.
                </p>
              </Link>
            </div>
          </div>

        </div>
      </section>

      </main>

      <Footer />
    </div>
  );
}
