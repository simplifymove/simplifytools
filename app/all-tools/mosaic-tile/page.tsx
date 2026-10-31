'use client';
import { FAQAnswer, FAQDisclosure, FAQHeading, FAQList, FAQPanel, FAQQuestion } from '@/app/components/FAQDesign';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Download, ChevronRight, Loader, Grid } from 'lucide-react';
import { HomeHeader } from '../../components/HomeHeader';
import { Footer } from '../../components/Footer';
import { useRouter } from 'next/navigation';
import { uploadBrowserDownloadResult } from '@/app/lib/download-result-client';

export default function MosaicTilePage() {
    const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [tileSize, setTileSize] = useState(10);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<Blob | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const uploadGeneration = useRef(0);
  const processingRef = useRef(false);

  useEffect(() => {
    if (!result) {
      setResultUrl(null);
      return;
    }

    const url = URL.createObjectURL(result);
    setResultUrl(url);

    return () => URL.revokeObjectURL(url);
  }, [result]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (processingRef.current) return;

    const selectedFile = e.target.files?.[0];
    const generation = ++uploadGeneration.current;

    setFile(null);
    setPreview(null);
    setResult(null);
    setError(null);

    if (!selectedFile) return;

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(selectedFile.type)) {
      setError('Please select a JPG, PNG, or WebP image.');
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      if (generation !== uploadGeneration.current) return;

      if (typeof reader.result !== 'string') {
        setError('Unable to read the selected image.');
        return;
      }

      const dataUrl = reader.result;
      const img = new Image();

      img.onload = () => {
        if (generation !== uploadGeneration.current) return;

        if (!img.naturalWidth || !img.naturalHeight) {
          setError('The image has invalid dimensions.');
          return;
        }

        setFile(selectedFile);
        setPreview(dataUrl);
      };

      img.onerror = () => {
        if (generation === uploadGeneration.current) {
          setError('Unable to decode the selected image.');
        }
      };

      img.src = dataUrl;
    };

    reader.onerror = () => {
      if (generation === uploadGeneration.current) {
        setError('Unable to read the selected image.');
      }
    };

    reader.readAsDataURL(selectedFile);
  };

  const handleTileSizeChange = (value: number) => {
    if (processingRef.current) return;

    setTileSize(Math.max(2, Math.min(50, value)));
    setResult(null);
    setError(null);
  };

  const applyMosaicTile = async () => {
    if (!file || !preview || processingRef.current) return;

    const generation = uploadGeneration.current;
    const selectedTileSize = tileSize;

    processingRef.current = true;
    setProcessing(true);
    setResult(null);
    setError(null);

    try {
      const img = new Image();

      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('Unable to decode the image.'));
        img.src = preview;
      });

      if (generation !== uploadGeneration.current) return;

      const canvas = canvasRef.current;
      if (!canvas) throw new Error('Image canvas is unavailable.');

      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;

      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas processing is unavailable.');

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(
        0, 0, canvas.width, canvas.height
      );
      const data = imageData.data;

      for (let y = 0; y < canvas.height; y += selectedTileSize) {
        for (let x = 0; x < canvas.width; x += selectedTileSize) {
          let r = 0;
          let g = 0;
          let b = 0;
          let count = 0;

          for (
            let ty = 0;
            ty < selectedTileSize && y + ty < canvas.height;
            ty++
          ) {
            for (
              let tx = 0;
              tx < selectedTileSize && x + tx < canvas.width;
              tx++
            ) {
              const idx = ((y + ty) * canvas.width + x + tx) * 4;
              r += data[idx];
              g += data[idx + 1];
              b += data[idx + 2];
              count++;
            }
          }

          r = Math.floor(r / count);
          g = Math.floor(g / count);
          b = Math.floor(b / count);

          for (
            let ty = 0;
            ty < selectedTileSize && y + ty < canvas.height;
            ty++
          ) {
            for (
              let tx = 0;
              tx < selectedTileSize && x + tx < canvas.width;
              tx++
            ) {
              const idx = ((y + ty) * canvas.width + x + tx) * 4;
              data[idx] = r;
              data[idx + 1] = g;
              data[idx + 2] = b;
              data[idx + 3] = 255;
            }
          }
        }
      }

      ctx.putImageData(imageData, 0, 0);

      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          value => value
            ? resolve(value)
            : reject(new Error('Unable to create the JPEG image.')),
          'image/jpeg',
          0.95
        );
      });

      if (generation === uploadGeneration.current) {
        setResult(blob);
      }
    } catch (caughtError) {
      if (generation === uploadGeneration.current) {
        setError(
          caughtError instanceof Error
            ? caughtError.message
            : 'Unable to create the mosaic image.'
        );
      }
    } finally {
      processingRef.current = false;
      setProcessing(false);
    }
  };

  const handleDownload = async () => {
      if (!result || processingRef.current) return;

      processingRef.current = true;
      setProcessing(true);

      try {
        const downloadResult =
          await uploadBrowserDownloadResult({
            blob: result,
            toolSlug: 'mosaic-tile',
            originalName: `mosaic-tile-${Date.now()}.jpg`,
            outputName: `mosaic-tile-${Date.now()}.jpg`,
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
        processingRef.current = false;
        setProcessing(false);
      }
    };

  return (
    <>
      <HomeHeader />
      <main className="min-h-screen bg-slate-50 flex flex-col">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-purple-500 via-indigo-500 to-purple-600 py-16 px-4 md:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-2 text-white/80 text-sm mb-6">
              <Link href="/" className="hover:text-white transition">Home</Link>
              <ChevronRight size={16} />
              <Link href="/all-tools" className="hover:text-white transition">All Tools</Link>
              <ChevronRight size={16} />
              <span>Mosaic Tile</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">🎨 Mosaic Tile</h1>
            <p className="text-lg text-white/90 max-w-2xl">
              Create mosaic and tile pattern effects. Generate beautiful mosaic artwork from photos.
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 py-12 px-4 md:px-8">
          <div className="max-w-4xl mx-auto">
            {/* Upload Section */}
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Create Mosaic Tile Effect</h2>

              <div className="mb-6">
                <label className="block text-gray-700 font-semibold mb-3">Upload Image</label>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  disabled={processing}
                  onChange={handleFileSelect}
                  className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-purple-400 transition"
                />
              </div>

              {preview && (
                <>
                  <div className="mb-6">
                    <label className="block text-gray-700 font-semibold mb-3">
                      Tile Size: {tileSize}px
                    </label>
                    <input
                      type="range"
                      min="2"
                      max="50"
                      disabled={processing}
                      value={tileSize}
                      onChange={(e) => handleTileSizeChange(Number(e.target.value))}
                      className="w-full"
                    />
                    <p className="text-sm text-gray-600 mt-2">2 = fine detail, 50 = large tiles</p>
                  </div>

                  <button
                    onClick={applyMosaicTile}
                    disabled={processing}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg transition flex items-center justify-center gap-2"
                  >
                    {processing ? <Loader className="animate-spin" size={20} /> : <Grid size={20} />}
                    {processing ? 'Processing...' : 'Create Mosaic Tile'}
                  </button>
                </>
              )}

              {result && resultUrl && (
                <div className="mt-6 space-y-4">
                  <h3 className="font-semibold text-gray-800">
                    Mosaic Result Preview
                  </h3>
                  <img
                    src={resultUrl}
                    alt="Mosaic tile effect result"
                    className="mx-auto max-w-full max-h-80 object-contain rounded-lg border border-gray-200"
                  />
                  <button
                    onClick={handleDownload}
                    disabled={processing}
                    className="w-full bg-green-500 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg transition flex items-center justify-center gap-2"
                  >
                    <Download size={20} />
                    Download Mosaic Image
                  </button>
                </div>
              )}

              {error && (
                <p role="alert" className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  {error}
                </p>
              )}
            </div>

            {/* How To Section */}
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">How to Create Mosaic Tile</h2>
              <ol className="space-y-4 text-gray-700">
                <li><strong>1. Upload Photo:</strong> Select a JPG, PNG, or WebP image.</li>
                <li><strong>2. Set Tile Size:</strong> Choose mosaic tile size (2-50px).</li>
                <li><strong>3. Create Mosaic:</strong> Click "Create Mosaic Tile".</li>
                <li><strong>4. Download:</strong> Save your mosaic artwork.</li>
              </ol>
            </div>

            {/* Benefits Section */}
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Mosaic Tile Benefits</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-bold text-lg text-purple-600 mb-2">Artistic Effects</h3>
                  <p className="text-gray-700">Create beautiful mosaic artwork.</p>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-purple-600 mb-2">Adjustable</h3>
                  <p className="text-gray-700">Control tile size for desired look.</p>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-purple-600 mb-2">Privacy Tool</h3>
                  <p className="text-gray-700">Apply a block-color mosaic effect to the entire image. This is not a selective privacy-redaction tool.</p>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-purple-600 mb-2">100% Free</h3>
                  <p className="text-gray-700">No registration or payment needed.</p>
                </div>
              </div>
            </div>

            {/* FAQ Section */}
            <FAQPanel>
              <FAQHeading>Frequently Asked Questions</FAQHeading>
              <FAQList>
                <FAQDisclosure>
                  <FAQQuestion>What tile size should I use?</FAQQuestion>
                  <FAQAnswer>2-5px for detail. 10-20px for abstract. 30-50px for strong effect.</FAQAnswer>
                </FAQDisclosure>
                <FAQDisclosure>
                  <FAQQuestion>Works on all images?</FAQQuestion>
                  <FAQAnswer>JPG, PNG, and WebP images are supported. Color-rich images can produce more visible mosaic variation.</FAQAnswer>
                </FAQDisclosure>
                <FAQDisclosure>
                  <FAQQuestion>Can I use commercially?</FAQQuestion>
                  <FAQAnswer>Commercial use depends on your rights to the original image. Applying a mosaic effect does not change its copyright or license.</FAQAnswer>
                </FAQDisclosure>
                <FAQDisclosure>
                  <FAQQuestion>Output quality?</FAQQuestion>
                  <FAQAnswer>The processed result is exported as a JPEG with the mosaic effect.</FAQAnswer>
                </FAQDisclosure>
                <FAQDisclosure>
                  <FAQQuestion>Is data private?</FAQQuestion>
                  <FAQAnswer>The visual effect is processed in your browser. When you choose Download, the processed JPEG is sent through the download-result service so the download page can be prepared.</FAQAnswer>
                </FAQDisclosure>
                <FAQDisclosure>
                  <FAQQuestion>Smooth blending?</FAQQuestion>
                  <FAQAnswer>Each tile uses the average color of its pixels, creating distinct blocks rather than a smooth blur.</FAQAnswer>
                </FAQDisclosure>
              </FAQList>
            </FAQPanel>

            {/* Related Tools */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Related Effect Tools</h2>
              <div className="grid md:grid-cols-3 gap-4">
                <Link href="/all-tools/pixelate-image" className="p-4 border-2 border-purple-200 rounded-lg hover:bg-purple-50 transition">
                  <h3 className="font-bold text-gray-800">Pixelate Image</h3>
                  <p className="text-sm text-gray-600">Pixel blocks</p>
                </Link>
                <Link href="/all-tools/posterize-image" className="p-4 border-2 border-purple-200 rounded-lg hover:bg-purple-50 transition">
                  <h3 className="font-bold text-gray-800">Posterize Image</h3>
                  <p className="text-sm text-gray-600">Limited colors</p>
                </Link>
                <Link href="/all-tools/blur-image" className="p-4 border-2 border-purple-200 rounded-lg hover:bg-purple-50 transition">
                  <h3 className="font-bold text-gray-800">Blur Image</h3>
                  <p className="text-sm text-gray-600">Blur effects</p>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Batch supporting content: mosaic-tile */}
        <section className="bg-white border-t border-gray-200 px-4 md:px-8 py-14">
          <div className="max-w-6xl mx-auto space-y-10">

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                How mosaic tiles are generated
              </h2>
              <p className="text-gray-600 leading-7">
                The Mosaic Tile tool divides the image into blocks and calculates representative color values for each tile. Smaller tile sizes retain more recognizable image detail, while larger tiles create a stronger block-based mosaic appearance. The resulting image is exported as JPEG.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="border border-gray-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Browser-based image processing
                </h3>
                <p className="text-gray-600 leading-7">
                  The visual transformation is performed with browser canvas
                  processing. The uploaded image is drawn to a canvas and the
                  selected effect is applied before the result is prepared for
                  download.
                </p>
              </div>

              <div className="border border-gray-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  JPEG output
                </h3>
                <p className="text-gray-600 leading-7">
                  The processed canvas is encoded as a JPEG for download.
                  JPEG does not preserve transparency. Transparent areas use a white background, and its compression
                  characteristics can differ from those of the original
                  uploaded image.
                </p>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Choosing an image for this effect
              </h2>
              <p className="text-gray-600 leading-7">
                JPG, PNG, and WebP images are supported by the upload control.
                The appearance of the effect depends on the colors, contrast,
                details, and composition of the source image. Try different
                settings when available to find a result that suits the image.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                What happens to image dimensions?
              </h2>
              <p className="text-gray-600 leading-7">
                The processing canvas uses the loaded image width and height.
                The effect changes the visual pixel content rather than acting
                as an image resizing tool.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Tips for better effect results
              </h2>
              <ul className="text-gray-600 leading-7 list-disc pl-6 space-y-2">
                <li>Start with a clear source image at a useful resolution.</li>
                <li>Start with smaller tiles to retain detail, then increase tile size for a stronger block effect.</li>
                <li>Review the processed mosaic preview before downloading.</li>
                <li>Remember that the final downloaded file is JPEG output.</li>
              </ul>
            </div>

          </div>
        </section>

      </main>
      <Footer />

      <canvas ref={canvasRef} style={{ display: 'none' }} />

      <script type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'WebApplication',
          name: 'Mosaic Tile',
          description: 'Free online mosaic and tile pattern effect creator',
          url: 'https://simplifyconvert.com/all-tools/mosaic-tile',
          applicationCategory: 'MultimediaApplication',
          offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD',
          },
        })}
      </script>
    </>
  );
}
