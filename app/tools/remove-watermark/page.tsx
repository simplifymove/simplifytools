'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Download, Loader, Undo2, RotateCcw, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { ImageUploader } from '../../components/ImageUploader';

export default function RemoveWatermarkPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [imageReady, setImageReady] = useState(false);

  // Canvas states
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const maskCanvasRef = useRef<HTMLCanvasElement>(null);
  const baseImageRef = useRef<HTMLImageElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushSize, setBrushSize] = useState(30);
  const [drawHistory, setDrawHistory] = useState<Uint8ClampedArray[]>([]);
  const [showMaskPreview, setShowMaskPreview] = useState(false);

  // Settings
  const [mode, setMode] = useState<'fast' | 'quality'>('quality');
  const [outputFormat, setOutputFormat] = useState<'png' | 'jpg' | 'webp'>('png');
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Feedback
  const [processingTime, setProcessingTime] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    setResult(null);
    setDrawHistory([]);
    setShowMaskPreview(false);
    setImageReady(false);
    setError(null);

    // Instant blob URL - no encoding
    const url = URL.createObjectURL(selectedFile);
    setPreview(url);
  };

  // Initialize canvas when preview is set
  useEffect(() => {
    if (!preview) return;

    const canvas = canvasRef.current;
    const maskCanvas = maskCanvasRef.current;
    if (!canvas || !maskCanvas) {
      console.log('Canvas or mask canvas not ready, retrying...');
      const timer = setTimeout(() => {
        setPreview(preview);
      }, 50);
      return () => clearTimeout(timer);
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      baseImageRef.current = img;

      // Set canvas dimensions
      canvas.width = img.width;
      canvas.height = img.height;
      maskCanvas.width = img.width;
      maskCanvas.height = img.height;

      console.log(`Canvases initialized: ${img.width}x${img.height}`);

      // Draw original image to display canvas
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);
      }

      // Initialize mask canvas to all black (keep everything)
      const maskCtx = maskCanvas.getContext('2d');
      if (maskCtx) {
        maskCtx.fillStyle = 'black';
        maskCtx.fillRect(0, 0, maskCanvas.width, maskCanvas.height);
      }

      setImageReady(true);
    };
    
    img.onerror = () => {
      setError('Failed to load image');
      setImageReady(true);
    };
    
    img.src = preview;

    return () => {
      URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const handleClearPreview = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setDrawHistory([]);
    setImageReady(false);
  };

  // Drawing functions - draw red overlay to mark regions
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !imageReady) return;
    setIsDrawing(true);
    drawStroke(e);
  };

  const drawStroke = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !maskCanvasRef.current) return;

    const canvas = canvasRef.current;
    const maskCanvas = maskCanvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    // Map screen coordinates to canvas coordinates, accounting for scaling
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    console.log(`Drawing at canvas: (${Math.round(x)}, ${Math.round(y)}), size: ${canvas.width}x${canvas.height}, scale: ${scaleX.toFixed(2)}x${scaleY.toFixed(2)}`);

    // Draw to DISPLAY canvas (red for user feedback)
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = 'rgba(255, 0, 0, 0.6)';
      ctx.beginPath();
      ctx.arc(x, y, brushSize / 2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Draw to MASK canvas (white for removal regions)
    const maskCtx = maskCanvas.getContext('2d');
    if (maskCtx) {
      maskCtx.fillStyle = 'white';
      maskCtx.beginPath();
      maskCtx.arc(x, y, brushSize / 2, 0, Math.PI * 2);
      maskCtx.fill();
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !canvasRef.current) return;
    drawStroke(e);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const undo = () => {
    const canvas = canvasRef.current;
    const maskCanvas = maskCanvasRef.current;
    if (canvas && maskCanvas && baseImageRef.current) {
      const ctx = canvas.getContext('2d');
      const maskCtx = maskCanvas.getContext('2d');
      if (ctx && maskCtx) {
        ctx.drawImage(baseImageRef.current, 0, 0);
        maskCtx.fillStyle = 'black';
        maskCtx.fillRect(0, 0, maskCanvas.width, maskCanvas.height);
      }
    }
  };

  const reset = () => {
    const canvas = canvasRef.current;
    const maskCanvas = maskCanvasRef.current;
    if (canvas && maskCanvas && baseImageRef.current) {
      const ctx = canvas.getContext('2d');
      const maskCtx = maskCanvas.getContext('2d');
      if (ctx && maskCtx) {
        ctx.drawImage(baseImageRef.current, 0, 0);
        maskCtx.fillStyle = 'black';
        maskCtx.fillRect(0, 0, maskCanvas.width, maskCanvas.height);
      }
    }
  };

  const removeObjects = async () => {
    console.log('removeObjects called');
    
    if (!file) {
      setError('Please upload an image first');
      return;
    }

    if (!termsAccepted) {
      setError('Please accept the terms to continue');
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      const maskCanvas = maskCanvasRef.current;
      console.log('maskCanvas ref:', maskCanvas);
      
      if (!maskCanvas) throw new Error('Mask canvas not found');

      // Debug: Check if mask canvas has any white pixels
      const maskCtx = maskCanvas.getContext('2d');
      if (maskCtx) {
        const imageData = maskCtx.getImageData(0, 0, maskCanvas.width, maskCanvas.height);
        const pixels = imageData.data;
        let whitePixelCount = 0;
        for (let i = 0; i < pixels.length; i += 4) {
          if (pixels[i] > 128 && pixels[i + 1] > 128 && pixels[i + 2] > 128) {
            whitePixelCount++;
          }
        }
        console.log(`Mask canvas: ${maskCanvas.width}x${maskCanvas.height}, White pixels: ${whitePixelCount}`);
        if (whitePixelCount === 0) {
          const errMsg = 'No removal regions marked! Please draw on the watermark first.';
          setError(errMsg);
          console.log('Error:', errMsg);
          setProcessing(false);
          return;
        }
      }

      console.log('Mask validation passed, creating blob...');

      // Convert mask canvas directly to PNG blob
      maskCanvas.toBlob(async (maskBlob) => {
        console.log('toBlob callback fired, maskBlob:', maskBlob);
        
        if (!maskBlob) {
          setError('Failed to create mask');
          setProcessing(false);
          return;
        }

        console.log(`Mask blob size: ${maskBlob.size} bytes`);

        const formData = new FormData();
        formData.append('file', file);
        formData.append('mask', maskBlob);

        console.log('Sending to API with mode:', mode, 'format:', outputFormat);

        try {
          const startTime = Date.now();
          const response = await fetch(`/api/inpaint?mode=${mode}&format=${outputFormat}`, {
            method: 'POST',
            body: formData,
          });

          const processingTimeMs = Date.now() - startTime;
          setProcessingTime(processingTimeMs);

          console.log('API response status:', response.status, 'processing time:', processingTimeMs);

          if (!response.ok) {
            let errorMessage = 'Failed to process image';
            try {
              const errorData = await response.json();
              errorMessage = errorData.error || errorMessage;
            } catch {
              errorMessage = `Server error (${response.status})`;
            }
            console.log('API error:', errorMessage);
            throw new Error(errorMessage);
          }

          const blob = await response.blob();
          console.log('Result blob size:', blob.size);
          
          if (blob.size === 0) {
            throw new Error('Empty response from server');
          }

          const url = URL.createObjectURL(blob);
          setResult(url);
          console.log('Result set successfully');
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Unknown error';
          setError(errorMessage);
          console.error('Fetch error:', err);
        } finally {
          setProcessing(false);
        }
      }, 'image/png');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('Error:', err);
      setProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!result) return;
    const link = document.createElement('a');
    link.href = result;
    link.download = `watermark-removed-${Date.now()}.${outputFormat}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 py-8 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          <Link href="/" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4">
            <ArrowLeft className="w-4 h-4" /> Back
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Remove Watermark & Objects</h1>
          <p className="text-gray-600 mt-2">Mark and remove watermarks, logos, timestamps, and unwanted objects</p>
        </div>
      </div>

      <div className="py-12 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Left: Controls */}
            <div className="lg:col-span-1">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Controls</h2>
              <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-5 sticky top-4">
                {/* Upload */}
                <ImageUploader 
                  onFileSelect={handleFileSelect}
                  preview={preview}
                  onClearPreview={handleClearPreview}
                />

                {preview && (
                  <>
                    {/* Brush Size */}
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        Brush Size: {brushSize}px
                      </label>
                      <input
                        type="range"
                        min="5"
                        max="150"
                        value={brushSize}
                        onChange={(e) => setBrushSize(parseInt(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>

                    {/* Undo/Reset */}
                    <div className="flex gap-2">
                      <button
                        onClick={undo}
                        disabled={drawHistory.length <= 1}
                        className="flex-1 px-3 py-2 bg-gray-200 text-gray-900 rounded-lg font-medium hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        <Undo2 className="w-4 h-4" />
                        Undo
                      </button>
                      <button
                        onClick={reset}
                        className="flex-1 px-3 py-2 bg-gray-200 text-gray-900 rounded-lg font-medium hover:bg-gray-300 flex items-center justify-center gap-2"
                      >
                        <RotateCcw className="w-4 h-4" />
                        Reset
                      </button>
                    </div>

                    {/* Toggle Mask Preview */}
                    <button
                      onClick={() => setShowMaskPreview(!showMaskPreview)}
                      className="w-full px-4 py-2 bg-purple-100 text-purple-700 rounded-lg font-medium hover:bg-purple-200 flex items-center justify-center gap-2"
                    >
                      {showMaskPreview ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      {showMaskPreview ? 'Hide' : 'Show'} Marked Areas
                    </button>

                    {/* Mode Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        Processing Mode
                      </label>
                      <div className="flex gap-2">
                        {(['fast', 'quality'] as const).map((m) => (
                          <button
                            key={m}
                            onClick={() => setMode(m)}
                            className={`flex-1 px-3 py-2 rounded-lg font-medium text-sm transition-colors ${
                              mode === m
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {m === 'fast' ? 'Fast' : 'Quality'}
                          </button>
                        ))}
                      </div>
                      <p className="text-xs text-gray-600 mt-2">
                        {mode === 'fast' ? 'Faster, decent results' : 'Slower, better results'}
                      </p>
                    </div>

                    {/* Output Format */}
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        Output Format
                      </label>
                      <select
                        value={outputFormat}
                        onChange={(e) => setOutputFormat(e.target.value as 'png' | 'jpg' | 'webp')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="png">PNG (best quality)</option>
                        <option value="webp">WebP (balanced)</option>
                        <option value="jpg">JPEG (smaller size)</option>
                      </select>
                    </div>

                    {/* Terms */}
                    <div className="flex items-start gap-2 p-3 bg-orange-50 rounded-lg border border-orange-200">
                      <input
                        type="checkbox"
                        id="terms"
                        checked={termsAccepted}
                        onChange={(e) => setTermsAccepted(e.target.checked)}
                        className="w-4 h-4 cursor-pointer mt-0.5"
                      />
                      <label htmlFor="terms" className="flex-1 cursor-pointer text-xs text-gray-700">
                        I have rights/permission to edit this image
                      </label>
                    </div>

                    {/* Process Button */}
                    <button
                      onClick={removeObjects}
                      disabled={processing || !termsAccepted}
                      className="w-full px-6 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:bg-gray-400 transition-colors flex items-center justify-center gap-2"
                    >
                      {processing ? (
                        <>
                          <Loader className="w-4 h-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        'Remove Objects'
                      )}
                    </button>

                    {/* Processing Time */}
                    {processingTime !== null && (
                      <div className="text-xs text-gray-600 text-center bg-gray-50 p-2 rounded">
                        Processed in {processingTime}ms
                      </div>
                    )}

                    {/* Error Message */}
                    {error && (
                      <div className="text-sm text-red-700 bg-red-50 p-3 rounded-lg border border-red-200">
                        {error}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Right: Canvas & Result */}
            <div className="lg:col-span-3">
              <div className="space-y-6">
                {/* Canvas for drawing mask - ALWAYS render, just hide until ready */}
                {preview && (
                  <div>
                    {!imageReady && (
                      <div className="text-center py-4">
                        <Loader className="w-6 h-6 animate-spin text-blue-600 mx-auto mb-2" />
                        <p className="text-gray-600 text-sm">Loading image...</p>
                      </div>
                    )}
                    {imageReady && (
                      <>
                        <h3 className="text-sm font-medium text-gray-900 mb-3">
                          Mark regions to remove (brush over watermark/object)
                        </h3>
                      </>
                    )}
                    <div className="bg-white rounded-lg border-2 border-gray-300" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
                      {/* Display canvas - shows image + red marks */}
                      <canvas
                        ref={canvasRef}
                        onMouseDown={startDrawing}
                        onMouseMove={draw}
                        onMouseUp={stopDrawing}
                        onMouseLeave={stopDrawing}
                        style={{
                          cursor: 'crosshair',
                          display: imageReady && !showMaskPreview ? 'block' : 'none',
                          pointerEvents: imageReady && !showMaskPreview ? 'auto' : 'none',
                          touchAction: 'none',
                          border: 'none',
                        }}
                      />
                      {/* Mask canvas - shows what will actually be removed (white = remove) */}
                      <canvas
                        ref={maskCanvasRef}
                        style={{
                          display: imageReady && showMaskPreview ? 'block' : 'none',
                          border: 'none',
                          backgroundColor: '#000',
                        }}
                      />
                    </div>
                    {imageReady && (
                      <p className="text-xs text-gray-600 mt-2">
                        ✓ Drag your mouse over the watermark to mark it. Use Undo/Reset as needed.
                      </p>
                    )}
                  </div>
                )}

                {/* Result */}
                {result && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-3">Result</h3>
                    <div className="bg-white rounded-lg border border-gray-200 p-4 overflow-auto" style={{ maxHeight: '650px' }}>
                      <img
                        src={result}
                        alt="result"
                        className="w-full h-auto rounded"
                      />
                    </div>
                    <button
                      onClick={handleDownload}
                      className="w-full mt-4 px-4 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 flex items-center justify-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Download {outputFormat.toUpperCase()}
                    </button>
                  </div>
                )}

                {!preview && (
                  <div className="bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
                    <p className="text-gray-600 text-sm">Upload an image to begin</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
