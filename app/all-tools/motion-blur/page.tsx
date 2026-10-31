'use client';
import { FAQAnswer, FAQCard, FAQDisclosure, FAQHeading, FAQList, FAQPanel, FAQQuestion, FAQStaticQuestion } from '@/app/components/FAQDesign';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Download, ChevronRight, Loader, Zap } from 'lucide-react';
import { HomeHeader } from '../../components/HomeHeader';
import { Footer } from '../../components/Footer';
import { useRouter } from 'next/navigation';
import { uploadBrowserDownloadResult } from '@/app/lib/download-result-client';

export default function MotionBlurPage() {
    const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [direction, setDirection] = useState<'horizontal' | 'vertical' | 'diagonal'>('horizontal');
  const [amount, setAmount] = useState(5);
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

  const handleDirectionChange = (
    next: 'horizontal' | 'vertical' | 'diagonal'
  ) => {
    if (processingRef.current) return;
    setDirection(next);
    setResult(null);
    setError(null);
  };

  const handleAmountChange = (value: number) => {
    if (processingRef.current) return;
    setAmount(Math.max(1, Math.min(20, value)));
    setResult(null);
    setError(null);
  };

  const applyMotionBlur = async () => {
    if (!file || !preview || processingRef.current) return;

    const generation = uploadGeneration.current;
    const selectedDirection = direction;
    const selectedAmount = amount;

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

      const width = img.naturalWidth;
      const height = img.naturalHeight;

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas processing is unavailable.');

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, width, height);
      const source = new Uint8ClampedArray(imageData.data);
      const output = imageData.data;

      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          let red = 0;
          let green = 0;
          let blue = 0;
          let samples = 0;

          for (let offset = 0; offset < selectedAmount; offset++) {
            const sampleX = x + (
              selectedDirection === 'horizontal' ||
              selectedDirection === 'diagonal' ? offset : 0
            );
            const sampleY = y + (
              selectedDirection === 'vertical' ||
              selectedDirection === 'diagonal' ? offset : 0
            );

            if (sampleX >= width || sampleY >= height) continue;

            const index = (sampleY * width + sampleX) * 4;
            red += source[index];
            green += source[index + 1];
            blue += source[index + 2];
            samples++;
          }

          const index = (y * width + x) * 4;
          output[index] = Math.round(red / samples);
          output[index + 1] = Math.round(green / samples);
          output[index + 2] = Math.round(blue / samples);
          output[index + 3] = 255;
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
            : 'Unable to apply motion blur.'
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
            toolSlug: 'motion-blur',
            originalName: `motion-blur-${Date.now()}.jpg`,
            outputName: `motion-blur-${Date.now()}.jpg`,
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
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 py-16 px-4 md:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-2 text-white/80 text-sm mb-6">
              <Link href="/" className="hover:text-white transition">Home</Link>
              <ChevronRight size={16} />
              <Link href="/all-tools" className="hover:text-white transition">All Tools</Link>
              <ChevronRight size={16} />
              <span>Motion Blur</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">💨 Motion Blur</h1>
            <p className="text-lg text-white/90 max-w-2xl">
              Apply dynamic motion blur effects. Create a directional motion-blur effect with adjustable controls.
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 py-12 px-4 md:px-8">
          <div className="max-w-4xl mx-auto">
            {/* Upload Section */}
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Apply Motion Blur</h2>

              <div className="mb-6">
                <label className="block text-gray-700 font-semibold mb-3">Upload Image</label>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  disabled={processing}
                  onChange={handleFileSelect}
                  className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 transition"
                />
              </div>

              {preview && (
                <>
                  <div className="mb-6">
                    <label className="block text-gray-700 font-semibold mb-3">Blur Direction</label>
                    <div className="flex gap-4">
                      {['horizontal', 'vertical', 'diagonal'].map((dir) => (
                        <label key={dir} className="flex items-center gap-2">
                          <input
                            type="radio"
                            disabled={processing}
                            value={dir}
                            checked={direction === dir}
                            onChange={(e) => handleDirectionChange(e.target.value as 'horizontal' | 'vertical' | 'diagonal')}
                            className="cursor-pointer"
                          />
                          <span className="text-gray-700 capitalize">{dir}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="mb-6">
                    <label className="block text-gray-700 font-semibold mb-3">
                      Blur Amount: {amount}
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="20"
                      disabled={processing}
                      value={amount}
                      onChange={(e) => handleAmountChange(Number(e.target.value))}
                      className="w-full"
                    />
                    <p className="text-sm text-gray-600 mt-2">1 = no visible blur, 20 = stronger directional blur</p>
                  </div>

                  <button
                    onClick={applyMotionBlur}
                    disabled={processing}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition flex items-center justify-center gap-2"
                  >
                    {processing ? <Loader className="animate-spin" size={20} /> : <Zap size={20} />}
                    {processing ? 'Processing...' : 'Apply Motion Blur'}
                  </button>
                </>
              )}

              {result && resultUrl && (
                <div className="mt-6 space-y-4">
                  <h3 className="font-semibold text-gray-800">
                    Motion Blur Result Preview
                  </h3>
                  <img
                    src={resultUrl}
                    alt="Processed image with directional motion blur"
                    className="mx-auto max-w-full max-h-80 object-contain rounded-lg border border-gray-200"
                  />
                  <button
                    onClick={handleDownload}
                    disabled={processing}
                    className="w-full bg-green-500 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg transition flex items-center justify-center gap-2"
                  >
                    <Download size={20} />
                    Download Motion Blurred Image
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
              <h2 className="text-2xl font-bold text-gray-800 mb-6">How to Apply Motion Blur</h2>
              <ol className="space-y-4 text-gray-700">
                <li><strong>1. Upload Photo:</strong> Select a JPG, PNG, or WebP image.</li>
                <li><strong>2. Choose Direction:</strong> Select horizontal, vertical, or diagonal blur.</li>
                <li><strong>3. Adjust Amount:</strong> Control blur intensity (1-20).</li>
                <li><strong>4. Preview:</strong> Review the processed image.</li>
                <li><strong>5. Download:</strong> Save your motion-blurred JPEG.</li>
              </ol>
            </div>

            {/* Benefits Section */}
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Motion Blur Benefits</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-bold text-lg text-blue-600 mb-2">Dynamic Effect</h3>
                  <p className="text-gray-700">Create a directional motion effect.</p>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-blue-600 mb-2">Directional Control</h3>
                  <p className="text-gray-700">Choose blur direction precisely.</p>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-blue-600 mb-2">Customizable</h3>
                  <p className="text-gray-700">Adjust blur amount for desired effect.</p>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-blue-600 mb-2">100% Free</h3>
                  <p className="text-gray-700">No registration or payment needed.</p>
                </div>
              </div>
            </div>

            {/* FAQ Section */}
            <FAQPanel>
              <FAQHeading>Frequently Asked Questions</FAQHeading>
              <FAQList>
                <FAQDisclosure>
                  <FAQQuestion>Which direction should I use?</FAQQuestion>
                  <FAQAnswer>Choose based on desired motion direction. Horizontal for left-right, vertical for up-down.</FAQAnswer>
                </FAQDisclosure>
                <FAQDisclosure>
                  <FAQQuestion>What amount should I use?</FAQQuestion>
                  <FAQAnswer>Start at 5 for subtle effect. Higher for stronger motion blur.</FAQAnswer>
                </FAQDisclosure>
                <FAQDisclosure>
                  <FAQQuestion>Works on all images?</FAQQuestion>
                  <FAQAnswer>The tool supports JPG, PNG, and WebP images. Results depend on the image and selected blur settings.</FAQAnswer>
                </FAQDisclosure>
                <FAQDisclosure>
                  <FAQQuestion>Can I use commercially?</FAQQuestion>
                  <FAQAnswer>Commercial use depends on your rights to the original image. Applying blur does not change its copyright or license.</FAQAnswer>
                </FAQDisclosure>
                <FAQDisclosure>
                  <FAQQuestion>Is data private?</FAQQuestion>
                  <FAQAnswer>The blur effect is processed in your browser. When you choose Download, the processed JPEG is sent through the download-result service to prepare the download page.</FAQAnswer>
                </FAQDisclosure>
                <FAQDisclosure>
                  <FAQQuestion>What output format?</FAQQuestion>
                  <FAQAnswer>The processed image is exported as JPEG. JPEG compression may alter fine detail, and transparent areas use a white background.</FAQAnswer>
                </FAQDisclosure>
              </FAQList>
            </FAQPanel>

            {/* Related Tools */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Related Effect Tools</h2>
              <div className="grid md:grid-cols-3 gap-4">
                <Link href="/all-tools/blur-image" className="p-4 border-2 border-blue-200 rounded-lg hover:bg-blue-50 transition">
                  <h3 className="font-bold text-gray-800">Blur Image</h3>
                  <p className="text-sm text-gray-600">Gaussian blur effects</p>
                </Link>
                <Link href="/all-tools/tilt-shift" className="p-4 border-2 border-blue-200 rounded-lg hover:bg-blue-50 transition">
                  <h3 className="font-bold text-gray-800">Tilt Shift</h3>
                  <p className="text-sm text-gray-600">Selective focus blur</p>
                </Link>
                <Link href="/all-tools/glow-effect" className="p-4 border-2 border-blue-200 rounded-lg hover:bg-blue-50 transition">
                  <h3 className="font-bold text-gray-800">Glow Effect</h3>
                  <p className="text-sm text-gray-600">Luminous effects</p>
                </Link>
              </div>
            </div>
          </div>
        </div>

        <section className="bg-white border-t border-gray-200 px-4 md:px-8 py-14">
          <div className="max-w-6xl mx-auto space-y-8">

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                How the Motion Blur effect works
              </h2>
              <p className="text-gray-600 leading-7">
Motion blur blends pixel information along a selected
                direction to create the appearance of movement. The browser
                processes the source image and updates the result according to
                the available blur controls.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="border border-gray-200 rounded-xl p-6">
                <h3 className="font-semibold text-gray-900 mb-2">
                  Browser-based processing
                </h3>
                <p className="text-sm text-gray-600 leading-6">
                  The effect is generated with browser image and Canvas
                  processing. No separate server conversion step is used for
                  the visual effect itself.
                </p>
              </div>

              <div className="border border-gray-200 rounded-xl p-6">
                <h3 className="font-semibold text-gray-900 mb-2">
                  What the effect changes
                </h3>
                <p className="text-sm text-gray-600 leading-6">
                  Directional blur deliberately reduces fine detail along the blur path; it simulates motion rather than recovering or sharpening the source.
                </p>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Tips for better results
              </h2>
              <p className="text-gray-600 leading-7">
                Start with a clear source image and use moderate settings
                before increasing the effect. Compare the preview with the
                original because stronger processing can intentionally reduce
                or exaggerate visible detail.
              </p>
            </div>

            <FAQPanel>
              <FAQHeading>
                the Motion Blur effect works FAQ
              </FAQHeading>

              <FAQList>
                <FAQCard>
                  <FAQStaticQuestion>
                    Does this effect increase image resolution?
                  </FAQStaticQuestion>
                  <FAQAnswer>
                    No. The tool changes or overlays existing image pixels and
                    does not reconstruct missing source detail.
                  </FAQAnswer>
                </FAQCard>

                <FAQCard>
                  <FAQStaticQuestion>
                    Can I preview the effect before downloading?
                  </FAQStaticQuestion>
                  <FAQAnswer>
                    Yes. Apply the effect, then inspect the processed result
                    preview before downloading the JPEG.
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
          name: 'Motion Blur',
          description: 'Free online motion blur and dynamic motion effect tool',
          url: 'https://simplifyconvert.com/all-tools/motion-blur',
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
