'use client';
import { FAQAnswer, FAQDisclosure, FAQHeading, FAQList, FAQPanel, FAQQuestion } from '@/app/components/FAQDesign';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { Download, ChevronRight, Loader, Wand2 } from 'lucide-react';
import { HomeHeader } from '../../components/HomeHeader';
import { Footer } from '../../components/Footer';
import { RelatedToolsSection } from '@/app/components/RelatedToolsSection';
import { useRouter } from 'next/navigation';
import { uploadBrowserDownloadResult } from '@/app/lib/download-result-client';

export default function OilPaintEffectPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [intensity, setIntensity] = useState(5);
  const [processing, setProcessing] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [result, setResult] = useState<Blob | null>(null);
  const [resultPreview, setResultPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const generationRef = useRef(0);
  const processingRef = useRef(false);

  React.useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }

    const url = URL.createObjectURL(file);
    setPreview(url);

    return () => URL.revokeObjectURL(url);
  }, [file]);

  React.useEffect(() => {
    if (!result) {
      setResultPreview(null);
      return;
    }

    const url = URL.createObjectURL(result);
    setResultPreview(url);

    return () => URL.revokeObjectURL(url);
  }, [result]);

  React.useEffect(() => {
    return () => {
      generationRef.current += 1;
    };
  }, []);

  const clearResult = () => {
    generationRef.current += 1;
    setResult(null);
    setError(null);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (processingRef.current || downloading) return;

    const selectedFile = e.target.files?.[0];
    e.target.value = '';

    if (!selectedFile) return;

    clearResult();

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(selectedFile.type)) {
      setFile(null);
      setError('Please choose a JPG, PNG, or WebP image.');
      return;
    }

    if (selectedFile.size > 20 * 1024 * 1024) {
      setFile(null);
      setError('Please choose an image smaller than 20 MB.');
      return;
    }

    setFile(selectedFile);
  };

  const applyOilPaintEffect = async () => {
    if (!file || !preview || processingRef.current || downloading) return;

    processingRef.current = true;
    setProcessing(true);
    setError(null);
    setResult(null);

    const generation = ++generationRef.current;

    try {
      const image = new Image();

      await new Promise<void>((resolve, reject) => {
        image.onload = () => resolve();
        image.onerror = () => reject(new Error('Unable to decode this image.'));
        image.src = preview;
      });

      if (generation !== generationRef.current) return;

      const naturalWidth = image.naturalWidth;
      const naturalHeight = image.naturalHeight;

      if (!naturalWidth || !naturalHeight) {
        throw new Error('Invalid image dimensions.');
      }

      const scale = Math.min(
        1,
        1200 / Math.max(naturalWidth, naturalHeight)
      );

      const width = Math.max(1, Math.round(naturalWidth * scale));
      const height = Math.max(1, Math.round(naturalHeight * scale));

      const canvas = canvasRef.current;

      if (!canvas) {
        throw new Error('Image editor is unavailable.');
      }

      canvas.width = width;
      canvas.height = height;

      const context = canvas.getContext('2d');

      if (!context) {
        throw new Error('Canvas rendering is unavailable.');
      }

      context.drawImage(image, 0, 0, width, height);

      const originalData = context.getImageData(0, 0, width, height);
      const sourcePixels = originalData.data;
      const output = context.createImageData(width, height);
      const destination = output.data;

      const radius = Math.max(1, Math.min(5, Math.ceil(intensity / 2)));
      const bins = 16;
      const windowSize = radius * 2 + 1;

      for (let y = 0; y < height; y++) {
        if (generation !== generationRef.current) return;

        for (let x = 0; x < width; x++) {
          const counts = new Uint16Array(bins);
          const red = new Uint32Array(bins);
          const green = new Uint32Array(bins);
          const blue = new Uint32Array(bins);

          for (let dy = -radius; dy <= radius; dy++) {
            const ny = Math.max(0, Math.min(height - 1, y + dy));

            for (let dx = -radius; dx <= radius; dx++) {
              const nx = Math.max(0, Math.min(width - 1, x + dx));
              const offset = (ny * width + nx) * 4;

              const r = sourcePixels[offset];
              const g = sourcePixels[offset + 1];
              const b = sourcePixels[offset + 2];

              const luminance = (r * 77 + g * 150 + b * 29) >> 8;
              const bin = Math.min(15, luminance >> 4);

              counts[bin]++;
              red[bin] += r;
              green[bin] += g;
              blue[bin] += b;
            }
          }

          let dominant = 0;

          for (let bin = 1; bin < bins; bin++) {
            if (counts[bin] > counts[dominant]) {
              dominant = bin;
            }
          }

          const index = (y * width + x) * 4;
          const count = Math.max(1, counts[dominant]);

          destination[index] = red[dominant] / count;
          destination[index + 1] = green[dominant] / count;
          destination[index + 2] = blue[dominant] / count;
          destination[index + 3] = 255;
        }

        if (y % 12 === 0) {
          await new Promise<void>((resolve) => {
            window.setTimeout(resolve, 0);
          });
        }
      }

      if (generation !== generationRef.current) return;

      context.putImageData(output, 0, 0);

      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (value) => {
            if (value) resolve(value);
            else reject(new Error('Unable to export the painting.'));
          },
          'image/jpeg',
          0.92
        );
      });

      if (generation !== generationRef.current) return;

      setResult(blob);
    } catch (caughtError) {
      if (generation === generationRef.current) {
        setError(
          caughtError instanceof Error
            ? caughtError.message
            : 'Unable to apply the oil paint effect.'
        );
      }
    } finally {
      processingRef.current = false;
      setProcessing(false);
    }
  };

  const handleDownload = async () => {
    if (!result || processingRef.current || downloading) return;

    setDownloading(true);
    setError(null);

    try {
      const filename = `oil-paint-${Date.now()}.jpg`;

      const downloadResult = await uploadBrowserDownloadResult({
        blob: result,
        toolSlug: 'oil-paint-effect',
        originalName: filename,
        outputName: filename,
      });

      router.push(downloadResult.downloadPageUrl);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Unable to prepare the download.'
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
        <div className="bg-gradient-to-r from-orange-500 via-red-500 to-orange-600 py-16 px-4 md:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-2 text-white/80 text-sm mb-6">
              <Link href="/" className="hover:text-white transition">Home</Link>
              <ChevronRight size={16} />
              <Link href="/all-tools" className="hover:text-white transition">All Tools</Link>
              <ChevronRight size={16} />
              <span>Oil Paint Effect</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">🎨 Oil Paint Effect</h1>
            <p className="text-lg text-white/90 max-w-2xl">
              Apply a painterly smoothing effect that blends nearby colors and reduces fine image detail.
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 py-12 px-4 md:px-8">
          <div className="max-w-4xl mx-auto">
            {/* Upload Section */}
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Apply Oil Paint Effect</h2>

              <div className="mb-6">
                <label className="block text-gray-700 font-semibold mb-3">Upload Image</label>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileSelect}
                  disabled={processing || downloading}
                  className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-orange-400 transition"
                />
              </div>

              {preview && (
                <>
                  <div className="mb-6">
                    <label className="block text-gray-700 font-semibold mb-3">
                      Intensity: {intensity}
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={intensity}
                      onChange={(e) => {
                        setIntensity(Number(e.target.value));
                        clearResult();
                      }}
                      disabled={processing || downloading}
                      className="w-full"
                    />
                    <p className="text-sm text-gray-600 mt-2">1 = subtle, 10 = strong oil painting effect</p>
                  </div>

                  <button
                    onClick={applyOilPaintEffect}
                    disabled={processing || downloading}
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-6 rounded-lg transition flex items-center justify-center gap-2"
                  >
                    {processing ? <Loader className="animate-spin" size={20} /> : <Wand2 size={20} />}
                    {processing ? 'Processing...' : 'Apply Oil Paint Effect'}
                  </button>
                </>
              )}

              {error && (
                <p role="alert" className="mt-4 text-sm text-red-700">
                  {error}
                </p>
              )}

              {preview && (
                <div className="mt-6">
                  <h3 className="font-semibold text-gray-800 mb-3">
                    Original Image
                  </h3>
                  <img
                    src={preview}
                    alt="Original uploaded image"
                    className="w-full max-h-80 object-contain rounded-lg border border-gray-200"
                  />
                </div>
              )}

              {resultPreview && (
                <div className="mt-6">
                  <h3 className="font-semibold text-gray-800 mb-3">
                    Oil Paint Result
                  </h3>
                  <img
                    src={resultPreview}
                    alt="Image after applying the oil paint effect"
                    className="w-full max-h-80 object-contain rounded-lg border border-gray-200"
                  />
                </div>
              )}

              {result && (
                <button
                  onClick={handleDownload}
                  disabled={processing || downloading}
                  className="w-full mt-4 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Download size={20} />
                  {downloading ? 'Preparing download...' : 'Download Painting'}
                </button>
              )}
            </div>

            {/* How To Section */}
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">How to Create Oil Paintings</h2>
              <ol className="space-y-4 text-gray-700">
                <li><strong>1. Upload Photo:</strong> Select a JPG, PNG, or WebP image.</li>
                <li><strong>2. Adjust Intensity:</strong> Control the oil painting effect strength.</li>
                <li><strong>3. Apply Effect:</strong> Click "Apply Oil Paint Effect".</li>
                <li><strong>4. Download:</strong> Save your oil painting artwork.</li>
              </ol>
            </div>

            {/* Benefits Section */}
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Oil Paint Effect Benefits</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-bold text-lg text-orange-600 mb-2">Artistic Transformation</h3>
                  <p className="text-gray-700">Convert photos into beautiful paintings.</p>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-orange-600 mb-2">Adjustable Painterly Effect</h3>
                  <p className="text-gray-700">Adjust the smoothing strength to change the painterly appearance.</p>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-orange-600 mb-2">Customizable</h3>
                  <p className="text-gray-700">Adjust intensity for desired effect.</p>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-orange-600 mb-2">No Account Required</h3>
                  <p className="text-gray-700">No registration or payment needed.</p>
                </div>
              </div>
            </div>

            {/* SEO Content */}
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">What This Oil Paint Effect Tool Does</h2>
              <p className="text-gray-700 leading-relaxed mb-6">
                The Oil Paint Effect tool turns photos into painterly artwork by smoothing details and blending nearby colors. It is useful for portraits, landscapes, pet photos, wall-art concepts, and creative images that need a hand-painted look.
              </p>

              <h3 className="text-xl font-bold text-gray-800 mb-3">Use Cases</h3>
              <ul className="grid md:grid-cols-2 gap-3 text-gray-700 mb-6">
                <li className="p-4 bg-orange-50 border border-orange-100 rounded-lg">Create art-style portraits from personal photos.</li>
                <li className="p-4 bg-orange-50 border border-orange-100 rounded-lg">Turn landscapes and travel photos into painting-like images.</li>
                <li className="p-4 bg-orange-50 border border-orange-100 rounded-lg">Generate creative visuals for posters, covers, and social posts.</li>
                <li className="p-4 bg-orange-50 border border-orange-100 rounded-lg">Test a painting look before sending an image to a designer or artist.</li>
              </ul>

              <h3 className="text-xl font-bold text-gray-800 mb-3">Example</h3>
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Input</h4>
                  <p className="text-gray-700 text-sm">A portrait, pet image, landscape, or product photo with visible texture and color.</p>
                </div>
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Output</h4>
                  <p className="text-gray-700 text-sm">A JPEG image with softened details and an oil-painting-inspired texture. Images larger than 1,200 pixels on their longest side are resized before processing.</p>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-5">
                <h3 className="font-bold text-blue-900 mb-2">Privacy Note</h3>
                <p className="text-blue-900 text-sm">Oil paint processing happens locally in your browser using canvas. Your image does not need to be uploaded for this effect.</p>
              </div>
            </div>

            {/* FAQ Section */}
            <FAQPanel>
              <FAQHeading>Frequently Asked Questions</FAQHeading>
              <FAQList>
                <FAQDisclosure>
                  <FAQQuestion>What intensity should I use?</FAQQuestion>
                  <FAQAnswer>Start at 5 for balanced effect. Lower for subtle, higher for strong painting style.</FAQAnswer>
                </FAQDisclosure>
                <FAQDisclosure>
                  <FAQQuestion>Does this work on all photos?</FAQQuestion>
                  <FAQAnswer>Yes, works on any photo. Results vary by image content and detail.</FAQAnswer>
                </FAQDisclosure>
                <FAQDisclosure>
                  <FAQQuestion>Can I use for commercial art?</FAQQuestion>
                  <FAQAnswer>Commercial-use rights depend on the rights and license attached to the source image and any other material used in your project.</FAQAnswer>
                </FAQDisclosure>
                <FAQDisclosure>
                  <FAQQuestion>What's the output quality?</FAQQuestion>
                  <FAQAnswer>The result is exported as JPEG at 92% quality. Images larger than 1,200 pixels on their longest side are resized, and transparent areas are not preserved as transparency in JPEG. The painting effect intentionally changes image details.</FAQAnswer>
                </FAQDisclosure>
                <FAQDisclosure>
                  <FAQQuestion>Is my image private?</FAQQuestion>
                  <FAQAnswer>The visual effect is processed locally in the browser. When you choose Download, the generated JPEG is sent through the download-result service so the download page can be prepared.</FAQAnswer>
                </FAQDisclosure>
                <FAQDisclosure>
                  <FAQQuestion>Can I edit further?</FAQQuestion>
                  <FAQAnswer>Yes, download and use image editors for additional modifications.</FAQAnswer>
                </FAQDisclosure>
              </FAQList>
            </FAQPanel>

            {/* Related Tools */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <RelatedToolsSection family="image" toolId="oil-paint-effect" limit={8} />
            </div>
          </div>
        </div>

        <Footer />
      </main>

      <canvas ref={canvasRef} style={{ display: 'none' }} />

      <script type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'SoftwareApplication',
          name: 'Oil Paint Effect',
          description: 'Free online oil paint effect and artistic painting converter',
          url: 'https://simplifyconvert.com/all-tools/oil-paint-effect',
          applicationCategory: 'MultimediaApplication',
          operatingSystem: 'Web',
          isAccessibleForFree: true,
          offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD',
          },
        })}
      </script>
      <script type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: [
            { '@type': 'Question', name: 'What intensity should I use?', acceptedAnswer: { '@type': 'Answer', text: 'Start at 5 for a balanced oil paint effect. Lower values are more subtle and higher values create stronger smoothing.' } },
            { '@type': 'Question', name: 'Does this work on all photos?', acceptedAnswer: { '@type': 'Answer', text: 'Yes, it works on most photos, with best results on images that have clear color areas and visible detail.' } },
            { '@type': 'Question', name: 'Where is the effect processed?', acceptedAnswer: { '@type': 'Answer', text: 'The visual effect is processed locally in the browser. When Download is selected, the generated JPEG is sent through the download-result service so the download page can be prepared.' } },
          ],
        })}
      </script>
      <script type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://simplifyconvert.com' },
            { '@type': 'ListItem', position: 2, name: 'All Tools', item: 'https://simplifyconvert.com/all-tools' },
            { '@type': 'ListItem', position: 3, name: 'Oil Paint Effect', item: 'https://simplifyconvert.com/all-tools/oil-paint-effect' },
          ],
        })}
      </script>
    </>
  );
}
