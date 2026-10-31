'use client';
import { FAQAnswer, FAQCard, FAQDisclosure, FAQHeading, FAQList, FAQPanel, FAQQuestion, FAQStaticQuestion } from '@/app/components/FAQDesign';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Download, ChevronRight, Loader, Sparkles } from 'lucide-react';
import { HomeHeader } from '../../components/HomeHeader';
import { Footer } from '../../components/Footer';
import { useRouter } from 'next/navigation';
import { uploadBrowserDownloadResult } from '@/app/lib/download-result-client';

export default function SketchEffectPage() {
    const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [intensity, setIntensity] = useState(50);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<Blob | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const operationId = useRef(0);
  const downloadBusy = useRef(false);
  const [error, setError] = useState('');
  const [resultPreview, setResultPreview] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      operationId.current += 1;
    };
  }, []);

  const invalidateResult = () => {
    operationId.current += 1;
    setResult(null);
    setResultPreview(null);
    setError('');
    setProcessing(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];

    invalidateResult();
    setFile(null);
    setPreview(null);

    if (!selectedFile) return;

    if (!selectedFile.type.startsWith('image/')) {
      setError('Please select a supported image file.');
      return;
    }

    const currentId = operationId.current;
    const reader = new FileReader();

    reader.onload = () => {
      if (currentId !== operationId.current) return;

      if (typeof reader.result !== 'string') {
        setError('Unable to read the selected image.');
        return;
      }

      setFile(selectedFile);
      setPreview(reader.result);
    };

    reader.onerror = () => {
      if (currentId === operationId.current) {
        setError('Unable to read the selected image.');
      }
    };

    reader.readAsDataURL(selectedFile);
  };

  const applySketchEffect = async () => {
    if (!file || !preview || processing) return;

    const currentId = ++operationId.current;
    setProcessing(true);
    setResult(null);
    setResultPreview(null);
    setError('');

    try {
      const img = new Image();

      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('Unable to load the image.'));
        img.src = preview;
      });

      if (currentId !== operationId.current) return;

      const canvas = canvasRef.current;
      if (!canvas) throw new Error('Image canvas is unavailable.');

      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;

      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Unable to initialize image processing.');

      ctx.drawImage(img, 0, 0);

      const width = canvas.width;
      const height = canvas.height;
      const source = ctx.getImageData(0, 0, width, height);
      const output = ctx.createImageData(width, height);

      const gray = new Float32Array(width * height);

      for (let i = 0; i < gray.length; i++) {
        const index = i * 4;
        gray[i] =
          source.data[index] * 0.299 +
          source.data[index + 1] * 0.587 +
          source.data[index + 2] * 0.114;
      }

      const strength = intensity / 100;

      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const position = y * width + x;
          const index = position * 4;

          const left = gray[y * width + Math.max(0, x - 1)];
          const right = gray[y * width + Math.min(width - 1, x + 1)];
          const top = gray[Math.max(0, y - 1) * width + x];
          const bottom = gray[Math.min(height - 1, y + 1) * width + x];

          const gradient = Math.hypot(right - left, bottom - top);
          const tone = 255 - Math.min(255, gradient * strength * 3);

          output.data[index] = tone;
          output.data[index + 1] = tone;
          output.data[index + 2] = tone;
          output.data[index + 3] = 255;
        }
      }

      ctx.putImageData(output, 0, 0);

      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          value => {
            if (value) resolve(value);
            else reject(new Error('Unable to create the sketch image.'));
          },
          'image/jpeg',
          0.95
        );
      });

      if (currentId !== operationId.current) return;

      setResult(blob);
      setResultPreview(canvas.toDataURL('image/jpeg', 0.85));
    } catch (caughtError) {
      if (currentId !== operationId.current) return;

      setError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Unable to apply the sketch effect.'
      );
    } finally {
      if (currentId === operationId.current) {
        setProcessing(false);
      }
    }
  };

  const handleDownload = async () => {
      if (!result || processing || downloadBusy.current) return;
      downloadBusy.current = true;


      setProcessing(true);

      try {
        const downloadResult =
          await uploadBrowserDownloadResult({
            blob: result,
            toolSlug: 'sketch-effect',
            originalName: 'sketch-effect.jpg',
            outputName: 'sketch-effect.jpg',
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
        downloadBusy.current = false;
        setProcessing(false);
      }
    };

  return (
    <>
      <HomeHeader />
      <main className="min-h-screen bg-slate-50 flex flex-col">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-gray-400 via-slate-400 to-gray-500 py-16 px-4 md:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-2 text-white/80 text-sm mb-6">
              <Link href="/" className="hover:text-white transition">Home</Link>
              <ChevronRight size={16} />
              <Link href="/all-tools" className="hover:text-white transition">All Tools</Link>
              <ChevronRight size={16} />
              <span>Sketch Effect</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">✏️ Sketch Effect</h1>
            <p className="text-lg text-white/90 max-w-2xl">
              Apply a pencil-sketch-style transformation to photos using the available effect controls.
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 py-12 px-4 md:px-8">
          <div className="max-w-4xl mx-auto">
            {/* Upload Section */}
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Create Sketch Effect</h2>

              <div className="mb-6">
                <label className="block text-gray-700 font-semibold mb-3">Upload Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-slate-400 transition"
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
                      min="10"
                      max="100"
                      value={intensity}
                      onChange={(e) => {
                        invalidateResult();
                        setIntensity(Number(e.target.value));
                      }}
                      className="w-full"
                    />
                    <p className="text-sm text-gray-600 mt-2">Adjust sketch line prominence</p>
                  </div>

                  <button
                    onClick={applySketchEffect}
                    disabled={processing}
                    className="w-full bg-slate-600 hover:bg-slate-700 text-white font-bold py-3 px-6 rounded-lg transition flex items-center justify-center gap-2"
                  >
                    {processing ? <Loader className="animate-spin" size={20} /> : <Sparkles size={20} />}
                    {processing ? 'Processing...' : 'Apply Sketch Effect'}
                  </button>
                </>
              )}

              {error && (
                <p role="alert" className="mt-4 text-sm text-red-700">
                  {error}
                </p>
              )}

              {resultPreview && (
                <div className="mt-6">
                  <h3 className="font-semibold text-gray-800 mb-3">
                    Sketch Preview
                  </h3>
                  <img
                    src={resultPreview}
                    alt="Processed pencil-style sketch preview"
                    className="w-full rounded-lg border border-gray-200"
                  />
                </div>
              )}

              {result && (
                <button
                  onClick={handleDownload}
                  disabled={processing}
                  className="w-full mt-4 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition flex items-center justify-center gap-2"
                >
                  <Download size={20} />
                  Download Sketch Image
                </button>
              )}
            </div>

            {/* How To Section */}
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">How to Create Sketch Effects</h2>
              <ol className="space-y-4 text-gray-700">
                <li><strong>1. Upload Photo:</strong> Select a JPG, PNG, or WebP image.</li>
                <li><strong>2. Adjust Intensity:</strong> Control line prominence and detail.</li>
                <li><strong>3. Apply Effect:</strong> Click "Apply Sketch Effect" to process.</li>
                <li><strong>4. Download:</strong> Save your pencil sketch image.</li>
              </ol>
            </div>

            {/* Benefits Section */}
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Sketch Effect Benefits</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-bold text-lg text-slate-600 mb-2">Artistic Look</h3>
                  <p className="text-gray-700">Convert photos into beautiful hand-drawn sketches.</p>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-600 mb-2">Portfolio Ready</h3>
                  <p className="text-gray-700">Great for artists and creative portfolios.</p>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-600 mb-2">Social Media</h3>
                  <p className="text-gray-700">Create engaging sketch-style artwork.</p>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-600 mb-2">100% Free</h3>
                  <p className="text-gray-700">No cost, no registration needed.</p>
                </div>
              </div>
            </div>

            {/* FAQ Section */}
            <FAQPanel>
              <FAQHeading>Frequently Asked Questions</FAQHeading>
              <FAQList>
                <FAQDisclosure>
                  <FAQQuestion>What's the best intensity for sketches?</FAQQuestion>
                  <FAQAnswer>Start at 50. Lower for subtle sketches, higher for bold outlines.</FAQAnswer>
                </FAQDisclosure>
                <FAQDisclosure>
                  <FAQQuestion>Does this work on all photos?</FAQQuestion>
                  <FAQAnswer>Yes! Works best on photos with clear subjects and good contrast.</FAQAnswer>
                </FAQDisclosure>
                <FAQDisclosure>
                  <FAQQuestion>Can I use sketches commercially?</FAQQuestion>
                  <FAQAnswer>Commercial use depends on the rights and permissions associated with your original image.</FAQAnswer>
                </FAQDisclosure>
                <FAQDisclosure>
                  <FAQQuestion>Is quality preserved?</FAQQuestion>
                  <FAQAnswer>The result is exported as JPEG at 95% quality. Some detail may change during the artistic transformation and JPEG encoding.</FAQAnswer>
                </FAQDisclosure>
                <FAQDisclosure>
                  <FAQQuestion>Is my data private?</FAQQuestion>
                  <FAQAnswer>The sketch effect is processed in your browser. Preparing a download uses the site's download service.</FAQAnswer>
                </FAQDisclosure>
                <FAQDisclosure>
                  <FAQQuestion>Can I edit further?</FAQQuestion>
                  <FAQAnswer>Yes, download and use any image editor for additional edits.</FAQAnswer>
                </FAQDisclosure>
              </FAQList>
            </FAQPanel>

            {/* Related Tools */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Related Effect Tools</h2>
              <div className="grid md:grid-cols-3 gap-4">
                <Link href="/all-tools/cartoon-effect" className="p-4 border-2 border-slate-200 rounded-lg hover:bg-slate-50 transition">
                  <h3 className="font-bold text-gray-800">Cartoon Effect</h3>
                  <p className="text-sm text-gray-600">Comic style effects</p>
                </Link>
                <Link href="/all-tools/glow-effect" className="p-4 border-2 border-slate-200 rounded-lg hover:bg-slate-50 transition">
                  <h3 className="font-bold text-gray-800">Glow Effect</h3>
                  <p className="text-sm text-gray-600">Luminous glow</p>
                </Link>
                <Link href="/all-tools/black-white" className="p-4 border-2 border-slate-200 rounded-lg hover:bg-slate-50 transition">
                  <h3 className="font-bold text-gray-800">Black & White</h3>
                  <p className="text-sm text-gray-600">Grayscale conversion</p>
                </Link>
              </div>
            </div>
          </div>
        </div>

        <Footer />

        <section className="bg-white border-t border-gray-200 px-4 md:px-8 py-14">
          <div className="max-w-6xl mx-auto space-y-8">

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                How the Sketch Effect works
              </h2>
              <p className="text-gray-600 leading-7">
The sketch effect processes image pixels to reduce normal
                photographic color and emphasize outlines and tonal structure.
                The resulting image is a stylized sketch-like rendering rather
                than a hand-drawn reconstruction.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="border border-gray-200 rounded-xl p-6">
                <h3 className="font-semibold text-gray-900 mb-2">
                  Browser-based processing
                </h3>
                <p className="text-sm text-gray-600 leading-6">
                  The visual effect is generated with browser image and
                  Canvas processing. The source image is rendered, pixel
                  values are adjusted, and the result is prepared for
                  download through the existing image workflow.
                </p>
              </div>

              <div className="border border-gray-200 rounded-xl p-6">
                <h3 className="font-semibold text-gray-900 mb-2">
                  What the effect changes
                </h3>
                <p className="text-sm text-gray-600 leading-6">
                  The effect derives its lines and shading from existing image pixels, so results depend on source contrast and visible edges.
                </p>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Tips for better results
              </h2>
              <p className="text-gray-600 leading-7">
                Use a clear source image and compare the processed preview
                with the original. Strong effect settings can intentionally
                remove subtle detail or exaggerate edges and tonal changes.
              </p>
            </div>

            <FAQPanel>
              <FAQHeading>
                Additional Sketch Effect Questions
              </FAQHeading>

              <FAQList>
                <FAQCard>
                  <FAQStaticQuestion>
                    Does this effect increase image resolution?
                  </FAQStaticQuestion>
                  <FAQAnswer>
                    No. It changes existing pixel values and does not recreate
                    missing detail or increase the source resolution.
                  </FAQAnswer>
                </FAQCard>

                <FAQCard>
                  <FAQStaticQuestion>
                    Can I preview the effect first?
                  </FAQStaticQuestion>
                  <FAQAnswer>
                    Yes. Review the available preview before downloading the
                    processed result.
                  </FAQAnswer>
                </FAQCard>
              </FAQList>
            </FAQPanel>

          </div>
        </section>

</main>

      <canvas ref={canvasRef} style={{ display: 'none' }} />

      <script type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'WebApplication',
          name: 'Sketch Effect',
          description: 'Free online sketch effect and pencil drawing converter',
          url: 'https://simplifyconvert.com/all-tools/sketch-effect',
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
