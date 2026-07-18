'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { HomeHeader } from '@/app/components/HomeHeader';
import { ImageUploader } from '@/app/components/ImageUploader';
import { Download, ChevronRight, Eye, Zap, Settings2, Loader2, Copy, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useImageToolErrors } from '@/app/hooks/useImageToolErrors';
import { ErrorAlert } from '@/app/components/error-components';
import {
  validateImageNotEmpty,
  validateImageExtension,
  validateImageMimeType,
  validateImageFileSize,
} from '@/app/utils/validation/image-validation';
import { ImageToolErrorType } from '@/app/utils/types/errors';
import { useRouter } from 'next/navigation';
import { uploadBrowserDownloadResult } from '@/app/lib/download-result-client';

const TOOL_ID = 'make-background-transparent';
const TOOL_NAME = 'Make Background Transparent';

export default function MakeBackgroundTransparentPage() {
    const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<Blob | null>(null);
  const [threshold, setThreshold] = useState(12);
  const [feather, setFeather] = useState(2);
  const [edgePreservation, setEdgePreservation] = useState(true);
  const [colorToRemove, setColorToRemove] = useState('#ffffff');
  const [useAutoDetect, setUseAutoDetect] = useState(true);
  const [compareMode, setCompareMode] = useState(false);
  const [sliderPosition, setSliderPosition] = useState(50);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [advancedMode, setAdvancedMode] = useState(false);
  const { error, clearError, createError } = useImageToolErrors();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  const handleFileSelect = (selectedFile: File) => {
    clearError();

    // Validate file
    const emptyCheck = validateImageNotEmpty(selectedFile);
    if (!emptyCheck.valid) {
      createError(
        ImageToolErrorType.EMPTY_FILE,
        TOOL_ID,
        TOOL_NAME,
        { file: selectedFile }
      );
      return;
    }

    const extensionCheck = validateImageExtension(selectedFile.name);
    if (!extensionCheck.valid) {
      createError(
        ImageToolErrorType.UNSUPPORTED_FORMAT,
        TOOL_ID,
        TOOL_NAME,
        { file: selectedFile }
      );
      return;
    }

    const mimeCheck = validateImageMimeType(selectedFile);
    if (!mimeCheck.valid) {
      createError(
        ImageToolErrorType.INVALID_MIME_TYPE,
        TOOL_ID,
        TOOL_NAME,
        { file: selectedFile }
      );
      return;
    }

    const sizeCheck = validateImageFileSize(selectedFile, TOOL_ID);
    if (!sizeCheck.valid) {
      createError(
        ImageToolErrorType.FILE_TOO_LARGE,
        TOOL_ID,
        TOOL_NAME,
        { file: selectedFile },
        { filename: selectedFile.name, size: selectedFile.size, mimeType: selectedFile.type }
      );
      return;
    }

    setFile(selectedFile);
    setResult(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        setPreview(img.src);
        updatePreview(img);
      };
      img.onerror = () => {
        createError(
          ImageToolErrorType.FILE_CORRUPTED,
          TOOL_ID,
          TOOL_NAME,
          { file: selectedFile }
        );
      };
      img.src = e.target?.result as string;
    };
    reader.onerror = () => {
      createError(
        ImageToolErrorType.FILE_CORRUPTED,
        TOOL_ID,
        TOOL_NAME,
        { file: selectedFile }
      );
    };
    reader.readAsDataURL(selectedFile);
  };

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16),
    } : { r: 255, g: 255, b: 255 };
  };

  const colorDistance = (c1: { r: number; g: number; b: number }, c2: { r: number; g: number; b: number }) => {
    return Math.sqrt(
      Math.pow(c1.r - c2.r, 2) +
      Math.pow(c1.g - c2.g, 2) +
      Math.pow(c1.b - c2.b, 2)
    );
  };

  // Detect edges using Sobel operator to preserve object boundaries
  const detectEdges = (imageData: ImageData): Uint8ClampedArray => {
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;
    const edges = new Uint8ClampedArray(width * height);

    // Sobel operator for edge detection
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = (y * width + x) * 4;

        // Get surrounding pixels
        const topLeft = (((y - 1) * width + (x - 1)) * 4);
        const top = (((y - 1) * width + x) * 4);
        const topRight = (((y - 1) * width + (x + 1)) * 4);
        const left = ((y * width + (x - 1)) * 4);
        const right = ((y * width + (x + 1)) * 4);
        const bottomLeft = (((y + 1) * width + (x - 1)) * 4);
        const bottom = (((y + 1) * width + x) * 4);
        const bottomRight = (((y + 1) * width + (x + 1)) * 4);

        // Calculate Sobel X and Y
        const gx = (-data[topLeft] - 2 * data[left] - data[bottomLeft] + data[topRight] + 2 * data[right] + data[bottomRight]) / 8;
        const gy = (-data[topLeft] - 2 * data[top] - data[topRight] + data[bottomLeft] + 2 * data[bottom] + data[bottomRight]) / 8;

        const magnitude = Math.sqrt(gx * gx + gy * gy);
        edges[y * width + x] = Math.min(255, Math.round(magnitude));
      }
    }

    return edges;
  };

  // Apply feathering to edges for smoother transparency
  const applyFeathering = (imageData: ImageData, threshold: number, featherAmount: number, isEdgePixel?: Uint8ClampedArray) => {
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;
    const tempData = new Uint8ClampedArray(data);

    // First pass: identify edges and apply feathering
    for (let i = 0; i < data.length; i += 4) {
      if (data[i + 3] === 0) {
        // Already transparent, check neighbors for feathering
        if (featherAmount > 0) {
          const pixelIndex = i / 4;
          const x = pixelIndex % width;
          const y = Math.floor(pixelIndex / width);

          // Check neighboring pixels for partial transparency
          for (let dy = -featherAmount; dy <= featherAmount; dy++) {
            for (let dx = -featherAmount; dx <= featherAmount; dx++) {
              const nx = x + dx;
              const ny = y + dy;
              if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                const neighborIdx = (ny * width + nx) * 4;
                if (tempData[neighborIdx + 3] > 0) {
                  const distance = Math.sqrt(dx * dx + dy * dy);
                  if (distance > 0 && distance <= featherAmount) {
                    const alpha = tempData[neighborIdx + 3];
                    const falloff = 1 - distance / featherAmount;
                    data[neighborIdx + 3] = Math.round(alpha * (1 - falloff * 0.3));
                  }
                }
              }
            }
          }
        }
      }
    }
  };

  // Enhanced background removal with better edge detection
  const processImageWithRemoval = (
    canvas: HTMLCanvasElement,
    img: HTMLImageElement,
    targetColor: { r: number; g: number; b: number },
    thresh: number,
    featherAmount: number,
    preserveEdges: boolean = true
  ) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return false;

    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const width = canvas.width;
    const height = canvas.height;

    // Detect edges if edge preservation is enabled
    let edgeMap: Uint8ClampedArray | null = null;
    if (preserveEdges) {
      edgeMap = detectEdges(imageData);
    }

    // Remove background with color distance threshold
    for (let i = 0; i < data.length; i += 4) {
      const pixelIdx = i / 4;
      const x = pixelIdx % width;
      const y = Math.floor(pixelIdx / width);

      const pixelColor = { r: data[i], g: data[i + 1], b: data[i + 2] };
      const dist = colorDistance(pixelColor, targetColor);

      // Use stricter threshold near edges to preserve object boundaries
      let effectiveThreshold = thresh * 2.55;
      
      if (preserveEdges && edgeMap) {
        const edgeStrength = edgeMap[y * width + x];
        // If pixel is on an edge, dramatically reduce removal threshold
        if (edgeStrength > 10) {
          effectiveThreshold = effectiveThreshold * 0.3; // Very conservative near edges (70% reduction)
        }
      }

      if (dist < effectiveThreshold) {
        data[i + 3] = 0; // Make transparent
      }
    }

    // Apply feathering for smoother edges
    if (featherAmount > 0) {
      applyFeathering(imageData, thresh, featherAmount, edgeMap || undefined);
    }

    ctx.putImageData(imageData, 0, 0);
    return true;
  };

  const updatePreview = (img: HTMLImageElement) => {
    if (!previewCanvasRef.current) return;
    const canvas = previewCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const maxWidth = 400;
    const scale = Math.min(1, maxWidth / img.width);
    const displayWidth = Math.round(img.width * scale);
    const displayHeight = Math.round(img.height * scale);

    canvas.width = displayWidth;
    canvas.height = displayHeight;

    ctx.drawImage(img, 0, 0, displayWidth, displayHeight);

    const imageData = ctx.getImageData(0, 0, displayWidth, displayHeight);
    const data = imageData.data;
    const width = displayWidth;
    const height = displayHeight;
    const targetColor = useAutoDetect ? getCornerColor(img) : hexToRgb(colorToRemove);

    // Detect edges for preview with edge preservation
    let edgeMap: Uint8ClampedArray | null = null;
    if (edgePreservation) {
      edgeMap = detectEdges(imageData);
    }

    // Apply enhanced background removal
    for (let i = 0; i < data.length; i += 4) {
      const pixelIdx = i / 4;
      const x = pixelIdx % width;
      const y = Math.floor(pixelIdx / width);

      const pixelColor = { r: data[i], g: data[i + 1], b: data[i + 2] };
      const dist = colorDistance(pixelColor, targetColor);

      // Use stricter threshold near edges
      let effectiveThreshold = threshold * 2.55;
      
      if (edgePreservation && edgeMap) {
        const edgeStrength = edgeMap[y * width + x];
        if (edgeStrength > 10) {
          effectiveThreshold = effectiveThreshold * 0.3; // Very conservative near edges (70% reduction)
        }
      }

      if (dist < effectiveThreshold) {
        data[i + 3] = 0;
      }
    }

    // Apply feathering for smoother edges on preview
    if (feather > 0) {
      applyFeathering(imageData, threshold, feather, edgeMap || undefined);
    }

    ctx.putImageData(imageData, 0, 0);
  };

  const getCornerColor = (img: HTMLImageElement) => {
    // Sample a larger corner area (30x30) to get more accurate background color
    const tempCanvas = document.createElement('canvas');
    const sampleSize = Math.min(30, Math.floor(img.width / 10), Math.floor(img.height / 10));
    tempCanvas.width = sampleSize;
    tempCanvas.height = sampleSize;
    const ctx = tempCanvas.getContext('2d');
    if (!ctx) return { r: 255, g: 255, b: 255 };

    // Sample top-left corner area
    ctx.drawImage(img, 0, 0, sampleSize, sampleSize, 0, 0, sampleSize, sampleSize);
    const imageData = ctx.getImageData(0, 0, sampleSize, sampleSize);
    const data = imageData.data;

    // Calculate median color from the sample area (more robust than average)
    const reds: number[] = [];
    const greens: number[] = [];
    const blues: number[] = [];

    for (let i = 0; i < data.length; i += 4) {
      reds.push(data[i]);
      greens.push(data[i + 1]);
      blues.push(data[i + 2]);
    }

    reds.sort((a, b) => a - b);
    greens.sort((a, b) => a - b);
    blues.sort((a, b) => a - b);

    const mid = Math.floor(reds.length / 2);
    return {
      r: reds[mid],
      g: greens[mid],
      b: blues[mid],
    };
  };

  const removeBackground = async () => {
    if (!preview || !file) {
      createError(
        ImageToolErrorType.EMPTY_FILE,
        TOOL_ID,
        TOOL_NAME
      );
      return;
    }

    setProcessing(true);
    clearError();
    setDownloadSuccess(false);

    try {
      const img = new Image();
      img.onload = () => {
        if (!canvasRef.current) {
          createError(
            ImageToolErrorType.SHARP_FAILED,
            TOOL_ID,
            TOOL_NAME,
            { file }
          );
          setProcessing(false);
          return;
        }
        const canvas = canvasRef.current;
        const targetColor = useAutoDetect ? getCornerColor(img) : hexToRgb(colorToRemove);

        // Process with enhanced algorithm and edge preservation
        const success = processImageWithRemoval(canvas, img, targetColor, threshold, feather, edgePreservation);

        if (success) {
          canvas.toBlob((blob) => {
            if (blob) {
              setResult(blob);
            } else {
              createError(
                ImageToolErrorType.SHARP_FAILED,
                TOOL_ID,
                TOOL_NAME,
                { file }
              );
            }
            setProcessing(false);
          }, 'image/png');
        } else {
          createError(
            ImageToolErrorType.SHARP_FAILED,
            TOOL_ID,
            TOOL_NAME,
            { file }
          );
          setProcessing(false);
        }
      };
      img.onerror = () => {
        createError(
          ImageToolErrorType.FILE_CORRUPTED,
          TOOL_ID,
          TOOL_NAME,
          { file }
        );
        setProcessing(false);
      };
      img.src = preview;
    } catch (err) {
      createError(
        ImageToolErrorType.SHARP_FAILED,
        TOOL_ID,
        TOOL_NAME,
        { file }
      );
      setProcessing(false);
    }
  };

  const handleDownload = async () => {
      if (!result || processing) return;

      
      setProcessing(true);

      try {
        const downloadResult =
          await uploadBrowserDownloadResult({
            blob: result,
            toolSlug: 'make-background-transparent',
            originalName: 'transparent-background.png',
            outputName: 'transparent-background.png',
          });

        router.push(downloadResult.downloadPageUrl);
      } catch (caughtError) {
        console.error('Download preparation failed:', caughtError);
        window.alert(
          caughtError instanceof Error
            ? caughtError.message
            : 'Unable to prepare the download.',
        );
      } finally {
        setProcessing(false);
      }
    };

  const handleClearPreview = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    clearError();
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-gray-50 to-white">
      <HomeHeader />

      <main>
      {/* Hero Section with Breadcrumb */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="bg-linear-to-r from-orange-500 via-orange-400 to-amber-500 text-white py-12"
      >
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex items-center gap-2 text-sm mb-6 opacity-90">
            <Link href="/" className="hover:opacity-75 underline">
              Home
            </Link>
            <ChevronRight size={16} />
            <Link href="/all-tools" className="hover:opacity-75 underline">
              All Tools
            </Link>
            <ChevronRight size={16} />
            <span>Make Background Transparent</span>
          </div>

          <div className="flex items-center gap-4 mb-4">
            <motion.div 
              whileHover={{ scale: 1.1, rotate: 10 }}
              className="bg-white bg-opacity-20 p-3 rounded-xl backdrop-blur"
            >
              <Zap size={32} />
            </motion.div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-2">Background Transparency</h1>
              <p className="text-lg text-orange-50">
                Remove backgrounds instantly with clean edges and transparency
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        {error && <ErrorAlert error={error} onDismiss={clearError} />}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Upload & Preview */}
          <div className="lg:col-span-2 space-y-6">
            {/* Upload Section */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl border-2 border-gray-200 p-8 shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="flex items-center gap-2 mb-4">
                <Eye size={20} className="text-orange-500" />
                <h2 className="text-xl font-semibold text-gray-900">Upload Image</h2>
              </div>
              <ImageUploader
                onFileSelect={handleFileSelect}
                preview={preview}
                onClearPreview={handleClearPreview}
                toolId={TOOL_ID}
                onValidationError={() => {}}
              />
              <p className="text-xs text-gray-600 mt-3">
                ✓ Supports PNG, JPG, WebP • Works best with solid or semi-solid backgrounds
              </p>
            </motion.div>

            {/* Preview & Results Section */}
            {preview && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Preview with Checkerboard */}
                <div className="bg-white rounded-xl border-2 border-gray-200 p-6 shadow-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Settings2 size={18} className="text-orange-500" />
                    Preview
                  </h3>
                  <div className="flex justify-center mb-6 bg-[linear-gradient(45deg,#e5e7eb_25%,transparent_25%,transparent_75%,#e5e7eb_75%,#e5e7eb),linear-gradient(45deg,#e5e7eb_25%,transparent_25%,transparent_75%,#e5e7eb_75%,#e5e7eb)] bg-[length:20px_20px] bg-[position:0_0,10px_10px] p-4 rounded-lg">
                    <canvas
                      ref={previewCanvasRef}
                      className="max-w-full h-auto rounded-lg border-2 border-orange-300 shadow-md"
                    />
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={removeBackground}
                    disabled={processing}
                    className="w-full bg-linear-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:from-gray-400 disabled:to-gray-500 text-white py-3 px-6 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all shadow-lg"
                  >
                    {processing ? (
                      <>
                        <Loader2 className="animate-spin" size={20} />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Zap size={20} />
                        Remove Background
                      </>
                    )}
                  </motion.button>
                </div>

                {/* Result Section */}
                {result && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-xl border-2 border-green-300 p-6 shadow-lg"
                  >
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">✓ Result Ready</h3>
                    <div className="flex justify-center mb-6 bg-[linear-gradient(45deg,#e5e7eb_25%,transparent_25%,transparent_75%,#e5e7eb_75%,#e5e7eb),linear-gradient(45deg,#e5e7eb_25%,transparent_25%,transparent_75%,#e5e7eb_75%,#e5e7eb)] bg-[length:20px_20px] bg-[position:0_0,10px_10px] p-4 rounded-lg">
                      <img
                        src={URL.createObjectURL(result)}
                        alt="Result"
                        className="max-w-full h-auto rounded-lg border-2 border-green-300 shadow-md"
                        style={{ maxHeight: '400px' }}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="bg-green-50 p-3 rounded-lg text-center">
                        <p className="text-xs text-gray-600">File Size</p>
                        <p className="text-sm font-semibold text-green-700">{(result.size / 1024).toFixed(2)} KB</p>
                      </div>
                      <div className="bg-green-50 p-3 rounded-lg text-center">
                        <p className="text-xs text-gray-600">Format</p>
                        <p className="text-sm font-semibold text-green-700">PNG (Transparent)</p>
                      </div>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleDownload}
                      className="w-full bg-linear-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-3 px-6 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all shadow-lg"
                    >
                      <Download size={20} />
                      Download Transparent Image
                    </motion.button>
                  </motion.div>
                )}

                {downloadSuccess && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="bg-green-50 border-2 border-green-300 rounded-lg p-4 flex items-center gap-3"
                  >
                    <Copy className="text-green-600" size={20} />
                    <span className="text-green-800 font-medium">Downloaded successfully!</span>
                  </motion.div>
                )}
              </motion.div>
            )}
          </div>

          {/* Right Column - Controls */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:sticky lg:top-4 h-fit space-y-6"
          >
            {/* Main Controls */}
            <div className="bg-white rounded-xl border-2 border-gray-200 p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <Settings2 size={18} className="text-orange-500" />
                Background Settings
              </h3>

              {/* Auto Detect */}
              <div className="mb-6 pb-6 border-b border-gray-200">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={useAutoDetect}
                    onChange={(e) => {
                      setUseAutoDetect(e.target.checked);
                      if (preview) {
                        const img = new Image();
                        img.onload = () => updatePreview(img);
                        img.src = preview;
                      }
                    }}
                    className="w-5 h-5 accent-orange-500 cursor-pointer"
                  />
                  <span className="text-sm font-medium text-gray-700 group-hover:text-orange-600">
                    Auto-Detect Background
                  </span>
                </label>
                <p className="text-xs text-gray-600 mt-2 ml-8">
                  Analyzes corner pixels to find the background color
                </p>
              </div>

              {/* Color Picker */}
              {!useAutoDetect && (
                <div className="mb-6 pb-6 border-b border-gray-200">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Background Color
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={colorToRemove}
                      onChange={(e) => {
                        setColorToRemove(e.target.value);
                        if (preview) {
                          const img = new Image();
                          img.onload = () => updatePreview(img);
                          img.src = preview;
                        }
                      }}
                      className="w-16 h-12 rounded-lg cursor-pointer border-2 border-gray-300 hover:border-orange-400 transition-colors"
                    />
                    <input
                      type="text"
                      value={colorToRemove}
                      readOnly
                      className="flex-1 px-3 py-2 border-2 border-gray-300 rounded-lg text-sm bg-gray-50 font-mono"
                    />
                  </div>
                </div>
              )}

              {/* Sensitivity Slider */}
              <div className="mb-6 pb-6 border-b border-gray-200">
                <label className="block text-sm font-medium text-gray-900 mb-3">
                  Color Sensitivity: <span className="text-orange-600 font-bold">{threshold}%</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={threshold}
                  onChange={(e) => {
                    setThreshold(Number(e.target.value));
                    if (preview) {
                      const img = new Image();
                      img.onload = () => updatePreview(img);
                      img.src = preview;
                    }
                  }}
                  className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
                />
                <div className="flex justify-between text-xs text-gray-600 mt-2">
                  <span>Precise</span>
                  <span>More Variations</span>
                </div>
              </div>

              {/* Edge Feathering */}
              <div className="mb-6 pb-6 border-b border-gray-200">
                <label className="block text-sm font-medium text-gray-900 mb-3">
                  Edge Feathering: <span className="text-orange-600 font-bold">{feather}px</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={feather}
                  onChange={(e) => {
                    setFeather(Number(e.target.value));
                    if (preview) {
                      const img = new Image();
                      img.onload = () => updatePreview(img);
                      img.src = preview;
                    }
                  }}
                  className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
                />
                <p className="text-xs text-gray-600 mt-2">
                  Smooths edges for more professional results (0 = sharp, 10 = soft)
                </p>
              </div>

              {/* Edge Preservation - NEW FEATURE */}
              <div>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={edgePreservation}
                    onChange={(e) => {
                      setEdgePreservation(e.target.checked);
                      if (preview) {
                        const img = new Image();
                        img.onload = () => updatePreview(img);
                        img.src = preview;
                      }
                    }}
                    className="w-5 h-5 accent-orange-500 cursor-pointer"
                  />
                  <span className="text-sm font-medium text-gray-700 group-hover:text-orange-600">
                    Smart Edge Preservation
                  </span>
                </label>
                <p className="text-xs text-gray-600 mt-2 ml-8">
                  Protects object edges from being removed with background (recommended)
                </p>
              </div>

              {preview && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleClearPreview}
                  className="w-full mt-6 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-lg font-medium transition-colors"
                >
                  Clear
                </motion.button>
              )}
            </div>

            {/* How to Use */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-blue-50 border-2 border-blue-300 rounded-xl p-5"
            >
              <h4 className="font-semibold text-blue-900 mb-3 text-sm">How to Use</h4>
              <ol className="text-sm text-blue-800 space-y-2">
                <li className="flex gap-2">
                  <span className="font-bold text-blue-600 shrink-0">1.</span>
                  <span>Upload your image</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-bold text-blue-600 shrink-0">2.</span>
                  <span>Enable auto-detect or pick color</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-bold text-blue-600 shrink-0">3.</span>
                  <span>Adjust sensitivity & feathering</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-bold text-blue-600 shrink-0">4.</span>
                  <span>Review the preview</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-bold text-blue-600 shrink-0">5.</span>
                  <span>Download as PNG</span>
                </li>
              </ol>
            </motion.div>

            {/* Pro Tips */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-purple-50 border-2 border-purple-300 rounded-xl p-5"
            >
              <h4 className="font-semibold text-purple-900 mb-3 text-sm">Pro Tips</h4>
              <ul className="text-sm text-purple-800 space-y-2">
                <li>✓ Enable <strong>Smart Edge Preservation</strong> to protect object edges</li>
                <li>✓ Use <strong>auto-detect</strong> for accurate background color</li>
                <li>✓ <strong>Lower sensitivity</strong> for precise results (doesn't remove objects)</li>
                <li>✓ <strong>Feather edges</strong> for smooth, professional look</li>
                <li>✓ PNG format preserves transparency perfectly</li>
              </ul>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Hidden Canvas */}
      <canvas ref={canvasRef} className="hidden" />
      </main>

      {/* Footer */}
      <footer className="bg-slate-800 text-white py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <p className="text-center text-slate-400">
            © 2024 Image Tools. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}






