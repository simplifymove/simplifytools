'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Download, ChevronRight, Grid, X } from 'lucide-react';
import { ImageUploader } from '../../components/ImageUploader';
import { HomeHeader } from '../../components/HomeHeader';
import { Footer } from '../../components/Footer';
import { uploadBrowserDownloadResult } from '@/app/lib/download-result-client';

interface SplitSegment {
  id: string;
  row: number;
  col: number;
  blob: Blob;
  preview: string;
}

export default function ImageSplitterPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [rows, setRows] = useState(2);
  const [cols, setCols] = useState(2);
  const [processing, setProcessing] = useState(false);
  const [segments, setSegments] = useState<SplitSegment[]>([]);
  const [error, setError] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    setError(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleClearPreview = () => {
    setFile(null);
    setPreview(null);
    setSegments([]);
    setError(null);
  };

  const drawPreview = () => {
    if (!preview) return;

    const canvas = previewCanvasRef.current;
    if (!canvas) return;

    const img = new Image();
    img.onload = () => {
      const maxWidth = 400;
      const scale = Math.min(1, maxWidth / img.width);
      
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // Draw grid lines
      const segmentWidth = canvas.width / cols;
      const segmentHeight = canvas.height / rows;

      ctx.strokeStyle = '#ff6b6b';
      ctx.lineWidth = 2;

      // Vertical lines
      for (let i = 1; i < cols; i++) {
        ctx.beginPath();
        ctx.moveTo(segmentWidth * i, 0);
        ctx.lineTo(segmentWidth * i, canvas.height);
        ctx.stroke();
      }

      // Horizontal lines
      for (let i = 1; i < rows; i++) {
        ctx.beginPath();
        ctx.moveTo(0, segmentHeight * i);
        ctx.lineTo(canvas.width, segmentHeight * i);
        ctx.stroke();
      }
    };
    img.src = preview;
  };

  const splitImage = async () => {
    if (!file || !preview) {
      setError('Please upload an image first');
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      const img = new Image();
      img.onload = () => {
        const segmentWidth = img.width / cols;
        const segmentHeight = img.height / rows;
        const newSegments: SplitSegment[] = [];
        let processedCount = 0;

        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            const canvas = document.createElement('canvas');
            canvas.width = segmentWidth;
            canvas.height = segmentHeight;

            const ctx = canvas.getContext('2d');
            if (!ctx) continue;

            ctx.drawImage(
              img,
              c * segmentWidth,
              r * segmentHeight,
              segmentWidth,
              segmentHeight,
              0,
              0,
              segmentWidth,
              segmentHeight
            );

            canvas.toBlob(
              (blob) => {
                if (blob) {
                  const reader = new FileReader();
                  reader.onload = (e) => {
                    newSegments.push({
                      id: `${r}-${c}`,
                      row: r,
                      col: c,
                      blob: blob,
                      preview: e.target?.result as string,
                    });

                    processedCount++;
                    if (processedCount === rows * cols) {
                      setSegments(newSegments.sort((a, b) => {
                        if (a.row !== b.row) return a.row - b.row;
                        return a.col - b.col;
                      }));
                      setProcessing(false);
                    }
                  };
                  reader.readAsDataURL(blob);
                }
              },
              'image/png',
              0.95
            );
          }
        }
      };
      img.onerror = () => {
        setError('Failed to load image');
        setProcessing(false);
      };
      img.src = preview;
    } catch (err) {
      setError((err as Error).message || 'Error splitting image');
      setProcessing(false);
    }
  };

  const downloadSegment = async (segment: SplitSegment) => {
    if (!file) return;

    setError(null);

    try {
      const outputName = `segment-${segment.row}-${segment.col}.png`;
      const downloadResult = await uploadBrowserDownloadResult({
        blob: segment.blob,
        toolSlug: 'image-splitter',
        originalName: file.name,
        outputName,
      });

      router.push(downloadResult.downloadPageUrl);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Unable to prepare the download.',
      );
    }
  };

  // Update preview when rows/cols change
  React.useEffect(() => {
    drawPreview();
  }, [rows, cols, preview]);

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
              <Link href="/all-tools" className="hover:text-white transition">All Tools</Link>
              <ChevronRight size={16} />
              <span>Image Splitter</span>
            </div>

            {/* Title Section */}
            <div className="flex items-start gap-4">
              <div className="p-3 bg-white/20 rounded-lg">
                <Grid size={32} className="text-white" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">Image Splitter</h1>
                <p className="text-lg text-white/90">Split images into multiple segments or tiles.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 py-12 px-4 md:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Upload Section */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Upload Image</h2>
                <ImageUploader
                  onFileSelect={handleFileSelect}
                  preview={preview}
                  onClearPreview={handleClearPreview}
                  accept="image/*"
                />
                {file && (
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
                    <p className="text-sm text-blue-800">📁 {file.name}</p>
                  </div>
                )}
              </div>

              {/* Preview Section */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Preview Grid</h2>
                <div className="min-h-64 bg-gray-100 rounded flex items-center justify-center overflow-auto">
                  {preview ? (
                    <canvas ref={previewCanvasRef} />
                  ) : (
                    <div className="text-gray-400 text-center">
                      <p className="text-sm">Upload an image to preview</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Controls Section */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Split Settings</h2>

                {/* Rows Control */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rows: {rows}
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="6"
                    value={rows}
                    onChange={(e) => setRows(parseInt(e.target.value))}
                    className="w-full accent-orange-500"
                  />
                </div>

                {/* Columns Control */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Columns: {cols}
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="6"
                    value={cols}
                    onChange={(e) => setCols(parseInt(e.target.value))}
                    className="w-full accent-orange-500"
                  />
                </div>

                <div className="mb-6 p-3 bg-gray-100 rounded text-sm text-gray-700">
                  Total segments: <span className="font-bold">{rows} × {cols} = {rows * cols}</span>
                </div>

                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                )}

                {/* Split Button */}
                <button
                  onClick={splitImage}
                  disabled={!file || processing}
                  className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-lg transition flex items-center justify-center gap-2"
                >
                  <Grid size={18} className={processing ? 'animate-spin' : ''} />
                  {processing ? 'Splitting...' : 'Split Image'}
                </button>
              </div>
            </div>

            {/* Segments Grid */}
            {segments.length > 0 && (
              <div className="mt-8 bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Split Segments ({segments.length})</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {segments.map((segment) => (
                    <div key={segment.id} className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition">
                      <img src={segment.preview} alt={`Segment ${segment.row}-${segment.col}`} className="w-full aspect-square object-cover" />
                      <div className="p-2 text-center border-t border-gray-200">
                        <p className="text-xs text-gray-600 mb-2">({segment.row},{segment.col})</p>
                        <button
                          onClick={() => downloadSegment(segment)}
                          className="w-full bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium py-1 px-2 rounded flex items-center justify-center gap-1"
                        >
                          <Download size={12} />
                          Download
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Info Section */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="font-bold text-blue-900 mb-3">💡 How to Use</h3>
                <ol className="text-sm text-blue-800 space-y-2 list-decimal list-inside">
                  <li>Upload your image</li>
                  <li>Set the number of rows and columns</li>
                  <li>Preview the split grid</li>
                  <li>Click "Split Image" to generate segments</li>
                  <li>Download individual segments as needed</li>
                </ol>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                <h3 className="font-bold text-purple-900 mb-3">🎨 Tips</h3>
                <ul className="text-sm text-purple-800 space-y-2">
                  <li>• Preview shows where segments will be cut</li>
                  <li>• Up to 6×6 (36 segments) supported</li>
                  <li>• Each segment downloads as PNG</li>
                  <li>• Works with all image formats</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />

      {/* Hidden Canvas */}
      <canvas ref={canvasRef} className="hidden" />
    </>
  );
}






