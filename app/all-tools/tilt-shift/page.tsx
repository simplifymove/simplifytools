'use client';
import { FAQAnswer, FAQCard, FAQDisclosure, FAQHeading, FAQList, FAQPanel, FAQQuestion, FAQStaticQuestion } from '@/app/components/FAQDesign';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Download, ChevronRight, Loader, Eye } from 'lucide-react';
import { HomeHeader } from '../../components/HomeHeader';
import { Footer } from '../../components/Footer';
import { useRouter } from 'next/navigation';
import { uploadBrowserDownloadResult } from '@/app/lib/download-result-client';

export default function TiltShiftPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [focusArea, setFocusArea] = useState(50);
  const [blurAmount, setBlurAmount] = useState(10);
  const [processing, setProcessing] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [result, setResult] = useState<Blob | null>(null);
  const [resultPreview, setResultPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const generationRef = useRef(0);
  const previewUrlRef = useRef<string | null>(null);
  const resultUrlRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      generationRef.current += 1;
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
      if (resultUrlRef.current) URL.revokeObjectURL(resultUrlRef.current);
    };
  }, []);

  const clearResult = () => {
    generationRef.current += 1;
    setResult(null);
    setResultPreview(null);
    setProcessing(false);

    if (resultUrlRef.current) {
      URL.revokeObjectURL(resultUrlRef.current);
      resultUrlRef.current = null;
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    clearResult();
    setError(null);

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(selectedFile.type)) {
      setFile(null);
      setPreview(null);
      setError('Please select a JPG, PNG, or WebP image.');
      e.target.value = '';
      return;
    }

    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);

    const url = URL.createObjectURL(selectedFile);
    previewUrlRef.current = url;
    setFile(selectedFile);
    setPreview(url);
  };

  const handleFocusChange = (value: number) => {
    clearResult();
    setFocusArea(value);
    setError(null);
  };

  const handleBlurChange = (value: number) => {
    clearResult();
    setBlurAmount(value);
    setError(null);
  };

  const applyTiltShift = async () => {
    if (!file || !preview || processing || downloading) return;

    clearResult();
    const generation = generationRef.current;
    const source = preview;
    setProcessing(true);
    setError(null);

    try {
      const img = new Image();
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('Unable to decode the image.'));
        img.src = source;
      });

      if (generation !== generationRef.current) return;

      const canvas = canvasRef.current;
      if (!canvas) throw new Error('Image canvas is unavailable.');

      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;

      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Unable to initialize image processing.');

      ctx.drawImage(img, 0, 0);

      const width = canvas.width;
      const height = canvas.height;
      const original = ctx.getImageData(0, 0, width, height);
      const output = ctx.createImageData(width, height);

      const radius = Math.max(1, Math.round(blurAmount));
      const focusY = (focusArea / 100) * height;
      const sharpBand = height * 0.15;
      const transition = Math.max(1, height * 0.2);

      // Two-pass box blur: horizontal followed by vertical.
      const intermediate = new Uint8ClampedArray(original.data.length);
      const src = original.data;

      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const sums = [0, 0, 0, 0];
          let count = 0;

          for (let dx = -radius; dx <= radius; dx++) {
            const sx = Math.max(0, Math.min(width - 1, x + dx));
            const index = (y * width + sx) * 4;
            for (let c = 0; c < 4; c++) sums[c] += src[index + c];
            count++;
          }

          const index = (y * width + x) * 4;
          for (let c = 0; c < 4; c++) {
            intermediate[index + c] = sums[c] / count;
          }
        }
      }

      for (let y = 0; y < height; y++) {
        const distance = Math.abs(y - focusY);
        const blend = Math.max(
          0,
          Math.min(1, (distance - sharpBand) / transition),
        );

        for (let x = 0; x < width; x++) {
          const sums = [0, 0, 0, 0];
          let count = 0;

          for (let dy = -radius; dy <= radius; dy++) {
            const sy = Math.max(0, Math.min(height - 1, y + dy));
            const index = (sy * width + x) * 4;
            for (let c = 0; c < 4; c++) sums[c] += intermediate[index + c];
            count++;
          }

          const index = (y * width + x) * 4;
          for (let c = 0; c < 4; c++) {
            const blurred = sums[c] / count;
            output.data[index + c] =
              src[index + c] * (1 - blend) + blurred * blend;
          }
        }
      }

      if (generation !== generationRef.current) return;

      ctx.putImageData(output, 0, 0);

      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (value) =>
            value
              ? resolve(value)
              : reject(new Error('Unable to create the output image.')),
          'image/jpeg',
          0.95,
        );
      });

      if (generation !== generationRef.current) return;

      const url = URL.createObjectURL(blob);
      resultUrlRef.current = url;
      setResult(blob);
      setResultPreview(url);
    } catch (caughtError) {
      if (generation !== generationRef.current) return;

      setError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Unable to apply the tilt-shift effect.',
      );
    } finally {
      if (generation === generationRef.current) setProcessing(false);
    }
  };

  const handleDownload = async () => {
    if (!result || processing || downloading) return;

    setDownloading(true);
    setError(null);

    try {
      const filename = `tilt-shift-${Date.now()}.jpg`;
      const downloadResult = await uploadBrowserDownloadResult({
        blob: result,
        toolSlug: 'tilt-shift',
        originalName: filename,
        outputName: filename,
      });

      router.push(downloadResult.downloadPageUrl);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Unable to prepare the download.',
      );
    } finally {
      setDownloading(false);
    }
  };
  return (
    <>
      <HomeHeader />
      <main className="min-h-screen bg-slate-50 flex flex-col">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-green-500 via-emerald-500 to-green-600 py-16 px-4 md:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-2 text-white/80 text-sm mb-6">
              <Link href="/" className="hover:text-white transition">Home</Link>
              <ChevronRight size={16} />
              <Link href="/all-tools" className="hover:text-white transition">All Tools</Link>
              <ChevronRight size={16} />
              <span>Tilt Shift Effect</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">🎯 Tilt Shift Effect</h1>
            <p className="text-lg text-white/90 max-w-2xl">
              Create miniature effect with selective focus. Transform photos into miniature-like images with depth-of-field blur.
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 py-12 px-4 md:px-8">
          <div className="max-w-4xl mx-auto">
            {/* Upload Section */}
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Create Tilt Shift Effect</h2>

              <div className="mb-6">
                <label className="block text-gray-700 font-semibold mb-3">Upload Image</label>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileSelect}
                  className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-green-400 transition"
                />
              </div>

              {preview && (
                <>
                  <div className="grid grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className="block text-gray-700 font-semibold mb-3">
                        Focus Area: {focusArea}%
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={focusArea}
                        onChange={(e) => handleFocusChange(Number(e.target.value))}
                        className="w-full"
                      />
                      <p className="text-xs text-gray-600 mt-1">Position of sharp focus band</p>
                    </div>
                    <div>
                      <label className="block text-gray-700 font-semibold mb-3">
                        Blur Amount: {blurAmount}
                      </label>
                      <input
                        type="range"
                        min="1"
                        max="20"
                        value={blurAmount}
                        onChange={(e) => handleBlurChange(Number(e.target.value))}
                        className="w-full"
                      />
                      <p className="text-xs text-gray-600 mt-1">Blur strength (1-20)</p>
                    </div>
                  </div>

                  <button
                    onClick={applyTiltShift}
                    disabled={processing || downloading}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition flex items-center justify-center gap-2"
                  >
                    {processing ? <Loader className="animate-spin" size={20} /> : <Eye size={20} />}
                    {processing ? 'Processing...' : 'Apply Tilt Shift'}
                  </button>
                </>
              )}

              {result && resultPreview && (
                <div className="mt-6 mb-4">
                  <h3 className="font-semibold text-gray-800 mb-3">
                    Tilt-shift result preview
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Original</p>
                      <img src={preview || ''} alt="Original uploaded image" className="w-full rounded-lg border object-contain" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Tilt-shift effect</p>
                      <img src={resultPreview} alt="Processed tilt-shift image" className="w-full rounded-lg border object-contain" />
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <p role="alert" className="mt-4 text-sm text-red-700">
                  {error}
                </p>
              )}

              {result && (
                <button
                  onClick={handleDownload} disabled={processing || downloading}
                  className="w-full mt-4 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition flex items-center justify-center gap-2"
                >
                  <Download size={20} />
                  {downloading ? "Preparing download..." : "Download Miniature Image"}
                </button>
              )}
            </div>

            {/* How To Section */}
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">How to Create Tilt Shift</h2>
              <ol className="space-y-4 text-gray-700">
                <li><strong>1. Upload Photo:</strong> Select a JPG, PNG, or WebP image.</li>
                <li><strong>2. Set Focus Area:</strong> Choose where to keep sharp (0-100%).</li>
                <li><strong>3. Adjust Blur:</strong> Control blur strength for effect.</li>
                <li><strong>4. Download:</strong> Save your miniature-style image.</li>
              </ol>
            </div>

            {/* Benefits Section */}
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Tilt Shift Benefits</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-bold text-lg text-green-600 mb-2">Miniature Effect</h3>
                  <p className="text-gray-700">Create realistic miniature-like appearance.</p>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-green-600 mb-2">Selective Focus</h3>
                  <p className="text-gray-700">Focus on specific area while blurring rest.</p>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-green-600 mb-2">Customizable</h3>
                  <p className="text-gray-700">Adjust focus position and blur amount.</p>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-green-600 mb-2">100% Free</h3>
                  <p className="text-gray-700">No registration or payment needed.</p>
                </div>
              </div>
            </div>

            {/* FAQ Section */}
            <FAQPanel>
              <FAQHeading>Frequently Asked Questions</FAQHeading>
              <FAQList>
                <FAQDisclosure>
                  <FAQQuestion>What focus area should I use?</FAQQuestion>
                  <FAQAnswer>Place focus on main subject. 50% focuses on middle.</FAQAnswer>
                </FAQDisclosure>
                <FAQDisclosure>
                  <FAQQuestion>How much blur should I apply?</FAQQuestion>
                  <FAQAnswer>Start at 10 for subtle. Higher for stronger miniature effect.</FAQAnswer>
                </FAQDisclosure>
                <FAQDisclosure>
                  <FAQQuestion>Works on all photos?</FAQQuestion>
                  <FAQAnswer>Yes, works best on landscape/cityscape photos.</FAQAnswer>
                </FAQDisclosure>
                <FAQDisclosure>
                  <FAQQuestion>Can I use commercially?</FAQQuestion>
                  <FAQAnswer>Yes, tilt-shift images can be used commercially.</FAQAnswer>
                </FAQDisclosure>
                <FAQDisclosure>
                  <FAQQuestion>Is data private?</FAQQuestion>
                  <FAQAnswer>Yes, all processing happens locally in browser.</FAQAnswer>
                </FAQDisclosure>
                <FAQDisclosure>
                  <FAQQuestion>Output quality?</FAQQuestion>
                  <FAQAnswer>High-quality JPEG with excellent effect.</FAQAnswer>
                </FAQDisclosure>
              </FAQList>
            </FAQPanel>

            {/* Related Tools */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Related Effect Tools</h2>
              <div className="grid md:grid-cols-3 gap-4">
                <Link href="/all-tools/blur-image" className="p-4 border-2 border-green-200 rounded-lg hover:bg-green-50 transition">
                  <h3 className="font-bold text-gray-800">Blur Image</h3>
                  <p className="text-sm text-gray-600">Gaussian blur effects</p>
                </Link>
                <Link href="/all-tools/motion-blur" className="p-4 border-2 border-green-200 rounded-lg hover:bg-green-50 transition">
                  <h3 className="font-bold text-gray-800">Motion Blur</h3>
                  <p className="text-sm text-gray-600">Dynamic motion blur</p>
                </Link>
                <Link href="/all-tools/vignette-effect" className="p-4 border-2 border-green-200 rounded-lg hover:bg-green-50 transition">
                  <h3 className="font-bold text-gray-800">Vignette Effect</h3>
                  <p className="text-sm text-gray-600">Edge darkening</p>
                </Link>
              </div>
            </div>
          </div>
        </div>

        <section className="bg-white border-t border-gray-200 px-4 md:px-8 py-14">
          <div className="max-w-6xl mx-auto space-y-8">

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                How the Tilt-Shift Effect works
              </h2>
              <p className="text-gray-600 leading-7">
The tilt-shift effect keeps a selected region comparatively
                sharper while applying stronger blur to surrounding portions
                of the image. This can create a stylized shallow-focus look.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="border border-gray-200 rounded-xl p-6">
                <h3 className="font-semibold text-gray-900 mb-2">
                  Browser-based processing
                </h3>
                <p className="text-sm text-gray-600 leading-6">
                  The visual adjustment is produced with browser image and
                  Canvas processing. The before-and-after preview lets you compare the result
                  before using the download action.
                </p>
              </div>

              <div className="border border-gray-200 rounded-xl p-6">
                <h3 className="font-semibold text-gray-900 mb-2">
                  What the adjustment changes
                </h3>
                <p className="text-sm text-gray-600 leading-6">
                  This is a simulated selective-blur effect; it does not recreate optical depth data or true camera tilt-shift behavior.
                </p>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Tips for better results
              </h2>
              <p className="text-gray-600 leading-7">
                Start with moderate settings and compare the preview with the
                original. Strong adjustments can intentionally reduce subtle
                detail or produce a more stylized appearance.
              </p>
            </div>

            <FAQPanel>
              <FAQHeading>
                Tilt-Shift Processing FAQ
              </FAQHeading>

              <FAQList>
                <FAQCard>
                  <FAQStaticQuestion>
                    Does this effect increase image resolution?
                  </FAQStaticQuestion>
                  <FAQAnswer>
                    No. It modifies the appearance of existing image pixels
                    and does not reconstruct missing source detail.
                  </FAQAnswer>
                </FAQCard>

                <FAQCard>
                  <FAQStaticQuestion>
                    Can I preview changes before downloading?
                  </FAQStaticQuestion>
                  <FAQAnswer>
                    Yes. Use the preview and available controls to review the
                    result before downloading it.
                  </FAQAnswer>
                </FAQCard>
              </FAQList>
            </FAQPanel>

          </div>
        </section>

</main>

      <Footer />

      <canvas ref={canvasRef} style={{ display: 'none' }} />

      <script type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'WebApplication',
          name: 'Tilt Shift Effect',
          description: 'Free online tilt shift effect and miniature image converter',
          url: 'https://simplifyconvert.com/all-tools/tilt-shift',
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
