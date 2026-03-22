'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Download, ChevronRight, Loader, Undo2, RotateCcw, Eye, EyeOff, Wand2 } from 'lucide-react';
import { HomeHeader } from '../../components/HomeHeader';
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
    <>
      <HomeHeader />
      <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex flex-col">
        {/* Hero Header */}
        <div className="relative bg-orange-500 py-16 px-4 md:px-8 overflow-hidden">
          <div className="max-w-6xl mx-auto relative z-10">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-white/90 text-sm mb-6">
              <Link href="/" className="hover:text-white transition">Home</Link>
              <ChevronRight size={16} />
              <Link href="/tools" className="hover:text-white transition">Tools</Link>
              <ChevronRight size={16} />
              <span>Remove Watermark</span>
            </div>

            {/* Title Section */}
            <div className="flex items-start gap-4">
              <div className="p-3 bg-white/20 rounded-lg">
                <Wand2 size={32} className="text-white" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">Remove Watermark &amp; Objects</h1>
                <p className="text-lg text-white/90">Mark and remove watermarks, logos, timestamps, and unwanted objects from your images.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 py-12 px-4 md:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content - Left (2 cols) */}
              <div className="lg:col-span-2">
                {/* Step 1: Upload */}
                {!preview && (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Step 1: Upload Image</h2>
                    <ImageUploader 
                      onFileSelect={handleFileSelect}
                      preview={preview}
                      onClearPreview={handleClearPreview}
                    />
                  </div>
                )}

                {/* Step 2: Canvas & Drawing */}
                {preview && (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Step 2: Mark Areas</h2>
                    
                    {!imageReady && (
                      <div className="text-center py-12">
                        <Loader className="w-8 h-8 animate-spin text-orange-500 mx-auto mb-3" />
                        <p className="text-gray-600">Loading image...</p>
                      </div>
                    )}

                    {imageReady && (
                      <>
                        <p className="text-sm text-gray-700 mb-4">
                          Drag your brush over the watermark or object you want to remove. The marked areas will appear in red.
                        </p>
                        <div className="bg-gray-50 rounded-lg border-2 border-gray-200 overflow-auto" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative', maxHeight: '600px' }}>
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
                              maxWidth: '100%',
                              maxHeight: '600px',
                            }}
                          />
                          {/* Mask canvas - shows what will actually be removed (white = remove) */}
                          <canvas
                            ref={maskCanvasRef}
                            style={{
                              display: imageReady && showMaskPreview ? 'block' : 'none',
                              border: 'none',
                              backgroundColor: '#000',
                              maxWidth: '100%',
                              maxHeight: '600px',
                            }}
                          />
                        </div>
                        <p className="text-xs text-gray-600 mt-3">
                          ✓ Use the brush size and tools in the sidebar to mark watermark regions.
                        </p>
                      </>
                    )}
                  </div>
                )}

                {/* Result */}
                {result && (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Result</h2>
                    <div className="flex justify-center mb-6">
                      <img
                        src={result}
                        alt="result"
                        className="rounded-lg shadow-lg max-w-full"
                        style={{ maxWidth: '100%', maxHeight: '600px' }}
                      />
                    </div>
                    {processingTime !== null && (
                      <p className="text-xs text-gray-600 text-center bg-gray-50 p-3 rounded-lg mb-4">
                        Processed in {(processingTime / 1000).toFixed(1)}s • {outputFormat.toUpperCase()} format
                      </p>
                    )}
                  </div>
                )}

                {!preview && (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                    <h3 className="font-semibold text-green-900 mb-3">How it Works:</h3>
                    <ol className="text-sm text-green-800 space-y-2">
                      <li>1. Upload an image with watermarks or unwanted objects</li>
                      <li>2. Use the brush to mark the areas you want removed</li>
                      <li>3. Use undo/reset to fix mistakes as needed</li>
                      <li>4. Select your processing mode and output format</li>
                      <li>5. Click "Remove" to process the image</li>
                      <li>6. Download your cleaned image</li>
                    </ol>
                  </div>
                )}
              </div>

              {/* Settings Sidebar - Right (1 col sticky) */}
              <div className="lg:col-span-1">
                <div className="sticky top-4 space-y-4">
                  {/* Brush Controls */}
                  {preview && imageReady && (
                    <div className="bg-white rounded-lg border border-gray-200 p-4">
                      <h3 className="font-semibold text-gray-900 mb-4">Drawing Tools</h3>

                      {/* Brush Size */}
                      <div className="mb-4">
                        <label className="text-sm font-medium text-gray-700 block mb-2">
                          Brush Size: {brushSize}px
                        </label>
                        <input
                          type="range"
                          min="5"
                          max="150"
                          value={brushSize}
                          onChange={(e) => setBrushSize(parseInt(e.target.value))}
                          className="w-full"
                        />
                      </div>

                      {/* Undo/Reset Buttons */}
                      <div className="grid grid-cols-2 gap-2 mb-4">
                        <button
                          onClick={undo}
                          className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium text-sm transition flex items-center justify-center gap-1"
                        >
                          <Undo2 size={16} />
                          Undo
                        </button>
                        <button
                          onClick={reset}
                          className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium text-sm transition flex items-center justify-center gap-1"
                        >
                          <RotateCcw size={16} />
                          Reset
                        </button>
                      </div>

                      {/* Toggle Mask Preview */}
                      <button
                        onClick={() => setShowMaskPreview(!showMaskPreview)}
                        className="w-full px-4 py-2 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg font-medium text-sm transition flex items-center justify-center gap-2"
                      >
                        {showMaskPreview ? <Eye size={16} /> : <EyeOff size={16} />}
                        {showMaskPreview ? 'Hide' : 'Show'} Mask
                      </button>
                    </div>
                  )}

                  {/* Processing Settings */}
                  {preview && imageReady && (
                    <div className="bg-white rounded-lg border border-gray-200 p-4">
                      <h3 className="font-semibold text-gray-900 mb-4">Processing</h3>

                      {/* Mode Selection */}
                      <div className="mb-4">
                        <label className="text-sm font-medium text-gray-700 block mb-2">Mode</label>
                        <div className="flex gap-2">
                          {(['fast', 'quality'] as const).map((m) => (
                            <button
                              key={m}
                              onClick={() => setMode(m)}
                              className={`flex-1 px-3 py-2 rounded-lg font-medium text-sm transition ${
                                mode === m
                                  ? 'bg-orange-500 text-white'
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }`}
                            >
                              {m === 'fast' ? 'Fast' : 'Quality'}
                            </button>
                          ))}
                        </div>
                        <p className="text-xs text-gray-600 mt-1">
                          {mode === 'fast' ? 'Faster results' : 'Better quality results'}
                        </p>
                      </div>

                      {/* Output Format */}
                      <div>
                        <label className="text-sm font-medium text-gray-700 block mb-2">Output Format</label>
                        <select
                          value={outputFormat}
                          onChange={(e) => setOutputFormat(e.target.value as 'png' | 'jpg' | 'webp')}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        >
                          <option value="png">PNG (best quality)</option>
                          <option value="webp">WebP (balanced)</option>
                          <option value="jpg">JPEG (smaller size)</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {/* Terms Acceptance */}
                  {preview && imageReady && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                      <div className="flex items-start gap-2">
                        <input
                          type="checkbox"
                          id="terms"
                          checked={termsAccepted}
                          onChange={(e) => setTermsAccepted(e.target.checked)}
                          className="w-4 h-4 cursor-pointer mt-1"
                        />
                        <label htmlFor="terms" className="flex-1 cursor-pointer text-xs text-gray-700">
                          I have rights/permission to edit this image
                        </label>
                      </div>
                    </div>
                  )}

                  {/* Error Message */}
                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <p className="text-red-900 font-semibold text-sm">Error</p>
                      <p className="text-red-700 text-xs mt-1">{error}</p>
                    </div>
                  )}

                  {/* Process Button */}
                  {preview && imageReady && (
                    <button
                      onClick={removeObjects}
                      disabled={processing || !termsAccepted}
                      className="w-full py-3 px-6 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2"
                    >
                      {processing ? (
                        <>
                          <Loader size={20} className="animate-spin" />
                          Processing...
                        </>
                      ) : (
                        'Remove Objects'
                      )}
                    </button>
                  )}

                  {/* Download Button */}
                  {result && (
                    <button
                      onClick={handleDownload}
                      className="w-full py-3 px-6 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2"
                    >
                      <Download size={20} />
                      Download {outputFormat.toUpperCase()}
                    </button>
                  )}

                  {/* Features */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-900 mb-2">Features</h3>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Remove watermarks easily</li>
                      <li>• Smart inpainting algorithms</li>
                      <li>• Multiple output formats</li>
                      <li>• Fast &amp; quality modes</li>
                    </ul>
                  </div>

                  {/* Use Cases */}
                  <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                    <h3 className="font-semibold text-indigo-900 mb-2">Perfect for:</h3>
                    <ul className="text-sm text-indigo-800 space-y-1">
                      <li>• Removing watermarks</li>
                      <li>• Deleting logos</li>
                      <li>• Removing timestamps</li>
                      <li>• Cleaning photos</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      {/* FOOTER */}
      <footer className="bg-slate-900 text-gray-300 px-4 md:px-8 py-16 md:py-24">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 font-bold text-xl text-white mb-4">
                <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-md shadow-orange-500/40">
                  SC
                </div>
                <span>SimplifyConvert</span>
              </div>
              <p className="text-sm text-gray-400">
                Free online tools for PDF, Image, Video, AI Write, Data, Code, and Text to Speech conversion.
              </p>
            </div>

            {/* Categories */}
            <div>
              <h4 className="font-semibold text-white mb-4">Categories</h4>
              <ul className="space-y-2 text-sm">
                {['PDF Tools', 'Image Tools', 'Video Tools', 'AI Write', 'Code Tools'].map((item) => (
                  <li key={item}>
                    <a href="#" className="hover:text-white transition-colors hover:translate-x-1 inline-block">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Popular Tools */}
            <div>
              <h4 className="font-semibold text-white mb-4">Popular</h4>
              <ul className="space-y-2 text-sm">
                {['PDF to JPG', 'Remove BG', 'Compress Image', 'JSON Formatter', 'CSV to Excel'].map((item) => (
                  <li key={item}>
                    <a href="#" className="hover:text-white transition-colors hover:translate-x-1 inline-block">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                {[
                  { label: 'About', href: '/about' },
                  { label: 'Privacy Policy', href: '/privacy' },
                  { label: 'Terms of Service', href: '/tos' },
                  { label: 'Contact', href: '/contact' },
                  { label: 'Blog', href: '/blog' }
                ].map((item) => (
                  <li key={item.label}>
                    <Link href={item.href} className="hover:text-white transition-colors hover:translate-x-1 inline-block">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8">
            <p className="text-center text-sm text-gray-400">
              © 2026 SimplifyConvert. All rights reserved. All tools are free and work in your browser.
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}
