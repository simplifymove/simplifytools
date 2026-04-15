'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { HomeHeader } from '../../../components/HomeHeader';
import { ImageUploader } from '../../../components/ImageUploader';
import { Download, ChevronRight, RefreshCw } from 'lucide-react';
import { Footer } from '../../../components/Footer';

export default function FlipImagePage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [flipHorizontal, setFlipHorizontal] = useState(false);
  const [flipVertical, setFlipVertical] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<Blob | null>(null);
  const [error, setError] = useState<string>('');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    setError('');
    setResult(null);

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
    setFlipHorizontal(false);
    setFlipVertical(false);
  };

  const flipImage = async () => {
    if (!file || !preview) {
      setError('Please upload an image first');
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

        // Save context state
        ctx.save();

        // Apply transformations
        let translateX = 0;
        let translateY = 0;
        let scaleX = 1;
        let scaleY = 1;

        if (flipHorizontal) {
          scaleX = -1;
          translateX = img.width;
        }

        if (flipVertical) {
          scaleY = -1;
          translateY = img.height;
        }

        ctx.translate(translateX, translateY);
        ctx.scale(scaleX, scaleY);
        ctx.drawImage(img, 0, 0);

        // Restore context state
        ctx.restore();

        // Convert to blob
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
      setError('Error flipping image: ' + (err instanceof Error ? err.message : 'Unknown error'));
      setProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!result) return;

    const url = URL.createObjectURL(result);
    const link = document.createElement('a');
    link.href = url;
    link.download = `flipped-image-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

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
            <span>Flip Image</span>
          </div>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">Flip Image</h1>
              <p className="text-white/90 text-lg">
                Flip your images horizontally or vertically
              </p>
            </div>
            <div className="bg-white/20 rounded-2xl p-4 shadow-lg hidden md:block">
              <RefreshCw size={40} className="text-white" />
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
              <div className="flex items-center justify-center bg-gray-100 rounded-lg overflow-hidden min-h-64">
                {result ? (
                  <img
                    src={URL.createObjectURL(result)}
                    alt="Flipped preview"
                    className="max-h-64 max-w-full object-contain"
                  />
                ) : preview ? (
                  <img
                    src={preview}
                    alt="Original preview"
                    className="max-h-64 max-w-full object-contain"
                  />
                ) : (
                  <div className="text-gray-400 text-center">
                    <p className="text-sm">Upload an image to preview</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Section - Controls Sidebar */}
          <div className="lg:col-span-1 lg:sticky lg:top-6 lg:h-fit">
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Flip Options</h2>

              {/* Flip Direction Toggles */}
              <div className="space-y-4 mb-6">
                <label className="flex items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-orange-300 transition" onClick={() => setFlipHorizontal(!flipHorizontal)}>
                  <input
                    type="checkbox"
                    checked={flipHorizontal}
                    onChange={(e) => setFlipHorizontal(e.target.checked)}
                    className="w-4 h-4 accent-orange-500 cursor-pointer"
                  />
                  <span className="ml-3 font-medium text-gray-700">Flip Horizontally</span>
                </label>

                <label className="flex items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-orange-300 transition" onClick={() => setFlipVertical(!flipVertical)}>
                  <input
                    type="checkbox"
                    checked={flipVertical}
                    onChange={(e) => setFlipVertical(e.target.checked)}
                    className="w-4 h-4 accent-orange-500 cursor-pointer"
                  />
                  <span className="ml-3 font-medium text-gray-700">Flip Vertically</span>
                </label>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              {/* Flip Button */}
              <button
                onClick={flipImage}
                disabled={!file || processing}
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-3 px-4 rounded-lg transition mb-3 flex items-center justify-center gap-2"
              >
                <RefreshCw size={18} className={processing ? 'animate-spin' : ''} />
                {processing ? 'Flipping...' : 'Flip Image'}
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
                <li>• Flip horizontally (mirror left-right)</li>
                <li>• Flip vertically (mirror up-down)</li>
                <li>• Combine both for 180° rotation</li>
                <li>• Supports all image formats</li>
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







