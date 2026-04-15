'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { HomeHeader } from '../../components/HomeHeader';
import { ImageUploader } from '../../components/ImageUploader';
import { Download, ChevronRight, Globe, Plus, X } from 'lucide-react';
import { Footer } from '../../components/Footer';

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
  const [translationText, setTranslationText] = useState('');
  const [newTranslationText, setNewTranslationText] = useState('');
  const [overlays, setOverlays] = useState<TextOverlay[]>([]);
  const [selectedOverlayId, setSelectedOverlayId] = useState<string | null>(null);
  const [fontSize, setFontSize] = useState(24);
  const [textColor, setTextColor] = useState('#000000');
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<Blob | null>(null);
  const [error, setError] = useState<string>('');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    setError('');
    setResult(null);
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
    setOverlays([]);
  };

  const addTranslationOverlay = () => {
    if (!newTranslationText.trim()) {
      setError('Please enter translation text');
      return;
    }

    const newOverlay: TextOverlay = {
      id: String(Date.now()),
      text: newTranslationText,
      x: 50,
      y: 50 + overlays.length * 40,
      fontSize,
      color: textColor,
    };

    setOverlays([...overlays, newOverlay]);
    setNewTranslationText('');
    setError('');
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

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (overlays.length === 0) return;
    const canvas = previewCanvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Find if clicked on any overlay (approximate)
    for (let i = overlays.length - 1; i >= 0; i--) {
      const overlay = overlays[i];
      if (x >= overlay.x && x <= overlay.x + 200 && y >= overlay.y - 20 && y <= overlay.y + 10) {
        setSelectedOverlayId(overlay.id);
        break;
      }
    }
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
        ctx.fillText(overlay.text, overlay.x, overlay.y);

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
      setError('Please upload an image and add at least one translation');
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

        // Draw overlays
        overlays.forEach((overlay) => {
          ctx.font = `${overlay.fontSize}px Arial`;
          ctx.fillStyle = overlay.color;
          ctx.fillText(overlay.text, overlay.x, overlay.y);
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
      <div className="bg-orange-500 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-16">
          <div className="flex items-center gap-2 text-white/90 text-sm mb-6">
            <Link href="/" className="hover:text-white transition">Home</Link>
            <ChevronRight size={16} />
            <Link href="/all-tools" className="hover:text-white transition">Tools</Link>
            <ChevronRight size={16} />
            <span>Translate Image</span>
          </div>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">Translate Image</h1>
              <p className="text-white/90 text-lg">
                Add translated text overlays to your images
              </p>
            </div>
            <div className="bg-white/20 rounded-2xl p-4 shadow-lg hidden md:block">
              <Globe size={40} className="text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Section - Upload */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Upload Image</h2>
              <ImageUploader onFileSelect={handleFileSelect} preview={preview} onClearPreview={handleClearPreview} accept="image/*" />
              {file && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    📁 {file.name}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Center Section - Preview */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Preview</h2>
              <div className="flex items-center justify-center bg-gray-100 rounded-lg overflow-auto max-h-96 cursor-pointer" onClick={handleCanvasClick}>
                {preview ? (
                  <canvas ref={previewCanvasRef} className="max-w-full" />
                ) : (
                  <div className="text-gray-400 text-center p-8">
                    <p className="text-sm">Upload an image to preview</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Section - Controls Sidebar */}
          <div className="lg:col-span-1 lg:sticky lg:top-6 lg:h-fit">
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm max-h-96 overflow-y-auto">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Add Translation</h2>

              {/* Language Selection */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Source Language</label>
                <select
                  value={sourceLanguage}
                  onChange={(e) => setSourceLanguage(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2 text-sm"
                >
                  {languages.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Target Language</label>
                <select
                  value={targetLanguage}
                  onChange={(e) => setTargetLanguage(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2 text-sm"
                >
                  {languages.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Translation Text Input */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Translated Text</label>
                <textarea
                  value={newTranslationText}
                  onChange={(e) => setNewTranslationText(e.target.value)}
                  placeholder="Enter translated text..."
                  className="w-full border border-gray-300 rounded-lg p-2 text-sm h-16 resize-none"
                />
              </div>

              {/* Font Size */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Font Size: {fontSize}px</label>
                <input
                  type="range"
                  min="12"
                  max="72"
                  value={fontSize}
                  onChange={(e) => setFontSize(parseInt(e.target.value))}
                  className="w-full accent-orange-500"
                />
              </div>

              {/* Text Color */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Text Color</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
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

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              {/* Add Text Button */}
              <button
                onClick={addTranslationOverlay}
                disabled={!preview}
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-2 px-4 rounded-lg transition mb-3 flex items-center justify-center gap-2 text-sm"
              >
                <Plus size={16} />
                Add Translation
              </button>

              {/* Overlays List */}
              {overlays.length > 0 && (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200 max-h-32 overflow-y-auto">
                  <p className="text-sm font-medium text-gray-700 mb-2">Translations ({overlays.length})</p>
                  <div className="space-y-1">
                    {overlays.map((overlay) => (
                      <div
                        key={overlay.id}
                        className={`flex items-center justify-between p-2 rounded text-xs cursor-pointer ${
                          selectedOverlayId === overlay.id
                            ? 'bg-orange-100 border border-orange-300'
                            : 'bg-white border border-gray-200'
                        }`}
                        onClick={() => setSelectedOverlayId(overlay.id)}
                      >
                        <span className="truncate">{overlay.text}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeOverlay(overlay.id);
                          }}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Generate Button */}
              <button
                onClick={generateImage}
                disabled={!file || overlays.length === 0 || processing}
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-3 px-4 rounded-lg transition mb-3 flex items-center justify-center gap-2"
              >
                <Globe size={18} className={processing ? 'animate-spin' : ''} />
                {processing ? 'Generating...' : 'Generate Image'}
              </button>

              {/* Download Button */}
              {result && (
                <button
                  onClick={handleDownload}
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-3 px-4 rounded-lg transition flex items-center justify-center gap-2"
                >
                  <Download size={18} />
                  Download PNG
                </button>
              )}
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mt-6">
              <h3 className="font-bold text-blue-900 mb-2">💡 About This Tool</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Add translated text overlays</li>
                <li>• Support 12+ languages</li>
                <li>• Customize font size & color</li>
                <li>• Click preview to select text</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Hidden Canvas */}
      <canvas ref={canvasRef} className="hidden" />
      <Footer />
    </div>
  );
}







