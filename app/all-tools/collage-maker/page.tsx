'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { HomeHeader } from '../../components/HomeHeader';
import { Download, ChevronRight, Combine, X, Plus } from 'lucide-react';
import { Footer } from '../../components/Footer';
import { useRouter } from 'next/navigation';
import { uploadBrowserDownloadResult } from '@/app/lib/download-result-client';

type CollageLayout = '2x2' | '3x3' | '1x4' | '4x1';

interface CollageImage {
  id: string;
  blob: Blob;
  preview: string;
}

export default function CollageMakerPage() {
    const router = useRouter();
  const [images, setImages] = useState<CollageImage[]>([]);
  const [layout, setLayout] = useState<CollageLayout>('2x2');
  const [spacing, setSpacing] = useState(10);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<Blob | null>(null);
  const [error, setError] = useState<string>('');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (!files) return;

    const maxImages = layout === '2x2' ? 4 : layout === '3x3' ? 9 : 4;
    const remainingSlots = maxImages - images.length;

    for (let i = 0; i < Math.min(files.length, remainingSlots); i++) {
      const file = files[i];
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          const newImage: CollageImage = {
            id: String(Date.now() + i),
            blob: file,
            preview: reader.result as string,
          };
          setImages((prev) => [...prev, newImage]);
        };
        reader.readAsDataURL(file);
      }
    }

    setError('');
  };

  const removeImage = (id: string | number) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
  };

  const getGridDimensions = (collageLayout: CollageLayout) => {
    switch (collageLayout) {
      case '2x2':
        return { cols: 2, rows: 2 };
      case '3x3':
        return { cols: 3, rows: 3 };
      case '1x4':
        return { cols: 4, rows: 1 };
      case '4x1':
        return { cols: 1, rows: 4 };
    }
  };

  const createCollage = async () => {
    const maxImages = layout === '2x2' ? 4 : layout === '3x3' ? 9 : 4;
    if (images.length === 0) {
      setError('Please upload at least one image');
      return;
    }

    setProcessing(true);
    setError('');

    try {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const { cols, rows } = getGridDimensions(layout);
      const imageSize = 300;
      const totalWidth = cols * imageSize + (cols - 1) * spacing;
      const totalHeight = rows * imageSize + (rows - 1) * spacing;

      canvas.width = totalWidth;
      canvas.height = totalHeight;

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      let imageIndex = 0;
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          if (imageIndex >= images.length) break;

          const x = col * (imageSize + spacing);
          const y = row * (imageSize + spacing);

          const img = new Image();
          img.onload = () => {
            // Fill with background color first
            ctx.fillStyle = '#f3f4f6';
            ctx.fillRect(x, y, imageSize, imageSize);

            // Calculate dimensions to fit image in square
            const imgWidth = img.width;
            const imgHeight = img.height;
            const scale = Math.min(imageSize / imgWidth, imageSize / imgHeight);
            const scaledWidth = imgWidth * scale;
            const scaledHeight = imgHeight * scale;
            const offsetX = (imageSize - scaledWidth) / 2;
            const offsetY = (imageSize - scaledHeight) / 2;

            ctx.drawImage(
              img,
              x + offsetX,
              y + offsetY,
              scaledWidth,
              scaledHeight,
            );
          };
          img.src = images[imageIndex].preview;
          imageIndex++;
        }
      }

      // Wait for images to load
      setTimeout(() => {
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
      }, 500);
    } catch (err) {
      setError('Error creating collage: ' + (err instanceof Error ? err.message : 'Unknown error'));
      setProcessing(false);
    }
  };

  const handleDownload = async () => {
      if (!result || processing) return;

      setError("");
      setProcessing(true);

      try {
        const downloadResult =
          await uploadBrowserDownloadResult({
            blob: result,
            toolSlug: 'collage-maker',
            originalName: `collage-${Date.now()}.png`,
            outputName: `collage-${Date.now()}.png`,
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

  const maxImagesForLayout = layout === '2x2' ? 4 : layout === '3x3' ? 9 : 4;

  return (
    <div className="min-h-screen bg-gray-50">
      <HomeHeader />

      {/* Hero Header */}
      <div className="bg-orange-500 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-16">
          <div className="flex items-center gap-2 text-white/90 text-sm mb-6">
            <Link href="/" className="hover:text-white transition">Home</Link>
            <ChevronRight size={16} />
            <Link href="/all-tools" className="hover:text-white transition">All Tools</Link>
            <ChevronRight size={16} />
            <span>Collage Maker</span>
          </div>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">Collage Maker</h1>
              <p className="text-white/90 text-lg">
                Create beautiful image collages in seconds
              </p>
            </div>
            <div className="bg-white/20 rounded-2xl p-4 shadow-lg hidden md:block">
              <Combine size={40} className="text-white" />
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
              <h2 className="text-xl font-bold text-gray-900 mb-4">Upload Images</h2>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-orange-400 transition cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <Plus size={32} className="text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Click to upload images</p>
                <p className="text-xs text-gray-500 mt-1">Max {maxImagesForLayout} images</p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />

              {/* Image List */}
              {images.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-sm font-medium text-gray-700">
                    {images.length} / {maxImagesForLayout} images
                  </p>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {images.map((img, idx) => (
                      <div key={img.id} className="flex items-center justify-between bg-gray-50 p-2 rounded border border-gray-200">
                        <span className="text-sm text-gray-700">{idx + 1}</span>
                        <img src={img.preview} alt={`Upload ${idx}`} className="w-10 h-10 rounded object-cover" />
                        <button
                          onClick={() => removeImage(img.id)}
                          className="text-red-500 hover:text-red-700 transition"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
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
                    alt="Collage preview"
                    className="max-h-64 max-w-full object-contain"
                  />
                ) : images.length > 0 ? (
                  <div className="text-gray-500 text-center">
                    <p className="text-sm">Click "Create Collage" to generate preview</p>
                  </div>
                ) : (
                  <div className="text-gray-400 text-center">
                    <p className="text-sm">Upload images to see preview</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Section - Controls Sidebar */}
          <div className="lg:col-span-1 lg:sticky lg:top-6 lg:h-fit">
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Collage Settings</h2>

              {/* Layout Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">Layout</label>
                <div className="space-y-2">
                  {(['2x2', '3x3', '1x4', '4x1'] as const).map((l) => (
                    <label key={l} className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-orange-50 transition" onClick={() => setLayout(l)}>
                      <input
                        type="radio"
                        name="layout"
                        value={l}
                        checked={layout === l}
                        onChange={(e) => setLayout(e.target.value as CollageLayout)}
                        className="w-4 h-4 accent-orange-500 cursor-pointer"
                      />
                      <span className="ml-3 font-medium text-gray-700">{l} Grid</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Spacing Control */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Spacing: {spacing}px</label>
                <input
                  type="range"
                  min="0"
                  max="30"
                  value={spacing}
                  onChange={(e) => setSpacing(parseInt(e.target.value))}
                  className="w-full accent-orange-500"
                />
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              {/* Create Button */}
              <button
                onClick={createCollage}
                disabled={images.length === 0 || processing}
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-3 px-4 rounded-lg transition mb-3 flex items-center justify-center gap-2"
              >
                <Combine size={18} className={processing ? 'animate-spin' : ''} />
                {processing ? 'Creating...' : 'Create Collage'}
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
                <li>• Multiple layout options</li>
                <li>• Adjustable spacing</li>
                <li>• Auto-scale images</li>
                <li>• High-quality output</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Hidden Canvas */}
      <canvas ref={canvasRef} className="hidden" />

      <section className="bg-white border-t border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-16 space-y-12">

          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              How to make a photo collage online
            </h2>

            <div className="grid md:grid-cols-4 gap-4">
              {[
                ['1', 'Choose images', 'Upload the photos or images you want to include in the collage.'],
                ['2', 'Select a layout', 'Choose a 2x2, 3x3, 1x4, or 4x1 grid based on how many images you want to arrange.'],
                ['3', 'Adjust spacing', 'Increase or reduce the gap between images to match the look you want.'],
                ['4', 'Create and download', 'Generate the collage, review the preview, and download the finished PNG image.'],
              ].map(([number, title, text]) => (
                <div
                  key={number}
                  className="border border-gray-200 rounded-xl p-5"
                >
                  <div className="w-9 h-9 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center font-bold mb-3">
                    {number}
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
                  <p className="text-sm text-gray-600 leading-6">{text}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="border border-gray-200 rounded-xl p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-3">
                Choosing the right collage layout
              </h2>

              <div className="space-y-3 text-gray-600 leading-7">
                <p>
                  <strong className="text-gray-900">2x2:</strong>{' '}
                  Arrange up to four images in a balanced square grid.
                </p>
                <p>
                  <strong className="text-gray-900">3x3:</strong>{' '}
                  Combine up to nine images when you need a denser photo grid.
                </p>
                <p>
                  <strong className="text-gray-900">1x4:</strong>{' '}
                  Place up to four images in a single horizontal row.
                </p>
                <p>
                  <strong className="text-gray-900">4x1:</strong>{' '}
                  Place up to four images in a single vertical column.
                </p>
              </div>
            </div>

            <div className="border border-gray-200 rounded-xl p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-3">
                How images fit inside the collage
              </h2>

              <p className="text-gray-600 leading-7">
                Each image is automatically scaled to fit inside its collage
                cell while preserving the image&apos;s proportions. This helps
                avoid unnecessary stretching or distortion when images have
                different shapes or dimensions.
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              What does the spacing control do?
            </h2>

            <p className="text-gray-600 leading-7">
              The spacing control changes the gap between neighboring collage
              cells. Use a small value for a compact grid or increase the
              spacing when you want more separation between photos. The collage
              preview is regenerated using your current layout and spacing
              settings.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-5">
              Common uses for photo collages
            </h2>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                {
                  title: 'Photo collections',
                  text: 'Combine several related photos into one easy-to-share image.',
                },
                {
                  title: 'Social posts',
                  text: 'Create a single visual containing multiple moments or products.',
                },
                {
                  title: 'Before and after',
                  text: 'Place comparison images together in a consistent layout.',
                },
                {
                  title: 'Project summaries',
                  text: 'Group screenshots, references, or progress images into one graphic.',
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="bg-slate-50 border border-slate-200 rounded-xl p-5"
                >
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-600 leading-6">
                    {item.text}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-5">
              Tips for better collages
            </h2>

            <div className="grid md:grid-cols-2 gap-4">
              {[
                'Choose images with similar visual themes when you want a more consistent result.',
                'Use a layout that matches the number of images you actually need.',
                'Reduce spacing for a tighter photo grid and increase it for more visual separation.',
                'Review image order before generating the final collage.',
                'Use higher-resolution source images when the collage will be viewed at a larger size.',
                'Check the preview before downloading the PNG output.',
              ].map((tip) => (
                <div
                  key={tip}
                  className="flex gap-3 border border-gray-200 rounded-lg p-4"
                >
                  <span className="text-orange-600 font-bold">✓</span>
                  <p className="text-gray-600">{tip}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-5">
              Collage Maker FAQ
            </h2>

            <div className="space-y-4">
              {[
                {
                  q: 'How many images can I add?',
                  a: 'The maximum depends on the selected layout. The 2x2, 1x4, and 4x1 layouts support up to four images, while the 3x3 layout supports up to nine.',
                },
                {
                  q: 'Which layouts are available?',
                  a: 'You can choose from 2x2, 3x3, 1x4, and 4x1 collage layouts.',
                },
                {
                  q: 'Can I change the gap between images?',
                  a: 'Yes. Use the spacing slider to adjust the distance between collage cells before generating the output.',
                },
                {
                  q: 'Will my images be stretched?',
                  a: 'The tool scales each image while preserving its aspect ratio so it can fit within the assigned collage cell.',
                },
                {
                  q: 'What format is the collage downloaded in?',
                  a: 'The generated collage is exported as a PNG image.',
                },
              ].map((item) => (
                <div
                  key={item.q}
                  className="border-b border-gray-200 pb-4"
                >
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {item.q}
                  </h3>
                  <p className="text-gray-600 leading-7">{item.a}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-5">
              Related image tools
            </h2>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link
                href="/all-tools/combine-images"
                className="border border-gray-200 rounded-xl p-5 hover:border-orange-400 transition"
              >
                <h3 className="font-semibold text-gray-900 mb-2">
                  Combine Images
                </h3>
                <p className="text-sm text-gray-600">
                  Join multiple images into a combined result.
                </p>
              </Link>

              <Link
                href="/all-tools/resize-image"
                className="border border-gray-200 rounded-xl p-5 hover:border-orange-400 transition"
              >
                <h3 className="font-semibold text-gray-900 mb-2">
                  Resize Image
                </h3>
                <p className="text-sm text-gray-600">
                  Change image dimensions before using them in a collage.
                </p>
              </Link>

              <Link
                href="/all-tools/crop-image"
                className="border border-gray-200 rounded-xl p-5 hover:border-orange-400 transition"
              >
                <h3 className="font-semibold text-gray-900 mb-2">
                  Crop Image
                </h3>
                <p className="text-sm text-gray-600">
                  Trim unwanted areas from an image.
                </p>
              </Link>

              <Link
                href="/all-tools/compress-image"
                className="border border-gray-200 rounded-xl p-5 hover:border-orange-400 transition"
              >
                <h3 className="font-semibold text-gray-900 mb-2">
                  Compress Image
                </h3>
                <p className="text-sm text-gray-600">
                  Reduce image size for easier sharing.
                </p>
              </Link>
            </div>
          </div>

        </div>
      </section>

</main>

      <Footer />
    </div>
  );
}







