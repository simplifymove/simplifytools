'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { Download, ChevronRight, Image as ImageIcon, X, Plus } from 'lucide-react';
import { HomeHeader } from '../../components/HomeHeader';
import { Footer } from '../../components/Footer';
import { useRouter } from 'next/navigation';
import { uploadBrowserDownloadResult } from '@/app/lib/download-result-client';

interface CanvasImage {
  id: string;
  blob: Blob;
  preview: string;
  x: number;
  y: number;
}

export default function AddImagesPage() {
  const router = useRouter();
  const [images, setImages] = useState<CanvasImage[]>([]);
  const [canvasWidth, setCanvasWidth] = useState(1600);
  const [canvasHeight, setCanvasHeight] = useState(1200);
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (!files || files.length === 0) return;

    const validFiles: File[] = [];

    // First, filter to get only image files
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type.startsWith('image/')) {
        if (validFiles.length < 10 - images.length) {
          validFiles.push(file);
        }
      }
    }

    if (validFiles.length === 0) {
      setError('No valid image files selected');
      e.currentTarget.value = '';
      return;
    }

    const newImages: CanvasImage[] = [];
    let filesProcessed = 0;

    validFiles.forEach((file, index) => {
      const reader = new FileReader();
      reader.onerror = () => {
        setError(`Failed to read file: ${file.name}`);
        filesProcessed++;
        if (filesProcessed === validFiles.length && newImages.length > 0) {
          setImages((prev) => [...prev, ...newImages]);
        }
      };
      reader.onload = () => {
        try {
          // Auto-layout: arrange images in a grid to avoid overlap
          // Industry standard: 320px images + 40px spacing
          const imageSize = 360;
          const gapSize = 40;
          const imagesPerRow = Math.max(1, Math.floor(canvasWidth / (imageSize + gapSize)));
          const totalIndex = images.length + newImages.length;
          const row = Math.floor(totalIndex / imagesPerRow);
          const col = totalIndex % imagesPerRow;

          const newImage: CanvasImage = {
            id: String(Date.now() + index + Math.random()),
            blob: file,
            preview: reader.result as string,
            x: 40 + col * (imageSize + gapSize),
            y: 40 + row * (imageSize + gapSize),
          };
          newImages.push(newImage);
        } catch (err) {
          console.error('Error creating image object:', err);
        }

        filesProcessed++;

        // Add all images once all files are processed
        if (filesProcessed === validFiles.length) {
          if (newImages.length > 0) {
            setImages((prev) => [...prev, ...newImages]);
          } else {
            setError('Failed to process images');
          }
        }
      };
      reader.readAsDataURL(file);
    });

    // Reset file input
    e.currentTarget.value = '';
    setError(null);
  };

  const removeImage = (id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
    if (selectedImageId === id) {
      setSelectedImageId(null);
    }
  };

  const updateImagePosition = (id: string, x: number, y: number) => {
    setImages((prev) =>
      prev.map((img) => (img.id === id ? { ...img, x, y } : img))
    );
  };

  const drawPreview = () => {
    const canvas = previewCanvasRef.current;
    if (!canvas || images.length === 0) return;

    // Scale preview to fit container
    const maxWidth = 400;
    const scale = Math.min(1, maxWidth / canvasWidth);

    canvas.width = canvasWidth * scale;
    canvas.height = canvasHeight * scale;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw background
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw images with proper async handling
    let imagesDrawn = 0;

    images.forEach((img, idx) => {
      const imgElement = new Image();
      imgElement.crossOrigin = 'anonymous';
      imgElement.onerror = () => {
        imagesDrawn++;
      };
      imgElement.onload = () => {
        try {
          const size = 320 * scale;
          const x = img.x * scale;
          const y = img.y * scale;

          // Draw image
          ctx.drawImage(imgElement, x, y, size, size);

          // Draw selection box if selected
          if (img.id === selectedImageId) {
            ctx.strokeStyle = '#ff6b6b';
            ctx.lineWidth = 3;
            ctx.strokeRect(x, y, size, size);
          }

          // Draw image number
          ctx.fillStyle = '#000000';
          ctx.font = `bold ${12 * scale}px Arial`;
          ctx.fillText(String(idx + 1), x + 5, y + 20);
        } catch (err) {
          console.error('Error drawing image:', err);
        }
        imagesDrawn++;
      };
      imgElement.src = img.preview;
    });
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const canvas = previewCanvasRef.current;
    if (!canvas) return;

    const scale = Math.min(1, 400 / canvasWidth);
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / scale;
    const y = (e.clientY - rect.top) / scale;

    const size = 320;

    // Find if clicked on any image
    for (let i = images.length - 1; i >= 0; i--) {
      const img = images[i];
      if (x >= img.x && x <= img.x + size && y >= img.y && y <= img.y + size) {
        setSelectedImageId(img.id);
        return;
      }
    }
    setSelectedImageId(null);
  };

  const generateImage = async () => {
    if (images.length === 0) {
      setError('Please add at least one image');
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d', { alpha: false, willReadFrequently: false });
      if (!ctx) return;

      // Use a larger internal canvas for final rendering
      const dpi = 300;
      const scale = dpi / 96; // Standard screen DPI is 96

      canvas.width = canvasWidth * scale;
      canvas.height = canvasHeight * scale;

      // Set canvas style size for proper display
      canvas.style.width = canvasWidth + 'px';
      canvas.style.height = canvasHeight + 'px';

      // High-quality rendering settings
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // Scale context without affecting text
      ctx.scale(scale, scale);

      // Draw background
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);

      // Load all images using promises
      const imagePromises = images.map((img) => {
        return new Promise<void>((resolve, reject) => {
          const imgElement = new Image();
          imgElement.crossOrigin = 'anonymous';
          imgElement.onerror = reject;
          imgElement.onload = () => {
            try {
              // Industry standard: larger images for better visibility (300-350px)
              const maxSize = 320;
              const imgAspectRatio = imgElement.width / imgElement.height;
              let drawWidth = maxSize;
              let drawHeight = maxSize / imgAspectRatio;

              if (drawHeight > maxSize) {
                drawHeight = maxSize;
                drawWidth = maxSize * imgAspectRatio;
              }

              // Center image within the space with padding
              const paddingX = (maxSize - drawWidth) / 2;
              const paddingY = (maxSize - drawHeight) / 2;

              // Add border for better presentation
              ctx.strokeStyle = '#e5e7eb';
              ctx.lineWidth = 2;
              ctx.strokeRect(img.x, img.y, maxSize, maxSize);

              // Draw image with high quality
              ctx.drawImage(
                imgElement,
                img.x + paddingX,
                img.y + paddingY,
                drawWidth,
                drawHeight
              );
              resolve();
            } catch (err) {
              reject(err);
            }
          };
          imgElement.src = img.preview;
        });
      });

      // Wait for all images to load and draw
      await Promise.all(imagePromises);

      // Encode the generated canvas as PNG
      canvas.toBlob(
        (blob) => {
          if (blob) {
            setResult(blob);
          }
          setProcessing(false);
        },
        'image/png'
      );
    } catch (err) {
      setError((err as Error).message || 'Error generating image');
      setProcessing(false);
    }
  };

  const handleDownload = async () => {
    if (!result || processing) return;

    setError(null);
    setProcessing(true);

    try {
      const downloadResult =
        await uploadBrowserDownloadResult({
          blob: result,
          toolSlug: 'add-images',
          originalName: 'combined-images.png',
          outputName: 'combined-images.png',
        });

      router.push(downloadResult.downloadPageUrl);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Unable to prepare the download.',
      );
    } finally {
      setProcessing(false);
    }
  };

  // Update preview when images or settings change
  React.useEffect(() => {
    drawPreview();
  }, [images, selectedImageId, canvasWidth, canvasHeight, backgroundColor]);

  return (
    <>
      <HomeHeader />
      <main className="min-h-screen bg-linear-to-b from-slate-50 to-slate-100 flex flex-col">
        {/* Hero Header */}
        <div className="relative bg-orange-500 py-16 px-4 md:px-8 overflow-hidden">
          <div className="max-w-6xl mx-auto relative z-10">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-white/90 text-sm mb-6">
              <Link href="/" className="hover:text-white transition">Home</Link>
              <ChevronRight size={16} />
              <Link href="/all-tools" className="hover:text-white transition">All Tools</Link>
              <ChevronRight size={16} />
              <span>Add Images</span>
            </div>

            {/* Title Section */}
            <div className="flex items-start gap-4">
              <div className="p-3 bg-white/20 rounded-lg">
                <ImageIcon size={32} className="text-white" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">Add Images</h1>
                <p className="text-lg text-white/90">Combine multiple images on a single canvas.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 py-12 px-4 md:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Upload & List Section */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Upload Images</h2>

                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                )}

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-orange-400 transition cursor-pointer mb-4"
                >
                  <Plus size={32} className="text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Click to upload images</p>
                  <p className="text-xs text-gray-500 mt-1">Max 10 images</p>
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />

                {/* Images List */}
                {images.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      {images.length} / 10 images
                    </p>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {images.map((img, idx) => (
                        <div
                          key={img.id}
                          className={`flex items-center justify-between p-2 rounded border cursor-pointer ${selectedImageId === img.id
                              ? 'bg-orange-100 border-orange-300'
                              : 'bg-gray-50 border-gray-200'
                            }`}
                          onClick={() => setSelectedImageId(img.id)}
                        >
                          <div className="flex items-center gap-2 flex-1">
                            <span className="text-xs font-medium text-gray-600">{idx + 1}</span>
                            <img src={img.preview} alt={`Img ${idx}`} className="w-6 h-6 rounded object-cover" />
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeImage(img.id);
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
              </div>

              {/* Preview Section */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Preview</h2>
                <div className="flex items-center justify-center bg-gray-100 rounded cursor-pointer min-h-64" onClick={handleCanvasClick}>
                  {images.length > 0 ? (
                    <canvas ref={previewCanvasRef} className="max-w-full h-auto" />
                  ) : (
                    <div className="text-gray-400 text-center p-8">
                      <p className="text-sm">Add images to preview</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Settings Section */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Canvas Settings</h2>

                {/* Canvas Width */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Width: {canvasWidth}px
                  </label>
                  <input
                    type="range"
                    min="1200"
                    max="4000"
                    step="100"
                    value={canvasWidth}
                    onChange={(e) => setCanvasWidth(parseInt(e.target.value))}
                    className="w-full accent-orange-500"
                  />
                </div>

                {/* Canvas Height */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Height: {canvasHeight}px
                  </label>
                  <input
                    type="range"
                    min="900"
                    max="3000"
                    step="100"
                    value={canvasHeight}
                    onChange={(e) => setCanvasHeight(parseInt(e.target.value))}
                    className="w-full accent-orange-500"
                  />
                </div>

                {/* Background Color */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Background Color</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={backgroundColor}
                      onChange={(e) => setBackgroundColor(e.target.value)}
                      className="w-12 h-10 rounded cursor-pointer border border-gray-300"
                    />
                    <input
                      type="text"
                      value={backgroundColor}
                      readOnly
                      className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm font-mono"
                    />
                  </div>
                </div>

                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                )}

                {/* Action Buttons */}
                <button
                  onClick={generateImage}
                  disabled={images.length === 0 || processing}
                  className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-lg transition mb-3 flex items-center justify-center gap-2"
                >
                  <ImageIcon size={18} className={processing ? 'animate-spin' : ''} />
                  {processing ? 'Processing...' : 'Generate'}
                </button>

                {result && (
                  <button
                    onClick={handleDownload}
                    className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-lg transition flex items-center justify-center gap-2"
                  >
                    <Download size={18} />
                    Download PNG
                  </button>
                )}
              </div>
            </div>

            {/* Info Section */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="font-bold text-blue-900 mb-3">💡 How to Use</h3>
                <ol className="text-sm text-blue-800 space-y-2 list-decimal list-inside">
                  <li>Upload up to 10 images</li>
                  <li>Configure canvas size and background</li>
                  <li>Click preview to select and position images</li>
                  <li>Click "Generate" to create canvas</li>
                  <li>Download the result as PNG</li>
                </ol>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                <h3 className="font-bold text-purple-900 mb-3">🎨 Composition Details</h3>
                <ul className="text-sm text-purple-800 space-y-2">
                  <li>• Each image: 320×320px (maintains aspect ratio)</li>
                  <li>• Canvas is internally scaled during final rendering</li>
                  <li>• Initial placement uses 40px spacing</li>
                  <li>• New images receive automatic starting positions</li>
                  <li>• Placement areas include a visible border</li>
                  <li>• Default canvas: 1600×1200px (16:12 aspect)</li>
                  <li>• Maximum 10 images per collage</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <section className="bg-white border-t border-gray-200 px-4 md:px-8 py-14">
          <div className="max-w-6xl mx-auto space-y-10">

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                How to combine multiple images
              </h2>
              <p className="text-gray-600 leading-7">
                Add up to 10 images, choose the canvas width, height, and
                background color, and arrange the images in the preview.
                Generate the composition when the layout is ready, then
                download the finished result as PNG.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="border border-gray-200 rounded-xl p-6">
                <h3 className="font-semibold text-gray-900 mb-2">
                  Automatic starting positions
                </h3>
                <p className="text-gray-600 leading-7">
                  Newly added images receive initial grid-style positions
                  based on the current canvas width. These provide a starting
                  layout for the composition.
                </p>
              </div>

              <div className="border border-gray-200 rounded-xl p-6">
                <h3 className="font-semibold text-gray-900 mb-2">
                  Canvas and background controls
                </h3>
                <p className="text-gray-600 leading-7">
                  Choose the output canvas dimensions and background color
                  before generating the final image.
                </p>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Image sizing and aspect ratio
              </h2>
              <p className="text-gray-600 leading-7">
                During final generation each source image is fitted inside a
                320 × 320 pixel placement area while preserving its aspect
                ratio and centering it within that area.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                PNG composition output
              </h2>
              <p className="text-gray-600 leading-7">
                The final composition is rendered with the browser Canvas API
                and encoded as PNG. Internal canvas scaling affects rendering
                dimensions but does not recreate detail missing from a
                low-resolution source image.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Tips for arranging images
              </h2>
              <ul className="text-gray-600 leading-7 space-y-2">
                <li>• Choose canvas dimensions that leave enough room for all images.</li>
                <li>• Review automatic starting positions before generating.</li>
                <li>• Select a background color that works with the source images.</li>
                <li>• Check the preview before exporting the composition.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Add Images FAQ
              </h2>

              <div className="space-y-4">
                <div className="border border-gray-200 rounded-xl p-5">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    How many images can I add?
                  </h3>
                  <p className="text-gray-600 leading-7">
                    The current interface supports up to 10 images.
                  </p>
                </div>

                <div className="border border-gray-200 rounded-xl p-5">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Are images stretched into squares?
                  </h3>
                  <p className="text-gray-600 leading-7">
                    No. Images are fitted inside their placement areas while
                    preserving the source aspect ratio.
                  </p>
                </div>

                <div className="border border-gray-200 rounded-xl p-5">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    What output format is generated?
                  </h3>
                  <p className="text-gray-600 leading-7">
                    The completed composition is generated as PNG.
                  </p>
                </div>
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







