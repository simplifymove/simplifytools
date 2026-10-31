'use client';
import { FAQAnswer, FAQCard, FAQDisclosure, FAQHeading, FAQList, FAQPanel, FAQQuestion, FAQStaticQuestion } from '@/app/components/FAQDesign';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Download, ChevronRight, Loader, Sparkles } from 'lucide-react';
import { HomeHeader } from '../../components/HomeHeader';
import { Footer } from '../../components/Footer';
import { useRouter } from 'next/navigation';
import { uploadBrowserDownloadResult } from '@/app/lib/download-result-client';

export default function SepiaFilterPage() {
    const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [intensity, setIntensity] = useState(100);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<Blob | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const operationId = useRef(0);
  const downloadBusy = useRef(false);
  const [error, setError] = useState('');

  useEffect(() => {
    return () => {
      operationId.current += 1;
    };
  }, []);

  const invalidateResult = () => {
    operationId.current += 1;
    setResult(null);
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

  const applySepiaFilter = async () => {
    if (!file || !preview || processing) return;

    const currentId = ++operationId.current;
    setProcessing(true);
    setResult(null);
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

      const imageData = ctx.getImageData(
        0, 0, canvas.width, canvas.height
      );

      const data = imageData.data;
      const strength = intensity / 100;

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        const sepiaR = Math.min(
          255, r * 0.393 + g * 0.769 + b * 0.189
        );
        const sepiaG = Math.min(
          255, r * 0.349 + g * 0.686 + b * 0.168
        );
        const sepiaB = Math.min(
          255, r * 0.272 + g * 0.534 + b * 0.131
        );

        data[i] = Math.round(r + (sepiaR - r) * strength);
        data[i + 1] = Math.round(g + (sepiaG - g) * strength);
        data[i + 2] = Math.round(b + (sepiaB - b) * strength);
      }

      ctx.putImageData(imageData, 0, 0);

      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          result => {
            if (result) resolve(result);
            else reject(new Error('Unable to create the processed image.'));
          },
          'image/jpeg',
          0.95
        );
      });

      if (currentId !== operationId.current) return;

      setResult(blob);
    } catch (caughtError) {
      if (currentId !== operationId.current) return;

      setError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Unable to apply the sepia filter.'
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
            toolSlug: 'sepia-filter',
            originalName: 'sepia-filtered-image.jpg',
            outputName: 'sepia-filtered-image.jpg',
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
        <div className="bg-gradient-to-r from-amber-600 via-orange-500 to-amber-600 py-16 px-4 md:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-2 text-white/80 text-sm mb-6">
              <Link href="/" className="hover:text-white transition">Home</Link>
              <ChevronRight size={16} />
              <Link href="/all-tools" className="hover:text-white transition">All Tools</Link>
              <ChevronRight size={16} />
              <span>Sepia Filter</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">🎂 Sepia Filter</h1>
            <p className="text-lg text-white/90 max-w-2xl mb-4">
              Convert your photos to warm sepia-style tones. Transform modern images into warm, vintage memories with authentic sepia color grading.
            </p>
            <p className="text-base text-white/80 max-w-2xl">
              Create a warm, vintage-style color treatment.
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 py-12 px-4 md:px-8">
          <div className="max-w-4xl mx-auto">
            {/* Upload Section */}
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Apply Sepia Filter</h2>

              <div className="mb-6">
                <label className="block text-gray-700 font-semibold mb-3">Upload Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-amber-600 transition"
                />
              </div>

              {preview && (
                <>
                  <div className="mb-6">
                    <label className="block text-gray-700 font-semibold mb-3">Sepia Intensity: {intensity}%</label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={intensity}
                      onChange={(e) => {
                        invalidateResult();
                        setIntensity(Number(e.target.value));
                      }}
                      className="w-full"
                    />
                  </div>

                  <button
                    onClick={applySepiaFilter}
                    disabled={processing}
                    className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 px-6 rounded-lg transition flex items-center justify-center gap-2"
                  >
                    {processing ? <Loader className="animate-spin" size={20} /> : <Sparkles size={20} />}
                    {processing ? 'Processing...' : 'Apply Sepia Effect'}
                  </button>
                </>
              )}

              {error && (
                <p role="alert" className="mt-4 text-sm text-red-700">
                  {error}
                </p>
              )}

              {result && (
                <button
                  onClick={handleDownload}
                  disabled={processing}
                  className="w-full mt-4 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition flex items-center justify-center gap-2"
                >
                  <Download size={20} />
                  Download Sepia Image
                </button>
              )}
            </div>

            {/* How To Section */}
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">How to Use Sepia Filter</h2>
              <ol className="space-y-4 text-gray-700">
                <li><strong>1. Choose Your Photo:</strong> Click upload to select a JPG, PNG, or WebP image from your device.</li>
                <li><strong>2. Adjust Intensity:</strong> Use the slider to control how strong the sepia effect appears (0-100%).</li>
                <li><strong>3. Preview Effect:</strong> See the sepia tone applied before downloading.</li>
                <li><strong>4. Apply Filter:</strong> Click "Apply Sepia Effect" to process your image.</li>
                <li><strong>5. Save Result:</strong> Download your sepia-toned photo to your device.</li>
              </ol>
            </div>

            {/* Benefits Section */}
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Why Choose Sepia Filters</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-bold text-lg text-amber-700 mb-2">Authentic Vintage Look</h3>
                  <p className="text-gray-700">Create genuine sepia tones that look like classic old photographs.</p>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-amber-700 mb-2">Adjustable Warmth</h3>
                  <p className="text-gray-700">Control the intensity from subtle to bold sepia effects.</p>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-amber-700 mb-2">No Complex Setup</h3>
                  <p className="text-gray-700">One-click vintage conversion with no technical knowledge required.</p>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-amber-700 mb-2">Completely Free</h3>
                  <p className="text-gray-700">No watermarks, subscriptions, or hidden costs ever.</p>
                </div>
              </div>
            </div>

            {/* FAQ Section */}
            <FAQPanel>
              <FAQHeading>Frequently Asked Questions</FAQHeading>
              <FAQList>
                <FAQDisclosure>
                  <FAQQuestion>What is sepia tone?</FAQQuestion>
                  <FAQAnswer>Sepia is a warm, brownish color tone originally used in old photographs from the 19th and early 20th centuries.</FAQAnswer>
                </FAQDisclosure>
                <FAQDisclosure>
                  <FAQQuestion>Why were old photos sepia-toned?</FAQQuestion>
                  <FAQAnswer>Early color photography used sepia tones naturally due to the photochemical processes used. It became the iconic vintage look.</FAQAnswer>
                </FAQDisclosure>
                <FAQDisclosure>
                  <FAQQuestion>What intensity should I use?</FAQQuestion>
                  <FAQAnswer>Start with 70-90% for a natural vintage look. Use 100% for bold sepia, or less than 50% for subtle toning.</FAQAnswer>
                </FAQDisclosure>
                <FAQDisclosure>
                  <FAQQuestion>Works on colored and B&W photos?</FAQQuestion>
                  <FAQAnswer>Yes! Sepia works beautifully on both color and black & white photos.</FAQAnswer>
                </FAQDisclosure>
                <FAQDisclosure>
                  <FAQQuestion>Is image quality affected?</FAQQuestion>
                  <FAQAnswer>Applying the filter changes the image pixels and creates a processed result. Review the output if preserving source detail is important.</FAQAnswer>
                </FAQDisclosure>
                <FAQDisclosure>
                  <FAQQuestion>Can I undo the sepia effect?</FAQQuestion>
                  <FAQAnswer>The original image is never modified. Simply reload to get the original, or adjust intensity before applying.</FAQAnswer>
                </FAQDisclosure>
              </FAQList>
            </FAQPanel>

            {/* Related Tools */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">More Vintage & Filter Tools</h2>
              <div className="grid md:grid-cols-3 gap-4">
                <Link href="/all-tools/vintage-filter" className="p-4 border-2 border-amber-200 rounded-lg hover:bg-amber-50 transition">
                  <h3 className="font-bold text-gray-800">Vintage Filter</h3>
                  <p className="text-sm text-gray-600">Full retro photo effects</p>
                </Link>
                <Link href="/all-tools/vignette-effect" className="p-4 border-2 border-amber-200 rounded-lg hover:bg-amber-50 transition">
                  <h3 className="font-bold text-gray-800">Vignette Effect</h3>
                  <p className="text-sm text-gray-600">Add edge darkening</p>
                </Link>
                <Link href="/all-tools/color-grader" className="p-4 border-2 border-amber-200 rounded-lg hover:bg-amber-50 transition">
                  <h3 className="font-bold text-gray-800">Color Grader</h3>
                  <p className="text-sm text-gray-600">Color controls</p>
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
                How the Sepia Filter works
              </h2>
              <p className="text-gray-600 leading-7">
The sepia filter recalculates image color channels to produce
                warm brown and muted tonal values associated with a sepia-style
                photographic effect.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="border border-gray-200 rounded-xl p-6">
                <h3 className="font-semibold text-gray-900 mb-2">
                  Browser-based processing
                </h3>
                <p className="text-sm text-gray-600 leading-6">
                  The visual adjustment is produced with browser image and
                  Canvas processing. The preview lets you compare the result
                  before using the download action.
                </p>
              </div>

              <div className="border border-gray-200 rounded-xl p-6">
                <h3 className="font-semibold text-gray-900 mb-2">
                  What the adjustment changes
                </h3>
                <p className="text-sm text-gray-600 leading-6">
                  The effect changes existing pixel colors; it does not recreate historical film characteristics or add missing source detail.
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
                                 Additional Sepia Filter Questions
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

      <canvas ref={canvasRef} style={{ display: 'none' }} />

      <script type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'WebApplication',
          name: 'Sepia Filter',
          description: 'Free tool to apply classic sepia tone effects to photos',
          url: 'https://simplifyconvert.com/all-tools/sepia-filter',
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
