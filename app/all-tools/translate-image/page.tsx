'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { HomeHeader } from '../../components/HomeHeader';
import { ImageUploader } from '../../components/ImageUploader';
import { Download, ChevronRight, Globe, Plus, X, Loader } from 'lucide-react';
import { Footer } from '../../components/Footer';

interface DetectedText {
  id: string;
  original: string;
  translated: string;
  x: number;
  y: number;
  confidence: number;
}

interface TextOverlay {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  color: string;
}

const languages = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'zh', name: 'Chinese' },
  { code: 'ru', name: 'Russian' },
  { code: 'ar', name: 'Arabic' },
  { code: 'hi', name: 'Hindi' },
];

export default function TranslateImagePage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [sourceLanguage, setSourceLanguage] = useState('en');
  const [targetLanguage, setTargetLanguage] = useState('es');
  const [detectedTexts, setDetectedTexts] = useState<DetectedText[]>([]);
  const [overlays, setOverlays] = useState<TextOverlay[]>([]);
  const [selectedOverlayId, setSelectedOverlayId] = useState<string | null>(null);
  const [fontSize, setFontSize] = useState(20);
  const [textColor, setTextColor] = useState('#FFFFFF');
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<Blob | null>(null);
  const [error, setError] = useState<string>('');
  const [ocrProcessing, setOcrProcessing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    setError('');
    setResult(null);
    setDetectedTexts([]);
    setOverlays([]);

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleClearPreview = () => {
    setFile(null);
    setPreview('');
    setResult(null);
    setDetectedTexts([]);
    setOverlays([]);
  };

  const performOCR = async () => {
    if (!file) {
      setError('Please upload an image first');
      return;
    }

    setOcrProcessing(true);
    setError('');
    setDetectedTexts([]);
    setOverlays([]);

    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('sourceLanguage', sourceLanguage);
      formData.append('targetLanguage', targetLanguage);

      const response = await fetch('/api/translate-image', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Convert API response to DetectedText format
      const detectedItems: DetectedText[] = (data.translations || []).map(
        (translation: any, index: number) => ({
          id: String(index),
          original: translation.original,
          translated: translation.translated || translation.original,
          x: translation.x,
          y: translation.y,
          confidence: translation.confidence,
        })
      );

      setDetectedTexts(detectedItems);

      // Create initial overlays for detected text
      const initialOverlays: TextOverlay[] = detectedItems.map((item, idx) => ({
        id: String(idx),
        text: item.translated,
        x: item.x,
        y: item.y,
        fontSize,
        color: textColor,
      }));
      setOverlays(initialOverlays);
    } catch (err) {
      setError('OCR failed: ' + (err instanceof Error ? err.message : 'Unknown error'));
      setDetectedTexts([]);
      setOverlays([]);
    } finally {
      setOcrProcessing(false);
    }
  };

  const removeOverlay = (id: string) => {
    setOverlays(overlays.filter((o) => o.id !== id));
    if (selectedOverlayId === id) {
      setSelectedOverlayId(null);
    }
  };

  const updateOverlay = (id: string, updates: Partial<TextOverlay>) => {
    setOverlays(overlays.map((o) => (o.id === id ? { ...o, ...updates } : o)));
  };

  const drawPreview = () => {
    if (!preview) return;

    const canvas = previewCanvasRef.current;
    if (!canvas) return;

    const img = new Image();
    img.onload = () => {
      canvas.width = img.width > 600 ? 600 : img.width;
      canvas.height = (img.height / img.width) * canvas.width;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // Draw overlays
      overlays.forEach((overlay) => {
        ctx.font = `${overlay.fontSize}px Arial`;
        ctx.fillStyle = overlay.color;
        
        // Add text shadow for better visibility
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 3;
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 1;
        
        ctx.fillText(overlay.text, overlay.x, overlay.y);
        ctx.shadowColor = 'transparent';

        // Draw selection box if selected
        if (overlay.id === selectedOverlayId) {
          const metrics = ctx.measureText(overlay.text);
          ctx.strokeStyle = '#ff6b6b';
          ctx.lineWidth = 2;
          ctx.strokeRect(overlay.x - 2, overlay.y - overlay.fontSize, metrics.width + 4, overlay.fontSize + 4);
        }
      });
    };
    img.src = preview;
  };

  const generateImage = async () => {
    if (!file || !preview || overlays.length === 0) {
      setError('Please upload an image and run OCR with translations');
      return;
    }

    setProcessing(true);
    setError('');

    try {
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = img.width;
        canvas.height = img.height;

        ctx.drawImage(img, 0, 0);

        // Draw overlays at original resolution
        overlays.forEach((overlay) => {
          ctx.font = `${overlay.fontSize}px Arial`;
          ctx.fillStyle = overlay.color;
          
          // Add text shadow
          ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
          ctx.shadowBlur = 3;
          ctx.shadowOffsetX = 1;
          ctx.shadowOffsetY = 1;
          
          ctx.fillText(overlay.text, overlay.x, overlay.y);
          ctx.shadowColor = 'transparent';
        });

        canvas.toBlob(
          (blob) => {
            if (blob) {
              setResult(blob);
            }
            setProcessing(false);
          },
          'image/png',
          0.95
        );
      };
      img.onerror = () => {
        setError('Failed to load image');
        setProcessing(false);
      };
      img.src = preview;
    } catch (err) {
      setError('Error generating image: ' + (err instanceof Error ? err.message : 'Unknown error'));
      setProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!result) return;

    const url = URL.createObjectURL(result);
    const link = document.createElement('a');
    link.href = url;
    link.download = `translated-image-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Update preview when overlays change
  useEffect(() => {
    drawPreview();
  }, [overlays, selectedOverlayId, preview]);

  return (
    <div className="min-h-screen bg-gray-50">
      <HomeHeader />

      {/* Hero Header */}
      <div className="bg-blue-600 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-16">
          <div className="flex items-center gap-2 text-white/90 text-sm mb-6">
            <Link href="/" className="hover:text-white transition">Home</Link>
            <ChevronRight size={16} />
            <Link href="/all-tools" className="hover:text-white transition">All Tools</Link>
            <ChevronRight size={16} />
            <span>Translate Image</span>
          </div>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">Translate Image</h1>
              <p className="text-white/90 text-lg">
                Automatically detect text in images and translate it
              </p>
            </div>
            <div className="bg-white/20 rounded-2xl p-4 shadow-lg hidden md:block">
              <Globe size={40} className="text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main>
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Section - Upload */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-4">1. Upload Image</h2>
              <ImageUploader 
                onFileSelect={handleFileSelect} 
                preview={preview} 
                onClearPreview={handleClearPreview} 
                accept="image/*" 
              />
              {file && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    📁 {file.name}
                  </p>
                </div>
              )}

              <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <h3 className="font-semibold text-amber-900 mb-2">Select Languages</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-amber-900 mb-1">Source</label>
                    <select
                      value={sourceLanguage}
                      onChange={(e) => setSourceLanguage(e.target.value)}
                      className="w-full border border-amber-300 rounded-lg p-2 text-sm"
                    >
                      {languages.map((lang) => (
                        <option key={lang.code} value={lang.code}>
                          {lang.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-amber-900 mb-1">Target</label>
                    <select
                      value={targetLanguage}
                      onChange={(e) => setTargetLanguage(e.target.value)}
                      className="w-full border border-amber-300 rounded-lg p-2 text-sm"
                    >
                      {languages.map((lang) => (
                        <option key={lang.code} value={lang.code}>
                          {lang.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <button
                  onClick={performOCR}
                  disabled={!file || ocrProcessing}
                  className="w-full mt-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-2 px-4 rounded-lg transition flex items-center justify-center gap-2 text-sm"
                >
                  {ocrProcessing ? (
                    <>
                      <Loader size={16} className="animate-spin" />
                      Detecting Text...
                    </>
                  ) : (
                    <>
                      <Globe size={16} />
                      2. Detect & Translate
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Center Section - Preview */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Preview</h2>
              <div className="flex items-center justify-center bg-gray-100 rounded-lg overflow-auto max-h-96">
                {preview ? (
                  <canvas ref={previewCanvasRef} className="max-w-full" />
                ) : (
                  <div className="text-gray-400 text-center p-8">
                    <p className="text-sm">Upload an image to preview</p>
                  </div>
                )}
              </div>

              {detectedTexts.length > 0 && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm font-semibold text-green-900 mb-2">
                    ✓ Detected {detectedTexts.length} text {detectedTexts.length === 1 ? 'item' : 'items'}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Section - Translations */}
          <div className="lg:col-span-1 lg:sticky lg:top-6 lg:h-fit">
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-4">3. Edit Translations</h2>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              {detectedTexts.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-sm">Run OCR to detect text in image</p>
                </div>
              ) : (
                <>
                  {/* Text Styling Controls */}
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Font Size: {fontSize}px</label>
                    <input
                      type="range"
                      min="12"
                      max="72"
                      value={fontSize}
                      onChange={(e) => {
                        const newSize = parseInt(e.target.value);
                        setFontSize(newSize);
                        setOverlays(overlays.map(o => ({ ...o, fontSize: newSize })));
                      }}
                      className="w-full accent-blue-500"
                    />

                    <label className="block text-sm font-medium text-gray-700 mt-3 mb-2">Text Color</label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={textColor}
                        onChange={(e) => {
                          setTextColor(e.target.value);
                          setOverlays(overlays.map(o => ({ ...o, color: e.target.value })));
                        }}
                        className="w-12 h-10 rounded cursor-pointer border border-gray-300"
                      />
                      <input
                        type="text"
                        value={textColor}
                        readOnly
                        className="flex-1 border border-gray-300 rounded-lg p-2 text-sm"
                      />
                    </div>
                  </div>

                  {/* Overlays List */}
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200 max-h-56 overflow-y-auto">
                    <p className="text-sm font-medium text-gray-700 mb-2">Detected Text ({overlays.length})</p>
                    <div className="space-y-2">
                      {overlays.map((overlay, idx) => (
                        <div key={overlay.id} className="p-2 bg-white border border-gray-200 rounded text-xs">
                          <div className="flex items-start gap-2 mb-1">
                            <input
                              type="text"
                              value={overlay.text}
                              onChange={(e) => updateOverlay(overlay.id, { text: e.target.value })}
                              className="flex-1 border border-gray-300 rounded p-1 text-xs"
                            />
                            <button
                              onClick={() => removeOverlay(overlay.id)}
                              className="text-red-500 hover:text-red-700 flex-shrink-0"
                            >
                              <X size={14} />
                            </button>
                          </div>
                          {detectedTexts[idx] && (
                            <p className="text-gray-500">Original: {detectedTexts[idx].original}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Generate Button */}
                  <button
                    onClick={generateImage}
                    disabled={overlays.length === 0 || processing}
                    className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-2 px-4 rounded-lg transition mb-3 flex items-center justify-center gap-2 text-sm"
                  >
                    {processing ? (
                      <>
                        <Loader size={16} className="animate-spin" />
                        Generating...
                      </>
                    ) : (
                      '✓ Generate Image'
                    )}
                  </button>

                  {/* Download Button */}
                  {result && (
                    <button
                      onClick={handleDownload}
                      className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-2 px-4 rounded-lg transition flex items-center justify-center gap-2 text-sm"
                    >
                      <Download size={16} />
                      Download PNG
                    </button>
                  )}
                </>
              )}
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mt-6">
              <h3 className="font-bold text-blue-900 mb-2">💡 How It Works</h3>
              <ol className="text-sm text-blue-800 space-y-1">
                <li>1. Upload your image</li>
                <li>2. Select source & target languages</li>
                <li>3. Click "Detect & Translate"</li>
                <li>4. Edit translations if needed</li>
                <li>5. Generate and download</li>
              </ol>
            </div>
          </div>
        </div>
      </div>

      {/* Hidden Canvas */}
      <canvas ref={canvasRef} className="hidden" />
      </main>

      <Footer />
    </div>
  );
}





