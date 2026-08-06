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
                  <li>• Works with common browser-supported image formats</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <section className="bg-white border-t border-gray-200 px-4 md:px-8 py-14">
          <div className="max-w-6xl mx-auto space-y-10">

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                How to split an image into a grid
              </h2>
              <p className="text-gray-600 leading-7">
                Upload an image, choose the number of rows and columns, and
                check the preview grid before splitting. Click Split Image to
                divide the source into individual tiles. You can create grids
                from 1 to 6 rows and 1 to 6 columns, for a maximum of 36
                segments.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="border border-gray-200 rounded-xl p-6">
                <h3 className="font-bold text-gray-900 mb-2">
                  Rows and columns explained
                </h3>
                <p className="text-sm text-gray-600 leading-6">
                  Rows divide the image horizontally, while columns divide it
                  vertically. For example, a 2 × 3 grid produces six segments,
                  while a 3 × 3 grid produces nine. The total number of tiles
                  is the selected row count multiplied by the column count.
                </p>
              </div>

              <div className="border border-gray-200 rounded-xl p-6">
                <h3 className="font-bold text-gray-900 mb-2">
                  Preview the grid before splitting
                </h3>
                <p className="text-sm text-gray-600 leading-6">
                  The preview canvas draws the selected grid over the uploaded
                  image so you can see approximately where each cut will occur.
                  Changing the row or column setting automatically redraws the
                  preview.
                </p>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Browser-based image splitting
              </h2>
              <p className="text-gray-600 leading-7">
                The actual splitting step runs in your browser using the HTML
                canvas. Each region of the source image is drawn onto a
                separate canvas and encoded as a PNG segment. The source image
                does not need to be sent to a dedicated image-splitting API for
                the grid operation itself.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="border border-gray-200 rounded-xl p-6">
                <h3 className="font-bold text-gray-900 mb-2">
                  PNG output for every segment
                </h3>
                <p className="text-sm text-gray-600 leading-6">
                  Generated segments are encoded as PNG regardless of the
                  uploaded image format. This gives every tile a consistent
                  output format and allows compatible transparency from the
                  decoded source image to be represented in the PNG result.
                </p>
              </div>

              <div className="border border-gray-200 rounded-xl p-6">
                <h3 className="font-bold text-gray-900 mb-2">
                  Download segments individually
                </h3>
                <p className="text-sm text-gray-600 leading-6">
                  After splitting, each tile appears separately with its row
                  and column position. Choose Download on the segment you want.
                  That PNG is then prepared through the SimplifyConvert
                  download-result flow so you can save the selected tile.
                </p>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                How segment dimensions are determined
              </h2>
              <p className="text-gray-600 leading-7">
                The splitter divides the source width by the selected number of
                columns and the source height by the selected number of rows.
                Images whose dimensions divide evenly by the chosen grid are
                the simplest case. When dimensions are not evenly divisible,
                canvas pixel rounding can affect the exact boundaries of the
                generated tiles.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Common image grid examples
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  ['1 × 2', 'Split an image into two side-by-side tiles'],
                  ['2 × 1', 'Split an image into a top and bottom section'],
                  ['2 × 2', 'Create four image tiles'],
                  ['3 × 3', 'Create a nine-tile image grid'],
                ].map(([title, text]) => (
                  <div
                    key={title}
                    className="border border-gray-200 rounded-xl p-5"
                  >
                    <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
                    <p className="text-sm text-gray-600 leading-6">{text}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                When an image splitter is useful
              </h2>
              <p className="text-gray-600 leading-7 mb-4">
                Grid splitting is useful whenever one image needs to be divided
                into separate rectangular files while keeping their positions
                relative to the original image.
              </p>
              <ul className="grid md:grid-cols-2 gap-3 text-sm text-gray-600">
                {[
                  'Preparing image tiles for grid-based layouts',
                  'Separating a composite graphic into individual panels',
                  'Creating smaller sections from a large reference image',
                  'Dividing artwork into rows and columns for separate use',
                  'Extracting individual pieces from a contact-sheet style image',
                  'Creating multiple PNG files from one source image',
                ].map((item) => (
                  <li
                    key={item}
                    className="border border-gray-200 rounded-lg px-4 py-3"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Tips for cleaner image tiles
              </h2>
              <ul className="space-y-3 text-gray-600">
                {[
                  'Choose a grid that matches the composition of the source image.',
                  'Use the preview lines to check whether important subjects cross a tile boundary.',
                  'For predictable tile dimensions, source dimensions that divide evenly by the chosen rows and columns are preferable.',
                  'Use fewer rows or columns when you need larger individual segments.',
                  'Remember that every generated segment is downloaded as PNG.',
                ].map((item) => (
                  <li
                    key={item}
                    className="border border-gray-200 rounded-lg px-4 py-3"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Image Splitter FAQ
              </h2>

              <div className="space-y-4">
                {[
                  [
                    'How many pieces can I split an image into?',
                    'The controls support 1 to 6 rows and 1 to 6 columns, allowing up to 36 generated segments.',
                  ],
                  [
                    'What format are the split images?',
                    'Each generated segment is encoded and downloaded as a PNG file.',
                  ],
                  [
                    'Does the splitting happen on the server?',
                    'The grid splitting itself happens in the browser with HTML canvas. A selected PNG segment is sent through the download-result service when you choose to download it.',
                  ],
                  [
                    'Can I split an image only vertically?',
                    'Yes. Set Rows to 1 and choose two or more Columns to create vertical sections.',
                  ],
                  [
                    'Can I split an image only horizontally?',
                    'Yes. Set Columns to 1 and increase Rows to create horizontal sections.',
                  ],
                  [
                    'Why might tile dimensions differ from an exact fraction?',
                    'If the source width or height is not evenly divisible by the selected grid, canvas pixel rounding can affect exact segment boundaries.',
                  ],
                  [
                    'Can I download every segment separately?',
                    'Yes. Each generated tile has its own Download button.',
                  ],
                  [
                    'Which image formats can I upload?',
                    'The uploader accepts image files, but successful decoding depends on the image formats supported by your browser.',
                  ],
                ].map(([question, answer]) => (
                  <div
                    key={question}
                    className="border border-gray-200 rounded-xl p-5"
                  >
                    <h3 className="font-bold text-gray-900 mb-2">
                      {question}
                    </h3>
                    <p className="text-sm text-gray-600 leading-6">
                      {answer}
                    </p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </section>

      </main>
      <Footer />

      {/* Hidden Canvas */}
      <canvas ref={canvasRef} className="hidden" />
    </>
  );
}






