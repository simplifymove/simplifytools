'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { HomeHeader } from '@/app/components/HomeHeader';
import { ImageUploader } from '@/app/components/ImageUploader';
import { Download, ChevronRight, Type } from 'lucide-react';
import { motion } from 'framer-motion';
import { Footer } from '@/app/components/Footer';

export default function AddTextPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Text settings
  const [textContent, setTextContent] = useState('Your Text Here');
  const [fontSize, setFontSize] = useState(48);
  const [fontFamily, setFontFamily] = useState('Arial');
  const [textColor, setTextColor] = useState('#ffffff');
  const [textAlpha, setTextAlpha] = useState(100);
  const [positionX, setPositionX] = useState(50);
  const [positionY, setPositionY] = useState(50);
  const [textAlign, setTextAlign] = useState('center');
  const [shadowEnabled, setShadowEnabled] = useState(true);
  const [shadowColor, setShadowColor] = useState('#000000');
  const [shadowBlur, setShadowBlur] = useState(4);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    setError(null);
    setResult(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        setPreview(img.src);
        updatePreview(img);
      };
      img.onerror = () => {
        setError('Failed to load image');
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(selectedFile);
  };

  const updatePreview = (img: HTMLImageElement) => {
    if (!previewCanvasRef.current) return;
    const canvas = previewCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const maxWidth = 500;
    const scale = Math.min(1, maxWidth / img.width);
    const displayWidth = Math.round(img.width * scale);
    const displayHeight = Math.round(img.height * scale);

    canvas.width = displayWidth;
    canvas.height = displayHeight;

    ctx.drawImage(img, 0, 0, displayWidth, displayHeight);
    drawTextOnCanvas(ctx, canvas, displayWidth, displayHeight);
  };

  const drawTextOnCanvas = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, width: number, height: number) => {
    // Save context state
    ctx.save();

    // Calculate position
    const x = (width * positionX) / 100;
    const y = (height * positionY) / 100;

    // Scale font size based on canvas size
    const scaledFontSize = Math.round((fontSize * width) / 500);
    ctx.font = `bold ${scaledFontSize}px ${fontFamily}`;
    ctx.textAlign = textAlign as CanvasTextAlign;
    ctx.textBaseline = 'middle';

    // Apply text color with alpha
    const [r, g, b] = hexToRgb(textColor);
    ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${textAlpha / 100})`;

    // Apply shadow if enabled
    if (shadowEnabled) {
      const [sr, sg, sb] = hexToRgb(shadowColor);
      ctx.shadowColor = `rgba(${sr}, ${sg}, ${sb}, 0.7)`;
      ctx.shadowBlur = shadowBlur;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;
    }

    ctx.fillText(textContent, x, y);
    ctx.restore();
  };

  const hexToRgb = (hex: string): [number, number, number] => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (result) {
      return [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16),
      ];
    }
    return [255, 255, 255];
  };

  const addText = async () => {
    if (!preview) {
      setError('Please upload an image first');
      return;
    }

    if (!textContent.trim()) {
      setError('Please enter some text');
      return;
    }

    setProcessing(true);
    setError(null);
    setDownloadSuccess(false);

    try {
      const img = new Image();
      img.onload = () => {
        if (!canvasRef.current) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        drawTextOnCanvas(ctx, canvas, img.width, img.height);

        canvas.toBlob((blob) => {
          if (blob) {
            setResult(blob);
          }
          setProcessing(false);
        }, 'image/png');
      };
      img.onerror = () => {
        setError('Failed to process image');
        setProcessing(false);
      };
      img.src = preview;
    } catch (err) {
      setError('Error processing image');
      setProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!result) return;

    const url = URL.createObjectURL(result);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'image-with-text.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  const handleClearPreview = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <HomeHeader />

      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="bg-linear-to-r from-blue-500 via-blue-400 to-cyan-500 text-white py-12"
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
            <span>Add Text to Image</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="bg-white bg-opacity-20 p-3 rounded-lg">
              <Type size={32} />
            </div>
            <div>
              <h1 className="text-4xl font-bold mb-2">Add Text to Image</h1>
              <p className="text-lg text-blue-50">
                Add custom text overlays with fonts, colors, shadows, and positioning
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <main>
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Upload & Preview */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-white rounded-lg shadow-lg p-6 mb-6"
            >
              <h2 className="text-2xl font-bold mb-4">Upload Image</h2>
              <ImageUploader
                onFileSelect={handleFileSelect}
                preview={preview}
                onClearPreview={() => {
                  setPreview(null);
                  setFile(null);
                }}
              />
            </motion.div>

            {/* Preview */}
            {preview && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6 }}
                className="bg-white rounded-lg shadow-lg p-6"
              >
                <h2 className="text-2xl font-bold mb-4">Preview</h2>
                <div className="bg-gray-100 rounded-lg p-4 flex justify-center">
                  <canvas
                    ref={previewCanvasRef}
                    className="max-w-full h-auto border border-gray-300 rounded"
                  />
                </div>

                {error && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                    {error}
                  </div>
                )}

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={addText}
                  disabled={processing}
                  className="w-full mt-6 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-3 px-4 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  {processing ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Type size={20} />
                      Add Text
                    </>
                  )}
                </motion.button>

                {result && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg"
                  >
                    <p className="text-green-700 font-semibold mb-3">✓ Text added successfully!</p>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleDownload}
                      className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                    >
                      <Download size={18} />
                      Download Image
                    </motion.button>
                  </motion.div>
                )}

                {result && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleClearPreview}
                    className="w-full mt-3 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-lg font-semibold transition-colors"
                  >
                    Clear
                  </motion.button>
                )}
              </motion.div>
            )}
          </div>

          {/* Right Column - Settings */}
          <div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-white rounded-lg shadow-lg p-6 sticky top-4"
            >
              <h2 className="text-2xl font-bold mb-6">Text Settings</h2>

              {/* Text Content */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Text Content
                </label>
                <textarea
                  value={textContent}
                  onChange={(e) => {
                    setTextContent(e.target.value);
                    if (preview) {
                      const img = new Image();
                      img.onload = () => updatePreview(img);
                      img.src = preview;
                    }
                  }}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Enter your text"
                />
              </div>

              {/* Font Family */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Font Family
                </label>
                <select
                  value={fontFamily}
                  onChange={(e) => {
                    setFontFamily(e.target.value);
                    if (preview) {
                      const img = new Image();
                      img.onload = () => updatePreview(img);
                      img.src = preview;
                    }
                  }}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option>Arial</option>
                  <option>Georgia</option>
                  <option>Times New Roman</option>
                  <option>Courier New</option>
                  <option>Verdana</option>
                  <option>Comic Sans MS</option>
                  <option>Impact</option>
                </select>
              </div>

              {/* Font Size */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Font Size: {fontSize}px
                </label>
                <input
                  type="range"
                  min="12"
                  max="120"
                  value={fontSize}
                  onChange={(e) => {
                    setFontSize(Number(e.target.value));
                    if (preview) {
                      const img = new Image();
                      img.onload = () => updatePreview(img);
                      img.src = preview;
                    }
                  }}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>

              {/* Text Color */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Text Color
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={textColor}
                    onChange={(e) => {
                      setTextColor(e.target.value);
                      if (preview) {
                        const img = new Image();
                        img.onload = () => updatePreview(img);
                        img.src = preview;
                      }
                    }}
                    className="w-12 h-10 border border-gray-300 rounded-lg cursor-pointer"
                  />
                  <input
                    type="text"
                    value={textColor}
                    onChange={(e) => {
                      setTextColor(e.target.value);
                      if (preview) {
                        const img = new Image();
                        img.onload = () => updatePreview(img);
                        img.src = preview;
                      }
                    }}
                    className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    placeholder="#ffffff"
                  />
                </div>
              </div>

              {/* Text Alpha */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Opacity: {textAlpha}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={textAlpha}
                  onChange={(e) => {
                    setTextAlpha(Number(e.target.value));
                    if (preview) {
                      const img = new Image();
                      img.onload = () => updatePreview(img);
                      img.src = preview;
                    }
                  }}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>

              {/* Text Alignment */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Text Alignment
                </label>
                <div className="flex gap-2">
                  {['left', 'center', 'right'].map((align) => (
                    <button
                      key={align}
                      onClick={() => {
                        setTextAlign(align);
                        if (preview) {
                          const img = new Image();
                          img.onload = () => updatePreview(img);
                          img.src = preview;
                        }
                      }}
                      className={`flex-1 py-2 px-3 rounded-lg font-semibold transition-colors capitalize ${
                        textAlign === align
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {align}
                    </button>
                  ))}
                </div>
              </div>

              {/* Position X */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Horizontal Position: {positionX}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={positionX}
                  onChange={(e) => {
                    setPositionX(Number(e.target.value));
                    if (preview) {
                      const img = new Image();
                      img.onload = () => updatePreview(img);
                      img.src = preview;
                    }
                  }}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>

              {/* Position Y */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Vertical Position: {positionY}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={positionY}
                  onChange={(e) => {
                    setPositionY(Number(e.target.value));
                    if (preview) {
                      const img = new Image();
                      img.onload = () => updatePreview(img);
                      img.src = preview;
                    }
                  }}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>

              {/* Shadow Settings */}
              <div className="border-t pt-4">
                <label className="flex items-center gap-2 mb-4">
                  <input
                    type="checkbox"
                    checked={shadowEnabled}
                    onChange={(e) => {
                      setShadowEnabled(e.target.checked);
                      if (preview) {
                        const img = new Image();
                        img.onload = () => updatePreview(img);
                        img.src = preview;
                      }
                    }}
                    className="w-4 h-4 cursor-pointer"
                  />
                  <span className="text-sm font-semibold text-gray-700">Add Shadow</span>
                </label>

                {shadowEnabled && (
                  <>
                    <div className="mb-4">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Shadow Color
                      </label>
                      <input
                        type="color"
                        value={shadowColor}
                        onChange={(e) => {
                          setShadowColor(e.target.value);
                          if (preview) {
                            const img = new Image();
                            img.onload = () => updatePreview(img);
                            img.src = preview;
                          }
                        }}
                        className="w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Shadow Blur: {shadowBlur}px
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="10"
                        value={shadowBlur}
                        onChange={(e) => {
                          setShadowBlur(Number(e.target.value));
                          if (preview) {
                            const img = new Image();
                            img.onload = () => updatePreview(img);
                            img.src = preview;
                          }
                        }}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                      />
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Hidden Canvas */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      </main>

      <Footer />
    </div>
  );
}
